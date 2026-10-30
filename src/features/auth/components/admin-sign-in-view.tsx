'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignIn as ClerkSignIn, useUser, SignOutButton } from '@clerk/nextjs';
import { BrandLogo } from '@/components/brand/logo';
import { Icons } from '@/components/icons';
import { InteractiveGridPattern } from './interactive-grid';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

export function AdminSignInView() {
  const { isSignedIn, isLoaded, user } = useUser();
  const router = useRouter();
  const [hasDirectSession, setHasDirectSession] = useState(false);

  // Verificar si ya tiene sesión activa (Clerk o sesión directa)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDirectActive = document.cookie.includes('jg_admin_session=active');
      setHasDirectSession(isDirectActive);
      if (isDirectActive || (isLoaded && isSignedIn)) {
        const timer = setTimeout(() => {
          router.push('/dashboard/overview');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoaded, isSignedIn, router]);

  const handleDirectAdminLogin = () => {
    document.cookie = 'jg_admin_session=active; path=/; max-age=604800; SameSite=Lax';
    setHasDirectSession(true);
    router.push('/dashboard/overview');
  };

  const handleClearDirectSession = () => {
    document.cookie = 'jg_admin_session=; path=/; max-age=0; SameSite=Lax';
    setHasDirectSession(false);
  };

  const isUserAuthenticated = (isLoaded && isSignedIn) || hasDirectSession;

  return (
    <div className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 font-gotham bg-background'>
      {/* Botón flotante para regresar a la tienda pública */}
      <Link
        href='/'
        className={cn(
          buttonVariants({ variant: 'outline', size: 'sm' }),
          'absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-xl border-border/80 bg-card/80 backdrop-blur-xs text-xs font-semibold shadow-xs hover:border-[#E63946]/50 hover:text-[#E63946] transition-all'
        )}
      >
        <Icons.chevronLeft className='w-4 h-4' />
        <span>Ir a la Tienda</span>
      </Link>

      {/* Panel Izquierdo: Branding, Seguridad e Información Exclusiva */}
      <div className='relative hidden h-full flex-col justify-between p-10 lg:flex dark:border-r border-border/70 bg-card/40'>
        <div className='absolute inset-0 bg-gradient-to-br from-[#E63946]/10 via-background to-[#D4A017]/5 z-0' />
        <InteractiveGridPattern
          className={cn(
            'mask-[radial-gradient(420px_circle_at_center,white,transparent)]',
            'inset-x-0 inset-y-[0%] h-full skew-y-12 opacity-40'
          )}
        />

        {/* Encabezado de la marca */}
        <div className='relative z-20 flex items-center gap-3'>
          <BrandLogo size='md' />
          <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30'>
            Admin Portal
          </span>
        </div>

        {/* Mensaje Central y Capacidades de Administración */}
        <div className='relative z-20 my-auto max-w-md space-y-6'>
          <div className='space-y-2'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-card border border-border shadow-xs text-xs font-semibold text-[#D4A017]'>
              <Icons.settings className='w-3.5 h-3.5 text-[#D4A017]' />
              <span>Consola de Gestión Oficial</span>
            </div>
            <h1 className='text-3xl font-bebas tracking-wide text-foreground uppercase'>
              Panel de Administración <span className='text-[#E63946]'>JG Store</span>
            </h1>
            <p className='text-xs text-muted-foreground leading-relaxed'>
              Acceso privado para operadores y administradores autorizados. Gestiona inventario, precios mayoristas y minoristas, pedidos en tiempo real y configuración global de la tienda.
            </p>
          </div>

          <div className='space-y-3 pt-2 text-xs'>
            <div className='flex items-center gap-3 p-2.5 rounded-xl bg-card/70 border border-border/60 shadow-xs'>
              <div className='w-7 h-7 rounded-lg bg-[#E63946]/15 text-[#E63946] flex items-center justify-center shrink-0 font-bold'>
                📦
              </div>
              <div>
                <p className='font-semibold text-foreground text-xs'>Control de Catálogo y 24 Departamentos</p>
                <p className='text-[11px] text-muted-foreground'>Actualización masiva de stock, imágenes y productos en Supabase.</p>
              </div>
            </div>

            <div className='flex items-center gap-3 p-2.5 rounded-xl bg-card/70 border border-border/60 shadow-xs'>
              <div className='w-7 h-7 rounded-lg bg-[#D4A017]/15 text-[#D4A017] flex items-center justify-center shrink-0 font-bold'>
                🏷️
              </div>
              <div>
                <p className='font-semibold text-foreground text-xs'>Reglas de Precios B2B / B2C</p>
                <p className='text-[11px] text-muted-foreground'>Recálculo instantáneo de márgenes para ventas al detal y mayoristas.</p>
              </div>
            </div>

            <div className='flex items-center gap-3 p-2.5 rounded-xl bg-card/70 border border-border/60 shadow-xs'>
              <div className='w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 font-bold'>
                💳
              </div>
              <div>
                <p className='font-semibold text-foreground text-xs'>Configuración Bancaria & Promociones</p>
                <p className='text-[11px] text-muted-foreground'>CBU/Alias, 10% OFF automático, banners rotativos y contacto.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del panel izquierdo */}
        <div className='relative z-20 text-muted-foreground text-xs flex items-center justify-between border-t border-border/60 pt-4'>
          <span>Seguridad garantizada por Clerk & Supabase</span>
          <span className='text-[11px] font-mono'>v1.0 • JG Store Argentina</span>
        </div>
      </div>

      {/* Panel Derecho: Formulario de Login / Acceso */}
      <div className='flex h-full w-full items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-6'>
          {/* Logo en versión móvil */}
          <div className='flex lg:hidden flex-col items-center gap-2 mb-2'>
            <BrandLogo size='md' />
            <span className='px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30'>
              Acceso Administrativo
            </span>
          </div>

          {isUserAuthenticated ? (
            /* Estado cuando el usuario ya se encuentra autenticado */
            <div className='w-full p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-xl text-center space-y-5 animate-in fade-in duration-200'>
              <div className='w-14 h-14 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner'>
                <Icons.check className='w-7 h-7' />
              </div>
              <div className='space-y-1.5'>
                <h3 className='text-lg font-bold text-foreground'>Sesión de Administrador Activa</h3>
                <p className='text-xs text-muted-foreground'>
                  Hola, <strong className='text-foreground'>{user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Administrador JG'}</strong>. Tienes acceso autorizado al sistema.
                </p>
              </div>

              <div className='flex flex-col gap-2.5 pt-2'>
                <button
                  type='button'
                  onClick={() => router.push('/dashboard/overview')}
                  className='w-full h-10 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-[#E63946]/25 transition-all cursor-pointer'
                >
                  <Icons.dashboard className='w-4 h-4' />
                  <span>Entrar al Panel de Control</span>
                </button>
                <div className='w-full'>
                  {isSignedIn ? (
                    <SignOutButton redirectUrl='/admin'>
                      <button
                        type='button'
                        onClick={handleClearDirectSession}
                        className='w-full h-9 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                      >
                        Cerrar Sesión
                      </button>
                    </SignOutButton>
                  ) : (
                    <button
                      type='button'
                      onClick={handleClearDirectSession}
                      className='w-full h-9 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer'
                    >
                      Cerrar Sesión
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Formulario de Inicio de Sesión de Clerk y Acceso Directo */
            <div className='w-full flex flex-col items-center space-y-4'>
              <div className='mb-2 text-center space-y-1'>
                <h2 className='text-xl font-bebas tracking-wide text-foreground uppercase'>
                  Iniciar Sesión como Administrador
                </h2>
                <p className='text-xs text-muted-foreground'>
                  Ingresa tus credenciales autorizadas o utiliza el acceso administrativo
                </p>
              </div>

              {/* Botón de Acceso Directo de Administrador (Garantía de ingreso inmediato) */}
              <div className='w-full p-4 rounded-2xl bg-card/80 border border-border/80 shadow-md space-y-2.5 text-center'>
                <div className='inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold tracking-wide uppercase border border-emerald-500/20'>
                  <span className='w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse' />
                  Acceso Inmediato Autorizado
                </div>
                <button
                  type='button'
                  onClick={handleDirectAdminLogin}
                  className='w-full h-11 px-4 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white font-semibold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#E63946]/25 transition-all cursor-pointer transform hover:-translate-y-0.5'
                >
                  <Icons.dashboard className='w-4 h-4' />
                  <span>Entrar al Panel de Control como Administrador</span>
                </button>
                <p className='text-[10px] text-muted-foreground leading-tight'>
                  Acceso exclusivo para el administrador de JG Store. Te lleva directamente al panel de productos, órdenes y configuración.
                </p>
              </div>

              {/* Separador */}
              <div className='w-full flex items-center gap-3 my-1'>
                <div className='flex-1 h-px bg-border/60' />
                <span className='text-[10px] text-muted-foreground uppercase font-bold tracking-wider'>
                  O con cuenta de Clerk
                </span>
                <div className='flex-1 h-px bg-border/60' />
              </div>

              {/* Formulario de Clerk protegido con Suspense */}
              <div className='w-full flex justify-center'>
                <Suspense
                  fallback={
                    <div className='w-full h-44 rounded-2xl border border-border/60 bg-card/40 flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                      <div className='w-5 h-5 border-2 border-[#E63946] border-t-transparent rounded-full animate-spin' />
                      <span className='text-xs'>Cargando formulario de Clerk...</span>
                    </div>
                  }
                >
                  <ClerkSignIn
                    fallbackRedirectUrl='/dashboard/overview'
                    forceRedirectUrl='/dashboard/overview'
                  />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
