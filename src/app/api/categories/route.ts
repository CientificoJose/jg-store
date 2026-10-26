import { NextRequest, NextResponse } from 'next/server';
import { fetchStoreCategories } from '@/lib/store-service';

export const dynamic = 'force-dynamic';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.SUPABASE_HOST ? `https://${process.env.SUPABASE_HOST}` : 'https://jg-store-bd.press-cloud.com');
const SUPABASE_URL = rawUrl.startsWith('http://') && rawUrl.includes('press-cloud.com')
  ? rawUrl.replace('http://', 'https://')
  : rawUrl;

const SUPABASE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

function toSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const categories = await fetchStoreCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      slug: customSlug,
      description = '',
      icon = 'package',
      image_url = '',
      display_order = 100
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'El nombre de la categoría es obligatorio' }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = (customSlug ? toSlug(customSlug) : toSlug(cleanName)) || 'categoria';
    const categoryId = id || slug;

    const payload = {
      id: categoryId,
      slug,
      name: cleanName,
      description: description || `Catálogo oficial de ${cleanName}`,
      icon: icon || 'package',
      image_url: image_url || '',
      display_order: Number(display_order) || 100
    };

    // Upsert a Supabase PostgREST
    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error al guardar categoría en Supabase:', errText);
      return NextResponse.json(
        { error: 'No se pudo guardar la categoría en la base de datos' },
        { status: 500 }
      );
    }

    const [savedCategory] = await res.json().catch(() => [payload]);

    return NextResponse.json({
      success: true,
      category: savedCategory || payload,
      message: `Categoría "${cleanName}" guardada exitosamente.`
    });
  } catch (error: any) {
    console.error('Error procesando categoría:', error);
    return NextResponse.json(
      { error: error.message || 'Error inesperado al guardar categoría' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (!id && !slug) {
      return NextResponse.json(
        { error: 'Se requiere id o slug para eliminar la categoría' },
        { status: 400 }
      );
    }

    const filter = id ? `id=eq.${encodeURIComponent(id)}` : `slug=eq.${encodeURIComponent(slug!)}`;

    const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?${filter}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('Error eliminando categoría en Supabase:', err);
      return NextResponse.json(
        { error: 'No se pudo eliminar la categoría de la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Departamento eliminado correctamente'
    });
  } catch (error: any) {
    console.error('Error procesando eliminación de categoría:', error);
    return NextResponse.json(
      { error: error.message || 'Error inesperado al eliminar categoría' },
      { status: 500 }
    );
  }
}

