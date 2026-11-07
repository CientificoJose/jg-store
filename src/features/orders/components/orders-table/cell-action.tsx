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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { Order, OrderStatus } from '../../api/types';
import { OrderDetailSheet } from '../order-detail-sheet';
import { updateOrderStatus, deleteOrder } from '../../api/service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../../api/queries';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/whatsapp';

interface CellActionProps {
  data: Order;
}

export function CellAction({ data }: CellActionProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(`Pedido #${data.order_number} eliminado permanentemente.`);
      setDeleteDialogOpen(false);
      setDeleteStep(1);
    },
    onError: () => toast.error('No se pudo eliminar el pedido')
  });

  const cleanPhone = data.customer_phone.replace(/\D/g, '');
  const whatsappUrl = `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(
    `Hola ${data.customer_name}! Te contactamos de JG Store por tu pedido *#${data.order_number}* ($ ${formatPrice(data.total_amount)}).`
  )}`;

  return (
    <>
      <OrderDetailSheet order={data} open={detailOpen} onOpenChange={setDetailOpen} />

      {/* Diálogo de Doble Confirmación para Eliminar Pedido */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending) {
            setDeleteDialogOpen(open);
            if (!open) setDeleteStep(1);
          }
        }}
      >
        <DialogContent className='font-gotham max-w-md border border-border/80 shadow-2xl'>
          {deleteStep === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-amber-500 font-bold'>
                  <Icons.warning className='h-5 w-5 text-amber-500 shrink-0' />
                  <span>Paso 1 de 2: ¿Deseas eliminar este pedido?</span>
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground pt-1'>
                  Revisa los detalles del pedido antes de proceder con la confirmación definitiva.
                </DialogDescription>
              </DialogHeader>

              <div className='my-2 space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs'>
                <div className='flex justify-between items-center py-1 border-b border-border/40'>
                  <span className='text-muted-foreground font-medium'>N° Pedido:</span>
                  <span className='font-bold text-foreground'>#{data.order_number}</span>
                </div>
                <div className='flex justify-between items-center py-1 border-b border-border/40'>
                  <span className='text-muted-foreground font-medium'>Cliente:</span>
                  <span className='font-bold text-foreground'>{data.customer_name}</span>
                </div>
                <div className='flex justify-between items-center py-1 border-b border-border/40'>
                  <span className='text-muted-foreground font-medium'>Monto Total:</span>
                  <span className='font-bold text-[#E63946] text-sm'>
                    $ {formatPrice(data.total_amount)}
                  </span>
                </div>
                <div className='flex justify-between items-center py-1'>
                  <span className='text-muted-foreground font-medium'>Tipo / Estado:</span>
                  <span className='capitalize font-medium text-foreground'>
                    {data.order_type === 'wholesale' ? 'Mayorista B2B' : 'Minorista B2C'} • {data.order_status}
                  </span>
                </div>
              </div>

              <div className='rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-600 dark:text-amber-400'>
                <p className='font-semibold mb-1'>📊 Impacto en el sistema:</p>
                <p>
                  Al eliminar este pedido, se restará automáticamente <strong>$ {formatPrice(data.total_amount)}</strong> de las ganancias totales, se descontará de la cantidad de pedidos y se recalcularán todas las estadísticas del panel.
                </p>
              </div>

              <DialogFooter className='gap-2 sm:gap-0 mt-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setDeleteDialogOpen(false)}
                  className='cursor-pointer text-xs'
                >
                  Cancelar
                </Button>
                <Button
                  variant='default'
                  size='sm'
                  onClick={() => setDeleteStep(2)}
                  className='bg-amber-600 hover:bg-amber-700 text-white cursor-pointer text-xs flex items-center gap-1.5'
                >
                  Continuar a Confirmación (1/2)
                  <Icons.arrowRight className='h-3.5 w-3.5' />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className='flex items-center gap-2 text-red-600 font-bold'>
                  <Icons.trash className='h-5 w-5 text-red-600 shrink-0' />
                  <span>Paso 2 de 2: Confirmación Permanente</span>
                </DialogTitle>
                <DialogDescription className='text-xs text-muted-foreground pt-1'>
                  Esta es la última confirmación antes de la eliminación definitiva en la base de datos.
                </DialogDescription>
              </DialogHeader>

              <div className='my-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-400 space-y-2'>
                <p className='font-bold text-sm flex items-center gap-1.5'>
                  <Icons.warning className='h-4 w-4 shrink-0' />
                  ¡ADVERTENCIA: ACCIÓN IRREVERSIBLE!
                </p>
                <p>
                  ¿Confirmas al 100% que deseas eliminar permanentemente el pedido <strong>#{data.order_number}</strong>?
                </p>
                <p className='text-[11px] opacity-90'>
                  La orden y todos sus artículos asociados se borrarán de forma definitiva de la base de datos de Supabase.
                </p>
              </div>

              <DialogFooter className='gap-2 sm:gap-0 mt-4'>
                <Button
                  variant='outline'
                  size='sm'
                  disabled={deleteMutation.isPending}
                  onClick={() => setDeleteStep(1)}
                  className='cursor-pointer text-xs'
                >
                  Atrás
                </Button>
                <Button
                  variant='destructive'
                  size='sm'
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(data.id)}
                  className='bg-red-600 hover:bg-red-700 text-white cursor-pointer text-xs flex items-center gap-1.5 font-bold'
                >
                  {deleteMutation.isPending ? (
                    <>
                      <Icons.spinner className='h-3.5 w-3.5 animate-spin' />
                      Eliminando de Supabase...
                    </>
                  ) : (
                    <>
                      <Icons.trash className='h-3.5 w-3.5' />
                      Sí, Eliminar Definitivamente
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DropdownMenu modal={false}>
        <DropdownMenuTrigger render={<Button variant='ghost' className='h-8 w-8 p-0 cursor-pointer' />}>
          <span className='sr-only'>Abrir menú</span>
          <Icons.ellipsis className='h-4 w-4' />
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='font-gotham w-52'>
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
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem
              className='cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-500/10'
              onClick={() => {
                setDeleteStep(1);
                setDeleteDialogOpen(true);
              }}
            >
              <Icons.trash className='mr-2 h-4 w-4 text-red-600' /> Eliminar Pedido
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
