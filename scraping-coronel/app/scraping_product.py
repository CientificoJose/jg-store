from app.services.ai_estimator import obtener_dimensiones_producto
from app.core.logger import registrar_error
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
import time
import re
import os
import requests
from urllib.parse import urlparse
import openpyxl
import sqlite3
from contextlib import closing
from config import DOWNLOAD_IMAGES, set_download_images
from colorama import Fore, Style
import urllib3

# Desactivar advertencias de solicitud insegura para solicitudes sin verificación SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from concurrent.futures import ThreadPoolExecutor
_img_executor = ThreadPoolExecutor(max_workers=5)

def _descargar_imagen_async(image_url: str, img_path: str):
    try:
        if not image_url or image_url.startswith("data:"):
            return
        resp = requests.get(image_url, stream=True, verify=False, timeout=10)
        if resp.status_code == 200:
            with open(img_path, 'wb') as f:
                for chunk in resp.iter_content(1024):
                    f.write(chunk)
    except Exception:
        pass



def formatear_codigo(codigo):
    if not codigo:
        return codigo
    # Separar la variante si ya tiene un guion (ej: COR278305-LLAMA)
    partes = codigo.split('-', 1)
    base = partes[0]
    variante = f"-{partes[1]}" if len(partes) > 1 else ""
    
    # Insertar el guion entre las letras y el número de la base (ej: COR278305 -> COR-278305)
    match = re.match(r"^([a-zA-Z]+)(\d+.*)$", base)
    if match:
        prefijo, numero = match.groups()
        return f"{prefijo}-{numero}{variante}"
    return codigo

from app.core.db import (
    inicializar_bd as core_inicializar_bd,
    obtener_codigo_barra as core_obtener_codigo_barra,
    consolidar_productos as core_consolidar_productos
)

def obtener_codigo_barra(code, db_path):
    """Consulta rápida a SQLite delegada al módulo core"""
    return core_obtener_codigo_barra(code, db_path)

def inicializar_bd(excel_path='productos_coronel'):
    """Inicialización delegada al módulo core"""
    return core_inicializar_bd(excel_path)

def consolidar_todo_en_base_de_datos(todos_los_productos):
    """Consolidación delegada al módulo core"""
    if not hasattr(scraping_product, 'db_path') or not scraping_product.db_path:
        scraping_product.db_path = inicializar_bd()
        
    if not scraping_product.db_path:
        print("Error: No se pudo inicializar la base de datos")
        return False
        
    return core_consolidar_productos(todos_los_productos, scraping_product.db_path)
    
def scraping_product(driver, max_retries=3, wait_time=10):
    """
    Extrae información de productos directamente desde el listado sin navegar al detalle,
    haciendo el scraping muchísimo más rápido y evitando fallos por cambios de DOM o navegación.
    """
    # 1. Configurar rutas
    base_dir = os.path.dirname(os.path.dirname(__file__))
    img_dir = os.path.join(base_dir, 'img-scraping')
    os.makedirs(img_dir, exist_ok=True)

    # 2. Buscar Excel más reciente e inicializar la base de datos local
    if not hasattr(scraping_product, 'db_path'):
        scraping_product.db_path = inicializar_bd()

    # Esperar a que carguen los productos en el listado
    WebDriverWait(driver, wait_time).until(
        EC.presence_of_element_located((By.CLASS_NAME, "itemsBlock"))
    )
    
    # Extraer categorías (una sola vez por página del listado)
    try:
        breadcrumb = driver.find_element(By.CSS_SELECTOR, ".breadcrumb")
        categorias = [span.text.strip() for span in breadcrumb.find_elements(
            By.CSS_SELECTOR, ".breadcrumb-item.breadcrumb2"
        ) if span.text.strip()]
        categoria_principal = categorias[0] if len(categorias) > 0 else "Sin Categoría"
        subcategoria = categorias[1] if len(categorias) > 1 else ""
    except Exception as e:
        print(f"Advertencia al extraer categorías del breadcrumb: {e}")
        categoria_principal = "Sin Categoría"
        subcategoria = ""
        
    products = []
    
    # 1. Scroll rápido para disparar la carga diferida (lazy load) de Angular
    try:
        altura_doc = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);")
        for ratio in [0.33, 0.66, 1.0]:
            driver.execute_script(f"window.scrollTo(0, {int(altura_doc * ratio)});")
            time.sleep(0.15)
        time.sleep(0.2)
        driver.execute_script("window.scrollTo(0, 0);")
    except Exception:
        pass

    # 2. Extracción ultra rápida en bloque mediante JavaScript nativo en el navegador
    EXTRACTION_JS = """
    return Array.from(document.querySelectorAll('.col-art .card-product')).map(card => {
        let code = '';
        const spanCodigo = card.querySelector('.span-codigo');
        if (spanCodigo) {
            code = spanCodigo.textContent.replace(/c[óo]digo:/i, '').trim();
        } else {
            const codEl = card.querySelector('.codigo');
            if (codEl) code = codEl.textContent.replace(/c[óo]digo:/i, '').trim();
        }

        let desc = '';
        const descEl = card.querySelector('.descripcion');
        if (descEl) desc = descEl.textContent.trim();

        let price = '0';
        const tachado = card.querySelector('span.tachado');
        if (tachado && tachado.textContent.trim()) {
            price = tachado.textContent.trim();
        } else {
            const sintachar = card.querySelector('span.sintachar');
            if (sintachar && sintachar.textContent.trim()) {
                price = sintachar.textContent.trim();
            }
        }

        let variant = '';
        const adicional = card.querySelector('.adicional span');
        if (adicional && adicional.textContent.trim()) {
            variant = adicional.textContent.trim();
        }

        let imgUrl = '';
        const imgEl = card.querySelector('.card-img-top');
        if (imgEl) {
            imgUrl = imgEl.getAttribute('src') || imgEl.getAttribute('data-src') || imgEl.getAttribute('data-original') || '';
        }

        return {
            codigo: code,
            descripcion: desc,
            precio: price,
            variante: variant,
            imagen_url: imgUrl
        };
    });
    """

    raw_products = driver.execute_script(EXTRACTION_JS) or []
    if not raw_products:
        # Reintento breve si Angular estaba aún montando los elementos
        time.sleep(0.8)
        raw_products = driver.execute_script(EXTRACTION_JS) or []

    total_products = len(raw_products)
    print(f"{Fore.CYAN}📦 Extraídos instantáneamente {total_products} productos en el listado.{Style.RESET_ALL}")

    for index, raw in enumerate(raw_products):
        raw_code = raw.get('codigo', '')
        if not raw_code:
            continue

        code = formatear_codigo(raw_code)
        variant = raw.get('variante', '').strip()
        if variant:
            v_clean = variant.upper().replace(' ', '').replace('/', '-').replace('\\', '-')
            if not code.endswith(f"-{v_clean}"):
                code = f"{code}-{v_clean}"

        description = raw.get('descripcion', '')
        price = raw.get('precio', '0')
        image_url = raw.get('imagen_url', '')

        # Descargar imagen en segundo plano (asíncrono) para no ralentizar el scraping
        img_name = f"{code}.jpg"
        img_path = os.path.join(img_dir, img_name)

        if DOWNLOAD_IMAGES and image_url:
            _img_executor.submit(_descargar_imagen_async, image_url, img_path)

        # Obtener código de barras del Excel/SQLite si existe
        codigo_barra = obtener_codigo_barra(code, scraping_product.db_path) if scraping_product.db_path else ""

        # Guardar datos estructurados
        product_data = {
            'codigo': code,
            'descripcion': description,
            'precio': price,
            'imagen_url': image_url,
            'imagen_local': f"img-scraping/{img_name}",
            'variante': variant,
            'codigo_de_barras': codigo_barra,
            "categoria": categoria_principal,
            "subcategoria": subcategoria
        }
        products.append(product_data)

        # Mostrar progreso resumido
        print(f"{Fore.GREEN}⚡ [{index + 1}/{total_products}]{Style.RESET_ALL} {Fore.CYAN}{code}{Style.RESET_ALL} | {description[:35]} | Price: {price}")

    # Categoría completa formateada
    categoria_grupal = categoria_principal
    if subcategoria:
        categoria_grupal += " > " + subcategoria

    return products, categoria_grupal, scraping_product.db_path
