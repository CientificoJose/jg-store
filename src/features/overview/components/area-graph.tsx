'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
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
import { AreaGraphSkeleton } from './area-graph-skeleton';

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
];

const chartConfig = {
  monto: {
    label: 'Facturación ($ ARS)',
    color: 'var(--chart-1)'
  },
  pedidos: {
    label: 'Pedidos Realizados',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function AreaGraph() {
  const { data: ordersData, isLoading } = useQuery(ordersQueryOptions({ limit: 100 }));
  const orders = ordersData?.orders || [];

  const { chartData, totalOrdersCount, totalRevenue } = useMemo(() => {
    const validOrders = orders.filter((o) => o.order_status !== 'cancelada');
    const now = new Date();
    const currentYear = now.getFullYear();

    const data = MONTH_NAMES.map((month, idx) => {
      const ordersInMonth = validOrders.filter((o) => {
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        return d.getMonth() === idx && d.getFullYear() === currentYear;
      });

      const monto = ordersInMonth.reduce((acc, o) => acc + (o.total_amount || 0), 0);
      const pedidos = ordersInMonth.length;

      return {
        month,
        monto,
        pedidos
      };
    });

    const totalRev = validOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

    return {
      chartData: data,
      totalOrdersCount: validOrders.length,
      totalRevenue: totalRev
    };
  }, [orders]);

  if (isLoading) {
    return <AreaGraphSkeleton />;
  }

  return (
    <Card className='font-gotham border border-border/80 shadow-xs'>
      <CardHeader>
        <CardTitle className='text-base font-bold text-foreground flex items-center justify-between'>
          <span>Evolución de Ventas y Facturación</span>
          {totalOrdersCount > 0 ? (
            <Badge
              variant='outline'
              className='bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-bold'
            >
              <Icons.trendingUp className='w-3 h-3 mr-1' />
              {totalOrdersCount} ventas confirmadas
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground border-border text-[11px] font-medium'
            >
              0 ventas registradas
            </Badge>
          )}
        </CardTitle>
        <CardDescription className='text-xs text-muted-foreground'>
          {totalOrdersCount > 0
            ? `Total facturado acumulado: $${totalRevenue.toLocaleString('es-AR')} ARS en ventas reales.`
            : 'Ventas reales facturadas y pedidos confirmados en base a datos de Supabase.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray='3 3' />
            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    if (name === 'monto') {
                      return [`$${Number(value).toLocaleString('es-AR')}`, 'Facturación'];
                    }
                    return [`${value} pedidos`, 'Pedidos'];
                  }}
                />
              }
            />
            <defs>
              <DottedBackgroundPattern config={chartConfig} />
            </defs>
            <Area
              dataKey='monto'
              type='natural'
              fill='url(#dotted-background-pattern-monto)'
              fillOpacity={0.4}
              stroke='var(--color-monto)'
              stackId='a'
              strokeWidth={1.5}
            />
            <Area
              dataKey='pedidos'
              type='natural'
              fill='url(#dotted-background-pattern-pedidos)'
              fillOpacity={0.4}
              stroke='var(--color-pedidos)'
              stackId='b'
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const DottedBackgroundPattern = ({ config }: { config: ChartConfig }) => {
  const items = Object.fromEntries(
    Object.entries(config).map(([key, value]) => [key, value.color])
  );
  return (
    <>
      {Object.entries(items).map(([key, value]) => (
        <pattern
          key={key}
          id={`dotted-background-pattern-${key}`}
          x='0'
          y='0'
          width='7'
          height='7'
          patternUnits='userSpaceOnUse'
        >
          <circle cx='5' cy='5' r='1.5' fill={value} opacity={0.5}></circle>
        </pattern>
      ))}
    </>
  );
};

export default AreaGraph;
