'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';
import { Icons } from '@/components/icons';

interface CategoryShowcaseProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
  style?: 'photos' | 'pills';
}

export function CategoryShowcase({
  selectedCategory,
  onSelectCategory,
  style = 'photos'
}: CategoryShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -260 : 260;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-6 sm:py-8 bg-card/40 border-b border-border/60 font-gotham">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Encabezado de la Sección de Categorías con Controles de Navegación */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E63946] animate-pulse" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Explorar Departamentos
              </h2>
            </div>
            <p className="text-xs text-[#6C757D] mt-0.5">
              Accede directamente a los 24 rubros comerciales de JG Store
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              title="Desplazar a la izquierda"
              aria-label="Desplazar a la izquierda"
              className="w-8 h-8 rounded-full border border-border/80 bg-card hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <Icons.chevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              title="Desplazar a la derecha"
              aria-label="Desplazar a la derecha"
              className="w-8 h-8 rounded-full border border-border/80 bg-card hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors shadow-xs cursor-pointer"
            >
              <Icons.chevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tira Desplazable de Categorías con Fotos Miniatura (Inspiración SHOPLUXE) */}
        {style === 'photos' ? (
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 px-1 scrollbar-none scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {/* Opción "Todos" */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`shrink-0 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-200 ${
                selectedCategory === 'all' ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all flex items-center justify-center shadow-md ${
                  selectedCategory === 'all'
                    ? 'border-[#E63946] bg-[#E63946]/10 ring-4 ring-[#E63946]/20'
                    : 'border-border/80 bg-muted/40 hover:border-[#E63946]/50'
                }`}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E63946] to-[#D4A017] flex items-center justify-center text-white">
                  <Icons.sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
              </div>
              <span
                className={`text-xs text-center max-w-[80px] truncate font-medium ${
                  selectedCategory === 'all'
                    ? 'font-bold text-[#E63946]'
                    : 'text-foreground group-hover:text-[#E63946]'
                }`}
              >
                Todos
              </span>
            </button>

            {/* Categorías con miniaturas de fotos */}
            {PRODUCT_CATEGORIES.map((cat: ProductCategory) => {
              const isSelected = selectedCategory === cat.slug;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.slug)}
                  className={`shrink-0 flex flex-col items-center gap-2 group cursor-pointer transition-all duration-200 ${
                    isSelected ? 'scale-105' : 'hover:scale-105'
                  }`}
                >
                  <div
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full p-0.5 border-2 transition-all overflow-hidden shadow-md ${
                      isSelected
                        ? 'border-[#E63946] ring-4 ring-[#E63946]/25 shadow-[#E63946]/20'
                        : 'border-border/80 hover:border-[#E63946]/60 group-hover:shadow-lg'
                    }`}
                  >
                    <div className="relative w-full h-full rounded-full overflow-hidden bg-muted/30">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 64px, 80px"
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  <span
                    className={`text-xs text-center max-w-[84px] line-clamp-2 leading-tight font-medium transition-colors ${
                      isSelected
                        ? 'font-bold text-[#E63946]'
                        : 'text-foreground group-hover:text-[#E63946]'
                    }`}
                    title={cat.name}
                  >
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Estilo Pills alternativo */
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => onSelectCategory('all')}
              className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                  : 'bg-card border-border hover:bg-muted text-foreground'
              }`}
            >
              Todos los rubros (24)
            </button>
            {PRODUCT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  selectedCategory === cat.slug
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-sm'
                    : 'bg-card border-border hover:bg-muted text-foreground'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
