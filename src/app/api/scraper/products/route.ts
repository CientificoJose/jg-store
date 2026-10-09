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
  const pythonBin = process.env.PYTHON_BIN || 'python3';

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
