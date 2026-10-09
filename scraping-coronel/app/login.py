from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from selenium.common.exceptions import TimeoutException
import time
from colorama import Fore
try:
    from tkinter import Tk, Button, Label
except ImportError:
    Tk = None
    Button = None
    Label = None

import threading
import os
import shutil
from datetime import datetime

try:
    from config import CORONEL_CUIT, CORONEL_PASSWORD
except ImportError:
    import sys
    from pathlib import Path
    sys.path.append(str(Path(__file__).parent.parent.resolve()))
    from config import CORONEL_CUIT, CORONEL_PASSWORD

# Variable global para controlar el estado del botón
button_clicked = False

def create_floating_button():
    global button_clicked
    if Tk is None:
        return
    try:
        root = Tk()
        root.title("Control de Scraping")
        root.overrideredirect(True)
        root.attributes('-topmost', True)
        
        def on_click():
            global button_clicked
            button_clicked = True
            root.destroy()
        
        btn = Button(root, text="CONTINUAR SCRAPING", 
                    bg="#4CAF50", fg="white",
                    font=('Arial', 12, 'bold'),
                    padx=25, pady=15,
                    command=on_click)
        btn.pack()
        
        # Posicionamiento
        root.geometry("220x70+20+{}".format(root.winfo_screenheight()-120))
        root.mainloop()
    except Exception:
        pass

def descargar_lista_precios(driver, download_dir):
    """
    Navega a la página de lista de precios y descarga el Excel
    """
    try:
        wait = WebDriverWait(driver, 15)
        
        # 1. Navegar a la página de lista de precios
        driver.get('https://coronelmayorista.com.ar/#/usuario/listaPrecios')

        # 2. Esperar y hacer click en el botón Exportar
        export_button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(@class, 'btn-exportar')]")
        ))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", export_button)
        time.sleep(0.5)
        try:
            export_button.click()
        except Exception:
            driver.execute_script("arguments[0].click();", export_button)
        
        time.sleep(3)
        
        # 3. Esperar y hacer click en la opción Excel
        excel_option = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[@mat-menu-item]//span[contains(text(), 'Excel')]/..")
        ))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", excel_option)
        time.sleep(0.5)
        try:
            excel_option.click()
        except Exception:
            driver.execute_script("arguments[0].click();", excel_option)
        
        time.sleep(5)  # Dar tiempo para que se complete la descarga
        
        # 4. Esperar a que se descargue el archivo
        
        # 5. Buscar el archivo descargado en la carpeta de destino o en Downloads de usuario como fallback
        files = [f for f in os.listdir(download_dir) if "Lista de Precios" in f]
        latest_file = None
        
        if files:
            latest_file = max([os.path.join(download_dir, f) for f in files], key=os.path.getctime)
        else:
            # Fallback: buscar en la carpeta de descargas del usuario por si Chrome ignoró la preferencia
            downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
            try:
                files_fallback = [f for f in os.listdir(downloads_folder) if "Lista de Precios" in f]
                if files_fallback:
                    latest_file = max([os.path.join(downloads_folder, f) for f in files_fallback], key=os.path.getctime)
            except Exception:
                pass
                
        if latest_file:
            # Crear nombre de archivo con timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            new_filename = f"lista_precios_{timestamp}.xlsx"
            new_path = os.path.join(download_dir, new_filename)
            
            # Renombrar si está en el mismo directorio, mover si viene de descargas
            if os.path.dirname(os.path.normpath(latest_file)) == os.path.normpath(download_dir):
                os.rename(latest_file, new_path)
            else:
                shutil.move(latest_file, new_path)
            return True
        else:
            print(Fore.RED + "✖ No se encontró el archivo descargado" + Fore.RESET)
            return False
            
    except Exception as e:
        print(Fore.RED + f"❌ Error descargando lista de precios: {str(e)}" + Fore.RESET)
        return False

def login(driver, show_button=True):
    """
    Versión optimizada del login para Coronel Mayotista que:
    - Usa CUIT y password (no email)
    - Reemplaza time.sleep() con esperas inteligentes
    - Incluye verificación de login exitoso
    - Descarga automáticamente la lista de precios
    
    Args:
        driver: WebDriver instance
        show_button: bool, opcional. Si es True muestra el botón flotante para continuar, si es False omite este paso
    """
    global button_clicked
    button_clicked = False
    try:
        print(Fore.YELLOW + "\nIniciando proceso de login..." + Fore.RESET)
        
        # 1. Navegar a página de login
        login_url = 'https://coronelmayorista.com.ar/#/sign-in'
        print(f"Navegando a {login_url}...", flush=True)
        driver.get(login_url)
        
        wait = WebDriverWait(driver, 20)
        
        # 2. Ingresar CUIT
        cuit_field = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, 'input[formcontrolname="usuarioCuit"]')
        ))
        cuit_field.clear()
        cuit_field.send_keys(CORONEL_CUIT)
        
        # 3. Ingresar contraseña
        password_field = wait.until(EC.element_to_be_clickable(
            (By.CSS_SELECTOR, 'input[formcontrolname="usuarioPassword"]')
        ))
        password_field.clear()
        password_field.send_keys(CORONEL_PASSWORD)
        
        # 4. Click en Ingresar (scrolling al centro y click nativo con fallback)
        login_button = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, 'button.btnIngresar')
        ))
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", login_button)
        time.sleep(0.5)
        try:
            login_button.click()
        except Exception:
            driver.execute_script("arguments[0].click();", login_button)
        
        # 5. Verificación positiva de login exitoso
        wait.until(EC.url_contains('/#/home'))
        
        # Verificar presencia del elemento de usuario
        try:
            wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'li.nav-item.nav-usuario')))
            print(Fore.GREEN + "✔ Login exitoso" + Fore.RESET)
            
            # 6. Descargar lista de precios
            # Crear carpeta productos_coronel si no existe
            download_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'productos_coronel')
            os.makedirs(download_dir, exist_ok=True)
            
            if descargar_lista_precios(driver, download_dir):
                print(Fore.GREEN + "✔ Lista de precios descargada exitosamente" + Fore.RESET)
            else:
                print(Fore.RED + "✖ Error descargando lista de precios" + Fore.RESET)
                
            
            
            # 7. Continuar con el proceso normal
            print("[SCRAPER_STATUS:READY_FOR_SELECTION]", flush=True)
            driver.get('https://coronelmayorista.com.ar/#/home')
            
            # Directorios base para preview y señal
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            signal_file = os.path.join(base_dir, ".scraper_continue")
            preview_file = os.path.join(base_dir, "preview.png")

            # Limpiar señales previas si existían
            if os.path.exists(signal_file):
                try:
                    os.remove(signal_file)
                except Exception:
                    pass

            # Captura inicial de la pantalla para el Dashboard
            try:
                driver.save_screenshot(preview_file)
            except Exception:
                pass
            
            if show_button:
                print(Fore.YELLOW + "⚠ Navega a la categoría deseada y haz click en 'Continuar Scraping' en el Dashboard" + Fore.RESET, flush=True)
                print("[SCRAPER_STATUS:WAITING_USER_SELECTION]", flush=True)
                
                # Crear y ejecutar el botón Tkinter si está disponible en el entorno
                if Tk is not None:
                    try:
                        threading.Thread(target=create_floating_button, daemon=True).start()
                    except Exception:
                        pass
                
                # Esperar activamente por Tkinter o por la señal web del Dashboard
                loop_counter = 0
                while not button_clicked:
                    # Chequear si el Dashboard emitió la señal
                    if os.path.exists(signal_file):
                        button_clicked = True
                        try:
                            os.remove(signal_file)
                        except Exception:
                            pass
                        print(Fore.GREEN + "✔ Señal recibida desde el Dashboard: Continuando Scraping..." + Fore.RESET, flush=True)
                        break

                    # Actualizar captura de pantalla cada 1.5 segundos
                    loop_counter += 1
                    if loop_counter % 15 == 0:
                        try:
                            driver.save_screenshot(preview_file)
                        except Exception:
                            pass

                    time.sleep(0.1)
                
                # Actualizar screenshot al continuar
                try:
                    driver.save_screenshot(preview_file)
                except Exception:
                    pass
                print("[SCRAPER_STATUS:SCRAPING]", flush=True)
            
        except TimeoutException:
            print(Fore.RED + "✖ Error: No se ha iniciado sesión" + Fore.RESET)
            raise
        
        return True
        
    except Exception as e:
        print(Fore.RED + f"❌ Error inesperado: {type(e).__name__} - {str(e)}" + Fore.RESET)
        try:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            driver.save_screenshot(os.path.join(base_dir, "preview.png"))
        except Exception:
            pass
        return False