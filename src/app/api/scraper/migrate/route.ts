import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { uploadImageToSupabaseStorage, ensureProductsBucketExists } from '@/lib/supabase-storage';

const execAsync = promisify(exec);

const SCRAPER_AUTH_TOKEN = process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.SUPABASE_HOST
    ? `http://${process.env.SUPABASE_HOST}`
    : 'http://jg-store-bd.press-cloud.com');

const SUPABASE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  '';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

function toSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      category = 'all',
      default_retail_margin = 40,
      default_wholesale_margin = 18,
      limit
    } = body;

    let productsToMigrate: any[] = [];

    // 1. Obtener productos de Scraper (Remoto o Local SQLite)
    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const catParam =
          category && category !== 'all' ? `&category=${encodeURIComponent(category)}` : '';
        const limitParam = limit ? `&limit=${limit}` : '';
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/products?all_products=true&token=${SCRAPER_AUTH_TOKEN}${catParam}${limitParam}`;

        const res = await fetch(remoteUrl, {
          headers: { Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}` },
          cache: 'no-store'
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.latest_products) && data.latest_products.length > 0) {
            productsToMigrate = data.latest_products;
          }
        }
      } catch (err) {
        console.warn('Scraper remoto no respondió o falló, recurriendo a SQLite local:', err);
      }
    }

    // Fallback: Ejecutar exportador local SQLite
    if (productsToMigrate.length === 0) {
      const baseDir = path.join(process.cwd(), 'scraping-coronel');
      const scriptPath = path.join(baseDir, 'export_products_json.py');
      const pythonBin = process.env.PYTHON_BIN || 'python3';

      const catArg = category && category !== 'all' ? `--category "${category}"` : '';
      const limitArg = limit ? `--limit ${limit}` : '';

      const { stdout } = await execAsync(`"${pythonBin}" "${scriptPath}" ${catArg} ${limitArg}`, {
        cwd: baseDir,
        maxBuffer: 50 * 1024 * 1024
      });

      productsToMigrate = JSON.parse(stdout.trim() || '[]');
    }

    if (productsToMigrate.length === 0) {
      return Response.json(
        {
          success: false,
          message: 'No se encontraron productos en SQLite ni en el scraper para migrar.'
        },
        { status: 404 }
      );
    }

    // 2. Cargar estado actual de Supabase (Categorías, Subcategorías, Sub-subcategorías y Productos existentes)
    const headers: Record<string, string> = {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };

    const [catRes, subRes, subSubRes, prodRes] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/categories?select=id,slug,name`, {
        headers,
        cache: 'no-store'
      }),
      fetch(`${SUPABASE_URL}/rest/v1/subcategories?select=id,category_id,category_slug,slug,name`, {
        headers,
        cache: 'no-store'
      }),
      fetch(
        `${SUPABASE_URL}/rest/v1/sub_subcategories?select=id,subcategory_id,subcategory_slug,category_slug,slug,name`,
        { headers, cache: 'no-store' }
      ),
      fetch(`${SUPABASE_URL}/rest/v1/products?select=id,sku`, { headers, cache: 'no-store' })
    ]);

    const existingCategories: any[] = catRes.ok ? await catRes.json() : [];
    const existingSubcategories: any[] = subRes.ok ? await subRes.json() : [];
    const existingSubSubcategories: any[] = subSubRes.ok ? await subSubRes.json() : [];
    const existingProducts: any[] = prodRes.ok ? await prodRes.json() : [];

    // Mapas de búsqueda rápida
    const catBySlug = new Map<string, any>();
    const catByName = new Map<string, any>();
    for (const c of existingCategories) {
      if (c.slug) catBySlug.set(c.slug.toLowerCase(), c);
      if (c.name) catByName.set(c.name.toLowerCase().trim(), c);
    }

    const subByKey = new Map<string, any>();
    const subByName = new Map<string, any>();
    for (const s of existingSubcategories) {
      subByKey.set(`${s.category_id}__${s.slug}`, s);
      subByName.set(`${s.category_id}__${s.name.toLowerCase().trim()}`, s);
    }

    const subSubByKey = new Map<string, any>();
    const subSubByName = new Map<string, any>();
    for (const ss of existingSubSubcategories) {
      subSubByKey.set(`${ss.subcategory_id}__${ss.slug}`, ss);
      subSubByName.set(`${ss.subcategory_id}__${ss.name.toLowerCase().trim()}`, ss);
    }

    const prodBySku = new Map<string, any>();
    for (const p of existingProducts) {
      if (p.sku) prodBySku.set(p.sku.trim(), p);
    }

    const createdCategories: string[] = [];
    const createdSubcategories: string[] = [];
    const createdSubSubcategories: string[] = [];
    let insertedProducts = 0;
    let updatedProducts = 0;

    await ensureProductsBucketExists();

    // 3. Procesar cada producto migrando categorías y upserting
    for (const p of productsToMigrate) {
      const sku = (p.codigo || p.sku || '').trim();
      if (!sku) continue;

      // Obtener o inferir niveles de categoría
      let levels: string[] = [];
      if (Array.isArray(p.categoria_niveles) && p.categoria_niveles.length > 0) {
        levels = p.categoria_niveles;
      } else if (p.categoria_ruta && typeof p.categoria_ruta === 'string') {
        levels = p.categoria_ruta
          .split('>')
          .map((s: string) => s.trim())
          .filter(Boolean);
      } else {
        levels = [p.categoria, p.subcategoria, p.sub_subcategoria].filter(Boolean);
      }

      if (levels.length === 0) {
        levels = ['General'];
      }

      const rawL1 = levels[0];
      const rawL2 = levels.length > 1 ? levels[1] : null;
      const rawL3 = levels.length > 2 ? levels[2] : null;

      // --- NIVEL 1: Categoría Principal ---
      const l1Slug = toSlug(rawL1);
      let cat = catByName.get(rawL1.toLowerCase().trim()) || catBySlug.get(l1Slug);
      if (!cat) {
        const newCat = {
          id: l1Slug,
          slug: l1Slug,
          name: rawL1,
          description: `Catálogo oficial de ${rawL1}`,
          icon: 'package',
          display_order: 95
        };
        try {
          const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
            method: 'POST',
            headers: { ...headers, Prefer: 'return=representation' },
            body: JSON.stringify(newCat)
          });
          if (insertRes.ok) {
            const [saved] = await insertRes.json();
            cat = saved || newCat;
          } else {
            cat = newCat;
          }
        } catch {
          cat = newCat;
        }
        catBySlug.set(l1Slug, cat);
        catByName.set(rawL1.toLowerCase().trim(), cat);
        createdCategories.push(rawL1);
      }

      // --- NIVEL 2: Subcategoría ---
      let sub: any = null;
      if (rawL2 && cat) {
        const l2Slug = toSlug(rawL2);
        const subKey = `${cat.id}__${l2Slug}`;
        const subNameKey = `${cat.id}__${rawL2.toLowerCase().trim()}`;
        sub = subByName.get(subNameKey) || subByKey.get(subKey);

        if (!sub) {
          const subId = `sub-${cat.slug}-${l2Slug}`.slice(0, 50);
          const newSub = {
            id: subId,
            category_id: cat.id,
            category_slug: cat.slug,
            slug: l2Slug,
            name: rawL2,
            description: `Subcategoría ${rawL2}`,
            display_order: 1
          };
          try {
            const insertSubRes = await fetch(`${SUPABASE_URL}/rest/v1/subcategories`, {
              method: 'POST',
              headers: { ...headers, Prefer: 'return=representation' },
              body: JSON.stringify(newSub)
            });
            if (insertSubRes.ok) {
              const [saved] = await insertSubRes.json();
              sub = saved || newSub;
            } else {
              sub = newSub;
            }
          } catch {
            sub = newSub;
          }
          subByKey.set(subKey, sub);
          subByName.set(subNameKey, sub);
          createdSubcategories.push(rawL2);
        }
      }

      // --- NIVEL 3: Sub-subcategoría (Línea) ---
      let subSub: any = null;
      if (rawL3 && sub && cat) {
        const l3Slug = toSlug(rawL3);
        const subSubKey = `${sub.id}__${l3Slug}`;
        const subSubNameKey = `${sub.id}__${rawL3.toLowerCase().trim()}`;
        subSub = subSubByName.get(subSubNameKey) || subSubByKey.get(subSubKey);

        if (!subSub) {
          const subSubId = `line-${sub.id}-${l3Slug}`.slice(0, 50);
          const newSubSub = {
            id: subSubId,
            subcategory_id: sub.id,
            subcategory_slug: sub.slug,
            category_slug: cat.slug,
            slug: l3Slug,
            name: rawL3,
            description: `Línea de producto: ${rawL3}`,
            display_order: 1
          };
          try {
            const insertSubSubRes = await fetch(`${SUPABASE_URL}/rest/v1/sub_subcategories`, {
              method: 'POST',
              headers: { ...headers, Prefer: 'return=representation' },
              body: JSON.stringify(newSubSub)
            });
            if (insertSubSubRes.ok) {
              const [saved] = await insertSubSubRes.json();
              subSub = saved || newSubSub;
            } else {
              subSub = newSubSub;
            }
          } catch {
            subSub = newSubSub;
          }
          subSubByKey.set(subSubKey, subSub);
          subSubByName.set(subSubNameKey, subSub);
          createdSubSubcategories.push(rawL3);
        }
      }

      // --- CÁLCULO DE PRECIOS Y MÁRGENES ---
      let costPrice = Number(p.precio_costo || 0);
      if (!costPrice && p.precio) {
        const cleaned = String(p.precio)
          .replace(/[^0-9,-]/g, '')
          .replace(',', '.');
        costPrice = parseFloat(cleaned) || 0;
      }

      const retailMargin = Number(p.margen_minorista ?? default_retail_margin ?? 40);
      const wholesaleMargin = Number(p.margen_mayorista ?? default_wholesale_margin ?? 18);

      const retailPrice =
        p.precio_minorista && Number(p.precio_minorista) > 0
          ? Number(p.precio_minorista)
          : Math.round(costPrice * (1 + retailMargin / 100));

      const wholesalePrice =
        p.precio_mayorista && Number(p.precio_mayorista) > 0
          ? Number(p.precio_mayorista)
          : Math.round(costPrice * (1 + wholesaleMargin / 100));

      // --- PROCESAMIENTO DE GALERÍA Y FOTOS EN SUPABASE STORAGE ---
      let gallerySources: string[] = [];
      if (Array.isArray(p.imagenes_galeria)) {
        gallerySources = p.imagenes_galeria;
      } else if (typeof p.imagenes_galeria === 'string' && p.imagenes_galeria.startsWith('[')) {
        try {
          gallerySources = JSON.parse(p.imagenes_galeria);
        } catch {}
      } else if (Array.isArray(p.images)) {
        gallerySources = p.images;
      }

      const uploadedGallery: string[] = [];
      if (gallerySources.length > 0) {
        for (let i = 0; i < gallerySources.length; i++) {
          const rawSrc = gallerySources[i];
          if (!rawSrc) continue;
          if (rawSrc.includes('/storage/v1/object/public/products/')) {
            uploadedGallery.push(rawSrc);
          } else {
            const suffix = i === 0 ? '' : `_${i}`;
            const uploaded = await uploadImageToSupabaseStorage(rawSrc, `${sku}${suffix}.jpg`);
            if (uploaded) uploadedGallery.push(uploaded);
          }
        }
      }

      let rawImageSrc =
        p.imagen_url ||
        (p.foto ? `/api/scraper/image?file=${encodeURIComponent(p.foto)}` : null) ||
        '';

      let imageUrl = uploadedGallery[0] || '';
      if (!imageUrl && rawImageSrc) {
        if (!rawImageSrc.includes('/storage/v1/object/public/products/')) {
          imageUrl = await uploadImageToSupabaseStorage(rawImageSrc, `${sku}.jpg`);
        } else {
          imageUrl = rawImageSrc;
        }
        if (imageUrl && !uploadedGallery.includes(imageUrl)) {
          uploadedGallery.unshift(imageUrl);
        }
      }

      if (!imageUrl) {
        imageUrl =
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
      }

      // --- MARCA AUTÉNTICA (DESDE NIVEL 4 O CAMPO MARCA) ---
      let cleanBrand = '';
      if (p.marca && typeof p.marca === 'string' && p.marca.trim()) {
        cleanBrand = p.marca.trim();
      } else if (levels.length > 3 && levels[3]) {
        cleanBrand = levels[3].trim();
      } else if (p.brand && typeof p.brand === 'string') {
        cleanBrand = p.brand.trim();
      } else {
        cleanBrand = p.variante ? `Coronel (${p.variante})` : 'Coronel';
      }

      const productPayload: Record<string, any> = {
        sku,
        name: p.descripcion || p.name || sku,
        description: p.descripcion || p.name || '',
        category_id: cat?.id || null,
        category_slug: cat?.slug || null,
        category_name: cat?.name || null,
        subcategory_id: sub?.id || null,
        subcategory_slug: sub?.slug || null,
        subcategory_name: sub?.name || null,
        sub_subcategory_id: subSub?.id || null,
        sub_subcategory_slug: subSub?.slug || null,
        sub_subcategory_name: subSub?.name || null,
        retail_price: retailPrice,
        wholesale_price: wholesalePrice,
        cost_price: Number(p.precio_costo || p.cost_price || 0),
        barcode: p.codigo_barra || p.barcode || null,
        supplier_code: p.supplier_code || p.codigo || null,
        min_wholesale_qty: 6,
        stock: Number(p.stock ?? 10),
        image_url: imageUrl,
        images: uploadedGallery.length > 0 ? uploadedGallery : [imageUrl],
        unit: 'unidad',
        brand: cleanBrand,
        featured: false,
        is_seasonal: false,
        tags: [cat?.name, sub?.name, subSub?.name, cleanBrand].filter(Boolean),
        updated_at: new Date().toISOString()
      };

      // --- UPSERT EN PRODUCTOS ---
      const existing = prodBySku.get(sku);
      if (existing) {
        // Actualización PATCH
        try {
          const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${existing.id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(productPayload)
          });
          if (patchRes.ok) {
            updatedProducts++;
          }
        } catch (err) {
          console.error(`Error actualizando producto ${sku}:`, err);
        }
      } else {
        // Inserción POST
        try {
          const newId = crypto.randomUUID();
          const insertPayload = { ...productPayload, id: newId };
          const postRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
            method: 'POST',
            headers,
            body: JSON.stringify(insertPayload)
          });
          if (postRes.ok) {
            prodBySku.set(sku, { id: newId, sku });
            insertedProducts++;
          }
        } catch (err) {
          console.error(`Error insertando nuevo producto ${sku}:`, err);
        }
      }
    }

    return Response.json({
      success: true,
      migrated_products: insertedProducts + updatedProducts,
      inserted_products: insertedProducts,
      updated_products: updatedProducts,
      created_categories: createdCategories.length,
      created_subcategories: createdSubcategories.length,
      created_sub_subcategories: createdSubSubcategories.length,
      categories_list: createdCategories,
      message: `¡Migración completada! ${insertedProducts} productos nuevos registrados y ${updatedProducts} actualizados en el catálogo oficial de JG Store.`
    });
  } catch (error: any) {
    console.error('Error durante la migración de productos:', error);
    return Response.json(
      { success: false, error: error.message || 'Error desconocido durante la migración' },
      { status: 500 }
    );
  }
}
