-- ==============================================================================
-- JG STORE - MIGRACIÓN: JERARQUÍA DE PRODUCTOS EN 3 NIVELES (CATEGORÍAS, SUBCATEGORÍAS Y LÍNEAS)
-- Nivel 1: Departamentos / Categorías Oficiales (24 Rubros Polirrubro)
-- Nivel 2: Subcategorías Comerciales
-- Nivel 3: Sub-subcategorías (Líneas específicas de producto)
-- ==============================================================================

-- 1. Asegurar la tabla de Nivel 1 (Categorías / Departamentos)
CREATE TABLE IF NOT EXISTS public.categories (
  id VARCHAR(80) PRIMARY KEY, -- Slug único (ej: 'bazar-cocina')
  slug VARCHAR(80) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  image_url TEXT,
  is_seasonal BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Nivel 2 (Subcategorías)
CREATE TABLE IF NOT EXISTS public.subcategories (
  id VARCHAR(100) PRIMARY KEY, -- Slug único (ej: 'bazar-termos-botellas')
  category_id VARCHAR(80) NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  category_slug VARCHAR(80) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Nivel 3 (Sub-subcategorías / Líneas Específicas)
CREATE TABLE IF NOT EXISTS public.sub_subcategories (
  id VARCHAR(120) PRIMARY KEY, -- Slug único (ej: 'bazar-termos-acero-inox')
  subcategory_id VARCHAR(100) NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  subcategory_slug VARCHAR(100) NOT NULL,
  category_slug VARCHAR(80) NOT NULL,
  slug VARCHAR(120) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Modificar la Tabla Principal de Productos para vincular Nivel 2 y Nivel 3
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS subcategory_id VARCHAR(100) REFERENCES public.subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subcategory_slug VARCHAR(100),
  ADD COLUMN IF NOT EXISTS subcategory_name VARCHAR(150),
  ADD COLUMN IF NOT EXISTS sub_subcategory_id VARCHAR(120) REFERENCES public.sub_subcategories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS sub_subcategory_slug VARCHAR(120),
  ADD COLUMN IF NOT EXISTS sub_subcategory_name VARCHAR(150);

-- 5. Índices de Búsqueda y Navegación Relacional
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_subcategory_id ON public.sub_subcategories(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_sub_subcategories_slug ON public.sub_subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_slug ON public.products(subcategory_slug);
CREATE INDEX IF NOT EXISTS idx_products_sub_subcategory_slug ON public.products(sub_subcategory_slug);

-- 6. Vista Desnormalizada de la Jerarquía Completa para Consultas Rápidas y Breadcrumbs
CREATE OR REPLACE VIEW public.vw_product_hierarchy AS
SELECT 
  c.id AS category_id,
  c.slug AS category_slug,
  c.name AS category_name,
  c.icon AS category_icon,
  c.image_url AS category_image,
  c.display_order AS category_order,
  s.id AS subcategory_id,
  s.slug AS subcategory_slug,
  s.name AS subcategory_name,
  s.display_order AS subcategory_order,
  ss.id AS sub_subcategory_id,
  ss.slug AS sub_subcategory_slug,
  ss.name AS sub_subcategory_name,
  ss.display_order AS sub_subcategory_order,
  CONCAT(c.name, ' > ', s.name, ' > ', ss.name) AS full_breadcrumb_path,
  CONCAT('/', c.slug, '/', s.slug, '/', ss.slug) AS full_slug_path
FROM public.categories c
LEFT JOIN public.subcategories s ON s.category_id = c.id
LEFT JOIN public.sub_subcategories ss ON ss.subcategory_id = s.id
ORDER BY c.display_order ASC, s.display_order ASC, ss.display_order ASC;

-- 7. Vista de Productos con Ruta Jerárquica Completa
CREATE OR REPLACE VIEW public.vw_products_with_hierarchy AS
SELECT 
  p.*,
  c.name AS level1_category_name,
  s.name AS level2_subcategory_name,
  ss.name AS level3_sub_subcategory_name,
  TRIM(BOTH ' > ' FROM CONCAT(
    COALESCE(c.name, p.category_name, ''),
    CASE WHEN s.name IS NOT NULL THEN ' > ' || s.name ELSE '' END,
    CASE WHEN ss.name IS NOT NULL THEN ' > ' || ss.name ELSE '' END
  )) AS category_path
FROM public.products p
LEFT JOIN public.categories c ON c.id = p.category_id OR c.slug = p.category_slug
LEFT JOIN public.subcategories s ON s.id = p.subcategory_id OR s.slug = p.subcategory_slug
LEFT JOIN public.sub_subcategories ss ON ss.id = p.sub_subcategory_id OR ss.slug = p.sub_subcategory_slug;

-- 8. Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública de categorías" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Lectura pública de subcategorías" ON public.subcategories FOR SELECT TO public USING (true);
CREATE POLICY "Lectura pública de sub_subcategorías" ON public.sub_subcategories FOR SELECT TO public USING (true);

CREATE POLICY "Gestión admin categorías" ON public.categories FOR ALL TO service_role USING (true);
CREATE POLICY "Gestión admin subcategorías" ON public.subcategories FOR ALL TO service_role USING (true);
CREATE POLICY "Gestión admin sub_subcategorías" ON public.sub_subcategories FOR ALL TO service_role USING (true);

-- ==============================================================================
-- 9. CARGA INICIAL (SEED) DE LOS 3 NIVELES DE JERARQUÍA (POLIRRUBRO ARGENTINO)
-- ==============================================================================

-- 9.1 Insertar Categorías Nivel 1 (24 Departamentos Oficiales JG Store)
INSERT INTO public.categories (id, slug, name, description, icon, image_url, is_seasonal, featured, display_order)
VALUES 
  ('aromatizacion-velas', 'aromatizacion-velas', 'Aromatización y Velas', 'Difusores, esencias, velas aromáticas y sahumerios.', 'flame', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80', false, true, 1),
  ('arte-manualidades', 'arte-manualidades', 'Arte y Manualidades', 'Pinturas, pinceles, masas, bastidores y materiales creativos.', 'palette', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80', false, true, 2),
  ('articulos-viaje', 'articulos-viaje', 'Artículos para Viaje', 'Organizadores de valija, candados, almohadillas y accesorios.', 'plane', 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=300&auto=format&fit=crop&q=80', false, false, 3),
  ('bazar-cocina', 'bazar-cocina', 'Bazar y Cocina', 'Utensilios, vajilla, termos, recipientes y accesorios de cocina.', 'coffee', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop&q=80', false, true, 4),
  ('belleza-accesorios', 'belleza-accesorios', 'Belleza y Accesorios', 'Cosméticos, cuidado personal, peines, espejos y accesorios.', 'sparkles', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80', false, true, 5),
  ('cartucheras-carpetas', 'cartucheras-carpetas', 'Cartucheras y Carpetas', 'Cartucheras escolares, carpetas clasificadoras y folios.', 'folder', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80', false, false, 6),
  ('cotillon', 'cotillon', 'Cotillón', 'Globos, guirnaldas, antifaces y artículos para fiestas.', 'party', 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80', false, false, 7),
  ('deco-organizacion-hogar', 'deco-organizacion-hogar', 'Deco y Organización del Hogar', 'Cajas organizadoras, perchas, marcos y decoración.', 'home', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80', false, true, 8),
  ('electro', 'electro', 'Electro', 'Pequeños electrodomésticos, cables, lámparas LED y gadgets.', 'deviceLaptop', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80', false, true, 9),
  ('embalajes', 'embalajes', 'Embalajes', 'Cintas adhesivas, bolsas de envío, papel kraft y film.', 'package', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80', false, false, 10),
  ('ferreteria-pesca', 'ferreteria-pesca', 'Ferretería y Pesca', 'Herramientas de mano, linternas, cuerdas y artículos de pesca.', 'tool', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=300&auto=format&fit=crop&q=80', false, false, 11),
  ('higiene-limpieza', 'higiene-limpieza', 'Higiene Personal y Limpieza', 'Jabones, paños de microfibra, esponjas y limpieza del hogar.', 'wash', 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80', false, false, 12),
  ('indumentaria', 'indumentaria', 'Indumentaria', 'Ropa básica, medias, gorros, bufandas e indumentaria variada.', 'shirt', 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80', false, true, 13),
  ('jugueteria', 'jugueteria', 'Juguetería', 'Juguetes infantiles, juegos de mesa, autos, bloques y muñecas.', 'puzzle', 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop&q=80', false, true, 14),
  ('libreria', 'libreria', 'Librería', 'Cuadernos, bolígrafos, marcadores, tijeras y papelería comercial.', 'pencil', 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=300&auto=format&fit=crop&q=80', false, true, 15),
  ('libros', 'libros', 'Libros', 'Libros infantiles, novelas, libros de colorear y guías.', 'book', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80', false, false, 16),
  ('marroquineria', 'marroquineria', 'Marroquinería', 'Carteras, billeteras, cinturones, riñoneras y bolsos.', 'briefcase', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80', false, true, 17),
  ('mascotas', 'mascotas', 'Mascotas', 'Juguetes para mascotas, correas, comederos y accesorios.', 'paw', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80', false, true, 18),
  ('mochilas-maletines', 'mochilas-maletines', 'Mochilas y Maletines', 'Mochilas urbanas, escolares, mochilas para notebook y maletines.', 'backpack', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80', false, true, 19),
  ('navidad', 'navidad', 'Navidad', 'Árboles de navidad, luces, adornos, guirnaldas y pesebres.', 'gift', 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=300&auto=format&fit=crop&q=80', true, false, 20),
  ('pelucheria', 'pelucheria', 'Peluchería', 'Peluches de colección, personajes y almohadones afelpados.', 'heart', 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=300&auto=format&fit=crop&q=80', false, false, 21),
  ('simbolos-patrios', 'simbolos-patrios', 'Símbolos Patrios', 'Banderas, escarapelas, cintas y artículos conmemorativos.', 'flag', 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80', false, false, 22),
  ('textil', 'textil', 'Textil', 'Toallas, mantas, sábanas, repasadores y cortinas.', 'layout', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80', false, false, 23),
  ('verano', 'verano', 'Verano', 'Inflables, sombrillas, toallas de playa, salvavidas y lentes.', 'sun', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80', true, false, 24)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;

-- 9.2 Insertar Subcategorías Nivel 2
INSERT INTO public.subcategories (id, category_id, category_slug, slug, name, description, display_order)
VALUES
  -- 1. Aromatización y Velas
  ('aroma-difusores', 'aromatizacion-velas', 'aromatizacion-velas', 'difusores-esencias', 'Difusores y Esencias', 'Difusores con varillas de bambú, esencias puras y repuestos líquidos', 1),
  ('aroma-velas', 'aromatizacion-velas', 'aromatizacion-velas', 'velas-aromaticas', 'Velas Aromáticas', 'Velas de cera de soja vegetal en cuencos y vasos de vidrio', 2),
  ('aroma-sahumerios', 'aromatizacion-velas', 'aromatizacion-velas', 'sahumerios-porta', 'Sahumerios y Portasahumerios', 'Varillas masala, conos de reflujo cascada y quemadores decorativos', 3),

  -- 2. Arte y Manualidades
  ('arte-pinturas', 'arte-manualidades', 'arte-manualidades', 'pinturas-acrilicos', 'Pinturas y Acrílicos', 'Acrílicos profesionales, témperas y óleos de alta pigmentación', 1),
  ('arte-pinceles', 'arte-manualidades', 'arte-manualidades', 'pinceles-espatulas', 'Pinceles y Espátulas', 'Sets de pinceles sintéticos, de cerda natural y espátulas de mezcla', 2),
  ('arte-bastidores', 'arte-manualidades', 'arte-manualidades', 'bastidores-lienzos', 'Bastidores y Lienzos', 'Lienzos entelados de algodón y tablas de madera preparadas', 3),
  ('arte-modelado', 'arte-manualidades', 'arte-manualidades', 'modelado-arcilla', 'Modelado, Masas y Porcelana', 'Porcelana fría, plastilinas y masas de secado al aire', 4),

  -- 3. Artículos para Viaje
  ('viaje-organizadores', 'articulos-viaje', 'articulos-viaje', 'valijas-organizadores', 'Organizadores de Equipaje', 'Sets de cubos organizadores, fundas para valija y bolsas de compresión', 1),
  ('viaje-seguridad', 'articulos-viaje', 'articulos-viaje', 'seguridad-viaje', 'Seguridad y Documentación', 'Candados aprobados TSA, porta pasaportes RFID y balanzas portátiles', 2),
  ('viaje-confort', 'articulos-viaje', 'articulos-viaje', 'confort-viaje', 'Confort y Accesorios Personales', 'Almohadas viscoelásticas, antifaces para dormir y botellas dosificadoras', 3),

  -- 4. Bazar y Cocina
  ('bazar-termos', 'bazar-cocina', 'bazar-cocina', 'termos-botellas', 'Termos y Botellas', 'Termos bala de acero inoxidable, botellas térmicas y mates', 1),
  ('bazar-vajilla', 'bazar-cocina', 'bazar-cocina', 'vajilla-utensilios', 'Vajilla y Utensilios', 'Platos, cubiertos en set, recipientes herméticos y tablas de picar', 2),
  ('bazar-cafe', 'bazar-cocina', 'bazar-cocina', 'cafeteria-infusiones', 'Cafetería e Infusiones', 'Cafeteras prensa francesa, teteras con infusor y espumadores', 3),

  -- 5. Belleza y Accesorios
  ('belleza-maquillaje', 'belleza-accesorios', 'belleza-accesorios', 'maquillaje-cosmetica', 'Maquillaje y Cosmética', 'Labiales, paletas de sombras, bases y brochas de maquillaje', 1),
  ('belleza-skincare', 'belleza-accesorios', 'belleza-accesorios', 'cuidado-facial-skincare', 'Cuidado Facial y Skincare', 'Mascarillas faciales, rodillos de jade y sérums hidratantes', 2),
  ('belleza-cabello', 'belleza-accesorios', 'belleza-accesorios', 'accesorios-cabello', 'Accesorios para el Cabello', 'Hebillas, scrunchies, peines desenredantes y diademas', 3),

  -- 6. Cartucheras y Carpetas
  ('cartu-cartucheras', 'cartucheras-carpetas', 'cartucheras-carpetas', 'cartucheras-escolares', 'Cartucheras Escolares y Universitarias', 'Cartucheras con cierre simple, doble compartimento y modelos tubo', 1),
  ('cartu-carpetas', 'cartucheras-carpetas', 'cartucheras-carpetas', 'carpetas-archivadores', 'Carpetas y Archivadores', 'Carpetas de 3 anillos N° 3, carpetas acordeón y biblioratos', 2),

  -- 7. Cotillón
  ('coti-globos', 'cotillon', 'cotillon', 'globos-guirnaldas', 'Globos y Guirnaldas', 'Globos de látex, metalizados de números y cortinas metalizadas', 1),
  ('coti-descartables', 'cotillon', 'cotillon', 'vajilla-descartable-fiesta', 'Vajilla Descartable para Fiestas', 'Platos temáticos, vasos de polipapel, servilletas y manteles', 2),

  -- 8. Deco y Organización del Hogar
  ('deco-cajas', 'deco-organizacion-hogar', 'deco-organizacion-hogar', 'cajas-canastos-organizadores', 'Cajas y Canastos Organizadores', 'Canastos de tela plegables, organizadores de cajón y cajas apilables', 1),
  ('deco-perchas', 'deco-organizacion-hogar', 'deco-organizacion-hogar', 'perchas-placard', 'Perchas y Accesorios de Placard', 'Perchas aterciopeladas ultradelgadas y perchas de madera', 2),

  -- 9. Electro
  ('electro-celulares', 'electro', 'electro', 'cables-cargadores', 'Cables y Cargadores', 'Cables mallados Tipo C, Lightning y cargadores turbo 20W', 1),
  ('electro-audio', 'electro', 'electro', 'auriculares-audio', 'Auriculares y Audio', 'Auriculares TWS inalámbricos y parlantes portátiles bluetooth', 2),
  ('electro-iluminacion', 'electro', 'electro', 'iluminacion-smart', 'Iluminación y Lámparas LED', 'Lámparas táctiles dimerizables, tiras LED RGB y aros de luz para celular', 3),

  -- 10. Embalajes
  ('emb-cintas', 'embalajes', 'embalajes', 'cintas-adhesivas', 'Cintas Adhesivas de Embalar', 'Cintas de 48mm transparentes, marrones y con leyenda frágil', 1),
  ('emb-bolsas', 'embalajes', 'embalajes', 'bolsas-envio-ecommerce', 'Bolsas para Envíos y Ecommerce', 'Sobres de plástico inviolables con solapa autoadhesiva', 2),

  -- 11. Ferretería y Pesca
  ('ferre-herramientas', 'ferreteria-pesca', 'ferreteria-pesca', 'herramientas-manuales', 'Herramientas Manuales', 'Destornilladores, pinzas, martillos y llaves fijas', 1),
  ('ferre-pesca', 'ferreteria-pesca', 'ferreteria-pesca', 'articulos-pesca-camping', 'Artículos de Pesca y Camping', 'Reeles, señuelos, tanza de nylon y linternas frontales LED', 2),

  -- 12. Higiene Personal y Limpieza
  ('hig-limpieza', 'higiene-limpieza', 'higiene-limpieza', 'panos-esponjas-limpieza', 'Paños y Esponjas de Limpieza', 'Paños de microfibra multiuso, esponjas mágicas y guantes reforzados', 1),
  ('hig-personal', 'higiene-limpieza', 'higiene-limpieza', 'cuidado-personal-bano', 'Cuidado Personal y Baño', 'Dispensadores de jabón, toallitas desinfectantes y jaboneras', 2),

  -- 13. Indumentaria
  ('indu-medias', 'indumentaria', 'indumentaria', 'medias-soquetes', 'Medias y Soquetes', 'Soquetes invisibles de algodón, medias térmicas y medias deportivas', 1),
  ('indu-accesorios', 'indumentaria', 'indumentaria', 'accesorios-invierno-verano', 'Gorros, Guantes y Bufandas', 'Gorros de lana con corderito, guantes touch y cuellitos térmicos', 2),

  -- 14. Juguetería
  ('juguetes-primera', 'jugueteria', 'jugueteria', 'primera-infancia', 'Primera Infancia', 'Sonajeros musicales, mordillos sensoriales y bloques blandos', 1),
  ('juguetes-bloques', 'jugueteria', 'jugueteria', 'bloques-construccion', 'Bloques de Construcción', 'Sets de bloques plásticos y pistas de autos ensamblables', 2),
  ('juguetes-juegos-mesa', 'jugueteria', 'jugueteria', 'juegos-de-mesa', 'Juegos de Mesa y Naipes', 'Juegos de tablero familiares, naipes españoles y cartas temáticas', 3),

  -- 15. Librería
  ('lib-cuadernos', 'libreria', 'libreria', 'cuadernos-repuestos', 'Cuadernos y Repuestos', 'Cuadernos espiralados A4, repuestos N° 3 y libretas de notas', 1),
  ('lib-escritura', 'libreria', 'libreria', 'escritura-marcadores', 'Escritura y Marcadores', 'Bolígrafos punta fina, microfibras, resaltadores pastel y marcadores', 2),

  -- 16. Libros
  ('libros-infantiles', 'libros', 'libros', 'libros-infantiles-colorear', 'Libros Infantiles y de Colorear', 'Cuentos con stickers, libros de mandalas y actividades para niños', 1),

  -- 17. Marroquinería
  ('marro-billeteras', 'marroquineria', 'marroquineria', 'billeteras-tarjeteros', 'Billeteras y Tarjeteros', 'Billeteras de cuero ecológico, tarjeteros automáticos y monederos', 1),
  ('marro-rinoneras', 'marroquineria', 'marroquineria', 'rinoneras-morrales', 'Riñoneras y Morrales', 'Riñoneras urbanas deportivas y bandoleras cruzadas unisex', 2),

  -- 18. Mascotas
  ('mascotas-paseo', 'mascotas', 'mascotas', 'paseo-seguridad', 'Paseo y Seguridad', 'Correas retráctiles, arneses antitirones y collares luminosos', 1),
  ('mascotas-comederos', 'mascotas', 'mascotas', 'comederos-bebederos', 'Comederos y Bebederos', 'Platos de acero inoxidable antideslizantes y bebederos portátiles', 2),

  -- 19. Mochilas y Maletines
  ('mochilas-urbanas', 'mochilas-maletines', 'mochilas-maletines', 'mochilas-notebook', 'Mochilas Urbanas y para Notebook', 'Mochilas reforzadas con bolsillo acolchado para laptop de 15.6"', 1),
  ('mochilas-escolares', 'mochilas-maletines', 'mochilas-maletines', 'mochilas-escolares-carrito', 'Mochilas Escolares y con Carrito', 'Mochilas estampadas reforzadas y mochilas con ruedas triples', 2),

  -- 20. Navidad
  ('nav-arboles', 'navidad', 'navidad', 'arboles-pesebres', 'Árboles de Navidad y Pesebres', 'Pinos artificiales verdes y nevados de 1.20m a 2.10m', 1),
  ('nav-luces', 'navidad', 'navidad', 'luces-guirnaldas-led', 'Luces y Guirnaldas Navideñas', 'Luces arroz LED cálidas, frías y de colores con efectos', 2),

  -- 21. Peluchería
  ('pelu-clasicos', 'pelucheria', 'pelucheria', 'peluches-animales-clasicos', 'Osos y Animales de Peluche', 'Osos gigantes de 1 metro, perritos, conejos y gatitos ultrasuaves', 1),

  -- 22. Símbolos Patrios
  ('patrio-banderas', 'simbolos-patrios', 'simbolos-patrios', 'banderas-argentinas', 'Banderas de Ceremonia y Flameo', 'Banderas argentinas con sol bordado o estampado en tafeta', 1),
  ('patrio-escarapelas', 'simbolos-patrios', 'simbolos-patrios', 'escarapelas-pines', 'Escarapelas y Pines Conmemorativos', 'Escarapelas de cinta plisada, pines metálicos esmaltados y prendedores', 2),

  -- 23. Textil
  ('textil-bano', 'textil', 'textil', 'toallas-toallones', 'Toallas y Toallones de Baño', 'Juegos de toalla y toallón 500 gramos 100% algodón', 1),
  ('textil-cocina', 'textil', 'textil', 'manteles-repasadores', 'Manteles y Repasadores de Cocina', 'Manteles antimanchas impermeables y repasadores nido de abeja', 2),

  -- 24. Verano
  ('verano-inflables', 'verano', 'verano', 'inflables-pileta', 'Inflables y Flotadores para Pileta', 'Colchonetas gigantes, sillones flotantes y salvavidas infantiles', 1),
  ('verano-playa', 'verano', 'verano', 'sombrillas-reposeras-playa', 'Sombrillas y Reposeras de Playa', 'Sombrillas con filtro UV50+, reposeras plegables y conservadoras', 2)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;

-- 9.3 Insertar Sub-subcategorías Nivel 3 (Líneas Específicas)
INSERT INTO public.sub_subcategories (id, subcategory_id, subcategory_slug, category_slug, slug, name, description, display_order)
VALUES
  -- En Aromatización y Velas > Difusores y Esencias
  ('aroma-difusores-varillas', 'aroma-difusores', 'difusores-esencias', 'aromatizacion-velas', 'difusores-varillas-bambu', 'Difusores de Ambiente con Varillas', 'Frascos difusores de 125ml y 250ml con varillas de ratán', 1),
  ('aroma-difusores-repuestos', 'aroma-difusores', 'difusores-esencias', 'aromatizacion-velas', 'repuestos-aromatizadores', 'Repuestos de Esencias Líquidas', 'Botellas de recarga de 500ml para aromatizadores continuos', 2),
  ('aroma-difusores-aceites', 'aroma-difusores', 'difusores-esencias', 'aromatizacion-velas', 'aceites-esenciales-puros', 'Aceites Esenciales e Hidrosolubles', 'Esencias concentradas para humidificadores ultrasónicos y hornillos', 3),

  -- En Aromatización y Velas > Velas Aromáticas
  ('aroma-velas-soja-ceramica', 'aroma-velas', 'velas-aromaticas', 'aromatizacion-velas', 'velas-soja-cuenco', 'Velas de Soja en Cuenco', 'Velas de cera vegetal de soja 100% natural en cerámica artesanal', 1),
  ('aroma-velas-vaso-vidrio', 'aroma-velas', 'velas-aromaticas', 'aromatizacion-velas', 'velas-aromaticas-vidrio', 'Velas Aromáticas en Vaso de Vidrio', 'Velas en vaso de vidrio esmerilado con tapa de madera', 2),
  ('aroma-velas-noche', 'aroma-velas', 'velas-aromaticas', 'aromatizacion-velas', 'velas-de-noche-packs', 'Velas de Noche y Repuestos', 'Packs x10, x25 y x50 unidades en molde de aluminio', 3),

  -- En Aromatización y Velas > Sahumerios y Portasahumerios
  ('aroma-sahumerios-varillas', 'aroma-sahumerios', 'sahumerios-porta', 'aromatizacion-velas', 'sahumerios-varillas-masala', 'Sahumerios en Varillas Masala', 'Varillas importadas aromaterapia extra duración', 1),
  ('aroma-sahumerios-conos', 'aroma-sahumerios', 'sahumerios-porta', 'aromatizacion-velas', 'conos-cascada-humo', 'Conos de Humo Cascada', 'Conos de reflujo aromáticos para fuentes y quemadores cascada', 2),
  ('aroma-sahumerios-porta', 'aroma-sahumerios', 'sahumerios-porta', 'aromatizacion-velas', 'portasahumerios-artesanales', 'Portasahumerios y Quemadores', 'Quemadores de resina, madera de mango y cerámica', 3),

  -- En Arte y Manualidades > Pinturas y Acrílicos
  ('arte-pinturas-acrilicos-set', 'arte-pinturas', 'pinturas-acrilicos', 'arte-manualidades', 'sets-acrilicos-profesionales', 'Sets de Pinturas Acrílicas', 'Sets de 12 y 24 pomos con pigmentación de alta resistencia', 1),
  ('arte-pinturas-temperas-escolares', 'arte-pinturas', 'pinturas-acrilicos', 'arte-manualidades', 'temperas-escolares-lavables', 'Témperas Lavables Escolares', 'Potes de témpera lavable no tóxica para niños y escuelas', 2),
  ('arte-pinturas-acuarelas', 'arte-pinturas', 'pinturas-acrilicos', 'arte-manualidades', 'acuarelas-pastillas-tubo', 'Acuarelas en Pastilla y Tubo', 'Cajas de acuarela para estudiantes y artistas', 3),

  -- En Arte y Manualidades > Pinceles y Espátulas
  ('arte-pinceles-sets', 'arte-pinceles', 'pinceles-espatulas', 'arte-manualidades', 'sets-pinceles-sinteticos', 'Sets de Pinceles Multiuso', 'Kits surtidos chatos, redondos y lengua de gato', 1),
  ('arte-pinceles-espatulas', 'arte-pinceles', 'pinceles-espatulas', 'arte-manualidades', 'espatulas-mezcla-oleo', 'Espátulas para Óleo y Acrílico', 'Espátulas flexibles de acero con mango de madera', 2),

  -- En Arte y Manualidades > Bastidores y Lienzos
  ('arte-bastidores-lienzos', 'arte-bastidores', 'bastidores-lienzos', 'arte-manualidades', 'lienzos-entelados-algodon', 'Bastidores Entelados de Algodón', 'Bastidores reforzados con tela imprimada para acrílico y óleo', 1),
  ('arte-bastidores-tablas', 'arte-bastidores', 'bastidores-lienzos', 'arte-manualidades', 'tablas-mdf-enteladas', 'Tablas Enteladas MDF', 'Paneles rígidos livianos ideales para estudio y bocetos', 2),

  -- En Arte y Manualidades > Modelado y Porcelana
  ('arte-modelado-porcelana', 'arte-modelado', 'modelado-arcilla', 'arte-manualidades', 'porcelana-fria-profesional', 'Porcelana Fría Tradicional y Soft', 'Paquetes de 500g y 1kg de máxima elasticidad sin grietas', 1),
  ('arte-modelado-plastilinas', 'arte-modelado', 'modelado-arcilla', 'arte-manualidades', 'plastilinas-masas-moldear', 'Plastilinas y Masas Didácticas', 'Barras de plastilina colorida para talleres escolares', 2),

  -- En Artículos para Viaje > Organizadores
  ('viaje-organizadores-cubos', 'viaje-organizadores', 'valijas-organizadores', 'articulos-viaje', 'sets-cubos-organizadores', 'Sets de Cubos Organizadores x6 y x8', 'Bolsas organizadoras impermeables con malla respirable', 1),
  ('viaje-organizadores-fundas', 'viaje-organizadores', 'valijas-organizadores', 'articulos-viaje', 'fundas-elasticas-valija', 'Fundas Elásticas para Valija', 'Fundas protectoras estampadas de spandex lavables', 2),

  -- En Artículos para Viaje > Seguridad
  ('viaje-seguridad-candados', 'viaje-seguridad', 'seguridad-viaje', 'articulos-viaje', 'candados-tsa-combinacion', 'Candados TSA con Combinación', 'Candados normalizados para aduanas con dial de 3 dígitos', 1),
  ('viaje-seguridad-portadocumentos', 'viaje-seguridad', 'seguridad-viaje', 'articulos-viaje', 'porta-pasaportes-rfid', 'Porta Pasaportes y Billeteras de Viaje', 'Fundas con bloqueo anti-clonación RFID para tarjetas y pasaportes', 2),

  -- En Artículos para Viaje > Confort
  ('viaje-confort-almohadas', 'viaje-confort', 'confort-viaje', 'articulos-viaje', 'almohadas-cervicales-visco', 'Almohadas Cervicales Memory Foam', 'Almohadillas ergonómicas con broche frontal y funda suave', 1),
  ('viaje-confort-botellas', 'viaje-confort', 'confort-viaje', 'articulos-viaje', 'sets-botellas-silicona-viaje', 'Sets de Botellas de Silicona Aptas Avión', 'Envases dosificadores de 60ml y 90ml antifuga', 2),

  -- En Bazar y Cocina > Termos y Botellas
  ('bazar-termos-acero-inox', 'bazar-termos', 'termos-botellas', 'bazar-cocina', 'botellas-acero-inoxidable', 'Botellas Térmicas de Acero Inoxidable', 'Botellas de doble pared aisladas al vacío 500ml / 750ml / 1L', 1),
  ('bazar-termos-pico-cebador', 'bazar-termos', 'termos-botellas', 'bazar-cocina', 'termos-pico-cebador', 'Termos con Pico Cebador', 'Termos tipo bala ideales para mate con manija ergonómica', 2),
  ('bazar-termos-mates-termicos', 'bazar-termos', 'termos-botellas', 'bazar-cocina', 'mates-termicos-acero', 'Mates Térmicos y Bombillas', 'Mates térmicos de acero inoxidable y bombillas de alpaca', 3),

  -- En Bazar y Cocina > Vajilla y Utensilios
  ('bazar-vajilla-hermeticos', 'bazar-vajilla', 'vajilla-utensilios', 'bazar-cocina', 'recipientes-hermeticos', 'Recipientes Herméticos y Tupperwares', 'Sets herméticos libres de BPA aptos para microondas', 1),
  ('bazar-vajilla-cubiertos-set', 'bazar-vajilla', 'vajilla-utensilios', 'bazar-cocina', 'cubiertos-acero-sets', 'Juegos de Cubiertos', 'Sets de 24 piezas en acero inoxidable con mango pulido', 2),
  ('bazar-vajilla-tablas-corte', 'bazar-vajilla', 'vajilla-utensilios', 'bazar-cocina', 'tablas-corte-bambu', 'Tablas de Corte en Bambú y Madera', 'Tablas antibacterianas con canaleta para jugos', 3),

  -- En Bazar y Cocina > Cafetería
  ('bazar-cafe-prensa', 'bazar-cafe', 'cafeteria-infusiones', 'bazar-cocina', 'cafeteras-prensa-francesa', 'Cafeteras Francesas de Émbolo', 'Prensas de vidrio borosilicato resistente y émbolo metálico', 1),
  ('bazar-cafe-espumadores', 'bazar-cafe', 'cafeteria-infusiones', 'bazar-cocina', 'espumadores-leche-portatiles', 'Espumadores de Leche a Pilas', 'Batidores eléctricos compactos de acero inoxidable para capuchino', 2),

  -- En Electro > Cables y Cargadores
  ('electro-cables-usb-c', 'electro-celulares', 'cables-cargadores', 'electro', 'cables-usb-c-carga-rapida', 'Cables USB-C Carga Rápida', 'Cables mallados de 1m y 2m con soporte Power Delivery', 1),
  ('electro-cargadores-20w', 'electro-celulares', 'cables-cargadores', 'electro', 'cargadores-pared-turbo', 'Cargadores Turbo de Pared 20W', 'Fuentes de carga rápida compactas con puerto dual USB + Tipo C', 2),

  -- En Electro > Auriculares y Audio
  ('electro-audio-tws', 'electro-audio', 'auriculares-audio', 'electro', 'auriculares-tws-inalambricos', 'Auriculares Inalámbricos TWS', 'Auriculares bluetooth con estuche de carga y reducción de ruido', 1),
  ('electro-audio-parlantes', 'electro-audio', 'auriculares-audio', 'electro', 'parlantes-bluetooth-portatiles', 'Parlantes Bluetooth Resistentes al Agua', 'Altavoces portátiles con batería de hasta 8 horas y luces RGB', 2),

  -- En Electro > Iluminación Smart
  ('electro-luz-lampara-tactil', 'electro-iluminacion', 'iluminacion-smart', 'electro', 'lamparas-tactiles-led', 'Lámparas Táctiles LED Recargables', 'Lámparas portátiles con dimerización de intensidad y base de madera', 1),
  ('electro-luz-tiras-rgb', 'electro-iluminacion', 'iluminacion-smart', 'electro', 'tiras-led-rgb-control', 'Tiras LED RGB con Control Remoto', 'Rollos de 5 metros con adhesivo 3M y control de colores', 2),

  -- En Escolar / Librería > Cuadernos y Repuestos
  ('lib-cuadernos-espiral-a4', 'lib-cuadernos', 'cuadernos-repuestos', 'libreria', 'cuadernos-espiralados-a4', 'Cuadernos Espiralados A4', 'Cuadernos tapa dura de 80 y 100 hojas microperforadas', 1),
  ('lib-repuestos-n3', 'lib-cuadernos', 'cuadernos-repuestos', 'libreria', 'repuestos-hojas-n3', 'Repuestos de Hojas N° 3', 'Packs de 480 y 96 hojas con banda reforzada rayadas y cuadriculadas', 2),

  -- En Marroquinería > Billeteras y Tarjeteros
  ('marro-tarjeteros-auto', 'marro-billeteras', 'billeteras-tarjeteros', 'marroquineria', 'tarjeteros-automaticos-rfid', 'Tarjeteros Automáticos con Pop-Up', 'Tarjeteros de aluminio con gatillo eyector y bloqueo RFID', 1),
  ('marro-billeteras-cuero', 'marro-billeteras', 'billeteras-tarjeteros', 'marroquineria', 'billeteras-hombre-mujer-cuero', 'Billeteras Clásicas de Cuero PU', 'Modelos con doble visor de documentos y monedero con cierre', 2),

  -- En Marroquinería > Riñoneras y Morrales
  ('marro-rinoneras-urbanas', 'marro-rinoneras', 'rinoneras-morrales', 'marroquineria', 'rinoneras-deportivas-expandibles', 'Riñoneras Urbanas Impermeables', 'Riñoneras con correa regulable y salida para auriculares', 1),

  -- En Mochilas y Maletines > Mochilas Urbanas
  ('mochilas-antirrobo', 'mochilas-urbanas', 'mochilas-notebook', 'mochilas-maletines', 'mochilas-antirrobo-notebook', 'Mochilas Antirrobo con Puerto USB', 'Cierres ocultos impermeables y conector de carga externa', 1),
  ('mochilas-ejecutivas', 'mochilas-urbanas', 'mochilas-notebook', 'mochilas-maletines', 'mochilas-ejecutivas-expandibles', 'Mochilas Ejecutivas de Alta Capacidad', 'Apertura 180° estilo valija apta para viajes de negocios', 2),

  -- En Mochilas y Maletines > Mochilas Escolares
  ('mochilas-carrito-reforzadas', 'mochilas-escolares', 'mochilas-escolares-carrito', 'mochilas-maletines', 'mochilas-ruedas-triples', 'Mochilas con Carrito de 3 Ruedas para Escalera', 'Estructura metálica resistente con base de plástico rígido', 1)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  display_order = EXCLUDED.display_order;
