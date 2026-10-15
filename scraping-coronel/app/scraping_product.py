from app.services.ai_estimator import obtener_dimensiones_producto
from app.core.logger import registrar_error
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
import time
import re
import os
import requests
import unicodedata
from urllib.parse import urlparse
import openpyxl
import sqlite3
from contextlib import closing
from config import DOWNLOAD_IMAGES, set_download_images
from colorama import Fore, Style
import json
import urllib3

# Desactivar advertencias de solicitud insegura para solicitudes sin verificación SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

from concurrent.futures import ThreadPoolExecutor
_img_executor = ThreadPoolExecutor(max_workers=5)

SUPABASE_STORAGE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "http://jg-store-bd.press-cloud.com")
SUPABASE_SERVICE_KEY = os.getenv(
    "SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A"
)

# Control para extracción en profundidad (entrar a app-articulo para breadcrumb y galería)
DEEP_SCRAPE_PRODUCTS = os.getenv("DEEP_SCRAPE_PRODUCTS", "true").lower() in ["true", "1", "t", "s"]

def _subir_a_supabase_storage(content: bytes, filename: str) -> str:
    """Sube bytes de imagen directamente a Supabase Storage (bucket products)"""
    try:
        clean_name = filename.replace("/", "_").replace("\\", "_")
        url = f"{SUPABASE_STORAGE_URL}/storage/v1/object/products/{clean_name}"
        headers = {
            "apikey": SUPABASE_SERVICE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true"
        }
        res = requests.post(url, headers=headers, data=content, timeout=15)
        if res.status_code in [200, 201]:
            return f"{SUPABASE_STORAGE_URL}/storage/v1/object/public/products/{clean_name}"
    except Exception as e:
        print(f"[Supabase Storage] Error subiendo {filename}: {e}")
    return ""

def _descargar_galeria_async(imagenes_urls: list, code: str, img_dir: str, db_path: str = None):
    """
    Descarga en segundo plano todas las imágenes de la galería del producto,
    las sube a Supabase Storage con nombres normalizados (${code}.jpg, ${code}_1.jpg, etc.)
    y actualiza SQLite con la lista de URLs públicas.
    """
    if not imagenes_urls:
        return
    try:
        supabase_urls = []
        for i, img_url in enumerate(imagenes_urls):
            if not img_url or img_url.startswith("data:"):
                continue
            clean_url = img_url.replace("\\", "/")
            suffix = "" if i == 0 else f"_{i}"
            img_filename = f"{code}{suffix}.jpg".replace("/", "_").replace("\\", "_")
            local_path = os.path.join(img_dir, img_filename)

            try:
                resp = requests.get(clean_url, stream=True, verify=False, timeout=10)
                if resp.status_code == 200:
                    content = resp.content
                    with open(local_path, 'wb') as f:
                        f.write(content)
                    public_url = _subir_a_supabase_storage(content, img_filename)
                    if public_url:
                        supabase_urls.append(public_url)
                    else:
                        supabase_urls.append(clean_url)
            except Exception as err:
                print(f"[Galeria Storage] Error descargando {clean_url}: {err}")

        if supabase_urls and db_path:
            try:
                import sqlite3
                with sqlite3.connect(db_path) as conn:
                    cur = conn.cursor()
                    cur.execute(
                        "UPDATE productos SET imagenes_galeria = ?, imagen_url = ? WHERE codigo = ?",
                        (json.dumps(supabase_urls, ensure_ascii=False), supabase_urls[0], code)
                    )
                    conn.commit()
            except Exception:
                pass
    except Exception as e:
        print(f"[Galeria Storage] Excepción en galería de {code}: {e}")

def _descargar_imagen_async(image_url: str, img_path: str, filename: str = None, db_path: str = None):
    try:
        if not image_url or image_url.startswith("data:"):
            return
        clean_url = image_url.replace("\\", "/")
        resp = requests.get(clean_url, stream=True, verify=False, timeout=10)
        if resp.status_code == 200:
            content = resp.content
            with open(img_path, 'wb') as f:
                f.write(content)

            # Subir a Supabase Storage
            if filename:
                public_url = _subir_a_supabase_storage(content, filename)
                if public_url and db_path:
                    try:
                        import sqlite3
                        with sqlite3.connect(db_path) as conn:
                            cur = conn.cursor()
                            code = filename.replace(".jpg", "")
                            cur.execute("UPDATE productos SET imagen_url = ? WHERE codigo = ?", (public_url, code))
                            conn.commit()
                    except Exception:
                        pass
    except Exception:
        pass

def formatear_codigo(codigo):
    if not codigo:
        return codigo
    partes = codigo.split('-', 1)
    base = partes[0]
    variante = f"-{partes[1]}" if len(partes) > 1 else ""
    
    match = re.match(r"^([a-zA-Z]+)(\d+.*)$", base)
    if match:
        prefijo, numero = match.groups()
        return f"{prefijo}-{numero}{variante}"
    return codigo

def limpiar_precio_float(precio_str):
    """Convierte cadenas monetarias como '$3.518,00' o '$ 1.200,50' a float puro (ej: 3518.0)."""
    if not precio_str:
        return 0.0
    try:
        clean = str(precio_str).replace('$', '').replace(' ', '').strip()
        if ',' in clean and '.' in clean:
            clean = clean.replace('.', '').replace(',', '.')
        elif ',' in clean:
            clean = clean.replace(',', '.')
        return float(clean)
    except Exception:
        return 0.0

def generar_slug(texto):
    """Genera slugs URL limpios y normalizados (ej: 'INDUMENTARIA' -> 'indumentaria')."""
    if not texto:
        return ""
    norm = unicodedata.normalize('NFKD', str(texto)).encode('ascii', 'ignore').decode('utf-8')
    return re.sub(r'[^a-z0-9]+', '-', norm.lower()).strip('-')

from app.core.db import (
    inicializar_bd as core_inicializar_bd,
    obtener_codigo_barra as core_obtener_codigo_barra,
    consolidar_productos as core_consolidar_productos
)

def obtener_codigo_barra(code, db_path):
    """Consulta rápida a SQLite delegada al módulo core."""
    return core_obtener_codigo_barra(code, db_path)

def inicializar_bd(excel_path='productos_coronel'):
    """Inicialización delegada al módulo core."""
    return core_inicializar_bd(excel_path)

def set_margenes(margen_minorista: float = 40.0, margen_mayorista: float = 18.0):
    """Configura los márgenes de ganancia activos para el proceso de extracción."""
    scraping_product.margen_minorista = float(margen_minorista)
    scraping_product.margen_mayorista = float(margen_mayorista)

def consolidar_todo_en_base_de_datos(todos_los_productos):
    """Consolidación delegada al módulo core con estructura completa de precios y jerarquía."""
    if not hasattr(scraping_product, 'db_path') or not scraping_product.db_path:
        scraping_product.db_path = inicializar_bd()
        
    if not scraping_product.db_path:
        print("Error: No se pudo inicializar la base de datos")
        return False
        
    return core_consolidar_productos(todos_los_productos, scraping_product.db_path)
    
def scraping_product(driver, max_retries=3, wait_time=10):
    """
    Extrae información de productos directamente desde el listado con:
    1. Captura de precio costo original del proveedor + márgenes B2C (detal) y B2B (mayor).
    2. Réplica multinivel completa de categorías (Departamento > Subcategoría > Línea).
    3. Detección robusta de fin de resultados sin fallos de timeout.
    """
    # 1. Configurar rutas
    base_dir = os.path.dirname(os.path.dirname(__file__))
    img_dir = os.path.join(base_dir, 'img-scraping')
    os.makedirs(img_dir, exist_ok=True)

    # 2. Inicializar la base de datos local
    if not hasattr(scraping_product, 'db_path') or not scraping_product.db_path:
        scraping_product.db_path = inicializar_bd()

    # 3. Esperar a que carguen los productos en el listado O mensaje de fin de resultados
    try:
        def contenido_listado_listo(d):
            if d.find_elements(By.CSS_SELECTOR, ".col-art .card-product") or d.find_elements(By.CLASS_NAME, "itemsBlock"):
                return True
            try:
                body_text = d.find_element(By.TAG_NAME, "body").text.lower()
                if "no encontramos resultados" in body_text or "sin resultados" in body_text:
                    return True
            except Exception:
                pass
            return False

        WebDriverWait(driver, wait_time).until(contenido_listado_listo)
    except TimeoutException:
        pass

    # 4. Verificar si la página no tiene productos (fin de categoría o búsqueda sin resultados)
    try:
        body_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        if "no encontramos resultados" in body_text:
            print(f"{Fore.YELLOW}ℹ️ 'No encontramos resultados para tu búsqueda' detectado. Fin del catálogo alcanzado.{Style.RESET_ALL}")
            return [], "Sin Categoría", scraping_product.db_path
    except Exception:
        pass
    
    # 5. Extraer jerarquía completa de categorías desde el Breadcrumb
    try:
        breadcrumb = driver.find_element(By.CSS_SELECTOR, ".breadcrumb")
        crumb_spans = breadcrumb.find_elements(By.CSS_SELECTOR, ".breadcrumb-item.breadcrumb2")
        categorias_lista = [span.text.strip().upper() for span in crumb_spans if span.text.strip()]
        
        categoria_principal = categorias_lista[0] if len(categorias_lista) > 0 else "SIN CATEGORÍA"
        subcategoria = categorias_lista[1] if len(categorias_lista) > 1 else ""
        sub_subcategoria = categorias_lista[2] if len(categorias_lista) > 2 else ""
    except Exception as e:
        categorias_lista = []
        categoria_principal = "SIN CATEGORÍA"
        subcategoria = ""
        sub_subcategoria = ""

    # 6. Extraer líneas del menú lateral si están visibles (ej: ACCESORIOS, BOMBACHAS, etc.)
    lineas_sidebar = []
    try:
        side_items = driver.find_elements(By.CSS_SELECTOR, ".lineas button, .lineas a, .list-group-item, .sidebar-rubro button")
        lineas_sidebar = [el.text.strip().upper() for el in side_items if el.text.strip()]
    except Exception:
        pass
        
    products = []
    
    # Scroll rápido para lazy load de Angular
    try:
        altura_doc = driver.execute_script("return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);")
        for ratio in [0.33, 0.66, 1.0]:
            driver.execute_script(f"window.scrollTo(0, {int(altura_doc * ratio)});")
            time.sleep(0.15)
        time.sleep(0.2)
        driver.execute_script("window.scrollTo(0, 0);")
    except Exception:
        pass

    # Extracción en bloque mediante JavaScript nativo en el navegador
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
        time.sleep(0.8)
        raw_products = driver.execute_script(EXTRACTION_JS) or []

    total_products = len(raw_products)
    if total_products == 0:
        print(f"{Fore.YELLOW}ℹ️ 0 productos detectados en la página. Fin de la categoría.{Style.RESET_ALL}")
        return [], categoria_principal, scraping_product.db_path

    print(f"{Fore.CYAN}📦 Extraídos instantáneamente {total_products} productos en el listado.{Style.RESET_ALL}")

    # Márgenes activos (por defecto 40% detal y 18% mayor)
    margen_detal = getattr(scraping_product, 'margen_minorista', 40.0)
    margen_mayor = getattr(scraping_product, 'margen_mayorista', 18.0)

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
        precio_costo = limpiar_precio_float(price)
        image_url = raw.get('imagen_url', '')

        # Cálculos de precios con márgenes dinámicos
        precio_minorista = round(precio_costo * (1.0 + margen_detal / 100.0), 2)
        precio_mayorista = round(precio_costo * (1.0 + margen_mayor / 100.0), 2)

        # Valores por defecto desde el listado
        prod_cat = categoria_principal
        prod_sub = subcategoria
        prod_sub_sub = sub_subcategoria
        prod_marca = ""
        galeria_urls = [image_url] if image_url else []

        # --- EXTRACCIÓN EN PROFUNDIDAD (app-articulo) ---
        # Entra a la ficha de cada producto para leer el breadcrumb exacto y la galería de fotos
        if DEEP_SCRAPE_PRODUCTS:
            try:
                cards = driver.find_elements(By.CSS_SELECTOR, '.col-art .card-product')
                if index < len(cards):
                    target_card = cards[index]

                    # 1. Hacer click en el elemento interactivo dentro de la tarjeta
                    CLICK_JS = """
                    const card = arguments[0];
                    const target = card.querySelector('.card-img-top') ||
                                   card.querySelector('img') ||
                                   card.querySelector('.descripcion') ||
                                   card.querySelector('a') ||
                                   card;
                    target.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' });
                    ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evtType => {
                        target.dispatchEvent(new MouseEvent(evtType, { bubbles: true, cancelable: true, view: window }));
                    });
                    try { target.click(); } catch(e) {}
                    try { card.click(); } catch(e) {}
                    """
                    driver.execute_script(CLICK_JS, target_card)

                    # 2. Esperar específicamente a que monte el componente app-articulo
                    def en_detalle_articulo(d):
                        if d.find_elements(By.TAG_NAME, "app-articulo"):
                            return True
                        if d.find_elements(By.CSS_SELECTOR, "app-articulo .gallery, .gallery .img-gallery, .contenedor-card .gallery"):
                            return True
                        curr = d.current_url.lower()
                        if "#/articulo" in curr or "/articulo" in curr:
                            return True
                        return False

                    try:
                        WebDriverWait(driver, 5).until(en_detalle_articulo)
                        time.sleep(0.4)

                        DETALLE_JS = """
                        const container = document.querySelector('app-articulo') || document.querySelector('.contenedor-card') || document;
                        const crumbSpans = Array.from(container.querySelectorAll('#breadcrumb .breadcrumb-item.breadcrumb2, app-breadcrumbs .breadcrumb-item.breadcrumb2, .breadcrumb .breadcrumb-item.breadcrumb2'));
                        const crumbs = crumbSpans.map(s => s.textContent.trim().toUpperCase()).filter(Boolean);

                        const galleryImgs = Array.from(container.querySelectorAll('.gallery .img-gallery, .gallery-item img, img.img-gallery, .gallery img'));
                        const galleryUrls = galleryImgs.map(img => img.getAttribute('src') || img.getAttribute('data-src') || img.src || '').filter(s => s && !s.startsWith('data:'));

                        return {
                            crumbs: crumbs,
                            gallery: Array.from(new Set(galleryUrls))
                        };
                        """
                        detalle = driver.execute_script(DETALLE_JS) or {}
                        inner_crumbs = detalle.get('crumbs') or []
                        inner_gallery = detalle.get('gallery') or []

                        if inner_crumbs:
                            if len(inner_crumbs) > 0: prod_cat = inner_crumbs[0]
                            if len(inner_crumbs) > 1: prod_sub = inner_crumbs[1]
                            if len(inner_crumbs) > 2: prod_sub_sub = inner_crumbs[2]
                            if len(inner_crumbs) > 3: prod_marca = inner_crumbs[3]

                        if inner_gallery:
                            galeria_urls = inner_gallery

                        if inner_crumbs or inner_gallery:
                            print(Fore.MAGENTA + f"   🔍 [Detalle {code}] Breadcrumb: {' > '.join(inner_crumbs)} | Fotos: {len(galeria_urls)}" + Style.RESET_ALL)
                    except Exception:
                        pass
                    finally:
                        # 3. Regresar a la grilla de productos
                        try:
                            driver.execute_script("window.history.back();")
                            def en_listado_productos(d):
                                return len(d.find_elements(By.CSS_SELECTOR, ".col-art .card-product, .itemsBlock")) > 0
                            try:
                                WebDriverWait(driver, 4).until(en_listado_productos)
                            except Exception:
                                driver.execute_script("""
                                    const back = document.querySelector('#breadcrumb .breadcrumb-item:first-child') || 
                                                 document.querySelector('.breadcrumb-item');
                                    if (back) back.click();
                                """)
                                WebDriverWait(driver, 3).until(en_listado_productos)
                            time.sleep(0.2)
                        except Exception:
                            time.sleep(0.5)
            except Exception as e:
                try:
                    if "articulo" in driver.current_url.lower():
                        driver.execute_script("window.history.back();")
                        time.sleep(0.5)
                except Exception:
                    pass

        # Determinar línea (Nivel 3) si no vino del breadcrumb
        if not prod_sub_sub and lineas_sidebar:
            desc_upper = description.upper()
            for l in lineas_sidebar:
                l_base = l.rstrip('S')
                if l in desc_upper or l_base in desc_upper:
                    prod_sub_sub = l
                    break

        # Construir jerarquía completa
        niveles_producto = [p for p in [prod_cat, prod_sub, prod_sub_sub, prod_marca] if p]
        categoria_ruta = " > ".join(niveles_producto) if niveles_producto else prod_cat
        categoria_niveles_json = json.dumps(niveles_producto, ensure_ascii=False)
        nivel_profundidad = len(niveles_producto)

        cat_slug = generar_slug(prod_cat)
        subcat_slug = generar_slug(prod_sub)
        sub_subcat_slug = generar_slug(prod_sub_sub)

        # URLs públicas de Supabase Storage para portada y galería
        supabase_img_name = f"{code}.jpg".replace("/", "_").replace("\\", "_")
        supabase_img_url = f"{SUPABASE_STORAGE_URL}/storage/v1/object/public/products/{supabase_img_name}"

        supabase_galeria = []
        for i, g_url in enumerate(galeria_urls):
            suf = "" if i == 0 else f"_{i}"
            s_name = f"{code}{suf}.jpg".replace("/", "_").replace("\\", "_")
            supabase_galeria.append(f"{SUPABASE_STORAGE_URL}/storage/v1/object/public/products/{s_name}")

        if not supabase_galeria and image_url:
            supabase_galeria = [supabase_img_url]

        # Descarga y subida asíncrona a Supabase Storage
        if DOWNLOAD_IMAGES and galeria_urls:
            _img_executor.submit(_descargar_galeria_async, galeria_urls, code, img_dir, scraping_product.db_path)
        elif DOWNLOAD_IMAGES and image_url:
            img_name = f"{code}.jpg"
            img_path = os.path.join(img_dir, img_name)
            _img_executor.submit(_descargar_imagen_async, image_url, img_path, supabase_img_name, scraping_product.db_path)

        # Código de barras
        codigo_barra = obtener_codigo_barra(code, scraping_product.db_path) if scraping_product.db_path else ""

        product_data = {
            'codigo': code,
            'descripcion': description,
            'precio': price,
            'precio_costo': precio_costo,
            'margen_minorista': margen_detal,
            'margen_mayorista': margen_mayor,
            'precio_minorista': precio_minorista,
            'precio_mayorista': precio_mayorista,
            'precio_venta': precio_minorista,
            'porcentaje_ganancia': margen_detal,
            'imagen_url': supabase_img_url if (image_url or galeria_urls) else '',
            'imagen_local': f"img-scraping/{code}.jpg",
            'foto': f"img-scraping/{code}.jpg",
            'variante': variant,
            'marca': prod_marca,
            'imagenes_galeria': json.dumps(supabase_galeria, ensure_ascii=False),
            'codigo_de_barras': codigo_barra,
            'categoria': prod_cat,
            'subcategoria': prod_sub,
            'sub_subcategoria': prod_sub_sub,
            'categoria_ruta': categoria_ruta,
            'categoria_niveles': categoria_niveles_json,
            'nivel_profundidad': nivel_profundidad,
            'categoria_slug': cat_slug,
            'subcategoria_slug': subcat_slug,
            'sub_subcategoria_slug': sub_subcat_slug
        }
        products.append(product_data)

        # Resumen formateado en consola
        marca_label = f" | Marca: {prod_marca}" if prod_marca else ""
        fotos_count = len(galeria_urls)
        print(f"{Fore.GREEN}⚡ [{index + 1}/{total_products}]{Style.RESET_ALL} {Fore.CYAN}{code}{Style.RESET_ALL} | {description[:25]}...{marca_label} | {categoria_ruta} | {fotos_count} foto(s) | Costo: ${precio_costo:,.2f} | Detal: ${precio_minorista:,.2f} | Mayor: ${precio_mayorista:,.2f}")

    return products, categoria_ruta, scraping_product.db_path
