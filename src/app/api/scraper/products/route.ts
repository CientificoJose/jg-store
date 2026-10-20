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

export async function GET() {
  const scraperHost = getScraperHost();
  if (scraperHost) {
    try {
      const res = await fetch(
        `${scraperHost.replace(/\/$/, '')}/api/products?token=${SCRAPER_AUTH_TOKEN}`,
        {
          headers: {
            Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
          },
          cache: 'no-store'
        }
      );
      if (res.ok) {
        return Response.json(await res.json());
      }
    } catch {}
  }

  const baseDir = path.join(process.cwd(), 'scraping-coronel');
  const scriptPath = path.join(baseDir, 'get_db_stats.py');
  const pythonBin = getPythonBin(baseDir);

  try {
    const { stdout } = await execAsync(`"${pythonBin}" "${scriptPath}"`, {
      cwd: baseDir
    });

    const data = JSON.parse(stdout.trim());
    return Response.json(data);
  } catch (error: any) {
    return Response.json(
      {
        total_products: 0,
        categories: [],
        latest_products: [],
        error: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { codigos } = body;

    if (!codigos || !Array.isArray(codigos) || codigos.length === 0) {
      return Response.json({ error: 'Lista de códigos vacía o inválida' }, { status: 400 });
    }

    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/products`;
        const res = await fetch(remoteUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
          },
          body: JSON.stringify({ codigos })
        });

        if (res.ok) {
          const data = await res.json();
          return Response.json(data);
        }
      } catch (err: any) {
        console.error('Error eliminando productos remotos:', err);
      }
    }

    // Fallback local mediante script Python
    const baseDir = path.join(process.cwd(), 'scraping-coronel');
    const pythonBin = getPythonBin(baseDir);

    const scriptCode = `
import sys, json
from app.core.db import eliminar_productos_db
res = eliminar_productos_db(codigos=${JSON.stringify(codigos)})
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
      { error: error.message || 'Error al eliminar productos' },
      { status: 500 }
    );
  }
}
