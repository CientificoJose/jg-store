-- Migration: Create orders and order_items tables for JG Store (Argentina B2B/B2C)
-- Date: 2026-09-26

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL, -- e.g. 'JG-2026-1042'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Tipo de Venta
    order_type VARCHAR(20) NOT NULL DEFAULT 'retail' CHECK (order_type IN ('retail', 'wholesale')),
    
    -- Datos del Comprador
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_email VARCHAR(150),
    document_type VARCHAR(10) DEFAULT 'DNI' CHECK (document_type IN ('DNI', 'CUIT')),
    document_number VARCHAR(30) NOT NULL,
    invoice_type VARCHAR(5) DEFAULT 'B' CHECK (invoice_type IN ('A', 'B')),
    
    -- Domicilio / Destino
    province VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    
    -- Logística & Envíos
    shipping_method VARCHAR(50) NOT NULL DEFAULT 'andreani' CHECK (shipping_method IN ('andreani', 'correo_argentino', 'expreso_interior', 'pickup')),
    shipping_status VARCHAR(30) NOT NULL DEFAULT 'preparing' CHECK (shipping_status IN ('preparing', 'ready_for_pickup', 'shipped', 'delivered')),
    shipping_cost NUMERIC(14, 2) DEFAULT 0.00,
    tracking_number VARCHAR(100),
    
    -- Pagos & Finanzas (en Pesos Argentinos $ ARS)
    payment_method VARCHAR(50) NOT NULL DEFAULT 'bank_transfer' CHECK (payment_method IN ('mercado_pago', 'bank_transfer', 'cash_pickup')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'rejected', 'refunded')),
    subtotal NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_savings NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    
    -- Estado General del Pedido
    order_status VARCHAR(30) NOT NULL DEFAULT 'nueva' CHECK (order_status IN ('nueva', 'en_proceso', 'lista_despacho', 'completada', 'cancelada')),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    image_url TEXT,
    unit VARCHAR(30) DEFAULT 'unidad',
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14, 2) NOT NULL,
    subtotal NUMERIC(14, 2) NOT NULL,
    is_wholesale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_order_type ON public.orders(order_type);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to orders"
    ON public.orders FOR SELECT USING (true);

CREATE POLICY "Allow public insert to orders"
    ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to orders"
    ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public read access to order_items"
    ON public.order_items FOR SELECT USING (true);

CREATE POLICY "Allow public insert to order_items"
    ON public.order_items FOR INSERT WITH CHECK (true);
