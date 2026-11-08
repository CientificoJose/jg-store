import { NextRequest, NextResponse } from 'next/server';

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
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

const DEFAULT_CONFIG = {
  id: 'default',
  general: {
    whatsappNumber: '04124779112',
    storeName: 'JG Store Polirrubro',
    storeTagline: 'Distribuidora Mayorista & Venta al Detal',
    footerDescription:
      'Distribuidora oficial y polirrubro líder en ventas al por mayor y menor. Catálogo con más de 24 departamentos comerciales, envíos seguros a todo el país y precios directos con descuentos automáticos por volumen.',
    address: 'Av. Corrientes 1234, CABA, Argentina',
    email: 'ventas@jgstore.com.ar',
    cuit: '30-71234567-8',
    schedule: 'Lunes a Sábado de 8:00 a 18:00 hs',
    socialInstagram: 'https://instagram.com/jgstore.oficial',
    socialFacebook: 'https://facebook.com/jgstore.argentina',
    socialTikTok: 'https://tiktok.com/@jgstore.polirrubro',
    bankName: 'Banco Santander / Mercado Pago',
    bankAccountHolder: 'JG Store Polirrubro',
    bankCbu: '0720000000000000000000',
    bankAlias: 'JG.STORE.PAGOS'
  },
  landing: {},
  theme: {
    activeTheme: 'default',
    defaultMode: 'dark'
  }
};

export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/store_config?id=eq.default&select=*`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!res.ok) {
      console.warn('⚠️ No se pudo leer store_config de Supabase, usando valores por defecto:', res.status);
      return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
    }

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
    }

    const row = rows[0];
    const mergedConfig = {
      id: 'default',
      general: { ...DEFAULT_CONFIG.general, ...(row.general || {}) },
      landing: { ...DEFAULT_CONFIG.landing, ...(row.landing || {}) },
      theme: { ...DEFAULT_CONFIG.theme, ...(row.theme || {}) }
    };

    return NextResponse.json({ success: true, config: mergedConfig });
  } catch (err: any) {
    console.error('Error en GET /api/config:', err);
    return NextResponse.json({ success: true, config: DEFAULT_CONFIG });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { general, landing, theme } = body;

    // Obtener configuración actual para mergear
    let currentConfig: any = DEFAULT_CONFIG;
    try {
      const getRes = await fetch(`${SUPABASE_URL}/rest/v1/store_config?id=eq.default&select=*`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      });
      if (getRes.ok) {
        const rows = await getRes.json();
        if (rows && rows.length > 0) {
          currentConfig = rows[0];
        }
      }
    } catch {
      // Ignorar error al leer previo
    }

    const payload = {
      id: 'default',
      general: general ? { ...(currentConfig.general || DEFAULT_CONFIG.general), ...general } : currentConfig.general,
      landing: landing ? { ...(currentConfig.landing || DEFAULT_CONFIG.landing), ...landing } : currentConfig.landing,
      theme: theme ? { ...(currentConfig.theme || DEFAULT_CONFIG.theme), ...theme } : currentConfig.theme,
      updated_at: new Date().toISOString()
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/store_config`, {
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
      const errorText = await res.text();
      console.error('Error al guardar store_config en Supabase:', errorText);
      return NextResponse.json({ success: false, error: errorText }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, config: data[0] || payload });
  } catch (err: any) {
    console.error('Error en POST /api/config:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
