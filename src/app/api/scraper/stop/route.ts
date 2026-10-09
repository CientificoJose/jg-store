import { scraperManager } from '@/lib/scraper-process';

export const dynamic = 'force-dynamic';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

export async function POST() {
  try {
    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/stop`;
        const remoteRes = await fetch(remoteUrl, { method: 'POST' });
        const data = await remoteRes.json();
        return Response.json(data, { status: remoteRes.status });
      } catch (err: any) {
        return Response.json(
          { error: `Fallo al detener proceso en servicio remoto: ${err.message}` },
          { status: 502 }
        );
      }
    }

    const result = scraperManager.stopScraper();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
