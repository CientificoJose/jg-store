'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/hooks/use-cart-store';
import { useStoreConfigStore } from '@/hooks/use-store-config-store';
import { Icons } from '@/components/icons';
import { formatPrice } from '@/lib/whatsapp';
import { toast } from 'sonner';

export function OrderSuccessModal() {
  const { completedOrder, clearCompletedOrder } = useCartStore();
  const general = useStoreConfigStore((s) => s.general);

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (!completedOrder) return null;

  const { orderNumber, summary, items, customer, whatsappUrl, createdAt } = completedOrder;

  // Datos bancarios configurados (con fallbacks realistas argentinos)
  const bankName = general.bankName || 'Banco Santander / Mercado Pago';
  const bankHolder = general.bankAccountHolder || general.storeName || 'JG Store Polirrubro';
  const bankCuit = general.cuit || '30-71234567-8';
  const bankAlias = general.bankAlias || 'JG.STORE.PAGOS';
  const bankCbu = general.bankCbu || '0720000000000000000000';

  // Cálculos de 10% OFF por transferencia bancaria
  const discountTransferPct = 0.10;
  const transferTotal = Math.round(summary.subtotal * (1 - discountTransferPct));
  const transferSavings = summary.subtotal - transferTotal;

  // Funciones para copiar al portapapeles
  const handleCopy = async (text: string, type: 'code' | 'alias' | 'cbu') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'code') {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      } else if (type === 'alias') {
        setCopiedAlias(true);
        setTimeout(() => setCopiedAlias(false), 2000);
      } else if (type === 'cbu') {
        setCopiedCbu(true);
        setTimeout(() => setCopiedCbu(false), 2000);
      }
      toast.success('¡Copiado al portapapeles!');
    } catch {
      toast.info(`Copia manual: ${text}`);
    }
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200 font-gotham">
      <div
        className="bg-card text-foreground border border-border/90 rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        {/* Encabezado con Ícono y Código */}
        <div className="p-5 sm:p-6 pb-4 sm:pb-5 border-b border-border/80 text-center relative bg-gradient-to-b from-emerald-500/10 to-transparent">
          <button
            type="button"
            onClick={clearCompletedOrder}
            className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-muted text-[#6C757D] hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <Icons.close className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Icons.check className="w-8 h-8 sm:w-9 sm:h-9" />
          </div>

          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            ¡Cotización Registrada en el Sistema!
          </span>

          <h2
            id="success-modal-title"
            className="font-bebas tracking-wide text-2xl sm:text-3xl lg:text-4xl text-foreground mt-2"
          >
            ¡Gracias por tu pedido, {customer.name || 'Cliente'}!
          </h2>

          {/* Tarjeta del Código de Orden */}
          <div className="mt-3.5 inline-flex flex-col sm:flex-row items-center gap-2 p-2.5 px-4 rounded-xl bg-card border border-border shadow-xs">
            <span className="text-xs text-[#6C757D] font-medium">Código de Pedido:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-[#E63946] text-sm sm:text-base">
                #{orderNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(orderNumber, 'code')}
                className="px-2 py-1 rounded-md text-[11px] font-bold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                title="Copiar número de orden"
              >
                {copiedCode ? (
                  <>
                    <Icons.check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Icons.copy className="w-3.5 h-3.5 text-[#6C757D]" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {/* 1. Botón Principal de WhatsApp Oficial */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/30">
                <Icons.whatsapp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-foreground">
                  Paso Final: Confirmación por WhatsApp
                </h3>
                <p className="text-[#6C757D] text-xs mt-0.5 leading-relaxed">
                  Para que nuestro depósito prepare y despache tus artículos, enviá el mensaje prearmado a nuestro canal oficial.
                </p>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 sm:py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 active:scale-[0.99] transition-all cursor-pointer font-gotham text-center"
            >
              <Icons.whatsapp className="w-5 h-5" />
              <span>Abrir WhatsApp con mi Pedido</span>
            </a>

            <p className="text-[11px] text-center text-[#6C757D]">
              📱 ¿Se abrió en otra pestaña? Si ya enviaste el mensaje, podés continuar con el pago a continuación.
            </p>
          </div>

          {/* 2. Tarjeta Destacada de Pago con 10% OFF por Transferencia (CBU / Alias) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#D4A017]/10 via-card to-card border border-[#D4A017]/40 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-[#D4A017]/20 text-[#D4A017]">
                  <Icons.sparkles className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-foreground">
                  Aboná con 10% OFF por Transferencia Bancaria
                </span>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                Ahorrás {formatPrice(transferSavings)}
              </span>
            </div>

            {/* Comparativa de Montos */}
            <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-background border border-border text-center">
              <div>
                <span className="text-[11px] text-[#6C757D] block">Total Normal</span>
                <span className="text-xs line-through text-[#6C757D] font-semibold">
                  {formatPrice(summary.subtotal)}
                </span>
              </div>
              <div className="border-l border-border pl-2">
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block">
                  Total con 10% OFF
                </span>
                <span className="font-bebas text-xl sm:text-2xl text-emerald-600 dark:text-emerald-400 tracking-wider">
                  {formatPrice(transferTotal)}
                </span>
              </div>
            </div>

            {/* Datos para Transferir */}
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[#6C757D]">Banco / Billetera:</span>
                <span className="font-bold text-foreground">{bankName}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-2.5 rounded-xl bg-muted/50 border border-border/80">
                <span className="text-[#6C757D]">Titular & CUIT:</span>
                <span className="font-bold text-foreground">
                  {bankHolder} ({bankCuit})
                </span>
              </div>

              {/* Alias */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div>
                  <span className="text-[10px] text-[#6C757D] block">Alias Oficial</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {bankAlias}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankAlias, 'alias')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
                >
                  {copiedAlias ? (
                    <>
                      <Icons.check className="w-3.5 h-3.5" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Icons.copy className="w-3.5 h-3.5" />
                      <span>Copiar Alias</span>
                    </>
                  )}
                </button>
              </div>

              {/* CBU */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-muted/50 border border-border/80">
                <div className="truncate">
                  <span className="text-[10px] text-[#6C757D] block">CBU / CVU</span>
                  <span className="font-mono text-xs font-semibold text-foreground truncate block">
                    {bankCbu}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(bankCbu, 'cbu')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-all cursor-pointer flex items-center gap-1 active:scale-95 shrink-0"
                >
                  {copiedCbu ? (
                    <>
                      <Icons.check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Icons.copy className="w-3.5 h-3.5 text-[#6C757D]" />
                      <span>Copiar CBU</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-[#6C757D] leading-relaxed pt-1">
              💬 Al transferir, por favor envía el comprobante por WhatsApp indicando el pedido <strong>#{orderNumber}</strong> para asignarlo a tu orden.
            </p>
          </div>

          {/* 3. Desglose del Pedido (Colapsable) */}
          <div className="border border-border rounded-xl overflow-hidden bg-card">
            <button
              type="button"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full p-3.5 flex items-center justify-between text-xs font-bold text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icons.receipt className="w-4 h-4 text-[#E63946]" />
                <span>
                  Resumen de la Orden ({summary.total_items} {summary.total_items === 1 ? 'ítem' : 'ítems'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-base text-[#E63946]">
                  {formatPrice(summary.subtotal)}
                </span>
                <span className="text-[#6C757D]">
                  {showDetails ? <Icons.chevronUp className="w-4 h-4" /> : <Icons.chevronDown className="w-4 h-4" />}
                </span>
              </div>
            </button>

            {showDetails && (
              <div className="p-4 pt-1 border-t border-border space-y-3 animate-in fade-in">
                {/* Datos de envío y factura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] p-2.5 rounded-lg bg-muted/40 border border-border/60">
                  <div>
                    <span className="text-[#6C757D] block">Modalidad de Entrega:</span>
                    <strong className="text-foreground">
                      {customer.delivery_type === 'pickup'
                        ? '🤝 Retiro en Depósito Central'
                        : `🚚 Envío (${customer.city || 'A coordinar'})`}
                    </strong>
                    {customer.address && (
                      <p className="text-[#6C757D] text-[10px] mt-0.5">{customer.address}</p>
                    )}
                  </div>
                  <div>
                    <span className="text-[#6C757D] block">Comprobante Fiscal:</span>
                    <strong className="text-foreground">
                      Factura {customer.invoice_type || 'B'}
                      {customer.dni_cuit ? ` (${customer.dni_cuit})` : ''}
                    </strong>
                    <span className="text-[#6C757D] text-[10px] block mt-0.5">
                      Tel: {customer.phone || 'No especificado'}
                    </span>
                  </div>
                </div>

                {/* Lista de productos */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between text-xs py-1.5 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        {item.product.image_url ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="w-8 h-8 rounded-lg object-cover border border-border shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                            <Icons.product className="w-4 h-4 text-[#6C757D]" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-foreground truncate">{item.product.name}</p>
                          <span className="text-[10px] text-[#6C757D]">
                            {item.quantity} x {formatPrice(item.unit_price)}
                            {item.is_wholesale && (
                              <span className="ml-1 text-[#D4A017] font-bold">(Mayorista)</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-foreground shrink-0">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="space-y-1 pt-2 border-t border-border text-xs">
                  <div className="flex justify-between text-[#6C757D]">
                    <span>Subtotal Minorista:</span>
                    <span>{formatPrice(summary.total_retail)}</span>
                  </div>
                  {summary.total_savings > 0 && (
                    <div className="flex justify-between text-[#D4A017] font-bold">
                      <span>Ahorro Mayorista Desbloqueado:</span>
                      <span>-{formatPrice(summary.total_savings)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-foreground font-extrabold text-sm pt-1 border-t border-border">
                    <span>Total Estimado:</span>
                    <span className="text-[#E63946] font-bebas text-lg">
                      {formatPrice(summary.subtotal)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pie del Modal con Acciones */}
        <div className="p-4 sm:p-5 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-[#6C757D] hover:text-foreground transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Icons.printer className="w-4 h-4" />
            <span>Imprimir Comprobante</span>
          </button>

          <button
            type="button"
            onClick={clearCompletedOrder}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#d62839] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#E63946]/25 active:scale-95"
          >
            Continuar en la Tienda
          </button>
        </div>
      </div>
    </div>
  );
}
