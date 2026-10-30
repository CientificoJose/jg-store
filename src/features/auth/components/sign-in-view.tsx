import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SignIn as ClerkSignInForm } from '@clerk/nextjs';
import { Metadata } from 'next';
import Link from 'next/link';
import { InteractiveGridPattern } from './interactive-grid';
import { BrandLogo } from '@/components/brand/logo';


export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignInViewPage() {
  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'>
      <Link
        href='/'
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'absolute top-4 right-4 z-20 flex items-center gap-1.5 rounded-xl border border-border/80 bg-card/80 text-xs font-semibold'
        )}
      >
        <span>Volver a la Tienda</span>
      </Link>
      <div className='relative hidden h-full flex-col p-10 lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-sidebar' />
        <div className='relative z-20 flex items-center'>
          <BrandLogo size='md' />
        </div>
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(400px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12'
          )}
        />
        <div className='text-sidebar-foreground relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg font-medium'>
              &ldquo;Tu polirubro mayorista y minorista de confianza en Argentina. Compras al detal y al por mayor con los mejores precios.&rdquo;
            </p>
            <footer className='text-sidebar-foreground/70 text-sm'>JG-STORE Polirubro</footer>
          </blockquote>
        </div>
      </div>
      <div className='flex h-full items-center justify-center p-4 lg:p-8'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          <ClerkSignInForm fallbackRedirectUrl='/dashboard/overview' forceRedirectUrl='/dashboard/overview' />
        </div>
      </div>
    </div>
  );
}
