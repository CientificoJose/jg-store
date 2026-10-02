'use client';

import React, { useState } from 'react';
import { StoreProduct } from '@/types/store';
import { Icons } from '@/components/icons';
import { PRODUCT_CATEGORIES } from '@/constants/categories';

export interface SearchSidebarFilterProps {
  searchQuery: string;
  categoryTitle?: string;
  categorySlug?: string;
  totalResults: number;
  matchedProducts: StoreProduct[];
  selectedCategory: string;
  onSelectCategory: (categorySlug: string) => void;
  selectedSubcategory?: string;
  onSelectSubcategory?: (subcategorySlug: string) => void;
  selectedBrand: string;
  onSelectBrand: (brand: string) => void;
  showInStockFilter?: boolean;
  onlyInStock: boolean;
  onToggleInStock: () => void;
  showWholesaleFilter?: boolean;
  wholesaleOnly: boolean;
  onToggleWholesaleOnly: () => void;
  showOfficialStoreFilter?: boolean;
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
  categoryTitle,
  categorySlug,
  totalResults,
  matchedProducts,
  selectedCategory,
  onSelectCategory,
  selectedSubcategory = '',
  onSelectSubcategory,
  selectedBrand,
  onSelectBrand,
  showInStockFilter = false,
  onlyInStock,
  onToggleInStock,
  showWholesaleFilter = false,
  wholesaleOnly,
  onToggleWholesaleOnly,
  showOfficialStoreFilter = false,
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
  const [showOtherCategories, setShowOtherCategories] = useState(false);

  React.useEffect(() => {
    setLocalMin(minPrice !== null && minPrice !== undefined ? String(minPrice) : '');
  }, [minPrice]);

  React.useEffect(() => {
    setLocalMax(maxPrice !== null && maxPrice !== undefined ? String(maxPrice) : '');
  }, [maxPrice]);

  const currentCategoryObj = React.useMemo(() => {
    return PRODUCT_CATEGORIES.find((c) => c.slug === selectedCategory);
  }, [selectedCategory]);

  const displayHeading =
    searchQuery.trim() || categoryTitle || currentCategoryObj?.name || 'Catálogo de Productos';

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

  // Extraer subcategorías de la categoría seleccionada presentes en los resultados
  const subcategoryCounts = React.useMemo(() => {
    if (selectedCategory === 'all') return [];
    const counts: Record<string, { slug: string; name: string; count: number }> = {};

    matchedProducts.forEach((p) => {
      if (p.subcategory_slug && p.subcategory_name) {
        if (!counts[p.subcategory_slug]) {
          counts[p.subcategory_slug] = {
            slug: p.subcategory_slug,
            name: p.subcategory_name,
            count: 0
          };
        }
        counts[p.subcategory_slug].count += 1;
      }
    });

    return Object.values(counts).sort((a, b) => b.count - a.count);
  }, [matchedProducts, selectedCategory]);

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
    (selectedCategory !== 'all' && Boolean(searchQuery.trim())) ||
    selectedSubcategory !== '' ||
    selectedBrand !== '' ||
    (Boolean(showInStockFilter) && onlyInStock) ||
    (Boolean(showWholesaleFilter) && wholesaleOnly) ||
    (Boolean(showOfficialStoreFilter) && Boolean(officialOnly)) ||
    minPrice !== null ||
    maxPrice !== null;

  const visibleCategories = showAllCategories ? categoryCounts : categoryCounts.slice(0, 6);
  const visibleBrands = showAllBrands ? brandCounts : brandCounts.slice(0, 6);

  return (
    <aside className="w-full md:w-64 lg:w-72 shrink-0 font-gotham space-y-6">
      {/* Encabezado móvil para cerrar drawer */}
      {onCloseMobile && (
        <div className="flex md:hidden items-center justify-between pb-3 border-b border-border">
          <span className="text-sm font-bold text-foreground">Filtros de Catálogo</span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-[#6C757D] hover:text-foreground cursor-pointer"
            aria-label="Cerrar filtros"
          >
            <Icons.close className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Botón rápido Volver a Todos los Departamentos si estamos en una categoría */}
      {selectedCategory !== 'all' && (
        <button
          onClick={() => {
            onSelectCategory('all');
            if (onSelectSubcategory) onSelectSubcategory('');
          }}
          className="w-full py-2 px-3 rounded-xl border border-border/80 bg-card hover:bg-muted/70 text-xs font-semibold text-[#E63946] flex items-center justify-between group transition-colors cursor-pointer shadow-2xs"
        >
          <span className="flex items-center gap-1.5">
            <Icons.chevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Todos los Departamentos</span>
          </span>
          <Icons.home className="w-3.5 h-3.5 text-[#6C757D]" />
        </button>
      )}

      {/* Título de la Búsqueda o Departamento y Conteo (Estilo Mercado Libre) */}
      <div className="border-b border-border/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground capitalize tracking-tight leading-tight">
          {displayHeading}
        </h1>
        <p className="text-xs text-[#6C757D] mt-0.5">
          {totalResults.toLocaleString('es-AR')} {totalResults === 1 ? 'resultado' : 'resultados'}
        </p>

        {/* Chips de Filtros Activos con 'X' */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border/60">
            {selectedCategory !== 'all' && searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-muted text-foreground border border-border">
                <span>{currentCategoryObj?.name || selectedCategory}</span>
                <button
                  onClick={() => onSelectCategory('all')}
                  className="hover:text-[#E63946] cursor-pointer"
                  title="Quitar filtro de categoría"
                >
                  <Icons.close className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedSubcategory && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-semibold">
                <span>
                  {subcategoryCounts.find((s) => s.slug === selectedSubcategory)?.name || selectedSubcategory}
                </span>
                <button
                  onClick={() => onSelectSubcategory && onSelectSubcategory('')}
                  className="hover:text-red-700 cursor-pointer"
                  title="Quitar filtro de subcategoría"
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

            {showInStockFilter && onlyInStock && (
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

            {showWholesaleFilter && wholesaleOnly && (
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

            {showOfficialStoreFilter && officialOnly && (
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
                  {minPrice ? `$${minPrice.toLocaleString('es-AR')}` : '$0'} -{' '}
                  {maxPrice ? `$${maxPrice.toLocaleString('es-AR')}` : 'Max'}
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
      {showInStockFilter && (
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs">
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
      )}

      {/* Switch 2: Tarifa Mayorista VIP */}
      {showWholesaleFilter && (
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs">
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
      )}

      {/* Switch 3: Tienda Oficial JG (Opcional, configurable desde el panel de control) */}
      {showOfficialStoreFilter && onToggleOfficialOnly && (
        <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-2xs">
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

      {/* SECCIÓN 1: Subcategorías (Si estamos dentro de un departamento específico) */}
      {selectedCategory !== 'all' && subcategoryCounts.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Subcategorías
            </h2>
            {selectedSubcategory && (
              <button
                onClick={() => onSelectSubcategory && onSelectSubcategory('')}
                className="text-[10px] text-[#E63946] hover:underline cursor-pointer"
              >
                Ver todas
              </button>
            )}
          </div>
          <ul className="space-y-1 text-xs">
            {subcategoryCounts.map((sub) => {
              const isSelected = selectedSubcategory === sub.slug;
              return (
                <li key={sub.slug}>
                  <button
                    onClick={() => onSelectSubcategory && onSelectSubcategory(isSelected ? '' : sub.slug)}
                    className={`w-full text-left flex items-center justify-between py-1 transition-colors cursor-pointer group ${
                      isSelected
                        ? 'font-bold text-[#E63946]'
                        : 'text-[#6C757D] hover:text-foreground'
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <span className="text-[11px] text-[#6C757D]/70 group-hover:text-foreground">
                      ({sub.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* SECCIÓN 2: Categorías / Departamentos Relacionados (En búsqueda general o conmutador de rubros) */}
      {(selectedCategory === 'all' || categoryCounts.length > 1) && (
        <div className="space-y-2.5 border-t border-border/80 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            {selectedCategory === 'all' ? 'Departamentos' : 'Otros Departamentos'}
          </h2>
          <ul className="space-y-1 text-xs">
            {visibleCategories.map((cat) => {
              const isSelected = selectedCategory === cat.slug;
              return (
                <li key={cat.slug}>
                  <button
                    onClick={() => {
                      onSelectCategory(isSelected ? 'all' : cat.slug);
                      if (onSelectSubcategory) onSelectSubcategory('');
                    }}
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

      {/* SECCIÓN 3: Marcas (Brands) */}
      {brandCounts.length > 0 && (
        <div className="space-y-2.5 border-t border-border/80 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Marcas
          </h2>
          <ul className="space-y-1 text-xs">
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

      {/* SECCIÓN 4: Rango de Precio */}
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

      {/* SECCIÓN 5: Condición (Estilo Mercado Libre) */}
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

      {/* SECCIÓN 6: Envíos y Logística (Estilo Mercado Libre) */}
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
