'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Logo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';
import { formatPrice } from '@/lib/whatsapp';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectCategory: (slug: string) => void;
}

export function StoreHeader({
  searchQuery,
  onSearchChange,
  onSelectCategory
}: StoreHeaderProps) {
  const { setOpen, getSummary, wholesaleMode, toggleWholesaleMode } = useCartStore();
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const summary = getSummary();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/80 transition-all font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo de la Marca */}
          <div className="shrink-0 flex items-center gap-3">
            <Logo size="md" />
          </div>

          {/* Menú de Categorías (Dropdown) y Buscador */}
          <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
            {/* Botón selector de las 24 categorías */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen((v) => !v)}
                className="h-10 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-foreground"
              >
                <Icons.filter className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Rubros (24)</span>
                <Icons.chevronDown className="w-3.5 h-3.5 text-[#6C757D]" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-card border border-border/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2 py-1.5 text-[11px] font-bold text-[#6C757D] uppercase tracking-wider font-gotham">
                    24 Categorías Oficiales
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setIsCategoryMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#E63946]/10 hover:text-[#E63946] flex items-center justify-between transition-colors"
                  >
                    <span>Todos los Departamentos</span>
                    <Icons.chevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <div className="h-px bg-border/60 my-1" />

                  {PRODUCT_CATEGORIES.map((cat) => {
                    const IconComponent = (Icons as any)[cat.icon] || Icons.product;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-2 rounded-xl text-xs hover:bg-muted flex items-center justify-between transition-colors text-foreground"
                      >
                        <span className="flex items-center gap-2 truncate">
                          <IconComponent className="w-3.5 h-3.5 text-[#E63946] shrink-0" />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {cat.isSeasonal && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017] font-bold shrink-0">
                            Estacional
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input de Búsqueda */}
            <div className="relative flex-1">
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por producto, marca, SKU o palabra clave..."
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-border/80 bg-card focus:bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-foreground"
                >
                  <Icons.close className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones del Lado Derecho */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Modo Nocturno / Diurno */}
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Cambiar a Modo Diurno (Fondo blanco)' : 'Cambiar a Modo Nocturno'}
              aria-label="Alternar tema diurno y nocturno"
              className="h-10 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs text-foreground group"
            >
              {isDark ? (
                <>
                  <Icons.sun className="w-4 h-4 text-[#D4A017] group-hover:rotate-45 transition-transform duration-300" />
                  <span className="hidden sm:inline text-xs font-medium text-foreground">Diurno</span>
                </>
              ) : (
                <>
                  <Icons.moon className="w-4 h-4 text-[#6C757D] group-hover:-rotate-12 transition-transform duration-300" />
                  <span className="hidden sm:inline text-xs font-medium text-foreground">Nocturno</span>
                </>
              )}
            </button>

            {/* Toggle Modo Mayorista */}
            <button
              onClick={toggleWholesaleMode}
              title="Alternar vista de precios al mayor"
              className={`hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                wholesaleMode
                  ? 'bg-[#D4A017]/15 border-[#D4A017]/40 text-[#D4A017] shadow-sm shadow-[#D4A017]/20'
                  : 'bg-card hover:bg-muted border-border text-[#6C757D] hover:text-foreground'
              }`}
            >
              <Icons.tags className="w-3.5 h-3.5" />
              <span>{wholesaleMode ? 'Mayorista' : 'Detal'}</span>
            </button>

            {/* Enlace al Panel Administrativo */}
            <Link
              href="/dashboard/overview"
              title="Panel Administrativo"
              className="h-10 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted text-xs font-semibold text-[#6C757D] hover:text-foreground hidden lg:flex items-center gap-1.5 transition-colors"
            >
              <Icons.dashboard className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            {/* Botón del Carrito con Rojo Pasión y Dorado */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir carrito"
              className="relative h-10 px-3 sm:px-4 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#E63946]/25 transition-all cursor-pointer"
            >
              <Icons.cart className="w-4 h-4" />
              <span className="hidden sm:inline font-bebas text-base tracking-wider">
                {summary.subtotal > 0 ? formatPrice(summary.subtotal) : 'CARRITO'}
              </span>

              {summary.total_items > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D4A017] text-white text-[11px] font-black flex items-center justify-center animate-bounce shadow-sm">
                  {summary.total_items}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C757D] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar entre 24 categorías..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border bg-card text-xs text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D]"
              >
                <Icons.close className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
