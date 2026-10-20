'use client';

import React, { useState, useEffect } from 'react';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '@/features/products/api/queries';

interface CatalogResetDialogProps {
  onSuccess?: () => void;
  triggerButtonText?: string;
  className?: string;
  compact?: boolean;
}

export function CatalogResetDialog({
  onSuccess,
  triggerButtonText = 'Vaciar Catálogo y Categorías',
  className = '',
  compact = false
}: CatalogResetDialogProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [clearSqlite, setClearSqlite] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejador del temporizador de 5 segundos de seguridad
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isOpen) {
      setCountdown(5);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timer) clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setCountdown(5);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isOpen]);

  const handleReset = async () => {
    if (countdown > 0 || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/catalog/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clear_supabase: true,
          clear_sqlite: clearSqlite
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al vaciar catálogo');
      }

      toast.success(
        '¡Catálogo y categorías vaciados con éxito! La tienda y el scraper están en 0 listos para pruebas.'
      );

      // Invalida la caché de React Query para refrescar tablas al instante
      await queryClient.invalidateQueries({ queryKey: productKeys.all });

      setIsOpen(false);
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || 'Error al ejecutar vaciado');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Botón Disparador */}
      <button
        type='button'
        onClick={() => setIsOpen(true)}
        className={`rounded-xl font-bold transition-all flex items-center gap-1.5 border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/50 active:scale-95 shadow-xs ${
          compact ? 'px-2.5 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs'
        } ${className}`}
        title='Vaciar todos los productos y categorías para pruebas limpias'
      >
        <Icons.trash className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        <span>{triggerButtonText}</span>
      </button>

      {/* Modal de Advertencia con Cuenta Regresiva de 5 Segundos */}
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200'>
          <div className='w-full max-w-lg rounded-2xl border border-rose-500/40 bg-card p-6 shadow-2xl space-y-5 text-foreground font-gotham'>
            {/* Cabecera de Alerta */}
            <div className='flex items-start gap-3.5'>
              <div className='w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center shrink-0 animate-pulse'>
                <Icons.warning className='w-6 h-6' />
              </div>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <h3 className='text-base font-bold text-rose-500 uppercase tracking-wide font-gotham'>
                    ZONA DE PELIGRO: ACCIÓN SIN RETORNO
                  </h3>
                  <span className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30'>
                    Irreversible
                  </span>
                </div>
                <p className='text-xs text-muted-foreground leading-relaxed'>
                  Esta operación eliminará permanentemente los datos para que puedas iniciar pruebas del
                  scraper y la migración completamente desde cero.
                </p>
              </div>
            </div>

            {/* Cuadro de Detalles de Eliminación */}
            <div className='p-3.5 rounded-xl bg-muted/60 border border-border/80 space-y-2 text-xs'>
              <div className='font-semibold text-foreground flex items-center gap-1.5'>
                <Icons.alertCircle className='w-4 h-4 text-amber-500' />
                <span>¿Qué se eliminará exactamente?</span>
              </div>
              <ul className='list-disc list-inside space-y-1 text-muted-foreground text-[11px] pl-1'>
                <li>
                  <strong className='text-foreground'>Todos los productos:</strong> Precios, fotos,
                  stock, SKU y códigos EAN-13 en Supabase Dokploy.
                </li>
                <li>
                  <strong className='text-foreground'>Toda la taxonomía:</strong> Categorías,
                  subcategorías y líneas de productos creadas.
                </li>
                <li>
                  <strong className='text-foreground'>Variantes y favoritos:</strong> Cualquier
                  variante o ítem de prueba en favoritos.
                </li>
              </ul>
            </div>

            {/* Opciones de Borrado */}
            <div className='space-y-2.5 pt-1'>
              <label className='flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none'>
                <input
                  type='checkbox'
                  checked={true}
                  disabled={true}
                  className='rounded border-border text-rose-500 focus:ring-rose-500 w-4 h-4 opacity-80 cursor-not-allowed'
                />
                <span className='font-medium'>
                  Vaciar base de datos web de Supabase PostgreSQL (Obligatorio)
                </span>
              </label>

              <label className='flex items-center gap-2.5 text-xs text-foreground cursor-pointer select-none'>
                <input
                  type='checkbox'
                  checked={clearSqlite}
                  onChange={(e) => setClearSqlite(e.target.checked)}
                  disabled={isSubmitting}
                  className='rounded border-border text-rose-500 focus:ring-rose-500 w-4 h-4 cursor-pointer'
                />
                <span className='font-medium'>
                  Vaciar también la base de datos de extracción local (SQLite{' '}
                  <code className='text-[11px] bg-muted px-1 py-0.5 rounded'>productos.db</code> del
                  Scraper)
                </span>
              </label>
            </div>

            {/* Barra de Progreso del Temporizador de 5 Segundos */}
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                <span>Tiempo de reflexión y seguridad:</span>
                <span className='font-mono font-bold text-foreground'>
                  {countdown > 0 ? `${countdown} segundos restantes` : '✓ Confirmación habilitada'}
                </span>
              </div>
              <div className='w-full h-1.5 rounded-full bg-muted overflow-hidden'>
                <div
                  className={`h-full transition-all duration-1000 ${
                    countdown === 0 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className='flex items-center justify-end gap-3 pt-2 border-t border-border/80'>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
                className='px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50'
              >
                Cancelar
              </button>

              <button
                type='button'
                onClick={handleReset}
                disabled={countdown > 0 || isSubmitting}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  countdown > 0
                    ? 'bg-muted text-muted-foreground opacity-60 cursor-not-allowed border border-border'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30 active:scale-95 animate-pulse ring-2 ring-rose-500/40'
                }`}
              >
                {isSubmitting ? (
                  <Icons.spinner className='w-4 h-4 animate-spin' />
                ) : countdown > 0 ? (
                  <Icons.clock className='w-4 h-4 text-amber-500' />
                ) : (
                  <Icons.trash className='w-4 h-4' />
                )}
                <span>
                  {isSubmitting
                    ? 'Vaciando base de datos...'
                    : countdown > 0
                      ? `Confirmación requerida (${countdown}s)`
                      : '🚨 SÍ, ELIMINAR TODO DEFINITIVAMENTE'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
