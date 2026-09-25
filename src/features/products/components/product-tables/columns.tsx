'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { Product } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import Image from 'next/image';
import { CellAction } from './cell-action';
import { CATEGORY_OPTIONS } from './options';
import { formatPrice } from '@/lib/whatsapp';

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'photo_url',
    header: 'FOTO',
    cell: ({ row }) => {
      const src = row.getValue<string>('photo_url') || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
      return (
        <div className='relative w-12 h-12 rounded-lg overflow-hidden border border-border/80 bg-muted/40 shrink-0'>
          <Image
            src={src}
            alt={row.getValue('name')}
            fill
            sizes='48px'
            className='object-cover'
          />
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
      <span className='font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/60'>
        {row.original.sku}
      </span>
    ),
    meta: {
      label: 'SKU',
      placeholder: 'Filtrar por SKU...',
      variant: 'text'
    },
    enableColumnFilter: true
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Producto' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col max-w-xs'>
        <span className='font-semibold text-foreground text-sm line-clamp-1'>
          {row.original.name}
        </span>
        <span className='text-xs text-[#6C757D] line-clamp-1'>
          {row.original.description}
        </span>
      </div>
    ),
    meta: {
      label: 'Producto',
      placeholder: 'Buscar por nombre...',
      variant: 'text',
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'category',
    accessorKey: 'category',
    enableSorting: false,
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Rubro / Departamento' />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant='outline' className='text-xs font-semibold border-[#E63946]/30 text-[#E63946] bg-[#E63946]/5'>
          {row.original.category_name}
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Rubros',
      variant: 'multiSelect',
      options: CATEGORY_OPTIONS
    }
  },
  {
    id: 'stock',
    accessorKey: 'stock',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Stock' />
    ),
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <div className='flex items-center gap-1.5'>
          <span
            className={`w-2 h-2 rounded-full ${
              stock <= 0
                ? 'bg-[#6C757D]'
                : stock <= 10
                ? 'bg-[#E63946]'
                : 'bg-emerald-500'
            }`}
          />
          <span
            className={`text-xs font-semibold ${
              stock <= 0
                ? 'text-[#6C757D]'
                : stock <= 10
                ? 'text-[#E63946]'
                : 'text-foreground'
            }`}
          >
            {stock <= 0 ? 'Agotado' : `${stock} ${row.original.unit || 'u.'}`}
          </span>
        </div>
      );
    }
  },
  {
    id: 'retail_price',
    accessorKey: 'retail_price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='PVP Detal' />
    ),
    cell: ({ row }) => (
      <span className='font-bold text-sm text-foreground font-gotham'>
        {formatPrice(row.original.retail_price)}
      </span>
    )
  },
  {
    id: 'wholesale_price',
    accessorKey: 'wholesale_price',
    header: ({ column }: { column: Column<Product, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tarifa Mayorista' />
    ),
    cell: ({ row }) => {
      const discount = Math.round(
        ((row.original.retail_price - row.original.wholesale_price) /
          row.original.retail_price) *
          100
      );
      return (
        <div className='flex flex-col'>
          <div className='flex items-center gap-1.5'>
            <span className='font-bold text-sm text-[#D4A017] font-bebas tracking-wide text-base'>
              {formatPrice(row.original.wholesale_price)}
            </span>
            {discount > 0 && (
              <span className='px-1.5 py-0.5 rounded text-[10px] font-black bg-[#D4A017] text-white'>
                -{discount}%
              </span>
            )}
          </div>
          <span className='text-[10px] text-[#6C757D]'>
            Mínimo {row.original.min_wholesale_qty} {row.original.unit || 'u.'}
          </span>
        </div>
      );
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
