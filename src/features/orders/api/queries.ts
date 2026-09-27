import { queryOptions } from '@tanstack/react-query';
import { getOrders, getOrderById } from './service';
import { OrderFilters } from './types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const
};

export function ordersQueryOptions(filters: OrderFilters = {}) {
  return queryOptions({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
    staleTime: 1000 * 60 * 2 // 2 minutos
  });
}

export function orderDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: orderDetailQueryOptionsKey(id),
    queryFn: () => getOrderById(id),
    enabled: Boolean(id)
  });
}

export function orderDetailQueryOptionsKey(id: string) {
  return orderKeys.detail(id);
}
