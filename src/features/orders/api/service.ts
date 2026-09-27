import { Order, OrderFilters, OrdersResponse, OrderStatus, PaymentStatus } from './types';

// Almacén en memoria de órdenes realistas de Argentina (B2B Mayoristas y B2C Minoristas)
let mockOrders: Order[] = [
  {
    id: 'ord-1001',
    order_number: 'JG-2026-1042',
    created_at: '2026-09-26T16:30:00Z',
    updated_at: '2026-09-26T16:30:00Z',
    order_type: 'wholesale',
    customer_name: 'Distribuidora Once Norte S.R.L.',
    customer_phone: '+54 9 11 4455-8822',
    customer_email: 'compras@oncenorte.com.ar',
    document_type: 'CUIT',
    document_number: '30-71829384-9',
    invoice_type: 'A',
    province: 'Buenos Aires',
    city: 'San Isidro',
    postal_code: 'B1642',
    address: 'Av. Andrés Rolón 1420',
    shipping_method: 'expreso_interior',
    shipping_status: 'preparing',
    shipping_cost: 0, // Pago en destino por expreso
    tracking_number: 'VC-8941294',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    subtotal: 198000,
    discount: 19800, // 10% OFF transferencia CBU
    total_savings: 74000, // Ahorro comparado con precio detal
    total_amount: 178200,
    order_status: 'en_proceso',
    notes: 'Despachar por Expreso Morabito en Villa Soldati. Bultos precintados.',
    items: [
      {
        id: 'item-1',
        order_id: 'ord-1001',
        product_id: 'p-1',
        sku: 'DIF-ROD-01',
        name: 'Difusor Varillas Aromáticas 250ml',
        image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 24,
        unit_price: 5200,
        subtotal: 124800,
        is_wholesale: true
      },
      {
        id: 'item-2',
        order_id: 'ord-1001',
        product_id: 'p-2',
        sku: 'VAS-TER-02',
        name: 'Vaso Térmico Acero Inoxidable 500ml',
        image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 10,
        unit_price: 7320,
        subtotal: 73200,
        is_wholesale: true
      }
    ]
  },
  {
    id: 'ord-1002',
    order_number: 'JG-2026-1043',
    created_at: '2026-09-26T17:15:00Z',
    updated_at: '2026-09-26T17:15:00Z',
    order_type: 'retail',
    customer_name: 'Camila Benítez',
    customer_phone: '+54 9 11 5821-9310',
    customer_email: 'camilab@gmail.com',
    document_type: 'DNI',
    document_number: '39.812.441',
    invoice_type: 'B',
    province: 'Ciudad Autónoma de Buenos Aires',
    city: 'Caballito',
    postal_code: 'C1405',
    address: 'Av. Rivadavia 5420 Piso 4 Depto B',
    shipping_method: 'andreani',
    shipping_status: 'preparing',
    shipping_cost: 4500,
    payment_method: 'mercado_pago',
    payment_status: 'paid',
    subtotal: 26800,
    discount: 0,
    total_savings: 0,
    total_amount: 31300,
    order_status: 'nueva',
    notes: 'Por favor entregar por la tarde a partir de las 14hs.',
    items: [
      {
        id: 'item-3',
        order_id: 'ord-1002',
        product_id: 'p-6',
        sku: 'ORG-MAQ-06',
        name: 'Organizador Giratorio Acrílico 360°',
        image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 1,
        unit_price: 18500,
        subtotal: 18500,
        is_wholesale: false
      },
      {
        id: 'item-4',
        order_id: 'ord-1002',
        product_id: 'p-4',
        sku: 'RES-PAS-04',
        name: 'Resaltadores Pastel Pack x6 Colores',
        image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
        unit: 'pack',
        quantity: 1,
        unit_price: 8300,
        subtotal: 8300,
        is_wholesale: false
      }
    ]
  },
  {
    id: 'ord-1003',
    order_number: 'JG-2026-1044',
    created_at: '2026-09-26T14:10:00Z',
    updated_at: '2026-09-26T15:20:00Z',
    order_type: 'wholesale',
    customer_name: 'Bazar Central Córdoba (Martín Funes)',
    customer_phone: '+54 9 351 690-3321',
    customer_email: 'compras@bazarcentralcba.com',
    document_type: 'CUIT',
    document_number: '20-28491029-4',
    invoice_type: 'A',
    province: 'Córdoba',
    city: 'Córdoba Capital',
    postal_code: 'X5000',
    address: 'Calle San Jerónimo 320',
    shipping_method: 'expreso_interior',
    shipping_status: 'shipped',
    shipping_cost: 0,
    tracking_number: 'AND-99120481-CBA',
    payment_method: 'bank_transfer',
    payment_status: 'paid',
    subtotal: 310000,
    discount: 31000,
    total_savings: 112000,
    total_amount: 279000,
    order_status: 'lista_despacho',
    notes: 'Entregar remito duplicado para firma de recepción.',
    items: [
      {
        id: 'item-5',
        order_id: 'ord-1003',
        product_id: 'p-13',
        sku: 'TER-DIG-13',
        name: 'Termo Digital Acero Smart 500ml',
        image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 15,
        unit_price: 13900,
        subtotal: 208500,
        is_wholesale: true
      },
      {
        id: 'item-6',
        order_id: 'ord-1003',
        product_id: 'p-14',
        sku: 'AUR-BLU-14',
        name: 'Auriculares Bluetooth In-Ear JG Sound',
        image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 10,
        unit_price: 10150,
        subtotal: 101500,
        is_wholesale: true
      }
    ]
  },
  {
    id: 'ord-1004',
    order_number: 'JG-2026-1045',
    created_at: '2026-09-26T12:00:00Z',
    updated_at: '2026-09-26T12:00:00Z',
    order_type: 'retail',
    customer_name: 'Facundo Quiroga',
    customer_phone: '+54 9 341 511-9022',
    customer_email: 'fqui_roga@hotmail.com',
    document_type: 'DNI',
    document_number: '42.109.833',
    invoice_type: 'B',
    province: 'Santa Fe',
    city: 'Rosario',
    postal_code: 'S2000',
    address: 'Bv. Oroño 1120 Dpto 8A',
    shipping_method: 'correo_argentino',
    shipping_status: 'preparing',
    shipping_cost: 3900,
    payment_method: 'bank_transfer',
    payment_status: 'pending',
    subtotal: 18900,
    discount: 1890,
    total_savings: 0,
    total_amount: 20910,
    order_status: 'nueva',
    notes: 'Esperando confirmación de comprobante CBU por WhatsApp.',
    items: [
      {
        id: 'item-7',
        order_id: 'ord-1004',
        product_id: 'p-21',
        sku: 'MAS-ESP-21',
        name: 'Comedero Bebedero Automático Mascotas',
        image_url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 1,
        unit_price: 18900,
        subtotal: 18900,
        is_wholesale: false
      }
    ]
  },
  {
    id: 'ord-1005',
    order_number: 'JG-2026-1046',
    created_at: '2026-09-25T19:40:00Z',
    updated_at: '2026-09-26T11:00:00Z',
    order_type: 'wholesale',
    customer_name: 'Regalería & Juguetes Los Pekes (Mariana Solís)',
    customer_phone: '+54 9 261 488-1200',
    customer_email: 'lospekes.mendoza@gmail.com',
    document_type: 'CUIT',
    document_number: '27-31049281-4',
    invoice_type: 'A',
    province: 'Mendoza',
    city: 'Godoy Cruz',
    postal_code: 'M5501',
    address: 'Calle San Martín 850',
    shipping_method: 'expreso_interior',
    shipping_status: 'delivered',
    shipping_cost: 0,
    tracking_number: 'CRUZ-8410294',
    payment_method: 'mercado_pago',
    payment_status: 'paid',
    subtotal: 142000,
    discount: 0,
    total_savings: 51000,
    total_amount: 142000,
    order_status: 'completada',
    notes: 'Pedido entregado en sucursal con remito firmado.',
    items: [
      {
        id: 'item-8',
        order_id: 'ord-1005',
        product_id: 'p-3',
        sku: 'POP-BUR-03',
        name: 'Pop It Fidget Silicona Antiestrés',
        image_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 25,
        unit_price: 3360,
        subtotal: 84000,
        is_wholesale: true
      },
      {
        id: 'item-9',
        order_id: 'ord-1005',
        product_id: 'p-4',
        sku: 'RES-PAS-04',
        name: 'Resaltadores Pastel Pack x6 Colores',
        image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
        unit: 'pack',
        quantity: 10,
        unit_price: 5800,
        subtotal: 58000,
        is_wholesale: true
      }
    ]
  },
  {
    id: 'ord-1006',
    order_number: 'JG-2026-1047',
    created_at: '2026-09-26T18:00:00Z',
    updated_at: '2026-09-26T18:00:00Z',
    order_type: 'wholesale',
    customer_name: 'Polirrubro El Fénix (Lucas G.)',
    customer_phone: '+54 9 11 6290-4411',
    customer_email: 'lucas@elfenixstore.com.ar',
    document_type: 'CUIT',
    document_number: '30-74910284-2',
    invoice_type: 'A',
    province: 'Buenos Aires',
    city: 'Morón',
    postal_code: 'B1708',
    address: 'Belgrano 340',
    shipping_method: 'pickup',
    shipping_status: 'ready_for_pickup',
    shipping_cost: 0,
    payment_method: 'cash_pickup',
    payment_status: 'pending',
    subtotal: 86400,
    discount: 0,
    total_savings: 32000,
    total_amount: 86400,
    order_status: 'lista_despacho',
    notes: 'Retira comisionista en moto mañana a las 11hs.',
    items: [
      {
        id: 'item-10',
        order_id: 'ord-1006',
        product_id: 'p-2',
        sku: 'VAS-TER-02',
        name: 'Vaso Térmico Acero Inoxidable 500ml',
        image_url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
        unit: 'unidad',
        quantity: 12,
        unit_price: 7200,
        subtotal: 86400,
        is_wholesale: true
      }
    ]
  }
];

export async function getOrders(filters: OrderFilters = {}): Promise<OrdersResponse> {
  // Simular latencia de red leve
  await new Promise((resolve) => setTimeout(resolve, 60));

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
      filtered.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  } else {
    filtered.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
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
  return { ...order };
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
  const order = mockOrders.find((o) => o.id === id);
  if (!order) throw new Error('Pedido no encontrado');
  order.payment_status = status;
  order.updated_at = new Date().toISOString();
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
