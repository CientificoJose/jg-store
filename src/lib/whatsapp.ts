import { CartItem, CartSummary, CustomerOrderInfo } from '@/types/store';

// Número de WhatsApp oficial de JG Store para recepción de pedidos/cotizaciones
export const JG_STORE_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '584120000000';

export function calculateCartSummary(items: CartItem[]): CartSummary {
  let total_items = 0;
  let subtotal = 0;
  let total_retail = 0;
  let total_savings = 0;
  let wholesale_items_count = 0;

  for (const item of items) {
    total_items += item.quantity;
    const isWholesale = item.quantity >= item.product.min_wholesale_qty;
    const unitPrice = isWholesale ? item.product.wholesale_price : item.product.retail_price;
    const itemSubtotal = unitPrice * item.quantity;
    const retailSubtotal = item.product.retail_price * item.quantity;
    const itemSavings = retailSubtotal - itemSubtotal;

    subtotal += itemSubtotal;
    total_retail += retailSubtotal;
    total_savings += itemSavings;

    if (isWholesale) {
      wholesale_items_count += 1;
    }
  }

  return {
    total_items,
    subtotal: Number(subtotal.toFixed(2)),
    total_retail: Number(total_retail.toFixed(2)),
    total_savings: Number(total_savings.toFixed(2)),
    wholesale_items_count
  };
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
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

  const lines: string[] = [
    `🛍️ *PEDIDO / COTIZACIÓN - JG STORE*`,
    `📅 Fecha: ${now}`,
    `----------------------------------------`,
    `📋 *DETALLE DE PRODUCTOS:*`
  ];

  items.forEach((item, index) => {
    const isWholesale = item.quantity >= item.product.min_wholesale_qty;
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
        `   • 💡 _(Al llevar ${neededForWholesale} más pagas ${formatPrice(item.product.wholesale_price)} c/u)_`
      );
    }
  });

  lines.push(
    `\n----------------------------------------`,
    `💰 *RESUMEN COMERCIAL:*`,
    `• Total de Artículos: *${summary.total_items} unid.*`,
    `• Subtotal PVP: ${formatPrice(summary.total_retail)}`
  );

  if (summary.total_savings > 0) {
    lines.push(`• 🎉 *AHORRO MAYORISTA TOTAL:* *-${formatPrice(summary.total_savings)}*`);
  }

  lines.push(
    `• 💳 *TOTAL A PAGAR: ${formatPrice(summary.subtotal)}*`,
    `----------------------------------------`,
    `👤 *DATOS DEL CLIENTE:*`,
    `• Nombre: *${customer.name.trim() || 'No especificado'}*`,
    `• Teléfono: *${customer.phone.trim() || 'No especificado'}*`,
    `• Modalidad de Entrega: *${customer.delivery_type === 'shipping' ? '🚚 Envío a Domicilio' : '🏬 Retiro en Tienda / Sucursal'}*`
  );

  if (customer.city) {
    lines.push(`• Ciudad / Región: ${customer.city.trim()}`);
  }

  if (customer.address) {
    lines.push(`• Dirección: ${customer.address.trim()}`);
  }

  if (customer.notes) {
    lines.push(`• Observaciones: ${customer.notes.trim()}`);
  }

  lines.push(
    `\n----------------------------------------`,
    `¿Me podrían confirmar disponibilidad de stock y datos para realizar el pago? ¡Muchas gracias!`
  );

  return lines.join('\n');
}

export function buildWhatsAppUrl(
  items: CartItem[],
  customer: CustomerOrderInfo,
  phoneNumber: string = JG_STORE_WHATSAPP_NUMBER
): string {
  const message = generateWhatsAppOrderMessage(items, customer);
  // Limpiar número (remover signos y espacios)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
