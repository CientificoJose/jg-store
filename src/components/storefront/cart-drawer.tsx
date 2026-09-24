'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/hooks/use-cart-store';
import { formatPrice, buildWhatsAppUrl } from '@/lib/whatsapp';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    updateQuantity,
    removeItem,
    clearCart,
    customer,
    setCustomerInfo,
    getSummary
  } = useCartStore();

  const [showCustomerForm, setShowCustomerForm] = useState(false);

  if (!isOpen) return null;

  const summary = getSummary();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío.');
      return;
    }

    if (!customer.name.trim()) {
      setShowCustomerForm(true);
      toast.warning('Por favor ingresa tu nombre para personalizar el pedido.');
      return;
    }

    const whatsappUrl = buildWhatsAppUrl(items, customer);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('Abriendo WhatsApp con el detalle de tu pedido...');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border shadow-2xl flex flex-col justify-between">
          
          {/* Header del Carrito */}
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                <Icons.cart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground">Tu Pedido</h2>
                <p className="text-xs text-muted-foreground">
                  {summary.total_items} artículo{summary.total_items === 1 ? '' : 's'} en el carrito
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Vaciar carrito"
                  className="text-xs text-muted-foreground hover:text-rose-600 p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Icons.trash className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icons.close className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Productos o Estado Vacío */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-muted-foreground/60">
                  <Icons.cart className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-foreground text-base">Tu carrito está vacío</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-xs">
                  Explora nuestros 24 rubros comerciales y agrega productos al detal o al mayor.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Banner de Ahorro Mayorista si aplica */}
                {summary.total_savings > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 flex items-center gap-2.5 text-xs font-semibold">
                    <Icons.sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      ¡Excelente! Estás ahorrando {formatPrice(summary.total_savings)} en este pedido gracias a compras al mayor.
                    </span>
                  </div>
                )}

                {/* Items del Carrito */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const isWholesale = item.quantity >= item.product.min_wholesale_qty;
                    const diffToWholesale = item.product.min_wholesale_qty - item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="p-3 rounded-xl bg-card border border-border/70 hover:border-border transition-all flex gap-3"
                      >
                        {/* Miniatura */}
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0">
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Datos del Item */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs font-bold text-foreground truncate">
                                {item.product.name}
                              </h4>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-muted-foreground hover:text-rose-600 transition-colors shrink-0"
                              >
                                <Icons.close className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isWholesale ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-cyan-400 text-[10px] font-bold">
                                  <Icons.tags className="w-2.5 h-2.5" />
                                  Precio Mayorista
                                </span>
                              ) : (
                                <span className="text-[10px] text-muted-foreground">
                                  Precio Detal
                                </span>
                              )}
                              <span className="text-xs font-semibold text-foreground">
                                {formatPrice(item.unit_price)} c/u
                              </span>
                            </div>

                            {!isWholesale && diffToWholesale > 0 && (
                              <p className="text-[10px] text-amber-500 mt-1">
                                +{diffToWholesale} más para pagar {formatPrice(item.product.wholesale_price)} c/u
                              </p>
                            )}
                          </div>

                          {/* Selector de cantidad y subtotal */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/40">
                            <div className="flex items-center border border-border rounded-lg bg-background overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center hover:bg-muted text-muted-foreground"
                              >
                                <Icons.minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-6 h-6 flex items-center justify-center hover:bg-muted text-muted-foreground disabled:opacity-30"
                              >
                                <Icons.add className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-foreground">
                                {formatPrice(item.subtotal)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario Desplegable de Datos del Cliente */}
                <div className="mt-4 rounded-xl border border-border bg-muted/20 p-3">
                  <button
                    onClick={() => setShowCustomerForm((prev) => !prev)}
                    className="w-full flex items-center justify-between text-xs font-bold text-foreground cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icons.user className="w-3.5 h-3.5 text-blue-500" />
                      Datos para el Pedido {customer.name ? `(${customer.name})` : ''}
                    </span>
                    <Icons.chevronDown
                      className={`w-3.5 h-3.5 transition-transform ${
                        showCustomerForm ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {showCustomerForm && (
                    <div className="mt-3 space-y-2.5 pt-2 border-t border-border/50 text-xs">
                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Nombre o Razón Social *
                        </label>
                        <input
                          type="text"
                          value={customer.name}
                          onChange={(e) => setCustomerInfo({ name: e.target.value })}
                          placeholder="Ej. María Pérez / Distribuidora Express"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Teléfono de Contacto
                        </label>
                        <input
                          type="text"
                          value={customer.phone}
                          onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                          placeholder="Ej. +58 412 1234567"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ delivery_type: 'shipping' })}
                          className={`p-2 rounded-lg border text-center font-semibold text-[11px] cursor-pointer transition-colors ${
                            customer.delivery_type === 'shipping'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-background hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          🚚 Envío
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ delivery_type: 'pickup' })}
                          className={`p-2 rounded-lg border text-center font-semibold text-[11px] cursor-pointer transition-colors ${
                            customer.delivery_type === 'pickup'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-background hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          🏬 Retiro en Tienda
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Ciudad / Dirección (Opcional)
                        </label>
                        <input
                          type="text"
                          value={customer.city || ''}
                          onChange={(e) => setCustomerInfo({ city: e.target.value })}
                          placeholder="Ej. Caracas, Chacao"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                          Notas / Observaciones
                        </label>
                        <input
                          type="text"
                          value={customer.notes || ''}
                          onChange={(e) => setCustomerInfo({ notes: e.target.value })}
                          placeholder="Ej. Factura a nombre de empresa, horario de entrega..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer del Carrito con Totales y Botón WhatsApp */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-border bg-card space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Subtotal PVP</span>
                  <span>{formatPrice(summary.total_retail)}</span>
                </div>

                {summary.total_savings > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Ahorro Mayorista Total</span>
                    <span>-{formatPrice(summary.total_savings)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-foreground pt-2 border-t border-border">
                  <span>Total Estimado</span>
                  <span className="text-blue-600 dark:text-cyan-400">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>
              </div>

              {/* Botón Principal WhatsApp */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Icons.whatsapp className="w-5 h-5" />
                <span>Pedir / Cotizar por WhatsApp</span>
              </button>

              <p className="text-[11px] text-center text-muted-foreground">
                Se enviará un mensaje estructurado con tus productos y datos para coordinar pago y entrega.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
