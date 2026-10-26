import { describe, it, expect } from 'bun:test';
import { GET, POST, DELETE } from '@/app/api/categories/route';
import { NextRequest } from 'next/server';

describe('Gestor de Departamentos y Categorías API (`/api/categories`)', () => {
  it('GET debe retornar la lista de categorías activas con estructura tipada', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    const first = data[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('slug');
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('imageUrl');
  });

  it('POST debe rechazar solicitudes con nombre vacío devolviendo código 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: '' })
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('nombre');
  });

  it('DELETE debe validar la presencia obligatoria de id o slug devolviendo código 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/categories', {
      method: 'DELETE'
    });

    const res = await DELETE(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('id o slug');
  });
});
