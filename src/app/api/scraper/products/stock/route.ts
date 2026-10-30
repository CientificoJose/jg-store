import { NextRequest } from 'next/server';
import { exec } from 'child_process';
import fs from 'fs';
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

function getPythonBin(baseDir: string): string {
  if (process.env.PYTHON_BIN) return process.env.PYTHON_BIN;
  const venvPython = path.join(baseDir, '.venv', 'bin', 'python');
  if (fs.existsSync(venvPython)) return venvPython;
  return 'python3';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { codigos, stock = 10 } = body;
    const safeStock = Math.min(10, Math.max(0, Number(stock)));

    if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
      return Response.json({ error: 'Lista de códigos requerida' }, { status: 400 });
    }

    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/products/stock`;
        const res = await fetch(remoteUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
          },
          body: JSON.stringify({ codigos, stock: safeStock })
        });

        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (err: any) {
        console.error('Error actualizando stock remoto:', err);
      }
    }

    // Fallback local mediante script Python
    const baseDir = path.join(process.cwd(), 'scraping-coronel');
    const pythonBin = getPythonBin(baseDir);

    const scriptCode = `
import sys, json
from app.core.db import actualizar_stock_productos
res = actualizar_stock_productos(
    codigos=${JSON.stringify(codigos)},
    nuevo_stock=${safeStock}
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
      { error: error.message || 'Error al actualizar stock' },
      { status: 500 }
    );
  }
}
