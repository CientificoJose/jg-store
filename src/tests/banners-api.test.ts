import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3000';

describe('Banners & Hero Carousel API', () => {
  const testBannerId = `test-slide-${Date.now()}`;

  it('debe obtener la lista de banners activos para la tienda', async () => {
    const res = await fetch(`${BASE_URL}/api/banners`);
    expect(res.status).toBe(200);

    const banners = await res.json();
    expect(Array.isArray(banners)).toBe(true);
    expect(banners.length).toBeGreaterThan(0);

    const first = banners[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('image');
    expect(first).toHaveProperty('primaryActionLabel');
  });

  it('debe crear un nuevo banner promocional editable', async () => {
    const newSlide = {
      id: testBannerId,
      tag: '🔥 OFERTA TEST B2B',
      tagColor: '#E63946',
      title: 'BANNER DE PRUEBA AUTOMATIZADO',
      titleAccent: '100% FUNCIONAL',
      subtitle: 'Este es un banner creado para comprobar el CRUD en tiempo real.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
      primaryActionLabel: 'Comprar Ahora',
      primaryActionType: 'explore',
      secondaryActionLabel: 'Consultar WhatsApp',
      secondaryActionType: 'whatsapp',
      features: ['Entrega en 24h', 'Factura A'],
      isActive: true,
      displayOrder: 99
    };

    const res = await fetch(`${BASE_URL}/api/banners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSlide)
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.banner.id).toBe(testBannerId);
  });

  it('debe recuperar el banner creado en la lista de banners', async () => {
    const res = await fetch(`${BASE_URL}/api/banners?all=true`);
    expect(res.status).toBe(200);

    const banners = await res.json();
    const found = banners.find((b: any) => b.id === testBannerId);
    expect(found).toBeDefined();
    expect(found.title).toBe('BANNER DE PRUEBA AUTOMATIZADO');
    expect(found.titleAccent).toBe('100% FUNCIONAL');
  });

  it('debe eliminar el banner de prueba sin dejar residuos', async () => {
    const res = await fetch(`${BASE_URL}/api/banners?id=${encodeURIComponent(testBannerId)}`, {
      method: 'DELETE'
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);

    // Verificar que ya no exista
    const checkRes = await fetch(`${BASE_URL}/api/banners?all=true`);
    const banners = await checkRes.json();
    const found = banners.find((b: any) => b.id === testBannerId);
    expect(found).toBeUndefined();
  });
});
