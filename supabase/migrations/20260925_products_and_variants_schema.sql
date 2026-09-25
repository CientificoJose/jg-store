-- ==============================================================================
-- JG STORE - ESQUEMA COMPLETO DE PRODUCTOS, VARIANTES Y PRECIOS B2B / B2C
-- ==============================================================================

-- 1. Tabla de Categorías Oficiales (24 Rubros)
CREATE TABLE IF NOT EXISTS public.categories (
  id VARCHAR(50) PRIMARY KEY, -- Slug único (ej: 'bazar-cocina')
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  is_seasonal BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla Principal de Productos (Padre)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(50) UNIQUE NOT NULL,                       -- Código único principal (ej: 'JG-BAZ-001')
  barcode VARCHAR(50),                                   -- Código de barras físico (EAN-13 / UPC)
  name VARCHAR(255) NOT NULL,                            -- Nombre comercial
  description TEXT,                                      -- Descripción detallada
  category_id VARCHAR(50) REFERENCES public.categories(id) ON DELETE RESTRICT,
  category_slug VARCHAR(100) NOT NULL,
  category_name VARCHAR(150) NOT NULL,
  brand VARCHAR(100) DEFAULT 'JG Store',                 -- Marca o fabricante
  unit VARCHAR(50) DEFAULT 'unidad',                     -- 'unidad', 'pack', 'docena', 'caja', 'set'
  
  -- Estructura Comercial y Márgenes (B2B + B2C)
  cost_price NUMERIC(10, 2) DEFAULT 0 CHECK (cost_price >= 0),           -- Costo unitario de compra
  wholesale_margin_pct NUMERIC(5, 2) DEFAULT 30.00,                      -- % margen mayorista deseado
  wholesale_price NUMERIC(10, 2) NOT NULL CHECK (wholesale_price >= 0),  -- Precio mayorista por unidad
  min_wholesale_qty INTEGER NOT NULL DEFAULT 6 CHECK (min_wholesale_qty >= 1), -- Cantidad mínima para activar precio mayorista
  
  retail_margin_pct NUMERIC(5, 2) DEFAULT 60.00,                         -- % margen minorista deseado
  retail_price NUMERIC(10, 2) NOT NULL CHECK (retail_price >= 0),        -- PVP precio venta al detal
  
  tier2_wholesale_price NUMERIC(10, 2),                  -- Precio especial por bulto/caja cerrada
  tier2_min_qty INTEGER,                                 -- Cantidad para bulto cerrado (ej: 24, 48)

  -- Inventario y Almacén
  has_variants BOOLEAN DEFAULT false,                    -- Indica si el stock se gestiona por variantes
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),   -- Stock total disponible
  min_stock_alert INTEGER DEFAULT 5,                     -- Umbral de alerta para reposición
  warehouse_location VARCHAR(50),                        -- Ubicación física en depósito (ej: 'P1-E2-N1')
  weight_kg NUMERIC(6, 3),                               -- Peso en kilogramos
  dimensions_cm VARCHAR(50),                             -- Dimensiones (Largo x Ancho x Alto)

  -- Multimedia y Visibilidad
  image_url TEXT,                                        -- Imagen principal en alta definición
  gallery_urls TEXT[] DEFAULT '{}',                      -- Galería de imágenes secundarias
  featured BOOLEAN DEFAULT false,                        -- Destacado en página principal
  is_seasonal BOOLEAN DEFAULT false,                     -- Producto estacional
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Variantes (Hijos: Color, Talla, Medida, etc.)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_sku VARCHAR(60) UNIQUE NOT NULL,               -- Ej: 'JG-BAZ-001-NEG'
  barcode VARCHAR(50),                                   -- Código de barra específico de la variante
  attribute_color VARCHAR(50),                           -- Color (ej: 'Negro Mate', 'Azul')
  attribute_size VARCHAR(50),                            -- Talla, Capacidad o Medida (ej: '750ml', 'L')
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),   -- Stock físico de esta variante específica
  price_adjustment NUMERIC(10, 2) DEFAULT 0,             -- Variación de precio si aplica (+/-)
  image_url TEXT,                                        -- Foto de la variante
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Índices para Búsqueda Ultra Rápida
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);
CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(variant_sku);

-- 5. Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de productos activos"
  ON public.products FOR SELECT TO public
  USING (status = 'active');

CREATE POLICY "Lectura pública de variantes"
  ON public.product_variants FOR SELECT TO public
  USING (true);

CREATE POLICY "Gestión completa para administradores"
  ON public.products FOR ALL TO service_role
  USING (true);

CREATE POLICY "Gestión de variantes para administradores"
  ON public.product_variants FOR ALL TO service_role
  USING (true);

-- 6. Trigger para sincronizar automáticamente el stock total del producto con sus variantes
CREATE OR REPLACE FUNCTION public.sync_product_variant_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.products
    SET stock = COALESCE((SELECT SUM(stock) FROM public.product_variants WHERE product_id = OLD.product_id), 0),
        updated_at = now()
    WHERE id = OLD.product_id AND has_variants = true;
    RETURN OLD;
  ELSE
    UPDATE public.products
    SET stock = COALESCE((SELECT SUM(stock) FROM public.product_variants WHERE product_id = NEW.product_id), 0),
        updated_at = now()
    WHERE id = NEW.product_id AND has_variants = true;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_variant_stock ON public.product_variants;
CREATE TRIGGER trg_sync_variant_stock
AFTER INSERT OR UPDATE OF stock OR DELETE ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION public.sync_product_variant_stock();

NOTIFY pgrst, 'reload schema';
