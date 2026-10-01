export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  isSeasonal?: boolean;
  featured?: boolean;
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'aromatizacion-velas',
    slug: 'aromatizacion-velas',
    name: 'Aromatización y Velas',
    description: 'Difusores, esencias, velas aromáticas y sahumerios.',
    icon: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'arte-manualidades',
    slug: 'arte-manualidades',
    name: 'Arte y Manualidades',
    description: 'Pinturas, pinceles, masas, bastidores y materiales creativos.',
    icon: 'palette',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'articulos-viaje',
    slug: 'articulos-viaje',
    name: 'Artículos para Viaje',
    description: 'Organizadores de valija, candados, almohadillas y accesorios.',
    icon: 'plane',
    imageUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'bazar-cocina',
    slug: 'bazar-cocina',
    name: 'Bazar y Cocina',
    description: 'Utensilios, vajilla, termos, recipientes y accesorios de cocina.',
    icon: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'belleza-accesorios',
    slug: 'belleza-accesorios',
    name: 'Belleza y Accesorios',
    description: 'Cosméticos, cuidado personal, peines, espejos y accesorios.',
    icon: 'sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'cartucheras-carpetas',
    slug: 'cartucheras-carpetas',
    name: 'Cartucheras y Carpetas',
    description: 'Cartucheras escolares, carpetas clasificadoras y folios.',
    icon: 'folder',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'cotillon',
    slug: 'cotillon',
    name: 'Cotillón',
    description: 'Globos, guirnaldas, antifaces y artículos para fiestas.',
    icon: 'party',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'deco-organizacion-hogar',
    slug: 'deco-organizacion-hogar',
    name: 'Deco y Organización del Hogar',
    description: 'Cajas organizadoras, perchas, marcos y decoración.',
    icon: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'electro',
    slug: 'electro',
    name: 'Electro',
    description: 'Pequeños electrodomésticos, cables, lámparas LED y gadgets.',
    icon: 'deviceLaptop',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'embalajes',
    slug: 'embalajes',
    name: 'Embalajes',
    description: 'Cintas adhesivas, bolsas de envío, papel kraft y film.',
    icon: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'ferreteria-pesca',
    slug: 'ferreteria-pesca',
    name: 'Ferretería y Pesca',
    description: 'Herramientas de mano, linternas, cuerdas y artículos de pesca.',
    icon: 'tool',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'higiene-limpieza',
    slug: 'higiene-limpieza',
    name: 'Higiene Personal y Limpieza',
    description: 'Jabones, paños de microfibra, esponjas y limpieza del hogar.',
    icon: 'wash',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'indumentaria',
    slug: 'indumentaria',
    name: 'Indumentaria',
    description: 'Ropa básica, medias, gorros, bufandas e indumentaria variada.',
    icon: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'jugueteria',
    slug: 'jugueteria',
    name: 'Juguetería',
    description: 'Juguetes infantiles, juegos de mesa, autos, bloques y muñecas.',
    icon: 'puzzle',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'libreria',
    slug: 'libreria',
    name: 'Librería',
    description: 'Cuadernos, bolígrafos, marcadores, tijeras y papelería comercial.',
    icon: 'pencil',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'libros',
    slug: 'libros',
    name: 'Libros',
    description: 'Libros infantiles, novelas, libros de colorear y guías.',
    icon: 'book',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'marroquineria',
    slug: 'marroquineria',
    name: 'Marroquinería',
    description: 'Carteras, billeteras, cinturones, riñoneras y bolsos.',
    icon: 'briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'mascotas',
    slug: 'mascotas',
    name: 'Mascotas',
    description: 'Juguetes para mascotas, correas, comederos y accesorios.',
    icon: 'paw',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'mochilas-maletines',
    slug: 'mochilas-maletines',
    name: 'Mochilas y Maletines',
    description: 'Mochilas urbanas, escolares, mochilas para notebook y maletines.',
    icon: 'backpack',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80',
    featured: true
  },
  {
    id: 'navidad',
    slug: 'navidad',
    name: 'Navidad',
    description: 'Árboles de navidad, luces, adornos, guirnaldas y pesebres.',
    icon: 'gift',
    imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=300&auto=format&fit=crop&q=80',
    isSeasonal: true,
    featured: false
  },
  {
    id: 'pelucheria',
    slug: 'pelucheria',
    name: 'Peluchería',
    description: 'Peluches de colección, personajes y almohadones afelpados.',
    icon: 'heart',
    imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'simbolos-patrios',
    slug: 'simbolos-patrios',
    name: 'Símbolos Patrios',
    description: 'Banderas, escarapelas, cintas y artículos conmemorativos.',
    icon: 'flag',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'textil',
    slug: 'textil',
    name: 'Textil',
    description: 'Toallas, mantas, sábanas, repasadores y cortinas.',
    icon: 'layout',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80',
    featured: false
  },
  {
    id: 'verano',
    slug: 'verano',
    name: 'Verano',
    description: 'Inflables, sombrillas, toallas de playa, salvavidas y lentes.',
    icon: 'sun',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    isSeasonal: true,
    featured: false
  }
];

export const CATEGORY_MAP = new Map(
  PRODUCT_CATEGORIES.map((cat) => [cat.slug, cat])
);
