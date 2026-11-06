import { Order, OrderFilters, OrdersResponse, OrderStatus, PaymentStatus } from './types';

// Almacén en memoria de órdenes sincronizadas desde Supabase y pedidos nuevos
let mockOrders: Order[] = [];

export async function getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  // Sincronizar órdenes registradas en Supabase
  const rawOrdersUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
  const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*&order=created_at.desc&limit=100`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`
          },
          cache: 'no-store'
        }
      );
      if (res.ok) {
        const dbOrders = await res.json();
        if (Array.isArray(dbOrders) && dbOrders.length > 0) {
          const existingMap = new Map(mockOrders.map((o) => [o.order_number, o]));
          for (const dbo of dbOrders) {
            const existing = existingMap.get(dbo.order_number);
            if (!existing) {
              mockOrders.unshift({
                ...dbo,
                items: dbo.items || []
              });
            } else {
              // Mantener sincronizado el estado si cambió en base de datos
              existing.order_status = dbo.order_status || existing.order_status;
              existing.payment_status = dbo.payment_status || existing.payment_status;
            }
          }
        }
      }
    } catch {
      // Fallback silencioso en memoria
    }
  }

  let filtered = [...mockOrders];

  // Búsqueda por texto (número de orden, nombre de cliente, CUIT/DNI, provincia)
  if (filters.search) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (o) =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.document_number.toLowerCase().includes(q) ||
        o.city.toLowerCase().includes(q) ||
        o.province.toLowerCase().includes(q) ||
        (o.customer_email && o.customer_email.toLowerCase().includes(q))
    );
  }

  // Filtro por Estado
  if (filters.status && filters.status !== 'all') {
    filtered = filtered.filter((o) => o.order_status === filters.status);
  }

  // Filtro por Tipo (wholesale / retail)
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter((o) => o.order_type === filters.type);
  }

  // Filtro por Pago
  if (filters.paymentStatus && filters.paymentStatus !== 'all') {
    filtered = filtered.filter((o) => o.payment_status === filters.paymentStatus);
  }

  // Ordenamiento
  if (filters.sort) {
    try {
      const parsedSort = JSON.parse(filters.sort);
      if (Array.isArray(parsedSort) && parsedSort.length > 0) {
        const { id, desc } = parsedSort[0];
        filtered.sort((a, b) => {
          let valA: any = a[id as keyof Order];
          let valB: any = b[id as keyof Order];
          if (id === 'created_at') {
            valA = new Date(a.created_at).getTime();
            valB = new Date(b.created_at).getTime();
          }
          if (valA < valB) return desc ? 1 : -1;
          if (valA > valB) return desc ? -1 : 1;
          return 0;
        });
      }
    } catch {
      // Por defecto orden por fecha más reciente
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  } else {
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const total_orders = filtered.length;
  const page = filters.page || 1;
  const limit = filters.limit || 10;
  const startIndex = (page - 1) * limit;
  const paginatedOrders = filtered.slice(startIndex, startIndex + limit);

  // Estadísticas globales sobre todo el lote
  const total_amount_sum = mockOrders.reduce((sum, o) => sum + o.total_amount, 0);
  const wholesale_count = mockOrders.filter((o) => o.order_type === 'wholesale').length;
  const retail_count = mockOrders.filter((o) => o.order_type === 'retail').length;
  const pending_dispatch_count = mockOrders.filter(
    (o) => o.order_status === 'nueva' || o.order_status === 'en_proceso'
  ).length;

  return {
    orders: paginatedOrders,
    total_orders,
    total_amount_sum,
    wholesale_count,
    retail_count,
    pending_dispatch_count
  };
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 40));
  return mockOrders.find((o) => o.id === id || o.order_number === id);
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.order_status = status;
  order.updated_at = new Date().toISOString();

  const rawOrdersUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
  const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order.order_number)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_status: status,
            updated_at: order.updated_at
          })
        }
      );
    } catch {
      // Silencioso fallback en memoria
    }
  }

  return { ...order };
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.payment_status = status;
  order.updated_at = new Date().toISOString();

  const rawOrdersUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
  const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order.order_number)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment_status: status,
            updated_at: order.updated_at
          })
        }
      );
    } catch {
      // Silencioso fallback en memoria
    }
  }

  return { ...order };
}

export async function updateTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.tracking_number = trackingNumber;
  order.shipping_status = 'shipped';
  order.order_status = 'lista_despacho';
  order.updated_at = new Date().toISOString();
  return { ...order };
}

let orderSequence = 1050;

export async function createOrder(data: Partial<Order>): Promise<Order> {
  orderSequence++;
  const id = `ord-${Date.now()}`;
  const orderNumber = data.order_number || `JG-2026-${orderSequence}`;
  const now = new Date().toISOString();

  const newOrder: Order = {
    id,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    order_type: data.order_type || 'retail',
    customer_name: data.customer_name || 'Cliente JG Store',
    customer_phone: data.customer_phone || '',
    customer_email: data.customer_email,
    document_type: data.document_type || 'DNI',
    document_number: data.document_number || '0',
    invoice_type: data.invoice_type || 'B',
    province: data.province || 'Buenos Aires',
    city: data.city || 'CABA',
    postal_code: data.postal_code || '1000',
    address: data.address || '',
    shipping_method: data.shipping_method || 'andreani',
    shipping_status: data.shipping_status || 'preparing',
    shipping_cost: data.shipping_cost || 0,
    tracking_number: data.tracking_number,
    payment_method: data.payment_method || 'bank_transfer',
    payment_status: data.payment_status || 'pending',
    subtotal: data.subtotal || 0,
    discount: data.discount || 0,
    total_savings: data.total_savings || 0,
    total_amount: data.total_amount || 0,
    order_status: data.order_status || 'nueva',
    notes: data.notes,
    items: (data.items || []).map((it) => ({
      ...it,
      order_id: id
    }))
  };

  mockOrders.unshift(newOrder);

  const rawOrdersUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
  const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          order_number: newOrder.order_number,
          order_type: newOrder.order_type,
          customer_name: newOrder.customer_name,
          customer_phone: newOrder.customer_phone,
          customer_email: newOrder.customer_email,
          document_type: newOrder.document_type,
          document_number: newOrder.document_number,
          invoice_type: newOrder.invoice_type,
          province: newOrder.province,
          city: newOrder.city,
          postal_code: newOrder.postal_code,
          address: newOrder.address,
          shipping_method: newOrder.shipping_method,
          shipping_status: newOrder.shipping_status,
          shipping_cost: newOrder.shipping_cost,
          payment_method: newOrder.payment_method,
          payment_status: newOrder.payment_status,
          subtotal: newOrder.subtotal,
          discount: newOrder.discount,
          total_savings: newOrder.total_savings,
          total_amount: newOrder.total_amount,
          order_status: newOrder.order_status,
          notes: newOrder.notes
        })
      });
    } catch {
      // Silencioso fallback en memoria
    }
  }

  return newOrder;
}

export async function updateOrderItemQuantity(
  orderId: string,
  itemId: string,
  newQuantity: number
): Promise<Order> {
  const order = mockOrders.find((o) => o.id === orderId);
  if (!order) throw new Error('Pedido no encontrado');

  const itemIndex = order.items.findIndex((it) => it.id === itemId);
  if (itemIndex === -1) throw new Error('Artículo no encontrado en el pedido');

  if (newQuantity <= 0) {
    order.items.splice(itemIndex, 1);
  } else {
    const item = order.items[itemIndex];
    item.quantity = newQuantity;
    item.subtotal = item.unit_price * newQuantity;
  }

  // Recalcular totales de la orden
  const newSubtotal = order.items.reduce((sum, it) => sum + it.subtotal, 0);
  const isTransfer = order.payment_method === 'bank_transfer';
  const newDiscount = isTransfer ? Math.round(newSubtotal * 0.1) : 0;
  order.subtotal = newSubtotal;
  order.discount = newDiscount;
  order.total_amount = Math.max(0, newSubtotal - newDiscount + (order.shipping_cost || 0));
  order.updated_at = new Date().toISOString();

  return { ...order };
}

export async function removeOrderItem(orderId: string, itemId: string): Promise<Order> {
  return updateOrderItemQuantity(orderId, itemId, 0);
}
