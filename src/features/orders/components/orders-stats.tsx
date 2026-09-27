'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { formatPrice } from '@/lib/whatsapp';

interface OrdersStatsProps {
  totalAmount: number;
  wholesaleCount: number;
  retailCount: number;
  pendingDispatchCount: number;
  totalOrders: number;
}

export function OrdersStats({
  totalAmount,
  wholesaleCount,
  retailCount,
  pendingDispatchCount,
  totalOrders
}: OrdersStatsProps) {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {/* 1. Facturación Global */}
      <Card className='border-border/60 bg-card shadow-xs transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground font-gotham'>
            Total Facturado (ARS)
          </CardTitle>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'>
            <Icons.billing className='h-4 w-4' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold font-bebas tracking-wide text-foreground'>
            {formatPrice(totalAmount)}
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Acumulado en {totalOrders} pedidos gestionados
          </p>
        </CardContent>
      </Card>

      {/* 2. Pedidos Mayoristas B2B */}
      <Card className='border-border/60 bg-card shadow-xs transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground font-gotham'>
            Mayoristas B2B
          </CardTitle>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A017]/15 text-[#D4A017]'>
            <Icons.pro className='h-4 w-4' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold font-bebas tracking-wide text-[#D4A017]'>
            {wholesaleCount} <span className='text-sm font-normal font-gotham text-muted-foreground'>órdenes</span>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Distribuidoras & comercios con Factura A
          </p>
        </CardContent>
      </Card>

      {/* 3. Pedidos Minoristas B2C */}
      <Card className='border-border/60 bg-card shadow-xs transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground font-gotham'>
            Minoristas B2C
          </CardTitle>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400'>
            <Icons.user className='h-4 w-4' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold font-bebas tracking-wide text-blue-600 dark:text-blue-400'>
            {retailCount} <span className='text-sm font-normal font-gotham text-muted-foreground'>órdenes</span>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Consumidores finales con Factura B
          </p>
        </CardContent>
      </Card>

      {/* 4. Por Despachar / Armar */}
      <Card className='border-border/60 bg-card shadow-xs transition-shadow hover:shadow-md'>
        <CardHeader className='flex flex-row items-center justify-between pb-2'>
          <CardTitle className='text-xs font-medium uppercase tracking-wider text-muted-foreground font-gotham'>
            Pendientes Depósito
          </CardTitle>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-[#E63946]/10 text-[#E63946]'>
            <Icons.truck className='h-4 w-4' />
          </div>
        </CardHeader>
        <CardContent>
          <div className='text-2xl font-bold font-bebas tracking-wide text-[#E63946]'>
            {pendingDispatchCount} <span className='text-sm font-normal font-gotham text-muted-foreground'>por armar</span>
          </div>
          <p className='mt-1 text-xs text-muted-foreground'>
            Revisión de stock y guías de transporte
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
