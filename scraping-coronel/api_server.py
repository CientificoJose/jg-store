import os
import sys
import json
import sqlite3
import asyncio
import subprocess
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel

app = FastAPI(title="Coronel Scraper Cloud API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "productos.db")
SIGNAL_FILE = os.path.join(BASE_DIR, ".scraper_continue")

class ProcessState:
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.status: str = "IDLE"
        self.logs: List[str] = []
        self.listeners: List[asyncio.Queue] = []
        self.waiting_user: bool = False

    def add_log(self, text: str):
        self.logs.append(text)
        if len(self.logs) > 1000:
            self.logs.pop(0)
            
        data = json.dumps({"text": text, "timestamp": datetime.now().isoformat()})
        event_str = f"event: log\ndata: {data}\n\n"
        self._notify_listeners(event_str)

    def set_status(self, new_status: str):
        self.status = new_status
        self.waiting_user = (new_status == "WAITING_USER_SELECTION")
        data = json.dumps({
            "status": new_status,
            "isRunning": self.process is not None,
            "waitingUser": self.waiting_user,
            "timestamp": datetime.now().isoformat()
        })
        event_str = f"event: status\ndata: {data}\n\n"
        self._notify_listeners(event_str)

    def _notify_listeners(self, payload: str):
        for q in list(self.listeners):
            try:
                q.put_nowait(payload)
            except Exception:
                pass

state = ProcessState()

class StartScraperRequest(BaseModel):
    ganancia: int = 40
    download_images: bool = False

@app.get("/health")
def health():
    return {"status": "ok", "service": "coronel-scraper"}

@app.get("/api/status")
def get_status():
    return {
        "status": state.status,
        "isRunning": state.process is not None and state.process.poll() is None,
        "pid": state.process.pid if state.process and state.process.poll() is None else None,
        "waitingUser": state.waiting_user,
        "logCount": len(state.logs)
    }

def monitor_process(proc: subprocess.Popen):
    try:
        for line in iter(proc.stdout.readline, ''):
            if not line:
                break
            cleaned = line.rstrip('\r\n')
            if not cleaned:
                continue

            # Parsear estados emitidos
            if "[SCRAPER_STATUS:LOGGING_IN]" in cleaned:
                state.set_status("LOGGING_IN")
            elif "[SCRAPER_STATUS:DOWNLOADING_PRICES]" in cleaned:
                state.set_status("DOWNLOADING_PRICES")
            elif "[SCRAPER_STATUS:WAITING_USER_SELECTION]" in cleaned:
                state.set_status("WAITING_USER_SELECTION")
            elif "[SCRAPER_STATUS:SCRAPING]" in cleaned:
                state.set_status("SCRAPING")
            elif "[SCRAPER_STATUS:COMPLETED]" in cleaned:
                state.set_status("COMPLETED")
            elif "[SCRAPER_STATUS:FAILED]" in cleaned:
                state.set_status("FAILED")

            state.add_log(cleaned)

        proc.wait()
        is_success = (proc.returncode == 0)
        state.add_log(f"🏁 [SISTEMA] Proceso finalizado con código: {proc.returncode}")
        state.set_status("COMPLETED" if is_success else "FAILED")
    except Exception as e:
        state.add_log(f"🚨 [ERROR PROCESO] {str(e)}")
        state.set_status("FAILED")
    finally:
        state.process = None

@app.post("/api/start")
def start_scraper(req: StartScraperRequest, background_tasks: BackgroundTasks):
    if state.process and state.process.poll() is None:
        raise HTTPException(status_code=400, detail="El scraper ya está en ejecución.")

    download_flag = "t" if req.download_images else "f"
    
    # Limpiar señal previa
    if os.path.exists(SIGNAL_FILE):
        try:
            os.remove(SIGNAL_FILE)
        except Exception:
            pass

    cmd = [
        sys.executable,
        os.path.join(BASE_DIR, "main.py"),
        "scrape",
        "-y",
        "-g", str(req.ganancia),
        "-d", download_flag
    ]

    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"
    env["PYTHONIOENCODING"] = "utf-8"
    if "DISPLAY" not in env:
        env["DISPLAY"] = ":99"

    state.logs.clear()
    state.set_status("STARTING")
    state.add_log(f"🚀 [SISTEMA CLOUD] Iniciando scraper en display {env.get('DISPLAY')}...")
    state.add_log(f"⚙️ [CONFIG] Margen: {req.ganancia}%, Descargar imágenes: {download_flag}")

    proc = subprocess.Popen(
        cmd,
        cwd=BASE_DIR,
        env=env,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    state.process = proc
    state.set_status("LOGGING_IN")

    import threading
    t = threading.Thread(target=monitor_process, args=(proc,), daemon=True)
    t.start()

    return {
        "success": True,
        "pid": proc.pid,
        "message": "Scraper iniciado en el servidor."
    }

@app.post("/api/continue")
def continue_scraping():
    try:
        with open(SIGNAL_FILE, "w") as f:
            f.write("continue\n")
        state.add_log("▶️ [USUARIO] Señal de continuación enviada desde el Dashboard.")
        state.set_status("SCRAPING")
        return {"success": True, "message": "Señal emitida correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"No se pudo enviar la señal: {str(e)}")

@app.post("/api/stop")
def stop_scraper():
    if not state.process or state.process.poll() is not None:
        return {"success": True, "message": "No hay procesos activos."}

    try:
        state.process.terminate()
        state.add_log("🛑 [SISTEMA] Solicitud de detención del proceso.")
        state.set_status("IDLE")
        return {"success": True, "message": "Proceso detenido."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al detener: {str(e)}")

@app.get("/api/stream")
async def sse_stream():
    queue = asyncio.Queue()
    state.listeners.append(queue)

    async def event_generator():
        try:
            # Enviar estado actual
            curr_status = json.dumps({
                "status": state.status,
                "isRunning": state.process is not None and state.process.poll() is None,
                "waitingUser": state.waiting_user,
                "logCount": len(state.logs)
            })
            yield f"event: status\ndata: {curr_status}\n\n"

            # Enviar últimos logs
            for log in state.logs[-50:]:
                d = json.dumps({"text": log, "timestamp": datetime.now().isoformat()})
                yield f"event: log\ndata: {d}\n\n"

            while True:
                try:
                    payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    yield payload
                except asyncio.TimeoutError:
                    yield ": heartbeat\n\n"
        finally:
            if queue in state.listeners:
                state.listeners.remove(queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

@app.get("/api/products")
def get_products():
    if not os.path.exists(DB_PATH):
        return {
            "total_products": 0,
            "categories": [],
            "latest_products": [],
            "exists": False
        }

    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT count(*) as total FROM productos")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT categoria, count(*) as count FROM productos GROUP BY categoria ORDER BY count DESC")
        categories = [{"name": row["categoria"], "count": row["count"]} for row in cursor.fetchall()]

        cursor.execute("""
            SELECT codigo, codigo_barra, descripcion, categoria, 
                   precio_costo, precio_venta, porcentaje_ganancia,
                   precio_por_bulto, stock, foto, updated_at
            FROM productos
            ORDER BY id DESC
            LIMIT 100
        """)
        products = [dict(row) for row in cursor.fetchall()]
        conn.close()

        stat = os.stat(DB_PATH)
        return {
            "total_products": total,
            "categories": categories,
            "latest_products": products,
            "db_size_kb": round(stat.st_size / 1024, 2),
            "last_modified": int(stat.st_mtime * 1000),
            "exists": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error consultando base de datos: {str(e)}")
