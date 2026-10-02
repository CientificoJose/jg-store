'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { fetchStoreProductsWithMeta } from '@/lib/store-service';
import { SearchMatchMetadata } from '@/lib/search-engine';
import { useFavoritesStore } from '@/hooks/use-favorites-store';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { CATEGORY_MAP } from '@/constants/categories';
import { StoreHeader } from './store-header';
import { CategoryBar } from './category-bar';
import { HeroBanner } from './hero-banner';
import { CategoryShowcase } from './category-showcase';
import { HorizontalProductRow } from './horizontal-product-row';
import { ProductGrid } from './product-grid';
import { CartDrawer } from './cart-drawer';
import { ProductQuickView } from './product-quick-view';
import { StoreFooter } from './store-footer';
import { INITIAL_PRODUCTS } from '@/constants/initial-catalog';

export function StoreFront() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<ProductSortOption>('popular');
  const [onlyInStock, setOnlyInStock] = useState<boolean>(false);
  const [quickViewProduct, setQuickViewProduct] = useState<StoreProduct | null>(null);

  const { favoriteIds, showOnlyFavorites, setShowOnlyFavorites } = useFavoritesStore();

  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<SearchMatchMetadata | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Carga de productos
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchStoreProductsWithMeta({
      category: selectedCategory,
      search: searchQuery,
      sort: sortOption,
      onlyInStock
    })
      .then((data) => {
        if (isMounted) {
          setProducts(data.products);
          setSearchMetadata(data.searchMetadata);
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

  // Productos recomendados para búsquedas sin resultados
  const recommendedProducts = useMemo(() => {
    return products.length > 0 ? products.slice(0, 8) : INITIAL_PRODUCTS.slice(0, 8);
  }, [products]);

  const landing = useStoreConfigStore((s) => s.landing);

  // Computar productos para cada fila horizontal de la landing
  const getRowProducts = (row: (typeof landing.productRows)[0]) => {
    if (row.type === 'trending') {
      const featured = products.filter((p) => p.featured);
      return featured.length > 0 ? featured.slice(0, row.limit) : products.slice(0, row.limit);
    }
    if (row.type === 'wholesale') {
      const wholesale = products.filter(
        (p) => (p.retail_price - p.wholesale_price) / p.retail_price >= 0.25 || p.min_wholesale_qty <= 6
      );
      return wholesale.length > 0 ? wholesale.slice(0, row.limit) : products.slice(0, row.limit);
    }
    if (row.type === 'category' && row.categorySlug) {
      return products.filter((p) => p.category_slug === row.categorySlug).slice(0, row.limit);
    }
    return products.slice(0, row.limit);
  };

  const isSearching = searchQuery.trim().length > 0;
  const isCategorySelected = selectedCategory && selectedCategory !== 'all';
  const isFilteredView = isSearching || isCategorySelected;

  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    if (cat !== 'all') {
      setTimeout(() => {
        const gridEl = document.getElementById('catalogo-productos');
        if (gridEl) {
          gridEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-[#E63946] selection:text-white font-gotham transition-colors duration-200">
      {/* Header Fijo */}
      <StoreHeader
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (q.trim()) {
            setSelectedCategory('all');
          }
        }}
        onSelectCategory={handleSelectCategory}
      />

      {/* Hero Banner con Carrusel Promocional (se oculta al realizar una búsqueda o seleccionar una categoría para mostrar directamente el catálogo filtrado estilo Mercado Libre) */}
      {!isFilteredView && (
        <HeroBanner
          onExploreCatalog={handleExploreCatalog}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Vitrina de Categorías con Fotos Miniatura (Inspiración SHOPLUXE) */}
      {!isFilteredView && !showOnlyFavorites && landing.showCategoryCards && (
        <CategoryShowcase
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          style={landing.categoryStyle}
        />
      )}

      {/* Barra de 24 Categorías Pegajosa (Texto plano / Pills - Controlada desde Configuración) */}
      {!isFilteredView && !showOnlyFavorites && landing.showCategoryPillsBar && (
        <CategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Filas de Productos Horizontales "de costado" configurables desde el panel de control */}
      {!isFilteredView && selectedCategory === 'all' && !showOnlyFavorites && (
        <div>
          {landing.productRows
            .filter((row) => row.enabled)
            .map((row) => {
              const rowItems = getRowProducts(row);
              if (rowItems.length === 0) return null;
              return (
                <HorizontalProductRow
                  key={row.id}
                  id={row.id}
                  title={row.title}
                  subtitle={row.subtitle}
                  products={rowItems}
                  categorySlug={row.categorySlug}
                  onSelectCategory={handleSelectCategory}
                  onQuickView={setQuickViewProduct}
                />
              );
            })}
        </div>
      )}

      {/* Cuadrícula Principal de Productos */}
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
            onSelectCategory={handleSelectCategory}
            sortOption={sortOption}
            onSortChange={setSortOption}
            onlyInStock={onlyInStock}
            onToggleInStock={() => setOnlyInStock((v) => !v)}
            onResetFilters={handleResetFilters}
            onQuickView={setQuickViewProduct}
            searchQuery={searchQuery}
            onClearSearch={() => setSearchQuery('')}
            recommendedProducts={recommendedProducts}
            searchMetadata={searchMetadata}
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
      <StoreFooter onSelectCategory={handleSelectCategory} />
    </div>
  );
}
