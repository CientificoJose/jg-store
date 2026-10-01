export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string; // slug Nivel 1
  category_name: string;
  subcategory_id?: string;
  subcategory_slug?: string; // slug Nivel 2
  subcategory_name?: string;
  sub_subcategory_id?: string;
  sub_subcategory_slug?: string; // slug Nivel 3
  sub_subcategory_name?: string;
  retail_price: number;
  wholesale_price: number;
  min_wholesale_qty: number;
  stock: number;
  unit: string;
  photo_url: string;
  featured?: boolean;
  is_seasonal?: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Alias de compatibilidad
  price: number;
}

export type ProductFilters = {
  page?: number;
  limit?: number;
  categories?: string;
  search?: string;
  sort?: string;
  onlyInStock?: boolean;
};

export type ProductsResponse = {
  success: boolean;
  time: string;
  message: string;
  total_products: number;
  offset: number;
  limit: number;
  products: Product[];
};

export type ProductByIdResponse = {
  success: boolean;
  time: string;
  message: string;
  product: Product;
};

export type ProductMutationPayload = {
  sku: string;
  name: string;
  category: string;
  category_name?: string;
  subcategory?: string;
  subcategory_name?: string;
  sub_subcategory?: string;
  sub_subcategory_name?: string;
  retail_price: number;
  wholesale_price: number;
  min_wholesale_qty: number;
  stock: number;
  unit?: string;
  photo_url: string;
  description: string;
  price?: number;
};
