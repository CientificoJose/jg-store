import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { ordersQueryOptions } from '../api/queries';
import { OrdersTable } from './orders-table';

export default function OrderListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('order_number') || searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const orderType = searchParamsCache.get('order_type');
  const orderStatus = searchParamsCache.get('order_status');
  const paymentStatus = searchParamsCache.get('payment_status');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(orderType && { type: orderType }),
    ...(orderStatus && { status: orderStatus }),
    ...(paymentStatus && { paymentStatus }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(ordersQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrdersTable />
    </HydrationBoundary>
  );
}
