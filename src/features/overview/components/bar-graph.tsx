'use client';

import { Bar, BarChart, XAxis } from 'recharts';
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
  detal: {
    label: 'Ventas al Detal',
    color: 'var(--chart-1)'
  },
  mayor: {
    label: 'Ventas al Mayor',
    color: 'var(--chart-2)'
  }
} satisfies ChartConfig;

export function BarGraph() {
  const { data: ordersData } = useQuery(ordersQueryOptions({ limit: 100 }));
  const orders = ordersData?.orders || [];

  const { chartData, totalOps, totalWholesale, totalRetail } = useMemo(() => {
    const validOrders = orders.filter((o) => o.order_status !== 'cancelada');
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Generar ventana de los últimos 6 meses cronológicos
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      last6Months.push({
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        name: MONTH_NAMES[d.getMonth()]
      });
    }

    const data = last6Months.map((m) => {
      const monthOrders = validOrders.filter((o) => {
        if (!o.created_at) return false;
        const d = new Date(o.created_at);
        return d.getMonth() === m.monthIndex && d.getFullYear() === m.year;
      });

      const detalCount = monthOrders.filter((o) => o.order_type === 'retail').length;
      const mayorCount = monthOrders.filter((o) => o.order_type === 'wholesale').length;

      return {
        month: m.name,
        detal: detalCount,
        mayor: mayorCount
      };
    });

    const wCount = validOrders.filter((o) => o.order_type === 'wholesale').length;
    const rCount = validOrders.filter((o) => o.order_type === 'retail').length;

    return {
      chartData: data,
      totalOps: validOrders.length,
      totalWholesale: wCount,
      totalRetail: rCount
    };
  }, [orders]);

  return (
    <Card className='font-gotham border border-border/80 shadow-xs'>
      <CardHeader>
        <CardTitle className='text-base font-bold text-foreground flex items-center justify-between'>
          <span>Volumen Comercial por Semestre</span>
          {totalOps > 0 ? (
            <Badge
              variant='outline'
              className='bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px] font-bold'
            >
              <Icons.trendingUp className='w-3 h-3 mr-1' />
              {totalOps} Operaciones B2B / B2C
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='bg-muted/60 text-muted-foreground border-border text-[11px] font-medium'
            >
              0 Operaciones registradas
            </Badge>
          )}
        </CardTitle>
        <CardDescription className='text-xs text-muted-foreground'>
          {totalOps > 0
            ? `${totalWholesale} ventas al mayor y ${totalRetail} ventas al detal registradas en el período.`
            : 'Comparativa de ventas al detal vs pedidos mayoristas basada en órdenes reales.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <rect
              x='0'
              y='0'
              width='100%'
              height='85%'
              fill='url(#default-multiple-pattern-dots)'
            />
            <defs>
              <DottedBackgroundPattern />
            </defs>
            <XAxis
              dataKey='month'
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator='dashed'
                  formatter={(value, name) => {
                    const label = name === 'detal' ? 'Venta Detal' : 'Venta Mayorista';
                    return [`${value} pedidos`, label];
                  }}
                />
              }
            />
            <Bar
              dataKey='detal'
              color='var(--chart-1)'
              fill='var(--color-detal)'
              shape={<CustomHatchedBar isHatched={false} />}
              radius={4}
            />
            <Bar
              dataKey='mayor'
              fill='var(--color-mayor)'
              shape={<CustomHatchedBar />}
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

const CustomHatchedBar = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    isHatched?: boolean;
  }
) => {
  const { fill, x, y, width, height, dataKey } = props;
  const isHatched = props.isHatched ?? true;

  return (
    <>
      <rect
        rx={4}
        x={x}
        y={y}
        width={width}
        height={height}
        stroke='none'
        fill={isHatched ? `url(#hatched-bar-pattern-${dataKey})` : fill}
      />
      <defs>
        <pattern
          key={dataKey}
          id={`hatched-bar-pattern-${dataKey}`}
          x='0'
          y='0'
          width='5'
          height='5'
          patternUnits='userSpaceOnUse'
          patternTransform='rotate(-45)'
        >
          <rect width='10' height='10' opacity={0.5} fill={fill}></rect>
          <rect width='1' height='10' fill={fill}></rect>
        </pattern>
      </defs>
    </>
  );
};

const DottedBackgroundPattern = () => {
  return (
    <pattern
      id='default-multiple-pattern-dots'
      x='0'
      y='0'
      width='10'
      height='10'
      patternUnits='userSpaceOnUse'
    >
      <circle className='dark:text-muted/40 text-muted' cx='2' cy='2' r='1' fill='currentColor' />
    </pattern>
  );
};

export default BarGraph;
