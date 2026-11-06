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
import { useStoreConfigStore } from '@/hooks/use-store-config-store';

interface StoreHeaderProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  onSelectCategory: (categorySlug: string, subcategorySlug?: string) => void;
  selectedCategory?: string;
  selectedSubcategory?: string;
  onResetHome?: () => void;
}

export function StoreHeader({
  searchQuery,
  onSearchChange,
  onSelectCategory,
  selectedCategory = 'all',
  selectedSubcategory = 'all',
  onResetHome
}: StoreHeaderProps) {
  const { setOpen, getSummary, wholesaleMode, toggleWholesaleMode } = useCartStore();
  const showWholesaleHeaderToggle = useStoreConfigStore(
    (s) => s.landing?.showWholesaleHeaderToggle ?? false
  );
  const paymentPromoText = useStoreConfigStore((s) => s.landing?.paymentPromoText) || 'Cualquier tipo de pago • 3 cuotas sin interés con tarjeta • 10% OFF por transferencia';
  const showPaymentPromo = useStoreConfigStore((s) => s.landing?.showPaymentPromo) ?? true;
  const { favoriteIds, showOnlyFavorites, toggleShowOnlyFavorites } = useFavoritesStore();
  const favoriteCount = favoriteIds.length;
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const summary = getSummary();

  const activeCategory = PRODUCT_CATEGORIES.find((c) => c.slug === selectedCategory);
  const activeSubcategory = activeCategory?.subcategories?.find(
    (s) => s.slug === selectedSubcategory
  );

  const [hoveredCategorySlug, setHoveredCategorySlug] = useState<string>(
    selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'libreria'
  );

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      setHoveredCategorySlug(selectedCategory);
    } else {
      setHoveredCategorySlug('libreria');
    }
  }, [selectedCategory]);

  const sortedCategories = React.useMemo(() => {
    const lib = PRODUCT_CATEGORIES.find((c) => c.slug === 'libreria');
    const rest = PRODUCT_CATEGORIES.filter((c) => c.slug !== 'libreria');
    return lib ? [lib, ...rest] : PRODUCT_CATEGORIES;
  }, []);

  const hoveredCategory =
    PRODUCT_CATEGORIES.find((c) => c.slug === hoveredCategorySlug) ||
    sortedCategories[0];

  const isFilterActive = Boolean(
    (selectedCategory && selectedCategory !== 'all') ||
    (selectedSubcategory && selectedSubcategory !== 'all')
  );

  const buttonLabel = activeSubcategory
    ? activeSubcategory.name
    : activeCategory
    ? activeCategory.name
    : 'Categorías';

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');
  const safeFavoriteCount = mounted ? favoriteCount : 0;
  const safeTotalItems = mounted ? summary.total_items : 0;
  const safeSubtotal = mounted ? summary.subtotal : 0;

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

  const handleLogoClick = () => {
    setLocalSearch('');
    if (onResetHome) {
      onResetHome();
    } else {
      onSearchChange('');
      onSelectCategory('all');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/80 transition-all font-gotham">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-4">
          
          {/* Logo de la Marca */}
          <div className="shrink-0 flex items-center gap-3">
            <Logo size="md" onClick={handleLogoClick} />
          </div>

          {/* Menú de Categorías (Dropdown) y Buscador */}
          <div className="flex-1 max-w-xl hidden md:flex items-center gap-2">
            {/* Botón selector de las 24 categorías */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCategoryMenuOpen((v) => !v)}
                className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFilterActive
                    ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946]'
                    : 'border-border/80 bg-card hover:bg-muted text-foreground'
                }`}
              >
                <Icons.layout className="w-3.5 h-3.5 text-[#E63946]" />
                <span className="max-w-[140px] truncate">{buttonLabel}</span>
                <Icons.chevronDown
                  className={`w-3.5 h-3.5 text-[#6C757D] transition-transform duration-200 ${
                    isCategoryMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isCategoryMenuOpen && (
                <div
                  onMouseLeave={() => setIsCategoryMenuOpen(false)}
                  className="absolute left-0 top-full mt-2 w-[720px] max-w-[calc(100vw-2rem)] h-[460px] max-h-[80vh] flex rounded-2xl bg-card border border-border/80 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
                >
                  {/* Columna Izquierda: Categorías principales */}
                  <div className="w-64 sm:w-72 border-r border-border/70 flex flex-col bg-muted/20 shrink-0">
                    <div className="p-3 border-b border-border/60 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Categorías
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('all', 'all');
                          setIsCategoryMenuOpen(false);
                        }}
                        className="text-[11px] font-semibold text-[#E63946] hover:underline cursor-pointer"
                      >
                        Ver todo
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
                      {/* Opción Todos los Departamentos */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectCategory('all', 'all');
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                          !isFilterActive
                            ? 'bg-[#E63946] text-white shadow-xs'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Icons.layout className="w-3.5 h-3.5" />
                          <span>Todos los Departamentos</span>
                        </span>
                        <Icons.chevronRight className="w-3.5 h-3.5 opacity-60" />
                      </button>

                      <div className="h-px bg-border/50 my-1" />

                      {sortedCategories.map((cat) => {
                        const isHovered = hoveredCategorySlug === cat.slug;
                        const isSelected = selectedCategory === cat.slug;
                        const IconComponent = (Icons as any)[cat.icon] || Icons.product;

                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onMouseEnter={() => setHoveredCategorySlug(cat.slug)}
                            onClick={() => {
                              onSelectCategory(cat.slug, 'all');
                              setIsCategoryMenuOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                              isHovered
                                ? 'bg-[#E63946]/10 text-[#E63946] font-bold'
                                : isSelected
                                ? 'bg-muted text-foreground font-semibold'
                                : 'hover:bg-muted/70 text-foreground'
                            }`}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <IconComponent
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  isHovered || isSelected
                                    ? 'text-[#E63946]'
                                    : 'text-muted-foreground'
                                }`}
                              />
                              <span className="truncate">{cat.name}</span>
                            </span>

                            <Icons.chevronRight
                              className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                                isHovered
                                  ? 'translate-x-0.5 text-[#E63946]'
                                  : 'text-muted-foreground/40'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Columna Derecha: Subcategorías que salen al pasar el mouse */}
                  <div className="flex-1 flex flex-col bg-card overflow-hidden">
                    {hoveredCategory ? (
                      <div className="h-full flex flex-col">
                        <div className="p-3.5 border-b border-border/60 flex items-center justify-between bg-muted/10 shrink-0">
                          <div className="min-w-0 pr-2">
                            <h4 className="text-sm font-bold text-foreground truncate">
                              {hoveredCategory.name}
                            </h4>
                            <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                              {hoveredCategory.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              onSelectCategory(hoveredCategory.slug, 'all');
                              setIsCategoryMenuOpen(false);
                            }}
                            className="text-xs font-bold text-[#E63946] hover:bg-[#E63946]/10 px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <span>Ver todo</span>
                            <Icons.chevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-3">
                          {hoveredCategory.subcategories &&
                          hoveredCategory.subcategories.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {hoveredCategory.subcategories.map((sub) => {
                                const isSubSelected =
                                  selectedCategory === hoveredCategory.slug &&
                                  selectedSubcategory === sub.slug;
                                return (
                                  <button
                                    key={sub.id}
                                    type="button"
                                    onClick={() => {
                                      onSelectCategory(hoveredCategory.slug, sub.slug);
                                      setIsCategoryMenuOpen(false);
                                    }}
                                    className={`text-left p-2.5 rounded-xl border text-xs transition-all flex items-start gap-2 cursor-pointer group ${
                                      isSubSelected
                                        ? 'border-[#E63946] bg-[#E63946]/10 text-[#E63946] font-bold shadow-xs'
                                        : 'border-border/60 bg-card hover:border-[#E63946]/50 hover:bg-muted/50 text-foreground'
                                    }`}
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#E63946] mt-1.5 shrink-0 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all" />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold truncate group-hover:text-[#E63946] transition-colors">
                                        {sub.name}
                                      </div>
                                      {sub.description && (
                                        <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                                          {sub.description}
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                              <Icons.product className="w-8 h-8 opacity-40 text-[#E63946]" />
                              <p className="text-xs font-semibold text-foreground">
                                Catálogo completo disponible
                              </p>
                              <p className="text-[11px] max-w-xs">
                                Haz clic para ver todos los productos de {hoveredCategory.name}.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  onSelectCategory(hoveredCategory.slug, 'all');
                                  setIsCategoryMenuOpen(false);
                                }}
                                className="mt-2 text-xs font-bold bg-[#E63946] text-white px-3 py-1.5 rounded-xl shadow-xs cursor-pointer hover:bg-[#d62839]"
                              >
                                Ver Catálogo de {hoveredCategory.name}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
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
                    ? `Buscar en ${activeCategory.name}...`
                    : 'Buscar productos...'
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
            {showWholesaleHeaderToggle && (
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
            )}

            {/* Botón Mis Favoritos */}
            <Link
              href="/favoritos"
              title="Ver mi lista de productos favoritos"
              aria-label="Ver productos favoritos"
              className={`h-10 px-3 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                safeFavoriteCount > 0
                  ? 'bg-card hover:bg-muted border-[#FF85A2]/60 text-[#E63946]'
                  : 'bg-card hover:bg-muted border-border text-[#6C757D] hover:text-foreground'
              }`}
            >
              <Icons.heart className={`w-3.5 h-3.5 ${safeFavoriteCount > 0 ? 'fill-current text-[#E63946]' : ''}`} />
              <span className="hidden sm:inline">Favoritos</span>
              {safeFavoriteCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[#E63946] text-white">
                  {safeFavoriteCount}
                </span>
              )}
            </Link>


            {/* Botón del Carrito con Rojo Pasión y Dorado */}
            <button
              onClick={() => setOpen(true)}
              aria-label="Abrir carrito"
              className="relative h-10 px-3 sm:px-4 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-[#E63946]/25 transition-all cursor-pointer"
            >
              <Icons.cart className="w-4 h-4" />
              <span className="hidden sm:inline font-bebas text-base tracking-wider">
                {safeSubtotal > 0 ? formatPrice(safeSubtotal) : 'CARRITO'}
              </span>

              {safeTotalItems > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D4A017] text-white text-[11px] font-black flex items-center justify-center animate-bounce shadow-sm">
                  {safeTotalItems}
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
                  : 'Buscar productos...'
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
