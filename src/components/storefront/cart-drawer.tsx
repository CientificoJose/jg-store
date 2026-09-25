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
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 font-gotham">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-card border-l border-border/80 shadow-2xl flex flex-col justify-between">
          
          {/* Header del Carrito */}
          <div className="p-4 sm:p-5 border-b border-border/80 flex items-center justify-between bg-muted/20">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#E63946] text-white flex items-center justify-center shadow-xs">
                <Icons.cart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg font-bebas tracking-wide text-foreground">Tu Pedido</h2>
                <p className="text-xs text-[#6C757D]">
                  {summary.total_items} artículo{summary.total_items === 1 ? '' : 's'} en el carrito
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Vaciar carrito"
                  className="text-xs text-[#6C757D] hover:text-[#E63946] p-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <Icons.trash className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
              >
                <Icons.close className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de Productos o Estado Vacío */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#6C757D]">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4 text-[#6C757D]/60">
                  <Icons.cart className="w-8 h-8" />
                </div>
                <h3 className="font-bebas tracking-wide text-foreground text-xl">Tu carrito está vacío</h3>
                <p className="text-xs text-[#6C757D] mt-1.5 max-w-xs font-gotham">
                  Explora nuestros 24 rubros comerciales y agrega productos al detal o al mayor.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="mt-6 px-4 py-2.5 rounded-xl bg-[#E63946] text-white text-xs font-semibold hover:bg-[#d62839] transition-colors cursor-pointer shadow-sm shadow-[#E63946]/20"
                >
                  Ver Catálogo
                </button>
              </div>
            ) : (
              <>
                {/* Banner de Ahorro Mayorista en Dorado */}
                {summary.total_savings > 0 && (
                  <div className="p-3 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/25 text-[#D4A017] flex items-center gap-2.5 text-xs font-semibold">
                    <Icons.sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      ¡Excelente! Estás ahorrando {formatPrice(summary.total_savings)} en este pedido gracias a precios mayoristas.
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
                        className="p-3 rounded-xl bg-card border border-border/80 hover:border-border transition-all flex gap-3"
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
                                className="text-[#6C757D] hover:text-[#E63946] transition-colors p-0.5"
                                title="Eliminar"
                              >
                                <Icons.trash className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-mono text-[10px] text-[#6C757D]">
                                {item.product.sku}
                              </span>
                              {isWholesale ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#D4A017]/20 text-[#D4A017]">
                                  Tarifa Mayorista
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-muted text-[#6C757D]">
                                  Tarifa Detal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
                            {/* Selector de Cantidad */}
                            <div className="flex items-center border border-border rounded-lg bg-background">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-[#6C757D] hover:text-foreground hover:bg-muted rounded-l-md"
                              >
                                <Icons.minus className="w-3 h-3" />
                              </button>
                              <span className="w-7 text-center text-xs font-bold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-6 h-6 flex items-center justify-center text-[#6C757D] hover:text-foreground hover:bg-muted rounded-r-md disabled:opacity-40"
                              >
                                <Icons.add className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Subtotal del Item */}
                            <div className="text-right">
                              <span className="text-sm font-bebas tracking-wide text-foreground font-bold">
                                {formatPrice(item.subtotal)}
                              </span>
                              <span className="text-[10px] text-[#6C757D] block">
                                {formatPrice(item.unit_price)} c/u
                              </span>
                            </div>
                          </div>

                          {/* Mensaje de incentivo para llegar a precio mayorista */}
                          {!isWholesale && diffToWholesale > 0 && (
                            <p className="text-[10px] text-[#D4A017] font-medium mt-1">
                              Agrega {diffToWholesale} más para pagar{' '}
                              <strong>{formatPrice(item.product.wholesale_price)} c/u</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulario de Datos del Cliente */}
                <div className="mt-4 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowCustomerForm((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-semibold text-foreground py-1"
                  >
                    <span className="flex items-center gap-1.5">
                      <Icons.user className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>Datos de Contacto y Envío</span>
                    </span>
                    <span className="text-[11px] text-[#E63946] font-medium">
                      {showCustomerForm ? 'Ocultar' : 'Completar'}
                    </span>
                  </button>

                  {showCustomerForm && (
                    <div className="mt-3 space-y-2.5 p-3 rounded-xl bg-muted/30 border border-border/80">
                      <div>
                        <label className="block text-[11px] font-medium text-[#6C757D] mb-1">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          value={customer.name}
                          onChange={(e) => setCustomerInfo({ name: e.target.value })}
                          placeholder="Tu nombre o el de tu negocio"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6C757D] mb-1">
                          Teléfono / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          value={customer.phone}
                          onChange={(e) => setCustomerInfo({ phone: e.target.value })}
                          placeholder="Ej. +58 412 1234567"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ delivery_type: 'shipping' })}
                          className={`p-2 rounded-lg border text-center font-semibold text-[11px] cursor-pointer transition-colors ${
                            customer.delivery_type === 'shipping'
                              ? 'bg-[#E63946] text-white border-[#E63946]'
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
                              ? 'bg-[#E63946] text-white border-[#E63946]'
                              : 'bg-background hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          🏬 Retiro en Tienda
                        </button>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6C757D] mb-1">
                          Ciudad / Dirección (Opcional)
                        </label>
                        <input
                          type="text"
                          value={customer.city || ''}
                          onChange={(e) => setCustomerInfo({ city: e.target.value })}
                          placeholder="Ej. Caracas, Chacao"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-[#6C757D] mb-1">
                          Notas / Observaciones
                        </label>
                        <input
                          type="text"
                          value={customer.notes || ''}
                          onChange={(e) => setCustomerInfo({ notes: e.target.value })}
                          placeholder="Ej. Factura a nombre de empresa, horario de entrega..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
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
            <div className="p-4 sm:p-5 border-t border-border bg-card space-y-3 font-gotham">
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-[#6C757D]">
                  <span>Subtotal PVP</span>
                  <span>{formatPrice(summary.total_retail)}</span>
                </div>

                {summary.total_savings > 0 && (
                  <div className="flex items-center justify-between text-[#D4A017] font-bold">
                    <span>Ahorro Mayorista Total</span>
                    <span>-{formatPrice(summary.total_savings)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-extrabold text-foreground pt-2 border-t border-border">
                  <span>Total Estimado</span>
                  <span className="text-[#E63946] font-bebas text-2xl tracking-wider">
                    {formatPrice(summary.subtotal)}
                  </span>
                </div>
              </div>

              {/* Botón Principal WhatsApp */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:scale-[0.99] transition-all cursor-pointer font-gotham"
              >
                <Icons.whatsapp className="w-5 h-5" />
                <span>Pedir / Cotizar por WhatsApp</span>
              </button>

              <p className="text-[11px] text-center text-[#6C757D]">
                Se enviará un mensaje estructurado con tus productos y datos para coordinar pago y entrega.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
