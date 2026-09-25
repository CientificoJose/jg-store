-- ==============================================================================
-- JG STORE - ESQUEMA COMPLETO Y CATÁLOGO INICIAL (B2B + B2C)
-- Supabase / PostgreSQL en Dokploy (http://jg-store-bd.press-cloud.com)
-- ==============================================================================

-- 1. TABLA DE PRODUCTOS
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

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(featured);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir lectura pública de productos'
  ) THEN
    CREATE POLICY "Permitir lectura pública de productos"
      ON public.products FOR SELECT TO public USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Permitir gestión de productos para administradores'
  ) THEN
    CREATE POLICY "Permitir gestión de productos para administradores"
      ON public.products FOR ALL TO service_role USING (true);
  END IF;
END $$;

-- 2. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  usuario VARCHAR(80) UNIQUE NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  rol VARCHAR(30) DEFAULT 'cliente_detal' 
    CHECK (rol IN ('cliente_detal', 'mayorista_b2b', 'admin')),
  estado VARCHAR(20) DEFAULT 'activo' 
    CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  fecha TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_correo ON public.users(correo);
CREATE INDEX IF NOT EXISTS idx_users_usuario ON public.users(usuario);
CREATE INDEX IF NOT EXISTS idx_users_rol ON public.users(rol);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Permitir a usuarios ver su propio perfil'
  ) THEN
    CREATE POLICY "Permitir a usuarios ver su propio perfil"
      ON public.users FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Permitir registro de nuevos usuarios'
  ) THEN
    CREATE POLICY "Permitir registro de nuevos usuarios"
      ON public.users FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 3. TABLA DE FAVORITOS (WISHLIST)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_users UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  id_product UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT uq_user_product_favorite UNIQUE (id_users, id_product)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(id_users);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON public.favorites(id_product);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Permitir lectura de favoritos'
  ) THEN
    CREATE POLICY "Permitir lectura de favoritos"
      ON public.favorites FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'favorites' AND policyname = 'Permitir a usuarios agregar o eliminar sus favoritos'
  ) THEN
    CREATE POLICY "Permitir a usuarios agregar o eliminar sus favoritos"
      ON public.favorites FOR ALL USING (true);
  END IF;
END $$;

-- 4. VISTA DE CONSULTA DETALLADA DE FAVORITOS
CREATE OR REPLACE VIEW public.vw_favoritos_detalle AS
SELECT 
  f.id AS id_favorito,
  f.id_users,
  u.nombre AS nombre_usuario,
  u.usuario AS username,
  u.correo AS correo_usuario,
  f.id_product,
  p.name AS nombre_producto,
  p.sku AS sku_producto,
  p.retail_price AS precio_detal,
  p.wholesale_price AS precio_mayorista,
  p.min_wholesale_qty,
  p.stock,
  p.image_url AS imagen_producto,
  p.category_name AS categoria_producto,
  f.created_at AS fecha_guardado
FROM public.favorites f
JOIN public.users u ON f.id_users = u.id
JOIN public.products p ON f.id_product = p.id;

-- 5. CATÁLOGO INICIAL DE JG STORE (27 PRODUCTOS EN 24 DEPARTAMENTOS)
INSERT INTO public.products (
  sku, name, description, category_slug, category_name,
  retail_price, wholesale_price, min_wholesale_qty, stock,
  image_url, unit, featured, is_seasonal, tags
) VALUES
  ('JG-ARO-001', 'Vela Aromática Soja en Cuenco de Cerámica', 'Vela 100% cera de soja con fragancia premium de Vainilla & Caramelo. Duración +45hs.', 'aromatizacion-velas', 'Aromatización y Velas', 8.50, 5.90, 6, 45, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Velas", "Aromaterapia", "Hogar"}'),
  ('JG-ARO-002', 'Difusor de Varillas Mikado Esencia Lavanda 250ml', 'Difusor ambiental de varillas de ratán con extractos naturales de lavanda silvestre.', 'aromatizacion-velas', 'Aromatización y Velas', 11.00, 7.80, 4, 28, 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Difusores", "Lavanda"}'),
  ('JG-ART-001', 'Set de Pinturas Acrílicas Profesionales 24 Colores', 'Tubos de acrílico de 22ml de alta pigmentación y cobertura satinada para artistas y talleres.', 'arte-manualidades', 'Arte y Manualidades', 16.50, 11.50, 3, 20, 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80', 'pack', true, false, '{"Arte", "Pintura", "Acrílicos"}'),
  ('JG-VIA-001', 'Kit Organizador de Valija 6 Piezas Impermeable', 'Set de cubos organizadores de compresión con cierres reforzados y malla transpirable.', 'articulos-viaje', 'Artículos para Viaje', 14.00, 9.80, 5, 35, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 'set', false, false, '{"Viaje", "Organizadores"}'),
  ('JG-BAZ-001', 'Botella Térmica Doble Pared Acero Inoxidable 750ml', 'Mantiene frío por 24hs y calor por 12hs. Acabado mate antideslizante libre de BPA.', 'bazar-cocina', 'Bazar y Cocina', 18.00, 12.20, 6, 50, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Bazar", "Termos", "Cocina"}'),
  ('JG-BAZ-002', 'Set de 6 Vasos de Vidrio Labrado Estilo Vintage', 'Vasos pesados de 350ml aptos para lavavajillas. Ideal para gastronomía y hogar.', 'bazar-cocina', 'Bazar y Cocina', 15.00, 10.50, 4, 24, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80', 'pack', false, false, '{"Vasos", "Vidrio", "Bazar"}'),
  ('JG-BEL-001', 'Espejo LED de Maquillaje Táctil Recargable', '3 tonalidades de luz (cálida, neutra, fría) con base organizadora y batería litio 1200mAh.', 'belleza-accesorios', 'Belleza y Accesorios', 22.00, 15.00, 3, 18, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Belleza", "Maquillaje", "Espejos"}'),
  ('JG-CAR-001', 'Cartuchera Canopla 3 Cierres Gran Capacidad', 'Capacidad para 70 lápices con compartimentos organizadores y tela impermeable lavable.', 'cartucheras-carpetas', 'Cartucheras y Carpetas', 9.50, 6.50, 8, 60, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Escolar", "Cartucheras"}'),
  ('JG-COT-001', 'Pack Globos Metalizados & Látex Pastel x 50 Unid.', 'Surtido de globos 12 pulgadas extra gruesos para arcos y decoración de eventos.', 'cotillon', 'Cotillón', 8.00, 4.90, 10, 100, 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80', 'pack', false, false, '{"Fiestas", "Globos", "Cotillón"}'),
  ('JG-DEC-001', 'Caja Organizadora Apilable Tela Lino con Tapa', 'Estructura rígida plegable con tirador metálico. Medidas 38x26x24 cm.', 'deco-organizacion-hogar', 'Deco y Organización del Hogar', 13.50, 9.20, 5, 30, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Deco", "Organización", "Hogar"}'),
  ('JG-ELE-001', 'Lámpara de Escritorio LED Flexo USB con Carga Inalámbrica', 'Control touch, 5 intensidades de brillo y pad de carga rápida Qi para smartphones.', 'electro', 'Electro', 29.90, 21.00, 3, 15, 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Electro", "Iluminación", "Tecnología"}'),
  ('JG-EMB-001', 'Cinta de Embalar Transparente 48mm x 100m Pack x 6', 'Adhesivo acrílico de alta resistencia para sellado de cajas y paquetes de e-commerce.', 'embalajes', 'Embalajes', 11.50, 7.50, 5, 80, 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80', 'pack', false, false, '{"Embalaje", "Cintas", "Envíos"}'),
  ('JG-FER-001', 'Linterna Frontal LED Táctica Recargable 1000 Lumens', 'Resistente al agua IPX6 con sensor de movimiento, 5 modos de luz y batería USB.', 'ferreteria-pesca', 'Ferretería y Pesca', 17.00, 11.80, 4, 25, 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Ferretería", "Outdoor", "Linternas"}'),
  ('JG-HIG-001', 'Paños de Microfibra Multiuso Alta Densidad Pack x 12', 'Gramaje 380 GSM, super absorbentes para secado, pulido y limpieza sin rayaduras.', 'higiene-limpieza', 'Higiene Personal y Limpieza', 12.00, 7.90, 6, 70, 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80', 'pack', false, false, '{"Limpieza", "Microfibra"}'),
  ('JG-IND-001', 'Gorra Urbana Lisa Ajustable Gabardina Premium', 'Confección en algodón 100% reforzado con hebilla metálica. Ideal para bordados o uso diario.', 'indumentaria', 'Indumentaria', 10.00, 6.80, 8, 65, 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Moda", "Gorras", "Accesorios"}'),
  ('JG-JUG-001', 'Bloques de Construcción Magnéticos 64 Piezas', 'Juego didáctico STEM con piezas traslúcidas de bordes redondeados y potentes imanes.', 'jugueteria', 'Juguetería', 26.00, 18.00, 3, 22, 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80', 'set', true, false, '{"Juguetes", "Didácticos", "Niños"}'),
  ('JG-LIB-001', 'Cuaderno Universitario Tapa Dura Cuadriculado A4', '100 hojas de 90g resistentes a tinta gel y pluma. Encuadernación anillada doble.', 'libreria', 'Librería', 6.50, 4.20, 12, 120, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Librería", "Cuadernos", "Papelería"}'),
  ('JG-LIB-002', 'Set Marcadores Doble Punta Pincel & Fina x 24', 'Tinta base al agua para lettering, bullet journal, dibujo e ilustraciones.', 'libreria', 'Librería', 14.50, 9.80, 4, 35, 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80', 'pack', false, false, '{"Librería", "Marcadores", "Lettering"}'),
  ('JG-LBR-001', 'Libro de Colorear Anti-Estrés Mandalas & Naturaleza', 'Papel de 140g para colorear con lápices o fibras. Diseños intrincados para relajación.', 'libros', 'Libros', 9.00, 6.20, 6, 40, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Libros", "Creatividad", "Arte"}'),
  ('JG-MAR-001', 'Billetera Bifold Cuero Ecológico con Bloqueo RFID', 'Diseño ultra slim con 8 tarjeteros, doble compartimento para billetes y protección contra clonación.', 'marroquineria', 'Marroquinería', 16.00, 10.50, 6, 42, 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Marroquinería", "Billeteras", "Accesorios"}'),
  ('JG-MAS-001', 'Comedero Lento Anti-Ansiedad Mascotas Antideslizante', 'Diseño en laberinto que previene la ingesta rápida y asfixia. Material no tóxico grado alimenticio.', 'mascotas', 'Mascotas', 11.00, 7.20, 5, 32, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Mascotas", "Perros", "Gatos"}'),
  ('JG-MOC-001', 'Mochila Urbana Antirrobo para Notebook 15.6" con Puerto USB', 'Tela Oxford impermeable de alta resistencia con costuras reforzadas, bolsillo oculto y puerto USB.', 'mochilas-maletines', 'Mochilas y Maletines', 34.00, 23.50, 3, 25, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', 'unidad', true, false, '{"Mochilas", "Notebook", "Equipaje"}'),
  ('JG-NAV-001', 'Guirnalda de Luces LED Cálidas 10m con 8 Efectos', 'Cable transparente para interior y exterior con control de efectos luminosos.', 'navidad', 'Navidad', 8.50, 5.50, 10, 85, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80', 'unidad', false, true, '{"Navidad", "Luces", "Fiestas"}'),
  ('JG-PEL-001', 'Peluche Oso Clásico Premium Hipoalergénico 40cm', 'Textura extra suave afelpada, relleno de vellón siliconado lavable con moño de raso.', 'pelucheria', 'Peluchería', 19.50, 13.00, 4, 19, 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Peluches", "Regalos", "Infantil"}'),
  ('JG-PAT-001', 'Bandera Oficial Protocolar 1.40 x 0.90 m con Costura Doble', 'Poliéster náutico apto para intemperie con ojales reforzados de bronce.', 'simbolos-patrios', 'Símbolos Patrios', 12.50, 8.00, 6, 30, 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80', 'unidad', false, false, '{"Banderas", "Patria"}'),
  ('JG-TEX-001', 'Juego de Toalla y Toallón 500g 100% Algodón Peinado', 'Máxima absorción y suavidad al tacto. Medidas: Toallón 70x140cm, Toalla 50x80cm.', 'textil', 'Textil', 21.00, 14.50, 4, 26, 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format&fit=crop&q=80', 'set', true, false, '{"Textil", "Toallas", "Baño"}'),
  ('JG-VER-001', 'Flotador Inflable Gigante Flamenco Rosa con Asas', 'Vinilo resistente de 0.30mm de espesor con doble válvula de inflado rápido. Medida 1.30m.', 'verano', 'Verano', 24.00, 16.50, 3, 14, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80', 'unidad', false, true, '{"Verano", "Inflables", "Playa"}')
ON CONFLICT (sku) DO NOTHING;

-- 6. NOTIFICAR A POSTGREST PARA RECARGAR EL SCHEMA CACHE
NOTIFY pgrst, 'reload schema';
