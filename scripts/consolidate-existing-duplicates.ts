/**
 * Script de consolidación de duplicados existentes en Supabase.
 * Identifica productos que fueron cargados como tarjetas separadas con sufijos de color
 * (ej: WIL272679-AZUL, WIL272679-ROJO o CHI-273075-GRIS),
 * los agrupa bajo un único producto padre con su código base limpio,
 * migra los colores a la tabla `public.product_variants`,
 * actualiza la galería de fotos combinada y elimina los duplicados redundantes.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

const HEADERS = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json'
};

const COMMON_COLORS = [
  'AZUL', 'ROJO', 'NEGRO', 'BLANCO', 'VERDE', 'AMARILLO', 'ROSA', 'GRIS',
  'CELESTE', 'NARANJA', 'VIOLETA', 'LILA', 'BEIGE', 'MARRON', 'TURQUESA',
  'FUCSIA', 'DORADO', 'PLATEADO', 'SURTIDO', 'SURTIDOS', 'ESTAMPADO',
  'MULTICOLOR', 'BORDO', 'AQUA', 'CORAL', 'OCRE', 'PETROLEO', 'CAMEL'
];

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  description?: string;
  image_url: string;
  images?: string[];
  stock: number;
  cost_price?: number;
  retail_price?: number;
  wholesale_price?: number;
}

function parseBaseSkuAndColor(sku: string): { baseSku: string; color: string | null } {
  const parts = sku.split('-');
  if (parts.length >= 2) {
    const lastPart = parts[parts.length - 1].toUpperCase().trim();
    if (COMMON_COLORS.includes(lastPart)) {
      const baseSku = parts.slice(0, -1).join('-');
      return { baseSku, color: lastPart };
    }
  }
  return { baseSku: sku, color: null };
}

async function main() {
  console.log('🔍 Iniciando análisis de productos duplicados en Supabase...');

  // 1. Obtener todos los productos
  let allProducts: ProductRow[] = [];
  let from = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const res = await fetch(`${BASE_URL}/rest/v1/products?select=id,sku,name,description,image_url,images,stock,cost_price,retail_price,wholesale_price&limit=${batchSize}&offset=${from}`, {
      headers: HEADERS
    });
    if (!res.ok) {
      throw new Error(`Error consultando productos: ${res.statusText}`);
    }
    const batch: ProductRow[] = await res.json();
    allProducts.push(...batch);
    if (batch.length < batchSize) {
      hasMore = false;
    } else {
      from += batchSize;
    }
  }

  console.log(`📦 Total de productos analizados: ${allProducts.length}`);

  // 2. Agrupar por baseSku
  const groups = new Map<string, ProductRow[]>();

  for (const prod of allProducts) {
    const { baseSku } = parseBaseSkuAndColor(prod.sku);
    if (!groups.has(baseSku)) {
      groups.set(baseSku, []);
    }
    groups.get(baseSku)!.push(prod);
  }

  // Filtrar solo grupos con duplicados (> 1 producto)
  const duplicateGroups = Array.from(groups.entries()).filter(([_, prods]) => prods.length > 1);
  console.log(`🎯 Grupos de productos con variantes duplicadas detectados: ${duplicateGroups.length}`);

  let totalMergedVariants = 0;
  let totalDeletedDuplicates = 0;

  for (const [baseSku, prods] of duplicateGroups) {
    // Escoger el producto principal (preferir el que no tenga sufijo de color o el primero)
    let parent = prods.find((p) => p.sku === baseSku) || prods[0];
    const duplicates = prods.filter((p) => p.id !== parent.id);

    console.log(`\n🔄 Procesando: SKU Base "${baseSku}" (${prods.length} variantes/duplicados)`);
    console.log(`   Padre: ID ${parent.id} | SKU actual: ${parent.sku}`);

    // Si el padre tenía sufijo de color, actualizar su SKU al SKU base limpio
    if (parent.sku !== baseSku) {
      await fetch(`${BASE_URL}/rest/v1/products?id=eq.${parent.id}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ sku: baseSku, has_variants: true })
      });
      parent.sku = baseSku;
    }

    // Recopilar todas las imágenes de todos los duplicados
    const allGalleryUrls: string[] = [];
    if (parent.image_url) allGalleryUrls.push(parent.image_url);
    if (Array.isArray(parent.images)) allGalleryUrls.push(...parent.images);

    for (const dup of duplicates) {
      if (dup.image_url) allGalleryUrls.push(dup.image_url);
      if (Array.isArray(dup.images)) allGalleryUrls.push(...dup.images);
    }
    const uniqueGallery = Array.from(new Set(allGalleryUrls.filter(Boolean)));

    // Crear variantes en public.product_variants para cada uno de los productos del grupo
    for (const item of prods) {
      const { color } = parseBaseSkuAndColor(item.sku);
      const variantColor = color || 'ESTÁNDAR';
      const variantSku = `${baseSku}-${variantColor}`;

      const variantPayload = {
        product_id: parent.id,
        variant_sku: variantSku,
        attribute_color: variantColor,
        image_url: item.image_url || parent.image_url,
        stock: Math.max(1, Number(item.stock || 1)),
        price_adjustment: 0,
        updated_at: new Date().toISOString()
      };

      const vRes = await fetch(`${BASE_URL}/rest/v1/product_variants`, {
        method: 'POST',
        headers: {
          ...HEADERS,
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(variantPayload)
      });

      if (vRes.ok) {
        totalMergedVariants++;
        console.log(`   ✨ Variante registrada: ${variantSku} (Color: ${variantColor})`);
      }
    }

    // Actualizar producto padre con has_variants y la galería completa
    await fetch(`${BASE_URL}/rest/v1/products?id=eq.${parent.id}`, {
      method: 'PATCH',
      headers: HEADERS,
      body: JSON.stringify({
        has_variants: true,
        images: uniqueGallery,
        image_url: uniqueGallery[0] || parent.image_url
      })
    });

    // Eliminar los duplicados redundantes de la tabla products
    for (const dup of duplicates) {
      const delRes = await fetch(`${BASE_URL}/rest/v1/products?id=eq.${dup.id}`, {
        method: 'DELETE',
        headers: HEADERS
      });
      if (delRes.ok) {
        totalDeletedDuplicates++;
        console.log(`   🗑️ Duplicado eliminado de products: ${dup.sku} (ID: ${dup.id})`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 CONSOLIDACIÓN COMPLETADA CON ÉXITO:');
  console.log(`   • Variantes guardadas en product_variants: ${totalMergedVariants}`);
  console.log(`   • Productos duplicados eliminados:         ${totalDeletedDuplicates}`);
  console.log('='.repeat(60));
}

main().catch(console.error);

export {};
