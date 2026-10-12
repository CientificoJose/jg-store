import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SCRAPER_AUTH_TOKEN = process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

function getScraperHost(): string | undefined {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const SVG_FALLBACK = `
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" fill="none">
  <rect width="80" height="80" rx="8" fill="#1e293b"/>
  <path d="M26 54L38 38L48 48L54 42L62 54H26Z" fill="#475569"/>
  <circle cx="34" cy="30" r="4" fill="#64748b"/>
</svg>
`.trim();

function fetchRemoteImage(urlStr: string): Promise<{ buffer: Buffer; contentType: string }> {
  return new Promise((resolve, reject) => {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(urlStr);
    } catch (e) {
      return reject(new Error('Invalid URL'));
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const req = client.get(
      urlStr,
      {
        agent: isHttps ? httpsAgent : undefined,
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
        }
      },
      (res) => {
        // Redirecciones
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          const redirectUrl = new URL(res.headers.location, urlStr).toString();
          return resolve(fetchRemoteImage(redirectUrl));
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Remote HTTP ${res.statusCode}`));
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          resolve({
            buffer: Buffer.concat(chunks),
            contentType: res.headers['content-type'] || 'image/jpeg'
          });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timed out'));
    });
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');
  const rawFile = searchParams.get('file');

  // 1. Intentar servir desde archivo local en scraping-coronel/img-scraping
  if (rawFile) {
    try {
      const fileName = path.basename(rawFile.replace(/\\/g, '/'));
      const localFilePath = path.join(process.cwd(), 'scraping-coronel', 'img-scraping', fileName);
      if (fs.existsSync(localFilePath)) {
        const fileBuffer = fs.readFileSync(localFilePath);
        return new Response(fileBuffer, {
          headers: {
            'Content-Type': 'image/jpeg',
            'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
          }
        });
      }
    } catch {}
  }

  // 2. Si no está en disco local, verificar si el scraper remoto puede servirla
  const scraperHost = getScraperHost();
  if (scraperHost && (rawFile || rawUrl)) {
    try {
      const remoteProxyUrl = `${scraperHost.replace(/\/$/, '')}/api/image?url=${encodeURIComponent(
        rawUrl || ''
      )}&file=${encodeURIComponent(rawFile || '')}&token=${SCRAPER_AUTH_TOKEN}`;

      const res = await fetch(remoteProxyUrl, {
        headers: {
          Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
        },
        cache: 'no-store'
      });

      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/jpeg';
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
          }
        });
      }
    } catch {}
  }

  // 3. Descargar directamente desde la URL remota de Coronel Mayorista (bypassing browser port 70 & invalid SSL)
  if (rawUrl) {
    try {
      // Normalizar contrabarras de Windows generadas por Coronel
      const cleanUrl = rawUrl.replace(/\\/g, '/').trim();
      const { buffer, contentType } = await fetchRemoteImage(cleanUrl);

      return new Response(buffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400'
        }
      });
    } catch (err: any) {
      console.warn(`[ImageProxy] No se pudo cargar imagen remota (${rawUrl}):`, err.message);
    }
  }

  // 4. Fallback elegante a SVG si no se pudo obtener ninguna imagen
  return new Response(SVG_FALLBACK, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
