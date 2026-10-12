import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const SCRAPER_AUTH_TOKEN =
  process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { margen_minorista, margen_mayorista, categoria, subcategoria } = body;

    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/products/margins`;
        const res = await fetch(remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
          },
          body: JSON.stringify({
            margen_minorista,
            margen_mayorista,
            categoria,
            subcategoria
          })
        });

        const data = await res.json();
        return Response.json(data, { status: res.status });
      } catch (err: any) {
        console.error('Error actualizando márgenes remotos:', err);
      }
    }

    // Fallback local mediante script Python
    const baseDir = path.join(process.cwd(), 'scraping-coronel');
    const pythonBin = process.env.PYTHON_BIN || 'python3';

    const scriptCode = `
import sys, json
from app.core.db import actualizar_margenes_masivo
res = actualizar_margenes_masivo(
    margen_minorista=${margen_minorista !== undefined ? Number(margen_minorista) : 'None'},
    margen_mayorista=${margen_mayorista !== undefined ? Number(margen_mayorista) : 'None'},
    categoria=${categoria ? JSON.stringify(categoria) : 'None'},
    subcategoria=${subcategoria ? JSON.stringify(subcategoria) : 'None'}
)
print(json.dumps(res))
`;

    const { stdout } = await execAsync(
      `"${pythonBin}" -c ${JSON.stringify(scriptCode)}`,
      { cwd: baseDir }
    );

    const result = JSON.parse(stdout.trim());
    return Response.json(result);
  } catch (error: any) {
    return Response.json(
      { error: error.message || 'Error al actualizar márgenes' },
      { status: 500 }
    );
  }
}
