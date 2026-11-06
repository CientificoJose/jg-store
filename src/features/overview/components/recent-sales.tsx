'use client';

import { CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { ordersQueryOptions } from '@/features/orders/api/queries';
import { formatPrice } from '@/lib/whatsapp';
import { Icons } from '@/components/icons';
import Link from 'next/link';

export function RecentSales() {
  const { data: ordersData, isLoading } = useQuery(ordersQueryOptions({ limit: 5 }));
  const orders = ordersData?.orders || [];

  return (
    <div className='h-full flex flex-col justify-between font-gotham'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-base font-bold text-foreground'>
              Últimos Pedidos & Consultas
            </CardTitle>
            <CardDescription className='text-xs text-muted-foreground mt-0.5'>
              {orders.length > 0
                ? `${orders.length} pedidos registrados recientemente.`
                : 'Registro de órdenes y pedidos de clientes.'}
            </CardDescription>
          </div>
          <Link
            href='/dashboard/orders'
            className='text-xs font-semibold text-[#E63946] hover:underline'
          >
            Ver todos
          </Link>
        </div>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col justify-center'>
        {isLoading ? (
          <div className='py-8 text-center text-xs text-muted-foreground'>
            Cargando pedidos recientes...
          </div>
        ) : orders.length === 0 ? (
          <div className='py-8 text-center space-y-2'>
            <div className='w-10 h-10 rounded-xl bg-muted/60 text-muted-foreground flex items-center justify-center mx-auto'>
              <Icons.billing className='w-5 h-5 text-muted-foreground' />
            </div>
            <p className='text-xs font-semibold text-foreground'>No hay pedidos recientes</p>
            <p className='text-[11px] text-muted-foreground max-w-xs mx-auto'>
              Los nuevos pedidos generados por clientes vía WhatsApp o la tienda se reflejarán aquí.
            </p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.slice(0, 5).map((order) => {
              const isWholesale = order.order_type === 'wholesale';
              return (
                <div key={order.id} className='flex items-center justify-between gap-3 text-xs'>
                  <div className='w-9 h-9 rounded-xl bg-muted/60 border border-border flex items-center justify-center font-bold text-[#E63946] shrink-0'>
                    {isWholesale ? <Icons.tags className='w-4 h-4' /> : <Icons.cart className='w-4 h-4' />}
                  </div>
                  <div className='flex-1 min-w-0 space-y-0.5'>
                    <p className='font-semibold text-foreground truncate'>
                      {order.customer_name}
                    </p>
                    <p className='text-[11px] text-muted-foreground truncate'>
                      {order.order_number} • {isWholesale ? 'Mayorista' : 'Detal'}
                    </p>
                  </div>
                  <div className='text-right shrink-0'>
                    <span className='font-bold text-foreground block font-mono text-xs'>
                      {formatPrice(order.total_amount)}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                        order.order_status === 'completada'
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-amber-500/10 text-amber-600'
                      }`}
                    >
                      {order.order_status === 'completada' ? 'Completada' : 'En proceso'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </div>
  );
}
