import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { resetLocalCatalogMemory } from '@/lib/store-service';

const execAsync = promisify(exec);

const SCRAPER_AUTH_TOKEN = process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

const rawBaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_PUBLIC_URL ||
  (process.env.SUPABASE_HOST
    ? `https://${process.env.SUPABASE_HOST}`
    : 'https://jg-store-bd.press-cloud.com');

const BASE_URL = rawBaseUrl.replace(/^http:\/\//i, 'https://');

const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://coronel.press-cloud.com'
      : 'http://coronel.press-cloud.com')
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { clear_supabase = true, clear_sqlite = true } = body;

    let supabasePurged = false;
    let sqlitePurged = false;

    // 1. Purgar base de datos web oficial en Supabase (PostgreSQL)
    if (clear_supabase) {
      const purgeSql = `
        DO $purge$
        BEGIN
          -- Eliminar tablas dependientes o auxiliares si existen
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'favorites') THEN
            EXECUTE 'DELETE FROM public.favorites';
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'product_variants') THEN
            EXECUTE 'DELETE FROM public.product_variants';
          END IF;

          -- Eliminar catálogo en orden jerárquico de claves foráneas
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'products') THEN
            EXECUTE 'DELETE FROM public.products';
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sub_subcategories') THEN
            EXECUTE 'DELETE FROM public.sub_subcategories';
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subcategories') THEN
            EXECUTE 'DELETE FROM public.subcategories';
          END IF;
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
            EXECUTE 'DELETE FROM public.categories';
          END IF;
        END $purge$;
        NOTIFY pgrst, 'reload schema';
      `;

      const res = await fetch(`${BASE_URL}/pg/query`, {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: purgeSql })
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error al purgar Supabase:', errorText);
        throw new Error(`Fallo al vaciar Supabase: ${errorText}`);
      }

      resetLocalCatalogMemory();
      supabasePurged = true;
    }

    // 2. Purgar SQLite local y remoto (Scraper)
    if (clear_sqlite) {
      // 2.1 SQLite local en el contenedor/máquina
      try {
        const baseDir = path.join(process.cwd(), 'scraping-coronel');
        const dbPath = path.join(baseDir, 'productos.db');
        const pythonBin = process.env.PYTHON_BIN || 'python3';

        await execAsync(
          `"${pythonBin}" -c "import sqlite3, os; p='${dbPath}'; conn=sqlite3.connect(p) if os.path.exists(p) else None; conn.execute('DELETE FROM productos;') if conn else None; conn.commit() if conn else None; conn.execute('VACUUM;') if conn else None; conn.close() if conn else None"`,
          { cwd: baseDir }
        );
        sqlitePurged = true;
      } catch (err) {
        console.warn('Advertencia vaciando SQLite local:', err);
      }

      // 2.2 Microservicio remoto de scraping (Dokploy)
      const scraperHost = getScraperHost();
      if (scraperHost) {
        try {
          const resetUrl = `${scraperHost.replace(/\/$/, '')}/api/products/reset?token=${SCRAPER_AUTH_TOKEN}`;
          await fetch(resetUrl, {
            method: 'POST',
            headers: { Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}` },
            cache: 'no-store'
          });
          sqlitePurged = true;
        } catch (err) {
          console.warn('Advertencia vaciando SQLite remoto en scraper:', err);
        }
      }
    }

    return Response.json({
      success: true,
      message: 'Base de datos, productos y categorías vaciados exitosamente.',
      details: {
        supabase_purged: supabasePurged,
        sqlite_purged: sqlitePurged
      }
    });
  } catch (error: any) {
    console.error('Error en /api/catalog/reset:', error);
    return Response.json(
      { success: false, error: error?.message || 'Error al vaciar catálogo' },
      { status: 500 }
    );
  }
}
