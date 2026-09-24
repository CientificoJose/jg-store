'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  const summary = getSummary();

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/70 transition-all">
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
                className="h-10 px-3 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Icons.filter className="w-3.5 h-3.5 text-blue-500" />
                <span>Rubros (24)</span>
                <Icons.chevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute left-0 mt-2 w-72 max-h-96 overflow-y-auto rounded-2xl bg-card border border-border shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground uppercase">
                    24 Categorías Oficiales
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory('all');
                      setIsCategoryMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Icons.product className="w-3.5 h-3.5 text-blue-500" />
                    <span>Todas las categorías</span>
                  </button>
                  {PRODUCT_CATEGORIES.map((cat) => {
                    const IconComp = (Icons as any)[cat.icon] || Icons.product;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setIsCategoryMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <IconComp className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="truncate">{cat.name}</span>
                        </div>
                        {cat.isSeasonal && (
                          <span className="text-[9px] text-amber-500 font-bold px-1 bg-amber-500/10 rounded">
                            Est.
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
              <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por producto, marca, SKU o palabra clave..."
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-border bg-muted/30 focus:bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <Icons.close className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Acciones del Lado Derecho */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Toggle Modo Mayorista */}
            <button
              onClick={toggleWholesaleMode}
              title="Alternar vista de precios al mayor"
              className={`hidden sm:flex items-center gap-1.5 h-10 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                wholesaleMode
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-sm shadow-amber-500/20'
                  : 'bg-muted/30 hover:bg-muted border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icons.tags className="w-3.5 h-3.5" />
              <span>{wholesaleMode ? 'Mayorista' : 'Detal'}</span>
            </button>

            {/* Enlace al Panel Administrativo */}
            <Link
              href="/dashboard/overview"
              title="Panel Administrativo"
              className="h-10 px-3 rounded-xl border border-border/80 bg-background hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground hidden lg:flex items-center gap-1.5 transition-colors"
            >
              <Icons.dashboard className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>

            {/* Botón del Carrito con Badge Dinámico */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir carrito"
              className="relative h-10 px-3 sm:px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Icons.cart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {summary.subtotal > 0 ? formatPrice(summary.subtotal) : 'Carrito'}
              </span>

              {summary.total_items > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 text-[11px] font-black flex items-center justify-center animate-bounce">
                  {summary.total_items}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="pb-3 md:hidden">
          <div className="relative w-full">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar entre 24 categorías..."
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border bg-muted/40 text-xs text-foreground focus:ring-1 focus:ring-blue-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
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
