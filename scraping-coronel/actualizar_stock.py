from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException, StaleElementReferenceException
from app.login import login
from api_tiendanube import client
from colorama import Fore, Style, init
from app.core.browser import get_chrome_driver
from app.core.logger import registrar_error
import pandas as pd
import time
import os
import glob
import sqlite3
import requests
import re
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

# Inicializar colorama
init()

def formatear_duracion(segundos: float) -> str:
    """Formatea segundos en una cadena legible: ej. 2m 15s o 4.35s"""
    if segundos < 60:
        return f"{segundos:.2f}s"
    s = int(round(segundos))
    m, s = divmod(s, 60)
    h, m = divmod(m, 60)
    if h > 0:
        return f"{h}h {m}m {s}s"
    return f"{m}m {s:02d}s"

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

def limpiar_precio_float(valor):
    """Convierte cadenas de moneda como '$ 4.898,00' o '$15.898' a float válido."""
    if not valor:
        return 0.0
    try:
        clean = re.sub(r'[^\d,\.]', '', str(valor).strip())
        if '.' in clean and ',' in clean:
            clean = clean.replace('.', '').replace(',', '.')
        elif ',' in clean:
            clean = clean.replace(',', '.')
        return float(clean)
    except Exception:
        return 0.0

# Constantes Supabase PostgREST
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "http://jg-store-bd.press-cloud.com")
SUPABASE_KEY = os.getenv(
    "SERVICE_ROLE_KEY",
    os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A")
)

LISTING_SELECTOR = (By.CLASS_NAME, "itemsBlock")
NEXT_BUTTON_SELECTOR = (By.ID, "siguiente")

MAX_RETRIES = 7
WAIT_TIME = 25
MIN_EXPECTED_PAGES = 680
LOADING_SELECTOR = (By.CSS_SELECTOR, ".loading, .spinner, .loader, [class*='loading'], [class*='spinner']")


def get_current_page_from_url(driver):
    """Extrae el número de página actual de la URL."""
    try:
        url = driver.current_url
        match = re.search(r'page=(\d+)', url)
        if match:
            return int(match.group(1))
    except Exception:
        pass
    return 1


def wait_for_page_ready(driver, timeout=10):
    """
    Espera a que la página esté lista: sin spinners/loading activos.
    """
    try:
        WebDriverWait(driver, timeout).until_not(
            EC.presence_of_element_located(LOADING_SELECTOR)
        )
    except Exception:
        pass
    
    try:
        WebDriverWait(driver, timeout).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
    except Exception:
        pass
    
    time.sleep(0.5)
    return True


def is_last_page(driver, be_conservative=False):
    """Determina si no quedan más páginas o productos visibles."""
    current_page = get_current_page_from_url(driver)
    
    try:
        next_button = driver.find_element(*NEXT_BUTTON_SELECTOR)
        classes = (next_button.get_attribute("class") or "")
        is_disabled = next_button.get_attribute("disabled") is not None
        is_inactive = "btn-shadow" not in classes
        
        if is_disabled:
            return True
            
        if be_conservative and current_page < MIN_EXPECTED_PAGES:
            if is_inactive:
                return False
                
        if is_inactive:
            return True
            
    except Exception:
        if be_conservative and current_page < MIN_EXPECTED_PAGES:
            return False
        return True

    try:
        if not driver.find_elements(By.CSS_SELECTOR, ".col-art .card-product"):
            if be_conservative and current_page < MIN_EXPECTED_PAGES:
                return False
            return True
    except Exception:
        pass
    return False


def wait_for_listing(driver, wait_time=WAIT_TIME, max_retries=MAX_RETRIES):
    """
    Asegura que el listado de productos esté presente con reintentos controlados.
    """
    last_exception = None
    current_page = get_current_page_from_url(driver)
    attempt = 0
    consecutive_failures = 0
    
    while True:
        attempt += 1
        wait_for_page_ready(driver, timeout=10)
        
        try:
            WebDriverWait(driver, wait_time).until(
                EC.presence_of_element_located(LISTING_SELECTOR)
            )
            return True
        except TimeoutException as exc:
            last_exception = exc
            consecutive_failures += 1
            current_page = get_current_page_from_url(driver)
            
            if current_page >= MIN_EXPECTED_PAGES:
                if is_last_page(driver, be_conservative=False):
                    print(Fore.GREEN + f"✅ Catálogo sin más productos visibles (página {current_page})." + Style.RESET_ALL)
                    return False
                if attempt >= max_retries:
                    if last_exception:
                        raise last_exception
                    return False
            
            if consecutive_failures <= 3:
                print(Fore.YELLOW + f"⚠️ Lista no cargó (intento {attempt}, página {current_page}). Refresh..." + Style.RESET_ALL)
                time.sleep(2)
                driver.refresh()
                time.sleep(2)
            elif consecutive_failures <= 6:
                print(Fore.YELLOW + f"⚠️ Reintentando página {current_page} con navegación directa..." + Style.RESET_ALL)
                driver.get(f"https://coronelmayorista.com.ar/#/articulos?page={current_page}&ORDER=ORD%3DASC&VIEW_TYPE=GRID_VI")
                time.sleep(4)
                wait_for_page_ready(driver, timeout=15)
            else:
                print(Fore.YELLOW + f"⚠️ Saltando a página {current_page + 1} tras fallos..." + Style.RESET_ALL)
                current_page += 1
                driver.get(f"https://coronelmayorista.com.ar/#/articulos?page={current_page}&ORDER=ORD%3DASC&VIEW_TYPE=GRID_VI")
                time.sleep(4)
                wait_for_page_ready(driver, timeout=15)
                consecutive_failures = 0


def scraping_product(driver, margen_minorista=40.0, margen_mayorista=18.0, max_retries=MAX_RETRIES, wait_time=WAIT_TIME):
    """
    Extrae instantáneamente el SKU, variante y precio de costo actual de cada producto del listado.
    Calcula los precios mayorista y minorista con sus márgenes respectivos.
    """
    try:
        listing_ready = wait_for_listing(driver, wait_time=wait_time, max_retries=max_retries)
    except TimeoutException as exc:
        current_page = get_current_page_from_url(driver)
        print(Fore.RED + f"✖ No se pudo preparar la página {current_page}: {exc}" + Style.RESET_ALL)
        return [], ""

    if not listing_ready:
        return [], ""
    
    # Obtener la categoría del breadcrumb si está visible
    try:
        breadcrumb = driver.find_element(By.CSS_SELECTOR, "#breadcrumb .breadcrumb2")
        categoria = breadcrumb.text.strip()
    except Exception:
        categoria = ""
    
    # Extracción en bloque ultra rápida mediante JavaScript nativo en el navegador
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
        
        let variant = '';
        const adicional = card.querySelector('.adicional span');
        if (adicional && adicional.textContent.trim()) {
            variant = adicional.textContent.trim();
        }

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

        return { codigo: code, variante: variant, precio: price };
    });
    """

    raw_items = driver.execute_script(EXTRACTION_JS) or []
    total_products = len(raw_items)
    products = []

    for item in raw_items:
        raw_code = item.get('codigo', '')
        if not raw_code:
            continue
        code = formatear_codigo(raw_code)
        variant = item.get('variante', '').strip()
        if variant:
            v_clean = variant.upper().replace(' ', '').replace('/', '-').replace('\\', '-')
            if not code.endswith(f"-{v_clean}"):
                code = f"{code}-{v_clean}"
        
        costo = limpiar_precio_float(item.get('precio', '0'))
        p_detal = round(costo * (1.0 + margen_minorista / 100.0), 2)
        p_mayor = round(costo * (1.0 + margen_mayorista / 100.0), 2)

        products.append({
            'codigo': code,
            'categoria': categoria,
            'precio_costo': costo,
            'precio_minorista': p_detal,
            'precio_mayorista': p_mayor,
            'stock': 999999
        })

    return products, categoria


def sync_sqlite_stock_and_prices(scraped_products, base_dir=None):
    """
    Actualiza la base de datos local SQLite:
    - Productos presentes en el scraping: stock = 999999 y actualización de precio costo y PVP.
    - Productos ausentes en el scraping (discontinuados/agotados): stock = 0.
    """
    t_start = time.time()
    if not base_dir:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'productos.db')
    
    if not os.path.exists(db_path):
        print(Fore.YELLOW + f"⚠ SQLite {db_path} no existe. Omitiendo actualización local." + Style.RESET_ALL)
        return 0, 0

    scraped_map = {p['codigo']: p for p in scraped_products}
    updated_activos = 0
    updated_discontinuados = 0
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    try:
        with sqlite3.connect(db_path) as conn:
            c = conn.cursor()
            
            # Garantizar columnas necesarias
            for col_def in [
                ("stock", "INTEGER DEFAULT 999999"),
                ("precio_costo", "REAL DEFAULT 0"),
                ("precio_minorista", "REAL DEFAULT 0"),
                ("precio_mayorista", "REAL DEFAULT 0"),
                ("updated_at", "TEXT")
            ]:
                try:
                    c.execute(f"ALTER TABLE productos ADD COLUMN {col_def[0]} {col_def[1]}")
                except Exception:
                    pass

            # 1. Actualizar productos presentes en el scraping
            for code, p in scraped_map.items():
                c.execute("""
                    UPDATE productos SET 
                        stock = 999999,
                        precio_costo = CASE WHEN ? > 0 THEN ? ELSE precio_costo END,
                        precio_minorista = CASE WHEN ? > 0 THEN ? ELSE precio_minorista END,
                        precio_mayorista = CASE WHEN ? > 0 THEN ? ELSE precio_mayorista END,
                        precio_venta = CASE WHEN ? > 0 THEN ? ELSE precio_venta END,
                        updated_at = ?
                    WHERE codigo = ?
                """, (p['precio_costo'], p['precio_costo'], p['precio_minorista'], p['precio_minorista'],
                      p['precio_mayorista'], p['precio_mayorista'], p['precio_minorista'], p['precio_minorista'],
                      now_str, code))
                if c.rowcount > 0:
                    updated_activos += c.rowcount

            # 2. Marcar con stock = 0 a los que ya NO existen en Coronel (discontinuados)
            c.execute("SELECT codigo FROM productos WHERE codigo NOT LIKE '%-local'")
            all_db_codes = [row[0] for row in c.fetchall()]
            missing_codes = [code for code in all_db_codes if code not in scraped_map]

            if missing_codes:
                batch_size = 500
                for i in range(0, len(missing_codes), batch_size):
                    batch = missing_codes[i:i + batch_size]
                    placeholders = ','.join(['?'] * len(batch))
                    c.execute(f"UPDATE productos SET stock = 0, updated_at = ? WHERE codigo IN ({placeholders})", [now_str] + batch)
                    updated_discontinuados += c.rowcount

            conn.commit()

        dur = time.time() - t_start
        print(Fore.GREEN + f"⏱️ [CRONÓMETRO] SQLite actualizado en {formatear_duracion(dur)}: {updated_activos} con stock activo, {updated_discontinuados} marcados como agotados (stock 0)." + Style.RESET_ALL)
        return updated_activos, updated_discontinuados
    except Exception as e:
        print(Fore.RED + f"❌ Error actualizando SQLite: {e}" + Style.RESET_ALL)
        return 0, 0


def sync_supabase_stock_and_prices(scraped_products):
    """
    Sincroniza directamente con la base de datos de producción JG Store en Supabase PostgREST:
    - Productos encontrados: stock = 999, costo y precios de venta actualizados.
    - Productos ausentes en Coronel: stock = 0 (se muestran como Agotados / Ocultos en la web).
    """
    t_start = time.time()
    print(Fore.CYAN + "\n🌐 Sincronizando existencias y precios con Supabase PostgREST..." + Style.RESET_ALL)
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    scraped_map = {p['codigo']: p for p in scraped_products}
    
    # 1. Obtener todos los productos registrados en Supabase
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=id,sku,stock,cost_price,retail_price,wholesale_price"
        res = requests.get(url, headers=headers, timeout=20)
        if not res.ok:
            print(Fore.YELLOW + f"⚠ Supabase respondió {res.status_code}: {res.text}. Omitiendo sync web." + Style.RESET_ALL)
            return 0, 0
        db_products = res.json()
    except Exception as e:
        print(Fore.YELLOW + f"⚠ No se pudo conectar a Supabase PostgREST ({e})." + Style.RESET_ALL)
        return 0, 0

    if not db_products:
        print(Fore.YELLOW + "ℹ️ No hay productos en la tabla 'products' de Supabase." + Style.RESET_ALL)
        return 0, 0

    now_iso = datetime.utcnow().isoformat() + "Z"
    updated_activos = 0
    updated_agotados = 0

    def _patch_product(prod):
        nonlocal updated_activos, updated_agotados
        p_id = prod['id']
        sku = prod.get('sku', '')
        if not sku or sku.endswith('-local'):
            return

        patch_url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{p_id}"
        
        if sku in scraped_map:
            s_item = scraped_map[sku]
            payload = {
                "stock": 999,
                "updated_at": now_iso
            }
            if s_item.get('precio_costo', 0) > 0:
                payload["cost_price"] = s_item['precio_costo']
                payload["retail_price"] = s_item['precio_minorista']
                payload["wholesale_price"] = s_item['precio_mayorista']
            try:
                r = requests.patch(patch_url, headers=headers, json=payload, timeout=8)
                if r.ok:
                    updated_activos += 1
            except Exception:
                pass
        else:
            # Producto discontinuado o sin existencias en Coronel
            if prod.get('stock', 0) > 0:
                payload = {
                    "stock": 0,
                    "updated_at": now_iso
                }
                try:
                    r = requests.patch(patch_url, headers=headers, json=payload, timeout=8)
                    if r.ok:
                        updated_agotados += 1
                except Exception:
                    pass

    # Ejecutar actualizaciones en paralelo mediante ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=8) as executor:
        list(executor.map(_patch_product, db_products))

    dur = time.time() - t_start
    print(Fore.GREEN + f"⏱️ [CRONÓMETRO] Sincronización Supabase completada en {formatear_duracion(dur)}:" + Style.RESET_ALL)
    print(f"  - {Fore.GREEN}{updated_activos}{Style.RESET_ALL} productos activos actualizados con existencias y precios.")
    print(f"  - {Fore.RED}{updated_agotados}{Style.RESET_ALL} productos discontinuados marcados como Agotados (stock = 0).")
    
    return updated_activos, updated_agotados


def update_tiendanube_stock(scraped_products):
    """
    Actualización opcional / retrocompatible para Tiendanube si está configurada.
    """
    print(Fore.CYAN + "\n🔄 Verificando sincronización con Tienda Nube..." + Style.RESET_ALL)
    t_start = time.time()
    try:
        scraped_codes = {p['codigo']: p for p in scraped_products}
        
        tiendanube_products = []
        try:
            tiendanube_products = client.get_all_products()
        except Exception as tn_err:
            print(Fore.YELLOW + f"ℹ️ Sincronización con Tiendanube omitida o en pausa ({tn_err})." + Style.RESET_ALL)
            return

        updates = {'infinito': 0, 'cero': 0, 'visibles': 0, 'ocultos': 0, 'error': 0}

        for tn_product in tiendanube_products:
            product_id = tn_product['id']
            product_name = tn_product.get('name', {}).get('es', 'Sin nombre')
            variants = tn_product.get('variants', [])
            product_published = tn_product.get('published', True)
            product_has_stock = False

            for variant in variants:
                sku = variant.get('sku', '')
                if not sku or sku.endswith('-local'):
                    product_has_stock = True
                    continue

                new_stock = 999999 if sku in scraped_codes else 0
                if new_stock > 0:
                    product_has_stock = True
                    updates['infinito'] += 1
                else:
                    updates['cero'] += 1
                
                client.update_variant_stock(product_id, variant['id'], new_stock)
                time.sleep(0.3)

            should_be_published = product_has_stock
            if product_published != should_be_published:
                client.update_product_visibility(product_id, should_be_published)
                if should_be_published:
                    updates['visibles'] += 1
                else:
                    updates['ocultos'] += 1

        dur = time.time() - t_start
        print(Fore.GREEN + f"⏱️ [CRONÓMETRO] Tiendanube procesada en {formatear_duracion(dur)}." + Style.RESET_ALL)
    except Exception as e:
        print(Fore.YELLOW + f"Aviso Tiendanube: {e}" + Style.RESET_ALL)


def scraping_all_product(driver, margen_minorista=40.0, margen_mayorista=18.0):
    """
    Extrae información de productos de TODAS las páginas disponibles de Coronel Mayorista
    con cronómetro por página y acumulado.
    """
    t_inicio_barrido = time.time()
    print(Fore.YELLOW + "\nNavegando a la lista de precios global de Coronel..." + Fore.RESET)
    driver.get("https://coronelmayorista.com.ar/#/articulos?page=1&ORDER=ORD%3DASC&VIEW_TYPE=GRID_VI")
    time.sleep(2)
    
    all_products = []
    page_number = 1
    
    while True:
        t_page_start = time.time()
        print(Fore.YELLOW + f"\nProcesando página {page_number}..." + Fore.RESET)
        
        # Captura para preview en vivo del Dashboard
        try:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            driver.save_screenshot(os.path.join(base_dir, "preview.png"))
        except Exception:
            pass

        current_products, categoria = scraping_product(driver, margen_minorista=margen_minorista, margen_mayorista=margen_mayorista)
        dur_page = time.time() - t_page_start
        dur_acum = time.time() - t_inicio_barrido
        
        if not current_products:
            print(Fore.GREEN + f"✔ Fin del catálogo alcanzado en la página {page_number}." + Fore.RESET)
            break
            
        all_products.extend(current_products)
        print(Fore.CYAN + f"⏱️ [CRONÓMETRO] Página {page_number}: {len(current_products)} artículos extraídos en {formatear_duracion(dur_page)} | Tiempo acum: {formatear_duracion(dur_acum)} | Total acumulado: {len(all_products)} prods" + Fore.RESET)
        
        try:
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            next_button = WebDriverWait(driver, 8).until(
                EC.presence_of_element_located((By.ID, "siguiente"))
            )
            
            if next_button.get_attribute("disabled") is not None:
                print(Fore.GREEN + "✅ Botón siguiente deshabilitado: última página alcanzada." + Fore.RESET)
                break
                
            driver.execute_script("arguments[0].click();", next_button)
            time.sleep(1.2)
            page_number += 1
                
        except Exception as e:
            print(Fore.YELLOW + f"⚠ Finalización de paginación: {str(e)}" + Fore.RESET)
            break
    
    dur_total_barrido = time.time() - t_inicio_barrido
    print(Fore.GREEN + f"\n⏱️ [CRONÓMETRO] Barrido de catálogo finalizado en {formatear_duracion(dur_total_barrido)} ({len(all_products)} productos encontrados)" + Fore.RESET)
    return all_products, categoria


def run_stock(auto_mode: bool = True, margen_minorista: float = 40.0, margen_mayorista: float = 18.0, sync_supabase: bool = True):
    """
    Función principal para actualizar stock y precios de forma rápida y 100% automatizada.
    
    Args:
        auto_mode: bool. Si es True, no espera confirmación manual de usuario en pantalla.
        margen_minorista: float. Margen B2C (%) para cálculo de PVP detal.
        margen_mayorista: float. Margen B2B (%) para cálculo de PVP mayor.
        sync_supabase: bool. Si es True, sincroniza existencias y precios con Supabase en la web.
    """
    t_global_start = time.time()
    driver = get_chrome_driver()
    
    print(Fore.CYAN + "="*60)
    print(" ⚡ INICIANDO ACTUALIZACIÓN RÁPIDA DE STOCK & PRECIOS")
    print(f"    Modo Automático: {'SÍ (Sin intervención)' if auto_mode else 'NO'}")
    print(f"    Margen Detal (B2C): {margen_minorista}% | Margen Mayor (B2B): {margen_mayorista}%")
    print(f"    Sincronización Web (Supabase): {'ACTIVA' if sync_supabase else 'DESACTIVADA'}")
    print("="*60 + Fore.RESET)

    try:
        # 1. Login con cronómetro
        t_login_start = time.time()
        login_result = login(driver, show_button=not auto_mode)
        dur_login = time.time() - t_login_start
        
        if not login_result:
            print(Fore.RED + "✖ Cancelado por fallo en el login de Coronel." + Fore.RESET)
            driver.quit()
            return False

        print(Fore.GREEN + f"⏱️ [CRONÓMETRO] Login y preparación completados en {formatear_duracion(dur_login)}" + Fore.RESET)

        # 2. Barrido ultra rápido de catálogo
        print("[SCRAPER_STATUS:STOCK_UPDATING]", flush=True)
        products, _ = scraping_all_product(driver, margen_minorista=margen_minorista, margen_mayorista=margen_mayorista)
        
        try:
            driver.quit()
        except Exception:
            pass

        if not products:
            print(Fore.RED + "✖ No se extrajeron productos del catálogo." + Fore.RESET)
            return False

        # 3. Actualizar base de datos local SQLite
        sync_sqlite_stock_and_prices(products)

        # 4. Sincronizar existencias y precios en la web oficial (Supabase)
        if sync_supabase:
            sync_supabase_stock_and_prices(products)

        # 5. Compatibilidad Tiendanube (si aplica)
        try:
            update_tiendanube_stock(products)
        except Exception:
            pass

        dur_global = time.time() - t_global_start
        print(Fore.GREEN + "\n" + "="*60)
        print(f" 🎉 ACTUALIZACIÓN DE STOCK FINALIZADA CON ÉXITO")
        print(f" ⏱️ [CRONÓMETRO TOTAL] Duración total: {formatear_duracion(dur_global)}")
        print("="*60 + Fore.RESET)
        return True

    except Exception as e:
        print(Fore.RED + f"🚨 Error durante la actualización de stock: {e}" + Fore.RESET)
        try:
            driver.quit()
        except Exception:
            pass
        return False


if __name__ == "__main__":
    run_stock(auto_mode=True)
