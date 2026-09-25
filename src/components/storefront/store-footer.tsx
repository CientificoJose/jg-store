'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { PRODUCT_CATEGORIES } from '@/constants/categories';
import { JG_STORE_WHATSAPP_NUMBER } from '@/lib/whatsapp';

interface StoreFooterProps {
  onSelectCategory: (slug: string) => void;
}

export function StoreFooter({ onSelectCategory }: StoreFooterProps) {
  // Primeras 8 categorías destacadas para el pie de página
  const highlightedCategories = PRODUCT_CATEGORIES.slice(0, 8);
  const secondColumnCategories = PRODUCT_CATEGORIES.slice(8, 16);

  return (
    <footer className="w-full bg-card border-t border-border/80 mt-16 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Columna 1: JG Store */}
          <div className="space-y-4">
            <Logo size="lg" />
            <p className="text-xs text-[#6C757D] leading-relaxed">
              Distribuidora y tienda departamental multirrubro. Ofrecemos catálogo mayorista para comerciantes y venta minorista al detal con precios altamente competitivos.
            </p>
            <div className="pt-2 flex items-center gap-3 text-[#6C757D]">
              <a
                href={`https://wa.me/${JG_STORE_WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                title="WhatsApp Oficial"
              >
                <Icons.whatsapp className="w-4 h-4" />
              </a>
              <span className="text-xs text-[#6C757D]">
                Atención comercial: Lunes a Sábado 8:00 AM - 6:00 PM
              </span>
            </div>
          </div>

          {/* Columna 2: Categorías Principales */}
          <div>
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground mb-3">
              Departamentos (1 - 8)
            </h3>
            <ul className="space-y-2 text-xs">
              {highlightedCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 3: Más Departamentos */}
          <div>
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground mb-3">
              Departamentos (9 - 16)
            </h3>
            <ul className="space-y-2 text-xs">
              {secondColumnCategories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.slug);
                      window.scrollTo({ top: 350, behavior: 'smooth' });
                    }}
                    className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Políticas Comerciales y Acceso Interno */}
          <div className="space-y-4">
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground">
              Condiciones Comerciales
            </h3>
            <div className="space-y-2.5 text-xs text-[#6C757D]">
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80">
                <strong className="text-foreground block text-[11px] mb-0.5">🛒 Venta al Detal:</strong>
                Compra sin mínimo desde 1 unidad al precio PVP publicado.
              </div>
              <div className="p-3 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017]">
                <strong className="text-[#D4A017] block text-[11px] font-bold mb-0.5">🏷️ Venta al Mayor:</strong>
                Descuento directo por volumen al alcanzar la cantidad mínima de cada artículo.
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard/overview"
                className="text-xs font-semibold text-[#E63946] hover:text-[#d62839] flex items-center gap-1.5"
              >
                <Icons.dashboard className="w-3.5 h-3.5" />
                <span>Acceso al Panel Administrativo</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Barra Inferior */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C757D] gap-4">
          <p>© {new Date().getFullYear()} JG Store. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <span>24 Departamentos Oficiales</span>
            <span>•</span>
            <span>Pedidos vía WhatsApp</span>
            <span>•</span>
            <span>Stock en Línea</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
