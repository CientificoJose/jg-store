/**
 * =====================================================================
 * JG STORE - AUDITORÍA DE IMÁGENES DE PRODUCTOS
 * =====================================================================
 * Permite analizar qué productos del catálogo tienen imagen real disponible
 * y cuáles carecen de imagen o tienen una URL rota / no encontrada en Storage.
 */

export interface ProductImageAuditItem {
  id: string;
  sku: string;
  name: string;
  category_name?: string;
  category_slug?: string;
  image_url: string | null;
  status: 'with_image' | 'missing_image' | 'broken_storage';
  storage_file_name?: string;
  reason?: string;
}

export interface ProductImageAuditSummary {
  total_products: number;
  with_image: number;
  missing_image: number;
  broken_storage: number;
  total_effective_images: number;
  total_missing_effective: number;
  percentage_with_image: number;
  storage_files_count: number;
  audited_at: string;
}

export interface ProductImageAuditResult {
  summary: ProductImageAuditSummary;
  products_with_image: ProductImageAuditItem[];
  products_without_image: ProductImageAuditItem[];
  products_broken_storage: ProductImageAuditItem[];
}

export interface AuditOptions {
  verifyStorage?: boolean; // Si es true, verifica que el archivo exista en Supabase Storage
  category?: string;
  search?: string;
}

const DEFAULT_SUPABASE_URL = 'https://jg-store-bd.press-cloud.com';
const DEFAULT_SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

function getSupabaseConfig() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PUBLIC_URL ||
    (process.env.SUPABASE_HOST ? `https://${process.env.SUPABASE_HOST}` : DEFAULT_SUPABASE_URL);

  const url = rawUrl.replace(/^http:\/\//i, 'https://');
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    DEFAULT_SUPABASE_KEY;

  return { url, key };
}

/**
 * Obtiene todos los productos desde Supabase PostgREST
 */
async function fetchAllProducts(url: string, key: string, options?: AuditOptions) {
  let all: any[] = [];
  let page = 0;
  const limit = 1000;

  let query = 'select=id,sku,name,image_url,category_name,category_slug&order=sku.asc';
  if (options?.category) {
    query += `&category_slug=eq.${encodeURIComponent(options.category)}`;
  }
  if (options?.search) {
    query += `&name=ilike.*${encodeURIComponent(options.search)}*`;
  }

  while (true) {
    const res = await fetch(`${url}/rest/v1/products?${query}&limit=${limit}&offset=${page * limit}`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.warn('[product-audit] Error al consultar productos:', res.status, await res.text());
      break;
    }

    const batch = await res.json();
    if (!batch || batch.length === 0) break;
    all = all.concat(batch);
    if (batch.length < limit) break;
    page++;
  }

  return all;
}

/**
 * Obtiene todos los nombres de archivo guardados en el bucket 'products' de Supabase Storage
 */
async function fetchAllStorageFiles(url: string, key: string): Promise<Set<string>> {
  const allFiles = new Set<string>();
  let offset = 0;
  const limit = 1000;

  while (true) {
    try {
      const res = await fetch(`${url}/storage/v1/object/list/products`, {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: '',
          limit,
          offset
        }),
        cache: 'no-store'
      });

      if (!res.ok) {
        console.warn('[product-audit] Error listando storage:', res.status);
        break;
      }

      const items = await res.json();
      if (!items || !Array.isArray(items) || items.length === 0) break;

      for (const item of items) {
        if (item.name) {
          allFiles.add(item.name.toLowerCase().trim());
        }
      }

      if (items.length < limit) break;
      offset += limit;
    } catch (err) {
      console.warn('[product-audit] Excepción al listar storage:', err);
      break;
    }
  }

  return allFiles;
}

/**
 * Función principal para auditar qué productos tienen imagen y cuáles no.
 */
export async function auditProductImages(options: AuditOptions = {}): Promise<ProductImageAuditResult> {
  const { verifyStorage = true } = options;
  const { url, key } = getSupabaseConfig();

  // Consultar en paralelo productos y lista de archivos de storage
  const [products, storageFiles] = await Promise.all([
    fetchAllProducts(url, key, options),
    verifyStorage ? fetchAllStorageFiles(url, key) : Promise.resolve(new Set<string>())
  ]);

  const withImage: ProductImageAuditItem[] = [];
  const withoutImage: ProductImageAuditItem[] = [];
  const brokenStorage: ProductImageAuditItem[] = [];

  for (const p of products) {
    const rawUrl = p.image_url ? String(p.image_url).trim() : '';
    const isUnsplash = rawUrl.includes('unsplash.com');
    const isHttp = rawUrl.startsWith('http://') || rawUrl.startsWith('https://');

    // 1. Producto sin imagen definida o con imagen de relleno genérica
    if (!rawUrl || isUnsplash || !isHttp) {
      withoutImage.push({
        id: String(p.id),
        sku: p.sku || `JG-${p.id}`,
        name: p.name || 'Sin nombre',
        category_name: p.category_name,
        category_slug: p.category_slug,
        image_url: rawUrl || null,
        status: 'missing_image',
        reason: !rawUrl ? 'URL vacía o no definida' : 'Imagen fallback genérica de Unsplash'
      });
      continue;
    }

    // 2. Si apunta al Storage de Supabase
    if (rawUrl.includes('/storage/v1/object/public/products/')) {
      const parts = rawUrl.split('/storage/v1/object/public/products/');
      const fileName = parts[1] ? decodeURIComponent(parts[1]).toLowerCase().trim() : '';

      if (verifyStorage) {
        // Verificar existencia real en el bucket de storage
        if (storageFiles.has(fileName)) {
          withImage.push({
            id: String(p.id),
            sku: p.sku,
            name: p.name,
            category_name: p.category_name,
            category_slug: p.category_slug,
            image_url: rawUrl,
            status: 'with_image',
            storage_file_name: fileName
          });
        } else {
          brokenStorage.push({
            id: String(p.id),
            sku: p.sku,
            name: p.name,
            category_name: p.category_name,
            category_slug: p.category_slug,
            image_url: rawUrl,
            status: 'broken_storage',
            storage_file_name: fileName,
            reason: `El archivo ${fileName} no existe en el bucket de Storage (error 404)`
          });
        }
      } else {
        // Solo validación de URL sin verificar existencia en disco
        withImage.push({
          id: String(p.id),
          sku: p.sku,
          name: p.name,
          category_name: p.category_name,
          category_slug: p.category_slug,
          image_url: rawUrl,
          status: 'with_image',
          storage_file_name: fileName
        });
      }
    } else {
      // 3. URL externa válida (ej. imgcoronel u otro host de imágenes)
      withImage.push({
        id: String(p.id),
        sku: p.sku,
        name: p.name,
        category_name: p.category_name,
        category_slug: p.category_slug,
        image_url: rawUrl,
        status: 'with_image'
      });
    }
  }

  const total = products.length;
  const totalEffectiveWithImage = withImage.length;
  const totalEffectiveMissing = withoutImage.length + brokenStorage.length;
  const percentage = total > 0 ? Number(((totalEffectiveWithImage / total) * 100).toFixed(1)) : 0;

  return {
    summary: {
      total_products: total,
      with_image: withImage.length,
      missing_image: withoutImage.length,
      broken_storage: brokenStorage.length,
      total_effective_images: totalEffectiveWithImage,
      total_missing_effective: totalEffectiveMissing,
      percentage_with_image: percentage,
      storage_files_count: storageFiles.size,
      audited_at: new Date().toISOString()
    },
    products_with_image: withImage,
    products_without_image: withoutImage,
    products_broken_storage: brokenStorage
  };
}

/**
 * Retorna únicamente los productos que carecen de imagen disponible
 */
export async function getProductsWithoutImage(options: AuditOptions = {}): Promise<ProductImageAuditItem[]> {
  const audit = await auditProductImages(options);
  return [...audit.products_without_image, ...audit.products_broken_storage];
}

/**
 * Retorna únicamente los productos que tienen imagen confirmada y funcionando
 */
export async function getProductsWithImage(options: AuditOptions = {}): Promise<ProductImageAuditItem[]> {
  const audit = await auditProductImages(options);
  return audit.products_with_image;
}
