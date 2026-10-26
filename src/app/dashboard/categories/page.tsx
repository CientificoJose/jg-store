import PageContainer from '@/components/layout/page-container';
import { CategoriesView } from '@/features/categories/components/categories-view';
import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const metadata = {
  title: 'Departamentos y Categorías | JG Store Admin'
};

export default function CategoriesPage() {
  return (
    <PageContainer
      pageTitle="Departamentos y Categorías"
      pageDescription="Personaliza los 24 rubros comerciales de JG Store, asigna fotos circulares para la vitrina de la tienda y crea nuevos departamentos."
      pageHeaderAction={
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm font-gotham')}
          >
            <Icons.store className="mr-1.5 h-4 w-4 text-[#E63946]" /> Ver Tienda
          </Link>
          <Link
            href="/dashboard/product"
            className={cn(buttonVariants({ variant: 'outline' }), 'text-xs md:text-sm font-gotham')}
          >
            <Icons.product className="mr-1.5 h-4 w-4" /> Catálogo de Productos
          </Link>
        </div>
      }
    >
      <CategoriesView />
    </PageContainer>
  );
}
