import React from 'react';
import Image from 'next/image';
import { Card, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';

const GHOST_CARDS = [
  {
    title: 'Facturación de Ventas',
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    Icon: Icons.billing,
    accentGlow: 'from-emerald-500/10 via-transparent to-transparent'
  },
  {
    title: 'Pedidos & Consultas',
    iconColor: 'text-[#E63946]',
    iconBg: 'bg-[#E63946]/10 border-[#E63946]/20',
    Icon: Icons.whatsapp,
    accentGlow: 'from-[#E63946]/10 via-transparent to-transparent'
  },
  {
    title: 'Productos en Catálogo',
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-500/10 border-blue-500/20',
    Icon: Icons.store,
    accentGlow: 'from-blue-500/10 via-transparent to-transparent'
  },
  {
    title: 'Stock Físico en Depósito',
    iconColor: 'text-[#D4A017]',
    iconBg: 'bg-[#D4A017]/10 border-[#D4A017]/20',
    Icon: Icons.shieldCheck,
    accentGlow: 'from-[#D4A017]/10 via-transparent to-transparent'
  }
];

export function OverviewStatsSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 font-gotham'>
      {GHOST_CARDS.map((card, idx) => {
        const IconComponent = card.Icon;
        return (
          <Card
            key={idx}
            className='relative overflow-hidden border border-border/80 shadow-xs bg-card/80 backdrop-blur-xs'
          >
            {/* Resplandor ambiental de fondo */}
            <div
              className={`absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br ${card.accentGlow} rounded-full blur-2xl pointer-events-none`}
            />

            {/* Isotipo Fantasma JG Store en marca de agua flotante */}
            <div className='absolute right-3 bottom-3 w-12 h-12 opacity-[0.06] dark:opacity-[0.10] pointer-events-none transition-opacity'>
              <Image
                src='/icon.png'
                alt='JG Store'
                width={48}
                height={48}
                className='w-full h-full object-contain filter grayscale'
              />
            </div>

            <CardHeader className='pb-2'>
              <div className='flex items-center justify-between'>
                {/* Título de la tarjeta */}
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-28 rounded-md' />
                </div>

                {/* Badge fantasma con icono oficial pulsante */}
                <div
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold animate-pulse ${card.iconBg} ${card.iconColor}`}
                >
                  <IconComponent className='w-3 h-3' />
                  <Skeleton className='h-3 w-10 bg-current/20' />
                </div>
              </div>

              {/* Valor numérico principal fantasma */}
              <div className='pt-2'>
                <Skeleton className='h-8 w-32 rounded-lg' />
              </div>
            </CardHeader>

            <CardFooter className='flex-col items-start gap-1.5 pt-1 text-xs'>
              {/* Línea descriptiva 1 */}
              <div className='flex items-center gap-2 w-full'>
                <div className={`w-3.5 h-3.5 rounded-full ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${card.iconColor} bg-current animate-ping`} />
                </div>
                <Skeleton className='h-3.5 w-3/4 rounded-md' />
              </div>
              {/* Línea descriptiva 2 */}
              <Skeleton className='h-3 w-1/2 rounded-md ml-5' />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
