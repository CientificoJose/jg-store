import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseDir = path.join(process.cwd(), 'scraping-coronel');
  const pythonBin = path.join(baseDir, '.venv', 'bin', 'python');
  const scriptPath = path.join(baseDir, 'get_db_stats.py');

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
