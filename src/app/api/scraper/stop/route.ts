import { scraperManager } from '@/lib/scraper-process';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = scraperManager.stopScraper();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
