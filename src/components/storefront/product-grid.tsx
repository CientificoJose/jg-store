'use client';

import React from 'react';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { ProductCard } from './product-card';
import { Icons } from '@/components/icons';

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
  onQuickView
}: ProductGridProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-gotham">
      {/* Barra de Filtros y Ordenamiento */}
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

      {/* Cuadrícula de Productos */}
      {products.length === 0 ? (
        <div className="py-16 text-center font-gotham">
          <div className="w-16 h-16 rounded-2xl bg-muted/60 text-[#6C757D] flex items-center justify-center mx-auto mb-4">
            <Icons.search className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-foreground">No encontramos productos</h3>
          <p className="text-xs text-[#6C757D] mt-1 max-w-sm mx-auto">
            Prueba ajustando el término de búsqueda o seleccionando otro rubro de nuestras 24 categorías.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-5 px-4 py-2 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs transition-colors cursor-pointer shadow-sm shadow-[#E63946]/20"
          >
            Restablecer todos los filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}
    </section>
  );
}
