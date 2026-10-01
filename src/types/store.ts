export interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_slug: string;
  category_name: string;
  retail_price: number;       // PVP para cliente detal (desde 1 unidad)
  wholesale_price: number;    // Precio mayorista por unidad
  min_wholesale_qty: number;  // Cantidad mínima requerida para activar precio mayorista
  stock: number;              // Unidades disponibles en almacén
  image_url: string;
  unit: string;               // 'unidad', 'docena', 'pack', 'caja'
  brand?: string;             // Marca del producto (ej. Samsung, Stanley, Acrilex)
  featured?: boolean;
  is_seasonal?: boolean;
  tags?: string[];
  created_at?: string;
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
  unit_price: number;         // retail_price o wholesale_price según quantity >= min_wholesale_qty
  is_wholesale: boolean;      // true si quantity >= min_wholesale_qty
  subtotal: number;           // unit_price * quantity
  savings: number;            // (retail_price - wholesale_price) * quantity si is_wholesale
}

export interface CartSummary {
  total_items: number;
  subtotal: number;
  total_retail: number;
  total_savings: number;
  wholesale_items_count: number;
}

export interface CustomerOrderInfo {
  name: string;
  phone: string;
  delivery_type: 'shipping' | 'pickup';
  address?: string;
  city?: string;
  postal_code?: string;
  province?: string;
  invoice_type?: 'B' | 'A'; // Factura B (Consumidor Final / Monotributo) o Factura A (Responsable Inscripto)
  notes?: string;
}

export type ProductSortOption =
  | 'popular'
  | 'price_asc'
  | 'price_desc'
  | 'wholesale_discount'
  | 'name_asc';
