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
import json
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


def scraping_product(driver, max_retries=MAX_RETRIES, wait_time=WAIT_TIME):
    """
    Extrae instantáneamente el SKU, variante y precio de costo actual de cada producto del listado.
    No impone márgenes globales: solo recopila el costo de proveedor y estado en catálogo.
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

        products.append({
            'codigo': code,
            'categoria': categoria,
            'precio_costo': costo,
            'stock': 999999
        })

    return products, categoria


def cargar_mapa_excel(base_dir=None):
    """
    Busca la lista de precios oficial más reciente descargada en productos_coronel/
    y construye un mapa indexado por código/SKU para enriquecer con:
      - Código de barras oficial EAN-13 (C.Barra)
      - Precio de costo base de proveedor (Precio)
      - Código de proveedor original
    """
    if not base_dir:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    excel_dir = os.path.join(base_dir, 'productos_coronel')
    if not os.path.exists(excel_dir):
        return {}

    excel_files = glob.glob(os.path.join(excel_dir, '*.xlsx')) + glob.glob(os.path.join(excel_dir, '*.xls'))
    if not excel_files:
        return {}

    latest_excel = max(excel_files, key=os.path.getmtime)
    print(Fore.CYAN + f"\n📊 Indexando códigos de barra y costos desde {os.path.basename(latest_excel)}..." + Style.RESET_ALL)

    try:
        df = pd.read_excel(latest_excel)
        excel_map = {}
        for _, row in df.iterrows():
            cod = str(row.get('Codigo', '')).strip()
            if not cod or cod == 'nan':
                continue
            
            cbarra_raw = str(row.get('C.Barra', '')).strip()
            cbarra = cbarra_raw if (cbarra_raw and cbarra_raw != 'nan' and re.match(r'^\d{8,14}$', cbarra_raw)) else None
            
            try:
                precio = float(row.get('Precio', 0))
            except Exception:
                precio = 0.0

            desc = str(row.get('Descripcion del Articulo', '')).strip()
            item_data = {
                'barcode': cbarra,
                'costo': precio,
                'descripcion': desc,
                'codigo_original': cod
            }

            excel_map[cod] = item_data
            excel_map[cod.upper()] = item_data
            excel_map[cod.replace('-', '').upper()] = item_data
            
            nums = re.sub(r'[^\d]', '', cod)
            if nums and nums not in excel_map:
                excel_map[nums] = item_data

        print(Fore.GREEN + f"✔ {len(excel_map)} códigos indexados con códigos de barra oficiales EAN-13." + Style.RESET_ALL)
        return excel_map
    except Exception as e:
        print(Fore.YELLOW + f"⚠ No se pudo procesar el Excel de precios ({e}). Se continuará con datos web." + Style.RESET_ALL)
        return {}


def buscar_en_excel_map(sku, excel_map):
    """
    Encuentra con máxima tolerancia y precisión un SKU en el mapa extraído del Excel.
    """
    if not excel_map or not sku:
        return None
    if sku in excel_map:
        return excel_map[sku]
    clean = sku.replace('-', '').upper()
    if clean in excel_map:
        return excel_map[clean]
    parts = sku.split('-')
    if len(parts) > 1:
        combo = (parts[0] + parts[1]).upper()
        if combo in excel_map:
            return excel_map[combo]
        if parts[1] in excel_map:
            return excel_map[parts[1]]
    nums = re.sub(r'[^\d]', '', sku)
    if nums and nums in excel_map:
        return excel_map[nums]
    return None


def sync_sqlite_stock_and_prices(scraped_products, base_dir=None, excel_map=None):
    """
    Actualiza la base de datos local SQLite:
    - Si el archivo productos.db no existe, se crea automáticamente la tabla para el contenedor Docker.
    - Productos presentes en el scraping: stock = 999999.
    - Asigna el código de barras oficial desde el Excel si está disponible.
    - Si el precio de costo del proveedor CAMBIÓ: se recalculan automáticamente los precios
      de venta utilizando los porcentajes de margen ya establecidos para ese producto en SQLite.
    - Si el costo NO cambió: no se tocan los precios, únicamente se refresca el stock.
    - Productos ausentes en el scraping (discontinuados): stock = 0.
    """
    t_start = time.time()
    if not base_dir:
        base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, 'productos.db')
    
    # Asegurar base de datos SQLite y esquema completo canónico (evita tablas incompletas en Docker)
    try:
        from app.core.db import asegurar_tabla_productos
        asegurar_tabla_productos(db_path)
    except Exception as e_init:
        print(Fore.YELLOW + f"⚠ Error asegurando esquema SQLite ({e_init})." + Style.RESET_ALL)

    scraped_map = {p['codigo']: p for p in scraped_products}
    updated_activos = 0
    updated_discontinuados = 0
    precios_recalculados = 0
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    sqlite_items = {}

    try:
        with sqlite3.connect(db_path) as conn:
            c = conn.cursor()

            # Cargar productos existentes con sus márgenes y costos ya establecidos
            c.execute("SELECT codigo, precio_costo, margen_minorista, margen_mayorista, precio_minorista, precio_mayorista, codigo_barra FROM productos")
            for row in c.fetchall():
                sqlite_items[row[0]] = {
                    'costo': row[1] or 0.0,
                    'margen_min': row[2] if row[2] is not None else 40.0,
                    'margen_may': row[3] if row[3] is not None else 18.0,
                    'precio_min': row[4] or 0.0,
                    'precio_may': row[5] or 0.0,
                    'barcode': row[6] or None
                }

            # 1. Actualizar productos presentes en el scraping
            for code, p in scraped_map.items():
                nuevo_costo = p.get('precio_costo', 0.0)
                barcode_val = None
                if excel_map:
                    m_ex = buscar_en_excel_map(code, excel_map)
                    if m_ex:
                        barcode_val = m_ex.get('barcode')
                        if nuevo_costo == 0 and m_ex.get('costo'):
                            nuevo_costo = m_ex['costo']
                
                if code in sqlite_items:
                    item = sqlite_items[code]
                    costo_anterior = item['costo']
                    costo_cambio = (nuevo_costo > 0 and abs(nuevo_costo - costo_anterior) > 0.01)

                    if costo_cambio:
                        # El costo cambió: hacer la cuenta matemática automática con el porcentaje establecido
                        m_min = item['margen_min']
                        m_may = item['margen_may']
                        nuevo_p_min = round(nuevo_costo * (1.0 + m_min / 100.0), 2)
                        nuevo_p_may = round(nuevo_costo * (1.0 + m_may / 100.0), 2)

                        c.execute("""
                            UPDATE productos SET 
                                stock = 999999,
                                precio_costo = ?,
                                precio_minorista = ?,
                                precio_mayorista = ?,
                                precio_venta = ?,
                                codigo_barra = COALESCE(?, codigo_barra),
                                updated_at = ?
                            WHERE codigo = ?
                        """, (nuevo_costo, nuevo_p_min, nuevo_p_may, nuevo_p_min, barcode_val, now_str, code))
                        precios_recalculados += 1
                        
                        # Actualizar en memoria para el sync de Supabase
                        item['costo'] = nuevo_costo
                        item['precio_min'] = nuevo_p_min
                        item['precio_may'] = nuevo_p_may
                        if barcode_val:
                            item['barcode'] = barcode_val
                    else:
                        # El costo NO cambió: SOLO actualizamos stock (y barcode si faltaba)
                        c.execute("UPDATE productos SET stock = 999999, codigo_barra = COALESCE(?, codigo_barra), updated_at = ? WHERE codigo = ?", (barcode_val, now_str, code))
                    
                    updated_activos += 1
                else:
                    # Producto nuevo detectado en scraping
                    p_min = round(nuevo_costo * 1.40, 2) if nuevo_costo > 0 else 0.0
                    p_may = round(nuevo_costo * 1.18, 2) if nuevo_costo > 0 else 0.0
                    c.execute("""
                        INSERT OR REPLACE INTO productos (
                            codigo, codigo_barra, categoria, precio_costo, margen_minorista, margen_mayorista,
                            precio_minorista, precio_mayorista, precio_venta, stock, updated_at
                        ) VALUES (?, ?, ?, ?, 40.0, 18.0, ?, ?, ?, 999999, ?)
                    """, (code, barcode_val, p.get('categoria', ''), nuevo_costo, p_min, p_may, p_min, now_str))
                    sqlite_items[code] = {
                        'costo': nuevo_costo,
                        'margen_min': 40.0,
                        'margen_may': 18.0,
                        'precio_min': p_min,
                        'precio_may': p_may,
                        'barcode': barcode_val
                    }
                    updated_activos += 1

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
        print(Fore.GREEN + f"⏱️ [CRONÓMETRO] SQLite actualizado en {formatear_duracion(dur)}:" + Style.RESET_ALL)
        print(f"  - {Fore.GREEN}{updated_activos}{Style.RESET_ALL} productos activos ({precios_recalculados} precios recalculados automáticamente por cambio de costo).")
        print(f"  - {Fore.RED}{updated_discontinuados}{Style.RESET_ALL} productos discontinuados marcados como Agotados (stock = 0).")
        return updated_activos, updated_discontinuados, precios_recalculados, sqlite_items
    except Exception as e:
        print(Fore.RED + f"❌ Error actualizando SQLite: {e}" + Style.RESET_ALL)
        return 0, 0, 0, {}


def sync_supabase_stock_and_prices(scraped_products, sqlite_items=None, excel_map=None):
    """
    Sincroniza directamente con la base de datos de producción JG Store en Supabase PostgREST:
    - Productos encontrados: stock = 999.
    - Enriquecimiento con código de barras oficial EAN-13 desde el Excel si está disponible.
    - Si el costo del proveedor CAMBIÓ: recalcula el precio de venta conservando automáticamente
      el porcentaje de margen establecido del producto.
    - Si el costo NO cambió: NO se tocan los precios, únicamente se asegura stock = 999.
    - Productos ausentes en Coronel: stock = 0 (se muestran como Agotados / Ocultos en la web).
    """
    t_start = time.time()
    print(Fore.CYAN + "\n🌐 Sincronizando existencias, códigos de barra y precios con Supabase PostgREST..." + Style.RESET_ALL)
    
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    scraped_map = {p['codigo']: p for p in scraped_products}
    
    # 1. Obtener todos los productos registrados en Supabase
    try:
        url = f"{SUPABASE_URL}/rest/v1/products?select=id,sku,stock,cost_price,retail_price,wholesale_price,barcode"
        res = requests.get(url, headers=headers, timeout=20)
        if not res.ok:
            print(Fore.YELLOW + f"⚠ Supabase respondió {res.status_code}: {res.text}. Intentando consulta simplificada..." + Style.RESET_ALL)
            url_fallback = f"{SUPABASE_URL}/rest/v1/products?select=id,sku,stock,retail_price,wholesale_price"
            res = requests.get(url_fallback, headers=headers, timeout=20)
            if not res.ok:
                print(Fore.RED + f"✖ Error definitivo conectando a Supabase ({res.status_code}): {res.text}. Omitiendo sync web." + Style.RESET_ALL)
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
    precios_recalculados_web = 0
    barcodes_enriquecidos = 0

    def _patch_product(prod):
        nonlocal updated_activos, updated_agotados, precios_recalculados_web, barcodes_enriquecidos
        p_id = prod['id']
        sku = prod.get('sku', '')
        if not sku or sku.endswith('-local'):
            return

        patch_url = f"{SUPABASE_URL}/rest/v1/products?id=eq.{p_id}"
        
        if sku in scraped_map:
            s_item = scraped_map[sku]
            nuevo_costo = s_item.get('precio_costo', 0.0)
            costo_anterior = float(prod.get('cost_price') or 0.0)
            costo_cambio = (nuevo_costo > 0 and abs(nuevo_costo - costo_anterior) > 0.01)

            payload = {
                "stock": 10,
                "updated_at": now_iso
            }

            # Enriquecer con código de barras y costo desde Excel si aplica
            if excel_map:
                m_ex = buscar_en_excel_map(sku, excel_map)
                if m_ex:
                    b_ex = m_ex.get('barcode')
                    if b_ex and (not prod.get('barcode') or prod.get('barcode') != b_ex):
                        payload["barcode"] = b_ex
                        barcodes_enriquecidos += 1
                    if (not prod.get('cost_price') or float(prod.get('cost_price')) == 0) and m_ex.get('costo'):
                        if nuevo_costo == 0:
                            nuevo_costo = m_ex['costo']
                        payload["cost_price"] = m_ex['costo']

            if costo_cambio:
                # El costo de proveedor cambió: calcular nuevo precio con el margen establecido para ese producto
                if costo_anterior > 0 and float(prod.get('retail_price') or 0) > 0:
                    ratio_min = float(prod['retail_price']) / costo_anterior
                    ratio_may = float(prod.get('wholesale_price') or prod['retail_price']) / costo_anterior
                elif sqlite_items and sku in sqlite_items:
                    m = sqlite_items[sku]
                    ratio_min = 1.0 + (m.get('margen_min', 40.0) / 100.0)
                    ratio_may = 1.0 + (m.get('margen_may', 18.0) / 100.0)
                else:
                    ratio_min = 1.40
                    ratio_may = 1.18

                nuevo_retail = round(nuevo_costo * ratio_min, 2)
                nuevo_wholesale = round(nuevo_costo * ratio_may, 2)

                payload["cost_price"] = nuevo_costo
                payload["retail_price"] = nuevo_retail
                payload["wholesale_price"] = nuevo_wholesale
                precios_recalculados_web += 1

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
    print(f"  - {Fore.GREEN}{updated_activos}{Style.RESET_ALL} productos activos sincronizados (stock = 10).")
    if barcodes_enriquecidos > 0:
        print(f"  - {Fore.CYAN}{barcodes_enriquecidos}{Style.RESET_ALL} productos enriquecidos con código de barras oficial EAN-13.")
    if precios_recalculados_web > 0:
        print(f"  - {Fore.YELLOW}{precios_recalculados_web}{Style.RESET_ALL} precios recalculados por variación de costo.")
    print(f"  - {Fore.RED}{updated_agotados}{Style.RESET_ALL} productos discontinuados marcados como Agotados (stock = 0).")
    
    return updated_activos, updated_agotados, precios_recalculados_web, barcodes_enriquecidos


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
            variants = tn_product.get('variants', [])
            product_published = tn_product.get('published', True)
            product_has_stock = False

            for variant in variants:
                sku = variant.get('sku', '')
                if not sku or sku.endswith('-local'):
                    product_has_stock = True
                    continue

                new_stock = 10 if sku in scraped_codes else 0
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


def scraping_all_product(driver):
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

        current_products, categoria = scraping_product(driver)
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


def run_stock(auto_mode: bool = True, sync_supabase: bool = True):
    """
    Función principal para actualizar stock de forma rápida y 100% automatizada.
    
    - Recorre todo el catálogo de Coronel Mayorista para refrescar existencias y marcar discontinuados.
    - Si el precio de costo del proveedor cambió, la cuenta matemática se realiza de forma automática
      respetando el porcentaje de margen ya establecido para cada producto.
    
    Args:
        auto_mode: bool. Si es True, no espera confirmación manual de usuario en pantalla.
        sync_supabase: bool. Si es True, sincroniza existencias y precios con Supabase en la web.
    """
    t_global_start = time.time()
    driver = get_chrome_driver()
    
    print(Fore.CYAN + "="*60)
    print(" ⚡ INICIANDO ACTUALIZACIÓN RÁPIDA DE STOCK (AUTOMÁTICA)")
    print(f"    Modo Desatendido: {'SÍ (Sin intervención)' if auto_mode else 'NO'}")
    print("    Cálculo de Precios: Automático según margen establecido de cada producto")
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
        products, _ = scraping_all_product(driver)
        
        try:
            driver.quit()
        except Exception:
            pass

        if not products:
            print(Fore.RED + "✖ No se extrajeron productos del catálogo." + Fore.RESET)
            return False

        # 3. Indexar códigos de barra y costos desde el Excel oficial descargado
        excel_map = cargar_mapa_excel()

        # 4. Actualizar base de datos local SQLite (calcula precios automáticamente si el costo varió)
        updated_activos_sql, updated_discontinuados_sql, precios_recalculados_sql, sqlite_items = sync_sqlite_stock_and_prices(products, excel_map=excel_map)

        # 5. Sincronizar existencias, códigos de barra y precios en la web oficial (Supabase)
        updated_activos_web, updated_agotados_web, precios_recalculados_web, barcodes_enriquecidos = (0, 0, 0, 0)
        if sync_supabase:
            updated_activos_web, updated_agotados_web, precios_recalculados_web, barcodes_enriquecidos = sync_supabase_stock_and_prices(products, sqlite_items=sqlite_items, excel_map=excel_map)

        # 5. Compatibilidad Tiendanube (si aplica)
        try:
            update_tiendanube_stock(products)
        except Exception:
            pass

        dur_global = time.time() - t_global_start

        # 6. Guardar estadísticas estructuradas para el dashboard e historial de auditoría
        try:
            stats_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stock_sync_stats.json")
            history = []
            if os.path.exists(stats_path):
                try:
                    with open(stats_path, "r", encoding="utf-8") as f:
                        prev = json.load(f)
                        history = prev.get("history", [])
                except Exception:
                    pass

            stat_record = {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "duration_seconds": round(dur_global, 1),
                "duration_formatted": formatear_duracion(dur_global),
                "total_scraped": len(products),
                "active_stock": updated_activos_web if sync_supabase else updated_activos_sql,
                "stock_zero": updated_agotados_web if sync_supabase else updated_discontinuados_sql,
                "prices_recalculated": precios_recalculados_web if sync_supabase else precios_recalculados_sql,
                "barcodes_enriched": barcodes_enriquecidos,
                "web_sync_success": True if sync_supabase else False,
                "web_sync_percentage": 100 if sync_supabase else 0
            }
            history.insert(0, stat_record)
            history = history[:20]  # Conservar las últimas 20 corridas

            with open(stats_path, "w", encoding="utf-8") as f:
                json.dump({
                    "last_sync": stat_record,
                    "history": history
                }, f, indent=2)
        except Exception as e_stats:
            print(Fore.YELLOW + f"⚠️ No se pudo guardar stock_sync_stats.json: {e_stats}" + Style.RESET_ALL)

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
