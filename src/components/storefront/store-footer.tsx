'use client';

import React from 'react';
import { Logo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';

interface StoreFooterProps {
  onSelectCategory: (slug: string) => void;
  onResetHome?: () => void;
}

export function StoreFooter({ onSelectCategory, onResetHome }: StoreFooterProps) {
  const general = useStoreConfigStore((s) => s.general);
  const cleanPhone = (general.whatsappNumber || '5491155550000').replace(/[^0-9]/g, '');

  // Categorías divididas en 2 columnas de 12 para mostrar los 24 departamentos
  const firstColumnCategories = PRODUCT_CATEGORIES.slice(0, 12);
  const secondColumnCategories = PRODUCT_CATEGORIES.slice(12, 24);

  return (
    <footer className="w-full bg-card border-t border-border/80 mt-16 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          
          {/* Columna 1: JG Store */}
          <div className="space-y-4">
            <Logo size="lg" onClick={onResetHome} />
            <p className="text-xs text-[#6C757D] leading-relaxed">
              {general.footerDescription ||
                'Distribuidora y tienda departamental multirrubro. Ofrecemos catálogo mayorista para comerciantes y venta minorista al detal con precios altamente competitivos.'}
            </p>
            <div className="pt-2 flex flex-col gap-2 text-[#6C757D]">
              <div className="flex items-center gap-3">
                <a
                  href={`https://wa.me/${cleanPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                  title="WhatsApp Oficial"
                >
                  <Icons.whatsapp className="w-4 h-4" />
                </a>
                <span className="text-xs font-medium text-foreground">
                  +{cleanPhone}
                </span>
              </div>
              <span className="text-xs text-[#6C757D]">
                🕒 {general.schedule || 'Lunes a Sábado de 8:00 a 18:00 hs'}
              </span>
              {general.address && (
                <span className="text-xs text-[#6C757D]">
                  📍 {general.address}
                </span>
              )}
            </div>
          </div>

          {/* Columna 2: Departamentos (1 - 12) */}
          <div>
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground mb-3">
              Departamentos (1 - 12)
            </h3>
            <ul className="space-y-2 text-xs">
              {firstColumnCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Departamentos (13 - 24) */}
          <div>
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground mb-3">
              Departamentos (13 - 24)
            </h3>
            <ul className="space-y-2 text-xs">
              {secondColumnCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C757D] gap-4">
          <p>© {new Date().getFullYear()} JG Store Polirubro • República Argentina. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>24 Departamentos</span>
            <span>•</span>
            <span>Envíos a todo el país</span>
            <span>•</span>
            <span>Mercado Pago & CBU</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
