import { CartItem, CartSummary, CustomerOrderInfo } from '@/types/store';

// Número de WhatsApp oficial de JG Store para recepción de pedidos/cotizaciones (Argentina +54 9)
export const JG_STORE_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '5491155550000';

// Monto mínimo de compra en pesos argentinos para activar tarifa mayorista en todo el pedido
export const WHOLESALE_MIN_AMOUNT_ARS = 50000;

export function calculateCartSummary(items: CartItem[]): CartSummary {
  let total_items = 0;
  let total_retail = 0;

  // Primer paso: calcular total a precio minorista para ver si califica para compra mayorista global
  for (const item of items) {
    total_items += item.quantity;
    total_retail += item.product.retail_price * item.quantity;
  }

  const qualifiesGlobalWholesale = total_retail >= WHOLESALE_MIN_AMOUNT_ARS;

  let subtotal = 0;
  let total_savings = 0;
  let wholesale_items_count = 0;

  for (const item of items) {
    // Es mayorista si califica por monto global O si supera la cantidad mínima por producto
    const isWholesale = qualifiesGlobalWholesale || item.quantity >= item.product.min_wholesale_qty;
    const unitPrice = isWholesale ? item.product.wholesale_price : item.product.retail_price;
    const itemSubtotal = unitPrice * item.quantity;
    const retailSubtotal = item.product.retail_price * item.quantity;
    const itemSavings = retailSubtotal - itemSubtotal;

    subtotal += itemSubtotal;
    total_savings += itemSavings;

    if (isWholesale) {
      wholesale_items_count += 1;
    }
  }

  return {
    total_items,
    subtotal: Number(subtotal.toFixed(0)),
    total_retail: Number(total_retail.toFixed(0)),
    total_savings: Number(total_savings.toFixed(0)),
    wholesale_items_count
  };
}

export function formatPrice(price: number): string {
  const formatted = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(price);
  // Reemplazar espacios no divisibles por espacios estándar para evitar caracteres extraños en WhatsApp
  return formatted.replace(/[\u00A0\u202F]/g, ' ');
}

export function generateWhatsAppOrderMessage(
  items: CartItem[],
  customer: CustomerOrderInfo
): string {
  const summary = calculateCartSummary(items);
  const now = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const qualifiesGlobalWholesale = summary.total_retail >= WHOLESALE_MIN_AMOUNT_ARS;

  const lines: string[] = [
    `🛍️ *PEDIDO / COTIZACIÓN - JG STORE POLIRUBRO (ARGENTINA)*`,
    `📅 Fecha: ${now}`,
    `----------------------------------------`,
    `📋 *DETALLE DE PRODUCTOS:*`
  ];

  items.forEach((item, index) => {
    const isWholesale = qualifiesGlobalWholesale || item.quantity >= item.product.min_wholesale_qty;
    const unitPrice = isWholesale ? item.product.wholesale_price : item.product.retail_price;
    const itemSubtotal = unitPrice * item.quantity;

    lines.push(
      `\n*${index + 1}. ${item.product.name}*`,
      `   • SKU: \`${item.product.sku}\``,
      `   • Cantidad: *${item.quantity} ${item.product.unit}(s)*`,
      `   • Modalidad: ${isWholesale ? '🏷️ *PRECIO MAYORISTA*' : '🛒 Detal'}`,
      `   • P. Unit: ${formatPrice(unitPrice)} ${isWholesale ? `_(Detal: ${formatPrice(item.product.retail_price)})_` : ''}`,
      `   • Subtotal: *${formatPrice(itemSubtotal)}*`
    );

    if (isWholesale) {
      const itemSavings = (item.product.retail_price - item.product.wholesale_price) * item.quantity;
      lines.push(`   • 🎉 Ahorro mayorista: *${formatPrice(itemSavings)}*`);
    } else {
      const neededForWholesale = item.product.min_wholesale_qty - item.quantity;
      lines.push(
        `   • 💡 _(Llevando ${neededForWholesale} más pagás ${formatPrice(item.product.wholesale_price)} c/u)_`
      );
    }
  });

  lines.push(
    `\n----------------------------------------`,
    `💰 *RESUMEN COMERCIAL:*`,
    `• Total de Artículos: *${summary.total_items} unid.*`,
    `• Subtotal Minorista: ${formatPrice(summary.total_retail)}`
  );

  if (summary.total_savings > 0) {
    lines.push(`• 🎉 *AHORRO MAYORISTA TOTAL:* *-${formatPrice(summary.total_savings)}*`);
  }

  lines.push(
    `• 💳 *TOTAL ESTIMADO: ${formatPrice(summary.subtotal)}*`,
    `----------------------------------------`,
    `👤 *DATOS DEL CLIENTE:*`,
    `• Nombre / Razón Social: *${customer.name.trim() || 'No especificado'}*`,
    `• Teléfono / WhatsApp: *${customer.phone.trim() || 'No especificado'}*`,
    `• Facturación: *${customer.invoice_type === 'A' ? 'Factura A (Responsable Inscripto)' : 'Factura B (Consumidor Final / Monotributo)'}*`,
    `• Modalidad de Entrega: *${customer.delivery_type === 'shipping' ? '🚚 Envío' : '🤝 Retiro en Persona'}*`
  );

  if (customer.postal_code) {
    lines.push(`• Código Postal: ${customer.postal_code.trim()}`);
  }

  if (customer.city) {
    lines.push(`• Localidad / Provincia: ${customer.city.trim()}`);
  }

  if (customer.address) {
    lines.push(`• Dirección de entrega: ${customer.address.trim()}`);
  }

  if (customer.notes) {
    lines.push(`• Observaciones / Expreso preferido: ${customer.notes.trim()}`);
  }

  lines.push(
    `\n----------------------------------------`,
    `¿Me podrían confirmar disponibilidad y datos bancarios (CBU / Alias / Mercado Pago) para abonar? ¡Muchas gracias!`
  );

  // Limpiar selectores de variación invisibles (\uFE0F) que en algunos sistemas se renderizan como diamantes o signos de interrogación
  return lines.join('\n').replace(/\uFE0F/g, '');
}

export function buildWhatsAppUrl(
  items: CartItem[],
  customer: CustomerOrderInfo,
  phoneNumber: string = JG_STORE_WHATSAPP_NUMBER
): string {
  const message = generateWhatsAppOrderMessage(items, customer);
  // Limpiar número (remover signos y espacios)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  // Usar endpoint directo api.whatsapp.com para evitar la redirección 302 de wa.me que rompe los caracteres UTF-8/emojis
  return `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
}
