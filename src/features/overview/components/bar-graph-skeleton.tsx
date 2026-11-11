import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const BAR_HEIGHTS = [35, 60, 45, 80, 50, 75, 40, 90, 65, 70, 55, 85];

export function BarGraphSkeleton() {
  return (
    <Card className='font-gotham border border-border/80 shadow-xs relative overflow-hidden'>
      {/* Marca de agua fantasma */}
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
            <Skeleton className='h-6 w-[200px]' />
          </div>
          <Skeleton className='h-5 w-[140px] rounded-full' />
        </div>
        <Skeleton className='h-4 w-[240px] mt-1' />
      </CardHeader>
      <CardContent>
        <div className='flex aspect-auto h-[280px] w-full items-end justify-around gap-2 pt-8'>
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className='w-full rounded-t-sm bg-muted/60'
              style={{
                height: `${BAR_HEIGHTS[i % BAR_HEIGHTS.length]}%`
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
