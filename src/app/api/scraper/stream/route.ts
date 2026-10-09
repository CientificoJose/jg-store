import { NextRequest } from 'next/server';
import { scraperManager } from '@/lib/scraper-process';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Enviar el estado actual y los últimos logs de buffer
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

      // 2. Suscribirse a nuevos eventos emitidos por el proceso
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
        } catch {
          // Si el cliente cerró la conexión
        }
      });

      // Heartbeat cada 15 segundos para mantener la conexión viva
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Limpieza cuando el cliente se desconecta
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

    const result = scraperManager.startScraper({
      ganancia: Number(ganancia),
      downloadImages: Boolean(downloadImages)
    });

    return Response.json(result);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 400 });
  }
}
