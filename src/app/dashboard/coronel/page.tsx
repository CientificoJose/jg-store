'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

interface ScraperStatusData {
  status:
    | 'IDLE'
    | 'STARTING'
    | 'LOGGING_IN'
    | 'DOWNLOADING_PRICES'
    | 'WAITING_USER_SELECTION'
    | 'SCRAPING'
    | 'COMPLETED'
    | 'FAILED';
  isRunning: boolean;
  pid?: number;
  waitingUser: boolean;
  logCount: number;
}

interface DbStats {
  total_products: number;
  categories: { name: string; count: number }[];
  latest_products: any[];
  last_modified?: number;
  db_size_kb?: number;
  exists: boolean;
}

export default function CoronelScraperPage() {
  // Estado del proceso
  const [status, setStatus] = useState<ScraperStatusData['status']>('IDLE');
  const [isRunning, setIsRunning] = useState(false);
  const [waitingUser, setWaitingUser] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [ganancia, setGanancia] = useState(40);
  const [downloadImages, setDownloadImages] = useState(false);

  // Vista previa de navegador
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
  const [previewLoading, setPreviewLoading] = useState(false);

  // Modo de visualización remota (noVNC interactivo vs Captura)
  const [viewMode, setViewMode] = useState<'vnc' | 'image'>('vnc');
  const [vncHost, setVncHost] = useState<string>('https://coronel.press-cloud.com');
  const [vncKey, setVncKey] = useState<number>(Date.now());
  const [showVncConfig, setShowVncConfig] = useState(false);

  // Estadísticas de SQLite
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll en la terminal
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Cargar estadísticas de la base de datos
  const fetchDbStats = async () => {
    setLoadingDb(true);
    try {
      const res = await fetch('/api/scraper/products');
      if (res.ok) {
        const data = await res.json();
        setDbStats(data);
      }
    } catch (err) {
      console.error('Error obteniendo stats de DB:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbStats();
  }, []);

  // Conectar a Server-Sent Events (SSE) para logs en vivo
  useEffect(() => {
    const sse = new EventSource('/api/scraper/stream');
    eventSourceRef.current = sse;

    sse.addEventListener('status', (e) => {
      try {
        const data: ScraperStatusData = JSON.parse(e.data);
        setStatus(data.status);
        setIsRunning(data.isRunning);
        setWaitingUser(data.waitingUser);
        // Si se completó, refrescar la BD
        if (data.status === 'COMPLETED') {
          fetchDbStats();
          toast.success('¡Scraping finalizado con éxito!');
        }
      } catch (err) {
        console.error('Error parseando evento status:', err);
      }
    });

    sse.addEventListener('log', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.text) {
          setLogs((prev) => [...prev, data.text]);
          // Forzar refresco del preview si el log indica nueva página o espera
          if (data.text.includes('SCRAPER_STATUS') || data.text.includes('Procesando página')) {
            setPreviewTimestamp(Date.now());
          }
        }
      } catch (err) {
        console.error('Error parseando evento log:', err);
      }
    });

    sse.onerror = () => {
      // Reconexión automática
    };

    return () => {
      sse.close();
    };
  }, []);

  // Refrescar periódicamente la vista previa mientras esté activo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setPreviewTimestamp(Date.now());
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Iniciar Scraping
  const handleStartScraper = async () => {
    try {
      const res = await fetch('/api/scraper/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ganancia, downloadImages })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error iniciando scraper');
      }

      toast.success('Proceso de scraping iniciado');
      setIsRunning(true);
      setStatus('STARTING');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar el proceso');
    }
  };

  // Continuar Scraping (Señal al usuario)
  const handleContinue = async () => {
    try {
      const res = await fetch('/api/scraper/continue', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar señal');

      setWaitingUser(false);
      setStatus('SCRAPING');
      toast.success('Señal enviada a Chrome: Continuando con la extracción de productos');
    } catch (err: any) {
      toast.error(err.message || 'No se pudo enviar la señal');
    }
  };

  // Detener proceso
  const handleStop = async () => {
    try {
      const res = await fetch('/api/scraper/stop', { method: 'POST' });
      if (res.ok) {
        toast.info('Se solicitó detener el scraper');
        setIsRunning(false);
        setWaitingUser(false);
        setStatus('IDLE');
      }
    } catch (err) {
      toast.error('Error deteniendo el proceso');
    }
  };

  // Limpiar terminal
  const handleClearLogs = () => {
    setLogs([]);
    toast.info('Terminal limpiada');
  };

  // Copiar logs
  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    toast.success('Logs copiados al portapapeles');
  };

  return (
    <div className='flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto font-gotham'>
      {/* Encabezado */}
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border'>
        <div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider mb-1'>
            <span>Dashboard</span>
            <span>/</span>
            <span className='text-foreground font-semibold'>Scraper Coronel</span>
          </div>
          <h1 className='text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5'>
            <span className='p-2 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20'>
              <Icons.terminal className='w-6 h-6' />
            </span>
            EXTRACCIÓN & SCRAPING - CORONEL MAYORISTA
          </h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Control de automatización en tiempo real, vista previa del navegador y persistencia
            local en SQLite.
          </p>
        </div>

        {/* Badge de estado en tiempo real */}
        <div className='flex items-center gap-3'>
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border shadow-xs ${
              status === 'WAITING_USER_SELECTION'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                : isRunning
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : status === 'COMPLETED'
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                    : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                status === 'WAITING_USER_SELECTION'
                  ? 'bg-emerald-400 animate-ping'
                  : isRunning
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-muted-foreground'
              }`}
            />
            <span>
              {status === 'IDLE' && 'Inactivo'}
              {status === 'STARTING' && 'Iniciando navegador...'}
              {status === 'LOGGING_IN' && 'Iniciando sesión en Coronel...'}
              {status === 'DOWNLOADING_PRICES' && 'Descargando lista Excel...'}
              {status === 'WAITING_USER_SELECTION' && 'Esperando categoría en Chrome'}
              {status === 'SCRAPING' && 'Extrayendo productos...'}
              {status === 'COMPLETED' && 'Completado'}
              {status === 'FAILED' && 'Error en proceso'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Controles y Parámetros */}
      <div className='p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-4'>
        <div className='flex flex-wrap items-center gap-4'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>Margen Ganancia:</span>
            <div className='flex items-center gap-1 bg-background border border-border px-2.5 py-1 rounded-lg'>
              <input
                type='number'
                min='0'
                max='200'
                value={ganancia}
                onChange={(e) => setGanancia(Number(e.target.value))}
                disabled={isRunning}
                className='w-12 bg-transparent text-foreground text-sm font-bold text-center outline-none'
              />
              <span className='text-muted-foreground font-semibold'>%</span>
            </div>
          </div>

          <label className='flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none'>
            <input
              type='checkbox'
              checked={downloadImages}
              onChange={(e) => setDownloadImages(e.target.checked)}
              disabled={isRunning}
              className='rounded border-border text-[#E63946] focus:ring-[#E63946]'
            />
            <span>Descargar fotos a disco</span>
          </label>
        </div>

        {/* Botonera de Acción */}
        <div className='flex items-center gap-3'>
          {/* Botón Principal: CONTINUAR SCRAPING (Activado cuando espera selección) */}
          <button
            onClick={handleContinue}
            disabled={!waitingUser}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
              waitingUser
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/25 animate-bounce ring-4 ring-emerald-500/30'
                : 'bg-muted text-muted-foreground opacity-50 cursor-not-allowed'
            }`}
          >
            <Icons.check className='w-4 h-4' />
            <span>CONTINUAR SCRAPING</span>
          </button>

          {!isRunning ? (
            <button
              onClick={handleStartScraper}
              className='px-5 py-2.5 rounded-xl font-bold text-sm bg-[#E63946] hover:bg-[#c92a37] text-white shadow-md shadow-[#E63946]/20 transition-all flex items-center gap-2'
            >
              <Icons.arrowRight className='w-4 h-4' />
              <span>Iniciar Scraping</span>
            </button>
          ) : (
            <button
              onClick={handleStop}
              className='px-4 py-2.5 rounded-xl font-bold text-sm bg-rose-500/15 hover:bg-rose-500/25 text-rose-500 border border-rose-500/30 transition-all flex items-center gap-2'
            >
              <Icons.close className='w-4 h-4' />
              <span>Detener</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Principal: 2 Columnas (Vista Previa vs Terminal) */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Columna Izquierda: Vista Previa del Navegador / noVNC (5 columnas) */}
        <div className='lg:col-span-5 flex flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <h2 className='text-base font-bold text-foreground flex items-center gap-2'>
                <Icons.laptop className='w-4 h-4 text-[#E63946]' />
                <span>Navegador Remoto</span>
              </h2>
              {/* Selector de Modo */}
              <div className='flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-[11px] font-medium'>
                <button
                  onClick={() => setViewMode('vnc')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    viewMode === 'vnc'
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  noVNC Interactivo
                </button>
                <button
                  onClick={() => setViewMode('image')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    viewMode === 'image'
                      ? 'bg-background text-foreground shadow-xs font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Captura
                </button>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              {viewMode === 'vnc' && (
                <>
                  <button
                    onClick={() => setVncKey(Date.now())}
                    title='Reconectar noVNC'
                    className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                  >
                    <Icons.refresh className='w-3.5 h-3.5' />
                  </button>
                  <a
                    href={`${vncHost.replace(/\/$/, '')}/vnc/vnc.html?autoconnect=true&resize=scale&reconnect=true`}
                    target='_blank'
                    rel='noopener noreferrer'
                    title='Abrir en ventana completa'
                    className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                  >
                    <Icons.externalLink className='w-3.5 h-3.5' />
                  </a>
                </>
              )}
              {viewMode === 'image' && (
                <button
                  onClick={() => setPreviewTimestamp(Date.now())}
                  className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors'
                >
                  <Icons.refresh className='w-3.5 h-3.5' />
                  <span>Actualizar</span>
                </button>
              )}
              <button
                onClick={() => setShowVncConfig(!showVncConfig)}
                title='Configurar URL del Scraper'
                className={`p-1.5 rounded-lg transition-colors ${
                  showVncConfig
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icons.settings className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          {/* Configuración desplegable de URL del Scraper Cloud */}
          {showVncConfig && (
            <div className='p-3 bg-card border border-border rounded-xl text-xs space-y-2 animate-fadeIn'>
              <div className='flex items-center justify-between'>
                <span className='font-bold text-foreground'>
                  Host del Servicio Scraper (Dokploy):
                </span>
                <span className='text-[10px] text-muted-foreground font-mono'>vnc / api</span>
              </div>
              <div className='flex items-center gap-2'>
                <input
                  type='text'
                  value={vncHost}
                  onChange={(e) => {
                    setVncHost(e.target.value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jg_scraper_vnc_host', e.target.value);
                    }
                  }}
                  placeholder='https://coronel.press-cloud.com'
                  className='flex-1 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#E63946]'
                />
                <button
                  onClick={() => setVncKey(Date.now())}
                  className='px-3 py-1.5 bg-[#E63946] text-white rounded-lg font-bold text-xs hover:bg-[#c92a37]'
                >
                  Conectar
                </button>
              </div>
              <p className='text-[11px] text-muted-foreground leading-tight'>
                Apunta a la URL pública asignada en Dokploy para ver la pantalla virtual interactiva
                de Chrome y transmitir clics remotos.
              </p>
            </div>
          )}

          <div className='relative rounded-2xl overflow-hidden border border-border bg-[#090d16] shadow-sm flex flex-col'>
            {/* Barra de Ventana del Navegador */}
            <div className='flex items-center justify-between px-3.5 py-2 bg-[#121826] border-b border-border/50 text-xs'>
              <div className='flex items-center gap-1.5'>
                <span className='w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block' />
                <span className='w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block' />
                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block' />
              </div>
              <div className='flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-black/40 text-slate-400 font-mono text-[11px] truncate max-w-[220px]'>
                <Icons.lock className='w-3 h-3 text-emerald-500 shrink-0' />
                <span>{viewMode === 'vnc' ? 'noVNC Virtual Desktop' : 'coronelmayorista.com'}</span>
              </div>
              <div className='flex items-center gap-1'>
                {isRunning && (
                  <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold tracking-wider'>
                    <span className='w-1.5 h-1.5 rounded-full bg-red-500 animate-ping' />
                    LIVE
                  </span>
                )}
                {viewMode === 'vnc' && (
                  <span className='text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium'>
                    DOM REMOTO
                  </span>
                )}
              </div>
            </div>

            {/* Contenedor Principal: noVNC o Imagen */}
            <div className='relative aspect-video w-full bg-[#070a12] flex items-center justify-center overflow-hidden min-h-[380px]'>
              {viewMode === 'vnc' ? (
                <iframe
                  key={vncKey}
                  src={`${vncHost.replace(/\/$/, '')}/vnc/vnc.html?autoconnect=true&resize=scale&reconnect=true`}
                  className='w-full h-full border-0 bg-black min-h-[380px]'
                  allow='clipboard-read; clipboard-write; autoplay'
                  title='Navegador Remoto Chrome noVNC'
                />
              ) : (
                <>
                  <img
                    key={previewTimestamp}
                    src={`/api/scraper/preview?t=${previewTimestamp}`}
                    alt='Vista previa de Chrome'
                    onLoad={() => setPreviewLoading(false)}
                    className='w-full h-full object-contain'
                  />

                  {/* Overlay cuando el scraper está esperando interacción */}
                  {waitingUser && (
                    <div className='absolute inset-0 bg-black/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fadeIn'>
                      <div className='w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-3 animate-pulse'>
                        <Icons.laptop className='w-6 h-6' />
                      </div>
                      <h3 className='text-white font-bold text-base mb-1'>
                        ¡Selecciona la Categoría en Chrome!
                      </h3>
                      <p className='text-slate-300 text-xs max-w-xs mb-4'>
                        Navega en la ventana remota o cambia al modo noVNC para hacer clic
                        directamente con tu ratón.
                      </p>
                      <button
                        onClick={handleContinue}
                        className='px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 transition-all flex items-center gap-2'
                      >
                        <Icons.check className='w-4 h-4' />
                        <span>Continuar Scraping Ahora</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pie de la vista previa */}
            <div className='p-2.5 bg-[#121826] border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400'>
              <span className='flex items-center gap-1.5'>
                <span className='w-2 h-2 rounded-full bg-emerald-400' />
                <span>
                  {viewMode === 'vnc'
                    ? 'Stream WebSockets Activo (ratón/teclado interactivo)'
                    : 'Resolución Selenium: 1280x800'}
                </span>
              </span>
              <span>Modo: {viewMode === 'vnc' ? 'noVNC HTML5' : 'Screenshot (2s)'}</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Terminal Interactiva en Vivo (7 columnas) */}
        <div className='lg:col-span-7 flex flex-col space-y-3'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold text-foreground flex items-center gap-2'>
              <Icons.terminal className='w-4 h-4 text-emerald-500' />
              <span>Consola de Terminal en Vivo</span>
            </h2>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleCopyLogs}
                className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-muted'
                title='Copiar logs'
              >
                <Icons.copy className='w-3.5 h-3.5' />
                <span>Copiar</span>
              </button>
              <button
                onClick={handleClearLogs}
                className='text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors px-2 py-1 rounded-md hover:bg-muted'
                title='Limpiar consola'
              >
                <Icons.trash className='w-3.5 h-3.5' />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className='rounded-2xl overflow-hidden border border-border bg-[#0a0d14] shadow-sm flex flex-col h-[400px]'>
            {/* Header de la Terminal */}
            <div className='flex items-center justify-between px-4 py-2.5 bg-[#10141f] border-b border-slate-800 text-xs'>
              <div className='flex items-center gap-2'>
                <span className='w-2.5 h-2.5 rounded-full bg-rose-500 inline-block' />
                <span className='w-2.5 h-2.5 rounded-full bg-amber-500 inline-block' />
                <span className='w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block' />
                <span className='text-slate-400 font-mono text-[11px] ml-2'>
                  python scraping-coronel/main.py scrape
                </span>
              </div>
              <span className='text-slate-500 text-[10px] font-mono'>{logs.length} líneas</span>
            </div>

            {/* Salida de Terminal */}
            <div className='flex-1 p-4 font-mono text-[12px] leading-relaxed text-slate-200 overflow-y-auto space-y-1'>
              {logs.length === 0 ? (
                <div className='text-slate-500 italic py-8 text-center'>
                  Consola lista. Haz clic en "Iniciar Scraping" para comenzar a recibir la salida
                  del proceso en tiempo real.
                </div>
              ) : (
                logs.map((log, index) => {
                  let colorClass = 'text-slate-300';
                  if (log.includes('✔') || log.includes('COMPLETED') || log.includes('éxito')) {
                    colorClass = 'text-emerald-400 font-medium';
                  } else if (
                    log.includes('⚠') ||
                    log.includes('WAITING') ||
                    log.includes('Aviso')
                  ) {
                    colorClass = 'text-amber-300 font-medium';
                  } else if (log.includes('✖') || log.includes('🚨') || log.includes('Error')) {
                    colorClass = 'text-rose-400 font-semibold';
                  } else if (log.includes('🚀') || log.includes('===') || log.includes('SISTEMA')) {
                    colorClass = 'text-cyan-300 font-semibold';
                  }

                  return (
                    <div key={index} className={`break-all ${colorClass}`}>
                      {log}
                    </div>
                  );
                })
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      </div>

      {/* Sección Inferior: Base de Datos SQLite (productos.db) */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-xl font-bebas tracking-wide text-foreground flex items-center gap-2'>
              <Icons.box className='w-5 h-5 text-[#E63946]' />
              BASE DE DATOS LOCAL (PRODUCTOS.DB)
            </h2>
            <p className='text-xs text-muted-foreground'>
              Catálogo extraído y almacenado en SQLite en la carpeta local de scraping.
            </p>
          </div>

          <button
            onClick={fetchDbStats}
            disabled={loadingDb}
            className='px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5'
          >
            <Icons.refresh className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
            <span>Refrescar Catálogo</span>
          </button>
        </div>

        {/* Tarjetas de Métricas de la BD */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Total de Productos
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.total_products ?? 0}
            </div>
            <span className='text-[11px] text-emerald-500'>Listos en SQLite local</span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Rubros Detectados
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.categories?.length ?? 0}
            </div>
            <span className='text-[11px] text-muted-foreground'>Categorías mayoristas</span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Tamaño Archivo .db
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.db_size_kb ? `${dbStats.db_size_kb} KB` : 'N/A'}
            </div>
            <span className='text-[11px] text-muted-foreground'>productos.db</span>
          </div>
        </div>

        {/* Tabla con los últimos productos guardados */}
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
          <div className='p-3 bg-muted/40 border-b border-border text-xs font-bold text-foreground'>
            Últimos Artículos Extraídos
          </div>

          <div className='overflow-x-auto max-h-96'>
            <table className='w-full text-xs text-left'>
              <thead className='bg-muted/60 text-muted-foreground sticky top-0 uppercase tracking-wider text-[10px]'>
                <tr>
                  <th className='px-4 py-2.5'>Foto</th>
                  <th className='px-4 py-2.5'>SKU / Código</th>
                  <th className='px-4 py-2.5'>Descripción</th>
                  <th className='px-4 py-2.5'>Precio Mayorista</th>
                  <th className='px-4 py-2.5'>Categoría</th>
                  <th className='px-4 py-2.5'>Subcategoría</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {dbStats?.latest_products && dbStats.latest_products.length > 0 ? (
                  dbStats.latest_products.map((p, idx) => (
                    <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                      <td className='px-4 py-2'>
                        {p.imagen_url ? (
                          <img
                            src={p.imagen_url}
                            alt={p.codigo}
                            className='w-9 h-9 object-cover rounded-md border border-border'
                          />
                        ) : (
                          <div className='w-9 h-9 bg-muted rounded-md flex items-center justify-center text-[10px] text-muted-foreground'>
                            N/A
                          </div>
                        )}
                      </td>
                      <td className='px-4 py-2 font-mono font-bold text-foreground'>{p.codigo}</td>
                      <td className='px-4 py-2 text-foreground font-medium max-w-xs truncate'>
                        {p.descripcion}
                      </td>
                      <td className='px-4 py-2 text-emerald-500 font-bold'>{p.precio}</td>
                      <td className='px-4 py-2 text-muted-foreground'>{p.categoria || '-'}</td>
                      <td className='px-4 py-2 text-muted-foreground'>{p.subcategoria || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='px-4 py-8 text-center text-muted-foreground'>
                      No hay productos registrados aún en la base de datos local.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
