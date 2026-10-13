import { NextRequest } from 'next/server';
import { createOrder } from '@/features/orders/api/service';
import type { CartItem, CustomerOrderInfo } from '@/types/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { items, customer, payment_method, shipping_method, notes } = body as {
      items: CartItem[];
      customer: CustomerOrderInfo;
      payment_method?: string;
      shipping_method?: string;
      notes?: string;
    };

    if (!items || !Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'El carrito no contiene productos válidos.' }, { status: 400 });
    }

    if (!customer || !customer.name || !customer.phone) {
      return Response.json(
        { error: 'Los datos del comprador (nombre y teléfono) son obligatorios.' },
        { status: 400 }
      );
    }

    // Determinar si el pedido califica como mayorista
    const hasWholesaleItems = items.some((it) => it.is_wholesale);
    const subtotal = items.reduce(
      (acc, it) => acc + (it.subtotal || it.unit_price * it.quantity),
      0
    );
    const totalSavings = items.reduce((acc, it) => acc + (it.savings || 0), 0);

    // Descuento por transferencia bancaria (10% OFF si aplica)
    const isTransfer = (payment_method || 'bank_transfer') === 'bank_transfer';
    const discount = isTransfer ? Math.round(subtotal * 0.1) : 0;
    const totalAmount = Math.max(0, subtotal - discount);

    // Mapear ítems para la orden con PRECIOS QUEMADOS
    const orderItems = items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: '',
      product_id: it.product.id,
      sku: it.product.sku,
      name: it.product.name,
      image_url: it.product.image_url || '',
      unit: it.product.unit || 'unidad',
      quantity: it.quantity,
      unit_price: it.unit_price, // Precio congelado/quemado
      cost_price_at_sale: it.product.cost_price || Math.round(it.unit_price / 1.4), // Costo congelado
      subtotal: it.subtotal || it.unit_price * it.quantity,
      is_wholesale: Boolean(it.is_wholesale)
    }));

    const newOrder = await createOrder({
      order_type: hasWholesaleItems ? 'wholesale' : 'retail',
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_email: customer.notes?.includes('@') ? customer.notes : undefined,
      document_type: customer.invoice_type === 'A' ? 'CUIT' : 'DNI',
      document_number: customer.invoice_type === 'A' ? '30-XXXXXXXX-9' : 'XXXXXXXX',
      invoice_type: customer.invoice_type || 'B',
      province: customer.province || 'Buenos Aires',
      city: customer.city || 'CABA',
      postal_code: customer.postal_code || '1000',
      address: customer.address || 'A convenir por WhatsApp',
      shipping_method:
        (shipping_method as any) || (customer.delivery_type === 'pickup' ? 'pickup' : 'andreani'),
      shipping_status: 'preparing',
      shipping_cost: 0,
      payment_method: (payment_method as any) || 'bank_transfer',
      payment_status: 'pending',
      subtotal,
      discount,
      total_savings: totalSavings,
      total_amount: totalAmount,
      order_status: 'nueva',
      notes: notes || customer.notes,
      items: orderItems
    });

    return Response.json({
      success: true,
      message: 'Pedido registrado con éxito en el sistema.',
      order: newOrder
    });
  } catch (error: any) {
    console.error('Error al crear orden:', error);
    return Response.json(
      { error: error?.message || 'Error al registrar el pedido en el servidor.' },
      { status: 500 }
    );
  }
}
