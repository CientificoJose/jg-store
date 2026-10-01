'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Order, OrderStatus, PaymentStatus } from '../api/types';
import { formatPrice } from '@/lib/whatsapp';
import { updateOrderStatus, updatePaymentStatus, updateTrackingNumber } from '../api/service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '../api/queries';
import { toast } from 'sonner';
import Image from 'next/image';

interface OrderDetailSheetProps {
  order?: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailSheet({ order, open, onOpenChange }: OrderDetailSheetProps) {
  const queryClient = useQueryClient();
  const [trackingInput, setTrackingInput] = useState(order?.tracking_number || '');
  const [isEditingTracking, setIsEditingTracking] = useState(false);

  // Mutación para actualizar estado del pedido
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(`Estado actualizado a: ${getStatusLabel(updated.order_status)}`);
    },
    onError: () => toast.error('Error al actualizar el estado del pedido')
  });

  // Mutación para actualizar pago
  const paymentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PaymentStatus }) =>
      updatePaymentStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Estado de pago actualizado');
    },
    onError: () => toast.error('Error al actualizar el pago')
  });

  // Mutación para tracking
  const trackingMutation = useMutation({
    mutationFn: ({ id, tracking }: { id: string; tracking: string }) =>
      updateTrackingNumber(id, tracking),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Número de remito/guía registrado');
      setIsEditingTracking(false);
    },
    onError: () => toast.error('Error al guardar el número de guía')
  });

  if (!order) return null;

  const handlePrintRemito = () => {
    window.print();
  };

  const cleanPhone = order.customer_phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${order.customer_name}! Te escribimos del equipo de JG Store respecto a tu pedido *#${order.order_number}* por un total de *${formatPrice(order.total_amount)}*.`
  )}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col'>
        {/* Cabecera del Cajón */}
        <SheetHeader className='p-6 border-b border-border/60 bg-muted/20 sticky top-0 z-10 backdrop-blur-sm'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div>
              <div className='flex items-center gap-2'>
                <span className='font-mono font-bold text-lg text-foreground'>
                  {order.order_number}
                </span>
                {order.order_type === 'wholesale' ? (
                  <Badge className='bg-[#D4A017] text-black font-gotham text-xs font-semibold hover:bg-[#c29214]'>
                    <Icons.pro className='mr-1 h-3 w-3' /> Mayorista B2B
                  </Badge>
                ) : (
                  <Badge variant='outline' className='text-blue-600 border-blue-500/30 bg-blue-500/10 font-gotham text-xs'>
                    <Icons.user className='mr-1 h-3 w-3' /> Minorista B2C
                  </Badge>
                )}
                <Badge
                  variant={order.invoice_type === 'A' ? 'default' : 'secondary'}
                  className={order.invoice_type === 'A' ? 'bg-[#E63946] text-white' : ''}
                >
                  Factura {order.invoice_type}
                </Badge>
              </div>
              <SheetDescription className='text-xs text-muted-foreground mt-1'>
                Registrado el {new Date(order.created_at).toLocaleString('es-AR')}
              </SheetDescription>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={handlePrintRemito}
                className='text-xs'
              >
                <Icons.post className='mr-1.5 h-3.5 w-3.5' /> Imprimir Remito
              </Button>
              <a
                href={whatsappUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center justify-center rounded-md bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#20ba59] transition-colors'
              >
                <Icons.whatsapp className='mr-1.5 h-3.5 w-3.5 fill-current' /> Contactar WhatsApp
              </a>
            </div>
          </div>
        </SheetHeader>

        {/* Contenido scrolleable */}
        <div className='p-6 space-y-6 flex-1'>
          {/* Bloque de Estado Operativo */}
          <div className='rounded-xl border border-border/60 bg-card p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground font-gotham'>
                Estado del Pedido
              </h4>
              <Badge className={getStatusBadgeClass(order.order_status)}>
                {getStatusLabel(order.order_status)}
              </Badge>
            </div>

            <div className='flex flex-wrap gap-2 pt-1'>
              <Button
                size='xs'
                variant={order.order_status === 'nueva' ? 'default' : 'outline'}
                onClick={() => statusMutation.mutate({ id: order.id, status: 'nueva' })}
                disabled={statusMutation.isPending}
                className='text-xs'
              >
                Nueva
              </Button>
              <Button
                size='xs'
                variant={order.order_status === 'en_proceso' ? 'default' : 'outline'}
                onClick={() => statusMutation.mutate({ id: order.id, status: 'en_proceso' })}
                disabled={statusMutation.isPending}
                className='text-xs'
              >
                En Preparación
              </Button>
              <Button
                size='xs'
                variant={order.order_status === 'lista_despacho' ? 'default' : 'outline'}
                onClick={() => statusMutation.mutate({ id: order.id, status: 'lista_despacho' })}
                disabled={statusMutation.isPending}
                className='text-xs'
              >
                Lista p/ Despacho
              </Button>
              <Button
                size='xs'
                variant={order.order_status === 'completada' ? 'default' : 'outline'}
                onClick={() => statusMutation.mutate({ id: order.id, status: 'completada' })}
                disabled={statusMutation.isPending}
                className='text-xs text-emerald-600 dark:text-emerald-400'
              >
                Completada
              </Button>
              <Button
                size='xs'
                variant={order.order_status === 'cancelada' ? 'destructive' : 'outline'}
                onClick={() => statusMutation.mutate({ id: order.id, status: 'cancelada' })}
                disabled={statusMutation.isPending}
                className='text-xs'
              >
                Cancelar
              </Button>
            </div>
          </div>

          {/* Información del Cliente & Fiscal */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='rounded-xl border border-border/60 bg-card p-4 space-y-2'>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground font-gotham flex items-center gap-1.5'>
                <Icons.user className='h-3.5 w-3.5 text-[#E63946]' /> Datos del Comprador
              </h4>
              <p className='font-semibold text-foreground text-sm'>{order.customer_name}</p>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium text-foreground'>{order.document_type}:</span>{' '}
                {order.document_number} (Factura {order.invoice_type})
              </p>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium text-foreground'>Teléfono:</span> {order.customer_phone}
              </p>
              {order.customer_email && (
                <p className='text-xs text-muted-foreground'>
                  <span className='font-medium text-foreground'>Email:</span> {order.customer_email}
                </p>
              )}
            </div>

            <div className='rounded-xl border border-border/60 bg-card p-4 space-y-2'>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground font-gotham flex items-center gap-1.5'>
                <Icons.truck className='h-3.5 w-3.5 text-[#D4A017]' /> Destino y Logística
              </h4>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium text-foreground'>Método:</span>{' '}
                {getShippingMethodLabel(order.shipping_method)}
              </p>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium text-foreground'>Dirección:</span> {order.address}
              </p>
              <p className='text-xs text-muted-foreground'>
                <span className='font-medium text-foreground'>Ubicación:</span> {order.city}, {order.province} (CP {order.postal_code})
              </p>
              <div className='pt-1'>
                {isEditingTracking ? (
                  <div className='flex items-center gap-2 mt-1'>
                    <input
                      type='text'
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder='Ej. AND-8921498 o Guía Expreso'
                      className='text-xs rounded-md border border-input bg-background px-2.5 py-1 w-full'
                    />
                    <Button
                      size='xs'
                      onClick={() =>
                        trackingMutation.mutate({ id: order.id, tracking: trackingInput })
                      }
                      disabled={trackingMutation.isPending}
                    >
                      Guardar
                    </Button>
                    <Button
                      size='xs'
                      variant='ghost'
                      onClick={() => setIsEditingTracking(false)}
                    >
                      X
                    </Button>
                  </div>
                ) : (
                  <div className='flex items-center justify-between text-xs bg-muted/40 p-2 rounded-md'>
                    <span>
                      <span className='font-medium'>Guía / Remito:</span>{' '}
                      {order.tracking_number || <span className='italic text-muted-foreground'>Sin asignar</span>}
                    </span>
                    <Button
                      variant='link'
                      size='xs'
                      className='p-0 h-auto text-xs text-primary'
                      onClick={() => {
                        setTrackingInput(order.tracking_number || '');
                        setIsEditingTracking(true);
                      }}
                    >
                      {order.tracking_number ? 'Modificar' : 'Asignar Guía'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información de Pago */}
          <div className='rounded-xl border border-border/60 bg-card p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground font-gotham flex items-center gap-1.5'>
                <Icons.billing className='h-3.5 w-3.5 text-emerald-500' /> Medio de Pago y Cobranza
              </h4>
              <Badge
                className={
                  order.payment_status === 'paid'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                }
                variant='outline'
              >
                {order.payment_status === 'paid' ? 'Pagado / Acreditado' : 'Pendiente de Pago'}
              </Badge>
            </div>

            <div className='flex items-center justify-between text-xs'>
              <span>
                <span className='font-medium'>Medio:</span> {getPaymentMethodLabel(order.payment_method)}
              </span>
              {order.payment_status !== 'paid' ? (
                <Button
                  size='xs'
                  variant='outline'
                  className='text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-50'
                  onClick={() => paymentMutation.mutate({ id: order.id, status: 'paid' })}
                  disabled={paymentMutation.isPending}
                >
                  <Icons.check className='mr-1 h-3 w-3' /> Marcar como Pagado
                </Button>
              ) : (
                <Button
                  size='xs'
                  variant='ghost'
                  className='text-xs text-muted-foreground hover:text-amber-600'
                  onClick={() => paymentMutation.mutate({ id: order.id, status: 'pending' })}
                  disabled={paymentMutation.isPending}
                >
                  Volver a Pendiente
                </Button>
              )}
            </div>
          </div>

          {/* Listado de Productos / Bultos */}
          <div className='space-y-3'>
            <h4 className='text-xs font-semibold uppercase tracking-wider text-muted-foreground font-gotham'>
              Productos Incluidos ({order.items.length} {order.items.length === 1 ? 'ítem' : 'ítems'})
            </h4>
            <div className='rounded-xl border border-border/60 divide-y divide-border/60 bg-card overflow-hidden'>
              {order.items.map((item) => (
                <div key={item.id} className='p-3 flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='h-12 w-12 rounded-lg overflow-hidden bg-muted relative shrink-0 border border-border/40'>
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-foreground line-clamp-1'>{item.name}</p>
                      <div className='flex items-center gap-2 mt-0.5 text-xs text-muted-foreground'>
                        <span className='font-mono text-[11px] bg-muted px-1.5 py-0.5 rounded'>
                          {item.sku}
                        </span>
                        <span>
                          {item.quantity} {item.unit}
                          {item.quantity > 1 ? 's' : ''} x {formatPrice(item.unit_price)}
                        </span>
                        {item.is_wholesale && (
                          <span className='text-[10px] font-semibold text-[#D4A017] bg-[#D4A017]/10 px-1.5 py-0.5 rounded'>
                            Mayor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className='text-right shrink-0'>
                    <span className='font-semibold text-sm text-foreground'>
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen Financiero en ARS ($) */}
          <div className='rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2'>
            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Subtotal Bruto:</span>
              <span className='font-mono'>{formatPrice(order.subtotal)}</span>
            </div>

            {order.total_savings > 0 && (
              <div className='flex justify-between text-xs text-[#D4A017] font-medium'>
                <span>Ahorro Escala Mayorista:</span>
                <span className='font-mono'>- {formatPrice(order.total_savings)}</span>
              </div>
            )}

            {order.discount > 0 && (
              <div className='flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium'>
                <span>Descuento Transferencia CBU (10% OFF):</span>
                <span className='font-mono'>- {formatPrice(order.discount)}</span>
              </div>
            )}

            <div className='flex justify-between text-xs text-muted-foreground'>
              <span>Costo de Envío:</span>
              <span className='font-mono'>
                {order.shipping_cost > 0 ? formatPrice(order.shipping_cost) : 'Sin cargo / En destino'}
              </span>
            </div>

            <div className='border-t border-border/60 pt-2 flex justify-between items-baseline'>
              <span className='font-bold text-sm text-foreground font-gotham'>Total Pedido (ARS):</span>
              <span className='font-bebas text-2xl font-bold tracking-wide text-[#E63946]'>
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Notas Internas */}
          {order.notes && (
            <div className='rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-800 dark:text-amber-300'>
              <span className='font-semibold'>Nota del Comprador / Logística:</span> {order.notes}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case 'nueva':
      return 'Nueva Orden';
    case 'en_proceso':
      return 'En Preparación';
    case 'lista_despacho':
      return 'Lista p/ Despacho';
    case 'completada':
      return 'Completada';
    case 'cancelada':
      return 'Cancelada';
  }
}

function getStatusBadgeClass(status: OrderStatus) {
  switch (status) {
    case 'nueva':
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
    case 'en_proceso':
      return 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30';
    case 'lista_despacho':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'completada':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'cancelada':
      return 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30';
  }
}

function getPaymentMethodLabel(method: string) {
  switch (method) {
    case 'bank_transfer':
      return 'Transferencia CBU / Alias (10% OFF)';
    case 'mercado_pago':
      return 'Mercado Pago (QR / Tarjetas)';
    case 'cash_pickup':
      return 'Efectivo contra entrega en depósito';
    default:
      return method;
  }
}

function getShippingMethodLabel(method: string) {
  switch (method) {
    case 'andreani':
      return 'Andreani (Domicilio / Sucursal)';
    case 'correo_argentino':
      return 'Correo Argentino';
    case 'expreso_interior':
      return 'Expreso de Carga al Interior';
    case 'pickup':
      return 'Retiro en Persona';
    default:
      return method;
  }
}
