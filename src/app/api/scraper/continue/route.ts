import { scraperManager } from '@/lib/scraper-process';

export const dynamic = 'force-dynamic';

const SCRAPER_AUTH_TOKEN =
  process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

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
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/continue`;
        const remoteRes = await fetch(remoteUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
          }
        });
        const data = await remoteRes.json();
        return Response.json(data, { status: remoteRes.status });
      } catch (err: any) {
        return Response.json(
          { error: `Fallo al enviar señal al servicio remoto: ${err.message}` },
          { status: 502 }
        );
      }
    }

    const result = scraperManager.continueScraper();
    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
