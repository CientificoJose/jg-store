-- ==============================================================================
-- JG STORE - MIGRACIÓN: CATEGORÍAS RECURSIVAS DE PROFUNDIDAD INFINITA,
-- PRECIO COSTO ORIGINAL, MÁRGENES DUALES B2B/B2C Y PRECIOS QUEMADOS EN ÓRDENES
-- Fecha: 2026-10-13
-- ==============================================================================

-- 1. ADAPTAR O CREAR TABLA DE CATEGORÍAS RECURSIVAS (PROFUNDIDAD INFINITA)
CREATE TABLE IF NOT EXISTS public.categories (
    id VARCHAR(150) PRIMARY KEY,
    slug VARCHAR(150) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    image_url TEXT,
    parent_id VARCHAR(150) REFERENCES public.categories(id) ON DELETE CASCADE,
    level INT NOT NULL DEFAULT 1,
    path TEXT,
    full_slug_path TEXT,
    is_seasonal BOOLEAN DEFAULT false,
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existía, asegurar columnas de recursividad
ALTER TABLE public.categories
    ADD COLUMN IF NOT EXISTS parent_id VARCHAR(150) REFERENCES public.categories(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS path TEXT,
    ADD COLUMN IF NOT EXISTS full_slug_path TEXT;

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON public.categories(level);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);

-- 2. ADAPTAR TABLA DE PRODUCTOS (COSTO, MÁRGENES DUALES Y TRAZABILIDAD CORONEL)
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS supplier_code VARCHAR(100),
    ADD COLUMN IF NOT EXISTS barcode VARCHAR(100),
    ADD COLUMN IF NOT EXISTS cost_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS retail_margin_pct NUMERIC(6, 2) DEFAULT 40.00,
    ADD COLUMN IF NOT EXISTS wholesale_margin_pct NUMERIC(6, 2) DEFAULT 18.00,
    ADD COLUMN IF NOT EXISTS full_category_path TEXT,
    ADD COLUMN IF NOT EXISTS category_levels JSONB DEFAULT '[]',
    ADD COLUMN IF NOT EXISTS depth_level INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_supplier_code ON public.products(supplier_code);
CREATE INDEX IF NOT EXISTS idx_products_cost_price ON public.products(cost_price);

-- Backfill: asegurar que los productos existentes tengan cost_price inicial basado en retail_price
UPDATE public.products
SET 
    cost_price = ROUND(retail_price / 1.40, 2),
    retail_margin_pct = 40.00,
    wholesale_margin_pct = 18.00
WHERE (cost_price IS NULL OR cost_price = 0) AND retail_price > 0;

-- 3. ADAPTAR TABLA DE ÍTEMS DE ORDEN PARA PRECIOS QUEMADOS HISTÓRICOS (SNAPSHOT)
ALTER TABLE public.order_items
    ADD COLUMN IF NOT EXISTS cost_price_at_sale NUMERIC(14, 2) DEFAULT 0.00,
    ADD COLUMN IF NOT EXISTS category_snapshot VARCHAR(200);

-- 4. FUNCIÓN SQL PARA RECÁLCULO MASIVO E INSTANTÁNEO DE MÁRGENES
CREATE OR REPLACE FUNCTION public.recalculate_product_margins(
    p_scope TEXT DEFAULT 'all',           -- 'all' o 'category'
    p_category_id TEXT DEFAULT NULL,       -- ID o slug de la categoría si scope = 'category'
    p_retail_margin NUMERIC DEFAULT NULL,  -- ej: 40.0
    p_wholesale_margin NUMERIC DEFAULT NULL-- ej: 18.0
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_updated_count INT := 0;
BEGIN
    UPDATE public.products
    SET
        retail_margin_pct = COALESCE(p_retail_margin, retail_margin_pct),
        wholesale_margin_pct = COALESCE(p_wholesale_margin, wholesale_margin_pct),
        retail_price = CASE 
            WHEN p_retail_margin IS NOT NULL AND cost_price > 0 
            THEN ROUND(cost_price * (1.0 + p_retail_margin / 100.0), 2)
            ELSE retail_price 
        END,
        wholesale_price = CASE 
            WHEN p_wholesale_margin IS NOT NULL AND cost_price > 0 
            THEN ROUND(cost_price * (1.0 + p_wholesale_margin / 100.0), 2)
            ELSE wholesale_price 
        END,
        updated_at = now()
    WHERE 
        cost_price > 0
        AND (
            p_scope = 'all'
            OR (p_scope = 'category' AND (category_id = p_category_id OR category_slug = p_category_id))
        );

    GET DIAGNOSTICS v_updated_count = ROW_COUNT;

    RETURN jsonb_build_object(
        'success', true,
        'updated_count', v_updated_count,
        'scope', p_scope,
        'retail_margin', p_retail_margin,
        'wholesale_margin', p_wholesale_margin
    );
END;
$$;
