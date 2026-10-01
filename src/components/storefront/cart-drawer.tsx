'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useCartStore } from '@/hooks/use-cart-store';
import { formatPrice, buildWhatsAppUrl, WHOLESALE_MIN_AMOUNT_ARS } from '@/lib/whatsapp';
import { Icons } from '@/components/icons';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
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

  const whatsappNumber = useStoreConfigStore((s) => s.general.whatsappNumber);
  const storeAddress = useStoreConfigStore((s) => s.general.address);
  const storeSchedule = useStoreConfigStore((s) => s.general.schedule);

  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    city?: string;
  }>({});
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const summary = getSummary();
  const percentToWholesale = Math.min(
    100,
    Math.round((summary.total_retail / WHOLESALE_MIN_AMOUNT_ARS) * 100)
  );
  const remainingToWholesale = Math.max(0, WHOLESALE_MIN_AMOUNT_ARS - summary.total_retail);

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string; city?: string } = {};

    if (!customer.name?.trim()) {
      newErrors.name = 'Ingresa tu nombre completo o razón social';
    }
    if (!customer.phone?.trim()) {
      newErrors.phone = 'Ingresa tu número de teléfono o WhatsApp de contacto';
    }
    if (customer.delivery_type === 'shipping' && !customer.city?.trim()) {
      newErrors.city = 'Indica tu localidad y provincia para calcular el envío';
    }

    return newErrors;
  };

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío.');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setShowValidationAlert(true);

      const count = Object.keys(validationErrors).length;
      toast.warning(
        `Falta${count > 1 ? 'n' : ''} ${count} dato${count > 1 ? 's' : ''} obligatorio${count > 1 ? 's' : ''} para armar tu cotización.`
      );

      // Desplazamiento y foco en el primer campo faltante
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (validationErrors.name) {
          nameInputRef.current?.focus();
        } else if (validationErrors.phone) {
          phoneInputRef.current?.focus();
        } else if (validationErrors.city) {
          cityInputRef.current?.focus();
        }
      }, 80);

      return;
    }

    setErrors({});
    setShowValidationAlert(false);

    const whatsappUrl = buildWhatsAppUrl(items, customer, whatsappNumber);
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    toast.success('Abriendo WhatsApp con el detalle de tu pedido...');
  };

  const clearFieldError = (field: 'name' | 'phone' | 'city') => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        if (Object.keys(next).length === 0) {
          setShowValidationAlert(false);
        }
        return next;
      });
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
      className="fixed inset-0 z-50 overflow-hidden bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 font-gotham"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-8 lg:pl-16">
        <div className="w-screen max-w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl bg-card border-l border-border/80 shadow-2xl flex flex-col h-full">
          
          {/* Header del Carrito */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-border/80 flex items-center justify-between bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#E63946] text-white flex items-center justify-center shadow-xs">
                <Icons.cart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bebas tracking-wide text-foreground flex items-center gap-2">
                  <span>Tu Pedido / Cotización</span>
                  {summary.total_items > 0 && (
                    <span className="text-xs font-gotham font-bold px-2 py-0.5 rounded-full bg-[#E63946]/10 text-[#E63946] border border-[#E63946]/20">
                      {summary.total_items} {summary.total_items === 1 ? 'artículo' : 'artículos'}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#6C757D]">
                  Distribuidora JG Store • Cotizaciones y pedidos directos en Pesos Argentinos
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  title="Vaciar carrito"
                  className="text-xs text-[#6C757D] hover:text-[#E63946] px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Icons.trash className="w-4 h-4" />
                  <span className="hidden sm:inline">Vaciar</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-9 h-9 rounded-xl hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-border"
              >
                <Icons.close className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cuerpo Principal del Carrito */}
          {items.length === 0 ? (
            /* Estado Vacío */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#6C757D]">
              <div className="w-20 h-20 rounded-3xl bg-muted/60 border border-border flex items-center justify-center mb-5 text-[#6C757D]/60 shadow-inner">
                <Icons.cart className="w-10 h-10" />
              </div>
              <h3 className="font-bebas tracking-wide text-foreground text-2xl">Tu carrito está vacío</h3>
              <p className="text-xs sm:text-sm text-[#6C757D] mt-2 max-w-sm font-gotham leading-relaxed">
                Explora nuestros 24 rubros comerciales oficiales y agrega productos con precios al detal o descuentos por volumen mayorista.
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 px-6 py-3 rounded-xl bg-[#E63946] text-white text-xs font-bold hover:bg-[#d62839] transition-all cursor-pointer shadow-md shadow-[#E63946]/20 active:scale-95 uppercase tracking-wider"
              >
                Explorar Catálogo JG Store
              </button>
            </div>
          ) : (
            /* Layout de 2 Columnas en Desktop / 1 Columna en Mobile */
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* COLUMNA IZQUIERDA: Artículos del Carrito y Barra Mayorista */}
              <div className="w-full md:w-7/12 flex flex-col overflow-y-auto border-b md:border-b-0 md:border-r border-border/80 p-4 sm:p-5 lg:p-6 space-y-4">
                
                {/* 1. Barra de Progreso Mayorista Argentina ($50.000 ARS) */}
                <div className="p-4 rounded-xl bg-card border border-[#D4A017]/35 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Icons.sparkles className="w-4 h-4 text-[#D4A017]" />
                      <span>Monto Mínimo Mayorista</span>
                    </span>
                    <span className="text-xs font-bold text-[#D4A017] px-2 py-0.5 rounded-full bg-[#D4A017]/15">
                      {percentToWholesale >= 100 ? '¡MAYORISTA DESBLOQUEADO!' : `${percentToWholesale}%`}
                    </span>
                  </div>

                  <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4A017] to-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${percentToWholesale}%` }}
                    />
                  </div>

                  {percentToWholesale >= 100 ? (
                    <p className="text-[11px] font-bold text-[#D4A017] flex items-center gap-1">
                      🎉 ¡Felicitaciones! Superaste los {formatPrice(WHOLESALE_MIN_AMOUNT_ARS)} y todos tus productos aplican tarifa mayorista.
                    </p>
                  ) : (
                    <p className="text-[11px] text-[#6C757D]">
                      Agregá <strong className="text-foreground">{formatPrice(remainingToWholesale)}</strong> más para desbloquear <strong className="text-[#D4A017]">PRECIO MAYORISTA</strong> en todo tu pedido.
                    </p>
                  )}
                </div>

                {/* 2. Banner de Ahorro Mayorista */}
                {summary.total_savings > 0 && (
                  <div className="p-3.5 rounded-xl bg-[#D4A017]/10 border border-[#D4A017]/30 text-[#D4A017] flex items-center gap-2.5 text-xs font-semibold">
                    <Icons.sparkles className="w-4 h-4 shrink-0 text-[#D4A017]" />
                    <span>
                      ¡Excelente! Estás ahorrando <strong>{formatPrice(summary.total_savings)}</strong> con tarifa mayorista en este pedido.
                    </span>
                  </div>
                )}

                {/* 3. Lista de Artículos */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-[#6C757D] uppercase tracking-wider pb-1">
                    <span>Productos seleccionados ({items.length})</span>
                    <span>Subtotal</span>
                  </div>

                  {items.map((item) => {
                    const isWholesale = item.quantity >= item.product.min_wholesale_qty;
                    const diffToWholesale = item.product.min_wholesale_qty - item.quantity;

                    return (
                      <div
                        key={item.product.id}
                        className="p-3.5 rounded-xl bg-card border border-border/80 hover:border-border transition-all flex gap-3.5 shadow-xs"
                      >
                        {/* Miniatura del Producto */}
                        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/60">
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        </div>

                        {/* Detalles */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2">
                                {item.product.name}
                              </h4>
                              <button
                                type="button"
                                onClick={() => removeItem(item.product.id)}
                                className="text-[#6C757D] hover:text-[#E63946] transition-colors p-1 hover:bg-muted rounded-lg"
                                title="Eliminar del pedido"
                              >
                                <Icons.trash className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className="font-mono text-[10px] text-[#6C757D] bg-muted px-1.5 py-0.5 rounded">
                                {item.product.sku}
                              </span>
                              {isWholesale ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D4A017]/20 text-[#D4A017]">
                                  Tarifa Mayorista
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-[#6C757D]">
                                  Tarifa Detal
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
                            {/* Selector de Cantidad */}
                            <div className="flex items-center border border-border rounded-lg bg-background shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center text-[#6C757D] hover:text-foreground hover:bg-muted rounded-l-md transition-colors"
                              >
                                <Icons.minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-foreground font-mono">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                disabled={item.quantity >= item.product.stock}
                                className="w-7 h-7 flex items-center justify-center text-[#6C757D] hover:text-foreground hover:bg-muted rounded-r-md disabled:opacity-40 transition-colors"
                              >
                                <Icons.add className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Subtotal del Item */}
                            <div className="text-right">
                              <span className="text-base sm:text-lg font-bebas tracking-wide text-foreground font-bold block">
                                {formatPrice(item.subtotal)}
                              </span>
                              <span className="text-[10px] text-[#6C757D]">
                                {formatPrice(item.unit_price)} c/u
                              </span>
                            </div>
                          </div>

                          {/* Tip para alcanzar el umbral mayorista */}
                          {!isWholesale && diffToWholesale > 0 && (
                            <p className="text-[10px] text-[#D4A017] font-medium mt-1.5">
                              ⚡ Agrega {diffToWholesale} u. más para pagar{' '}
                              <strong>{formatPrice(item.product.wholesale_price)} c/u</strong>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COLUMNA DERECHA: Datos del Cliente, Alertas y Botón de Cotización */}
              <div className="w-full md:w-5/12 flex flex-col justify-between overflow-y-auto bg-muted/10 p-4 sm:p-5 lg:p-6 space-y-5">
                
                <div className="space-y-4">
                  {/* Encabezado de la Columna */}
                  <div className="flex items-center justify-between pb-2 border-b border-border/80">
                    <div className="flex items-center gap-2">
                      <Icons.user className="w-4 h-4 text-[#E63946]" />
                      <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
                        Datos para tu Cotización
                      </h3>
                    </div>
                    <span className="text-[10px] text-[#6C757D]">Requerido para WhatsApp</span>
                  </div>

                  {/* BANNER EXPLICATIVO SI FALTAN CAMPOS */}
                  {showValidationAlert && Object.keys(errors).length > 0 && (
                    <div className="p-3.5 rounded-xl bg-red-500/10 border-2 border-red-500/40 text-xs text-red-600 dark:text-red-400 space-y-2 animate-in fade-in duration-200 shadow-xs">
                      <div className="flex items-center gap-2 font-bold">
                        <Icons.alertCircle className="w-4 h-4 text-[#E63946] shrink-0" />
                        <span>Faltan datos obligatorios para cotizar:</span>
                      </div>
                      <p className="text-[11px] text-foreground/80 leading-snug">
                        Para poder armar tu pedido y coordinar el despacho por WhatsApp, por favor completa los siguientes campos señalados en rojo:
                      </p>
                      <ul className="list-disc list-inside text-[11px] font-semibold space-y-1 pl-1 text-[#E63946]">
                        {errors.name && <li>{errors.name}</li>}
                        {errors.phone && <li>{errors.phone}</li>}
                        {errors.city && <li>{errors.city}</li>}
                      </ul>
                    </div>
                  )}

                  {/* FORMULARIO DE CLIENTE Y ENTREGA */}
                  <div ref={formRef} className="space-y-3.5">
                    
                    {/* Campo 1: Nombre */}
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        Nombre Completo o Razón Social <span className="text-[#E63946]">*</span>
                      </label>
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={customer.name}
                        onChange={(e) => {
                          setCustomerInfo({ name: e.target.value });
                          clearFieldError('name');
                        }}
                        placeholder="Ej. Juan Pérez o Distribuidora El Sol"
                        className={`w-full px-3 py-2 rounded-xl border text-xs text-foreground bg-background transition-all outline-none ${
                          errors.name
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                            : 'border-border focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
                        }`}
                      />
                      {errors.name && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">
                          ⚠️ {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Campo 2: Teléfono / WhatsApp */}
                    <div>
                      <label className="block text-[11px] font-bold text-foreground mb-1">
                        Teléfono / WhatsApp de Contacto <span className="text-[#E63946]">*</span>
                      </label>
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        value={customer.phone}
                        onChange={(e) => {
                          setCustomerInfo({ phone: e.target.value });
                          clearFieldError('phone');
                        }}
                        placeholder="Ej. +54 9 11 2345-6789"
                        className={`w-full px-3 py-2 rounded-xl border text-xs text-foreground bg-background transition-all outline-none ${
                          errors.phone
                            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                            : 'border-border focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
                        }`}
                      />
                      {errors.phone && (
                        <p className="text-[10px] text-red-500 font-semibold mt-1">
                          ⚠️ {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Campo 3: Tipo de Factura AFIP */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                        Tipo de Factura Requerida
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ invoice_type: 'B' })}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                            (customer.invoice_type || 'B') === 'B'
                              ? 'bg-[#E63946]/10 border-[#E63946] text-[#E63946] shadow-xs'
                              : 'bg-background hover:bg-muted border-border text-[#6C757D]'
                          }`}
                        >
                          Factura B (Cons. Final)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ invoice_type: 'A' })}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                            customer.invoice_type === 'A'
                              ? 'bg-[#D4A017]/15 border-[#D4A017] text-[#D4A017] shadow-xs'
                              : 'bg-background hover:bg-muted border-border text-[#6C757D]'
                          }`}
                        >
                          Factura A (Resp. Inscripto)
                        </button>
                      </div>
                    </div>

                    {/* Campo 4: Modalidad de Entrega */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                        Modalidad de Entrega
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setCustomerInfo({ delivery_type: 'shipping' })}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                            customer.delivery_type === 'shipping'
                              ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                              : 'bg-background hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          🚚 Envío
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerInfo({ delivery_type: 'pickup' });
                            clearFieldError('city');
                          }}
                          className={`py-2 px-3 rounded-xl border text-center font-bold text-[11px] cursor-pointer transition-all ${
                            customer.delivery_type === 'pickup'
                              ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                              : 'bg-background hover:bg-muted border-border text-foreground'
                          }`}
                        >
                          🤝 Retiro en Persona
                        </button>
                      </div>
                    </div>

                    {/* Campos condicionales según Entrega */}
                    {customer.delivery_type === 'shipping' ? (
                      <div className="space-y-3 pt-1 border-t border-border/60 animate-in fade-in">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[11px] font-bold text-foreground mb-1">
                              Localidad / Provincia <span className="text-[#E63946]">*</span>
                            </label>
                            <input
                              ref={cityInputRef}
                              type="text"
                              value={customer.city || ''}
                              onChange={(e) => {
                                setCustomerInfo({ city: e.target.value });
                                clearFieldError('city');
                              }}
                              placeholder="Ej. Rosario, Santa Fe"
                              className={`w-full px-2.5 py-1.5 rounded-lg border text-xs bg-background text-foreground transition-all outline-none ${
                                errors.city
                                  ? 'border-red-500 ring-2 ring-red-500/20 bg-red-500/5'
                                  : 'border-border focus:border-[#E63946] focus:ring-2 focus:ring-[#E63946]/20'
                              }`}
                            />
                            {errors.city && (
                              <p className="text-[10px] text-red-500 font-semibold mt-1">
                                ⚠️ {errors.city}
                              </p>
                            )}
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                              C. Postal
                            </label>
                            <input
                              type="text"
                              value={customer.postal_code || ''}
                              onChange={(e) => setCustomerInfo({ postal_code: e.target.value })}
                              placeholder="Ej. 2000"
                              className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                            Dirección de Entrega
                          </label>
                          <input
                            type="text"
                            value={customer.address || ''}
                            onChange={(e) => setCustomerInfo({ address: e.target.value })}
                            placeholder="Calle, número, piso, dpto..."
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                            Observaciones / Expreso preferido (Opcional)
                          </label>
                          <input
                            type="text"
                            value={customer.notes || ''}
                            onChange={(e) => setCustomerInfo({ notes: e.target.value })}
                            placeholder="Ej. Despachar por Vía Cargo / Andreani / Horario"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-1 border-t border-border/60 animate-in fade-in">
                        <div className="p-3.5 rounded-xl border border-border bg-card text-xs space-y-1.5 shadow-xs">
                          <div className="flex items-start gap-2 text-foreground font-bold">
                            <span className="text-[#E63946] text-base leading-none">📍</span>
                            <div>
                              <span>Punto de Retiro Central:</span>
                              <p className="font-normal text-muted-foreground mt-0.5">
                                {storeAddress || 'Av. Corrientes 1234, CABA, Argentina'}
                              </p>
                            </div>
                          </div>
                          {storeSchedule && (
                            <p className="text-[11px] text-[#6C757D] pl-6">
                              🕒 <strong>Horarios de atención:</strong> {storeSchedule}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-[#6C757D] mb-1">
                            Observaciones / Quién retira (Opcional)
                          </label>
                          <input
                            type="text"
                            value={customer.notes || ''}
                            onChange={(e) => setCustomerInfo({ notes: e.target.value })}
                            placeholder="Ej. Retiro yo mismo / Retira comisionista / Retira Juan Pérez"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-2 focus:ring-[#E63946]/20 focus:border-[#E63946] outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumen de Pago y Botón Final WhatsApp */}
                <div className="space-y-3 pt-4 border-t border-border bg-card/60 -mx-4 -mb-4 sm:-mx-5 sm:-mb-5 lg:-mx-6 lg:-mb-6 p-4 sm:p-5 lg:p-6 rounded-b-2xl">
                  
                  {/* Badge Promocional CBU */}
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Icons.check className="w-3.5 h-3.5 shrink-0" />
                    <span>10% OFF extra abonando por Transferencia Bancaria (CBU / Alias)</span>
                  </div>

                  {/* Resumen de Montos */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[#6C757D]">
                      <span>Subtotal Minorista</span>
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
                      <span className="text-[#E63946] font-bebas text-2xl sm:text-3xl tracking-wider">
                        {formatPrice(summary.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Botón WhatsApp */}
                  <button
                    type="button"
                    onClick={handleCheckoutWhatsApp}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:scale-[0.99] transition-all cursor-pointer font-gotham"
                  >
                    <Icons.whatsapp className="w-5 h-5" />
                    <span>Pedir / Cotizar por WhatsApp</span>
                  </button>

                  <p className="text-[11px] text-center text-[#6C757D]">
                    Se enviará el detalle para coordinar pago en pesos (Mercado Pago / CBU) y despacho nacional.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
