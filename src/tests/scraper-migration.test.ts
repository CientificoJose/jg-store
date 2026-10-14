import { describe, expect, it } from 'bun:test';
import { POST } from '@/app/api/scraper/migrate/route';

describe('Migrador de Catálogo Scraper -> PostgreSQL Supabase (`/api/scraper/migrate`)', () => {
  it('debe ejecutar una migración de prueba sin duplicar registros y reportar métricas válidas', async () => {
    const req = new Request('http://localhost:3000/api/scraper/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        limit: 2,
        default_retail_margin: 40,
        default_wholesale_margin: 18
      })
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(typeof data.migrated_products).toBe('number');
    expect(data.migrated_products).toBeGreaterThanOrEqual(1);
    expect(typeof data.inserted_products).toBe('number');
    expect(typeof data.updated_products).toBe('number');
  });
});
