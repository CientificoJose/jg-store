'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { fetchStoreProducts } from '@/lib/store-service';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { CATEGORY_MAP } from '@/constants/categories';
import { StoreHeader } from './store-header';
import { CategoryBar } from './category-bar';
import { HeroBanner } from './hero-banner';
import { ProductGrid } from './product-grid';
import { CartDrawer } from './cart-drawer';
import { ProductQuickView } from './product-quick-view';
import { StoreFooter } from './store-footer';

export function StoreFront() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<ProductSortOption>('popular');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);

  const { favoriteIds, showOnlyFavorites, setShowOnlyFavorites } = useFavoritesStore();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carga de productos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchStoreProducts({
      category: selectedCategory,
      search: searchQuery,
      sort: sortOption,
      onlyInStock
    })
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, searchQuery, sortOption, onlyInStock]);

  // Si se activa el filtro de favoritos, hacer scroll hacia el catálogo
  useEffect(() => {
    if (showOnlyFavorites) {
      const gridEl = document.getElementById('catalogo-productos');
      if (gridEl) {
        gridEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [showOnlyFavorites]);

  // Productos filtrados para visualización (con soporte de favoritos)
  const displayedProducts = useMemo(() => {
    if (showOnlyFavorites) {
      return products.filter((p) => favoriteIds.includes(p.id));
    }
    return products;
  }, [products, showOnlyFavorites, favoriteIds]);

  // Título dinámico de la sección
  const categoryTitle = useMemo(() => {
    if (showOnlyFavorites) {
      return `Mis Productos Favoritos (${displayedProducts.length})`;
    }
    if (searchQuery.trim()) {
      return `Resultados para "${searchQuery.trim()}"`;
    }
    if (selectedCategory === 'all') {
      return 'Todos los Departamentos y Productos';
    }
    const cat = CATEGORY_MAP.get(selectedCategory);
    return cat ? cat.name : 'Productos';
  }, [showOnlyFavorites, displayedProducts.length, searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('popular');
    setOnlyInStock(false);
    setShowOnlyFavorites(false);
  };

  const handleExploreCatalog = () => {
    const gridEl = document.getElementById('catalogo-productos');
    if (gridEl) {
      gridEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#E63946] selection:text-white font-gotham transition-colors duration-200">
      {/* Header Fijo */}
      <StoreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
      />

      {/* Hero Banner */}
      <HeroBanner onExploreCatalog={handleExploreCatalog} />

      {/* Barra de 24 Categorías Pegajosa */}
      <CategoryBar
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Cuadrícula de Productos */}
      <main id="catalogo-productos" className="flex-1">
        {isLoading ? (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center">
            <div className="inline-block w-8 h-8 border-3 border-[#E63946] border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-[#6C757D] font-medium font-gotham">
              Cargando catálogo oficial de JG Store...
            </p>
          </div>
        ) : (
          <ProductGrid
            products={displayedProducts}
            categoryTitle={categoryTitle}
            categorySlug={selectedCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onlyInStock={onlyInStock}
            onToggleInStock={() => setOnlyInStock((v) => !v)}
            onResetFilters={handleResetFilters}
            onQuickView={setQuickViewProduct}
          />
        )}
      </main>

      {/* Modal de Vista Rápida */}
      <ProductQuickView
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      {/* Drawer del Carrito */}
      <CartDrawer />

      {/* Pie de Página */}
      <StoreFooter onSelectCategory={setSelectedCategory} />
    </div>
  );
}
