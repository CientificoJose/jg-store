import fs from 'fs';
import path from 'path';
import { INITIAL_PRODUCTS } from '../src/constants/initial-catalog';
import { PRODUCT_CATEGORIES } from '../src/constants/categories';

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://jg-store-bd.press-cloud.com';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';
const ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6ImFub24iLCJpc3MiOiJzdXBhYmFzZSJ9.MHnaK-G4RLBfaybcOR7IOVsRj6WK5of1v3xooRJAObc';

async function executeSql(sql: string, description: string): Promise<any> {
  console.log(`\n⏳ Ejecutando: ${description}...`);
  const res = await fetch(`${BASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ Error en "${description}" (Status ${res.status}):`, errorText);
    throw new Error(`Failed to execute SQL: ${description} -> ${errorText}`);
  }

  const result = await res.json();
  console.log(`✅ ${description} completado con éxito.`);
  return result;
}

// Mapa para asignar automáticamente subcategoría y sub-subcategoría a productos conocidos
function getHierarchyForProduct(p: typeof INITIAL_PRODUCTS[0]) {
  const cat = PRODUCT_CATEGORIES.find((c) => c.slug === p.category_slug);
  let subcategoryId: string | null = null;
  let subcategorySlug: string | null = null;
  let subcategoryName: string | null = null;
  let subSubcategoryId: string | null = null;
  let subSubcategorySlug: string | null = null;
  let subSubcategoryName: string | null = null;

  if (cat && cat.subcategories && cat.subcategories.length > 0) {
    const lowerName = (p.name + ' ' + (p.tags || []).join(' ') + ' ' + (p.description || '')).toLowerCase();
    
    for (const sub of cat.subcategories) {
      const matchSub = lowerName.includes(sub.slug.split('-')[0]) || 
                       lowerName.includes(sub.name.toLowerCase().split(' ')[0]) ||
                       (sub.slug.includes('maquillaje') && lowerName.includes('maquillaje')) ||
                       (sub.slug.includes('espejo') && lowerName.includes('espejo')) ||
                       (sub.slug.includes('cables') && lowerName.includes('cables')) ||
                       (sub.slug.includes('termos') && (lowerName.includes('botella') || lowerName.includes('termo')));

      if (matchSub) {
        subcategoryId = sub.id;
        subcategorySlug = sub.slug;
        subcategoryName = sub.name;

        if (sub.sub_subcategories && sub.sub_subcategories.length > 0) {
          const matchedSubSub = sub.sub_subcategories.find((ss) =>
            lowerName.includes(ss.slug.split('-')[0]) || 
            lowerName.includes(ss.name.toLowerCase().split(' ')[0])
          ) || sub.sub_subcategories[0];
          
          if (matchedSubSub) {
            subSubcategoryId = matchedSubSub.id;
            subSubcategorySlug = matchedSubSub.slug;
            subSubcategoryName = matchedSubSub.name;
          }
        }
        break;
      }
    }

    // Fallback: si no hubo match específico, asignar el primer hijo
    if (!subcategoryId) {
      const firstSub = cat.subcategories[0];
      subcategoryId = firstSub.id;
      subcategorySlug = firstSub.slug;
      subcategoryName = firstSub.name;
      if (firstSub.sub_subcategories && firstSub.sub_subcategories.length > 0) {
        subSubcategoryId = firstSub.sub_subcategories[0].id;
        subSubcategorySlug = firstSub.sub_subcategories[0].slug;
        subSubcategoryName = firstSub.sub_subcategories[0].name;
      }
    }
  }

  return {
    subcategoryId,
    subcategorySlug,
    subcategoryName,
    subSubcategoryId,
    subSubcategorySlug,
    subSubcategoryName
  };
}

async function verifyEndpoint(name: string, endpoint: string) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`
      }
    });

    if (res.ok) {
      const data = await res.json();
      const count = Array.isArray(data) ? data.length : 1;
      console.log(`  🟢 ${name.padEnd(32)} -> HTTP ${res.status} OK (${count} registros)`);
      return true;
    } else {
      console.log(`  🔴 ${name.padEnd(32)} -> HTTP ${res.status} ${res.statusText}`);
      return false;
    }
  } catch (err: any) {
    console.log(`  🔴 ${name.padEnd(32)} -> Error: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log('================================================================');
  console.log('🚀 JG STORE: EJECUCIÓN DE MIGRACIONES EN DOKPLOY SUPABASE');
  console.log(`📍 Endpoint Remoto: ${BASE_URL}`);
  console.log('================================================================');

  try {
    // 1. Migración 1: Tabla de Productos Base
    const mig1Path = path.join(process.cwd(), 'supabase', 'migrations', '20260917_create_products_table.sql');
    const sql1 = fs.readFileSync(mig1Path, 'utf8');
    await executeSql(sql1, '1. Crear tabla base public.products con RLS e índices');

    // 2. Migración 2: Jerarquía 3 Niveles (Categorías, Subcategorías, Sub-subcategorías) + Vistas + Seed
    const mig2Path = path.join(process.cwd(), 'supabase', 'migrations', '20261001_hierarchical_product_categories_3_levels.sql');
    const sql2 = fs.readFileSync(mig2Path, 'utf8');
    await executeSql(sql2, '2. Jerarquía de 3 Niveles (Categorías, Subcategorías, Sub-subcategorías), Vistas y Seed Oficial');

    // 3. Poblar todos los Subniveles (54 Subcategorías y 90 Sub-subcategorías completas)
    console.log('\n⏳ Sembrando el árbol taxonómico completo (54 Subcategorías y 90 Sub-subcategorías)...');
    for (const cat of PRODUCT_CATEGORIES) {
      if (cat.subcategories) {
        for (const sub of cat.subcategories) {
          const insertSub = `
            INSERT INTO public.subcategories (id, category_id, category_slug, slug, name, description, icon, display_order)
            VALUES (
              '${sub.id}',
              '${sub.category_id}',
              '${sub.category_slug}',
              '${sub.slug}',
              '${sub.name.replace(/'/g, "''")}',
              '${(sub.description || '').replace(/'/g, "''")}',
              '${sub.icon || 'folder'}',
              ${sub.display_order || 0}
            )
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              description = EXCLUDED.description,
              display_order = EXCLUDED.display_order;
          `;
          await executeSql(insertSub, `Subcategoría: ${sub.id}`);

          if (sub.sub_subcategories) {
            for (const subsub of sub.sub_subcategories) {
              const insertSubSub = `
                INSERT INTO public.sub_subcategories (id, subcategory_id, subcategory_slug, category_slug, slug, name, description, display_order)
                VALUES (
                  '${subsub.id}',
                  '${subsub.subcategory_id}',
                  '${subsub.subcategory_slug}',
                  '${subsub.category_slug}',
                  '${subsub.slug}',
                  '${subsub.name.replace(/'/g, "''")}',
                  '${(subsub.description || '').replace(/'/g, "''")}',
                  ${subsub.display_order || 0}
                )
                ON CONFLICT (id) DO UPDATE SET
                  name = EXCLUDED.name,
                  description = EXCLUDED.description,
                  display_order = EXCLUDED.display_order;
              `;
              await executeSql(insertSubSub, `Sub-subcategoría: ${subsub.id}`);
            }
          }
        }
      }
    }
    console.log('✅ Árbol taxonómico completo sembrado con éxito.');

    // 4. Migración 3: Tabla de Variantes de Producto
    const sqlVariants = `
      CREATE TABLE IF NOT EXISTS public.product_variants (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
        variant_sku VARCHAR(60) UNIQUE NOT NULL,
        barcode VARCHAR(50),
        attribute_color VARCHAR(50),
        attribute_size VARCHAR(50),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        price_adjustment NUMERIC(10, 2) DEFAULT 0,
        image_url TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
      CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
      ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Permitir lectura pública de variantes') THEN
          CREATE POLICY "Permitir lectura pública de variantes" ON public.product_variants FOR SELECT TO public USING (true);
        END IF;
      END $$;
    `;
    await executeSql(sqlVariants, '4. Crear tabla public.product_variants con RLS');

    // 5. Migración 4: Usuarios y Favoritos
    const mig4Path = path.join(process.cwd(), 'supabase', 'migrations', '20260925_create_users_and_favorites_tables.sql');
    const sql4 = fs.readFileSync(mig4Path, 'utf8');
    await executeSql(sql4, '5. Crear tablas public.users, public.favorites y vista vw_favoritos_detalle');

    // 6. Migración 5: Pedidos / Órdenes (B2B & B2C Argentina)
    const mig5Path = path.join(process.cwd(), 'supabase', 'migrations', '20260926_create_orders_tables.sql');
    const sql5 = fs.readFileSync(mig5Path, 'utf8');
    await executeSql(sql5, '6. Crear tablas public.orders y public.order_items');

    // 7. Poblar Catálogo Inicial de Productos
    console.log('\n⏳ Insertando o actualizando los 28 productos iniciales del catálogo con jerarquía...');
    for (const p of INITIAL_PRODUCTS) {
      const hierarchy = getHierarchyForProduct(p);
      const tagsArray = p.tags ? `ARRAY[${p.tags.map(t => `'${t.replace(/'/g, "''")}'`).join(',')}]::TEXT[]` : `ARRAY[]::TEXT[]`;
      
      const insertSql = `
        INSERT INTO public.products (
          sku, name, description, category_id, category_slug, category_name,
          subcategory_id, subcategory_slug, subcategory_name,
          sub_subcategory_id, sub_subcategory_slug, sub_subcategory_name,
          brand, unit, retail_price, wholesale_price, min_wholesale_qty, stock,
          image_url, featured, is_seasonal, tags
        ) VALUES (
          '${p.sku.replace(/'/g, "''")}',
          '${p.name.replace(/'/g, "''")}',
          '${p.description.replace(/'/g, "''")}',
          '${p.category_slug}',
          '${p.category_slug}',
          '${p.category_name.replace(/'/g, "''")}',
          ${hierarchy.subcategoryId ? `'${hierarchy.subcategoryId}'` : 'NULL'},
          ${hierarchy.subcategorySlug ? `'${hierarchy.subcategorySlug}'` : 'NULL'},
          ${hierarchy.subcategoryName ? `'${hierarchy.subcategoryName.replace(/'/g, "''")}'` : 'NULL'},
          ${hierarchy.subSubcategoryId ? `'${hierarchy.subSubcategoryId}'` : 'NULL'},
          ${hierarchy.subSubcategorySlug ? `'${hierarchy.subSubcategorySlug}'` : 'NULL'},
          ${hierarchy.subSubcategoryName ? `'${hierarchy.subSubcategoryName.replace(/'/g, "''")}'` : 'NULL'},
          '${(p.brand || 'JG Store').replace(/'/g, "''")}',
          '${(p.unit || 'unidad').replace(/'/g, "''")}',
          ${p.retail_price},
          ${p.wholesale_price},
          ${p.min_wholesale_qty},
          ${p.stock},
          '${p.image_url.replace(/'/g, "''")}',
          ${p.featured ? 'true' : 'false'},
          ${p.is_seasonal ? 'true' : 'false'},
          ${tagsArray}
        )
        ON CONFLICT (sku) DO UPDATE SET
          category_id = EXCLUDED.category_id,
          subcategory_id = EXCLUDED.subcategory_id,
          subcategory_slug = EXCLUDED.subcategory_slug,
          subcategory_name = EXCLUDED.subcategory_name,
          sub_subcategory_id = EXCLUDED.sub_subcategory_id,
          sub_subcategory_slug = EXCLUDED.sub_subcategory_slug,
          sub_subcategory_name = EXCLUDED.sub_subcategory_name,
          brand = EXCLUDED.brand,
          retail_price = EXCLUDED.retail_price,
          wholesale_price = EXCLUDED.wholesale_price,
          stock = EXCLUDED.stock;
      `;
      await executeSql(insertSql, `Insertar/Actualizar producto ${p.sku}`);
    }
    console.log(`✅ ¡Se insertaron/actualizaron los ${INITIAL_PRODUCTS.length} productos iniciales en PostgreSQL!`);

    // 8. Notificar a PostgREST para recargar el Schema Cache
    await executeSql("NOTIFY pgrst, 'reload schema';", 'Notificar a PostgREST (reload schema)');

    // 9. Esperar 1.5 segundos para propagación del esquema
    await new Promise((res) => setTimeout(res, 1500));

    // 10. Verificar todos los endpoints de PostgREST
    console.log('\n================================================================');
    console.log('🔍 VERIFICACIÓN DE ENDPOINTS POSTGREST EN VIVO');
    console.log('================================================================');

    await verifyEndpoint('Categorías (Nivel 1)', '/rest/v1/categories?select=id,name,display_order&limit=5');
    await verifyEndpoint('Subcategorías (Nivel 2)', '/rest/v1/subcategories?select=id,name,category_slug&limit=5');
    await verifyEndpoint('Sub-subcategorías (Nivel 3)', '/rest/v1/sub_subcategories?select=id,name,subcategory_slug&limit=5');
    await verifyEndpoint('Productos (public.products)', '/rest/v1/products?select=id,sku,name,retail_price,wholesale_price&limit=5');
    await verifyEndpoint('Variantes (product_variants)', '/rest/v1/product_variants?select=*&limit=5');
    await verifyEndpoint('Usuarios (public.users)', '/rest/v1/users?select=id,nombre,rol&limit=5');
    await verifyEndpoint('Favoritos (public.favorites)', '/rest/v1/favorites?select=*&limit=5');
    await verifyEndpoint('Órdenes (public.orders)', '/rest/v1/orders?select=*&limit=5');
    await verifyEndpoint('Ítems Orden (order_items)', '/rest/v1/order_items?select=*&limit=5');
    await verifyEndpoint('Vista: Jerarquía Completa', '/rest/v1/vw_product_hierarchy?limit=5');
    await verifyEndpoint('Vista: Productos con Jerarquía', '/rest/v1/vw_products_with_hierarchy?limit=5');
    await verifyEndpoint('Vista: Favoritos Detalle', '/rest/v1/vw_favoritos_detalle?limit=5');

    console.log('\n🎉 ¡TODAS LAS MIGRACIONES Y VISTAS SE HAN APLICADO CON ÉXITO EN DOKPLOY SUPABASE!');
  } catch (error: any) {
    console.error('\n❌ Error durante el proceso de migración:', error.message);
    process.exit(1);
  }
}

main();
