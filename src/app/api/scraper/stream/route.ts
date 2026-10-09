import { NextRequest } from 'next/server';
import { scraperManager } from '@/lib/scraper-process';

export const dynamic = 'force-dynamic';

function getScraperHost() {
  return (
    process.env.SCRAPER_SERVICE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://coronel.press-cloud.com' : undefined)
  );
}

export async function GET(request: NextRequest) {
  const scraperHost = getScraperHost();

  // Si hay un servicio cloud configurado (o estamos en producción), proxy del SSE
  if (scraperHost) {
    try {
      const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/stream`;
      const remoteRes = await fetch(remoteUrl, {
        headers: { Accept: 'text/event-stream' },
        cache: 'no-store',
        signal: request.signal
      });

      if (remoteRes.ok && remoteRes.body) {
        return new Response(remoteRes.body, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            Connection: 'keep-alive'
          }
        });
      }
    } catch (err) {
      console.error('Error conectando con SSE remoto:', err);
    }
  }

  // Fallback local
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const currentStatus = scraperManager.getStatus();
      controller.enqueue(
        encoder.encode(`event: status\ndata: ${JSON.stringify(currentStatus)}\n\n`)
      );

      const existingLogs = scraperManager.getLogs();
      for (const log of existingLogs) {
        controller.enqueue(
          encoder.encode(`event: log\ndata: ${JSON.stringify({ text: log })}\n\n`)
        );
      }

      const unsubscribe = scraperManager.subscribe((event) => {
        try {
          if (event.type === 'log') {
            controller.enqueue(
              encoder.encode(`event: log\ndata: ${JSON.stringify({ text: event.text })}\n\n`)
            );
          } else if (event.type === 'status') {
            controller.enqueue(
              encoder.encode(`event: status\ndata: ${JSON.stringify(event.data)}\n\n`)
            );
          }
        } catch {}
      });

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {}
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { ganancia = 40, downloadImages = false } = body;

    const scraperHost = getScraperHost();
    if (scraperHost) {
      try {
        const remoteUrl = `${scraperHost.replace(/\/$/, '')}/api/start`;
        const remoteRes = await fetch(remoteUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ganancia: Number(ganancia),
            download_images: Boolean(downloadImages)
          })
        });
        const data = await remoteRes.json();
        return Response.json(data, { status: remoteRes.status });
      } catch (err: any) {
        return Response.json(
          { error: `Fallo al conectar con el servicio remoto en Dokploy: ${err.message}` },
          { status: 502 }
        );
      }
    }

    const result = scraperManager.startScraper({
      ganancia: Number(ganancia),
      downloadImages: Boolean(downloadImages)
    });

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
