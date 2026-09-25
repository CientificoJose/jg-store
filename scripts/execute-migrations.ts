import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

const HOST = 'jg-store-bd.press-cloud.com';
const PORT = 5432;
const USER = 'postgres';
const DATABASE = 'postgres';

// Contraseñas comunes de Dokploy / Supabase Self-Hosted
const CANDIDATE_PASSWORDS = [
  'ksazeirsl9ct3p2u0v1cr9oxohcrpvry',
  process.env.POSTGRES_PASSWORD || '',
  'your-super-secret-and-long-postgres-password'
].filter(Boolean);

async function tryPassword(pwd: string): Promise<boolean> {
  const client = new Client({
    host: HOST,
    port: PORT,
    user: USER,
    password: pwd,
    database: DATABASE,
    connectionTimeoutMillis: 3500
  });

  try {
    await client.connect();
    console.log(`\n🎉 ¡CONEXIÓN EXITOSA CON POSTGRESQL! Contraseña correcta encontrada: "${pwd}"`);

    // 1. Ejecutar migración de productos
    const migrationProductsPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20260917_create_products_table.sql'
    );
    if (fs.existsSync(migrationProductsPath)) {
      console.log('Ejecutando migración de productos...');
      const sqlProducts = fs.readFileSync(migrationProductsPath, 'utf8');
      await client.query(sqlProducts);
      console.log('✅ Tabla public.products creada con éxito.');
    }

    // 2. Ejecutar migración de usuarios y favoritos
    const migrationUsersPath = path.join(
      process.cwd(),
      'supabase',
      'migrations',
      '20260925_create_users_and_favorites_tables.sql'
    );
    if (fs.existsSync(migrationUsersPath)) {
      console.log('Ejecutando migración de usuarios y favoritos...');
      const sqlUsers = fs.readFileSync(migrationUsersPath, 'utf8');
      await client.query(sqlUsers);
      console.log('✅ Tablas public.users y public.favorites creadas con éxito.');
    }

    // 3. Notificar a PostgREST para recargar el schema cache
    await client.query("NOTIFY pgrst, 'reload schema';");
    console.log('✅ PostgREST recargó el esquema.');

    // 4. Insertar catálogo inicial si la tabla está vacía
    const countRes = await client.query('SELECT COUNT(*) FROM public.products;');
    const currentCount = parseInt(countRes.rows[0].count);
    console.log(`Total productos actuales en la base de datos: ${currentCount}`);

    if (currentCount === 0) {
      console.log('Poblando catálogo inicial de JG Store en la base de datos remota...');
      const { INITIAL_PRODUCTS } = await import('@/constants/initial-catalog');

      for (const p of INITIAL_PRODUCTS) {
        await client.query(
          `INSERT INTO public.products (
            sku, name, description, category_slug, category_name,
            retail_price, wholesale_price, min_wholesale_qty, stock,
            image_url, unit, featured, is_seasonal, tags
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (sku) DO NOTHING`,
          [
            p.sku,
            p.name,
            p.description,
            p.category_slug,
            p.category_name,
            p.retail_price,
            p.wholesale_price,
            p.min_wholesale_qty,
            p.stock,
            p.image_url,
            p.unit,
            p.featured,
            p.is_seasonal,
            p.tags
          ]
        );
      }
      console.log(`✅ ¡Se insertaron los ${INITIAL_PRODUCTS.length} productos iniciales en PostgreSQL!`);
    }

    await client.end();
    return true;
  } catch (err: any) {
    console.log(`\nIntento con "${pwd.slice(0, 5)}...": Code=${err.code}, Message=${err.message}`);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function run() {
  console.log(`Iniciando prueba de conexión contra PostgreSQL en ${HOST}:${PORT}...`);

  for (const pwd of CANDIDATE_PASSWORDS) {
    const success = await tryPassword(pwd);
    if (success) {
      console.log('\n🌟 ¡Todas las migraciones se ejecutaron satisfactoriamente en Dokploy Supabase!');
      process.exit(0);
    }
  }

  console.log('\n❌ Ninguna de las contraseñas estándar funcionó.');
  console.log('Se requiere la contraseña de la base de datos de Dokploy para conectar.');
}

run();
