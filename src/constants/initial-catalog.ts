import { StoreProduct } from '@/types/store';

export const INITIAL_PRODUCTS: StoreProduct[] = [
  // 1. Aromatización y Velas
  {
    id: 'prod-001',
    sku: 'JG-ARO-001',
    name: 'Vela Aromática Soja en Cuenco de Cerámica',
    description: 'Vela 100% cera de soja con fragancia premium de Vainilla & Caramelo. Duración +45hs.',
    category_slug: 'aromatizacion-velas',
    category_name: 'Aromatización y Velas',
    retail_price: 8500,
    wholesale_price: 5900,
    min_wholesale_qty: 6,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'AromaZen',
    featured: true,
    tags: ['Velas', 'Aromaterapia', 'Hogar']
  },
  {
    id: 'prod-002',
    sku: 'JG-ARO-002',
    name: 'Difusor de Varillas Mikado Esencia Lavanda 250ml',
    description: 'Difusor ambiental de varillas de ratán con extractos naturales de lavanda silvestre.',
    category_slug: 'aromatizacion-velas',
    category_name: 'Aromatización y Velas',
    retail_price: 11000,
    wholesale_price: 7800,
    min_wholesale_qty: 4,
    stock: 28,
    image_url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Mikado',
    featured: false,
    tags: ['Difusores', 'Lavanda']
  },

  // 2. Arte y Manualidades
  {
    id: 'prod-003',
    sku: 'JG-ART-001',
    name: 'Set de Pinturas Acrílicas Profesionales 24 Colores',
    description: 'Tubos de acrílico de 22ml de alta pigmentación y cobertura satinada para artistas y talleres.',
    category_slug: 'arte-manualidades',
    category_name: 'Arte y Manualidades',
    retail_price: 16500,
    wholesale_price: 11500,
    min_wholesale_qty: 3,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'Acrilex',
    featured: true,
    tags: ['Arte', 'Pintura', 'Acrílicos']
  },

  // 3. Artículos para Viaje
  {
    id: 'prod-004',
    sku: 'JG-VIA-001',
    name: 'Kit Organizador de Valija 6 Piezas Impermeable',
    description: 'Set de cubos organizadores de compresión con cierres reforzados y malla transpirable.',
    category_slug: 'articulos-viaje',
    category_name: 'Artículos para Viaje',
    retail_price: 14000,
    wholesale_price: 9800,
    min_wholesale_qty: 5,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    unit: 'set',
    brand: 'TravelPro',
    featured: false,
    tags: ['Viaje', 'Organizadores']
  },

  // 4. Bazar y Cocina
  {
    id: 'prod-005',
    sku: 'JG-BAZ-001',
    name: 'Botella Térmica Doble Pared Acero Inoxidable 750ml',
    description: 'Mantiene frío por 24hs y calor por 12hs. Acabado mate antideslizante libre de BPA.',
    category_slug: 'bazar-cocina',
    category_name: 'Bazar y Cocina',
    retail_price: 18000,
    wholesale_price: 12200,
    min_wholesale_qty: 6,
    stock: 50,
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Stanley',
    featured: true,
    tags: ['Bazar', 'Termos', 'Cocina', 'Stanley']
  },
  {
    id: 'prod-006',
    sku: 'JG-BAZ-002',
    name: 'Set de 6 Vasos de Vidrio Labrado Estilo Vintage',
    description: 'Vasos pesados de 350ml aptos para lavavajillas. Ideal para gastronomía y hogar.',
    category_slug: 'bazar-cocina',
    category_name: 'Bazar y Cocina',
    retail_price: 15000,
    wholesale_price: 10500,
    min_wholesale_qty: 4,
    stock: 24,
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'CristalArt',
    featured: false,
    tags: ['Vasos', 'Vidrio', 'Bazar']
  },

  // 5. Belleza y Accesorios
  {
    id: 'prod-007',
    sku: 'JG-BEL-001',
    name: 'Espejo LED de Maquillaje Táctil Recargable',
    description: '3 tonalidades de luz (cálida, neutra, fría) con base organizadora y batería litio 1200mAh.',
    category_slug: 'belleza-accesorios',
    category_name: 'Belleza y Accesorios',
    retail_price: 22000,
    wholesale_price: 15000,
    min_wholesale_qty: 3,
    stock: 18,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Lumina',
    featured: true,
    tags: ['Belleza', 'Maquillaje', 'Espejos']
  },

  // 6. Cartucheras y Carpetas
  {
    id: 'prod-008',
    sku: 'JG-CAR-001',
    name: 'Cartuchera Canopla 3 Cierres Gran Capacidad',
    description: 'Capacidad para 70 lápices con compartimentos organizadores y tela impermeable lavable.',
    category_slug: 'cartucheras-carpetas',
    category_name: 'Cartucheras y Carpetas',
    retail_price: 9500,
    wholesale_price: 6500,
    min_wholesale_qty: 8,
    stock: 60,
    image_url: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Mooving',
    featured: false,
    tags: ['Escolar', 'Cartucheras', 'Mooving']
  },

  // 7. Cotillón
  {
    id: 'prod-009',
    sku: 'JG-COT-001',
    name: 'Pack Globos Metalizados & Látex Pastel x 50 Unid.',
    description: 'Surtido de globos 12 pulgadas extra gruesos para arcos y decoración de eventos.',
    category_slug: 'cotillon',
    category_name: 'Cotillón',
    retail_price: 8000,
    wholesale_price: 4900,
    min_wholesale_qty: 10,
    stock: 100,
    image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'PartyTime',
    featured: false,
    tags: ['Fiestas', 'Globos', 'Cotillón']
  },

  // 8. Deco y Organización del Hogar
  {
    id: 'prod-010',
    sku: 'JG-DEC-001',
    name: 'Caja Organizadora Apilable Tela Lino con Tapa',
    description: 'Estructura rígida plegable con tirador metálico. Medidas 38x26x24 cm.',
    category_slug: 'deco-organizacion-hogar',
    category_name: 'Deco y Organización del Hogar',
    retail_price: 13500,
    wholesale_price: 9200,
    min_wholesale_qty: 5,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'DecoHome',
    featured: true,
    tags: ['Deco', 'Organización', 'Hogar']
  },

  // 9. Electro & Gadgets
  {
    id: 'prod-011',
    sku: 'JG-ELE-001',
    name: 'Lámpara de Escritorio LED Flexo USB con Carga Inalámbrica Qi',
    description: 'Control touch, 5 intensidades de brillo y base de carga rápida inalámbrica para teléfonos Samsung, iPhone y smartphones.',
    category_slug: 'electro',
    category_name: 'Electro',
    retail_price: 29900,
    wholesale_price: 21000,
    min_wholesale_qty: 3,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Samsung Gadgets',
    featured: true,
    tags: ['Electro', 'Iluminación', 'Tecnología', 'Samsung', 'Teléfono', 'Celulares']
  },
  {
    id: 'prod-028',
    sku: 'JG-CEL-001',
    name: 'Soporte Magnético de Celular para Auto con Carga Rápida Qi 15W',
    description: 'Brazo articulado 360°, imanes Neodimio N52 ultra potentes y cargador rápido inductivo compatible con Samsung Galaxy y smartphones.',
    category_slug: 'electro',
    category_name: 'Electro',
    retail_price: 19500,
    wholesale_price: 13500,
    min_wholesale_qty: 4,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Samsung',
    featured: true,
    tags: ['Celulares', 'Samsung', 'Tecnología', 'Teléfono', 'Accesorios', 'Auto']
  },
  {
    id: 'prod-029',
    sku: 'JG-CEL-002',
    name: 'Auriculares Inalámbricos Bluetooth 5.3 con Estuche de Carga',
    description: 'Sonido estéreo Hi-Fi, baja latencia, controles táctiles y micrófono integrado para llamadas en teléfonos y notebooks.',
    category_slug: 'electro',
    category_name: 'Electro',
    retail_price: 24500,
    wholesale_price: 16900,
    min_wholesale_qty: 3,
    stock: 28,
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Xiaomi',
    featured: true,
    tags: ['Auriculares', 'Xiaomi', 'Bluetooth', 'Tecnología', 'Audio', 'Teléfono']
  },

  // 10. Embalajes
  {
    id: 'prod-012',
    sku: 'JG-EMB-001',
    name: 'Cinta de Embalar Transparente 48mm x 100m Pack x 6',
    description: 'Adhesivo acrílico de alta resistencia para sellado de cajas y paquetes de e-commerce.',
    category_slug: 'embalajes',
    category_name: 'Embalajes',
    retail_price: 11500,
    wholesale_price: 7500,
    min_wholesale_qty: 5,
    stock: 80,
    image_url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'PackTape',
    featured: false,
    tags: ['Embalaje', 'Cintas', 'Envíos']
  },

  // 11. Ferretería y Pesca
  {
    id: 'prod-013',
    sku: 'JG-FER-001',
    name: 'Linterna Frontal LED Táctica Recargable 1000 Lumens',
    description: 'Resistente al agua IPX6 con sensor de movimiento, 5 modos de luz y batería USB.',
    category_slug: 'ferreteria-pesca',
    category_name: 'Ferretería y Pesca',
    retail_price: 17000,
    wholesale_price: 11800,
    min_wholesale_qty: 4,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Black+Decker',
    featured: false,
    tags: ['Ferretería', 'Outdoor', 'Linternas']
  },

  // 12. Higiene Personal y Limpieza
  {
    id: 'prod-014',
    sku: 'JG-HIG-001',
    name: 'Paños de Microfibra Multiuso Alta Densidad Pack x 12',
    description: 'Gramaje 380 GSM, super absorbentes para secado, pulido y limpieza sin rayaduras.',
    category_slug: 'higiene-limpieza',
    category_name: 'Higiene Personal y Limpieza',
    retail_price: 12000,
    wholesale_price: 7900,
    min_wholesale_qty: 6,
    stock: 70,
    image_url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'CleanPro',
    featured: false,
    tags: ['Limpieza', 'Microfibra']
  },

  // 13. Indumentaria
  {
    id: 'prod-015',
    sku: 'JG-IND-001',
    name: 'Pack 3 Remeras Básicas 100% Algodón Peinado Unisex',
    description: 'Corte regular fit preencogido. Cuello redondo reforzado. Colores: Blanco, Negro, Gris.',
    category_slug: 'indumentaria',
    category_name: 'Indumentaria',
    retail_price: 24000,
    wholesale_price: 16800,
    min_wholesale_qty: 4,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    brand: 'UrbanWear',
    featured: true,
    tags: ['Ropa', 'Remeras', 'Algodón']
  },

  // 14. Juguetería
  {
    id: 'prod-016',
    sku: 'JG-JUG-001',
    name: 'Set de Bloques Magnéticos de Construcción 64 Piezas',
    description: 'Piezas geométricas translúcidas con imanes de neodimio para estimular motricidad y creatividad.',
    category_slug: 'jugueteria',
    category_name: 'Juguetería',
    retail_price: 27500,
    wholesale_price: 19000,
    min_wholesale_qty: 3,
    stock: 22,
    image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    unit: 'caja',
    brand: 'ToyBox',
    featured: true,
    tags: ['Juguetes', 'Bloques', 'Didácticos']
  },

  // 15. Librería
  {
    id: 'prod-017',
    sku: 'JG-LIB-001',
    name: 'Cuaderno Universitario A4 Tapa Dura 100 Hojas Rayadas',
    description: 'Papel obra 80g microprepicado con espiral metálico doble ring binder.',
    category_slug: 'libreria',
    category_name: 'Librería',
    retail_price: 6800,
    wholesale_price: 4500,
    min_wholesale_qty: 10,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Faber-Castell',
    featured: true,
    tags: ['Librería', 'Cuadernos', 'Papelería']
  },

  // 16. Libros
  {
    id: 'prod-018',
    sku: 'JG-LBR-001',
    name: 'Libro Infantil de Cuentos Ilustrados Tapa Acolchada',
    description: 'Historias breves con valores, ilustraciones a todo color y bordes redondeados seguros.',
    category_slug: 'libros',
    category_name: 'Libros',
    retail_price: 11000,
    wholesale_price: 7500,
    min_wholesale_qty: 5,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Sudamericana',
    featured: false,
    tags: ['Libros', 'Infantil', 'Lectura']
  },

  // 17. Marroquinería
  {
    id: 'prod-019',
    sku: 'JG-MAR-001',
    name: 'Billetera Bifold Hombre Cuero PU con Bloqueo RFID',
    description: 'Diseño ultrafino con 8 ranuras para tarjetas, doble visor y compartimento para billetes.',
    category_slug: 'marroquineria',
    category_name: 'Marroquinería',
    retail_price: 14500,
    wholesale_price: 9900,
    min_wholesale_qty: 6,
    stock: 45,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'MarroquiLuxe',
    featured: true,
    tags: ['Billeteras', 'Cuero', 'RFID']
  },

  // 18. Mascotas
  {
    id: 'prod-020',
    sku: 'JG-MAS-001',
    name: 'Comedero y Bebedero Doble de Acero Inox con Base Elevada',
    description: 'Inclinación ergonómica de 15° para digestión saludable y base antideslizante lavable.',
    category_slug: 'mascotas',
    category_name: 'Mascotas',
    retail_price: 16000,
    wholesale_price: 11000,
    min_wholesale_qty: 4,
    stock: 32,
    image_url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'PetCare',
    featured: true,
    tags: ['Mascotas', 'Perros', 'Gatos', 'Comedero']
  },

  // 19. Mochilas y Maletines
  {
    id: 'prod-021',
    sku: 'JG-MOC-001',
    name: 'Mochila Urbana Antirrobo Impermeable para Notebook 15.6"',
    description: 'Cremalleras ocultas, puerto USB externo, respaldo ergonómico y correa para valija.',
    category_slug: 'mochilas-maletines',
    category_name: 'Mochilas y Maletines',
    retail_price: 38000,
    wholesale_price: 26500,
    min_wholesale_qty: 3,
    stock: 20,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'SwissBag',
    featured: true,
    tags: ['Mochilas', 'Notebook', 'Antirrobo']
  },

  // 20. Navidad (Estacional)
  {
    id: 'prod-022',
    sku: 'JG-NAV-001',
    name: 'Guirnalda de Luces LED Cálidas 10m 100 Focos Exterior',
    description: 'Cable verde flexible con 8 secuencias de destello y enchufe homologado a 220V.',
    category_slug: 'navidad',
    category_name: 'Navidad',
    retail_price: 9800,
    wholesale_price: 6400,
    min_wholesale_qty: 8,
    stock: 55,
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'NavidadMagica',
    is_seasonal: true,
    featured: false,
    tags: ['Navidad', 'Luces', 'Deco']
  },

  // 21. Peluchería
  {
    id: 'prod-023',
    sku: 'JG-PEL-001',
    name: 'Oso de Peluche Gigante Soft 80cm con Moño Satinado',
    description: 'Relleno de vellón siliconado hipoalergénico ultra suave de alta densidad.',
    category_slug: 'pelucheria',
    category_name: 'Peluchería',
    retail_price: 32000,
    wholesale_price: 22000,
    min_wholesale_qty: 2,
    stock: 12,
    image_url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Plushy',
    featured: false,
    tags: ['Peluches', 'Regalería', 'Niños']
  },

  // 22. Símbolos Patrios
  {
    id: 'prod-025',
    sku: 'JG-PAT-001',
    name: 'Bandera Oficial Argentina Protocolar 1.40 x 0.90 m con Sol Bordado',
    description: 'Poliéster náutico apto para intemperie con sol bordado y ojales reforzados de bronce.',
    category_slug: 'simbolos-patrios',
    category_name: 'Símbolos Patrios',
    retail_price: 12500,
    wholesale_price: 8000,
    min_wholesale_qty: 6,
    stock: 30,
    image_url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'PatriaMia',
    featured: false,
    tags: ['Banderas', 'Patria', 'Argentina']
  },

  // 23. Textil
  {
    id: 'prod-026',
    sku: 'JG-TEX-001',
    name: 'Juego de Toalla y Toallón 500g 100% Algodón Peinado',
    description: 'Máxima absorción y suavidad al tacto. Medidas: Toallón 70x140cm, Toalla 50x80cm.',
    category_slug: 'textil',
    category_name: 'Textil',
    retail_price: 21000,
    wholesale_price: 14500,
    min_wholesale_qty: 4,
    stock: 26,
    image_url: 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600&auto=format&fit=crop&q=80',
    unit: 'set',
    brand: 'TextilHogar',
    featured: true,
    tags: ['Textil', 'Toallas', 'Baño']
  },

  // 24. Verano (Estacional)
  {
    id: 'prod-027',
    sku: 'JG-VER-001',
    name: 'Flotador Inflable Gigante Flamenco Rosa con Asas',
    description: 'Vinilo resistente de 0.30mm de espesor con doble válvula de inflado rápido. Medida 1.30m.',
    category_slug: 'verano',
    category_name: 'Verano',
    retail_price: 24000,
    wholesale_price: 16500,
    min_wholesale_qty: 3,
    stock: 14,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    brand: 'Bestway',
    is_seasonal: true,
    featured: false,
    tags: ['Verano', 'Inflables', 'Playa']
  }
];
