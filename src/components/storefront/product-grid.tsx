'use client';

import React from 'react';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { ProductCard } from './product-card';
import { Icons } from '@/components/icons';
import { SearchMatchMetadata } from '@/lib/search-engine';

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
  const isSearchEmpty = Boolean(searchQuery?.trim()) && products.length === 0;

  return (
    <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 font-gotham ${isSearchEmpty ? 'py-3 sm:py-5' : 'py-8 sm:py-12'}`}>
      {/* Barra de Filtros y Ordenamiento (Solo si hay productos o si no es búsqueda vacía) */}
      {!isSearchEmpty && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bebas tracking-wide text-foreground flex items-center gap-2.5">
              <span>
                {searchMetadata?.matchType === 'related'
                  ? `Artículos Relacionados con "${searchQuery}"`
                  : searchMetadata?.matchType === 'typo'
                  ? `Resultados para "${searchMetadata.correctedWord}"`
                  : categoryTitle}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-gotham">
                {products.length} producto{products.length === 1 ? '' : 's'}
              </span>
            </h2>
            <p className="text-xs text-[#6C757D] mt-0.5 font-gotham">
              {searchMetadata?.matchType === 'related' && searchMetadata.matchedConcept
                ? `Búsqueda inteligente: asociamos tu término con ${searchMetadata.matchedConcept}.`
                : 'Precios con descuento mayorista automático por volumen y PVP para compras al detal.'}
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
      )}

      {/* Manejo de Resultados */}
      {products.length === 0 ? (
        <div className="py-2 font-gotham">
          {/* Caso 1: Búsqueda sin coincidencias - Barra Compacta */}
          {searchQuery?.trim() ? (
            <div className="space-y-5">
              {/* Alerta compacta horizontal */}
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

              {/* Recomendaciones / Otros Productos Disponibles */}
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
          ) : (
            /* Caso 2: Categoría o filtro vacío sin búsqueda */
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
          )}
        </div>
      ) : (
        /* Caso 3: Listado con productos */
        <div className="mt-6">
          {/* Banner de Relación Inteligente */}
          {searchMetadata?.matchType === 'related' && (
            <div className="mb-6 p-3 sm:p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                  <Icons.sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug">
                    No encontramos productos llamados <span className="text-[#E63946]">"{searchQuery}"</span>, pero encontramos artículos relacionados en <span className="text-amber-600 dark:text-amber-400 font-bold">{searchMetadata.matchedConcept}</span>:
                  </h3>
                  <p className="text-[11px] text-[#6C757D] leading-tight">
                    Mostrando las mejores alternativas disponibles en depósito para tu búsqueda:
                  </p>
                </div>
              </div>
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shrink-0 self-end sm:self-auto flex items-center gap-1.5 transition-colors"
                >
                  <Icons.close className="w-3.5 h-3.5" />
                  <span>Limpiar búsqueda</span>
                </button>
              )}
            </div>
          )}

          {/* Banner de Corrección Tipográfica */}
          {searchMetadata?.matchType === 'typo' && (
            <div className="mb-6 p-3 sm:p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
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
                  className="h-8 px-3 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold text-foreground cursor-pointer shrink-0 self-end sm:self-auto flex items-center gap-1.5 transition-colors"
                >
                  <Icons.close className="w-3.5 h-3.5" />
                  <span>Limpiar</span>
                </button>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={onQuickView}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
