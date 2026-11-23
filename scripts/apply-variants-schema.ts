const BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jg-store-bd.press-cloud.com';
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3ODkwNTU2NzQsImV4cCI6MTg5MzQ1NjAwMCwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlzcyI6InN1cGFiYXNlIn0.P5JT7GeyL83BMSwCLkSCqIY9TIo2VGxv86tlYwXXZ2A';

async function main() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.product_variants (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
      variant_sku VARCHAR(80) UNIQUE NOT NULL,
      barcode VARCHAR(50),
      attribute_color VARCHAR(50),
      attribute_size VARCHAR(50),
      stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
      price_adjustment NUMERIC(10, 2) DEFAULT 0,
      image_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(variant_sku);

    ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Lectura pública de variantes'
      ) THEN
        CREATE POLICY "Lectura pública de variantes" ON public.product_variants FOR SELECT TO public USING (true);
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Gestión de variantes para administradores'
      ) THEN
        CREATE POLICY "Gestión de variantes para administradores" ON public.product_variants FOR ALL TO service_role USING (true);
      END IF;
    END
    $$;

    GRANT ALL ON TABLE public.product_variants TO anon, authenticated, service_role;

    NOTIFY pgrst, 'reload schema';
  `;

  const res = await fetch(`${BASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: sql })
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`❌ Error: ${res.status}`, text);
    process.exit(1);
  }

  const result = await res.json();
  console.log('✅ Result:', result);

  await new Promise((r) => setTimeout(r, 1000));

  const testRes = await fetch(`${BASE_URL}/rest/v1/product_variants?select=*&limit=1`, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`
    }
  });

  console.log(`📡 PostgREST /product_variants status: ${testRes.status}`);
  if (testRes.ok) {
    const data = await testRes.json();
    console.log('✨ Acceso a product_variants confirmado:', data);
  }
}

main().catch(console.error);

export {};
