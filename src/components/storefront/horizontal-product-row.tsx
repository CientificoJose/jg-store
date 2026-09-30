'use client';

import React, { useRef } from 'react';
import { StoreProduct } from '@/types/store';
import { ProductCard } from './product-card';
import { Icons } from '@/components/icons';

interface HorizontalProductRowProps {
  id: string;
  title: string;
  subtitle?: string;
  products: StoreProduct[];
  categorySlug?: string;
  onSelectCategory?: (slug: string) => void;
  onQuickView: (product: StoreProduct) => void;
}

export function HorizontalProductRow({
  title,
  subtitle,
  products,
  categorySlug,
  onSelectCategory,
  onQuickView
}: HorizontalProductRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleViewAll = () => {
    if (categorySlug && onSelectCategory) {
      onSelectCategory(categorySlug);
      const gridEl = document.getElementById('catalogo-productos');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="py-6 sm:py-8 border-b border-border/60 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Fila Horizontal */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-foreground flex items-center gap-2">
              <span>{title}</span>
            </h2>
            {subtitle && (
              <p className="text-xs sm:text-sm text-[#6C757D] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            {categorySlug && onSelectCategory && (
              <button
                onClick={handleViewAll}
                className="text-xs font-bold text-[#E63946] hover:text-[#d62839] hover:underline flex items-center gap-1 transition-colors cursor-pointer mr-2"
              >
                <span>Ver todo el departamento</span>
                <Icons.arrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Botones de navegación < y > */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleScroll('left')}
                title="Desplazar a la izquierda"
                aria-label="Desplazar a la izquierda"
                className="w-9 h-9 rounded-xl border border-border/80 bg-card hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <Icons.chevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                title="Desplazar a la derecha"
                aria-label="Desplazar a la derecha"
                className="w-9 h-9 rounded-xl border border-border/80 bg-card hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                <Icons.chevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carrusel Desplazable de Costado con Productos */}
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="w-[240px] sm:w-[270px] shrink-0 snap-start flex flex-col"
            >
              <ProductCard
                product={product}
                onQuickView={onQuickView}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
