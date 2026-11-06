'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';

interface StoreFooterProps {
  onSelectCategory?: (slug: string) => void;
  onResetHome?: () => void;
}

export function StoreFooter({ onResetHome }: StoreFooterProps) {
  const general = useStoreConfigStore((s) => s.general);
  const cleanPhone = (general.whatsappNumber || '5491155550000').replace(/[^0-9]/g, '');

  return (
    <footer className="w-full bg-card border-t border-border/80 mt-16 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16">
          
          {/* Columna 1: JG Store / Pancho Recargas */}
          <div className="md:col-span-7 space-y-4">
            <Logo size="lg" onClick={onResetHome} />
            <p className="text-xs text-[#6C757D] leading-relaxed">
              {general.footerDescription ||
                'Distribuidora oficial y polirrubro líder en ventas al por menor y mayor. Calidad garantizada, envíos a todo el país y atención comercial personalizada.'}
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

          {/* Columna 2: Institucional & Empresa (Enlaces directos a /nosotros con scroll a cada sección) */}
          <div className="md:col-span-5">
            <h3 className="text-base font-bebas tracking-wide uppercase text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63946]" />
              <span>Nuestra Empresa</span>
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/nosotros#mision"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-[#E63946]" />
                  <span>Misión & Visión</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros#equipo"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-[#E63946]" />
                  <span>Nuestro Equipo</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros#valores"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-[#E63946]" />
                  <span>Valores & Propósitos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros#historia"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-[#E63946]" />
                  <span>Nuestra Historia</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros#local-fisico"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-[#D4A017]" />
                  <span>Local Físico & Instalaciones</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros#preguntas-frecuentes"
                  className="text-[#6C757D] hover:text-[#E63946] transition-colors text-left cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.chevronRight className="w-3 h-3 text-emerald-500" />
                  <span>Preguntas Frecuentes (FAQ)</span>
                </Link>
              </li>
            </ul>
          </div>


        </div>

        {/* Barra Inferior */}
        <div className="mt-12 pt-6 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6C757D] gap-4">
          <p className="flex items-center gap-1.5 flex-wrap">
            <span>© {new Date().getFullYear()} {general.storeName || 'Pancho Recargas'} • Todos los derechos reservados.</span>
            <Link
              href="/admin"
              className="text-[#6C757D]/25 hover:text-[#E63946] transition-colors p-0.5 rounded cursor-pointer"
              title="Acceso Administrativo"
              aria-label="Acceso Administrativo"
            >
              <Icons.settings className="w-3 h-3" />
            </Link>
          </p>
          <div className="flex items-center gap-4">
            <Link href="/nosotros#local-fisico" className="hover:text-foreground transition-colors cursor-pointer">Local Físico</Link>
            <span>•</span>
            <span>Envíos Nacionales</span>
            <span>•</span>
            <Link href="/nosotros#preguntas-frecuentes" className="hover:text-foreground transition-colors cursor-pointer">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
