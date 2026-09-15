export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
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
    featured: true
  },
  {
    id: 'arte-manualidades',
    slug: 'arte-manualidades',
    name: 'Arte y Manualidades',
    description: 'Pinturas, pinceles, masas, bastidores y materiales creativos.',
    icon: 'palette',
    featured: true
  },
  {
    id: 'articulos-viaje',
    slug: 'articulos-viaje',
    name: 'Artículos para Viaje',
    description: 'Organizadores de valija, candados, almohadillas y accesorios.',
    icon: 'plane',
    featured: false
  },
  {
    id: 'bazar-cocina',
    slug: 'bazar-cocina',
    name: 'Bazar y Cocina',
    description: 'Utensilios, vajilla, termos, recipientes y accesorios de cocina.',
    icon: 'coffee',
    featured: true
  },
  {
    id: 'belleza-accesorios',
    slug: 'belleza-accesorios',
    name: 'Belleza y Accesorios',
    description: 'Cosméticos, cuidado personal, peines, espejos y accesorios.',
    icon: 'sparkles',
    featured: true
  },
  {
    id: 'cartucheras-carpetas',
    slug: 'cartucheras-carpetas',
    name: 'Cartucheras y Carpetas',
    description: 'Cartucheras escolares, carpetas clasificadoras y folios.',
    icon: 'folder',
    featured: false
  },
  {
    id: 'cotillon',
    slug: 'cotillon',
    name: 'Cotillón',
    description: 'Globos, guirnaldas, antifaces y artículos para fiestas.',
    icon: 'party',
    featured: false
  },
  {
    id: 'deco-organizacion-hogar',
    slug: 'deco-organizacion-hogar',
    name: 'Deco y Organización del Hogar',
    description: 'Cajas organizadoras, perchas, marcos y decoración.',
    icon: 'home',
    featured: true
  },
  {
    id: 'electro',
    slug: 'electro',
    name: 'Electro',
    description: 'Pequeños electrodomésticos, cables, lámparas LED y gadgets.',
    icon: 'deviceLaptop',
    featured: true
  },
  {
    id: 'embalajes',
    slug: 'embalajes',
    name: 'Embalajes',
    description: 'Cintas adhesivas, bolsas de envío, papel kraft y film.',
    icon: 'package',
    featured: false
  },
  {
    id: 'ferreteria-pesca',
    slug: 'ferreteria-pesca',
    name: 'Ferretería y Pesca',
    description: 'Herramientas de mano, linternas, cuerdas y artículos de pesca.',
    icon: 'tool',
    featured: false
  },
  {
    id: 'higiene-limpieza',
    slug: 'higiene-limpieza',
    name: 'Higiene Personal y Limpieza',
    description: 'Jabones, paños de microfibra, esponjas y limpieza del hogar.',
    icon: 'wash',
    featured: false
  },
  {
    id: 'indumentaria',
    slug: 'indumentaria',
    name: 'Indumentaria',
    description: 'Ropa básica, medias, gorros, bufandas e indumentaria variada.',
    icon: 'shirt',
    featured: true
  },
  {
    id: 'jugueteria',
    slug: 'jugueteria',
    name: 'Juguetería',
    description: 'Juguetes infantiles, juegos de mesa, autos, bloques y muñecas.',
    icon: 'puzzle',
    featured: true
  },
  {
    id: 'libreria',
    slug: 'libreria',
    name: 'Librería',
    description: 'Cuadernos, bolígrafos, marcadores, tijeras y papelería comercial.',
    icon: 'pencil',
    featured: true
  },
  {
    id: 'libros',
    slug: 'libros',
    name: 'Libros',
    description: 'Libros infantiles, novelas, libros de colorear y guías.',
    icon: 'book',
    featured: false
  },
  {
    id: 'marroquineria',
    slug: 'marroquineria',
    name: 'Marroquinería',
    description: 'Carteras, billeteras, cinturones, riñoneras y bolsos.',
    icon: 'briefcase',
    featured: true
  },
  {
    id: 'mascotas',
    slug: 'mascotas',
    name: 'Mascotas',
    description: 'Juguetes para mascotas, correas, comederos y accesorios.',
    icon: 'paw',
    featured: true
  },
  {
    id: 'mochilas-maletines',
    slug: 'mochilas-maletines',
    name: 'Mochilas y Maletines',
    description: 'Mochilas urbanas, escolares, mochilas para notebook y maletines.',
    icon: 'backpack',
    featured: true
  },
  {
    id: 'navidad',
    slug: 'navidad',
    name: 'Navidad',
    description: 'Árboles de navidad, luces, adornos, guirnaldas y pesebres.',
    icon: 'gift',
    isSeasonal: true,
    featured: false
  },
  {
    id: 'pelucheria',
    slug: 'pelucheria',
    name: 'Peluchería',
    description: 'Peluches de colección, personajes y almohadones afelpados.',
    icon: 'heart',
    featured: false
  },
  {
    id: 'simbolos-patrios',
    slug: 'simbolos-patrios',
    name: 'Símbolos Patrios',
    description: 'Banderas, escarapelas, cintas y artículos conmemorativos.',
    icon: 'flag',
    featured: false
  },
  {
    id: 'textil',
    slug: 'textil',
    name: 'Textil',
    description: 'Toallas, mantas, sábanas, repasadores y cortinas.',
    icon: 'layout',
    featured: false
  },
  {
    id: 'verano',
    slug: 'verano',
    name: 'Verano',
    description: 'Inflables, sombrillas, toallas de playa, salvavidas y lentes.',
    icon: 'sun',
    isSeasonal: true,
    featured: false
  }
];

export const CATEGORY_MAP = new Map(
  PRODUCT_CATEGORIES.map((cat) => [cat.slug, cat])
);
