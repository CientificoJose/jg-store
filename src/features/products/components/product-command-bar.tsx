'use client';

import React, { useState, useEffect, useTransition, useMemo } from 'react';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../api/queries';
import { toast } from 'sonner';
import { CatalogResetDialog } from '@/components/catalog-reset-dialog';

interface ProductCommandBarProps {
  totalProducts?: number;
}

export function ProductCommandBar({ totalProducts }: ProductCommandBarProps) {
  const queryClient = useQueryClient();
  const [, startTransition] = useTransition();

  const [categoriesList, setCategoriesList] = useState<ProductCategory[]>(PRODUCT_CATEGORIES);
  const [margenDetal, setMargenDetal] = useState<number>(40);
  const [margenMayor, setMargenMayor] = useState<number>(18);
  const [isApplyingMargins, setIsApplyingMargins] = useState<boolean>(false);

  // Cargar categorías dinámicas desde API (incluyendo subcategorías de proveedores)
  useEffect(() => {
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

  // Parámetros de URL con nuqs para filtrado reactivo
  const [params, setParams] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    name: parseAsString,
    category: parseAsString,
    subcategory: parseAsString,
    sub_subcategory: parseAsString,
    stock_status: parseAsString
  });

  // Determinar el valor seleccionado en el árbol jerárquico único
  const currentTreeValue = useMemo(() => {
    if (params.sub_subcategory && params.subcategory && params.category) {
      return `line:${params.category}:${params.subcategory}:${params.sub_subcategory}`;
    }
    if (params.subcategory && params.category) {
      return `sub:${params.category}:${params.subcategory}`;
    }
    if (params.category) {
      return `cat:${params.category}`;
    }
    return 'all';
  }, [params.category, params.subcategory, params.sub_subcategory]);

  // Información legible del ámbito seleccionado actualmente
  const activeScopeInfo = useMemo(() => {
    if (params.category) {
      const foundCat = categoriesList.find((c) => c.slug === params.category);
      if (foundCat) {
        if (params.sub_subcategory && params.subcategory) {
          const foundSub = foundCat.subcategories?.find((s) => s.slug === params.subcategory);
          const foundLine = foundSub?.sub_subcategories?.find(
            (l) => l.slug === params.sub_subcategory
          );
          if (foundLine) {
            return {
              label: foundLine.name,
              fullPath: `${foundCat.name} > ${foundSub?.name} > ${foundLine.name}`,
              targetSlug: foundLine.slug,
              type: 'line' as const
            };
          }
        }
        if (params.subcategory) {
          const foundSub = foundCat.subcategories?.find((s) => s.slug === params.subcategory);
          if (foundSub) {
            return {
              label: foundSub.name,
              fullPath: `${foundCat.name} > ${foundSub.name}`,
              targetSlug: foundSub.slug,
              type: 'subcategory' as const
            };
          }
        }
        return {
          label: foundCat.name,
          fullPath: foundCat.name,
          targetSlug: foundCat.slug,
          type: 'category' as const
        };
      }
    }

    return {
      label: 'Todo el Catálogo',
      fullPath: 'Todo el Catálogo (Global)',
      targetSlug: undefined,
      type: 'all' as const
    };
  }, [categoriesList, params.category, params.subcategory, params.sub_subcategory]);

  // Manejar cambio en el selector de árbol único
  const handleTreeSelectChange = (value: string) => {
    startTransition(() => {
      if (value === 'all') {
        setParams({
          category: null,
          subcategory: null,
          sub_subcategory: null,
          page: 1
        });
      } else if (value.startsWith('cat:')) {
        const catSlug = value.slice(4);
        setParams({
          category: catSlug,
          subcategory: null,
          sub_subcategory: null,
          page: 1
        });
      } else if (value.startsWith('sub:')) {
        const parts = value.slice(4).split(':');
        setParams({
          category: parts[0],
          subcategory: parts[1],
          sub_subcategory: null,
          page: 1
        });
      } else if (value.startsWith('line:')) {
        const parts = value.slice(5).split(':');
        setParams({
          category: parts[0],
          subcategory: parts[1],
          sub_subcategory: parts[2],
          page: 1
        });
      }
    });
  };

  // Estado local para input de búsqueda con debounce fluido
  const [searchInput, setSearchInput] = useState<string>(params.name || '');

  useEffect(() => {
    setSearchInput(params.name || '');
  }, [params.name]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = searchInput.trim();
      const current = params.name || '';
      if (trimmed !== current) {
        startTransition(() => {
          setParams({
            name: trimmed ? trimmed : null,
            page: 1
          });
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
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
    setSearchInput('');
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

  // Aplicar márgenes contextuales sobre la categoría seleccionada
  const handleApplyMargins = async () => {
    setIsApplyingMargins(true);
    try {
      const isGlobal = !activeScopeInfo.targetSlug;
      const res = await fetch('/api/products/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: isGlobal ? 'all' : 'category',
          category: activeScopeInfo.targetSlug,
          retail_margin: Number(margenDetal),
          wholesale_margin: Number(margenMayor)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar márgenes');

      toast.success(
        `¡Márgenes actualizados en ${activeScopeInfo.label}! ${data.updated_count ?? 0} productos recalculados al instante.`
      );

      // Invalida la caché de React Query para refrescar la tabla de productos inmediatamente
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'Error al recalcular precios masivos');
    } finally {
      setIsApplyingMargins(false);
    }
  };

  const hasActiveFilters = Boolean(
    params.name ||
    params.category ||
    params.subcategory ||
    params.sub_subcategory ||
    params.stock_status
  );

  return (
    <div className='rounded-2xl border border-border/80 bg-card p-4 shadow-sm space-y-4 font-gotham'>
      {/* ─── FILA 1: FILTRO MAESTRO DIRECTO & BUSCADOR ─── */}
      <div className='grid grid-cols-1 md:grid-cols-12 gap-3 items-center'>
        {/* 1. Buscador global por Texto / SKU */}
        <div className='md:col-span-5 relative'>
          <Icons.search className='absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground' />
          <Input
            placeholder='Buscar por nombre, SKU, marca o palabra clave...'
            value={searchInput}
            onChange={handleSearchChange}
            className='pl-10 h-10 text-xs bg-background rounded-xl border-border focus:ring-1 focus:ring-[#E63946]'
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                setParams({ name: null, page: 1 });
              }}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1'
              title='Limpiar búsqueda'
            >
              <Icons.close className='w-3.5 h-3.5' />
            </button>
          )}
        </div>

        {/* 2. El ÚNICO Selector Jerárquico en Árbol Indentado (Directo al grano) */}
        <div className='md:col-span-5 relative'>
          <div className='flex items-center gap-2 h-10 px-3 rounded-xl border border-border bg-background transition-colors focus-within:ring-1 focus-within:ring-[#E63946]'>
            <span className='text-xs font-semibold text-muted-foreground whitespace-nowrap flex items-center gap-1.5'>
              <Icons.filter className='w-4 h-4 text-[#E63946]' />
              <span>Categoría:</span>
            </span>
            <select
              value={currentTreeValue}
              onChange={(e) => handleTreeSelectChange(e.target.value)}
              className='w-full bg-transparent text-xs font-semibold text-foreground outline-none cursor-pointer truncate'
              title='Seleccionar categoría o subcategoría directa'
            >
              <option value='all' className='bg-background text-foreground font-bold'>
                📁 Todo el Catálogo ({categoriesList.length} Departamentos)
              </option>
              {categoriesList.map((cat: ProductCategory) => (
                <optgroup
                  key={cat.slug}
                  label={`── ${cat.name.toUpperCase()} ──`}
                  className='bg-background text-foreground font-bold'
                >
                  <option
                    value={`cat:${cat.slug}`}
                    className='bg-background text-foreground font-semibold'
                  >
                    Todo {cat.name}
                  </option>
                  {(cat.subcategories || []).map((sub) => (
                    <React.Fragment key={sub.slug}>
                      <option
                        value={`sub:${cat.slug}:${sub.slug}`}
                        className='bg-background text-foreground font-normal'
                      >
                        &nbsp;&nbsp;└─ {sub.name}
                      </option>
                      {(sub.sub_subcategories || []).map((line) => (
                        <option
                          key={line.slug}
                          value={`line:${cat.slug}:${sub.slug}:${line.slug}`}
                          className='bg-background text-foreground font-light text-[11px]'
                        >
                          &nbsp;&nbsp;&nbsp;&nbsp;└── {line.name}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* 3. Selector de Stock */}
        <div className='md:col-span-2'>
          <select
            value={params.stock_status || 'all'}
            onChange={(e) => handleStockChange(e.target.value)}
            className='w-full h-10 px-3 rounded-xl border border-border bg-background text-xs font-medium text-foreground outline-none focus:ring-1 focus:ring-[#E63946] cursor-pointer'
            title='Filtrar por Disponibilidad de Stock'
          >
            <option value='all'>Stock: Todos</option>
            <option value='in_stock'>En Stock</option>
            <option value='low_stock'>Stock Bajo (&lt;5)</option>
            <option value='out_of_stock'>Agotados (0)</option>
          </select>
        </div>
      </div>

      {/* ─── FILA 2: BARRA DE ACCIÓN MASIVA CONTEXTUAL (PRECIOS & MÁRGENES) ─── */}
      <div className='pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-3'>
        {/* Lado Izquierdo: Información del Ámbito + Controles de Porcentaje */}
        <div className='flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs'>
          {/* Badge del Ámbito Activo */}
          <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/80'>
            <Icons.sparkles className='w-3.5 h-3.5 text-[#D4A017]' />
            <span className='text-muted-foreground font-medium text-[11px]'>Ámbito:</span>
            <span
              className='font-bold text-foreground text-xs truncate max-w-[220px]'
              title={activeScopeInfo.fullPath}
            >
              {activeScopeInfo.label}
            </span>
            {totalProducts !== undefined && (
              <span className='ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E63946]/10 text-[#E63946]'>
                {totalProducts} prods
              </span>
            )}
          </div>

          {/* Margen Detal */}
          <div className='flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-lg'>
            <span className='text-muted-foreground font-medium text-[11px] whitespace-nowrap'>
              Margen Detal:
            </span>
            <input
              type='number'
              min='0'
              max='300'
              value={margenDetal}
              onChange={(e) => setMargenDetal(Number(e.target.value))}
              disabled={isApplyingMargins}
              className='w-12 bg-transparent text-foreground text-xs font-bold text-center outline-none'
            />
            <span className='text-muted-foreground font-semibold text-[11px]'>%</span>
          </div>

          {/* Margen Mayorista */}
          <div className='flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-lg'>
            <span className='text-muted-foreground font-medium text-[11px] whitespace-nowrap flex items-center gap-1'>
              <Icons.tags className='w-3 h-3 text-[#D4A017]' />
              Margen Mayor:
            </span>
            <input
              type='number'
              min='0'
              max='300'
              value={margenMayor}
              onChange={(e) => setMargenMayor(Number(e.target.value))}
              disabled={isApplyingMargins}
              className='w-12 bg-transparent text-foreground text-xs font-bold text-center outline-none'
            />
            <span className='text-muted-foreground font-semibold text-[11px]'>%</span>
          </div>
        </div>

        {/* Lado Derecho: Botón de Acción Dinámico + Reset */}
        <div className='flex items-center gap-2 w-full sm:w-auto justify-end'>
          {/* Botón de Vaciar Catálogo y Categorías con confirmación de 5s */}
          <CatalogResetDialog compact triggerButtonText='Vaciar Catálogo' />

          {/* Botón Reset si hay filtros aplicados */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className='px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-xl transition-colors flex items-center gap-1.5'
              title='Restablecer todos los filtros'
            >
              <Icons.refresh className='w-3.5 h-3.5' />
              <span>Limpiar filtros</span>
            </button>
          )}

          {/* Botón Principal de Recálculo Masivo */}
          <button
            onClick={handleApplyMargins}
            disabled={isApplyingMargins}
            className='px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 bg-[#E63946] hover:bg-[#d02e3b] text-white transition-all shadow-md shadow-[#E63946]/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap active:scale-95'
          >
            {isApplyingMargins ? (
              <Icons.spinner className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <Icons.sparkles className='w-3.5 h-3.5 text-[#D4A017]' />
            )}
            <span>
              {isApplyingMargins
                ? 'Recalculando precios...'
                : activeScopeInfo.type === 'all'
                  ? `Aplicar Márgenes a Todo (${totalProducts ?? 'Catálogo'})`
                  : `Aplicar Márgenes a "${activeScopeInfo.label}" (${totalProducts ?? ''})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
