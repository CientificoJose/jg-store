import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';

export type ScraperStatus =
  | 'IDLE'
  | 'STARTING'
  | 'LOGGING_IN'
  | 'DOWNLOADING_PRICES'
  | 'WAITING_USER_SELECTION'
  | 'SCRAPING'
  | 'COMPLETED'
  | 'FAILED';

export interface ScraperEvent {
  type: 'log' | 'status' | 'preview_updated' | 'error';
  data?: any;
  text?: string;
  timestamp: string;
}

class ScraperProcessManager {
  private activeProcess: ChildProcess | null = null;
  private status: ScraperStatus = 'IDLE';
  private logs: string[] = [];
  private listeners: Set<(event: ScraperEvent) => void> = new Set();
  private baseDir: string;
  private pythonPath: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'scraping-coronel');
    // Usar variable de entorno si se especifica, o python3 del sistema
    this.pythonPath = process.env.PYTHON_BIN || 'python3';
  }

  public getStatus() {
    return {
      status: this.status,
      isRunning: this.activeProcess !== null,
      pid: this.activeProcess?.pid,
      waitingUser: this.status === 'WAITING_USER_SELECTION',
      logCount: this.logs.length
    };
  }

  public getLogs() {
    return [...this.logs];
  }

  public subscribe(listener: (event: ScraperEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private broadcast(event: ScraperEvent) {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error enviando evento a listener:', err);
      }
    }
  }

  private setStatus(newStatus: ScraperStatus) {
    this.status = newStatus;
    this.broadcast({
      type: 'status',
      data: { status: newStatus, waitingUser: newStatus === 'WAITING_USER_SELECTION' },
      timestamp: new Date().toISOString()
    });
  }

  public addLog(text: string) {
    this.logs.push(text);
    if (this.logs.length > 800) {
      this.logs.shift();
    }
    this.broadcast({
      type: 'log',
      text,
      timestamp: new Date().toISOString()
    });
  }

  public clearLogs() {
    this.logs = [];
  }

  public startScraper(options: { ganancia?: number; downloadImages?: boolean } = {}) {
    if (this.activeProcess) {
      throw new Error('El scraper ya se encuentra en ejecución.');
    }

    const { ganancia = 40, downloadImages = false } = options;
    const downloadFlag = downloadImages ? 't' : 'f';

    this.setStatus('STARTING');
    this.addLog(`🚀 [SISTEMA] Iniciando Scraper de Coronel Mayorista...`);
    this.addLog(`⚙️ [CONFIG] Ganancia: ${ganancia}%, Descargar fotos a disco: ${downloadFlag}`);

    const scriptPath = path.join(this.baseDir, 'main.py');
    const args = ['main.py', 'scrape', '-y', '-g', String(ganancia), '-d', downloadFlag];

    // Limpiar señal anterior
    const signalFile = path.join(this.baseDir, '.scraper_continue');
    if (fs.existsSync(signalFile)) {
      try {
        fs.unlinkSync(signalFile);
      } catch {}
    }

    try {
      this.activeProcess = spawn(this.pythonPath, args, {
        cwd: this.baseDir,
        env: {
          ...process.env,
          PYTHONUNBUFFERED: '1',
          PYTHONIOENCODING: 'utf-8'
        }
      });

      this.setStatus('LOGGING_IN');

      this.activeProcess.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString('utf-8').split('\n');
        for (const line of lines) {
          if (!line.trim()) continue;

          // Parsear marcadores de estado emitidos por Python
          if (line.includes('[SCRAPER_STATUS:LOGGING_IN]')) {
            this.setStatus('LOGGING_IN');
          } else if (line.includes('[SCRAPER_STATUS:DOWNLOADING_PRICES]')) {
            this.setStatus('DOWNLOADING_PRICES');
          } else if (line.includes('[SCRAPER_STATUS:WAITING_USER_SELECTION]')) {
            this.setStatus('WAITING_USER_SELECTION');
          } else if (line.includes('[SCRAPER_STATUS:SCRAPING]')) {
            this.setStatus('SCRAPING');
          } else if (line.includes('[SCRAPER_STATUS:COMPLETED]')) {
            this.setStatus('COMPLETED');
          } else if (line.includes('[SCRAPER_STATUS:FAILED]')) {
            this.setStatus('FAILED');
          }

          this.addLog(line);
        }
      });

      this.activeProcess.stderr?.on('data', (data: Buffer) => {
        const text = data.toString('utf-8');
        // Ignorar warnings normales de Selenium/urllib
        if (text.includes('UserWarning') || text.includes('DevTools listening')) {
          this.addLog(`ℹ️ ${text.trim()}`);
        } else {
          this.addLog(`⚠️ ${text.trim()}`);
        }
      });

      this.activeProcess.on('close', (code) => {
        const isSuccess = code === 0;
        this.addLog(`🏁 [SISTEMA] Proceso terminado con código de salida: ${code}`);
        this.setStatus(isSuccess ? 'COMPLETED' : 'FAILED');
        this.activeProcess = null;
      });

      this.activeProcess.on('error', (err) => {
        this.addLog(`🚨 [ERROR CRÍTICO] Falló al lanzar el proceso: ${err.message}`);
        this.setStatus('FAILED');
        this.activeProcess = null;
      });

      return { success: true, pid: this.activeProcess.pid };
    } catch (error: any) {
      this.setStatus('FAILED');
      this.activeProcess = null;
      throw error;
    }
  }

  public continueScraper() {
    if (!this.activeProcess) {
      throw new Error('No hay ningún proceso activo.');
    }

    const signalFile = path.join(this.baseDir, '.scraper_continue');
    fs.writeFileSync(signalFile, 'continue');
    this.addLog(`👉 [USUARIO] Señal 'CONTINUAR SCRAPING' enviada desde el Dashboard.`);
    return { success: true, message: 'Señal enviada a Python' };
  }

  public stopScraper() {
    if (!this.activeProcess) {
      return { success: true, message: 'No había proceso activo.' };
    }

    this.addLog(`🛑 [USUARIO] Solicitud de cancelación del proceso.`);
    try {
      this.activeProcess.kill('SIGINT');
      setTimeout(() => {
        if (this.activeProcess) {
          this.activeProcess.kill('SIGKILL');
          this.activeProcess = null;
        }
      }, 2000);
    } catch (e: any) {
      this.addLog(`Error al matar proceso: ${e.message}`);
    }

    this.setStatus('IDLE');
    return { success: true, message: 'Proceso detenido' };
  }
}

// Singleton en globalThis para Next.js
const globalForScraper = globalThis as unknown as { scraperManager?: ScraperProcessManager };
export const scraperManager = globalForScraper.scraperManager ?? new ScraperProcessManager();
if (process.env.NODE_ENV !== 'production') globalForScraper.scraperManager = scraperManager;
