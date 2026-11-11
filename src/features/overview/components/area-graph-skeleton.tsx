import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AreaGraphSkeleton() {
  return (
    <Card className='font-gotham border border-border/80 shadow-xs relative overflow-hidden'>
      {/* Resplandor y marca de agua fantasma */}
      <div className='absolute right-4 bottom-4 w-20 h-20 opacity-[0.04] dark:opacity-[0.07] pointer-events-none'>
        <Image
          src='/icon.png'
          alt='JG Store'
          width={80}
          height={80}
          className='w-full h-full object-contain filter grayscale animate-pulse'
        />
      </div>

      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-6 w-[180px]' />
          </div>
          <Skeleton className='h-5 w-[110px] rounded-full' />
        </div>
        <Skeleton className='h-4 w-[280px] mt-1' />
      </CardHeader>
      <CardContent>
        <div className='relative aspect-auto h-[280px] w-full rounded-xl overflow-hidden border border-border/40 bg-muted/20 flex flex-col justify-end p-4'>
          {/* Malla de líneas fantasma */}
          <div className='space-y-6 w-full mb-6'>
            <div className='w-full h-px bg-border/40' />
            <div className='w-full h-px bg-border/40' />
            <div className='w-full h-px bg-border/40' />
          </div>
          <div className='flex items-end justify-between gap-3 w-full'>
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map(
              (m, i) => (
                <div key={i} className='flex-1 flex flex-col items-center gap-2'>
                  <Skeleton className='w-full h-16 rounded-t-sm bg-muted/60' />
                  <span className='text-[10px] text-muted-foreground/40 font-mono'>{m}</span>
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
