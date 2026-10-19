import { INITIAL_PRODUCTS } from '@/constants/initial-catalog';
import { StoreProduct, ProductSortOption } from '@/types/store';
import { PRODUCT_CATEGORIES, ProductCategory } from '@/constants/categories';

const DEFAULT_SUPABASE_URL = 'http://jg-store-bd.press-cloud.com';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.MHnaK-G4RLBfaybcOR7IOVsRj6WK5of1v3xooRJAObc';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.SUPABASE_HOST ? `http://${process.env.SUPABASE_HOST}` : DEFAULT_SUPABASE_URL);

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  DEFAULT_SUPABASE_ANON_KEY;

// Memoria local para cambios de stock en sesión cuando no esté la tabla en Supabase
let localCatalog: StoreProduct[] = [...INITIAL_PRODUCTS];

export interface FetchProductsOptions {
  category?: string;
  subcategory?: string;
  sub_subcategory?: string;
  search?: string;
  sort?: ProductSortOption;
  onlyInStock?: boolean;
  stockStatus?: string;
}

import { performSmartSearch, SearchMatchMetadata } from './search-engine';

export interface FetchProductsResult {
  products: StoreProduct[];
  searchMetadata?: SearchMatchMetadata;
}

export async function fetchStoreProductsWithMeta(
  options: FetchProductsOptions = {}
): Promise<FetchProductsResult> {
  const {
    category,
    subcategory,
    sub_subcategory,
    search,
    sort = 'popular',
    onlyInStock = false,
    stockStatus
  } = options;

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
            cost_price: Number(item.cost_price ?? Math.round(Number(item.retail_price || 0) / 1.4)),
            retail_margin_pct: Number(item.retail_margin_pct ?? 40),
            wholesale_margin_pct: Number(item.wholesale_margin_pct ?? 18),
            supplier_code: item.supplier_code,
            barcode: item.barcode,
            full_category_path: item.full_category_path,
            category_levels: item.category_levels,
            depth_level: item.depth_level,
            min_wholesale_qty: Number(item.min_wholesale_qty || 6),
            stock: Number(item.stock || 0),
            image_url:
              item.image_url ||
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
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
  } else {
    // Si la BD tiene registros, sincronizar cualquier producto creado en memoria local
    const remoteSkus = new Set(products.map((p) => p.sku));
    const remoteIds = new Set(products.map((p) => p.id));
    const localNew = localCatalog.filter(
      (p) => !remoteIds.has(p.id) && (!p.sku || !remoteSkus.has(p.sku))
    );
    if (localNew.length > 0) {
      products = [...localNew, ...products];
    }

    // Aplicar márgenes locales si se han ajustado en la sesión
    const localMarginMap = new Map(localCatalog.map((p) => [p.sku, p]));
    products = products.map((prod) => {
      const local = localMarginMap.get(prod.sku);
      if (local && (local.retail_margin_pct !== undefined || local.wholesale_margin_pct !== undefined)) {
        return {
          ...prod,
          retail_margin_pct: local.retail_margin_pct,
          wholesale_margin_pct: local.wholesale_margin_pct,
          retail_price: local.retail_price,
          wholesale_price: local.wholesale_price
        };
      }
      return prod;
    });
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
    // Si hay categoría / subcategoría seleccionada, filtramos primero ese grupo
    let pool = products;
    if (category && category !== 'all') {
      pool = pool.filter((p) => p.category_slug === category);
    }
    if (subcategory && subcategory !== 'all') {
      pool = pool.filter((p) => p.subcategory_slug === subcategory);
    }
    if (sub_subcategory && sub_subcategory !== 'all') {
      pool = pool.filter((p) => p.sub_subcategory_slug === sub_subcategory);
    }

    let smartRes = performSmartSearch(pool, search);

    // Si dentro del filtro no hubo nada, buscamos en todo el catálogo
    if (
      smartRes.products.length === 0 &&
      ((category && category !== 'all') ||
        (subcategory && subcategory !== 'all') ||
        (sub_subcategory && sub_subcategory !== 'all'))
    ) {
      smartRes = performSmartSearch(allAvailableProducts, search);
    }

    products = smartRes.products;
    searchMetadata = smartRes.metadata;
  }

  // 3. Filtrar stock
  if (stockStatus && stockStatus !== 'all') {
    if (stockStatus === 'in_stock') {
      products = products.filter((p) => p.stock > 0);
    } else if (stockStatus === 'low_stock') {
      products = products.filter((p) => p.stock > 0 && p.stock <= 10);
    } else if (stockStatus === 'out_of_stock') {
      products = products.filter((p) => p.stock <= 0);
    }
  } else if (onlyInStock) {
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
  const mockMatch = INITIAL_PRODUCTS.find((p) => p.id === id);
  return (
    all.find((p) => p.id === id || p.sku === id || (mockMatch && p.sku === mockMatch.sku)) ||
    localCatalog.find((p) => p.id === id || p.sku === id) ||
    null
  );
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
      data.retail_price !== undefined
        ? Number(data.retail_price)
        : localCatalog[index].retail_price,
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

export interface UpdateMarginsOptions {
  scope: 'all' | 'category';
  category?: string;
  retailMargin?: number;
  wholesaleMargin?: number;
}

export async function updateStoreProductMarginsMassive(
  options: UpdateMarginsOptions
): Promise<{ success: boolean; updated_count: number; message: string }> {
  const { scope, category, retailMargin, wholesaleMargin } = options;

  let count = 0;

  // 1. Actualizar memoria local
  localCatalog = localCatalog.map((prod) => {
    const matchesScope =
      scope === 'all' ||
      !category ||
      category === 'all' ||
      prod.category_slug === category ||
      prod.subcategory_slug === category ||
      prod.sub_subcategory_slug === category;

    if (!matchesScope) return prod;

    const cost = prod.cost_price || Math.round(prod.retail_price / 1.4);
    const newRetailMargin =
      retailMargin !== undefined ? retailMargin : (prod.retail_margin_pct ?? 40);
    const newWholesaleMargin =
      wholesaleMargin !== undefined ? wholesaleMargin : (prod.wholesale_margin_pct ?? 18);

    const newRetailPrice =
      retailMargin !== undefined
        ? Math.round(cost * (1 + newRetailMargin / 100))
        : prod.retail_price;
    const newWholesalePrice =
      wholesaleMargin !== undefined
        ? Math.round(cost * (1 + newWholesaleMargin / 100))
        : prod.wholesale_price;

    count++;
    return {
      ...prod,
      cost_price: cost,
      retail_margin_pct: newRetailMargin,
      wholesale_margin_pct: newWholesaleMargin,
      retail_price: newRetailPrice,
      wholesale_price: newWholesalePrice
    };
  });

  // 2. Si hay conexión con Supabase Dokploy, ejecutar RPC o actualización
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const rpcEndpoint = `${SUPABASE_URL}/rest/v1/rpc/recalculate_product_margins`;
      const res = await fetch(rpcEndpoint, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_scope: scope,
          p_category_id: category || null,
          p_retail_margin: retailMargin ?? null,
          p_wholesale_margin: wholesaleMargin ?? null
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.updated_count === 'number') {
          count = data.updated_count;
        }
      }
    } catch {
      // Fallback
    }
  }

  return {
    success: true,
    updated_count: count,
    message: `Se recalcularon exitosamente ${count} productos con nuevos márgenes.`
  };
}

export async function fetchStoreCategories(): Promise<ProductCategory[]> {
  const categoriesMap = new Map<string, ProductCategory>(
    PRODUCT_CATEGORIES.map((c) => [
      c.slug,
      {
        ...c,
        subcategories: (c.subcategories || []).map((sub) => ({
          ...sub,
          sub_subcategories: [...(sub.sub_subcategories || [])]
        }))
      }
    ])
  );

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      // 1. Obtener subcategorías dinámicas de Supabase
      const res = await fetch(`${SUPABASE_URL}/rest/v1/subcategories?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const dbSubs = await res.json();
        for (const sub of dbSubs) {
          const categorySlug = sub.category_id || sub.category_slug;
          const cat = categoriesMap.get(categorySlug);
          if (cat) {
            const existingSub = cat.subcategories?.find(
              (s) => s.slug === sub.slug || s.id === sub.id
            );
            if (!existingSub) {
              cat.subcategories = cat.subcategories || [];
              cat.subcategories.push({
                id: sub.id,
                category_id: categorySlug,
                category_slug: categorySlug,
                slug: sub.slug,
                name: sub.name,
                description: sub.description || sub.name,
                icon: sub.icon || cat.icon || 'tag',
                display_order: sub.display_order ?? (cat.subcategories.length || 0) + 1,
                sub_subcategories: []
              });
            }
          }
        }
      }

      // 2. Obtener sub_subcategorías dinámicas de Supabase
      const resLines = await fetch(`${SUPABASE_URL}/rest/v1/sub_subcategories?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        },
        cache: 'no-store'
      });

      if (resLines.ok) {
        const dbLines = await resLines.json();
        for (const line of dbLines) {
          for (const cat of categoriesMap.values()) {
            const sub = cat.subcategories?.find(
              (s) => s.id === line.subcategory_id || s.slug === line.subcategory_slug
            );
            if (sub) {
              const existingLine = sub.sub_subcategories?.find(
                (l) => l.slug === line.slug || l.id === line.id
              );
              if (!existingLine) {
                sub.sub_subcategories = sub.sub_subcategories || [];
                sub.sub_subcategories.push({
                  id: line.id,
                  subcategory_id: sub.id,
                  subcategory_slug: sub.slug,
                  category_slug: cat.slug,
                  slug: line.slug,
                  name: line.name,
                  description: line.description || line.name,
                  display_order: line.display_order ?? (sub.sub_subcategories.length || 0) + 1
                });
              }
            }
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  return Array.from(categoriesMap.values());
}

