'use client';

import React from 'react';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';
import { Icons } from '@/components/icons';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (slug: string) => void;
}

export function CategoryBar({ selectedCategory, onSelectCategory }: CategoryBarProps) {
  return (
    <div className="w-full bg-background/80 backdrop-blur-md border-b border-border/60 sticky top-16 z-30 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar scroll-smooth">
          {/* Opción "Todos" */}
          <button
            onClick={() => onSelectCategory('all')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
                : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
            }`}
          >
            <Icons.product className="w-4 h-4" />
            <span>Todos los Rubros</span>
          </button>

          {/* 24 Categorías */}
          {PRODUCT_CATEGORIES.map((cat) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.product;
            const isSelected = selectedCategory === cat.slug;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.slug)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/25 ring-2 ring-blue-500/20'
                    : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border/70'
                }`}
              >
                <IconComponent className="w-4 h-4 shrink-0" />
                <span>{cat.name}</span>
                {cat.isSeasonal && (
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-500 font-bold">
                    Estacional
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
