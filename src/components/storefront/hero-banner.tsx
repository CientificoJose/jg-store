'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';

interface HeroBannerProps {
  onExploreCatalog: () => void;
}

export function HeroBanner({ onExploreCatalog }: HeroBannerProps) {
  const { wholesaleMode, toggleWholesaleMode } = useCartStore();

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-950/20 via-background to-background border-b border-border/50 py-12 sm:py-16">
      {/* Elementos visuales de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
            <Icons.sparkles className="w-3.5 h-3.5" />
            <span>Venta Mayorista B2B & Detal B2C • 24 Departamentos</span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Precios Directos de Distribución{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500">
              al Detal y al Mayor
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Compra desde 1 unidad a precio de detal o aprovecha descuentos automáticos por cantidad con precio mayorista. Control de stock en tiempo real y cierre de pedido directo por WhatsApp.
          </p>

          {/* Botones de Acción */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 transition-all cursor-pointer"
            >
              <Icons.product className="w-4 h-4" />
              <span>Explorar Catálogo</span>
            </button>

            <button
              onClick={toggleWholesaleMode}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                wholesaleMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm shadow-amber-500/20 ring-2 ring-amber-500/20'
                  : 'bg-background hover:bg-muted border-border text-foreground'
              }`}
            >
              <Icons.tags className="w-4 h-4" />
              <span>
                {wholesaleMode ? '✓ Modo Mayorista Activo' : 'Ver Precios al Mayor'}
              </span>
            </button>
          </div>

          {/* 4 Pilares de Confianza */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left">
            <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Icons.tags className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Doble Precio Dinámico</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Descuento automático al superar la cantidad mayorista.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                <Icons.package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Stock en Tiempo Real</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Inventario físico actualizado sin sorpresas.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icons.whatsapp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Pedido por WhatsApp</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Mensaje estructurado con SKU, total y ahorro.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Icons.truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Envíos y Retiros</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                  Despachos a todo el país o retiro en sucursal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
