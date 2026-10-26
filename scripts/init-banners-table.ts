export {};

const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

const DEFAULT_SLIDES = [
  {
    id: 'slide-1',
    tag: '🇦🇷 DISTRIBUIDORA POLIRRUBRO • BUENOS AIRES',
    tag_color: '#E63946',
    title: 'COMPRÁ AL MAYOR',
    title_accent: 'DESDE $ 50.000 ARS',
    subtitle:
      'Desbloqueá tarifas mayoristas en toda tu compra al alcanzar el monto global de $ 50.000 o comprando por bulto cerrado. Despachos a todo el país.',
    image_url:
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&auto=format&fit=crop&q=80',
    primary_action_label: 'Explorar Catálogo',
    primary_action_type: 'explore',
    category_slug: '',
    secondary_action_label: 'Activar Modo Mayorista',
    secondary_action_type: 'wholesale',
    features: ['Factura A con CUIT', 'Despacho por Expresos', 'Mínimo Mayorista $ 50.000'],
    is_active: true,
    display_order: 1
  },
  {
    id: 'slide-2',
    tag: '✨ TENDENCIAS & TEMPORADA BAZAR',
    tag_color: '#D4A017',
    title: 'AROMATIZACIÓN, BAZAR',
    title_accent: '& DECORACIÓN',
    subtitle:
      'Difusores varillas 250ml, velas aromáticas, vasos térmicos de acero y organizadores giratorios 360° con hasta 25% OFF llevando por docena.',
    image_url:
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=1600&auto=format&fit=crop&q=80',
    primary_action_label: 'Ver Aromatización & Velas',
    primary_action_type: 'category',
    category_slug: 'aromatizacion-velas',
    secondary_action_label: 'Cotizar por WhatsApp',
    secondary_action_type: 'whatsapp',
    features: ['Hasta 25% OFF por Bulto', 'Fragancias Importadas', 'Stock Inmediato'],
    is_active: true,
    display_order: 2
  },
  {
    id: 'slide-3',
    tag: '🎧 GADGETS & TECNOLOGÍA SMART',
    tag_color: '#FF85A2',
    title: 'AURICULARES & GADGETS',
    title_accent: 'SMART DIGITAL',
    subtitle:
      'Auriculares inalámbricos Bluetooth JG Sound, termos digitales con pantalla LED touch y accesorios de última generación con garantía asegurada.',
    image_url:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
    primary_action_label: 'Ver Bazar & Gadgets',
    primary_action_type: 'category',
    category_slug: 'bazar-cocina',
    secondary_action_label: 'Consultar Stock por WhatsApp',
    secondary_action_type: 'whatsapp',
    features: ['Sonido de Alta Fidelidad', 'Display Digital LED', 'Garantía Oficial JG'],
    is_active: true,
    display_order: 3
  },
  {
    id: 'slide-4',
    tag: '💳 MEDIOS DE PAGO NACIONALES',
    tag_color: '#25D366',
    title: '10% DE DESCUENTO EN',
    title_accent: 'TRANSFERENCIAS CBU / ALIAS',
    subtitle:
      'Aboná por CBU, CVU o Alias y obtené 10% OFF directo en tu orden. También podés pagar en cuotas con Mercado Pago y todas las tarjetas.',
    image_url:
      'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1600&auto=format&fit=crop&q=80',
    primary_action_label: 'Comprar con 10% OFF',
    primary_action_type: 'explore',
    category_slug: '',
    secondary_action_label: 'Hablar con un Asesor',
    secondary_action_type: 'whatsapp',
    features: ['10% OFF Inmediato', 'Mercado Pago en Cuotas', 'Factura A y B AFIP'],
    is_active: true,
    display_order: 4
  }
];

async function main() {
  console.log('🚀 Inicializando tabla de banners...');

  const ddlQuery = `
    CREATE TABLE IF NOT EXISTS public.banners (
      id TEXT PRIMARY KEY,
      tag TEXT NOT NULL DEFAULT '',
      tag_color TEXT DEFAULT '#E63946',
      title TEXT NOT NULL,
      title_accent TEXT DEFAULT '',
      subtitle TEXT DEFAULT '',
      image_url TEXT NOT NULL,
      primary_action_label TEXT DEFAULT 'Explorar Catálogo',
      primary_action_type TEXT DEFAULT 'explore',
      category_slug TEXT DEFAULT '',
      secondary_action_label TEXT DEFAULT 'Cotizar por WhatsApp',
      secondary_action_type TEXT DEFAULT 'whatsapp',
      features JSONB DEFAULT '[]'::jsonb,
      is_active BOOLEAN DEFAULT true,
      display_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    GRANT ALL ON TABLE public.banners TO anon;
    GRANT ALL ON TABLE public.banners TO authenticated;
    GRANT ALL ON TABLE public.banners TO service_role;
    NOTIFY pgrst, 'reload schema';
  `;

  const ddlRes = await fetch(`${BASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: ddlQuery })
  });

  if (!ddlRes.ok) {
    console.error('❌ Error creando tabla banners:', await ddlRes.text());
    process.exit(1);
  }
  console.log('✅ Tabla banners creada / verificada con éxito.');

  // Comprobar si ya existen banners
  const checkRes = await fetch(`${BASE_URL}/rest/v1/banners?select=id&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  if (checkRes.ok) {
    const existing = await checkRes.json();
    if (existing && existing.length > 0) {
      console.log(`ℹ️ La tabla banners ya contiene ${existing.length} registros. No es necesario insertar semillas.`);
      return;
    }
  }

  // Insertar slides por defecto
  console.log('🌱 Insertando banners por defecto...');
  for (const slide of DEFAULT_SLIDES) {
    const insertRes = await fetch(`${BASE_URL}/rest/v1/banners`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates'
      },
      body: JSON.stringify(slide)
    });

    if (insertRes.ok) {
      console.log(`   ✔️ Banner "${slide.title}" insertado.`);
    } else {
      console.warn(`   ⚠️ Fallo al insertar banner "${slide.title}":`, await insertRes.text());
    }
  }

  console.log('🎉 Migración de banners completada con éxito.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
