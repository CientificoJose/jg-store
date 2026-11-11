'use client';

import { LabelList, Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ordersQueryOptions } from '@/features/orders/api/queries';
import { PieGraphSkeleton } from './pie-graph-skeleton';

export function PieGraph() {
  const { data: ordersData, isLoading } = useQuery(ordersQueryOptions({ limit: 100 }));
  const orders = ordersData?.orders || [];

  const { chartData, chartConfig, hasData, totalOrdersCount } = useMemo(() => {
    const validOrders = orders.filter((o) => o.order_status !== 'cancelada');
    if (validOrders.length === 0) {
      return {
        chartData: [],
        chartConfig: {
          pedidos: { label: 'Participación (%)' }
        } as ChartConfig,
        hasData: false,
        totalOrdersCount: 0
      };
    }

    const total = validOrders.length;

    // Calcular distribución real según logística y vía de pedido
    let whatsappCount = 0;
    let pickupCount = 0;
    let shippingCount = 0;
    let webCount = 0;

    for (const o of validOrders) {
      if (
        o.notes?.toLowerCase().includes('whatsapp') ||
        o.address?.toLowerCase().includes('whatsapp') ||
        o.payment_method === 'bank_transfer'
      ) {
        whatsappCount++;
      } else if (o.shipping_method === 'pickup') {
        pickupCount++;
      } else if (
        o.shipping_method === 'andreani' ||
        o.shipping_method === 'expreso_interior' ||
        o.shipping_method === 'correo_argentino'
      ) {
        shippingCount++;
      } else {
        webCount++;
      }
    }

    const items = [
      {
        canal: 'whatsapp',
        label: 'WhatsApp Directo',
        count: whatsappCount,
        fill: 'var(--chart-1)'
      },
      {
        canal: 'deposito',
        label: 'Retiro en Depósito',
        count: pickupCount,
        fill: 'var(--chart-2)'
      },
      {
        canal: 'envios',
        label: 'Envíos a Domicilio',
        count: shippingCount,
        fill: 'var(--chart-3)'
      },
      {
        canal: 'web',
        label: 'Tienda Online Web',
        count: webCount,
        fill: 'var(--chart-4)'
      }
    ].filter((it) => it.count > 0);

    const data = items.map((it) => ({
      canal: it.canal,
      pedidos: Math.round((it.count / total) * 100),
      count: it.count,
      fill: it.fill
    }));

    const config: ChartConfig = {
      pedidos: { label: 'Participación (%)' }
    };

    items.forEach((it) => {
      const pct = Math.round((it.count / total) * 100);
      config[it.canal] = {
        label: `${it.label} (${pct}%)`,
        color: it.fill
      };
    });

    return {
      chartData: data,
      chartConfig: config,
      hasData: data.length > 0,
      totalOrdersCount: total
    };
  }, [orders]);

  if (isLoading) {
    return <PieGraphSkeleton />;
  }

  return (
    <Card className='flex h-full flex-col font-gotham border border-border/80 shadow-xs'>
      <CardHeader className='items-center pb-0'>
        <CardTitle className='text-base font-bold text-foreground flex items-center gap-2'>
          <span>Canales de Compra y Atención</span>
          {hasData ? (
            <Badge
              variant='outline'
              className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold'
            >
              {totalOrdersCount} pedidos
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground border-border text-[10px] font-medium'
            >
              0 pedidos
            </Badge>
          )}
        </CardTitle>
        <CardDescription className='text-xs text-muted-foreground'>
          {hasData
            ? 'Distribución real de compras por vía de contacto y entrega.'
            : 'Distribución de pedidos según vía y método de compra.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-2 min-h-[240px]'>
        {!hasData ? (
          <div className='flex flex-col items-center justify-center py-8 text-center space-y-2'>
            <div className='w-12 h-12 rounded-2xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto'>
              <Icons.pieChart className='w-6 h-6 text-muted-foreground' />
            </div>
            <p className='text-xs font-semibold text-foreground'>Sin pedidos registrados aún</p>
            <p className='text-[11px] text-muted-foreground max-w-[220px] mx-auto'>
              A medida que los clientes compren por WhatsApp o la tienda web, aquí se generará el
              gráfico de porcentajes reales.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className='[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[300px] min-h-[240px]'
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey='canal' hideLabel />} />
              <Pie
                data={chartData}
                innerRadius={30}
                dataKey='pedidos'
                radius={10}
                cornerRadius={8}
                paddingAngle={4}
              >
                <LabelList
                  dataKey='pedidos'
                  stroke='none'
                  fontSize={12}
                  fontWeight={600}
                  fill='currentColor'
                  formatter={(value) => `${value}%`}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default PieGraph;
