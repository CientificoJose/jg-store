import { uploadImageToSupabaseStorage, ensureProductsBucketExists } from '../src/lib/supabase-storage';

const DEFAULT_SUPABASE_URL = 'http://jg-store-bd.press-cloud.com';
const DEFAULT_SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.SUPABASE_HOST ? `http://${process.env.SUPABASE_HOST}` : DEFAULT_SUPABASE_URL);

const SUPABASE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  DEFAULT_SUPABASE_SERVICE_KEY;

async function syncAllImages() {
  console.log('🔄 Iniciando sincronización de imágenes hacia Supabase Storage...');
  await ensureProductsBucketExists();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=id,sku,image_url`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  if (!res.ok) {
    console.error('Error al consultar productos de Supabase:', await res.text());
    return;
  }

  const products: Array<{ id: string; sku: string; image_url: string }> = await res.json();
  const pending = products.filter(
    (p) =>
      p.image_url &&
      !p.image_url.includes('/storage/v1/object/public/products/') &&
      (p.image_url.includes('imgcoronel.dyndns.org') || p.image_url.startsWith('http'))
  );

  console.log(`📦 Total productos: ${products.length} | Pendientes de subir a Supabase: ${pending.length}`);

  let successCount = 0;
  let failCount = 0;

  // Procesar en lotes de 5 concurrentes
  const BATCH_SIZE = 5;
  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const batch = pending.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (prod) => {
        try {
          const fileName = `${prod.sku}.jpg`;
          const supabaseUrl = await uploadImageToSupabaseStorage(prod.image_url, fileName);

          if (supabaseUrl && supabaseUrl.includes('/storage/v1/object/public/products/')) {
            const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/products?id=eq.${prod.id}`, {
              method: 'PATCH',
              headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                Prefer: 'return=minimal'
              },
              body: JSON.stringify({ image_url: supabaseUrl })
            });

            if (patchRes.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        } catch (err: any) {
          console.warn(`Error procesando ${prod.sku}:`, err?.message);
          failCount++;
        }
      })
    );

    const progress = Math.min(i + BATCH_SIZE, pending.length);
    console.log(`🚀 Progreso: [${progress}/${pending.length}] subidos: ${successCount}, fallos: ${failCount}`);
  }

  console.log(`\n✅ Sincronización completada: ${successCount} imágenes migradas a Supabase Storage.`);
}

syncAllImages().catch(console.error);
