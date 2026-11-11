'use client';

import { useQuery } from '@tanstack/react-query';
import { productsQueryOptions } from '@/features/products/api/queries';
import { ordersQueryOptions } from '@/features/orders/api/queries';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardFooter
} from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { OverviewStatsSkeleton } from './overview-stats-skeleton';
import React, { useMemo } from 'react';

export function OverviewStatsCards() {
  const { data: productsData, isLoading: loadingProducts } = useQuery(productsQueryOptions({ limit: 100 }));
  const { data: ordersData, isLoading: loadingOrders } = useQuery(ordersQueryOptions({ limit: 100 }));
  const { data: statsData, isLoading: loadingStats } = useQuery<{ success: boolean; total_products: number; total_stock: number }>({
    queryKey: ['products-overview-stats'],
    queryFn: async () => {
      const res = await fetch('/api/products/stats');
      if (!res.ok) throw new Error('Error al consultar estadísticas');
      return res.json();
    },
    staleTime: 1000 * 30
  });

  const isLoading = (loadingProducts && !productsData) || (loadingOrders && !ordersData) || (loadingStats && !statsData);

  const totalProducts = statsData?.total_products ?? productsData?.total_products ?? productsData?.products?.length ?? 0;
  const totalStockUnits = statsData?.total_stock ?? (productsData?.products?.reduce((acc, p) => acc + (p.stock || 0), 0) || 0);

  const orders = ordersData?.orders || [];
  const { totalOrders, totalRevenue, wholesaleCount, retailCount } = useMemo(() => {
    const validOrders = orders.filter((o) => o.order_status !== 'cancelada');
    const rev = validOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const wCount = validOrders.filter((o) => o.order_type === 'wholesale').length;
    const rCount = validOrders.filter((o) => o.order_type === 'retail').length;

    return {
      totalOrders: validOrders.length,
      totalRevenue: rev,
      wholesaleCount: wCount,
      retailCount: rCount
    };
  }, [orders]);

  if (isLoading) {
    return <OverviewStatsSkeleton />;
  }

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 font-gotham'>
      {/* Tarjeta 1: Total Facturado / Ventas */}
      <Card className='@container/card border border-border/80 shadow-xs'>
        <CardHeader>
          <CardDescription>Facturación de Ventas</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground'>
            ${totalRevenue.toLocaleString('es-AR')}
          </CardTitle>
          <CardAction>
            <Badge
              variant='outline'
              className={
                totalOrders > 0
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-muted/60 text-muted-foreground border-border'
              }
            >
              <Icons.check className='w-3 h-3 mr-1' />
              {totalOrders > 0 ? `${totalOrders} órdenes` : '0 ventas'}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-xs text-muted-foreground'>
          <div className='line-clamp-1 flex items-center gap-1.5 font-medium text-foreground'>
            <Icons.billing className='w-3.5 h-3.5 text-emerald-600' />
            <span>Ingresos netos por ventas</span>
          </div>
          <div>Órdenes confirmadas en el sistema</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 2: Pedidos Registrados */}
      <Card className='@container/card border border-border/80 shadow-xs'>
        <CardHeader>
          <CardDescription>Pedidos & Consultas</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground'>
            {totalOrders}
          </CardTitle>
          <CardAction>
            <Badge
              variant='outline'
              className='bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20'
            >
              <Icons.tags className='w-3 h-3 mr-1' />
              {wholesaleCount} mayor / {retailCount} detal
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-xs text-muted-foreground'>
          <div className='line-clamp-1 flex items-center gap-1.5 font-medium text-foreground'>
            <Icons.whatsapp className='w-3.5 h-3.5 text-emerald-600' />
            <span>Vía WhatsApp y Carrito Web</span>
          </div>
          <div>Actualizado en tiempo real</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 3: Productos en Catálogo */}
      <Card className='@container/card border border-border/80 shadow-xs'>
        <CardHeader>
          <CardDescription>Productos en Catálogo</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground'>
            {totalProducts.toLocaleString('es-AR')}
          </CardTitle>
          <CardAction>
            <Badge
              variant='outline'
              className='bg-blue-500/10 text-blue-600 border-blue-500/20'
            >
              <Icons.product className='w-3 h-3 mr-1' />
              Activo
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-xs text-muted-foreground'>
          <div className='line-clamp-1 flex items-center gap-1.5 font-medium text-foreground'>
            <Icons.store className='w-3.5 h-3.5 text-[#E63946]' />
            <span>24 departamentos oficiales</span>
          </div>
          <div>Sincronizados con PostgreSQL Supabase</div>
        </CardFooter>
      </Card>

      {/* Tarjeta 4: Stock Físico en Depósito */}
      <Card className='@container/card border border-border/80 shadow-xs'>
        <CardHeader>
          <CardDescription>Stock Físico en Depósito</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-foreground'>
            {totalStockUnits > 0 ? `${totalStockUnits.toLocaleString('es-AR')} unid.` : '0 unid.'}
          </CardTitle>
          <CardAction>
            <Badge
              variant='outline'
              className='bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/20'
            >
              <Icons.layout className='w-3 h-3 mr-1' />
              Almacén
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-xs text-muted-foreground'>
          <div className='line-clamp-1 flex items-center gap-1.5 font-medium text-foreground'>
            <Icons.shieldCheck className='w-3.5 h-3.5 text-[#D4A017]' />
            <span>Control de inventario físico</span>
          </div>
          <div>Listos para despacho inmediato</div>
        </CardFooter>
      </Card>
    </div>
  );
}

