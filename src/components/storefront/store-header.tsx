'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Logo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { useCartStore } from '@/hooks/use-cart-store';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { formatPrice } from '@/lib/whatsapp';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectCategory: (slug: string) => void;
  selectedCategory?: string;
}

export function StoreHeader({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedCategory = 'all'
}: StoreHeaderProps) {
  const { setOpen, getSummary, wholesaleMode, toggleWholesaleMode } = useCartStore();
  const { favoriteIds, showOnlyFavorites, toggleShowOnlyFavorites } = useFavoritesStore();
  const favoriteCount = favoriteIds.length;
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const summary = getSummary();

  const activeCategory = PRODUCT_CATEGORIES.find((c) => c.slug === selectedCategory);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');

  // Estado local del buscador para disparar la búsqueda únicamente al presionar Enter o enviar
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(localSearch.trim());
  };

  const handleClearSearch = () => {
    setLocalSearch('');
    onSearchChange('');
  };

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
                className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeCategory
                    ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]'
                    : 'border-border/80 bg-card hover:bg-muted text-foreground'
                }`}
              >
                <Icons.filter className="w-3.5 h-3.5 text-[#E63946]" />
                <span className="max-w-[130px] truncate">{activeCategory ? activeCategory.name : 'Rubros (24)'}</span>
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
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      !activeCategory
                        ? 'bg-[#E63946] text-white font-bold'
                        : 'hover:bg-[#E63946]/10 hover:text-[#E63946] text-foreground'
                    }`}
                  >
                    <span>Todos los Departamentos</span>
                    <Icons.chevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <div className="h-px bg-border/60 my-1" />

                  {PRODUCT_CATEGORIES.map((cat) => {
                    const IconComponent = (Icons as any)[cat.icon] || Icons.product;
                    const isCatSelected = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onSelectCategory(cat.slug);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isCatSelected
                            ? 'bg-[#E63946] text-white font-bold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <IconComponent
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isCatSelected ? 'text-white' : 'text-[#E63946]'
                            }`}
                          />
                          <span className="truncate">{cat.name}</span>
                        </span>
                        {cat.isSeasonal && (
                          <span
                            className={`text-[9px] uppercase px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                              isCatSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-[#D4A017]/20 text-[#D4A017]'
                            }`}
                          >
                            Estacional
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input de Búsqueda con disparador en Enter */}
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <button
                type="submit"
                title="Buscar (Presiona Enter)"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6C757D] hover:text-[#E63946] transition-colors cursor-pointer"
              >
                <Icons.search className="w-4 h-4" />
              </button>
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={
                  activeCategory
                    ? `Buscar en ${activeCategory.name}... (Enter para buscar)`
                    : 'Buscar por producto, marca, SKU o palabra clave (Enter para buscar)...'
                }
                className="w-full h-10 pl-9 pr-8 rounded-xl border border-border/80 bg-card focus:bg-background text-xs sm:text-sm text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] transition-all outline-none"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  title="Borrar búsqueda"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] hover:text-foreground cursor-pointer p-0.5"
                >
                  <Icons.close className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
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

            {/* Botón Mis Favoritos */}
            <Link
              href="/favoritos"
              title="Ver mi lista de productos favoritos"
              aria-label="Ver productos favoritos"
              className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                favoriteCount > 0
                  ? 'bg-card hover:bg-muted border-[#FF85A2]/60 text-[#E63946]'
                  : 'bg-card hover:bg-muted border-border text-[#6C757D] hover:text-foreground'
              }`}
            >
              <Icons.heart className={`w-3.5 h-3.5 ${favoriteCount > 0 ? 'fill-current text-[#E63946]' : ''}`} />
              <span className="hidden sm:inline">Favoritos</span>
              {favoriteCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E63946] text-white">
                  {favoriteCount}
                </span>
              )}
            </Link>

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

        {/* Buscador móvil con disparador en Enter */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6C757D] hover:text-[#E63946]"
            >
              <Icons.search className="w-4 h-4" />
            </button>
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder={
                activeCategory
                  ? `Buscar en ${activeCategory.name}...`
                  : 'Buscar entre 24 categorías (Enter para buscar)...'
              }
              className="w-full h-9 pl-9 pr-8 rounded-xl border border-border bg-card text-xs text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
            />
            {localSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6C757D] p-0.5"
              >
                <Icons.close className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}
