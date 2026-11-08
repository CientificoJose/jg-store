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
 * y la sube al bucket de Supabase Storage de manera blindada contra cortes de red,
 * puertos no estándar (ej: dyndns.org:70) y nombres con caracteres especiales.
 * Retorna la URL pública permanente en HTTPS de Supabase.
 */
export async function uploadImageToSupabaseStorage(
  sourceUrl: string,
  fileName: string
): Promise<string> {
  if (!sourceUrl || typeof sourceUrl !== 'string') return '';

  // Si ya es una URL de Supabase Storage en HTTPS, no hace falta volver a subirla
  if (sourceUrl.includes('/storage/v1/object/public/products/')) {
    return sourceUrl.replace(/^http:\/\//i, 'https://');
  }

  const SCRAPER_SERVICE_URL =
    process.env.SCRAPER_SERVICE_URL || 'https://coronel.press-cloud.com';
  const SCRAPER_AUTH_TOKEN =
    process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

  try {
    // 1. Normalizar URL (remplazar contrabarras de Windows y espacios)
    let normalizedUrl = sourceUrl.replace(/\\/g, '/').trim();

    // 2. Si es una ruta relativa (ej: /api/scraper/image?file=... o img-scraping/...),
    // resolverla como URL absoluta contra el servicio del scraper
    if (normalizedUrl.startsWith('/api/scraper/image')) {
      const parsed = new URL(normalizedUrl, 'http://localhost');
      const fileParam = parsed.searchParams.get('file') || '';
      normalizedUrl = `${SCRAPER_SERVICE_URL}/api/image?file=${encodeURIComponent(fileParam)}&token=${SCRAPER_AUTH_TOKEN}`;
    } else if (normalizedUrl.startsWith('img-scraping/') || !normalizedUrl.startsWith('http')) {
      normalizedUrl = `${SCRAPER_SERVICE_URL}/api/image?file=${encodeURIComponent(normalizedUrl)}&token=${SCRAPER_AUTH_TOKEN}`;
    }

    // 3. Si apunta a imgcoronel en el puerto 70, forzar HTTPS con agente permisivo
    if (normalizedUrl.includes('imgcoronel.dyndns.org:70') && normalizedUrl.startsWith('http://')) {
      normalizedUrl = normalizedUrl.replace('http://', 'https://');
    }

    const fetchOptions: any = {
      tls: { rejectUnauthorized: false },
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    };

    // 4. Reintentos automáticos con pausas (hasta 3 intentos) ante microcortes o lentitud
    let response: Response | null = null;
    let lastError: any = null;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout
        response = await fetch(normalizedUrl, {
          ...fetchOptions,
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response && response.ok) {
          break;
        }
      } catch (err: any) {
        lastError = err;
      }

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    if (!response || !response.ok) {
      console.warn(
        `[storage] No se pudo descargar imagen de ${normalizedUrl} tras 3 intentos (Status: ${response?.status || 'Error'})`
      );
      return '';
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    // Si el archivo es demasiado pequeño (< 200 bytes) o es un SVG/HTML de error, descartar
    if (buffer.byteLength < 200 || contentType.includes('html') || contentType.includes('svg')) {
      return '';
    }

    // 5. Sanitizar nombre de archivo (forzar minúsculas y caracteres seguros)
    let cleanFileName = fileName
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_')
      .replace(/_+/g, '_');

    if (
      !cleanFileName.endsWith('.jpg') &&
      !cleanFileName.endsWith('.png') &&
      !cleanFileName.endsWith('.webp')
    ) {
      cleanFileName += '.jpg';
    }

    // 6. Subir al bucket de Supabase Storage asegurando HTTPS
    await ensureProductsBucketExists();

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
      return '';
    }
  } catch (error: any) {
    console.warn(`[storage] Excepción subiendo imagen a Supabase (${fileName}):`, error?.message);
    return '';
  }
}

/**
 * Sube un buffer de imagen directamente a Supabase Storage y retorna la URL pública.
 */
export async function uploadBufferToSupabaseStorage(
  buffer: ArrayBuffer | Uint8Array | Buffer,
  fileName: string,
  contentType: string = 'image/jpeg'
): Promise<string> {
  await ensureProductsBucketExists();

  let cleanFileName = fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_');

  if (!cleanFileName.toLowerCase().endsWith('.jpg') && !cleanFileName.toLowerCase().endsWith('.png') && !cleanFileName.toLowerCase().endsWith('.webp')) {
    cleanFileName += '.jpg';
  }

  // Asegurar compatibilidad con BodyInit de fetch (DOM / Node / Bun)
  const bodyPayload = (
    buffer instanceof ArrayBuffer
      ? buffer
      : buffer instanceof Uint8Array
      ? buffer
      : (buffer as unknown as BodyInit)
  ) as BodyInit;

  try {
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
        body: bodyPayload
      }
    );

    if (uploadRes.ok) {
      return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCTS_BUCKET}/${cleanFileName}`;
    }
    const err = await uploadRes.text();
    console.warn('[storage] Error al subir buffer:', err);
    return '';
  } catch (error: any) {
    console.warn('[storage] Excepción al subir buffer:', error?.message);
    return '';
  }
}

