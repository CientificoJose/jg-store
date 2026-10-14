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
    | 'STOCK_UPDATING'
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
  const [margenMayorista, setMargenMayorista] = useState(18);
  const [bulkMargenMinorista, setBulkMargenMinorista] = useState(40);
  const [bulkMargenMayorista, setBulkMargenMayorista] = useState(18);
  const [updatingMargins, setUpdatingMargins] = useState(false);
  const [downloadImages, setDownloadImages] = useState(false);

  // Estados de Migración al Catálogo Web (Supabase Dokploy)
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCategory, setMigrationCategory] = useState<string>('all');
  const [migrationRetailMargin, setMigrationRetailMargin] = useState<number>(40);
  const [migrationWholesaleMargin, setMigrationWholesaleMargin] = useState<number>(18);
  const [lastMigrationInfo, setLastMigrationInfo] = useState<{
    date: string;
    total: number;
    inserted: number;
    updated: number;
    categories: number;
  } | null>(null);
  const [scraperMode, setScraperMode] = useState<'scrape' | 'stock' | 'full-run'>('scrape');

  // Vista previa de navegador
  const [previewTimestamp, setPreviewTimestamp] = useState<number>(Date.now());
  const [previewLoading, setPreviewLoading] = useState(false);

  // Modo de visualización remota (noVNC interactivo vs Captura)
  const [viewMode, setViewMode] = useState<'vnc' | 'image'>('vnc');
  const [vncHost, setVncHost] = useState<string>('https://coronel.press-cloud.com');
  const [vncPassword, setVncPassword] = useState<string>('jgstore_vnc_2026');
  const [vncToken, setVncToken] = useState<string>('jgstore_scraper_secure_token_2026');
  const [vncKey, setVncKey] = useState<number>(Date.now());
  const [showVncConfig, setShowVncConfig] = useState(false);

  // Controles de Zoom y Pantalla Completa
  const [zoomLevel, setZoomLevel] = useState<number>(75); // 75% por defecto recomendado
  const [isFit, setIsFit] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Terminal en Vivo
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(true);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);

  // Estadísticas de SQLite
  const [dbStats, setDbStats] = useState<DbStats | null>(null);
  const [loadingDb, setLoadingDb] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll en la terminal
  useEffect(() => {
    if (autoScroll && isTerminalOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll, isTerminalOpen]);

  // Cargar credenciales guardadas si existen
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHost = localStorage.getItem('jg_scraper_vnc_host');
      if (savedHost) setVncHost(savedHost);
      const savedToken = localStorage.getItem('jg_scraper_token');
      if (savedToken) setVncToken(savedToken);
      const savedPass = localStorage.getItem('jg_scraper_vnc_password');
      if (savedPass) setVncPassword(savedPass);
    }
  }, []);

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

  // Refrescar periódicamente la vista previa si está en modo imagen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && viewMode === 'image') {
      interval = setInterval(() => {
        setPreviewTimestamp(Date.now());
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRunning, viewMode]);

  // Iniciar Scraping / Actualización según modo
  const handleStartScraper = async () => {
    try {
      const res = await fetch('/api/scraper/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: scraperMode,
          ganancia,
          margenMayorista,
          downloadImages: scraperMode === 'stock' ? false : downloadImages
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error iniciando scraper');
      }

      const modeNames = {
        scrape: 'Extracción de productos',
        stock: 'Actualización rápida de stock',
        'full-run': 'Pipeline completo (Scrape + Stock + Sync)'
      };
      toast.success(`${modeNames[scraperMode]} iniciado en el servidor`);
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

  // Recálculo masivo e instantáneo de márgenes y precios
  const handleUpdateMargins = async () => {
    setUpdatingMargins(true);
    try {
      const res = await fetch('/api/scraper/products/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          margen_minorista: Number(bulkMargenMinorista),
          margen_mayorista: Number(bulkMargenMayorista)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar márgenes');
      toast.success(
        `¡Márgenes actualizados! ${data.updated ?? 0} productos recalculados al instante.`
      );
      fetchDbStats();
    } catch (err: any) {
      toast.error(err.message || 'Error al recalcular precios masivos');
    } finally {
      setUpdatingMargins(false);
    }
  };

  // Migración masiva de productos y categorías hacia la base de datos oficial (Supabase Dokploy)
  const handleMigrateToWeb = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch('/api/scraper/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: migrationCategory === 'all' ? undefined : migrationCategory,
          default_retail_margin: Number(migrationRetailMargin),
          default_wholesale_margin: Number(migrationWholesaleMargin)
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Error durante la migración');
      }

      setLastMigrationInfo({
        date: new Date().toLocaleTimeString(),
        total: data.migrated_products,
        inserted: data.inserted_products,
        updated: data.updated_products,
        categories:
          (data.created_categories || 0) +
          (data.created_subcategories || 0) +
          (data.created_sub_subcategories || 0)
      });

      toast.success(
        `¡Publicación exitosa! ${data.inserted_products} productos nuevos y ${data.updated_products} actualizados en el catálogo oficial de JG Store.`
      );
      fetchDbStats();
    } catch (err: any) {
      toast.error(err.message || 'No se pudo completar la migración hacia la tienda online');
    } finally {
      setIsMigrating(false);
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

  // Controles de zoom
  const handleZoomIn = () => {
    setIsFit(false);
    setZoomLevel((prev) => Math.min(150, prev + 10));
  };

  const handleZoomOut = () => {
    setIsFit(false);
    setZoomLevel((prev) => Math.max(40, prev - 10));
  };

  const handleSetZoom = (level: number) => {
    setIsFit(false);
    setZoomLevel(level);
  };

  const handleSetFit = () => {
    setIsFit(true);
  };

  // URLs con autenticación de tokens y auto-escalado nativo
  const vncIframeUrl = `${vncHost.replace(
    /\/$/,
    ''
  )}/vnc/vnc_lite.html?path=websockify&autoconnect=true&scale=true&resize=scale&token=${encodeURIComponent(
    vncToken
  )}&reconnect=true`;

  const vncExternalUrl = `${vncHost.replace(
    /\/$/,
    ''
  )}/vnc/vnc.html?path=websockify&autoconnect=true&scale=true&resize=scale&token=${encodeURIComponent(
    vncToken
  )}&reconnect=true`;

  // Estilos de dimensionamiento para el visor escalable (base 1280x800, proporción 16:10)
  const getViewportStyle = () => {
    if (isFit) {
      return {
        width: '100%',
        height: '100%',
        maxWidth: '100%',
        maxHeight: '100%'
      };
    }
    const width = Math.round(1280 * (zoomLevel / 100));
    const height = Math.round(800 * (zoomLevel / 100));
    return {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: '100%',
      maxHeight: '100%',
      aspectRatio: '16 / 10',
      transition: 'width 0.15s ease, height 0.15s ease'
    };
  };

  return (
    <div className='flex-1 space-y-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto font-gotham'>
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
            Control de automatización remota, visor escalable a pantalla completa con zoom y
            persistencia local en SQLite.
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
              {status === 'STOCK_UPDATING' && 'Actualizando existencias de stock...'}
              {status === 'COMPLETED' && 'Completado'}
              {status === 'FAILED' && 'Error en proceso'}
            </span>
          </div>
        </div>
      </div>

      {/* Barra Superior de Parámetros y Acciones */}
      <div className='p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4'>
        {/* Selector de Modo de Operación */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
          <div className='flex items-center gap-2'>
            <span className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              Modo de Operación:
            </span>
            <div className='flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-medium'>
              <button
                type='button'
                onClick={() => setScraperMode('scrape')}
                disabled={isRunning}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scraperMode === 'scrape'
                    ? 'bg-background text-foreground shadow-xs font-bold border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icons.package className='w-3.5 h-3.5 text-[#E63946]' />
                <span>Extraer Catálogo</span>
              </button>

              <button
                type='button'
                onClick={() => setScraperMode('stock')}
                disabled={isRunning}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scraperMode === 'stock'
                    ? 'bg-background text-foreground shadow-xs font-bold border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icons.box className='w-3.5 h-3.5 text-amber-500' />
                <span>Solo Actualizar Stock</span>
              </button>

              <button
                type='button'
                onClick={() => setScraperMode('full-run')}
                disabled={isRunning}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  scraperMode === 'full-run'
                    ? 'bg-background text-foreground shadow-xs font-bold border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icons.refresh className='w-3.5 h-3.5 text-blue-500' />
                <span>Pipeline Completo</span>
              </button>
            </div>
          </div>

          <div className='text-xs text-muted-foreground'>
            {scraperMode === 'scrape' &&
              '⚡ Extrae productos de la categoría seleccionada con fotos y margen comercial'}
            {scraperMode === 'stock' &&
              '📦 Recorre artículos rápidamente para refrescar existencias y marcar discontinuados'}
            {scraperMode === 'full-run' &&
              '🚀 Extracción de catálogo + actualización de stock de punta a punta'}
          </div>
        </div>

        {/* Fila de Parámetros y Botonera */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-4'>
            {scraperMode !== 'stock' ? (
              <>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>Margen Detal (B2C):</span>
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

                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <span>Margen Mayor (B2B):</span>
                  <div className='flex items-center gap-1 bg-background border border-border px-2.5 py-1 rounded-lg'>
                    <input
                      type='number'
                      min='0'
                      max='200'
                      value={margenMayorista}
                      onChange={(e) => setMargenMayorista(Number(e.target.value))}
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
              </>
            ) : (
              <div className='flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg'>
                <Icons.box className='w-3.5 h-3.5' />
                <span>Modo rápido optimizado: No requiere descarga de imágenes pesadas</span>
              </div>
            )}
          </div>

          {/* Botonera de Acción */}
          <div className='flex items-center gap-3'>
            {/* Botón Principal: CONTINUAR SCRAPING */}
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
                <span>
                  {scraperMode === 'stock'
                    ? 'Iniciar Actualización de Stock'
                    : scraperMode === 'full-run'
                      ? 'Iniciar Pipeline Completo'
                      : 'Iniciar Scraping'}
                </span>
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
      </div>

      {/* MODULO PRINCIPAL: VISOR REMOTO COMPLETO (ANCHO TOTAL DEL BODY) */}
      <div
        className={`w-full transition-all duration-200 ${
          isFullscreen
            ? 'fixed inset-0 z-50 bg-[#070a12]/98 p-4 sm:p-6 flex flex-col backdrop-blur-md overflow-hidden'
            : 'space-y-3'
        }`}
      >
        {/* Barra de Herramientas del Visor: Modo, Zoom, Escala y Acciones */}
        <div className='flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-2.5 rounded-xl shadow-xs'>
          {/* Izquierda: Selector de Modo noVNC / Captura */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2 font-bold text-foreground text-sm'>
              <Icons.laptop className='w-4 h-4 text-[#E63946]' />
              <span className='hidden sm:inline'>Navegador Remoto Chrome</span>
            </div>

            <div className='flex items-center bg-muted/60 p-0.5 rounded-lg border border-border text-xs font-medium'>
              <button
                onClick={() => setViewMode('vnc')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'vnc'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                noVNC Interactivo
              </button>
              <button
                onClick={() => setViewMode('image')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  viewMode === 'image'
                    ? 'bg-background text-foreground shadow-xs font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Captura
              </button>
            </div>
          </div>

          {/* Centro: Controles de Zoom & Escala */}
          <div className='flex items-center gap-2 bg-muted/40 px-2 py-1 rounded-lg border border-border'>
            <span className='text-[11px] text-muted-foreground font-semibold hidden md:inline'>
              Escala:
            </span>

            {/* Presets de Zoom */}
            <div className='flex items-center gap-1 text-xs'>
              <button
                onClick={handleSetFit}
                title='Ajustar automáticamente al contenedor'
                className={`px-2 py-0.5 rounded transition-all font-semibold text-[11px] ${
                  isFit
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                Fit
              </button>
              <button
                onClick={() => handleSetZoom(50)}
                className={`px-2 py-0.5 rounded transition-all font-semibold text-[11px] ${
                  !isFit && zoomLevel === 50
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                50%
              </button>
              <button
                onClick={() => handleSetZoom(75)}
                title='Resolución recomendada para vista completa'
                className={`px-2.5 py-0.5 rounded transition-all font-bold text-[11px] flex items-center gap-1 ${
                  !isFit && zoomLevel === 75
                    ? 'bg-[#E63946] text-white shadow-xs ring-1 ring-[#E63946]'
                    : 'bg-background/80 text-foreground hover:text-white hover:bg-[#E63946]/80 border border-border/50'
                }`}
              >
                <span>75%</span>
                <span className='text-[9px] opacity-80'>(Ideal)</span>
              </button>
              <button
                onClick={() => handleSetZoom(100)}
                className={`px-2 py-0.5 rounded transition-all font-semibold text-[11px] ${
                  !isFit && zoomLevel === 100
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                100%
              </button>
              <button
                onClick={() => handleSetZoom(125)}
                className={`px-2 py-0.5 rounded transition-all font-semibold text-[11px] hidden sm:inline ${
                  !isFit && zoomLevel === 125
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-background/80 text-muted-foreground hover:text-foreground border border-border/50'
                }`}
              >
                125%
              </button>
            </div>

            {/* Separador */}
            <span className='w-px h-4 bg-border mx-0.5' />

            {/* Botones +/- para zoom fino */}
            <div className='flex items-center gap-1'>
              <button
                onClick={handleZoomOut}
                title='Reducir zoom (-10%)'
                className='p-1 rounded bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors'
              >
                <Icons.zoomOut className='w-3.5 h-3.5' />
              </button>
              <span className='text-[11px] font-mono font-bold text-foreground w-10 text-center'>
                {isFit ? 'Fit' : `${zoomLevel}%`}
              </span>
              <button
                onClick={handleZoomIn}
                title='Aumentar zoom (+10%)'
                className='p-1 rounded bg-background hover:bg-muted text-muted-foreground hover:text-foreground border border-border transition-colors'
              >
                <Icons.zoomIn className='w-3.5 h-3.5' />
              </button>
            </div>
          </div>

          {/* Derecha: Botones de Acción (Reconectar, Pantalla Completa, Popout, Config) */}
          <div className='flex items-center gap-1.5'>
            {viewMode === 'vnc' && (
              <>
                <button
                  onClick={() => setVncKey(Date.now())}
                  title='Reconectar noVNC'
                  className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                >
                  <Icons.refresh className='w-4 h-4' />
                </button>
                <a
                  href={vncExternalUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  title='Abrir noVNC en pestaña independiente'
                  className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
                >
                  <Icons.externalLink className='w-4 h-4' />
                </a>
              </>
            )}

            {viewMode === 'image' && (
              <button
                onClick={() => setPreviewTimestamp(Date.now())}
                title='Refrescar captura'
                className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              >
                <Icons.refresh className='w-4 h-4' />
              </button>
            )}

            {/* Alternar Pantalla Completa */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
              className='p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
            >
              {isFullscreen ? (
                <Icons.minimize className='w-4 h-4 text-[#E63946]' />
              ) : (
                <Icons.maximize className='w-4 h-4' />
              )}
            </button>

            <button
              onClick={() => setShowVncConfig(!showVncConfig)}
              title='Seguridad y Configuración de Conexión'
              className={`p-1.5 rounded-lg transition-colors ${
                showVncConfig
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icons.settings className='w-4 h-4' />
            </button>
          </div>
        </div>

        {/* Panel de Configuración de Seguridad y Host (Desplegable) */}
        {showVncConfig && (
          <div className='p-4 bg-card border border-border rounded-xl text-xs space-y-3 animate-fadeIn shadow-sm'>
            <div className='flex items-center justify-between border-b border-border pb-2'>
              <div className='flex items-center gap-2'>
                <Icons.lock className='w-4 h-4 text-emerald-500' />
                <span className='font-bold text-foreground'>
                  Seguridad y Conexión del Scraper Remoto (Dokploy)
                </span>
              </div>
              <span className='text-[10px] text-muted-foreground font-mono'>
                Token & VNC Password Protegidos
              </span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
              <div>
                <label className='block text-muted-foreground text-[11px] mb-1 font-medium'>
                  Host Dokploy:
                </label>
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
                  className='w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#E63946]'
                />
              </div>

              <div>
                <label className='block text-muted-foreground text-[11px] mb-1 font-medium'>
                  Token de Sesión / Auth:
                </label>
                <input
                  type='password'
                  value={vncToken}
                  onChange={(e) => {
                    setVncToken(e.target.value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jg_scraper_token', e.target.value);
                    }
                  }}
                  className='w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#E63946]'
                />
              </div>

              <div>
                <label className='block text-muted-foreground text-[11px] mb-1 font-medium'>
                  Contraseña VNC (x11vnc):
                </label>
                <input
                  type='password'
                  value={vncPassword}
                  onChange={(e) => {
                    setVncPassword(e.target.value);
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('jg_scraper_vnc_password', e.target.value);
                    }
                  }}
                  className='w-full bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs font-mono text-foreground outline-none focus:border-[#E63946]'
                />
              </div>
            </div>

            <div className='flex items-center justify-between pt-1'>
              <p className='text-[11px] text-muted-foreground'>
                Ruta protegida por Nginx y FastAPI con token bearer contra accesos públicos no
                autorizados.
              </p>
              <button
                onClick={() => {
                  setVncKey(Date.now());
                  toast.success('Configuración aplicada y sesión VNC refrescada');
                }}
                className='px-3 py-1 bg-[#E63946] text-white rounded-lg font-bold text-xs hover:bg-[#c92a37] transition-colors'
              >
                Aplicar y Reconectar
              </button>
            </div>
          </div>
        )}

        {/* Marco de Pantalla del Navegador */}
        <div
          className={`relative rounded-2xl overflow-hidden border border-border bg-[#090d16] shadow-sm flex flex-col ${
            isFullscreen ? 'flex-1 min-h-0' : 'min-h-[580px] h-[66vh]'
          }`}
        >
          {/* Header tipo pestaña de navegador */}
          <div className='flex items-center justify-between px-4 py-2.5 bg-[#121826] border-b border-border/50 text-xs shrink-0'>
            <div className='flex items-center gap-2'>
              <span className='w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block' />
              <span className='w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block' />
              <span className='w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block' />
              <div className='flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-black/40 text-slate-300 font-mono text-[11px] ml-2'>
                <Icons.lock className='w-3 h-3 text-emerald-400 shrink-0' />
                <span>
                  {viewMode === 'vnc'
                    ? 'https://coronelmayorista.com (Sesión Interactiva Remota)'
                    : 'Vista Previa Renderizada (Selenium Chrome)'}
                </span>
              </div>
            </div>

            <div className='flex items-center gap-2'>
              {isRunning && (
                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 font-bold tracking-wider'>
                  <span className='w-1.5 h-1.5 rounded-full bg-red-500 animate-ping' />
                  PROCESO ACTIVO
                </span>
              )}
              <span className='text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono'>
                Zoom: {isFit ? 'Fit' : `${zoomLevel}%`}
              </span>
            </div>
          </div>

          {/* Área de Visualización con Escalado Proporcional (Cero Scroll) */}
          <div className='relative flex-1 w-full bg-[#05070d] flex items-center justify-center overflow-hidden p-2'>
            {viewMode === 'vnc' ? (
              <div
                style={getViewportStyle()}
                className='relative bg-black rounded-lg overflow-hidden shadow-2xl border border-border/30 flex items-center justify-center'
              >
                <iframe
                  key={vncKey}
                  src={vncIframeUrl}
                  scrolling='no'
                  className='w-full h-full border-0 bg-black block overflow-hidden'
                  allow='fullscreen; clipboard-read; clipboard-write; autoplay'
                  allowFullScreen={true}
                  title='Navegador Remoto Chrome noVNC'
                />
              </div>
            ) : (
              <div
                style={getViewportStyle()}
                className='relative bg-black rounded-lg overflow-hidden shadow-2xl border border-border/30 flex items-center justify-center'
              >
                <img
                  key={previewTimestamp}
                  src={`/api/scraper/preview?t=${previewTimestamp}`}
                  alt='Vista previa de Chrome'
                  onLoad={() => setPreviewLoading(false)}
                  className='w-full h-full object-contain'
                />

                {/* Overlay de Interacción Necesaria */}
                {waitingUser && (
                  <div className='absolute inset-0 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-fadeIn'>
                    <div className='w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 mb-3 animate-pulse'>
                      <Icons.laptop className='w-7 h-7' />
                    </div>
                    <h3 className='text-white font-bold text-lg mb-1'>
                      ¡Selecciona la Categoría en Chrome!
                    </h3>
                    <p className='text-slate-300 text-xs max-w-sm mb-4'>
                      Cambia al modo "noVNC Interactivo" arriba para hacer clic con tu ratón dentro
                      de la página, o si ya seleccionaste la categoría pulsa el botón:
                    </p>
                    <button
                      onClick={handleContinue}
                      className='px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/40 transition-all flex items-center gap-2'
                    >
                      <Icons.check className='w-4 h-4' />
                      <span>Continuar Scraping Ahora</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Barra de Estado Inferior */}
          <div className='px-4 py-2 bg-[#121826] border-t border-border/50 flex items-center justify-between text-[11px] text-slate-400 shrink-0'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 rounded-full bg-emerald-400' />
              <span>
                {viewMode === 'vnc'
                  ? 'Transmisión WebSockets Segura activa (Ratón y Teclado habilitados)'
                  : 'Modo Captura Estática (Actualización cada 2 seg)'}
              </span>
            </div>
            <div className='flex items-center gap-3 font-mono text-[10px]'>
              <span>Escala Nativa: 1280x800</span>
              <span>•</span>
              <span>Zoom actual: {isFit ? 'Ajustado a ventana' : `${zoomLevel}%`}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN COLAPSABLE: TERMINAL EN VIVO */}
      <div className='rounded-2xl border border-border bg-[#0a0d14] overflow-hidden shadow-xs'>
        <div className='flex items-center justify-between px-4 py-3 bg-[#10141f] border-b border-slate-800 text-xs'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className='flex items-center gap-2 text-foreground font-bold hover:text-[#E63946] transition-colors'
            >
              <Icons.terminal className='w-4 h-4 text-emerald-400' />
              <span>Terminal y Consola de Eventos</span>
              <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal'>
                {logs.length} líneas
              </span>
            </button>
            <span className='text-slate-600 hidden sm:inline'>|</span>
            <span className='text-slate-400 font-mono text-[11px] hidden sm:inline'>
              python scraping-coronel/main.py
            </span>
          </div>

          <div className='flex items-center gap-2'>
            <label className='flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none mr-2'>
              <input
                type='checkbox'
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className='rounded border-slate-700 bg-slate-900 text-[#E63946] focus:ring-0 w-3 h-3'
              />
              <span className='hidden sm:inline'>Auto-scroll</span>
            </label>

            <button
              onClick={handleCopyLogs}
              className='text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-800'
              title='Copiar logs'
            >
              <Icons.copy className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Copiar</span>
            </button>

            <button
              onClick={handleClearLogs}
              className='text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-800'
              title='Limpiar consola'
            >
              <Icons.trash className='w-3.5 h-3.5' />
              <span className='hidden sm:inline'>Limpiar</span>
            </button>

            <button
              onClick={() => setIsTerminalOpen(!isTerminalOpen)}
              className='text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-slate-800 transition-colors'
            >
              {isTerminalOpen ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        {/* Cuerpo de la Terminal */}
        {isTerminalOpen ? (
          <div className='p-4 font-mono text-[12px] leading-relaxed text-slate-200 overflow-y-auto space-y-1 h-[260px] sm:h-[300px]'>
            {logs.length === 0 ? (
              <div className='text-slate-500 italic py-8 text-center'>
                Consola lista. Pulsa "Iniciar Scraping" para visualizar la salida en tiempo real.
              </div>
            ) : (
              logs.map((log, index) => {
                let colorClass = 'text-slate-300';
                if (log.includes('✔') || log.includes('COMPLETED') || log.includes('éxito')) {
                  colorClass = 'text-emerald-400 font-medium';
                } else if (log.includes('⚠') || log.includes('WAITING') || log.includes('Aviso')) {
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
        ) : (
          <div className='px-4 py-2 bg-[#0c101a] text-[11px] text-slate-400 font-mono truncate flex items-center justify-between'>
            <span>
              Último log:{' '}
              <span className='text-slate-300'>
                {logs[logs.length - 1] || 'Sin eventos recientes'}
              </span>
            </span>
            <button
              onClick={() => setIsTerminalOpen(true)}
              className='text-emerald-400 hover:underline font-semibold'
            >
              Expandir terminal
            </button>
          </div>
        )}
      </div>

      {/* SECCIÓN INFERIOR: CENTRO DE MIGRACIÓN & PUBLICACIÓN AL CATÁLOGO WEB */}
      <div className='space-y-4 pt-4 border-t border-border'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-xl font-bebas tracking-wide text-foreground flex items-center gap-2'>
              <Icons.box className='w-5 h-5 text-[#E63946]' />
              CENTRO DE MIGRACIÓN & PUBLICACIÓN AL CATÁLOGO WEB
            </h2>
            <p className='text-xs text-muted-foreground'>
              Sincroniza los productos extraídos hacia la base de datos oficial (PostgreSQL /
              Supabase Dokploy). Auto-crea categorías recursivas y actualiza precios y stock sin
              duplicados.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <a
              href='/dashboard/product'
              className='px-3 py-1.5 rounded-lg border border-[#E63946]/40 bg-[#E63946]/10 text-xs font-semibold text-[#E63946] hover:bg-[#E63946]/20 transition-colors flex items-center gap-1.5'
            >
              <Icons.store className='w-3.5 h-3.5' />
              <span>Ver Catálogo Web (/product)</span>
            </a>

            <button
              onClick={fetchDbStats}
              disabled={loadingDb}
              className='px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5'
            >
              <Icons.refresh className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
              <span>Refrescar SQLite</span>
            </button>
          </div>
        </div>

        {/* Tarjetas de Métricas de la BD */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Total en SQLite Local
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.total_products ?? 0}
            </div>
            <span className='text-[11px] text-emerald-500 font-medium'>
              Listos para migrar a la Web
            </span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Rubros Detectados
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.categories?.length ?? 0}
            </div>
            <span className='text-[11px] text-muted-foreground'>Categorías del proveedor</span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border'>
            <span className='text-xs text-muted-foreground uppercase font-semibold'>
              Estado de Sincronización Web
            </span>
            <div className='text-2xl font-bebas text-[#D4A017] mt-1'>
              {lastMigrationInfo ? `${lastMigrationInfo.total} Migrados` : 'En Espera'}
            </div>
            <span className='text-[11px] text-muted-foreground'>
              {lastMigrationInfo ? `A las ${lastMigrationInfo.date}` : 'Sin migrar en esta sesión'}
            </span>
          </div>
        </div>

        {/* PANEL PRINCIPAL: PUBLICAR / MIGRAR A LA TIENDA WEB */}
        <div className='p-4 rounded-xl bg-card border-2 border-[#E63946]/30 shadow-md space-y-3.5 relative overflow-hidden'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <div className='w-7 h-7 rounded-lg bg-[#E63946] text-white flex items-center justify-center font-bold'>
                <Icons.arrowRight className='w-4 h-4' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-foreground font-gotham'>
                  Sincronizador ETL: SQLite &rarr; Catálogo Web (PostgreSQL)
                </h3>
                <p className='text-[11px] text-muted-foreground'>
                  Crea automáticamente las categorías y subcategorías faltantes y actualiza costos,
                  PVP y stock sin duplicar productos.
                </p>
              </div>
            </div>

            {lastMigrationInfo && (
              <span className='px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'>
                ✓ {lastMigrationInfo.total} sincronizados ({lastMigrationInfo.inserted} nuevos,{' '}
                {lastMigrationInfo.updated} actualizados)
              </span>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs'>
            {/* Selector de Ámbito / Categoría */}
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground font-medium'>Seleccionar:</span>
              <select
                value={migrationCategory}
                onChange={(e) => setMigrationCategory(e.target.value)}
                disabled={isMigrating}
                className='px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer'
              >
                <option value='all'>
                  Todo el Catálogo ({dbStats?.total_products ?? 0} artículos)
                </option>
                {dbStats?.categories?.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name} ({cat.count} prods)
                  </option>
                ))}
              </select>
            </div>

            {/* Márgenes por Defecto para la Migración */}
            <div className='flex flex-wrap items-center gap-3'>
              <div className='flex items-center gap-1.5'>
                <span className='text-muted-foreground font-medium'>Margen Detal:</span>
                <div className='flex items-center bg-background border border-border px-2 py-0.5 rounded-md'>
                  <input
                    type='number'
                    min='0'
                    max='200'
                    value={migrationRetailMargin}
                    onChange={(e) => setMigrationRetailMargin(Number(e.target.value))}
                    disabled={isMigrating}
                    className='w-11 bg-transparent text-foreground font-bold text-center outline-none'
                  />
                  <span className='text-muted-foreground font-semibold'>%</span>
                </div>
              </div>

              <div className='flex items-center gap-1.5'>
                <span className='text-muted-foreground font-medium'>Margen Mayor:</span>
                <div className='flex items-center bg-background border border-border px-2 py-0.5 rounded-md'>
                  <input
                    type='number'
                    min='0'
                    max='200'
                    value={migrationWholesaleMargin}
                    onChange={(e) => setMigrationWholesaleMargin(Number(e.target.value))}
                    disabled={isMigrating}
                    className='w-11 bg-transparent text-foreground font-bold text-center outline-none'
                  />
                  <span className='text-muted-foreground font-semibold'>%</span>
                </div>
              </div>

              {/* Botón Principal de Migración */}
              <button
                onClick={handleMigrateToWeb}
                disabled={isMigrating || (dbStats?.total_products ?? 0) === 0}
                className='px-4 py-2 rounded-lg bg-[#E63946] hover:bg-[#c92a37] text-white font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer'
              >
                <Icons.refresh className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
                <span>
                  {isMigrating
                    ? 'Publicando en Catálogo Web...'
                    : '🚀 Publicar / Migrar al Catálogo Web'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Barra Secundaria de Recálculo Masivo de Márgenes en SQLite Local */}
        <div className='p-3 rounded-xl bg-card border border-border flex flex-wrap items-center justify-between gap-3 text-xs'>
          <div className='flex items-center gap-2 text-foreground font-semibold'>
            <Icons.settings className='w-4 h-4 text-muted-foreground' />
            <span>Recálculo en SQLite Local:</span>
            <span className='text-[11px] font-normal text-muted-foreground hidden sm:inline'>
              (Ajusta los precios dentro del archivo local productos.db antes de publicar)
            </span>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-1.5'>
              <span className='text-muted-foreground'>Detal:</span>
              <div className='flex items-center bg-background border border-border px-2 py-0.5 rounded-md'>
                <input
                  type='number'
                  min='0'
                  max='200'
                  value={bulkMargenMinorista}
                  onChange={(e) => setBulkMargenMinorista(Number(e.target.value))}
                  className='w-10 bg-transparent text-foreground font-bold text-center outline-none'
                />
                <span className='text-muted-foreground font-semibold'>%</span>
              </div>
            </div>

            <div className='flex items-center gap-1.5'>
              <span className='text-muted-foreground'>Mayor:</span>
              <div className='flex items-center bg-background border border-border px-2 py-0.5 rounded-md'>
                <input
                  type='number'
                  min='0'
                  max='200'
                  value={bulkMargenMayorista}
                  onChange={(e) => setBulkMargenMayorista(Number(e.target.value))}
                  className='w-10 bg-transparent text-foreground font-bold text-center outline-none'
                />
                <span className='text-muted-foreground font-semibold'>%</span>
              </div>
            </div>

            <button
              onClick={handleUpdateMargins}
              disabled={updatingMargins}
              className='px-3 py-1 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground font-semibold transition-all flex items-center gap-1.5'
            >
              <Icons.refresh className={`w-3 h-3 ${updatingMargins ? 'animate-spin' : ''}`} />
              <span>{updatingMargins ? 'Recalculando...' : 'Guardar en SQLite'}</span>
            </button>
          </div>
        </div>

        {/* Tabla con los últimos productos guardados */}
        <div className='rounded-xl border border-border overflow-hidden bg-card'>
          <div className='p-3 bg-muted/40 border-b border-border text-xs font-bold text-foreground flex items-center justify-between'>
            <span>Últimos Artículos Extraídos</span>
            <span className='text-[11px] font-normal text-muted-foreground'>
              Jerarquía de 3 Niveles y Precios Duales (Detal / Mayor)
            </span>
          </div>

          <div className='overflow-x-auto max-h-96'>
            <table className='w-full text-xs text-left'>
              <thead className='bg-muted/60 text-muted-foreground sticky top-0 uppercase tracking-wider text-[10px]'>
                <tr>
                  <th className='px-4 py-2.5'>Foto</th>
                  <th className='px-4 py-2.5'>SKU / Código</th>
                  <th className='px-4 py-2.5'>Descripción</th>
                  <th className='px-4 py-2.5'>Jerarquía Completa</th>
                  <th className='px-4 py-2.5'>Costo Coronel</th>
                  <th className='px-4 py-2.5'>PVP Detal</th>
                  <th className='px-4 py-2.5'>PVP Mayor</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {dbStats?.latest_products && dbStats.latest_products.length > 0 ? (
                  dbStats.latest_products.map((p, idx) => {
                    const rawImg = p.imagen_url || p.foto || '';
                    const fotoSrc = rawImg
                      ? `/api/scraper/image?url=${encodeURIComponent(p.imagen_url || '')}&file=${encodeURIComponent(p.foto || '')}`
                      : '';
                    const costoStr = p.precio_costo
                      ? `$ ${Number(p.precio_costo).toLocaleString('es-AR')}`
                      : p.precio || '-';
                    const detalStr = p.precio_minorista
                      ? `$ ${Number(p.precio_minorista).toLocaleString('es-AR')}`
                      : p.precio || '-';
                    const mayorStr = p.precio_mayorista
                      ? `$ ${Number(p.precio_mayorista).toLocaleString('es-AR')}`
                      : '-';
                    const rutaStr =
                      p.categoria_ruta ||
                      [p.categoria, p.subcategoria, p.sub_subcategoria]
                        .filter(Boolean)
                        .join(' > ') ||
                      'Sin categoría';

                    return (
                      <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                        <td className='px-4 py-2'>
                          <div className='relative w-9 h-9 flex items-center justify-center bg-muted/60 rounded-md border border-border overflow-hidden'>
                            {fotoSrc ? (
                              <img
                                src={fotoSrc}
                                alt={p.codigo}
                                loading='lazy'
                                className='w-full h-full object-cover transition-opacity duration-200'
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.style.display = 'none';
                                  const parent = target.parentElement;
                                  if (parent) {
                                    const fallback = parent.querySelector(
                                      '.img-fallback'
                                    ) as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className='img-fallback absolute inset-0 items-center justify-center text-[10px] text-muted-foreground font-semibold'
                              style={{ display: fotoSrc ? 'none' : 'flex' }}
                            >
                              N/A
                            </div>
                          </div>
                        </td>
                        <td className='px-4 py-2 font-mono font-bold text-foreground'>
                          {p.codigo}
                        </td>
                        <td className='px-4 py-2 text-foreground font-medium max-w-xs truncate'>
                          {p.descripcion}
                        </td>
                        <td
                          className='px-4 py-2 text-muted-foreground max-w-xs truncate'
                          title={rutaStr}
                        >
                          <span className='px-2 py-0.5 rounded bg-muted/80 text-[11px] font-medium text-foreground'>
                            {rutaStr}
                          </span>
                        </td>
                        <td className='px-4 py-2 font-mono text-muted-foreground font-semibold'>
                          {costoStr}
                        </td>
                        <td className='px-4 py-2 text-emerald-500 font-bold'>
                          <div>{detalStr}</div>
                          {p.margen_minorista && (
                            <div className='text-[10px] text-muted-foreground font-normal'>
                              +{p.margen_minorista}%
                            </div>
                          )}
                        </td>
                        <td className='px-4 py-2 text-amber-500 font-bold'>
                          <div>{mayorStr}</div>
                          {p.margen_mayorista && (
                            <div className='text-[10px] text-muted-foreground font-normal'>
                              +{p.margen_mayorista}%
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className='px-4 py-8 text-center text-muted-foreground'>
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
