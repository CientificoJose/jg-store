import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import ProductListingPage from '@/features/products/components/product-listing';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import Link from 'next/link';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Catálogo de Productos | JG Store Admin'
};

type pageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function Page(props: pageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Catálogo Oficial JG Store'
      pageDescription='Administración de inventario, stock físico en depósito, PVP al detal y escala de tarifas al mayor para los 24 departamentos.'
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
            href='/dashboard/product/new'
            className={cn(
              buttonVariants(),
              'text-xs md:text-sm bg-[#E63946] hover:bg-[#d62839] text-white font-gotham'
            )}
          >
            <Icons.add className='mr-1.5 h-4 w-4' /> Registrar Producto
          </Link>
        </div>
      }
    >
      <ProductListingPage />
    </PageContainer>
  );
}
