import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const SCRAPER_AUTH_TOKEN = process.env.SCRAPER_AUTH_TOKEN || 'jgstore_scraper_secure_token_2026';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://coronel.press-cloud.com'
      : 'http://coronel.press-cloud.com')
  );
}

export async function GET() {
  try {
    const scraperHost = getScraperHost();
    const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/cron?token=${SCRAPER_AUTH_TOKEN}`;
    const res = await fetch(remoteUrl, {
      headers: { Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}` },
      cache: 'no-store'
    });

    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }

    return Response.json(
      {
        enabled: false,
        interval_minutes: 360,
        margen_minorista: 40,
        margen_mayorista: 18,
        last_run: null,
        next_run: null,
        last_status: null,
        last_duration: null,
        isRunning: false
      },
      { status: 200 }
    );
  } catch (err: any) {
    return Response.json(
      { error: `Error conectando con el programador cron: ${err.message}` },
      { status: 502 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const scraperHost = getScraperHost();
    const body = await request.json().catch(() => ({}));
    const action = request.nextUrl.searchParams.get('action') || body.action;

    const endpoint = action === 'run' ? '/api/cron/run' : '/api/cron';
    const remoteUrl = `${scraperHost.replace(/\/$/, '')}${endpoint}?token=${SCRAPER_AUTH_TOKEN}`;

    const res = await fetch(remoteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SCRAPER_AUTH_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch (err: any) {
    return Response.json({ error: `Error enviando comando cron: ${err.message}` }, { status: 500 });
  }
}
