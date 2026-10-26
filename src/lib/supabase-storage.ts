const DEFAULT_SUPABASE_URL = 'https://jg-store-bd.press-cloud.com';
const DEFAULT_SUPABASE_SERVICE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

const rawSupabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_PUBLIC_URL ||
  (process.env.SUPABASE_HOST ? `https://${process.env.SUPABASE_HOST}` : DEFAULT_SUPABASE_URL);

const SUPABASE_URL = rawSupabaseUrl.replace(/^http:\/\//i, 'https://');

const SUPABASE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.ANON_KEY ||
  DEFAULT_SUPABASE_SERVICE_KEY;

export const PRODUCTS_BUCKET = 'products';

/**
 * Asegura que el bucket de almacenamiento exista y sea público en Supabase Storage
 */
export async function ensureProductsBucketExists(): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: PRODUCTS_BUCKET,
        name: PRODUCTS_BUCKET,
        public: true
      })
    });
    return res.ok || res.status === 409 || res.status === 400;
  } catch (error) {
    console.warn('[storage] Error asegurando bucket:', error);
    return false;
  }
}

/**
 * Descarga una imagen desde una URL externa (como imgcoronel) o archivo local
 * y la sube al bucket de Supabase Storage.
 * Retorna la URL pública permanente de Supabase o la URL original como fallback.
 */
export async function uploadImageToSupabaseStorage(
  sourceUrl: string,
  fileName: string
): Promise<string> {
  if (!sourceUrl) return '';

  // Si ya es una URL de Supabase Storage, no hace falta volver a subirla
  if (sourceUrl.includes('/storage/v1/object/public/products/')) {
    return sourceUrl;
  }

  try {
    // Normalizar URL (remplazar backslashes de Windows \ por / y espacios)
    const normalizedUrl = sourceUrl.replace(/\\/g, '/').trim();

    const fetchOptions: any = {
      tls: { rejectUnauthorized: false },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };
    const response = await fetch(normalizedUrl, fetchOptions);

    if (!response.ok) {
      console.warn(
        `[storage] No se pudo descargar la imagen de ${normalizedUrl}: HTTP ${response.status}`
      );
      return sourceUrl;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    if (buffer.byteLength < 50) {
      return sourceUrl;
    }

    // Sanitizar nombre de archivo
    let cleanFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');

    if (
      !cleanFileName.toLowerCase().endsWith('.jpg') &&
      !cleanFileName.toLowerCase().endsWith('.png')
    ) {
      cleanFileName += '.jpg';
    }

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/${PRODUCTS_BUCKET}/${cleanFileName}`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': contentType,
          'x-upsert': 'true'
        },
        body: buffer
      }
    );

    if (uploadRes.ok) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${PRODUCTS_BUCKET}/${cleanFileName}`;
      return publicUrl;
    } else {
      const err = await uploadRes.text();
      console.warn(`[storage] Error subiendo imagen a Supabase para ${cleanFileName}:`, err);
      return sourceUrl;
    }
  } catch (error: any) {
    console.warn(`[storage] Excepción subiendo imagen a Supabase (${fileName}):`, error?.message);
    return sourceUrl;
  }
}
