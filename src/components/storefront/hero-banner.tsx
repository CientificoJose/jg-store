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
    <div className="relative overflow-hidden bg-gradient-to-b from-[#E63946]/10 via-background to-background border-b border-border/60 py-12 sm:py-16 transition-colors duration-200">
      {/* Elementos visuales de fondo con colores de marca */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-[#E63946]/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-96 h-96 bg-[#FF85A2]/15 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E63946]/10 border border-[#E63946]/20 text-[#E63946] text-xs font-semibold mb-6 font-gotham">
            <Icons.sparkles className="w-3.5 h-3.5" />
            <span>Venta Mayorista B2B & Detal B2C • 24 Departamentos</span>
          </div>

          {/* Título Principal con Bebas Neue */}
          <h1 className="font-bebas text-4xl sm:text-6xl tracking-wide text-foreground leading-[1.05]">
            Precios Directos de Distribución{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E63946] via-[#FF85A2] to-[#D4A017]">
              al Detal y al Mayor
            </span>
          </h1>

          {/* Subtítulo con Gotham */}
          <p className="mt-4 text-sm sm:text-base text-[#6C757D] max-w-2xl mx-auto leading-relaxed font-gotham">
            Compra desde 1 unidad a precio de detal o aprovecha descuentos automáticos por cantidad con precio mayorista. Control de stock en tiempo real y cierre de pedido directo por WhatsApp.
          </p>

          {/* Botones de Acción */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-gotham">
            <button
              onClick={onExploreCatalog}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-sm shadow-md shadow-[#E63946]/25 hover:shadow-lg hover:shadow-[#E63946]/35 transition-all cursor-pointer"
            >
              <Icons.product className="w-4 h-4" />
              <span>Explorar Catálogo</span>
            </button>

            <button
              onClick={toggleWholesaleMode}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                wholesaleMode
                  ? 'bg-[#D4A017]/15 border-[#D4A017]/40 text-[#D4A017] shadow-sm shadow-[#D4A017]/20 ring-2 ring-[#D4A017]/20'
                  : 'bg-card hover:bg-muted border-border text-foreground'
              }`}
            >
              <Icons.tags className="w-4 h-4" />
              <span>
                {wholesaleMode ? '✓ Modo Mayorista Activo' : 'Ver Precios al Mayor'}
              </span>
            </button>
          </div>

          {/* 4 Pilares de Confianza */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left font-gotham">
            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#D4A017]/10 text-[#D4A017] flex items-center justify-center shrink-0">
                <Icons.tags className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Doble Precio Dinámico</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                  Descuento automático al superar la cantidad mayorista.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
                <Icons.package className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Stock en Tiempo Real</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                  Inventario físico actualizado sin sorpresas.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icons.whatsapp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Pedido por WhatsApp</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                  Mensaje estructurado con SKU, total y ahorro.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#6C757D]/10 text-[#6C757D] flex items-center justify-center shrink-0">
                <Icons.truck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Envíos y Retiros</h4>
                <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
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
