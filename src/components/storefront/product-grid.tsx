'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { ProductCard } from './product-card';
import { Icons } from '@/components/icons';
import { SearchMatchMetadata } from '@/lib/search-engine';
import { SearchSidebarFilter } from './search-sidebar-filter';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';

interface ProductGridProps {
  products: StoreProduct[];
  categoryTitle: string;
  categorySlug: string;
  sortOption: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  onlyInStock: boolean;
  onToggleInStock: () => void;
  onResetFilters: () => void;
  onQuickView: (product: StoreProduct) => void;
  searchQuery?: string;
  onClearSearch?: () => void;
  recommendedProducts?: StoreProduct[];
  searchMetadata?: SearchMatchMetadata;
}

export function ProductGrid({
  products,
  categoryTitle,
  categorySlug,
  sortOption,
  onSortChange,
  onlyInStock,
  onToggleInStock,
  onResetFilters,
  onQuickView,
  searchQuery,
  onClearSearch,
  recommendedProducts = [],
  searchMetadata
}: ProductGridProps) {
  const isSearchMode = Boolean(searchQuery?.trim());
  const isSearchEmpty = isSearchMode && products.length === 0;

  const showOfficialStoreFilter = useStoreConfigStore((s) => s.landing.showOfficialStoreFilter);

  // Estados locales de filtrado lateral estilo Mercado Libre
  const [facetCategory, setFacetCategory] = useState<string>('all');
  const [facetBrand, setFacetBrand] = useState<string>('');
  const [facetMinPrice, setFacetMinPrice] = useState<number | null>(null);
  const [facetMaxPrice, setFacetMaxPrice] = useState<number | null>(null);
  const [facetWholesaleOnly, setFacetWholesaleOnly] = useState<boolean>(false);
  const [facetOfficialOnly, setFacetOfficialOnly] = useState<boolean>(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Reiniciar filtros por facetas cada vez que se busca un término nuevo
  useEffect(() => {
    setFacetCategory('all');
    setFacetBrand('');
    setFacetMinPrice(null);
    setFacetMaxPrice(null);
    setFacetWholesaleOnly(false);
    setFacetOfficialOnly(false);
    setIsMobileFilterOpen(false);
  }, [searchQuery]);

  const handleResetFacets = () => {
    setFacetCategory('all');
    setFacetBrand('');
    setFacetMinPrice(null);
    setFacetMaxPrice(null);
    setFacetWholesaleOnly(false);
    setFacetOfficialOnly(false);
  };

  // Filtrado de productos basado en las facetas seleccionadas en la barra lateral
  const displayedProducts = useMemo(() => {
    if (!isSearchMode) return products;

    return products.filter((p) => {
      // Filtro por categoría lateral
      if (facetCategory !== 'all' && p.category_slug !== facetCategory) {
        return false;
      }
      // Filtro por marca
      if (facetBrand) {
        const pBrand = p.brand || p.tags?.[0] || 'JG Selección';
        if (pBrand !== facetBrand) return false;
      }
      // Rango de precio
      if (facetMinPrice !== null && p.retail_price < facetMinPrice) {
        return false;
      }
      if (facetMaxPrice !== null && p.retail_price > facetMaxPrice) {
        return false;
      }
      // Solo ofertas con descuento mayorista alto (>= 20%)
      if (facetWholesaleOnly) {
        const discount = (p.retail_price - p.wholesale_price) / p.retail_price;
        if (discount < 0.2) return false;
      }
      // Filtro de tienda oficial (solo si está activado en configuración de la tienda)
      if (showOfficialStoreFilter && facetOfficialOnly && !p.featured) {
        return false;
      }
      return true;
    });
  }, [
    products,
    isSearchMode,
    facetCategory,
    facetBrand,
    facetMinPrice,
    facetMaxPrice,
    facetWholesaleOnly,
    showOfficialStoreFilter,
    facetOfficialOnly
  ]);

  const activeFiltersCount = useMemo(() => {
    return [
      facetCategory !== 'all',
      facetBrand !== '',
      onlyInStock,
      facetWholesaleOnly,
      showOfficialStoreFilter && facetOfficialOnly,
      facetMinPrice !== null || facetMaxPrice !== null
    ].filter(Boolean).length;
  }, [facetCategory, facetBrand, onlyInStock, facetWholesaleOnly, showOfficialStoreFilter, facetOfficialOnly, facetMinPrice, facetMaxPrice]);

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-gotham ${isSearchEmpty ? 'py-3 sm:py-5' : 'py-6 sm:py-10'}`}>
      
      {/* Caso 1: Búsqueda sin coincidencias desde el inicio */}
      {isSearchEmpty && (
        <div className="py-2 font-gotham space-y-5">
          <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border/70 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center shrink-0 border border-[#E63946]/20">
                <Icons.search className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                  No encontramos resultados para <span className="text-[#E63946]">"{searchQuery}"</span>
                </h3>
                <p className="text-[11px] text-[#6C757D] leading-tight">
                  Revisá la ortografía o mirá los productos destacados que te sugerimos abajo:
                </p>
              </div>
            </div>

            {onClearSearch && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={onClearSearch}
                  className="h-8 px-3 rounded-lg bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Icons.close className="w-3 h-3" />
                  <span>Limpiar búsqueda</span>
                </button>
                <button
                  onClick={onResetFilters}
                  className="h-8 px-3 rounded-lg border border-border bg-muted/30 hover:bg-muted text-foreground font-semibold text-xs transition-all cursor-pointer"
                >
                  Ver todo
                </button>
              </div>
            )}
          </div>

          {/* Recomendaciones / Sugeridos */}
          {recommendedProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-xl sm:text-2xl font-bebas tracking-wide text-foreground flex items-center gap-2">
                    <span>🔥 Productos Sugeridos de JG Store</span>
                    <span className="text-[11px] font-gotham font-semibold px-2 py-0.5 rounded-full bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30">
                      Recomendados
                    </span>
                  </h4>
                  <p className="text-xs text-[#6C757D] font-gotham">
                    Los más vendidos y con stock inmediato en depósito:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {recommendedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Caso 2: Modo Búsqueda con Productos -> Layout 2 Columnas Estilo Mercado Libre */}
      {isSearchMode && !isSearchEmpty && (
        <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8">
          
          {/* Columna Izquierda: Barra Lateral de Filtros (Desktop) */}
          <div className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-20">
            <SearchSidebarFilter
              searchQuery={searchQuery || ''}
              totalResults={displayedProducts.length}
              matchedProducts={products}
              selectedCategory={facetCategory}
              onSelectCategory={setFacetCategory}
              selectedBrand={facetBrand}
              onSelectBrand={setFacetBrand}
              onlyInStock={onlyInStock}
              onToggleInStock={onToggleInStock}
              wholesaleOnly={facetWholesaleOnly}
              onToggleWholesaleOnly={() => setFacetWholesaleOnly((v) => !v)}
              showOfficialStoreFilter={showOfficialStoreFilter}
              officialOnly={facetOfficialOnly}
              onToggleOfficialOnly={() => setFacetOfficialOnly((v) => !v)}
              minPrice={facetMinPrice}
              maxPrice={facetMaxPrice}
              onPriceChange={(min, max) => {
                setFacetMinPrice(min);
                setFacetMaxPrice(max);
              }}
              onResetFilters={handleResetFacets}
            />
          </div>

          {/* Modal Drawer para Filtros en Móviles */}
          {isMobileFilterOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex md:hidden justify-end">
              <div className="w-[85%] max-w-sm h-full bg-background p-5 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
                <SearchSidebarFilter
                  searchQuery={searchQuery || ''}
                  totalResults={displayedProducts.length}
                  matchedProducts={products}
                  selectedCategory={facetCategory}
                  onSelectCategory={setFacetCategory}
                  selectedBrand={facetBrand}
                  onSelectBrand={setFacetBrand}
                  onlyInStock={onlyInStock}
                  onToggleInStock={onToggleInStock}
                  wholesaleOnly={facetWholesaleOnly}
                  onToggleWholesaleOnly={() => setFacetWholesaleOnly((v) => !v)}
                  showOfficialStoreFilter={showOfficialStoreFilter}
                  officialOnly={facetOfficialOnly}
                  onToggleOfficialOnly={() => setFacetOfficialOnly((v) => !v)}
                  minPrice={facetMinPrice}
                  maxPrice={facetMaxPrice}
                  onPriceChange={(min, max) => {
                    setFacetMinPrice(min);
                    setFacetMaxPrice(max);
                  }}
                  onResetFilters={handleResetFacets}
                  onCloseMobile={() => setIsMobileFilterOpen(false)}
                />
                <div className="sticky bottom-0 pt-4 pb-2 bg-background border-t border-border mt-6">
                  <button
                    onClick={() => setIsMobileFilterOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Ver {displayedProducts.length} {displayedProducts.length === 1 ? 'resultado' : 'resultados'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Columna Derecha: Barra Superior y Cuadrícula de Resultados */}
          <div className="flex-1 min-w-0 w-full space-y-5">
            
            {/* Barra de Ordenamiento y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
              <div>
                <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-foreground flex items-center gap-2">
                  <span>
                    {searchMetadata?.matchType === 'related'
                      ? `Artículos Relacionados con "${searchQuery}"`
                      : searchMetadata?.matchType === 'typo'
                      ? `Resultados para "${searchMetadata.correctedWord}"`
                      : `Resultados para "${searchQuery}"`}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-gotham">
                    {displayedProducts.length}
                  </span>
                </h2>
                <p className="text-xs text-[#6C757D] font-gotham">
                  Precios oficiales por unidad al detal y por bulto cerrado al mayor.
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                {/* Botón Filtros en Móvil */}
                <button
                  onClick={() => setIsMobileFilterOpen(true)}
                  className="md:hidden h-9 px-3 rounded-xl border border-border bg-card text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-foreground shadow-xs"
                >
                  <Icons.filter className="w-3.5 h-3.5 text-[#E63946]" />
                  <span>Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 rounded-full bg-[#E63946] text-white text-[10px] font-bold flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* Selector de Orden */}
                <div className="relative flex items-center">
                  <select
                    value={sortOption}
                    onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                    aria-label="Ordenar productos"
                    className="h-9 px-3 pr-8 rounded-xl border border-border/80 bg-card text-xs font-medium text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none cursor-pointer appearance-none"
                  >
                    <option value="popular">Más destacados</option>
                    <option value="price_asc">Menor precio detal</option>
                    <option value="price_desc">Mayor precio detal</option>
                    <option value="wholesale_discount">Mayor ahorro mayorista</option>
                    <option value="name_asc">Nombre (A - Z)</option>
                  </select>
                  <Icons.chevronDown className="w-3.5 h-3.5 text-[#6C757D] absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Banners de Corrección Inteligente */}
            {searchMetadata?.matchType === 'related' && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Icons.sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      Asociamos tu búsqueda con <span className="text-amber-600 dark:text-amber-400 font-bold">{searchMetadata.matchedConcept}</span>:
                    </h3>
                    <p className="text-[11px] text-[#6C757D] leading-tight">
                      Mostrando alternativas disponibles en depósito para "{searchQuery}".
                    </p>
                  </div>
                </div>
                {onClearSearch && (
                  <button
                    onClick={onClearSearch}
                    className="h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <Icons.close className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            )}

            {searchMetadata?.matchType === 'typo' && (
              <div className="p-3 sm:p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                    <Icons.search className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                      Mostrando resultados para <span className="text-blue-600 dark:text-blue-400 font-bold">"{searchMetadata.correctedWord}"</span>:
                    </h3>
                    <p className="text-[11px] text-[#6C757D] leading-tight">
                      Corregimos automáticamente el término similar a "{searchQuery}".
                    </p>
                  </div>
                </div>
                {onClearSearch && (
                  <button
                    onClick={onClearSearch}
                    className="h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shrink-0 flex items-center gap-1.5 transition-colors"
                  >
                    <Icons.close className="w-3.5 h-3.5" />
                    <span>Limpiar</span>
                  </button>
                )}
              </div>
            )}

            {/* Grid de Productos o Estado Vacío por Filtros Excesivos */}
            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {displayedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={onQuickView}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-card rounded-2xl border border-border/80 p-8 shadow-xs">
                <div className="w-12 h-12 rounded-xl bg-muted/60 text-[#6C757D] flex items-center justify-center mx-auto mb-3">
                  <Icons.filter className="w-6 h-6 text-[#E63946]" />
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  No hay productos con los filtros aplicados
                </h3>
                <p className="text-xs text-[#6C757D] mt-1 max-w-sm mx-auto">
                  Prueba cambiando la marca seleccionada, deseleccionando la categoría o ajustando el rango de precio.
                </p>
                <button
                  onClick={handleResetFacets}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
                >
                  Restablecer filtros laterales
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Caso 3: Navegación General del Catálogo (Sin Búsqueda Activa) */}
      {!isSearchMode && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
                <span>{categoryTitle}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-gotham">
                  {products.length} producto{products.length === 1 ? '' : 's'}
                </span>
              </h2>
              <p className="text-xs text-[#6C757D] mt-0.5 font-gotham">
                Precios con descuento mayorista automático por volumen y PVP para compras al detal.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              {/* Switch de Solo Stock */}
              <button
                onClick={onToggleInStock}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  onlyInStock
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-card hover:bg-muted border-border text-[#6C757D]'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    onlyInStock ? 'bg-emerald-500' : 'bg-[#6C757D]/40'
                  }`}
                />
                <span>Solo en stock</span>
              </button>

              {/* Selector de Orden */}
              <div className="relative flex items-center">
                <select
                  value={sortOption}
                  onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
                  aria-label="Ordenar productos del catálogo"
                  className="h-9 px-3 pr-8 rounded-xl border border-border/80 bg-card text-xs font-medium text-foreground focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none cursor-pointer appearance-none"
                >
                  <option value="popular">Más destacados</option>
                  <option value="price_asc">Menor precio detal</option>
                  <option value="price_desc">Mayor precio detal</option>
                  <option value="wholesale_discount">Mayor ahorro mayorista</option>
                  <option value="name_asc">Nombre (A - Z)</option>
                </select>
                <Icons.chevronDown className="w-3.5 h-3.5 text-[#6C757D] absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-xl bg-muted/60 text-[#6C757D] flex items-center justify-center mx-auto mb-3">
                <Icons.search className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">No encontramos productos en esta sección</h3>
              <p className="text-xs text-[#6C757D] mt-1 max-w-sm mx-auto">
                Prueba seleccionando otro rubro o desactivando el filtro de solo stock.
              </p>
              <button
                onClick={onResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-[#E63946]/20"
              >
                Restablecer filtros
              </button>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={onQuickView}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
