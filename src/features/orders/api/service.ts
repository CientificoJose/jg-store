import { Order, OrderFilters, OrdersResponse, OrderStatus, PaymentStatus } from './types';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const DEFAULT_SUPABASE_URL = 'https://jg-store-bd.press-cloud.com';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.MHnaK-G4RLBfaybcOR7IOVsRj6WK5of1v3xooRJAObc';
const DEFAULT_SUPABASE_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

function getSupabaseConfig() {
  const rawOrdersUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PUBLIC_URL ||
    DEFAULT_SUPABASE_URL;
  const SUPABASE_URL = rawOrdersUrl.replace(/^http:\/\//i, 'https://');
  const SUPABASE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_SERVICE_ROLE_KEY ||
    DEFAULT_SUPABASE_ANON_KEY;
  return { SUPABASE_URL, SUPABASE_KEY };
}

// Almacén en memoria de órdenes sincronizadas desde Supabase y pedidos nuevos
let mockOrders: Order[] = [];

export async function getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();
  let fetchedFromDb = false;

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/orders?select=*,order_items(*)&order=created_at.desc&limit=100`,
        {
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
          },
          cache: 'no-store'
        }
      );
      if (res.ok) {
        const dbOrders = await res.json();
        if (Array.isArray(dbOrders)) {
          mockOrders = dbOrders.map((dbo: any) => ({
            id: dbo.id,
            order_number: dbo.order_number,
            created_at: dbo.created_at,
            updated_at: dbo.updated_at,
            order_type: dbo.order_type || 'retail',
            customer_name: dbo.customer_name || 'Cliente JG Store',
            customer_phone: dbo.customer_phone || '',
            customer_email: dbo.customer_email || undefined,
            document_type: dbo.document_type || 'DNI',
            document_number: dbo.document_number || '0',
            invoice_type: dbo.invoice_type || 'B',
            province: dbo.province || 'Buenos Aires',
            city: dbo.city || 'CABA',
            postal_code: dbo.postal_code || '1000',
            address: dbo.address || '',
            shipping_method: dbo.shipping_method || 'pickup',
            shipping_status: dbo.shipping_status || 'preparing',
            shipping_cost: Number(dbo.shipping_cost) || 0,
            tracking_number: dbo.tracking_number || undefined,
            payment_method: dbo.payment_method || 'bank_transfer',
            payment_status: dbo.payment_status || 'pending',
            subtotal: Number(dbo.subtotal) || 0,
            discount: Number(dbo.discount) || 0,
            total_savings: Number(dbo.total_savings) || 0,
            total_amount: Number(dbo.total_amount) || 0,
            order_status: dbo.order_status || 'nueva',
            notes: dbo.notes || undefined,
            items: Array.isArray(dbo.order_items)
              ? dbo.order_items.map((it: any) => ({
                  id: it.id,
                  order_id: it.order_id,
                  product_id: it.product_id,
                  sku: it.sku,
                  name: it.name,
                  image_url: it.image_url || '',
                  unit: it.unit || 'unidad',
                  quantity: Number(it.quantity) || 1,
                  unit_price: Number(it.unit_price) || 0,
                  cost_price_at_sale: Number(it.cost_price_at_sale) || 0,
                  subtotal: Number(it.subtotal) || 0,
                  is_wholesale: Boolean(it.is_wholesale)
                }))
              : []
          }));
          fetchedFromDb = true;
        }
      }
    } catch (e) {
      console.warn('Error al consultar orders de Supabase:', e);
    }
  }

  // Si falló el fetch directo a Supabase y estamos en el navegador, consultar la API local
  if (!fetchedFromDb && typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/orders?limit=100');
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.orders)) {
          mockOrders = data.orders;
        }
      }
    } catch (e) {
      console.warn('Fallback /api/orders diferido:', e);
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
  const order = mockOrders.find((o) => o.id === id || o.order_number === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.order_status = status;
  order.updated_at = new Date().toISOString();

  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order.order_number)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            order_status: status,
            updated_at: order.updated_at
          })
        }
      );
    } catch (e) {
      console.warn('Error al actualizar estado en Supabase:', e);
    }
  }

  return { ...order };
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id || o.order_number === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.payment_status = status;
  order.updated_at = new Date().toISOString();

  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      await fetch(
        `${SUPABASE_URL}/rest/v1/orders?order_number=eq.${encodeURIComponent(order.order_number)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            payment_status: status,
            updated_at: order.updated_at
          })
        }
      );
    } catch (e) {
      console.warn('Error al actualizar pago en Supabase:', e);
    }
  }

  return { ...order };
}

export async function updateTrackingNumber(id: string, trackingNumber: string): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id || o.order_number === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.tracking_number = trackingNumber;
  order.shipping_status = 'shipped';
  order.order_status = 'lista_despacho';
  order.updated_at = new Date().toISOString();
  return { ...order };
}

export async function createOrder(data: Partial<Order>): Promise<Order> {
  const id = generateUUID();
  const now = new Date().toISOString();
  const orderNumber = data.order_number || `JG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id,
    order_number: orderNumber,
    created_at: now,
    updated_at: now,
    order_type: data.order_type || 'retail',
    customer_name: (data.customer_name || 'Cliente JG Store').trim(),
    customer_phone: (data.customer_phone || '+54 9 11 0000-0000').trim(),
    customer_email: data.customer_email?.trim() || undefined,
    document_type: data.document_type || 'DNI',
    document_number: (data.document_number || '30000000').trim(),
    invoice_type: data.invoice_type || 'B',
    province: (data.province || 'Buenos Aires').trim(),
    city: (data.city || 'CABA').trim(),
    postal_code: (data.postal_code || '1000').trim(),
    address: (data.address || 'A convenir por WhatsApp').trim(),
    shipping_method: data.shipping_method || 'pickup',
    shipping_status: data.shipping_status || 'preparing',
    shipping_cost: Number(data.shipping_cost) || 0,
    tracking_number: data.tracking_number,
    payment_method: data.payment_method || 'bank_transfer',
    payment_status: data.payment_status || 'pending',
    subtotal: Number(data.subtotal) || 0,
    discount: Number(data.discount) || 0,
    total_savings: Number(data.total_savings) || 0,
    total_amount: Number(data.total_amount) || 0,
    order_status: data.order_status || 'nueva',
    notes: data.notes || '',
    items: (data.items || []).map((it) => ({
      ...it,
      id: it.id && it.id.includes('-') && it.id.length > 20 ? it.id : generateUUID(),
      order_id: id
    }))
  };

  const { SUPABASE_URL, SUPABASE_KEY } = getSupabaseConfig();

  if (SUPABASE_URL && SUPABASE_KEY) {
    try {
      // 1. Guardar cabecera de la orden
      const orderPayload = {
        id: newOrder.id,
        order_number: newOrder.order_number,
        created_at: newOrder.created_at,
        updated_at: newOrder.updated_at,
        order_type: newOrder.order_type,
        customer_name: newOrder.customer_name,
        customer_phone: newOrder.customer_phone,
        customer_email: newOrder.customer_email || null,
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
        notes: newOrder.notes || null
      };

      const resOrder = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(orderPayload)
      });

      if (!resOrder.ok) {
        const errText = await resOrder.text();
        console.error('Error insertando orden en Supabase:', resOrder.status, errText);
      } else {
        // 2. Guardar los artículos de la orden (order_items)
        if (newOrder.items.length > 0) {
          const itemsPayload = newOrder.items.map((it) => ({
            id: it.id,
            order_id: newOrder.id,
            product_id: String(it.product_id || it.sku || 'prod'),
            sku: String(it.sku || 'SIN-SKU'),
            name: String(it.name || 'Producto'),
            image_url: it.image_url || '',
            unit: it.unit || 'unidad',
            quantity: Number(it.quantity) || 1,
            unit_price: Number(it.unit_price) || 0,
            cost_price_at_sale: Number(it.cost_price_at_sale) || 0,
            subtotal: Number(it.subtotal) || 0,
            is_wholesale: Boolean(it.is_wholesale),
            created_at: newOrder.created_at
          }));

          const resItems = await fetch(`${SUPABASE_URL}/rest/v1/order_items`, {
            method: 'POST',
            headers: {
              apikey: SUPABASE_KEY,
              Authorization: `Bearer ${SUPABASE_KEY}`,
              'Content-Type': 'application/json',
              Prefer: 'return=minimal'
            },
            body: JSON.stringify(itemsPayload)
          });

          if (!resItems.ok) {
            const errItems = await resItems.text();
            console.error('Error insertando order_items en Supabase:', resItems.status, errItems);
          }
        }
      }
    } catch (e) {
      console.error('Excepción al conectar con Supabase en createOrder:', e);
    }
  }

  mockOrders.unshift(newOrder);
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
