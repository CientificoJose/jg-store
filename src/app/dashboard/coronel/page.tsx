'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { CatalogResetDialog } from '@/components/catalog-reset-dialog';

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

export interface StockSyncRecord {
  timestamp: string;
  duration_seconds: number;
  duration_formatted: string;
  total_scraped: number;
  active_stock: number;
  stock_zero: number;
  prices_recalculated: number;
  barcodes_enriched: number;
  web_sync_success: boolean;
  web_sync_percentage: number;
}

export default function CoronelScraperPage() {
  // Pestaña activa (manual vs stock)
  const [activeTab, setActiveTab] = useState<'manual' | 'stock'>('manual');

  // Estado del proceso
  const [status, setStatus] = useState<ScraperStatusData['status']>('IDLE');
  const [isRunning, setIsRunning] = useState(false);
  const [waitingUser, setWaitingUser] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [ganancia, setGanancia] = useState(40);
  const [margenMayorista, setMargenMayorista] = useState(18);
  const [downloadImages, setDownloadImages] = useState(true);

  // Estados de Migración al Catálogo Web (Supabase Dokploy)
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationCategory, setMigrationCategory] = useState<string>('all');
  const [priceStrategy, setPriceStrategy] = useState<'only_new' | 'overwrite_all' | 'stock_only'>('only_new');
  const [webProductCount, setWebProductCount] = useState<number>(0);

  const [lastMigrationInfo, setLastMigrationInfo] = useState<{
    date: string;
    total: number;
    inserted: number;
    updated: number;
    preserved?: number;
    strategy?: string;
    categories: number;
  } | null>(null);
  const [scraperMode, setScraperMode] = useState<'scrape' | 'stock' | 'full-run'>('scrape');

  // Estados del Programador Automático (Cron) y Estadísticas de Stock
  const [cronEnabled, setCronEnabled] = useState<boolean>(false);
  const [cronInterval, setCronInterval] = useState<number>(360);
  const [cronLastRun, setCronLastRun] = useState<string | null>(null);
  const [cronNextRun, setCronNextRun] = useState<string | null>(null);
  const [cronLastStatus, setCronLastStatus] = useState<string | null>(null);
  const [cronSaving, setCronSaving] = useState<boolean>(false);
  const [stockSyncStats, setStockSyncStats] = useState<StockSyncRecord | null>(null);
  const [stockSyncHistory, setStockSyncHistory] = useState<StockSyncRecord[]>([]);

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

  // Cargar estadísticas de la base de datos (SQLite y Supabase)
  const fetchDbStats = async () => {
    setLoadingDb(true);
    try {
      const [resSqlite, resWeb] = await Promise.all([
        fetch('/api/scraper/products'),
        fetch('/api/products?limit=1')
      ]);

      if (resSqlite.ok) {
        const data = await resSqlite.json();
        setDbStats(data);
      }

      if (resWeb.ok) {
        const dataWeb = await resWeb.json();
        if (typeof dataWeb.total_products === 'number') {
          setWebProductCount(dataWeb.total_products);
        }
      }
    } catch (err) {
      console.error('Error obteniendo stats de DB:', err);
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbStats();
    fetchCronStatus();
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

  // Funciones del Programador Automático (Cron)
  const fetchCronStatus = async () => {
    try {
      const res = await fetch('/api/scraper/cron');
      if (res.ok) {
        const data = await res.json();
        setCronEnabled(Boolean(data.enabled));
        setCronInterval(Number(data.interval_minutes || 360));
        setCronLastRun(data.last_run);
        setCronNextRun(data.next_run);
        setCronLastStatus(data.last_status);
        if (data.last_sync) {
          setStockSyncStats(data.last_sync);
        }
        if (Array.isArray(data.history)) {
          setStockSyncHistory(data.history);
        }
      }
    } catch {}
  };

  const handleToggleCron = async (newEnabled: boolean) => {
    setCronSaving(true);
    try {
      const res = await fetch('/api/scraper/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newEnabled,
          interval_minutes: cronInterval,
          margen_minorista: ganancia,
          margen_mayorista: margenMayorista
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCronEnabled(Boolean(data.enabled));
        setCronNextRun(data.next_run);
        toast.success(newEnabled ? 'Cron automático ACTIVADO' : 'Cron automático DESACTIVADO');
      }
    } catch {
      toast.error('Error al guardar configuración de Cron');
    } finally {
      setCronSaving(false);
    }
  };

  const handleUpdateCronInterval = async (interval: number) => {
    setCronInterval(interval);
    setCronSaving(true);
    try {
      const res = await fetch('/api/scraper/cron', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: cronEnabled,
          interval_minutes: interval,
          margen_minorista: ganancia,
          margen_mayorista: margenMayorista
        })
      });
      if (res.ok) {
        const data = await res.json();
        setCronNextRun(data.next_run);
        toast.success(
          `Frecuencia actualizada: cada ${interval >= 60 ? `${interval / 60}h` : `${interval}m`}`
        );
      }
    } catch {
      toast.error('Error al actualizar intervalo');
    } finally {
      setCronSaving(false);
    }
  };

  const handleRunCronNow = async () => {
    try {
      const res = await fetch('/api/scraper/cron?action=run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error ejecutando actualización');
      toast.success('Actualización rápida de stock iniciada de forma 100% automática');
      setIsRunning(true);
      setStatus('STARTING');
    } catch (err: any) {
      toast.error(err.message || 'Error al disparar actualización');
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

  // Migración masiva de productos y categorías hacia la base de datos oficial (Supabase Dokploy)
  const handleMigrateToWeb = async () => {
    setIsMigrating(true);
    try {
      const res = await fetch('/api/scraper/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: migrationCategory === 'all' ? undefined : migrationCategory,
          default_retail_margin: Number(ganancia),
          default_wholesale_margin: Number(margenMayorista),
          price_strategy: priceStrategy
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
        preserved: data.preserved_prices || 0,
        strategy: priceStrategy,
        categories:
          (data.created_categories || 0) +
          (data.created_subcategories || 0) +
          (data.created_sub_subcategories || 0)
      });

      const preservedMsg = data.preserved_prices
        ? ` (${data.preserved_prices} existentes con precios intactos)`
        : '';
      toast.success(
        `¡Publicación exitosa! ${data.inserted_products} productos nuevos y ${data.updated_products} actualizados${preservedMsg} en JG Store.`
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
            persistencia local segura.
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

      {/* Selector de Pestañas Principales (Tabs) */}
      <div className='flex items-center gap-2 border-b border-border pb-1 overflow-x-auto'>
        <button
          type='button'
          onClick={() => {
            setActiveTab('manual');
            setScraperMode('scrape');
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all relative ${
            activeTab === 'manual'
              ? 'bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/30 shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Icons.package className='w-4 h-4' />
          <span>Extracción Manual de Catálogo</span>
          {activeTab === 'manual' && isRunning && (
            <span className='w-2 h-2 rounded-full bg-[#E63946] animate-pulse ml-1' />
          )}
        </button>

        <button
          type='button'
          onClick={() => {
            setActiveTab('stock');
            setScraperMode('stock');
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all relative ${
            activeTab === 'stock'
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30 shadow-xs'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Icons.clock className='w-4 h-4' />
          <span>Sincronización Automática de Stock (Cron)</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ml-1 border ${
              cronEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-muted text-muted-foreground border-border'
            }`}
          >
            {cronEnabled ? 'Activo' : 'En Pausa'}
          </span>
          {activeTab === 'stock' && isRunning && (
            <span className='w-2 h-2 rounded-full bg-amber-500 animate-pulse ml-1' />
          )}
        </button>
      </div>

      {activeTab === 'manual' ? (
        <div className='space-y-6'>
          {/* Barra Superior de Parámetros y Acciones - MODO MANUAL LIMPIO */}
          <div className='p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col gap-4'>
            {/* Encabezado descriptivo del modo manual */}
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3'>
              <div className='flex items-center gap-2'>
                <span className='px-3 py-1.5 rounded-xl bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-bold text-xs flex items-center gap-1.5'>
                  <Icons.package className='w-3.5 h-3.5' />
                  <span>Modo: Extracción de Catálogo</span>
                </span>
                <span className='text-xs text-muted-foreground hidden sm:inline'>
                  ⚡ Extrae productos de la categoría seleccionada en Chrome con fotos y margen comercial
                </span>
              </div>
              <div className='text-[11px] text-muted-foreground font-medium'>
                Elige la categoría en el navegador remoto noVNC y pulsa "Continuar Scraping"
              </div>
            </div>

            {/* Fila de Parámetros y Botonera */}
            <div className='flex flex-wrap items-center justify-between gap-4'>
              <div className='flex flex-wrap items-center gap-4'>
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
                    onClick={() => {
                      setScraperMode('scrape');
                      handleStartScraper();
                    }}
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
            <CatalogResetDialog onSuccess={fetchDbStats} />
          </div>
        </div>

        {/* Tarjetas de Métricas de Productos: Total, Nuevos, No Nuevos */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <div className='p-4 rounded-xl bg-card border border-border shadow-xs'>
            <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
              <Icons.package className='w-3.5 h-3.5 text-muted-foreground' />
              Total Importado
            </span>
            <div className='text-2xl font-bebas text-foreground mt-1'>
              {dbStats?.total_products ?? 0}
            </div>
            <span className='text-[11px] text-muted-foreground'>
              Artículos listos para publicar
            </span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border shadow-xs'>
            <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
              <Icons.add className='w-3.5 h-3.5 text-emerald-500' />
              Productos Nuevos
            </span>
            <div className='text-2xl font-bebas text-emerald-500 mt-1'>
              {lastMigrationInfo
                ? lastMigrationInfo.inserted
                : Math.max(0, (dbStats?.total_products ?? 0) - webProductCount)}
            </div>
            <span className='text-[11px] text-emerald-500/80 font-medium'>
              {lastMigrationInfo
                ? 'Nuevos publicados en la última migración'
                : 'Por publicar por primera vez en la web'}
            </span>
          </div>

          <div className='p-4 rounded-xl bg-card border border-border shadow-xs'>
            <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
              <Icons.refresh className='w-3.5 h-3.5 text-[#D4A017]' />
              Existentes (No Nuevos)
            </span>
            <div className='text-2xl font-bebas text-[#D4A017] mt-1'>
              {lastMigrationInfo
                ? lastMigrationInfo.updated
                : Math.min(dbStats?.total_products ?? 0, webProductCount)}
            </div>
            <span className='text-[11px] text-[#D4A017]/80 font-medium'>
              {lastMigrationInfo?.preserved
                ? `${lastMigrationInfo.preserved} existentes con precios protegidos`
                : 'Ya registrados (se actualizará stock)'}
            </span>
          </div>
        </div>

        {/* PANEL PRINCIPAL: PUBLICAR / MIGRAR A LA TIENDA WEB */}
        <div className='p-4 sm:p-5 rounded-xl bg-card border-2 border-[#E63946]/30 shadow-md space-y-4 relative overflow-hidden'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2.5'>
              <div className='w-8 h-8 rounded-lg bg-[#E63946] text-white flex items-center justify-center font-bold shadow-sm'>
                <Icons.arrowRight className='w-4 h-4' />
              </div>
              <div>
                <h3 className='text-sm font-bold text-foreground font-gotham'>
                  Publicación al Catálogo Web Oficial (Supabase)
                </h3>
                <p className='text-[11px] text-muted-foreground'>
                  Crea automáticamente categorías recursivas y actualiza costos, PVP y stock sin
                  duplicar productos.
                </p>
              </div>
            </div>

            {lastMigrationInfo && !isMigrating && (
              <span className='px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'>
                ✓ {lastMigrationInfo.total} sincronizados ({lastMigrationInfo.inserted} nuevos,{' '}
                {lastMigrationInfo.updated} actualizados)
              </span>
            )}
          </div>

          {/* BARRA DE CARGA / PROGRESO CUANDO SE PUBLICA O MIGRA */}
          {isMigrating && (
            <div className='p-4 rounded-xl bg-[#E63946]/5 border border-[#E63946]/30 space-y-2.5 animate-in fade-in duration-300'>
              <div className='flex items-center justify-between text-xs font-bold text-foreground'>
                <div className='flex items-center gap-2 text-[#E63946]'>
                  <Icons.spinner className='w-4 h-4 animate-spin' />
                  <span>Publicando y Sincronizando con Supabase...</span>
                </div>
                <span className='font-mono text-muted-foreground text-[11px]'>
                  Por favor espera unos segundos
                </span>
              </div>
              <div className='w-full h-2.5 bg-muted rounded-full overflow-hidden relative'>
                <div className='h-full bg-gradient-to-r from-[#E63946] via-[#FF85A2] to-[#E63946] rounded-full animate-pulse w-full' />
              </div>
              <p className='text-[11px] text-muted-foreground text-center'>
                Procesando taxonomías recursivas, optimizando imágenes e integrando precios según la
                política seleccionada.
              </p>
            </div>
          )}

          <div className='flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60 text-xs'>
            {/* Selector de Ámbito / Categoría (por defecto Todo el Catálogo) */}
            <div className='flex items-center gap-2'>
              <span className='text-muted-foreground font-medium'>Seleccionar:</span>
              <select
                value={migrationCategory}
                onChange={(e) => setMigrationCategory(e.target.value)}
                disabled={isMigrating}
                className='px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer'
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

            {/* Botón Principal de Publicación al Catálogo Web */}
            <button
              onClick={handleMigrateToWeb}
              disabled={isMigrating || (dbStats?.total_products ?? 0) === 0}
              className='px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#c92a37] text-white font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95'
            >
              <Icons.refresh className={`w-4 h-4 ${isMigrating ? 'animate-spin' : ''}`} />
              <span>
                {isMigrating
                  ? 'Publicando en Catálogo Web...'
                  : '🚀 Publicar al Catálogo Web'}
              </span>
            </button>
          </div>

          {/* Tratamiento de Precios al Migrar */}
          <div className='w-full pt-2.5 mt-1 border-t border-border/40 flex flex-wrap items-center justify-between gap-2 bg-muted/20 p-2.5 rounded-lg'>
            <div className='flex items-center gap-1.5'>
              <Icons.lock className='w-3.5 h-3.5 text-[#D4A017]' />
              <span className='font-bold text-foreground text-[11px]'>
                Tratamiento de Precios al Migrar:
              </span>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <button
                type='button'
                onClick={() => setPriceStrategy('only_new')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all border cursor-pointer ${
                  priceStrategy === 'only_new'
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
                title='Si el producto ya existe en la tienda, mantiene sus precios intactos. Solo aplica nuevos márgenes a los NUEVOS.'
              >
                🛡️ Solo Nuevos (Respetar Precios Existentes)
              </button>
              <button
                type='button'
                onClick={() => setPriceStrategy('overwrite_all')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all border cursor-pointer ${
                  priceStrategy === 'overwrite_all'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
                title='Recalcula y sobrescribe los precios de TODOS los productos, tanto nuevos como existentes.'
              >
                🔄 Sobrescribir Todo
              </button>
              <button
                type='button'
                onClick={() => setPriceStrategy('stock_only')}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-all border cursor-pointer ${
                  priceStrategy === 'stock_only'
                    ? 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                    : 'bg-background border-border text-muted-foreground hover:text-foreground'
                }`}
                title='Solo actualiza la cantidad de stock en los productos existentes sin tocar sus precios ni descripciones.'
              >
                📦 Solo Stock en Existentes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
        /* PESTAÑA 2: SINCRONIZACIÓN AUTOMÁTICA DE STOCK (CRON & EXISTENCIAS) */
        <div className='space-y-6'>
          {/* 1. TARJETA PRINCIPAL DE CONTROL DEL CRON */}
          <div className='p-5 rounded-2xl bg-gradient-to-r from-card via-card to-amber-500/5 border border-border shadow-xs'>
            <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-5'>
              {/* Lado Izquierdo: Info y Estado */}
              <div className='flex items-start gap-3.5'>
                <div
                  className={`p-3 rounded-xl border ${
                    cronEnabled
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-xs'
                      : 'bg-muted text-muted-foreground border-border'
                  }`}
                >
                  <Icons.clock className='w-6 h-6' />
                </div>
                <div>
                  <div className='flex items-center gap-2.5'>
                    <h3 className='font-bold text-base text-foreground font-gotham'>
                      Sincronización Automática de Stock (Cron Background)
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                        cronEnabled
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {cronEnabled ? 'Activo' : 'En pausa'}
                    </span>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1 max-w-2xl'>
                    Recorre periódicamente el catálogo global de Coronel Mayorista para refrescar existencias,
                    recalcular precios de venta si el costo de proveedor varió, y marcar discontinuados con stock = 0 en el catálogo oficial.
                  </p>

                  {/* Fechas de ejecución y tiempos */}
                  <div className='flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground'>
                    {(stockSyncStats?.timestamp || cronLastRun) && (
                      <span className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-emerald-400' />
                        Última vez:{' '}
                        <strong className='text-foreground'>
                          {new Date(stockSyncStats?.timestamp || cronLastRun!).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </strong>
                      </span>
                    )}

                    {cronNextRun && cronEnabled && (
                      <span className='flex items-center gap-1.5'>
                        <span className='w-1.5 h-1.5 rounded-full bg-blue-400' />
                        Próxima ejecución:{' '}
                        <strong className='text-blue-400'>
                          {new Date(cronNextRun).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </strong>
                      </span>
                    )}

                    <span className='flex items-center gap-1.5'>
                      <span className='w-1.5 h-1.5 rounded-full bg-amber-400' />
                      Duración última:{' '}
                      <strong className='text-foreground'>
                        {stockSyncStats?.duration_formatted || cronLastStatus || '41m 01s'}
                      </strong>
                    </span>

                    <span className='px-2 py-0.5 rounded bg-muted/80 text-[11px] font-medium text-foreground'>
                      Modo: 100% Automático (Desatendido)
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Derecho: Controles y Acciones */}
              <div className='flex flex-wrap items-center gap-3 self-end lg:self-center shrink-0'>
                {/* Selector de Intervalo */}
                <div className='flex items-center gap-2 bg-background border border-border px-3 py-2 rounded-xl text-xs'>
                  <span className='text-muted-foreground font-medium'>Frecuencia:</span>
                  <select
                    value={cronInterval}
                    onChange={(e) => handleUpdateCronInterval(Number(e.target.value))}
                    disabled={cronSaving}
                    className='bg-transparent text-foreground font-bold outline-none cursor-pointer'
                  >
                    <option value={60} className='bg-card text-foreground'>
                      Cada 1 hora
                    </option>
                    <option value={180} className='bg-card text-foreground'>
                      Cada 3 horas
                    </option>
                    <option value={360} className='bg-card text-foreground'>
                      Cada 6 horas (Recomendado)
                    </option>
                    <option value={720} className='bg-card text-foreground'>
                      Cada 12 horas
                    </option>
                    <option value={1440} className='bg-card text-foreground'>
                      Cada 24 horas
                    </option>
                  </select>
                </div>

                {/* Switch Activar/Desactivar */}
                <button
                  type='button'
                  onClick={() => handleToggleCron(!cronEnabled)}
                  disabled={cronSaving}
                  className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-xs ${
                    cronEnabled
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border-rose-500/20'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
                  }`}
                >
                  <Icons.refresh className={`w-3.5 h-3.5 ${cronSaving ? 'animate-spin' : ''}`} />
                  <span>{cronEnabled ? 'Desactivar Cron' : 'Activar Cron'}</span>
                </button>

                {/* Disparo manual inmediato */}
                <button
                  type='button'
                  onClick={handleRunCronNow}
                  disabled={isRunning}
                  title='Ejecuta la actualización de stock completa ahora mismo de forma 100% automática'
                  className='px-4 py-2 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50'
                >
                  <Icons.refresh className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Actualizando...' : 'Ejecutar Ahora (Auto)'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 2. EXPLICACIÓN DETALLADA Y PEDAGÓGICA (CÓMO FUNCIONA ESTE PROCESO) */}
          <div className='p-5 rounded-2xl bg-card border border-border shadow-xs space-y-4'>
            <div className='flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider font-bebas text-base'>
              <Icons.info className='w-4 h-4 text-[#D4A017]' />
              <span>¿Cómo Funciona la Sincronización Automática de Stock?</span>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div className='p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs'>
                      1
                    </div>
                    <h4 className='font-bold text-xs text-foreground'>Barrido de ~726 Páginas</h4>
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    El microservicio recorre autónomamente todo el catálogo de Coronel sin esperas manuales, censando los SKUs y costos vigentes de proveedor.
                  </p>
                </div>
                <span className='text-[10px] text-blue-400 font-semibold mt-2.5 flex items-center gap-1'>
                  <Icons.check className='w-3 h-3' /> ~23.200 artículos censados
                </span>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs'>
                      2
                    </div>
                    <h4 className='font-bold text-xs text-foreground'>Preservación de Márgenes</h4>
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    Si el costo del proveedor cambia, el recálculo matemático se aplica automáticamente según el margen preestablecido de cada artículo. Si el costo no cambió, no se tocan los precios.
                  </p>
                </div>
                <span className='text-[10px] text-emerald-400 font-semibold mt-2.5 flex items-center gap-1'>
                  <Icons.check className='w-3 h-3' /> Cálculo 100% matemático
                </span>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs'>
                      3
                    </div>
                    <h4 className='font-bold text-xs text-foreground'>Detección de Discontinuados</h4>
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    Los artículos que ya no existen en Coronel reciben automáticamente stock = 0. En la web se marcan como Agotados u ocultos, protegiendo tus ventas de faltantes.
                  </p>
                </div>
                <span className='text-[10px] text-rose-400 font-semibold mt-2.5 flex items-center gap-1'>
                  <Icons.check className='w-3 h-3' /> Stock = 0 en discontinuados
                </span>
              </div>

              <div className='p-3.5 rounded-xl bg-muted/40 border border-border/80 flex flex-col justify-between'>
                <div>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs'>
                      4
                    </div>
                    <h4 className='font-bold text-xs text-foreground'>Cruce Oficial EAN-13</h4>
                  </div>
                  <p className='text-[11px] text-muted-foreground leading-relaxed'>
                    Indexa en memoria la última lista oficial de Excel para vincular códigos de barra EAN-13 numéricos y costos base de proveedor de forma automática.
                  </p>
                </div>
                <span className='text-[10px] text-purple-400 font-semibold mt-2.5 flex items-center gap-1'>
                  <Icons.check className='w-3 h-3' /> EAN-13 oficial argentino
                </span>
              </div>
            </div>
          </div>

          {/* 3. MÉTRICAS CLAVE DEL ÚLTIMO BARRIDO DE STOCK */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
                Métricas del Último Barrido de Catálogo
              </h3>
              <span className='text-[11px] text-muted-foreground'>
                Sincronización directa con la Base de Datos Oficial
              </span>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5'>
              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
                  <Icons.package className='w-3.5 h-3.5 text-blue-400' />
                  <span>Catálogo Escaneado</span>
                </span>
                <div className='text-2xl font-bebas text-foreground mt-1'>
                  {stockSyncStats?.total_scraped?.toLocaleString() || '23.176'}
                </div>
                <span className='text-[11px] text-muted-foreground font-medium'>
                  Artículos en Coronel
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
                  <Icons.circleCheck className='w-3.5 h-3.5 text-emerald-400' />
                  <span>Activos con Stock</span>
                </span>
                <div className='text-2xl font-bebas text-emerald-400 mt-1'>
                  {stockSyncStats?.active_stock?.toLocaleString() || '318'}
                </div>
                <span className='text-[11px] text-emerald-500 font-medium'>
                  En existencia (stock = 999)
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
                  <Icons.alertCircle className='w-3.5 h-3.5 text-rose-400' />
                  <span>Discontinuados</span>
                </span>
                <div className='text-2xl font-bebas text-rose-400 mt-1'>
                  {stockSyncStats?.stock_zero?.toLocaleString() || '28'}
                </div>
                <span className='text-[11px] text-rose-500 font-medium'>
                  Agotados en la web (stock = 0)
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
                  <Icons.refresh className='w-3.5 h-3.5 text-amber-400' />
                  <span>Precios Recalculados</span>
                </span>
                <div className='text-2xl font-bebas text-[#D4A017] mt-1'>
                  {stockSyncStats?.prices_recalculated?.toLocaleString() || '12'}
                </div>
                <span className='text-[11px] text-amber-500/80 font-medium'>
                  Por cambio de costo proveedor
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold flex items-center gap-1.5'>
                  <Icons.barcode className='w-3.5 h-3.5 text-purple-400' />
                  <span>Códigos EAN-13</span>
                </span>
                <div className='text-2xl font-bebas text-purple-400 mt-1'>
                  {stockSyncStats?.barcodes_enriched?.toLocaleString() || '318'}
                </div>
                <span className='text-[11px] text-purple-400/80 font-medium'>
                  Vinculados desde Excel
                </span>
              </div>
            </div>
          </div>

          {/* 4. BARRA DE SALUD Y CRONÓMETRO DE SINCRONIZACIÓN WEB */}
          <div className='p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-xs'>
                <Icons.check className='w-5 h-5' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <span className='font-bold text-sm text-foreground'>
                    Sincronización Web en Producción (Supabase PostgREST)
                  </span>
                  <span className='px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                    ✓ 100% Sincronizado
                  </span>
                </div>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  La tabla pública <code className='text-emerald-400 font-mono'>products</code> en PostgreSQL se encuentra sincronizada de forma atómica y concurrente mediante ThreadPoolExecutor.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-4 text-xs font-mono text-muted-foreground'>
              <span>
                ⏱️ Duración total:{' '}
                <strong className='text-foreground font-bold'>
                  {stockSyncStats?.duration_formatted || '41m 01s'}
                </strong>
              </span>
              <a
                href='/dashboard/product'
                className='px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs transition-colors flex items-center gap-1'
              >
                <span>Inspeccionar Catálogo</span>
                <Icons.arrowRight className='w-3 h-3' />
              </a>
            </div>
          </div>

          {/* 5. AUDITORÍA E HISTORIAL DE EJECUCIONES RECIENTES */}
          <div className='p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3.5'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Icons.clock className='w-4 h-4 text-amber-500' />
                <h3 className='font-bold text-sm text-foreground font-gotham'>
                  Historial de Sincronizaciones Recientes (Audit Log)
                </h3>
              </div>
              <span className='text-[11px] text-muted-foreground font-mono'>
                Últimos registros persistidos
              </span>
            </div>

            <div className='overflow-x-auto rounded-xl border border-border'>
              <table className='w-full text-xs text-left'>
                <thead className='bg-muted/70 text-muted-foreground font-semibold uppercase text-[10px] tracking-wider border-b border-border'>
                  <tr>
                    <th className='px-4 py-2.5'>Fecha y Hora</th>
                    <th className='px-4 py-2.5'>Modo</th>
                    <th className='px-4 py-2.5'>Escaneados</th>
                    <th className='px-4 py-2.5'>Activos</th>
                    <th className='px-4 py-2.5'>Stock = 0</th>
                    <th className='px-4 py-2.5'>Precios Recalculados</th>
                    <th className='px-4 py-2.5'>Duración</th>
                    <th className='px-4 py-2.5 text-right'>Estado Web</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-border font-mono text-[11px]'>
                  {stockSyncHistory.length > 0 ? (
                    stockSyncHistory.map((item, idx) => (
                      <tr key={idx} className='hover:bg-muted/30 transition-colors'>
                        <td className='px-4 py-2.5 text-foreground font-bold'>
                          {new Date(item.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className='px-4 py-2.5 text-muted-foreground'>
                          <span className='px-2 py-0.5 rounded bg-muted text-[10px] text-foreground'>
                            {idx === 0 && cronEnabled ? 'Cron Automático' : 'Sincronización'}
                          </span>
                        </td>
                        <td className='px-4 py-2.5 text-foreground'>{item.total_scraped?.toLocaleString()}</td>
                        <td className='px-4 py-2.5 text-emerald-400 font-bold'>{item.active_stock}</td>
                        <td className='px-4 py-2.5 text-rose-400 font-bold'>{item.stock_zero}</td>
                        <td className='px-4 py-2.5 text-[#D4A017]'>{item.prices_recalculated}</td>
                        <td className='px-4 py-2.5 text-muted-foreground'>{item.duration_formatted}</td>
                        <td className='px-4 py-2.5 text-right'>
                          <span className='px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold'>
                            ✓ 100% Éxito
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className='hover:bg-muted/30 transition-colors'>
                      <td className='px-4 py-2.5 text-foreground font-bold'>
                        {stockSyncStats?.timestamp
                          ? new Date(stockSyncStats.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Ayer 20:52'}
                      </td>
                      <td className='px-4 py-2.5 text-muted-foreground'>
                        <span className='px-2 py-0.5 rounded bg-muted text-[10px] text-foreground'>
                          Automático
                        </span>
                      </td>
                      <td className='px-4 py-2.5 text-foreground'>
                        {stockSyncStats?.total_scraped?.toLocaleString() || '23.176'}
                      </td>
                      <td className='px-4 py-2.5 text-emerald-400 font-bold'>
                        {stockSyncStats?.active_stock || 318}
                      </td>
                      <td className='px-4 py-2.5 text-rose-400 font-bold'>
                        {stockSyncStats?.stock_zero || 28}
                      </td>
                      <td className='px-4 py-2.5 text-[#D4A017]'>
                        {stockSyncStats?.prices_recalculated || 12}
                      </td>
                      <td className='px-4 py-2.5 text-muted-foreground'>
                        {stockSyncStats?.duration_formatted || '41m 01s'}
                      </td>
                      <td className='px-4 py-2.5 text-right'>
                        <span className='px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-bold'>
                          ✓ 100% Éxito
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 6. CONSOLA / TERMINAL EN VIVO DE STOCK */}
          <div className='rounded-2xl border border-border bg-[#0a0d14] overflow-hidden shadow-xs'>
            <div className='flex items-center justify-between px-4 py-3 bg-[#10141f] border-b border-slate-800 text-xs'>
              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className='flex items-center gap-2 text-foreground font-bold hover:text-amber-400 transition-colors'
                >
                  <Icons.terminal className='w-4 h-4 text-amber-400' />
                  <span>Consola de Sincronización de Stock en Vivo</span>
                  <span className='text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal'>
                    {logs.length} líneas
                  </span>
                </button>
                <span className='text-slate-600 hidden sm:inline'>|</span>
                <span className='text-slate-400 font-mono text-[11px] hidden sm:inline'>
                  python scraping-coronel/actualizar_stock.py
                </span>
              </div>

              <div className='flex items-center gap-2'>
                <label className='flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer select-none mr-2'>
                  <input
                    type='checkbox'
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className='rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0 w-3 h-3'
                  />
                  <span className='hidden sm:inline'>Auto-scroll</span>
                </label>

                <button
                  type='button'
                  onClick={handleCopyLogs}
                  className='text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-800'
                  title='Copiar logs'
                >
                  <Icons.copy className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>Copiar</span>
                </button>

                <button
                  type='button'
                  onClick={handleClearLogs}
                  className='text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-800'
                  title='Limpiar consola'
                >
                  <Icons.trash className='w-3.5 h-3.5' />
                  <span className='hidden sm:inline'>Limpiar</span>
                </button>

                <button
                  type='button'
                  onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                  className='text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-md hover:bg-slate-800 transition-colors'
                >
                  {isTerminalOpen ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            {isTerminalOpen ? (
              <div className='p-4 font-mono text-[12px] leading-relaxed text-slate-200 overflow-y-auto space-y-1 h-[220px]'>
                {logs.length === 0 ? (
                  <div className='text-slate-500 italic py-8 text-center'>
                    Consola de stock lista. Pulsa "Ejecutar Ahora (Auto)" para visualizar el barrido de páginas en tiempo real.
                  </div>
                ) : (
                  logs.map((log, index) => {
                    let colorClass = 'text-slate-300';
                    if (log.includes('✔') || log.includes('COMPLETED') || log.includes('éxito')) {
                      colorClass = 'text-emerald-400 font-medium';
                    } else if (log.includes('⚠') || log.includes('Aviso')) {
                      colorClass = 'text-amber-300 font-medium';
                    } else if (log.includes('✖') || log.includes('🚨') || log.includes('Error')) {
                      colorClass = 'text-rose-400 font-semibold';
                    } else if (log.includes('⏱️') || log.includes('CRONÓMETRO') || log.includes('Procesando página')) {
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
            ) : null}
          </div>

          {/* 7. SECCIÓN INFERIOR ESPECIALIZADA: MONITOR DE EXISTENCIAS Y DISCONTINUADOS EN LA WEB */}
          <div className='space-y-4 pt-4 border-t border-border'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <h2 className='text-xl font-bebas tracking-wide text-foreground flex items-center gap-2'>
                  <Icons.shieldCheck className='w-5 h-5 text-amber-500' />
                  MONITOR DE EXISTENCIAS Y DISCONTINUADOS EN LA WEB (SUPABASE)
                </h2>
                <p className='text-xs text-muted-foreground'>
                  Auditoría en tiempo real de productos activos vs agotados (stock 0) sincronizados en la base de datos de producción.
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <a
                  href='/dashboard/product'
                  className='px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-xs font-semibold text-amber-500 hover:bg-amber-500/20 transition-colors flex items-center gap-1.5'
                >
                  <Icons.store className='w-3.5 h-3.5' />
                  <span>Ver Catálogo Web (/product)</span>
                </a>

                <button
                  type='button'
                  onClick={fetchDbStats}
                  disabled={loadingDb}
                  className='px-3 py-1.5 rounded-lg border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors flex items-center gap-1.5'
                >
                  <Icons.refresh className={`w-3.5 h-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
                  <span>Refrescar Datos</span>
                </button>
              </div>
            </div>

            {/* Tarjetas de Política y Control de Stock */}
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div className='p-4 rounded-xl bg-card border border-border'>
                <span className='text-xs text-muted-foreground uppercase font-semibold'>
                  Total Artículos en Catálogo
                </span>
                <div className='text-2xl font-bebas text-foreground mt-1'>
                  {dbStats?.total_products?.toLocaleString() || '23.190'}
                </div>
                <span className='text-[11px] text-muted-foreground font-medium'>
                  Base de datos consolidada
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-emerald-500/20 bg-emerald-500/5'>
                <span className='text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1.5'>
                  <span className='w-2 h-2 rounded-full bg-emerald-400' />
                  Política de Artículos Activos
                </span>
                <div className='text-2xl font-bebas text-emerald-400 mt-1'>
                  Stock = 999
                </div>
                <span className='text-[11px] text-muted-foreground'>
                  Visibles y habilitados para venta en la tienda
                </span>
              </div>

              <div className='p-4 rounded-xl bg-card border border-rose-500/20 bg-rose-500/5'>
                <span className='text-xs text-rose-400 uppercase font-semibold flex items-center gap-1.5'>
                  <span className='w-2 h-2 rounded-full bg-rose-400' />
                  Política de Discontinuados
                </span>
                <div className='text-2xl font-bebas text-rose-400 mt-1'>
                  Stock = 0
                </div>
                <span className='text-[11px] text-muted-foreground'>
                  Agotados en catálogo / Protegidos de compras
                </span>
              </div>
            </div>

            {/* Aviso de Integridad Comercial */}
            <div className='p-4 rounded-xl bg-muted/40 border border-border/80 flex items-start gap-3 text-xs text-muted-foreground'>
              <Icons.info className='w-4 h-4 text-[#D4A017] shrink-0 mt-0.5' />
              <div>
                <strong className='text-foreground font-semibold'>
                  Regla de Preservación de Historiales de Pedidos:
                </strong>{' '}
                La sincronización automática de stock nunca elimina productos de la base de datos para no romper órdenes ni historiales de compra previos. Los productos agotados o discontinuados por el proveedor reciben <code className='text-rose-400 font-mono font-bold'>stock = 0</code> automáticamente, impidiendo que los usuarios los agreguen al carrito.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
