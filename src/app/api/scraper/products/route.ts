import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  const scraperHost = process.env.SCRAPER_SERVICE_URL;
  if (scraperHost) {
    try {
      const res = await fetch(`${scraperHost.replace(/\/$/, '')}/api/products`);
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
