'use client';

import React from 'react';
import { Icons } from '@/components/icons';
import { PromoCarousel } from './promo-carousel';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';

interface HeroBannerProps {
  onExploreCatalog: () => void;
  onSelectCategory?: (category: string) => void;
}

export function HeroBanner({ onExploreCatalog, onSelectCategory }: HeroBannerProps) {
  const showTrustBadges = useStoreConfigStore((s) => s.landing.showTrustBadges);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-[#E63946]/5 via-background to-background pt-4 pb-6 sm:pb-8 transition-colors duration-200">
      {/* Elementos ambientales de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-20 left-1/4 w-80 h-80 bg-[#E63946]/10 rounded-full blur-3xl" />
        <div className="absolute top-10 right-1/4 w-80 h-80 bg-[#D4A017]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 1. Carrusel de Banners Promocionales e Imágenes */}
        <PromoCarousel
          onExploreCatalog={onExploreCatalog}
          onSelectCategory={onSelectCategory}
        />

        {/* 2. Los 4 Pilares de Confianza JG Store Argentina (Configurables) */}
        {showTrustBadges && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-left font-gotham animate-in fade-in duration-200">
          {/* Pilar 1: Mayorista */}
          <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs hover:border-[#D4A017]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#D4A017]/15 text-[#D4A017] flex items-center justify-center shrink-0">
              <Icons.tags className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Tarifa Mayorista</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Desbloqueo a partir de $ 50.000 o por bulto cerrado.
              </p>
            </div>
          </div>

          {/* Pilar 2: Stock */}
          <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs hover:border-[#E63946]/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0">
              <Icons.package className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Stock en Tiempo Real</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Inventario físico actualizado en 24 departamentos.
              </p>
            </div>
          </div>

          {/* Pilar 3: Pagos */}
          <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs hover:border-emerald-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Icons.billing className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Mercado Pago & CBU</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                10% OFF en transferencia bancaria o cuotas con tarjeta.
              </p>
            </div>
          </div>

          {/* Pilar 4: Envíos */}
          <div className="p-3.5 rounded-xl bg-card border border-border/70 flex items-start gap-3 shadow-xs hover:border-blue-500/40 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Icons.truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Envíos a Todo el País</h4>
              <p className="text-[11px] text-[#6C757D] mt-0.5 leading-snug">
                Expresos al interior, Andreani o retiro en depósito.
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
