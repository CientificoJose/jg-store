import { INITIAL_PRODUCTS } from '@/constants/initial-catalog';
import { StoreProduct, ProductSortOption } from '@/types/store';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://jg-store-bd.press-cloud.com';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Memoria local para cambios de stock en sesión cuando no esté la tabla en Supabase
let localCatalog: StoreProduct[] = [...INITIAL_PRODUCTS];

export interface FetchProductsOptions {
  category?: string;
  subcategory?: string;
  sub_subcategory?: string;
  search?: string;
  sort?: ProductSortOption;
  onlyInStock?: boolean;
}

import { performSmartSearch, SearchMatchMetadata } from './search-engine';

export interface FetchProductsResult {
  products: StoreProduct[];
  searchMetadata?: SearchMatchMetadata;
}

export async function fetchStoreProductsWithMeta(
  options: FetchProductsOptions = {}
): Promise<FetchProductsResult> {
  const { category, subcategory, sub_subcategory, search, sort = 'popular', onlyInStock = false } = options;

  let products: StoreProduct[] = [];

  // Intento de conexión con Supabase Dokploy PostgREST
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const endpoint = `${SUPABASE_URL}/rest/v1/products?select=*`;
      const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          products = data.map((item: any) => ({
            id: String(item.id),
            sku: item.sku || `JG-${item.id}`,
            name: item.name,
            description: item.description || '',
            category_slug: item.category_slug,
            category_name: item.category_name,
            subcategory_id: item.subcategory_id,
            subcategory_slug: item.subcategory_slug,
            subcategory_name: item.subcategory_name,
            sub_subcategory_id: item.sub_subcategory_id,
            sub_subcategory_slug: item.sub_subcategory_slug,
            sub_subcategory_name: item.sub_subcategory_name,
            retail_price: Number(item.retail_price),
            wholesale_price: Number(item.wholesale_price),
            min_wholesale_qty: Number(item.min_wholesale_qty || 6),
            stock: Number(item.stock || 0),
            image_url: item.image_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
            unit: item.unit || 'unidad',
            brand: item.brand,
            featured: Boolean(item.featured),
            is_seasonal: Boolean(item.is_seasonal),
            tags: item.tags || []
          }));
        }
      }
    } catch {
      // Si falla o no existe la tabla, usamos el catálogo local
    }
  }

  // Fallback si la BD aún no tiene registros o no está inicializada
  if (products.length === 0) {
    products = [...localCatalog];
  }

  const allAvailableProducts = [...products];

  // 1. Filtrar por categoría (si no hay búsqueda o como filtro base)
  if (category && category !== 'all' && (!search || search.trim() === '')) {
    products = products.filter((p) => p.category_slug === category);
  }

  // Filtrar por subcategoría comercial (Nivel 2)
  if (subcategory && subcategory !== 'all' && (!search || search.trim() === '')) {
    products = products.filter((p) => p.subcategory_slug === subcategory);
  }

  // Filtrar por línea específica de producto (Nivel 3)
  if (sub_subcategory && sub_subcategory !== 'all' && (!search || search.trim() === '')) {
    products = products.filter((p) => p.sub_subcategory_slug === sub_subcategory);
  }

  let searchMetadata: SearchMatchMetadata | undefined;

  // 2. Filtrar por búsqueda inteligente (coincidencias, fuzzy typos y sinónimos polirrubro)
  if (search && search.trim() !== '') {
    // Si hay categoría seleccionada, probamos primero en esa categoría
    let pool = (category && category !== 'all')
      ? products.filter((p) => p.category_slug === category)
      : products;

    let smartRes = performSmartSearch(pool, search);

    // Si dentro de la categoría no hubo nada, buscamos en todo el catálogo
    if (smartRes.products.length === 0 && category && category !== 'all') {
      smartRes = performSmartSearch(allAvailableProducts, search);
    }

    products = smartRes.products;
    searchMetadata = smartRes.metadata;
  }

  // 3. Filtrar solo productos en stock
  if (onlyInStock) {
    products = products.filter((p) => p.stock > 0);
  }

  // 4. Ordenamiento
  switch (sort) {
    case 'price_asc':
      products.sort((a, b) => a.retail_price - b.retail_price);
      break;
    case 'price_desc':
      products.sort((a, b) => b.retail_price - a.retail_price);
      break;
    case 'wholesale_discount':
      products.sort((a, b) => {
        const discA = (a.retail_price - a.wholesale_price) / a.retail_price;
        const discB = (b.retail_price - b.wholesale_price) / b.retail_price;
        return discB - discA;
      });
      break;
    case 'name_asc':
      products.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'popular':
    default:
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  return { products, searchMetadata };
}

export async function fetchStoreProducts(
  options: FetchProductsOptions = {}
): Promise<StoreProduct[]> {
  const res = await fetchStoreProductsWithMeta(options);
  return res.products;
}

export async function fetchProductById(id: string): Promise<StoreProduct | null> {
  const all = await fetchStoreProducts();
  return all.find((p) => p.id === id || p.sku === id) || null;
}

export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<{ success: boolean; stock: number }> {
  // 1. Actualizar catálogo local
  const itemIndex = localCatalog.findIndex((p) => p.id === productId);
  if (itemIndex >= 0) {
    localCatalog[itemIndex] = {
      ...localCatalog[itemIndex],
      stock: Math.max(0, newStock)
    };
  }

  // 2. Intentar actualizar en Supabase si está disponible
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${productId}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({ stock: Math.max(0, newStock) })
      });
    } catch {
      // Silencioso si no está la tabla creada
    }
  }

  return { success: true, stock: Math.max(0, newStock) };
}

export async function createStoreProduct(
  data: Omit<StoreProduct, 'id'> & { id?: string }
): Promise<StoreProduct> {
  const newProduct: StoreProduct = {
    ...data,
    id: data.id || `prod-${Date.now()}`,
    stock: Number(data.stock ?? 0),
    retail_price: Number(data.retail_price ?? 0),
    wholesale_price: Number(data.wholesale_price ?? 0),
    min_wholesale_qty: Number(data.min_wholesale_qty ?? 6),
    image_url:
      data.image_url ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    unit: data.unit || 'unidad',
    tags: data.tags || []
  };

  localCatalog.unshift(newProduct);

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(newProduct)
      });
    } catch {
      // Silencioso si no está disponible la tabla remota
    }
  }

  return newProduct;
}

export async function updateStoreProduct(
  id: string,
  data: Partial<StoreProduct>
): Promise<StoreProduct | null> {
  const index = localCatalog.findIndex((p) => p.id === id || p.sku === id);
  if (index === -1) return null;

  localCatalog[index] = {
    ...localCatalog[index],
    ...data,
    stock: data.stock !== undefined ? Number(data.stock) : localCatalog[index].stock,
    retail_price:
      data.retail_price !== undefined ? Number(data.retail_price) : localCatalog[index].retail_price,
    wholesale_price:
      data.wholesale_price !== undefined
        ? Number(data.wholesale_price)
        : localCatalog[index].wholesale_price,
    min_wholesale_qty:
      data.min_wholesale_qty !== undefined
        ? Number(data.min_wholesale_qty)
        : localCatalog[index].min_wholesale_qty
  };

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal'
        },
        body: JSON.stringify(data)
      });
    } catch {
      // Silencioso
    }
  }

  return localCatalog[index];
}

export async function deleteStoreProduct(id: string): Promise<boolean> {
  const index = localCatalog.findIndex((p) => p.id === id || p.sku === id);
  if (index !== -1) {
    localCatalog.splice(index, 1);
  }

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    } catch {
      // Silencioso
    }
  }

  return true;
}

