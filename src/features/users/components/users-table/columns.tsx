'use client';

import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import type { User } from '../../api/types';
import { Column, ColumnDef } from '@tanstack/react-table';
import { Icons } from '@/components/icons';
import { CellAction } from './cell-action';
import { ROLE_OPTIONS, STATUS_OPTIONS } from './options';

export const columns: ColumnDef<User>[] = [
  {
    id: 'name',
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Cliente / Contacto' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col'>
        <span className='font-semibold text-foreground text-sm'>
          {row.original.first_name} {row.original.last_name}
        </span>
        <span className='text-muted-foreground text-xs'>{row.original.email}</span>
      </div>
    ),
    meta: {
      label: 'Cliente',
      placeholder: 'Buscar por nombre o correo...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'empresa',
    header: 'Empresa / RIF',
    cell: ({ row }) => {
      const empresa = row.original.empresa || 'Particular / Detal';
      const rif = row.original.rif_cuit;
      return (
        <div className='flex flex-col'>
          <span className='font-medium text-xs text-foreground'>{empresa}</span>
          {rif && (
            <span className='font-mono text-[10px] text-[#6C757D]'>{rif}</span>
          )}
        </div>
      );
    }
  },
  {
    id: 'phone',
    accessorKey: 'phone',
    header: 'WhatsApp / Teléfono',
    cell: ({ row }) => {
      const clean = row.original.phone?.replace(/[^0-9]/g, '');
      return (
        <a
          href={`https://wa.me/${clean}`}
          target='_blank'
          rel='noreferrer'
          className='inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline'
        >
          <Icons.whatsapp className='w-3.5 h-3.5 text-emerald-600 shrink-0' />
          <span>{row.original.phone}</span>
        </a>
      );
    }
  },
  {
    id: 'role',
    accessorKey: 'role',
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tipo de Cuenta' />
    ),
    cell: ({ cell }) => {
      const role = cell.getValue<User['role']>();

      if (role === 'Mayorista B2B') {
        return (
          <Badge className='bg-[#D4A017]/15 text-[#D4A017] border border-[#D4A017]/30 font-bold text-xs gap-1'>
            <Icons.star className='w-3 h-3 fill-current' />
            <span>Mayorista B2B</span>
          </Badge>
        );
      }

      if (role === 'Administrador') {
        return (
          <Badge className='bg-[#E63946] text-white border-transparent font-semibold text-xs'>
            Administrador
          </Badge>
        );
      }

      if (role === 'Asesor Comercial') {
        return (
          <Badge className='bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium text-xs'>
            Asesor Comercial
          </Badge>
        );
      }

      return (
        <Badge variant='outline' className='text-xs font-medium text-[#6C757D]'>
          Cliente al Detal
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Tipo de Cuenta',
      variant: 'multiSelect' as const,
      options: ROLE_OPTIONS
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ cell }) => {
      const status = cell.getValue<User['status']>();

      if (status === 'Activo') {
        return (
          <Badge variant='outline' className='text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5'>
            <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
            <span>Activo</span>
          </Badge>
        );
      }

      if (status === 'Pendiente') {
        return (
          <Badge variant='outline' className='text-xs text-[#D4A017] border-[#D4A017]/40 bg-[#D4A017]/10'>
            Pendiente Aprobación
          </Badge>
        );
      }

      return (
        <Badge variant='outline' className='text-xs text-[#6C757D] border-border'>
          Inactivo
        </Badge>
      );
    },
    enableColumnFilter: true,
    meta: {
      label: 'Estado',
      variant: 'multiSelect' as const,
      options: STATUS_OPTIONS
    }
  },
  {
    id: 'pedidos_count',
    accessorKey: 'pedidos_count',
    header: ({ column }: { column: Column<User, unknown> }) => (
      <DataTableColumnHeader column={column} title='Pedidos' />
    ),
    cell: ({ row }) => (
      <span className='font-bold text-xs text-foreground px-2 py-1 rounded bg-muted/40'>
        {row.original.pedidos_count ?? 0}
      </span>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
