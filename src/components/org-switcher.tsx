'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useClerk, useOrganizationList } from '@clerk/nextjs';
import { Icons } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

export function OrgSwitcher() {
  const { isMobile, state } = useSidebar();
  const router = useRouter();
  const { signOut } = useClerk();
  const { orgId } = useAuth();
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
      keepPreviousData: true
    }
  });

  const handleOrganizationSwitch = async (organizationId: string) => {
    if (orgId === organizationId || !setActive) return;
    try {
      await setActive({ organization: organizationId });
    } catch (error) {
      console.error('Failed to switch organization:', error);
    }
  };

  const handleSignOut = async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'jg_admin_session=; path=/; max-age=0; SameSite=Lax';
    }
    try {
      await signOut();
    } catch {
      // Ignorar si Clerk no está activo
    }
    router.push('/admin');
  };

  const hasOrgs = isLoaded && userMemberships?.data && userMemberships.data.length > 0;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size='lg'
                tooltip='JG Store • Consola de Administración'
                className='data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors'
              />
            }
          >
            {/* Contenedor del Logo Oficial JG Store */}
            <div className='relative flex aspect-square size-8.5 shrink-0 items-center justify-center rounded-xl bg-[#E63946] text-white shadow-md shadow-[#E63946]/20 overflow-hidden p-1 border border-[#E63946]/40 transition-transform group-hover/menu-button:scale-105'>
              <Image
                src='/brand/logo-icon.png'
                alt='JG Store Logo'
                width={32}
                height={32}
                className='size-full object-contain filter drop-shadow-xs'
                priority
              />
            </div>

            {/* Texto de la Marca (Oculto cuando la barra está colapsada) */}
            <div
              className={`grid flex-1 text-left text-sm leading-tight transition-all duration-200 ease-in-out ${
                state === 'collapsed'
                  ? 'invisible max-w-0 overflow-hidden opacity-0'
                  : 'visible max-w-full opacity-100'
              }`}
            >
              <div className='flex items-center gap-1.5'>
                <span className='truncate font-bebas text-base tracking-wide uppercase text-foreground leading-none'>
                  JG STORE
                </span>
                <span className='px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/30'>
                  Admin
                </span>
              </div>
              <span className='text-muted-foreground truncate text-[11px] font-medium'>
                Consola de Gestión
              </span>
            </div>

            <Icons.chevronsUpDown
              className={`ml-auto size-4 text-muted-foreground transition-all duration-200 ease-in-out ${
                state === 'collapsed'
                  ? 'invisible max-w-0 opacity-0'
                  : 'visible max-w-full opacity-100'
              }`}
            />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className='w-(--anchor-width) min-w-64 rounded-xl p-1.5 shadow-xl border-border/80'
            align='start'
            side={isMobile ? 'bottom' : 'right'}
            sideOffset={6}
          >
            {/* Cabecera del Menú con Branding */}
            <div className='flex items-center gap-2.5 p-2 bg-muted/40 rounded-lg mb-1'>
              <div className='relative flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-[#E63946] text-white shadow-xs p-1'>
                <Image
                  src='/brand/logo-icon.png'
                  alt='JG Store'
                  width={28}
                  height={28}
                  className='size-full object-contain'
                />
              </div>
              <div className='flex flex-col text-left'>
                <span className='text-xs font-bold text-foreground leading-tight'>
                  JG Store Polirrubro
                </span>
                <span className='text-[10px] text-muted-foreground'>
                  v1.0 • Portal de Control
                </span>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Accesos Rápidos Principales */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1'>
                Navegación Rápida
              </DropdownMenuLabel>
              <DropdownMenuItem
                className='gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted'
                onClick={() => router.push('/')}
              >
                <div className='w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0'>
                  <Icons.store className='w-3.5 h-3.5' />
                </div>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-medium'>Ir a la Tienda Pública</span>
                  <span className='text-[10px] text-muted-foreground'>Ver catálogo de cara al cliente</span>
                </div>
                <Icons.externalLink className='ml-auto w-3.5 h-3.5 text-muted-foreground' />
              </DropdownMenuItem>

              <DropdownMenuItem
                className='gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted'
                onClick={() => router.push('/dashboard/overview')}
              >
                <div className='w-6 h-6 rounded-md bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0'>
                  <Icons.dashboard className='w-3.5 h-3.5' />
                </div>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-medium'>Panel General</span>
                  <span className='text-[10px] text-muted-foreground'>Métricas y resumen de ventas</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className='gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted'
                onClick={() => router.push('/dashboard/product')}
              >
                <div className='w-6 h-6 rounded-md bg-[#E63946]/15 text-[#E63946] flex items-center justify-center shrink-0'>
                  <Icons.product className='w-3.5 h-3.5' />
                </div>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-medium'>Productos y Stock</span>
                  <span className='text-[10px] text-muted-foreground'>Administrar catálogo y precios</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className='gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg hover:bg-muted'
                onClick={() => router.push('/dashboard/config/general')}
              >
                <div className='w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0'>
                  <Icons.settings className='w-3.5 h-3.5' />
                </div>
                <div className='flex flex-col text-left'>
                  <span className='text-xs font-medium'>Configuración Tienda</span>
                  <span className='text-[10px] text-muted-foreground'>Datos bancarios, WhatsApp, CBU</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            {/* Organizaciones de Clerk (si existen) */}
            {hasOrgs && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='text-[10px] uppercase font-bold tracking-wider text-muted-foreground px-2 py-1'>
                    Organizaciones de Clerk
                  </DropdownMenuLabel>
                  {userMemberships.data.map((membership, index) => {
                    const isActive = membership.organization.id === orgId;
                    return (
                      <DropdownMenuItem
                        key={membership.id}
                        onClick={() => handleOrganizationSwitch(membership.organization.id)}
                        className='gap-2 p-2 rounded-lg cursor-pointer'
                      >
                        <div className='flex size-6 items-center justify-center overflow-hidden rounded-md border'>
                          {membership.organization.hasImage && membership.organization.imageUrl ? (
                            <Image
                              src={membership.organization.imageUrl}
                              alt={membership.organization.name}
                              width={24}
                              height={24}
                              className='size-full object-cover'
                            />
                          ) : (
                            <Icons.galleryVerticalEnd className='size-3.5 shrink-0' />
                          )}
                        </div>
                        <span className='text-xs'>{membership.organization.name}</span>
                        {isActive && <Icons.check className='ml-auto size-4 text-emerald-500' />}
                        {!isActive && <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </>
            )}

            <DropdownMenuSeparator />

            {/* Cerrar Sesión */}
            <DropdownMenuItem
              className='gap-2.5 px-2.5 py-2 cursor-pointer rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors'
              onClick={handleSignOut}
            >
              <Icons.logout className='w-4 h-4' />
              <span className='text-xs font-semibold'>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
