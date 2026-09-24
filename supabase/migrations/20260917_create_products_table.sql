-- ==============================================================================
-- JG Store - Estructura de Catálogo (B2B + B2C) y Stock para Supabase / PostgreSQL
-- ==============================================================================

-- 1. Crear tabla de productos
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_slug VARCHAR(100) NOT NULL,
  category_name VARCHAR(150) NOT NULL,
  retail_price NUMERIC(10, 2) NOT NULL CHECK (retail_price >= 0),
  wholesale_price NUMERIC(10, 2) NOT NULL CHECK (wholesale_price >= 0),
  min_wholesale_qty INTEGER NOT NULL DEFAULT 6 CHECK (min_wholesale_qty >= 1),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url TEXT,
  unit VARCHAR(50) DEFAULT 'unidad',
  featured BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Política de lectura pública (cualquier cliente anónimo puede ver productos)
CREATE POLICY "Permitir lectura pública de productos"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Política de modificación para rol de servicio / autenticado
CREATE POLICY "Permitir gestión de productos para administradores"
  ON public.products
  FOR ALL
  TO service_role
  USING (true);

-- 4. Notificación para PostgREST (recargar esquema)
NOTIFY pgrst, 'reload schema';
