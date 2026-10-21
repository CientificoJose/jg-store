'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Product } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { formatPrice } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

function InlineStockCell({
  product,
  onSave,
  isSaving
}: {
  product: Product;
  onSave?: (id: string, newStock: number) => void;
  isSaving?: boolean;
}) {
  const [val, setVal] = React.useState<number>(product.stock ?? 0);

  React.useEffect(() => {
    setVal(product.stock ?? 0);
  }, [product.stock]);

  const handleBlur = () => {
    if (val !== product.stock && onSave) {
      onSave(product.id, val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  return (
    <div className='flex items-center gap-1.5'>
      <span
        className={`w-2 h-2 rounded-full shrink-0 ${
          val <= 0 ? 'bg-[#6C757D]' : val <= 10 ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
      />
      <input
        type='number'
        min='0'
        max='99999'
        value={val}
        onChange={(e) => setVal(Number(e.target.value))}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          'w-16 px-1.5 py-0.5 text-center font-bold text-xs rounded border transition-all outline-none',
          val <= 0
            ? 'bg-red-500/10 text-red-500 border-red-500/30'
            : val <= 10
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30'
              : 'bg-background text-foreground border-border focus:border-[#E63946]'
        )}
        title='Presiona Enter o haz clic fuera para guardar stock en Supabase'
      />
      {isSaving && <Icons.spinner className='w-3.5 h-3.5 animate-spin text-[#E63946] shrink-0' />}
    </div>
  );
}

export const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => {
      const meta = table.options.meta as any;
      const isAllSelected = Boolean(meta?.isAllSelected);
      const isPageSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();
      return (
        <div className='flex items-center justify-center px-1'>
          <input
            type='checkbox'
            checked={isAllSelected || isPageSelected}
            ref={(input) => {
              if (input) {
                input.indeterminate = !isAllSelected && isSomeSelected;
              }
            }}
            onChange={(e) => {
              if (meta?.onToggleSelectAll) {
                meta.onToggleSelectAll(e.target.checked);
              } else {
                table.toggleAllPageRowsSelected(e.target.checked);
              }
            }}
            className='w-3.5 h-3.5 rounded border-border accent-[#E63946] cursor-pointer'
            title={isAllSelected ? 'Deseleccionar todo' : 'Seleccionar todos los productos'}
          />
        </div>
      );
    },
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const isAllSelected = Boolean(meta?.isAllSelected);
      return (
        <div className='flex items-center justify-center px-1'>
          <input
            type='checkbox'
            checked={isAllSelected || row.getIsSelected()}
            onChange={(e) => {
              if (isAllSelected && meta?.onToggleSelectAll) {
                meta.onToggleSelectAll(false);
              }
              row.toggleSelected(e.target.checked);
            }}
            className='w-3.5 h-3.5 rounded border-border accent-[#E63946] cursor-pointer'
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 36
  },
  {
    id: 'photo_url',
    accessorKey: 'photo_url',
    header: 'FOTO',
    cell: ({ row }) => {
      const src =
        row.getValue<string>('photo_url') ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
      const imagesCount = row.original.images?.length || 1;
      return (
        <div className='relative w-12 h-12 rounded-lg overflow-hidden border border-border/80 bg-muted/40 shrink-0'>
          <Image src={src} alt={row.getValue('name')} fill sizes='48px' className='object-cover' />
          {imagesCount > 1 && (
            <span className='absolute bottom-0.5 right-0.5 text-[9px] font-bold bg-black/75 text-white px-1 py-0.2 rounded shadow'>
              +{imagesCount - 1}
            </span>
          )}
        </div>
      );
    }
  },
  {
    id: 'sku',
    accessorKey: 'sku',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='SKU' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col gap-1 items-start'>
        <span className='font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/60'>
          {row.original.sku}
        </span>
        {row.original.barcode && (
          <span
            title={`Código de barra EAN: ${row.original.barcode}`}
            className='inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40'
          >
            <Icons.barcode className='w-3.5 h-3.5 text-muted-foreground/80 shrink-0' />
            {row.original.barcode}
          </span>
        )}
      </div>
    ),
    enableColumnFilter: false
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col max-w-xs'>
        <div className='flex items-center gap-1.5'>
          {row.original.brand && (
            <span className='text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 shrink-0'>
              {row.original.brand}
            </span>
          )}
          <span className='font-semibold text-foreground text-sm line-clamp-1'>
            {row.original.name}
          </span>
        </div>
        <span className='text-xs text-[#6C757D] line-clamp-1'>{row.original.description}</span>
      </div>
    ),
    enableColumnFilter: false
  },
  {
    id: 'category',
    accessorKey: 'category',
    enableSorting: false,
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Rubro / Jerarquía' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex flex-wrap items-center gap-1'>
          <Badge
            variant='outline'
            className='text-xs font-semibold border-[#E63946]/30 text-[#E63946] bg-[#E63946]/5'
          >
            {row.original.category_name}
          </Badge>
          {row.original.subcategory_name && (
            <span className='text-[11px] text-muted-foreground font-medium'>
              &gt; {row.original.subcategory_name}
            </span>
          )}
          {row.original.sub_subcategory_name && (
            <span className='text-[10px] text-muted-foreground/80'>
              &gt; {row.original.sub_subcategory_name}
            </span>
          )}
        </div>
      );
    },
    enableColumnFilter: false
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const isSaving = meta?.savingStockId === row.original.id;
      return (
        <InlineStockCell
          product={row.original}
          onSave={meta?.onUpdateStock}
          isSaving={isSaving}
        />
      );
    }
  },
  {
    id: 'retail_price',
    accessorKey: 'retail_price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='PVP Detal (B2C)' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span suppressHydrationWarning className='font-bold text-sm text-foreground font-gotham'>
          {formatPrice(row.original.retail_price)}
        </span>
        {row.original.cost_price ? (
          <span suppressHydrationWarning className='text-[10px] text-muted-foreground'>
            Costo: {formatPrice(row.original.cost_price)} (+{row.original.retail_margin_pct ?? 40}%)
          </span>
        ) : null}
      </div>
    )
  },
  {
    id: 'wholesale_price',
    accessorKey: 'wholesale_price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='PVP Mayor (B2B)' />
    ),
    cell: ({ row }) => {
      const discount = Math.round(
        ((row.original.retail_price - row.original.wholesale_price) / row.original.retail_price) *
          100
      );
      return (
        <div className='flex flex-col'>
          <div className='flex items-center gap-1.5'>
            <span
              suppressHydrationWarning
              className='font-bold text-sm text-[#D4A017] font-bebas tracking-wide text-base'
            >
              {formatPrice(row.original.wholesale_price)}
            </span>
            {discount > 0 && (
              <span className='px-1.5 py-0.5 rounded text-[10px] font-black bg-[#D4A017] text-white'>
                -{discount}%
              </span>
            )}
          </div>
          <span suppressHydrationWarning className='text-[10px] text-[#6C757D]'>
            Margen: +{row.original.wholesale_margin_pct ?? 18}% • Mín.{' '}
            {row.original.min_wholesale_qty} {row.original.unit || 'u.'}
          </span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      return (
        <div className='flex items-center justify-end gap-1'>
          <button
            onClick={() => meta?.onDeleteSingle?.(row.original)}
            className='p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer'
            title={`Eliminar ${row.original.name} de Supabase`}
          >
            <Icons.trash className='w-3.5 h-3.5' />
          </button>
          <CellAction data={row.original} />
        </div>
      );
    }
  }
];
