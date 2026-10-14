'use client';

import React, { useTransition } from 'react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';
import { SubCategory, SubSubCategory } from '@/types/store';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ProductHierarchyFilters() {
  const [, startTransition] = useTransition();

  const [categoriesList, setCategoriesList] = React.useState<ProductCategory[]>(PRODUCT_CATEGORIES);

  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategoriesList(data);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    name: parseAsString,
    category: parseAsString,
    subcategory: parseAsString,
    sub_subcategory: parseAsString,
    stock_status: parseAsString
  });

  // Categoría seleccionada (Nivel 1)
  const selectedCategory = categoriesList.find(
    (c: ProductCategory) => c.slug === params.category
  );

  // Subcategorías disponibles según la categoría seleccionada (Nivel 2)
  const availableSubcategories: SubCategory[] = selectedCategory?.subcategories || [];

  // Subcategoría seleccionada (Nivel 2)
  const selectedSubcategory = availableSubcategories.find(
    (s: SubCategory) => s.slug === params.subcategory
  );

  // Sub-subcategorías disponibles según la subcategoría seleccionada (Nivel 3)
  const availableSubSubcategories: SubSubCategory[] = selectedSubcategory?.sub_subcategories || [];

  const hasActiveFilters = Boolean(
    params.name ||
    params.category ||
    params.subcategory ||
    params.sub_subcategory ||
    params.stock_status
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    startTransition(() => {
      setParams({
        name: val.trim() ? val : null,
        page: 1
      });
    });
  };

  const handleCategoryChange = (slug: string) => {
    startTransition(() => {
      setParams({
        category: slug === 'all' ? null : slug,
        subcategory: null,
        sub_subcategory: null,
        page: 1
      });
    });
  };

  const handleSubcategoryChange = (slug: string) => {
    startTransition(() => {
      setParams({
        subcategory: slug === 'all' ? null : slug,
        sub_subcategory: null,
        page: 1
      });
    });
  };

  const handleSubSubcategoryChange = (slug: string) => {
    startTransition(() => {
      setParams({
        sub_subcategory: slug === 'all' ? null : slug,
        page: 1
      });
    });
  };

  const handleStockChange = (status: string) => {
    startTransition(() => {
      setParams({
        stock_status: status === 'all' ? null : status,
        page: 1
      });
    });
  };

  const handleResetFilters = () => {
    startTransition(() => {
      setParams({
        name: null,
        category: null,
        subcategory: null,
        sub_subcategory: null,
        stock_status: null,
        page: 1
      });
    });
  };

  return (
    <div className='rounded-xl border border-border/80 bg-card p-3 shadow-xs space-y-3'>
      {/* Fila principal de controles de filtrado */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-center'>
        {/* 1. Búsqueda por Texto */}
        <div className='lg:col-span-4 relative'>
          <Icons.search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre, SKU o palabra clave...'
            value={params.name || ''}
            onChange={handleSearchChange}
            className='pl-9 h-9 text-xs font-gotham bg-background'
          />
          {params.name && (
            <button
              onClick={() => setParams({ name: null, page: 1 })}
              className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs'
            >
              <Icons.close className='w-3.5 h-3.5' />
            </button>
          )}
        </div>

        {/* 2. Selector Nivel 1: Rubro / Departamento */}
        <div className='lg:col-span-3'>
          <select
            value={params.category || 'all'}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className='w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-[#E63946] transition-colors cursor-pointer truncate'
          >
            <option value='all'>Todos los Departamentos ({categoriesList.length})</option>
            {categoriesList.map((cat: ProductCategory) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Selector Nivel 2: Subcategoría */}
        <div className='lg:col-span-2'>
          <select
            value={params.subcategory || 'all'}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            disabled={!params.category || availableSubcategories.length === 0}
            className={`w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-[#E63946] transition-colors cursor-pointer truncate ${
              !params.category || availableSubcategories.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <option value='all'>
              {!params.category
                ? 'Subcategorías (Elige depto)'
                : availableSubcategories.length === 0
                  ? 'Sin subcategorías'
                  : 'Todas las Subcategorías'}
            </option>
            {availableSubcategories.map((sub: SubCategory) => (
              <option key={sub.slug} value={sub.slug}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Selector Nivel 3: Línea de Producto */}
        <div className='lg:col-span-2'>
          <select
            value={params.sub_subcategory || 'all'}
            onChange={(e) => handleSubSubcategoryChange(e.target.value)}
            disabled={!params.subcategory || availableSubSubcategories.length === 0}
            className={`w-full h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-[#E63946] transition-colors cursor-pointer truncate ${
              !params.subcategory || availableSubSubcategories.length === 0
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <option value='all'>
              {!params.subcategory
                ? 'Líneas (Elige subcat)'
                : availableSubSubcategories.length === 0
                  ? 'Sin líneas específicas'
                  : 'Todas las Líneas'}
            </option>
            {availableSubSubcategories.map((line: SubSubCategory) => (
              <option key={line.slug} value={line.slug}>
                {line.name}
              </option>
            ))}
          </select>
        </div>

        {/* 5. Selector de Stock y Botón Reset */}
        <div className='lg:col-span-1 flex items-center gap-1.5'>
          <select
            value={params.stock_status || 'all'}
            onChange={(e) => handleStockChange(e.target.value)}
            className='w-full h-9 px-2 rounded-lg border border-border bg-background text-[11px] font-medium text-foreground outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer'
            title='Filtrar por Disponibilidad de Stock'
          >
            <option value='all'>Stock: Todos</option>
            <option value='in_stock'>En Stock</option>
            <option value='low_stock'>Stock Bajo</option>
            <option value='out_of_stock'>Agotado</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleResetFilters}
              title='Limpiar todos los filtros'
              className='h-9 w-9 p-0 text-muted-foreground hover:text-[#E63946] shrink-0'
            >
              <Icons.close className='w-4 h-4' />
            </Button>
          )}
        </div>
      </div>

      {/* Indicadores de Filtros Activos (Pills) */}
      {hasActiveFilters && (
        <div className='flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/50 text-[11px]'>
          <span className='text-muted-foreground font-semibold flex items-center gap-1'>
            <Icons.filter className='w-3 h-3 text-[#E63946]' />
            Filtros activos:
          </span>

          {params.name && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground border border-border font-medium'>
              Búsqueda: &ldquo;{params.name}&rdquo;
              <button
                onClick={() => setParams({ name: null, page: 1 })}
                className='hover:text-[#E63946]'
              >
                ×
              </button>
            </span>
          )}

          {selectedCategory && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20 font-medium'>
              Depto: {selectedCategory.name}
              <button onClick={() => handleCategoryChange('all')} className='hover:text-foreground'>
                ×
              </button>
            </span>
          )}

          {selectedSubcategory && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium'>
              Subcat: {selectedSubcategory.name}
              <button
                onClick={() => handleSubcategoryChange('all')}
                className='hover:text-foreground'
              >
                ×
              </button>
            </span>
          )}

          {params.sub_subcategory && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium'>
              Línea: {params.sub_subcategory}
              <button
                onClick={() => handleSubSubcategoryChange('all')}
                className='hover:text-foreground'
              >
                ×
              </button>
            </span>
          )}

          {params.stock_status && (
            <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground border border-border font-medium'>
              {params.stock_status === 'in_stock'
                ? 'Solo En Stock'
                : params.stock_status === 'low_stock'
                  ? 'Stock Crítico'
                  : 'Solo Agotados'}
              <button onClick={() => handleStockChange('all')} className='hover:text-[#E63946]'>
                ×
              </button>
            </span>
          )}

          <button
            onClick={handleResetFilters}
            className='ml-auto text-[11px] text-[#E63946] hover:underline font-semibold'
          >
            Restablecer todo
          </button>
        </div>
      )}
    </div>
  );
}
