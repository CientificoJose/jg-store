'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { useDataTable } from '@/hooks/use-data-table';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { getSortingStateParser } from '@/lib/parsers';
import { ordersQueryOptions } from '../../api/queries';
import { columns } from './columns';
import { OrdersStats } from '../orders-stats';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function OrdersTable() {
  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    order_number: parseAsString,
    order_type: parseAsString,
    order_status: parseAsString,
    payment_status: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.order_number && { search: params.order_number }),
    ...(params.order_type && { type: params.order_type }),
    ...(params.order_status && { status: params.order_status }),
    ...(params.payment_status && { paymentStatus: params.payment_status }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(ordersQueryOptions(filters));

  const pageCount = Math.ceil(data.total_orders / params.perPage);

  const { table } = useDataTable({
    data: data.orders,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <div className='space-y-6'>
      {/* Tarjetas de Métricas de Órdenes */}
      <OrdersStats
        totalAmount={data.total_amount_sum}
        wholesaleCount={data.wholesale_count}
        retailCount={data.retail_count}
        pendingDispatchCount={data.pending_dispatch_count}
        totalOrders={data.total_orders}
      />

      {/* Tabla con Toolbar de Búsqueda y Filtros */}
      <DataTable table={table}>
        <DataTableToolbar table={table} />
      </DataTable>
    </div>
  );
}

export function OrdersTableSkeleton() {
  return (
    <div className='flex flex-1 animate-pulse flex-col gap-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='bg-muted h-24 w-full rounded-xl' />
        ))}
      </div>
      <div className='bg-muted h-10 w-full rounded' />
      <div className='bg-muted h-96 w-full rounded-lg' />
      <div className='bg-muted h-10 w-full rounded' />
    </div>
  );
}
