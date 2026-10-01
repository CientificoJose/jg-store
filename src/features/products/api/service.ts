import {
  fetchStoreProducts,
  fetchProductById,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct
} from '@/lib/store-service';
import { CATEGORY_MAP } from '@/constants/categories';
import type {
  Product,
  ProductFilters,
  ProductsResponse,
  ProductByIdResponse,
  ProductMutationPayload
} from './types';

function mapStoreProductToProduct(item: any): Product {
  const cat = CATEGORY_MAP.get(item.category_slug || item.category);
  const sub = cat?.subcategories?.find(
    (s) => s.slug === (item.subcategory_slug || item.subcategory)
  );
  const subSub = sub?.sub_subcategories?.find(
    (ss) => ss.slug === (item.sub_subcategory_slug || item.sub_subcategory)
  );

  return {
    id: String(item.id),
    sku: item.sku || `JG-${item.id}`,
    name: item.name,
    description: item.description || '',
    category: item.category_slug || item.category || 'bazar-cocina',
    category_name:
      item.category_name ||
      cat?.name ||
      item.category ||
      'General',
    subcategory_id: item.subcategory_id || sub?.id,
    subcategory_slug: item.subcategory_slug || item.subcategory,
    subcategory_name: item.subcategory_name || sub?.name,
    sub_subcategory_id: item.sub_subcategory_id || subSub?.id,
    sub_subcategory_slug: item.sub_subcategory_slug || item.sub_subcategory,
    sub_subcategory_name: item.sub_subcategory_name || subSub?.name,
    retail_price: Number(item.retail_price ?? item.price ?? 0),
    wholesale_price: Number(item.wholesale_price ?? item.retail_price ?? item.price ?? 0),
    min_wholesale_qty: Number(item.min_wholesale_qty || 6),
    stock: Number(item.stock || 0),
    unit: item.unit || 'unidad',
    photo_url:
      item.image_url ||
      item.photo_url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    featured: Boolean(item.featured),
    is_seasonal: Boolean(item.is_seasonal),
    tags: item.tags || [],
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    price: Number(item.retail_price ?? item.price ?? 0)
  };
}

export async function getProducts(filters: ProductFilters): Promise<ProductsResponse> {
  const allStoreProducts = await fetchStoreProducts({
    category: filters.categories,
    search: filters.search,
    onlyInStock: filters.onlyInStock
  });

  const allMapped = allStoreProducts.map(mapStoreProductToProduct);

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const offset = (page - 1) * limit;

  const paginated = allMapped.slice(offset, offset + limit);

  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Catálogo de productos JG Store cargado exitosamente',
    total_products: allMapped.length,
    offset,
    limit,
    products: paginated
  };
}

export async function getProductById(id: string | number): Promise<ProductByIdResponse> {
  const item = await fetchProductById(String(id));
  if (!item) {
    throw new Error('Producto no encontrado');
  }
  return {
    success: true,
    time: new Date().toISOString(),
    message: 'Producto encontrado',
    product: mapStoreProductToProduct(item)
  };
}

export async function createProduct(data: ProductMutationPayload) {
  const cat = CATEGORY_MAP.get(data.category);
  const sub = cat?.subcategories?.find((s) => s.slug === data.subcategory);
  const subSub = sub?.sub_subcategories?.find((ss) => ss.slug === data.sub_subcategory);

  const created = await createStoreProduct({
    sku: data.sku || `JG-${Date.now().toString().slice(-4)}`,
    name: data.name,
    description: data.description,
    category_slug: data.category,
    category_name: data.category_name || (cat ? cat.name : data.category),
    subcategory_id: sub?.id,
    subcategory_slug: data.subcategory,
    subcategory_name: data.subcategory_name || sub?.name,
    sub_subcategory_id: subSub?.id,
    sub_subcategory_slug: data.sub_subcategory,
    sub_subcategory_name: data.sub_subcategory_name || subSub?.name,
    retail_price: Number(data.retail_price ?? data.price ?? 0),
    wholesale_price: Number(data.wholesale_price ?? data.retail_price ?? data.price ?? 0),
    min_wholesale_qty: Number(data.min_wholesale_qty || 6),
    stock: Number(data.stock || 0),
    unit: data.unit || 'unidad',
    image_url:
      data.photo_url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    featured: false,
    is_seasonal: false,
    tags: []
  });

  return {
    success: true,
    product: mapStoreProductToProduct(created)
  };
}

export async function updateProduct(id: string | number, data: ProductMutationPayload) {
  const cat = CATEGORY_MAP.get(data.category);
  const sub = cat?.subcategories?.find((s) => s.slug === data.subcategory);
  const subSub = sub?.sub_subcategories?.find((ss) => ss.slug === data.sub_subcategory);

  const updated = await updateStoreProduct(String(id), {
    sku: data.sku,
    name: data.name,
    description: data.description,
    category_slug: data.category,
    category_name: data.category_name || (cat ? cat.name : data.category),
    subcategory_id: sub?.id,
    subcategory_slug: data.subcategory,
    subcategory_name: data.subcategory_name || sub?.name,
    sub_subcategory_id: subSub?.id,
    sub_subcategory_slug: data.sub_subcategory,
    sub_subcategory_name: data.sub_subcategory_name || subSub?.name,
    retail_price: Number(data.retail_price ?? data.price ?? 0),
    wholesale_price: Number(data.wholesale_price ?? data.retail_price ?? data.price ?? 0),
    min_wholesale_qty: Number(data.min_wholesale_qty || 6),
    stock: Number(data.stock || 0),
    unit: data.unit || 'unidad',
    image_url: data.photo_url
  });

  return {
    success: true,
    product: updated ? mapStoreProductToProduct(updated) : null
  };
}

export async function deleteProduct(id: string | number) {
  const success = await deleteStoreProduct(String(id));
  return { success };
}
