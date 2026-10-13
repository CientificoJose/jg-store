'use client';

import { useState } from 'react';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';
import { Icons } from '@/components/icons';
import { useQueryClient } from '@tanstack/react-query';
import { productKeys } from '../api/queries';
import { toast } from 'sonner';

export function BulkMarginToolbar() {
  const queryClient = useQueryClient();
  const [scope, setScope] = useState<'all' | 'category'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [margenDetal, setMargenDetal] = useState<number>(40);
  const [margenMayor, setMargenMayor] = useState<number>(18);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleApplyMargins = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: selectedCategory === 'all' ? 'all' : 'category',
          category: selectedCategory === 'all' ? undefined : selectedCategory,
          retail_margin: Number(margenDetal),
          wholesale_margin: Number(margenMayor)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al actualizar márgenes');

      toast.success(
        `¡Márgenes actualizados! ${data.updated_count ?? 0} productos recalculados al instante.`
      );

      // Invalida la caché de React Query para refrescar la tabla de productos inmediatamente
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'Error al recalcular precios masivos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='rounded-xl border border-border/70 bg-card/95 backdrop-blur-xs p-3.5 shadow-xs mb-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        {/* Título y badge */}
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-[#E63946]/10 text-[#E63946] flex items-center justify-center font-bold'>
            <Icons.sparkles className='w-4 h-4' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-xs font-bold tracking-tight text-foreground font-gotham uppercase'>
                Gestor Masivo de Precios & Márgenes
              </h3>
              <span className='px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30'>
                Instantáneo
              </span>
            </div>
            <p className='text-[11px] text-muted-foreground'>
              Ajusta márgenes sobre el costo base de Coronel y actualiza todo el catálogo o por
              departamento
            </p>
          </div>
        </div>

        {/* Controles interactivos */}
        <div className='flex flex-wrap items-center gap-2.5 text-xs'>
          {/* Selector de Ámbito / Categoría */}
          <div className='flex items-center gap-1.5 bg-muted/50 border border-border/80 px-2 py-1 rounded-lg'>
            <span className='text-muted-foreground font-medium text-[11px]'>Ámbito:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setScope(e.target.value === 'all' ? 'all' : 'category');
              }}
              className='bg-transparent text-foreground font-semibold text-xs outline-none cursor-pointer max-w-[170px] truncate'
            >
              <option value='all' className='bg-background text-foreground'>
                Todo el Catálogo (Global)
              </option>
              {PRODUCT_CATEGORIES.map((cat: ProductCategory) => (
                <option key={cat.slug} value={cat.slug} className='bg-background text-foreground'>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Margen Detal */}
          <div className='flex items-center gap-1.5 bg-muted/50 border border-border/80 px-2 py-1 rounded-lg'>
            <span className='text-muted-foreground font-medium text-[11px]'>Detal (B2C):</span>
            <div className='flex items-center'>
              <input
                type='number'
                min='0'
                max='300'
                value={margenDetal}
                onChange={(e) => setMargenDetal(Number(e.target.value))}
                className='w-11 bg-transparent text-foreground font-bold text-center outline-none'
              />
              <span className='text-muted-foreground font-semibold text-[11px]'>%</span>
            </div>
          </div>

          {/* Margen Mayorista */}
          <div className='flex items-center gap-1.5 bg-muted/50 border border-border/80 px-2 py-1 rounded-lg'>
            <span className='text-muted-foreground font-medium text-[11px]'>Mayor (B2B):</span>
            <div className='flex items-center'>
              <input
                type='number'
                min='0'
                max='300'
                value={margenMayor}
                onChange={(e) => setMargenMayor(Number(e.target.value))}
                className='w-11 bg-transparent text-foreground font-bold text-center outline-none'
              />
              <span className='text-muted-foreground font-semibold text-[11px]'>%</span>
            </div>
          </div>

          {/* Botón de Aplicación */}
          <button
            onClick={handleApplyMargins}
            disabled={isLoading}
            className='px-3.5 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#c92a37] text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 font-gotham text-xs'
          >
            <Icons.refresh className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Recalculando...' : 'Aplicar a Catálogo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
