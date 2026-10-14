import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { productsQueryOptions } from '../api/queries';
import { ProductTable } from './product-tables';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';

export default function ProductListingPage() {
  const page = searchParamsCache.get('page');
  const search = searchParamsCache.get('name');
  const pageLimit = searchParamsCache.get('perPage');
  const categories = searchParamsCache.get('category');
  const subcategory = searchParamsCache.get('subcategory');
  const sub_subcategory = searchParamsCache.get('sub_subcategory');
  const stock_status = searchParamsCache.get('stock_status');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: pageLimit,
    ...(search && { search }),
    ...(categories && { categories }),
    ...(subcategory && { subcategory }),
    ...(sub_subcategory && { sub_subcategory }),
    ...(stock_status && { stock_status }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();

  void queryClient.prefetchQuery(productsQueryOptions(filters));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DataTableSkeleton columnCount={7} rowCount={10} filterCount={2} />}>
        <ProductTable />
      </Suspense>
    </HydrationBoundary>
  );
}
