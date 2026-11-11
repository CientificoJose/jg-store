import PageContainer from '@/components/layout/page-container';
import { OverviewStatsSkeleton } from '@/features/overview/components/overview-stats-skeleton';
import { AreaGraphSkeleton } from '@/features/overview/components/area-graph-skeleton';
import { RecentSalesSkeleton } from '@/features/overview/components/recent-sales-skeleton';
import { BarGraphSkeleton } from '@/features/overview/components/bar-graph-skeleton';
import { PieGraphSkeleton } from '@/features/overview/components/pie-graph-skeleton';
import React from 'react';

export default function OverviewLoading() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4 font-gotham'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            ¡Hola, bienvenido de nuevo! 👋
          </h2>
        </div>

        {/* 4 Tarjetas Fantasma con isotipo y shimmer de carga */}
        <OverviewStatsSkeleton />

        {/* Gráficos y Secciones Fantasma */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>
            <AreaGraphSkeleton />
          </div>
          <div className='col-span-4 md:col-span-3'>
            <RecentSalesSkeleton />
          </div>
          <div className='col-span-4'>
            <BarGraphSkeleton />
          </div>
          <div className='col-span-4 min-h-0 md:col-span-3'>
            <PieGraphSkeleton />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
