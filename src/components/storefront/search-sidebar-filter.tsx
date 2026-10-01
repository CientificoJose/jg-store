'use client';

import React, { useState } from 'react';
import { StoreProduct } from '@/types/store';
import { Icons } from '@/components/icons';

export interface SearchSidebarFilterProps {
  searchQuery: string;
  totalResults: number;
  matchedProducts: StoreProduct[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  onlyInStock: boolean;
  onToggleInStock: () => void;
  wholesaleOnly: boolean;
  onToggleWholesaleOnly: () => void;
  officialOnly?: boolean;
  onToggleOfficialOnly?: () => void;
  minPrice: number | null;
  maxPrice: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  onResetFilters: () => void;
  onCloseMobile?: () => void;
}

export function SearchSidebarFilter({
  searchQuery,
  totalResults,
  matchedProducts,
  selectedCategory,
  onSelectCategory,
  selectedBrand,
  onSelectBrand,
  onlyInStock,
  onToggleInStock,
  wholesaleOnly,
  onToggleWholesaleOnly,
  officialOnly = false,
  onToggleOfficialOnly,
  minPrice,
  maxPrice,
  onPriceChange,
  onResetFilters,
  onCloseMobile
}: SearchSidebarFilterProps) {
  const [localMin, setLocalMin] = useState<string>(minPrice ? String(minPrice) : '');
  const [localMax, setLocalMax] = useState<string>(maxPrice ? String(maxPrice) : '');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  React.useEffect(() => {
    setLocalMin(minPrice !== null && minPrice !== undefined ? String(minPrice) : '');
  }, [minPrice]);

  React.useEffect(() => {
    setLocalMax(maxPrice !== null && maxPrice !== undefined ? String(maxPrice) : '');
  }, [maxPrice]);

  // Extraer categorías presentes en los resultados con conteo
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, { slug: string; name: string; count: number }> = {};
    matchedProducts.forEach((p) => {
      if (!counts[p.category_slug]) {
        counts[p.category_slug] = {
          slug: p.category_slug,
          name: p.category_name,
          count: 0
        };
      }
      counts[p.category_slug].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [matchedProducts]);

  // Extraer marcas presentes en los resultados con conteo
  const brandCounts = React.useMemo(() => {
    const counts: Record<string, { brand: string; count: number }> = {};
    matchedProducts.forEach((p) => {
      const b = p.brand || p.tags?.[0] || 'JG Selección';
      if (!counts[b]) {
        counts[b] = { brand: b, count: 0 };
      }
      counts[b].count += 1;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [matchedProducts]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = localMin.trim() ? parseFloat(localMin) : null;
    const max = localMax.trim() ? parseFloat(localMax) : null;
    onPriceChange(min, max);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedBrand !== '' ||
    onlyInStock ||
    wholesaleOnly ||
    officialOnly ||
    minPrice !== null ||
    maxPrice !== null;

  const visibleCategories = showAllCategories ? categoryCounts : categoryCounts.slice(0, 6);
  const visibleBrands = showAllBrands ? brandCounts : brandCounts.slice(0, 6);

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 font-gotham space-y-6">
      {/* Encabezado móvil para cerrar drawer */}
      {onCloseMobile && (
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-border">
          <span className="text-sm font-bold text-foreground">Filtros de Búsqueda</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[#6C757D] hover:text-foreground cursor-pointer"
            aria-label="Cerrar filtros"
          >
            <Icons.close className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Título de la Búsqueda y Conteo (Estilo Mercado Libre) */}
      <div className="border-b border-border/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground capitalize tracking-tight">
          {searchQuery}
        </h1>
        <p className="text-xs text-[#6C757D] mt-0.5">
          {totalResults.toLocaleString('es-AR')} {totalResults === 1 ? 'resultado' : 'resultados'}
        </p>

        {/* Chips de Filtros Activos con 'X' */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted text-foreground border border-border">
                <span>{categoryCounts.find((c) => c.slug === selectedCategory)?.name || selectedCategory}</span>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-[#E63946] cursor-pointer"
                  title="Quitar filtro de categoría"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedBrand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted text-foreground border border-border">
                <span>Marca: {selectedBrand}</span>
                <button
                  onClick={() => onSelectBrand('')}
                  className="hover:text-[#E63946] cursor-pointer"
                  title="Quitar filtro de marca"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {onlyInStock && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <span>En stock</span>
                <button
                  onClick={onToggleInStock}
                  className="hover:text-[#E63946] cursor-pointer"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {wholesaleOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30">
                <span>Mayorista</span>
                <button
                  onClick={onToggleWholesaleOnly}
                  className="hover:text-[#E63946] cursor-pointer"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {officialOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/25">
                <span>Tienda Oficial</span>
                <button
                  onClick={onToggleOfficialOnly}
                  className="hover:text-[#E63946] cursor-pointer"
                  title="Quitar filtro de tienda oficial"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {(minPrice !== null || maxPrice !== null) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted text-foreground border border-border">
                <span>
                  {minPrice ? `$${minPrice.toLocaleString()}` : '$0'} -{' '}
                  {maxPrice ? `$${maxPrice.toLocaleString()}` : 'Max'}
                </span>
                <button
                  onClick={() => {
                    setLocalMin('');
                    setLocalMax('');
                    onPriceChange(null, null);
                  }}
                  className="hover:text-[#E63946] cursor-pointer"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={onResetFilters}
              className="text-[11px] text-[#E63946] hover:underline font-semibold w-full text-left mt-1 cursor-pointer"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Switch 1: En Stock Inmediato (Estilo Toggle Switch Mercado Libre) */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold text-foreground block">
            En stock inmediato
          </span>
          <span className="text-[10px] text-[#6C757D]">
            Disponibles en depósito
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleInStock}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            onlyInStock ? 'bg-[#E63946]' : 'bg-muted'
          }`}
          role="switch"
          aria-checked={onlyInStock}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              onlyInStock ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Switch 2: Tarifa Mayorista VIP */}
      <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-xs">
        <div>
          <span className="text-xs font-bold text-foreground block">
            Tarifa Mayorista B2B
          </span>
          <span className="text-[10px] text-[#6C757D]">
            Descuento especial por volumen
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleWholesaleOnly}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            wholesaleOnly ? 'bg-[#D4A017]' : 'bg-muted'
          }`}
          role="switch"
          aria-checked={wholesaleOnly}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
              wholesaleOnly ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* Switch 3: Tiendas Oficiales (Mercado Libre) */}
      {onToggleOfficialOnly && (
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-xs">
          <div>
            <span className="text-xs font-bold text-foreground block">
              Tienda Oficial JG
            </span>
            <span className="text-[10px] text-[#6C757D]">
              Artículos garantizados JG Store
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleOfficialOnly}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              officialOnly ? 'bg-[#E63946]' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={officialOnly}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                officialOnly ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      )}

      {/* SECCIÓN: Categorías / Departamentos Relacionados */}
      {categoryCounts.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Categorías
          </h2>
          <ul className="space-y-1.5 text-xs">
            {selectedCategory !== 'all' && (
              <li>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="text-xs text-[#E63946] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icons.chevronLeft className="w-3.5 h-3.5" />
                  <span>Todas las categorías</span>
                </button>
              </li>
            )}
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <li key={cat.slug}>
                  <button
                    onClick={() => onSelectCategory(isSelected ? 'all' : cat.slug)}
                    className={`w-full text-left flex items-center justify-between py-1 transition-colors cursor-pointer group ${
                      isSelected
                        ? 'font-bold text-[#E63946]'
                        : 'text-[#6C757D] hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{cat.name}</span>
                    <span className="text-[11px] text-[#6C757D]/70 group-hover:text-foreground">
                      ({cat.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {categoryCounts.length > 6 && (
            <button
              onClick={() => setShowAllCategories((v) => !v)}
              className="text-xs text-[#E63946] hover:underline font-semibold pt-1 cursor-pointer"
            >
              {showAllCategories ? 'Mostrar menos' : `Mostrar más (${categoryCounts.length - 6})`}
            </button>
          )}
        </div>
      )}

      {/* SECCIÓN: Marcas (Brands) */}
      {brandCounts.length > 0 && (
        <div className="space-y-2.5 border-t border-border/80 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Marcas
          </h2>
          <ul className="space-y-1.5 text-xs">
            {selectedBrand && (
              <li>
                <button
                  onClick={() => onSelectBrand('')}
                  className="text-xs text-[#E63946] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Icons.chevronLeft className="w-3.5 h-3.5" />
                  <span>Todas las marcas</span>
                </button>
              </li>
            )}
            {visibleBrands.map((b) => {
              const isSelected = selectedBrand === b.brand;
              return (
                <li key={b.brand}>
                  <button
                    onClick={() => onSelectBrand(isSelected ? '' : b.brand)}
                    className={`w-full text-left flex items-center justify-between py-1 transition-colors cursor-pointer group ${
                      isSelected
                        ? 'font-bold text-[#E63946]'
                        : 'text-[#6C757D] hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{b.brand}</span>
                    <span className="text-[11px] text-[#6C757D]/70 group-hover:text-foreground">
                      ({b.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {brandCounts.length > 6 && (
            <button
              onClick={() => setShowAllBrands((v) => !v)}
              className="text-xs text-[#E63946] hover:underline font-semibold pt-1 cursor-pointer"
            >
              {showAllBrands ? 'Mostrar menos' : `Mostrar más (${brandCounts.length - 6})`}
            </button>
          )}
        </div>
      )}

      {/* SECCIÓN: Rango de Precio */}
      <div className="space-y-3 border-t border-border/80 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Precio
        </h2>

        {/* Rangos sugeridos */}
        <div className="space-y-1.5 text-xs">
          <button
            onClick={() => onPriceChange(null, 10000)}
            className="text-left w-full text-[#6C757D] hover:text-foreground py-0.5 cursor-pointer"
          >
            Hasta $10.000
          </button>
          <button
            onClick={() => onPriceChange(10000, 25000)}
            className="text-left w-full text-[#6C757D] hover:text-foreground py-0.5 cursor-pointer"
          >
            $10.000 a $25.000
          </button>
          <button
            onClick={() => onPriceChange(25000, null)}
            className="text-left w-full text-[#6C757D] hover:text-foreground py-0.5 cursor-pointer"
          >
            Más de $25.000
          </button>
        </div>

        {/* Formulario de Mínimo y Máximo */}
        <form onSubmit={handleApplyPrice} className="flex items-center gap-2 pt-1">
          <input
            type="number"
            placeholder="Mínimo"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground outline-none focus:border-[#E63946]"
          />
          <span className="text-[#6C757D] text-xs">-</span>
          <input
            type="number"
            placeholder="Máximo"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs text-foreground outline-none focus:border-[#E63946]"
          />
          <button
            type="submit"
            title="Aplicar rango de precio"
            aria-label="Aplicar rango de precio"
            className="w-8 h-8 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white flex items-center justify-center shrink-0 cursor-pointer shadow-xs"
          >
            <Icons.chevronRight className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* SECCIÓN: Condición (Estilo Mercado Libre) */}
      <div className="space-y-2 border-t border-border/80 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Condición
        </h2>
        <div className="text-xs text-[#6C757D] space-y-1">
          <div className="flex items-center justify-between py-0.5">
            <span className="text-foreground font-medium">Nuevo en caja</span>
            <span className="text-[11px] text-[#6C757D]/70">({totalResults})</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Envíos y Logística (Estilo Mercado Libre) */}
      <div className="space-y-2 border-t border-border/80 pt-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Envíos y Despacho
        </h2>
        <div className="p-3 rounded-xl bg-muted/40 border border-border/70 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Icons.check className="w-3.5 h-3.5" />
            <span>Despacho Inmediato</span>
          </div>
          <p className="text-[11px] text-[#6C757D] leading-tight">
            Envíos a todo el país o retiro sin cargo por nuestro depósito central.
          </p>
        </div>
      </div>
    </aside>
  );
}
