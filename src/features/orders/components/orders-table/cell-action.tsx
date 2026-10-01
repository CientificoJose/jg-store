'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { Order, OrderStatus } from '../../api/types';
import { OrderDetailSheet } from '../order-detail-sheet';
import { updateOrderStatus } from '../../api/service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../../api/queries';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/whatsapp';

interface CellActionProps {
  data: Order;
}

export function CellAction({ data }: CellActionProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Estado del pedido actualizado');
    },
    onError: () => toast.error('No se pudo actualizar el estado')
  });

  const cleanPhone = data.customer_phone.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(
    `Hola ${data.customer_name}! Te contactamos de JG Store por tu pedido *#${data.order_number}* ($ ${formatPrice(data.total_amount)}).`
  )}`;

  return (
    <>
      <OrderDetailSheet order={data} open={detailOpen} onOpenChange={setDetailOpen} />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0 cursor-pointer' />}>
          <span className='sr-only'>Abrir menú</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='font-gotham w-48'>
          <DropdownMenuGroup>
            <DropdownMenuLabel className='text-xs font-semibold'>Acciones de Pedido</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='cursor-pointer font-medium'
              onClick={() => setDetailOpen(true)}
            >
              <Icons.page className='mr-2 h-4 w-4 text-[#E63946]' /> Ver Detalle / Remito
            </DropdownMenuItem>
            <DropdownMenuItem
              className='cursor-pointer text-[#25D366]'
              onClick={() => window.open(whatsappUrl, '_blank')}
            >
              <Icons.whatsapp className='mr-2 h-4 w-4 fill-current' /> Contactar WhatsApp
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {data.order_status !== 'en_proceso' && (
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => statusMutation.mutate({ id: data.id, status: 'en_proceso' })}
              >
                <Icons.package className='mr-2 h-4 w-4 text-blue-500' /> A Preparación
              </DropdownMenuItem>
            )}
            {data.order_status !== 'lista_despacho' && (
              <DropdownMenuItem
                className='cursor-pointer'
                onClick={() => statusMutation.mutate({ id: data.id, status: 'lista_despacho' })}
              >
                <Icons.truck className='mr-2 h-4 w-4 text-purple-500' /> Listo p/ Despacho
              </DropdownMenuItem>
            )}
            {data.order_status !== 'completada' && (
              <DropdownMenuItem
                className='cursor-pointer text-emerald-600'
                onClick={() => statusMutation.mutate({ id: data.id, status: 'completada' })}
              >
                <Icons.check className='mr-2 h-4 w-4' /> Marcar Completado
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
