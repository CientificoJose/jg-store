import PageContainer from '@/components/layout/page-container';
import OrderListingPage from '@/features/orders/components/order-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import { ordersInfoContent } from '@/features/orders/info-content';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Gestión de Pedidos y Cotizaciones | JG Store Admin'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function OrdersPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Gestión de Pedidos y Cotizaciones'
      pageDescription='Control de órdenes B2B y B2C para Argentina: Factura A/B, pagos por Mercado Pago o Transferencia CBU (10% OFF), remitos y logística a todo el país.'
      infoContent={ordersInfoContent}
      pageHeaderAction={
        <div className='flex items-center gap-2'>
          <Link
            href='/'
            target='_blank'
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm font-gotham')}
          >
            <Icons.store className='mr-1.5 h-4 w-4 text-[#E63946]' /> Ver Tienda
          </Link>
          <Link
            href='/dashboard/product'
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm font-gotham')}
          >
            <Icons.product className='mr-1.5 h-4 w-4' /> Ver Catálogo
          </Link>
        </div>
      }
    >
      <OrderListingPage />
    </PageContainer>
  );
}
