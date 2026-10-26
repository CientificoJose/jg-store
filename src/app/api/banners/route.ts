import { NextRequest, NextResponse } from 'next/server';
import { BannerDbRow, CarouselSlide, mapDbRowToSlide, mapSlideToDbRow } from '@/types/banner';

export const dynamic = 'force-dynamic';

const rawUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  (process.env.SUPABASE_HOST ? `https://${process.env.SUPABASE_HOST}` : 'https://jg-store-bd.press-cloud.com');
const SUPABASE_URL = rawUrl.startsWith('http://') && rawUrl.includes('press-cloud.com')
  ? rawUrl.replace('http://', 'https://')
  : rawUrl;

const SUPABASE_KEY =
  process.env.SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

export const FALLBACK_SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    tag: '🇦🇷 DISTRIBUIDORA POLIRRUBRO • BUENOS AIRES',
    tagColor: '#E63946',
    title: 'COMPRÁ AL MAYOR',
    titleAccent: 'DESDE $ 50.000 ARS',
    subtitle:
      'Desbloqueá tarifas mayoristas en toda tu compra al alcanzar el monto global de $ 50.000 o comprando por bulto cerrado. Despachos a todo el país.',
    image:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Explorar Catálogo',
    primaryActionType: 'explore',
    categorySlug: '',
    secondaryActionLabel: 'Activar Modo Mayorista',
    secondaryActionType: 'wholesale',
    features: ['Factura A con CUIT', 'Despacho por Expresos', 'Mínimo Mayorista $ 50.000'],
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'slide-2',
    tag: '✨ TENDENCIAS & TEMPORADA BAZAR',
    tagColor: '#D4A017',
    title: 'AROMATIZACIÓN, BAZAR',
    titleAccent: '& DECORACIÓN',
    subtitle:
      'Difusores varillas 250ml, velas aromáticas, vasos térmicos de acero y organizadores giratorios 360° con hasta 25% OFF llevando por docena.',
    image:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Ver Aromatización & Velas',
    primaryActionType: 'category',
    categorySlug: 'aromatizacion-velas',
    secondaryActionLabel: 'Cotizar por WhatsApp',
    secondaryActionType: 'whatsapp',
    features: ['Hasta 25% OFF por Bulto', 'Fragancias Importadas', 'Stock Inmediato'],
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'slide-3',
    tag: '🎧 GADGETS & TECNOLOGÍA SMART',
    tagColor: '#FF85A2',
    title: 'AURICULARES & GADGETS',
    titleAccent: 'SMART DIGITAL',
    subtitle:
      'Auriculares inalámbricos Bluetooth JG Sound, termos digitales con pantalla LED touch y accesorios de última generación con garantía asegurada.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Ver Bazar & Gadgets',
    primaryActionType: 'category',
    categorySlug: 'bazar-cocina',
    secondaryActionLabel: 'Consultar Stock por WhatsApp',
    secondaryActionType: 'whatsapp',
    features: ['Sonido de Alta Fidelidad', 'Display Digital LED', 'Garantía Oficial JG'],
    isActive: true,
    displayOrder: 3
  },
  {
    id: 'slide-4',
    tag: '💳 MEDIOS DE PAGO NACIONALES',
    tagColor: '#25D366',
    title: '10% DE DESCUENTO EN',
    titleAccent: 'TRANSFERENCIAS CBU / ALIAS',
    subtitle:
      'Aboná por CBU, CVU o Alias y obtené 10% OFF directo en tu orden. También podés pagar en cuotas con Mercado Pago y todas las tarjetas.',
    image:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&auto=format&fit=crop&q=80',
    primaryActionLabel: 'Comprar con 10% OFF',
    primaryActionType: 'explore',
    categorySlug: '',
    secondaryActionLabel: 'Hablar con un Asesor',
    secondaryActionType: 'whatsapp',
    features: ['10% OFF Inmediato', 'Mercado Pago en Cuotas', 'Factura A y B AFIP'],
    isActive: true,
    displayOrder: 4
  }
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const includeAll = searchParams.get('all') === 'true';

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/banners?order=display_order.asc`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.warn('Supabase banners query failed, using fallback slides:', res.status);
      return NextResponse.json(
        includeAll ? FALLBACK_SLIDES : FALLBACK_SLIDES.filter((s) => s.isActive !== false)
      );
    }

    const rows: BannerDbRow[] = await res.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        includeAll ? FALLBACK_SLIDES : FALLBACK_SLIDES.filter((s) => s.isActive !== false)
      );
    }

    const slides = rows.map(mapDbRowToSlide);
    const result = includeAll ? slides : slides.filter((s) => s.isActive);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      includeAll ? FALLBACK_SLIDES : FALLBACK_SLIDES.filter((s) => s.isActive !== false)
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Caso 1: Restablecer valores predeterminados
    if (body.action === 'reset') {
      // Eliminar actuales y volver a insertar semillas
      await fetch(`${SUPABASE_URL}/rest/v1/banners`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      });

      const seedRows = FALLBACK_SLIDES.map(mapSlideToDbRow);
      await fetch(`${SUPABASE_URL}/rest/v1/banners`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(seedRows)
      });

      return NextResponse.json({ success: true, message: 'Banners restablecidos a valores por defecto' });
    }

    // Caso 2: Reordenar múltiples slides
    if (Array.isArray(body)) {
      const dbRows = body.map((slide, index) => {
        const item = mapSlideToDbRow({
          ...slide,
          displayOrder: index + 1
        });
        return item;
      });

      const res = await fetch(`${SUPABASE_URL}/rest/v1/banners`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbRows)
      });

      if (!res.ok) {
        throw new Error(`Failed to reorder banners: ${await res.text()}`);
      }

      return NextResponse.json({ success: true, count: dbRows.length });
    }

    // Caso 3: Guardar o actualizar un slide individual
    const rawSlide = body as CarouselSlide;
    if (!rawSlide.title || !rawSlide.image) {
      return NextResponse.json(
        { error: 'El título y la imagen del banner son obligatorios.' },
        { status: 400 }
      );
    }

    const slideToSave: CarouselSlide = {
      ...rawSlide,
      id: rawSlide.id || `slide-${Date.now()}`,
      isActive: rawSlide.isActive !== false,
      displayOrder: Number(rawSlide.displayOrder) || 1,
      features: Array.isArray(rawSlide.features)
        ? rawSlide.features.filter(Boolean)
        : []
    };

    const dbRow = mapSlideToDbRow(slideToSave);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/banners`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(dbRow)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error saving banner to Supabase:', errText);
      return NextResponse.json(
        { error: 'Error al persistir el banner en la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      banner: slideToSave,
      message: `Banner "${slideToSave.title}" guardado exitosamente.`
    });
  } catch (error: any) {
    console.error('Error in POST /api/banners:', error);
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al procesar el banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID de banner no proporcionado' }, { status: 400 });
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/banners?id=eq.${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Error deleting banner in Supabase:', errText);
      return NextResponse.json(
        { error: 'No se pudo eliminar el banner de la base de datos' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id, message: 'Banner eliminado exitosamente' });
  } catch (error: any) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { error: error?.message || 'Error inesperado al eliminar el banner' },
      { status: 500 }
    );
  }
}
