import React from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function RecentSalesSkeleton() {
  return (
    <Card className='h-full font-gotham border border-border/80 shadow-xs relative overflow-hidden'>
      {/* Marca de agua fantasma */}
      <div className='absolute right-4 bottom-4 w-16 h-16 opacity-[0.04] dark:opacity-[0.07] pointer-events-none'>
        <Image
          src='/icon.png'
          alt='JG Store'
          width={64}
          height={64}
          className='w-full h-full object-contain filter grayscale animate-pulse'
        />
      </div>

      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='space-y-1.5'>
            <Skeleton className='h-5 w-[160px]' /> {/* CardTitle */}
            <Skeleton className='h-3.5 w-[200px]' /> {/* CardDescription */}
          </div>
          <Skeleton className='h-4 w-[60px]' />
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4 pt-1'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center justify-between gap-3 text-xs'>
              {/* Icono / avatar fantasma */}
              <div className='w-9 h-9 rounded-xl bg-muted/70 border border-border/60 flex items-center justify-center shrink-0 animate-pulse'>
                <div className='w-4 h-4 rounded-full bg-foreground/10' />
              </div>
              <div className='flex-1 space-y-1.5'>
                <Skeleton className='h-3.5 w-[130px]' /> {/* Cliente */}
                <Skeleton className='h-3 w-[170px]' /> {/* Info / Canal */}
              </div>
              <Skeleton className='h-4 w-[70px] rounded-md' /> {/* Monto */}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
