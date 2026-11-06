'use client';

import PageContainer from '@/components/layout/page-container';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaGraph } from './area-graph';
import { BarGraph } from './bar-graph';
import { PieGraph } from './pie-graph';
import { RecentSales } from './recent-sales';
import { OverviewStatsCards } from './overview-stats-cards';
import { Icons } from '@/components/icons';

export default function OverViewPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-4 font-gotham'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight text-foreground flex items-center gap-2'>
              <span>¡Hola, bienvenido de nuevo! 👋</span>
            </h2>
            <p className='text-xs sm:text-sm text-muted-foreground mt-0.5'>
              Panel de control y resumen operativo de JG Store / Pancho Recargas.
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Link href='/dashboard/product'>
              <Button className='bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-semibold cursor-pointer shadow-xs'>
                <Icons.product className='mr-1.5 h-4 w-4' />
                Administrar Catálogo
              </Button>
            </Link>
          </div>
        </div>

        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='bg-muted/60 p-1 rounded-xl'>
            <TabsTrigger value='overview' className='rounded-lg text-xs font-bold'>
              Resumen Operativo
            </TabsTrigger>
            <TabsTrigger value='analytics' className='rounded-lg text-xs font-bold' disabled>
              Métricas Detalladas
            </TabsTrigger>
          </TabsList>

          <TabsContent value='overview' className='space-y-4'>
            {/* 4 TARJETAS CON MÉTRICAS 100% REALES */}
            <OverviewStatsCards />

            {/* GRÁFICOS Y PEDIDOS RECIENTES EN TIEMPO REAL */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7'>
              <div className='col-span-4'>
                <AreaGraph />
              </div>
              <Card className='col-span-4 md:col-span-3 border border-border/80 shadow-xs'>
                <RecentSales />
              </Card>
              <div className='col-span-4'>
                <BarGraph />
              </div>
              <div className='col-span-4 md:col-span-3'>
                <PieGraph />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}
