export type OrderType = 'retail' | 'wholesale';

export type OrderStatus =
  | 'nueva'
  | 'en_proceso'
  | 'lista_despacho'
  | 'completada'
  | 'cancelada';

export type PaymentMethod = 'mercado_pago' | 'bank_transfer' | 'cash_pickup';

export type PaymentStatus = 'pending' | 'paid' | 'rejected' | 'refunded';

export type ShippingMethod =
  | 'andreani'
  | 'correo_argentino'
  | 'expreso_interior'
  | 'pickup';

export type ShippingStatus =
  | 'preparing'
  | 'ready_for_pickup'
  | 'shipped'
  | 'delivered';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  name: string;
  image_url: string;
  unit: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  is_wholesale: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  order_type: OrderType;
  
  // Datos del Cliente
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  document_type: 'DNI' | 'CUIT';
  document_number: string;
  invoice_type: 'A' | 'B';
  
  // Destino
  province: string;
  city: string;
  postal_code: string;
  address: string;
  
  // Logística
  shipping_method: ShippingMethod;
  shipping_status: ShippingStatus;
  shipping_cost: number;
  tracking_number?: string;
  
  // Pagos y Totales en ARS ($)
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  total_savings: number;
  total_amount: number;
  
  // Estado y Notas
  order_status: OrderStatus;
  notes?: string;
  items: OrderItem[];
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
  paymentStatus?: string;
  sort?: string;
}

export interface OrdersResponse {
  orders: Order[];
  total_orders: number;
  total_amount_sum: number;
  wholesale_count: number;
  retail_count: number;
  pending_dispatch_count: number;
}
