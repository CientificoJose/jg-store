'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { productKeys, productsQueryOptions } from '../../api/queries';
import { columns } from './columns';
import { Icons } from '@/components/icons';
import { AlertModal } from '@/components/modal/alert-modal';
import { toast } from 'sonner';
import type { Product } from '../../api/types';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function ProductTable() {
  const queryClient = useQueryClient();

  // Estados para acciones masivas e inline
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [savingStockId, setSavingStockId] = useState<string | null>(null);
  const [bulkStockVal, setBulkStockVal] = useState<number>(50);
  const [bulkRetailMargin, setBulkRetailMargin] = useState<number>(40);
  const [bulkWholesaleMargin, setBulkWholesaleMargin] = useState<number>(18);
  const [isUpdatingBulkStock, setIsUpdatingBulkStock] = useState<boolean>(false);
  const [isUpdatingBulkMargins, setIsUpdatingBulkMargins] = useState<boolean>(false);
  const [isDeletingBulk, setIsDeletingBulk] = useState<boolean>(false);

  // Modal de confirmación de eliminación
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [productsToDelete, setProductsToDelete] = useState<Product[]>([]);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    category: parseAsString,
    subcategory: parseAsString,
    sub_subcategory: parseAsString,
    stock_status: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.category && { categories: params.category }),
    ...(params.subcategory && { subcategory: params.subcategory }),
    ...(params.sub_subcategory && { sub_subcategory: params.sub_subcategory }),
    ...(params.stock_status && { stock_status: params.stock_status }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(productsQueryOptions(filters));

  const pageCount = Math.ceil(data.total_products / params.perPage);

  // Guardar stock inline en un producto individual
  const handleSaveSingleStock = async (id: string, stockValue: number) => {
    setSavingStockId(id);
    try {
      const res = await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id], stock: stockValue })
      });
      if (!res.ok) throw new Error('Error al actualizar stock');

      toast.success(`Stock actualizado a ${stockValue} unidades en Supabase`);
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'No se pudo guardar el stock');
    } finally {
      setSavingStockId(null);
    }
  };

  const { table } = useDataTable({
    data: data.products,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { left: ['select'], right: ['actions'] }
    }
  });

  // Conectar callbacks y modo de selección global con las celdas de las columnas vía meta
  table.options.meta = {
    onUpdateStock: handleSaveSingleStock,
    savingStockId,
    isAllSelected,
    onToggleSelectAll: (val: boolean) => {
      setIsAllSelected(val);
      if (!val) {
        table.resetRowSelection();
      } else {
        table.toggleAllPageRowsSelected(true);
      }
    },
    onDeleteSingle: (product: Product) => {
      setProductsToDelete([product]);
      setDeleteConfirmOpen(true);
    }
  };

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = isAllSelected || selectedRows.length > 0;
  const selectedCount = isAllSelected ? data.total_products : selectedRows.length;
  const selectedIds = selectedRows.map((r) => r.original.id);

  // Fijar Stock Masivo sobre productos seleccionados
  const handleBulkStockUpdate = async () => {
    if (!hasSelection) return;
    setIsUpdatingBulkStock(true);
    try {
      const payload = isAllSelected
        ? {
            selectAll: true,
            filters: {
              category: params.category,
              subcategory: params.subcategory,
              sub_subcategory: params.sub_subcategory,
              search: params.name,
              stock_status: params.stock_status
            },
            stock: Number(bulkStockVal)
          }
        : {
            ids: selectedIds,
            stock: Number(bulkStockVal)
          };

      const res = await fetch('/api/products/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || 'Error al actualizar stock masivo');
      }

      toast.success(
        `Stock actualizado a ${bulkStockVal} unidades en ${resData.updated_count ?? selectedCount} productos de Supabase`
      );
      setIsAllSelected(false);
      table.resetRowSelection();
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'Error actualizando stock');
    } finally {
      setIsUpdatingBulkStock(false);
    }
  };

  // Fijar Márgenes Masivos sobre productos seleccionados
  const handleBulkMarginsUpdate = async () => {
    if (!hasSelection) return;
    setIsUpdatingBulkMargins(true);
    try {
      const payload = isAllSelected
        ? {
            scope: params.category ? 'category' : 'all',
            category: params.category,
            retail_margin: Number(bulkRetailMargin),
            wholesale_margin: Number(bulkWholesaleMargin)
          }
        : {
            ids: selectedIds,
            retail_margin: Number(bulkRetailMargin),
            wholesale_margin: Number(bulkWholesaleMargin)
          };

      const res = await fetch('/api/products/margins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Error al actualizar márgenes');

      toast.success(
        `Márgenes y precios recalculados para ${resData.updated_count ?? selectedCount} productos en Supabase`
      );
      setIsAllSelected(false);
      table.resetRowSelection();
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'Error actualizando márgenes');
    } finally {
      setIsUpdatingBulkMargins(false);
    }
  };

  // Confirmar eliminación de productos (individual o masivo)
  const handleConfirmDelete = async () => {
    if (productsToDelete.length === 0) return;
    setIsDeletingBulk(true);
    try {
      const idsToDelete = productsToDelete.map((p) => p.id);
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: idsToDelete })
      });
      if (!res.ok) throw new Error('Error al eliminar productos');

      toast.success(`${productsToDelete.length} producto(s) eliminado(s) exitosamente de Supabase`);
      setDeleteConfirmOpen(false);
      setProductsToDelete([]);
      setIsAllSelected(false);
      table.resetRowSelection();
      await queryClient.invalidateQueries({ queryKey: productKeys.all });
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar productos');
    } finally {
      setIsDeletingBulk(false);
    }
  };

  return (
    <div className='flex flex-1 flex-col space-y-4'>
      {/* ─── BARRA FLOTANTE / CONTEXTUAL DE ACCIONES MASIVAS ─── */}
      {hasSelection && (
        <div className='p-3 bg-red-500/10 border-2 border-[#E63946]/50 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1 font-gotham shadow-md'>
          <div className='flex items-center gap-2'>
            <span className='px-2.5 py-0.5 rounded-md bg-[#E63946] text-white font-bold text-xs'>
              {selectedCount}
            </span>
            <span className='font-bold text-foreground text-sm'>
              {isAllSelected
                ? `Todos los ${data.total_products} productos seleccionados (Catálogo / Filtro actual)`
                : selectedCount === 1
                  ? 'producto seleccionado'
                  : 'productos seleccionados'}
            </span>
            <button
              onClick={() => {
                setIsAllSelected(false);
                table.resetRowSelection();
              }}
              className='text-muted-foreground hover:text-foreground text-xs underline ml-1 cursor-pointer'
            >
              Deseleccionar
            </button>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            {/* 1. Fijar Stock Masivo */}
            <div className='flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-xl shadow-sm'>
              <span className='text-muted-foreground font-semibold text-xs'>Stock:</span>
              <input
                type='number'
                min='0'
                max='99999'
                value={bulkStockVal}
                onChange={(e) => setBulkStockVal(Number(e.target.value))}
                className='w-14 bg-transparent text-foreground font-bold text-center outline-none text-xs'
              />
              <button
                onClick={handleBulkStockUpdate}
                disabled={isUpdatingBulkStock}
                className='px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all disabled:opacity-50 cursor-pointer text-xs flex items-center gap-1'
              >
                {isUpdatingBulkStock && <Icons.spinner className='w-3 h-3 animate-spin' />}
                <span>Fijar</span>
              </button>
            </div>

            {/* 2. Fijar Márgenes Masivos */}
            <div className='flex items-center gap-1.5 bg-background border border-border px-2.5 py-1.5 rounded-xl shadow-sm'>
              <span className='text-muted-foreground font-semibold text-xs'>Márgenes:</span>
              <span className='text-[10px] text-muted-foreground'>Detal:</span>
              <input
                type='number'
                min='0'
                max='300'
                value={bulkRetailMargin}
                onChange={(e) => setBulkRetailMargin(Number(e.target.value))}
                className='w-10 bg-transparent text-foreground font-bold text-center outline-none text-xs'
              />
              <span className='text-muted-foreground font-semibold text-xs'>%</span>
              <span className='text-[10px] text-muted-foreground ml-1'>Mayor:</span>
              <input
                type='number'
                min='0'
                max='300'
                value={bulkWholesaleMargin}
                onChange={(e) => setBulkWholesaleMargin(Number(e.target.value))}
                className='w-10 bg-transparent text-foreground font-bold text-center outline-none text-xs'
              />
              <span className='text-muted-foreground font-semibold text-xs'>%</span>
              <button
                onClick={handleBulkMarginsUpdate}
                disabled={isUpdatingBulkMargins}
                className='px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all disabled:opacity-50 ml-1 cursor-pointer text-xs flex items-center gap-1'
              >
                {isUpdatingBulkMargins && <Icons.spinner className='w-3 h-3 animate-spin' />}
                <span>Aplicar</span>
              </button>
            </div>

            {/* 3. Eliminar Seleccionados */}
            <button
              onClick={() => {
                setProductsToDelete(selectedRows.map((r) => r.original));
                setDeleteConfirmOpen(true);
              }}
              disabled={isDeletingBulk}
              className='px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer text-xs shadow-sm'
            >
              {isDeletingBulk ? (
                <Icons.spinner className='w-3.5 h-3.5 animate-spin' />
              ) : (
                <Icons.trash className='w-3.5 h-3.5' />
              )}
              <span>Eliminar ({selectedCount})</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <AlertModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setProductsToDelete([]);
        }}
        onConfirm={handleConfirmDelete}
        loading={isDeletingBulk}
        title={
          productsToDelete.length === 1
            ? `¿Eliminar "${productsToDelete[0]?.name}"?`
            : `¿Eliminar ${productsToDelete.length} productos seleccionados?`
        }
        description='Esta acción eliminará permanentemente el producto o lote seleccionado de la base de datos de Supabase. Esta operación no se puede deshacer.'
        confirmLabel={
          isDeletingBulk
            ? 'Eliminando...'
            : productsToDelete.length === 1
              ? 'Eliminar Producto'
              : `Eliminar ${productsToDelete.length} Productos`
        }
      />

      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}
