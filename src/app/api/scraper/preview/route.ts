import path from 'path';
import fs from 'fs';

export const dynamic = 'force-dynamic';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

export async function GET() {
  const scraperHost = getScraperHost();
  if (scraperHost) {
    try {
      const remoteRes = await fetch(`${scraperHost.replace(/\/$/, '')}/api/preview`, {
        cache: 'no-store'
      });
      if (remoteRes.ok) {
        const contentType = remoteRes.headers.get('content-type') || 'image/png';
        const buffer = await remoteRes.arrayBuffer();
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        });
      }
    } catch (err) {
      console.error('Error obteniendo preview remoto:', err);
    }
  }

  const previewPath = path.join(process.cwd(), 'scraping-coronel', 'preview.png');

  if (fs.existsSync(previewPath)) {
    try {
      const imageBuffer = fs.readFileSync(previewPath);
      return new Response(imageBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0'
        }
      });
    } catch {
      // Fallback a placeholder si hay bloqueo de lectura
    }
  }

  // Si no hay screenshot todavía, retornar un SVG placeholder elegante
  const svgPlaceholder = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450" fill="#0f172a">
      <rect width="800" height="450" fill="#090d16" />
      <circle cx="400" cy="190" r="50" fill="#1e293b" />
      <path d="M385 175 L415 190 L385 205 Z" fill="#64748b" />
      <text x="400" y="270" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8" text-anchor="middle" font-weight="600">
        Navegador en Espera
      </text>
      <text x="400" y="298" font-family="system-ui, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
        Inicia el scraper para ver la vista previa en vivo de Google Chrome
      </text>
    </svg>
  `;

  return new Response(svgPlaceholder, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    }
  });
}
