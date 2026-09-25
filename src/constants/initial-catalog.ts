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
    featured: true,
    tags: ['Bazar', 'Termos', 'Cocina']
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
    featured: false,
    tags: ['Escolar', 'Cartucheras']
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
    featured: true,
    tags: ['Deco', 'Organización', 'Hogar']
  },

  // 9. Electro
  {
    id: 'prod-011',
    sku: 'JG-ELE-001',
    name: 'Lámpara de Escritorio LED Flexo USB con Carga Inalámbrica',
    description: 'Control touch, 5 intensidades de brillo y pad de carga rápida Qi para smartphones.',
    category_slug: 'electro',
    category_name: 'Electro',
    retail_price: 29900,
    wholesale_price: 21000,
    min_wholesale_qty: 3,
    stock: 15,
    image_url: 'https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: true,
    tags: ['Electro', 'Iluminación', 'Tecnología']
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
    featured: false,
    tags: ['Limpieza', 'Microfibra']
  },

  // 13. Indumentaria
  {
    id: 'prod-015',
    sku: 'JG-IND-001',
    name: 'Gorra Urbana Lisa Ajustable Gabardina Premium',
    description: 'Confección en algodón 100% reforzado con hebilla metálica. Ideal para bordados o uso diario.',
    category_slug: 'indumentaria',
    category_name: 'Indumentaria',
    retail_price: 10000,
    wholesale_price: 6800,
    min_wholesale_qty: 8,
    stock: 65,
    image_url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: true,
    tags: ['Moda', 'Gorras', 'Accesorios']
  },

  // 14. Juguetería
  {
    id: 'prod-016',
    sku: 'JG-JUG-001',
    name: 'Bloques de Construcción Magnéticos 64 Piezas',
    description: 'Juego didáctico STEM con piezas traslúcidas de bordes redondeados y potentes imanes.',
    category_slug: 'jugueteria',
    category_name: 'Juguetería',
    retail_price: 26000,
    wholesale_price: 18000,
    min_wholesale_qty: 3,
    stock: 22,
    image_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80',
    unit: 'set',
    featured: true,
    tags: ['Juguetes', 'Didácticos', 'Niños']
  },

  // 15. Librería
  {
    id: 'prod-017',
    sku: 'JG-LIB-001',
    name: 'Cuaderno Universitario Tapa Dura Cuadriculado A4',
    description: '100 hojas de 90g resistentes a tinta gel y pluma. Encuadernación anillada doble.',
    category_slug: 'libreria',
    category_name: 'Librería',
    retail_price: 6500,
    wholesale_price: 4200,
    min_wholesale_qty: 12,
    stock: 120,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: true,
    tags: ['Librería', 'Cuadernos', 'Papelería']
  },
  {
    id: 'prod-018',
    sku: 'JG-LIB-002',
    name: 'Set Marcadores Doble Punta Pincel & Fina x 24',
    description: 'Tinta base al agua para lettering, bullet journal, dibujo e ilustraciones.',
    category_slug: 'libreria',
    category_name: 'Librería',
    retail_price: 14500,
    wholesale_price: 9800,
    min_wholesale_qty: 4,
    stock: 35,
    image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&auto=format&fit=crop&q=80',
    unit: 'pack',
    featured: false,
    tags: ['Librería', 'Marcadores', 'Lettering']
  },

  // 16. Libros
  {
    id: 'prod-019',
    sku: 'JG-LBR-001',
    name: 'Libro de Colorear Anti-Estrés Mandalas & Naturaleza',
    description: 'Papel de 140g para colorear con lápices o fibras. Diseños intrincados para relajación.',
    category_slug: 'libros',
    category_name: 'Libros',
    retail_price: 9000,
    wholesale_price: 6200,
    min_wholesale_qty: 6,
    stock: 40,
    image_url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: false,
    tags: ['Libros', 'Creatividad', 'Arte']
  },

  // 17. Marroquinería
  {
    id: 'prod-020',
    sku: 'JG-MAR-001',
    name: 'Billetera Bifold Cuero Ecológico con Bloqueo RFID',
    description: 'Diseño ultra slim con 8 tarjeteros, doble compartimento para billetes y protección contra clonación.',
    category_slug: 'marroquineria',
    category_name: 'Marroquinería',
    retail_price: 16000,
    wholesale_price: 10500,
    min_wholesale_qty: 6,
    stock: 42,
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: true,
    tags: ['Marroquinería', 'Billeteras', 'Accesorios']
  },

  // 18. Mascotas
  {
    id: 'prod-021',
    sku: 'JG-MAS-001',
    name: 'Comedero Lento Anti-Ansiedad Mascotas Antideslizante',
    description: 'Diseño en laberinto que previene la ingesta rápida y asfixia. Material no tóxico grado alimenticio.',
    category_slug: 'mascotas',
    category_name: 'Mascotas',
    retail_price: 11000,
    wholesale_price: 7200,
    min_wholesale_qty: 5,
    stock: 32,
    image_url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: false,
    tags: ['Mascotas', 'Perros', 'Gatos']
  },

  // 19. Mochilas y Maletines
  {
    id: 'prod-022',
    sku: 'JG-MOC-001',
    name: 'Mochila Urbana Antirrobo para Notebook 15.6" con Puerto USB',
    description: 'Tela Oxford impermeable de alta resistencia con costuras reforzadas, bolsillo oculto y puerto USB.',
    category_slug: 'mochilas-maletines',
    category_name: 'Mochilas y Maletines',
    retail_price: 34000,
    wholesale_price: 23500,
    min_wholesale_qty: 3,
    stock: 25,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: true,
    tags: ['Mochilas', 'Notebook', 'Equipaje']
  },

  // 20. Navidad (Estacional)
  {
    id: 'prod-023',
    sku: 'JG-NAV-001',
    name: 'Guirnalda de Luces LED Cálidas 10m con 8 Efectos',
    description: 'Cable transparente para interior y exterior con control de efectos luminosos.',
    category_slug: 'navidad',
    category_name: 'Navidad',
    retail_price: 8500,
    wholesale_price: 5500,
    min_wholesale_qty: 10,
    stock: 85,
    image_url: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    is_seasonal: true,
    featured: false,
    tags: ['Navidad', 'Luces', 'Fiestas']
  },

  // 21. Peluchería
  {
    id: 'prod-024',
    sku: 'JG-PEL-001',
    name: 'Peluche Oso Clásico Premium Hipoalergénico 40cm',
    description: 'Textura extra suave afelpada, relleno de vellón siliconado lavable con moño de raso.',
    category_slug: 'pelucheria',
    category_name: 'Peluchería',
    retail_price: 19500,
    wholesale_price: 13000,
    min_wholesale_qty: 4,
    stock: 19,
    image_url: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600&auto=format&fit=crop&q=80',
    unit: 'unidad',
    featured: false,
    tags: ['Peluches', 'Regalos', 'Infantil']
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
    is_seasonal: true,
    featured: false,
    tags: ['Verano', 'Inflables', 'Playa']
  }
];
