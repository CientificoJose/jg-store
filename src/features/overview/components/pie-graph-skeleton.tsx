import React from 'react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function PieGraphSkeleton() {
  return (
    <Card className='flex h-full flex-col font-gotham border border-border/80 shadow-xs relative overflow-hidden'>
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

      <CardHeader className='items-center pb-0'>
        <div className='flex items-center gap-2'>
          <Skeleton className='h-6 w-[160px]' />
          <Skeleton className='h-5 w-[60px] rounded-full' />
        </div>
        <Skeleton className='h-4 w-[180px] mt-1' />
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center p-6'>
        <div className='relative w-[200px] h-[200px] rounded-full border-12 border-muted/70 animate-pulse flex items-center justify-center'>
          <div className='w-10 h-10 opacity-20'>
            <Image
              src='/icon.png'
              alt='JG Store'
              width={40}
              height={40}
              className='w-full h-full object-contain filter grayscale'
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
