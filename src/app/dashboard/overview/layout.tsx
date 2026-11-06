import PageContainer from '@/components/layout/page-container';
import { OverviewStatsCards } from '@/features/overview/components/overview-stats-cards';
import React from 'react';

export default function OverViewLayout({
  sales,
  pie_stats,
  bar_stats,
  area_stats
}: {
  sales: React.ReactNode;
  pie_stats: React.ReactNode;
  bar_stats: React.ReactNode;
  area_stats: React.ReactNode;
}) {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col gap-4 font-gotham'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold tracking-tight text-foreground'>
            ¡Hola, bienvenido de nuevo! 👋
          </h2>
        </div>

        {/* 4 Tarjetas con métricas 100% reales vinculadas a Supabase */}
        <OverviewStatsCards />

        {/* Fila 2 y 3: Gráficos y Ventas Recientes con datos reales */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
          <div className='col-span-4'>{area_stats}</div>
          <div className='col-span-4 md:col-span-3'>{sales}</div>
          <div className='col-span-4'>{bar_stats}</div>
          <div className='col-span-4 min-h-0 md:col-span-3'>{pie_stats}</div>
        </div>
      </div>
    </PageContainer>
  );
}
