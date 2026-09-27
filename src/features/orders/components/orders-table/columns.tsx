'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { Order, OrderStatus } from '../../api/types';
import { CellAction } from './cell-action';
import { formatPrice } from '@/lib/whatsapp';
import { ORDER_STATUS_OPTIONS, ORDER_TYPE_OPTIONS, PAYMENT_STATUS_OPTIONS } from './options';

export const columns: ColumnDef<Order>[] = [
  {
    id: 'order_number',
    accessorKey: 'order_number',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Nº Pedido' />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.created_at);
      const formattedDate = date.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const formattedTime = date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      });

      return (
        <div className='flex flex-col'>
          <span className='font-mono font-bold text-xs text-foreground'>
            {row.original.order_number}
          </span>
          <span className='text-[11px] text-muted-foreground'>
            {formattedDate} {formattedTime}
          </span>
        </div>
      );
    },
    meta: {
      label: 'Nº Pedido / Cliente',
      placeholder: 'Buscar por orden, cliente, CUIT...',
      variant: 'text' as const,
      icon: Icons.text
    },
    enableColumnFilter: true
  },
  {
    id: 'customer',
    accessorKey: 'customer_name',
    header: 'Cliente / Razón Social',
    cell: ({ row }) => {
      const order = row.original;
      const cleanPhone = order.customer_phone.replace(/\D/g, '');

      return (
        <div className='flex flex-col gap-0.5 max-w-[200px]'>
          <div className='flex items-center gap-1.5'>
            <span className='font-medium text-xs text-foreground truncate'>
              {order.customer_name}
            </span>
            <Badge
              variant={order.invoice_type === 'A' ? 'default' : 'secondary'}
              className={`text-[9px] px-1 py-0 h-4 ${
                order.invoice_type === 'A' ? 'bg-[#E63946] text-white' : ''
              }`}
            >
              Fact. {order.invoice_type}
            </Badge>
          </div>
          <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
            <span className='font-mono text-[10px]'>
              {order.document_type}: {order.document_number}
            </span>
            <a
              href={`https://wa.me/${cleanPhone}`}
              target='_blank'
              rel='noreferrer'
              className='text-emerald-600 hover:text-emerald-700'
              title='Enviar WhatsApp'
            >
              <Icons.whatsapp className='h-3 w-3 fill-current' />
            </a>
          </div>
        </div>
      );
    }
  },
  {
    id: 'order_type',
    accessorKey: 'order_type',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Tipo Venta' />
    ),
    cell: ({ row }) => {
      const isWholesale = row.original.order_type === 'wholesale';
      return isWholesale ? (
        <Badge className='bg-[#D4A017] text-black font-gotham text-[10px] font-semibold hover:bg-[#c29214]'>
          <Icons.pro className='mr-1 h-3 w-3' /> Mayorista B2B
        </Badge>
      ) : (
        <Badge
          variant='outline'
          className='text-blue-600 border-blue-500/30 bg-blue-500/10 font-gotham text-[10px]'
        >
          <Icons.user className='mr-1 h-3 w-3' /> Minorista B2C
        </Badge>
      );
    },
    meta: {
      label: 'Tipo Venta',
      variant: 'select' as const,
      options: ORDER_TYPE_OPTIONS,
      icon: Icons.filter
    },
    enableColumnFilter: true
  },
  {
    id: 'items',
    header: 'Bultos / Ítems',
    cell: ({ row }) => {
      const items = row.original.items;
      const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
      const firstItem = items[0];

      return (
        <div className='flex flex-col text-xs'>
          <span className='font-medium text-foreground'>
            {totalUnits} {totalUnits === 1 ? 'unidad' : 'unidades'}
          </span>
          <span className='text-[10px] text-muted-foreground truncate max-w-[150px]' title={firstItem?.name}>
            {firstItem?.name} {items.length > 1 ? `(+${items.length - 1} más)` : ''}
          </span>
        </div>
      );
    }
  },
  {
    id: 'shipping',
    header: 'Logística / Destino',
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className='flex flex-col text-xs'>
          <span className='font-medium text-foreground flex items-center gap-1'>
            <Icons.truck className='h-3 w-3 text-muted-foreground' />
            {getShippingShortName(order.shipping_method)}
          </span>
          <span className='text-[10px] text-muted-foreground'>
            {order.city}, {order.province}
          </span>
        </div>
      );
    }
  },
  {
    id: 'payment',
    accessorKey: 'payment_status',
    header: 'Pago',
    cell: ({ row }) => {
      const order = row.original;
      const isPaid = order.payment_status === 'paid';

      return (
        <div className='flex flex-col gap-1'>
          <Badge
            variant='outline'
            className={`text-[10px] w-fit ${
              isPaid
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30'
            }`}
          >
            {isPaid ? 'Pagado' : 'Pendiente'}
          </Badge>
          <span className='text-[10px] text-muted-foreground'>
            {order.payment_method === 'bank_transfer'
              ? 'Transf. CBU (10% OFF)'
              : order.payment_method === 'mercado_pago'
              ? 'Mercado Pago'
              : 'Efectivo'}
          </span>
        </div>
      );
    },
    meta: {
      label: 'Estado Pago',
      variant: 'select' as const,
      options: PAYMENT_STATUS_OPTIONS,
      icon: Icons.billing
    },
    enableColumnFilter: true
  },
  {
    id: 'total_amount',
    accessorKey: 'total_amount',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Total (ARS)' />
    ),
    cell: ({ row }) => {
      const order = row.original;
      return (
        <div className='flex flex-col items-end'>
          <span className='font-mono font-bold text-xs text-foreground'>
            {formatPrice(order.total_amount)}
          </span>
          {order.total_savings > 0 && (
            <span className='text-[10px] text-[#D4A017] font-medium'>
              Ahorro {formatPrice(order.total_savings)}
            </span>
          )}
        </div>
      );
    }
  },
  {
    id: 'order_status',
    accessorKey: 'order_status',
    header: ({ column }: { column: Column<Order, unknown> }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const status = row.original.order_status;
      return (
        <Badge className={`text-[10px] font-gotham ${getStatusBadgeClass(status)}`}>
          {getStatusLabel(status)}
        </Badge>
      );
    },
    meta: {
      label: 'Estado Pedido',
      variant: 'select' as const,
      options: ORDER_STATUS_OPTIONS,
      icon: Icons.filter
    },
    enableColumnFilter: true
  },
  {
    id: 'actions',
    cell: ({ row }) => <CellAction data={row.original} />
  }
];

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case 'nueva':
      return 'Nueva Orden';
    case 'en_proceso':
      return 'En Preparación';
    case 'lista_despacho':
      return 'Lista p/ Despacho';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
  }
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'nueva':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    case 'en_proceso':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'lista_despacho':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'completada':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'cancelada':
      return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
  }
}

function getShippingShortName(method: string) {
  switch (method) {
    case 'andreani':
      return 'Andreani';
    case 'correo_argentino':
      return 'Correo Arg.';
    case 'expreso_interior':
      return 'Expreso';
    case 'pickup':
      return 'Retiro Depósito';
    default:
      return method;
  }
}
