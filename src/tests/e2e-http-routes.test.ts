import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3000';

let isServerRunning = false;
try {
  const probe = await fetch(BASE_URL, { signal: AbortSignal.timeout(300) });
  isServerRunning = probe.status > 0;
} catch {
  isServerRunning = false;
}

describe('Pruebas de Integración E2E de Rutas y Páginas (`routes`)', () => {
  it('la página principal de la tienda (/) debe responder HTTP 200 y contener la marca JG Store', async () => {
    if (!isServerRunning) {
      console.log('ℹ️ Servidor :3000 offline, prueba e2e omitida en modo unitario.');
      return;
    }
    const res = await fetch(`${BASE_URL}/`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('JG');
    expect(html.toLowerCase()).toContain('polirubro');
  });

  it('la página de producto detallado (/producto/prod-001) debe responder HTTP 200 con breadcrumbs', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/producto/prod-001`);
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('Vela Aromática');
    expect(html).toContain('Volver al catálogo');
  });

  it('el panel de administración de productos (/dashboard/product) debe responder HTTP 200', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/dashboard/product`);
    expect(res.status).toBe(200);
  });

  it('el panel de configuración general (/dashboard/config/general) debe responder HTTP 200', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/dashboard/config/general`);
    expect(res.status).toBe(200);
  });

  it('el panel de diseño de landing (/dashboard/config/landing) debe responder HTTP 200', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/dashboard/config/landing`);
    expect(res.status).toBe(200);
  });

  it('el panel de temas y apariencia (/dashboard/config/theme) debe responder HTTP 200', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/dashboard/config/theme`);
    expect(res.status).toBe(200);
  });

  it('la página de favoritos (/favoritos) debe responder HTTP 200', async () => {
    if (!isServerRunning) return;
    const res = await fetch(`${BASE_URL}/favoritos`);
    expect(res.status).toBe(200);
  });
});
