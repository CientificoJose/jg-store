import KBar from '@/components/kbar';
import AppSidebar from '@/components/layout/app-sidebar';
import Header from '@/components/layout/header';
import { InfoSidebar } from '@/components/layout/info-sidebar';
import { InfobarProvider } from '@/components/ui/infobar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Next Shadcn Dashboard Starter',
  description: 'Basic dashboard with Next.js and Shadcn',
  robots: {
    index: false,
    follow: false
  }
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Verificación estricta: usuario autenticado y aprobado como administrador
  const cookieStore = await cookies();
  const isVerifiedCookie = cookieStore.get('jg_admin_verified')?.value === 'true';

  let isApprovedAdmin = isVerifiedCookie;

  try {
    const user = await currentUser();
    if (user) {
      const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase() || '';
      isApprovedAdmin = Boolean(
        user.publicMetadata?.role === 'admin' ||
        user.publicMetadata?.approved === true ||
        userEmail === 'davidalejandrogoncaxd@gmail.com' ||
        userEmail === 'davidalejandrogoncaxd1@gmail.com' ||
        userEmail === 'qijoos3niievsik@gmail.com' ||
        userEmail === 'admin@jgstore.com.ar'
      );
    }
  } catch (err) {
    // Si Clerk server SDK no tiene conectividad en el contenedor, respetamos la cookie de sesión verificada
    console.warn('Verificación fallback por cookie de sesión verificada:', err);
  }

  if (!isApprovedAdmin) {
    redirect('/admin');
  }

  // Persisting the sidebar state in the cookie.
  const defaultOpen = cookieStore.get('sidebar_state')?.value === 'true';
  return (
    <KBar>
      <SidebarProvider defaultOpen={defaultOpen}>
        <a
          href='#main-content'
          className='bg-background ring-ring sr-only rounded-md px-3 py-2 text-sm font-medium shadow focus:not-sr-only focus:absolute focus:top-2 focus:start-2 focus:z-50 focus:ring-2'
        >
          Skip to content
        </a>
        <AppSidebar />
        <SidebarInset id='main-content' tabIndex={-1} className='scroll-mt-16'>
          <Header />
          <InfobarProvider defaultOpen={false}>
            {children}
            <InfoSidebar side='right' />
          </InfobarProvider>
        </SidebarInset>
      </SidebarProvider>
    </KBar>
  );
}
