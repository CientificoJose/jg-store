import { NextResponse } from 'next/server';
import { fetchStoreCategories } from '@/lib/store-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await fetchStoreCategories();
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json({ error: 'Error al cargar categorías' }, { status: 500 });
  }
}
