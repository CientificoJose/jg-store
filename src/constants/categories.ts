import { SubCategory, SubSubCategory } from '@/types/store';

export interface ProductCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  imageUrl: string;
  isSeasonal?: boolean;
  featured?: boolean;
  subcategories?: SubCategory[];
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'aromatizacion-velas',
    slug: 'aromatizacion-velas',
    name: 'Aromatización y Velas',
    description: 'Difusores, esencias, velas aromáticas y sahumerios.',
    icon: 'flame',
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'aroma-difusores',
        category_id: 'aromatizacion-velas',
        category_slug: 'aromatizacion-velas',
        slug: 'difusores-esencias',
        name: 'Difusores y Esencias',
        description: 'Difusores con varillas de bambú, esencias puras y repuestos líquidos',
        icon: 'flame',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'aroma-difusores-varillas',
            subcategory_id: 'aroma-difusores',
            subcategory_slug: 'difusores-esencias',
            category_slug: 'aromatizacion-velas',
            slug: 'difusores-varillas-bambu',
            name: 'Difusores de Ambiente con Varillas',
            description: 'Frascos difusores de 125ml y 250ml con varillas de ratán',
            display_order: 1
          },
          {
            id: 'aroma-difusores-repuestos',
            subcategory_id: 'aroma-difusores',
            subcategory_slug: 'difusores-esencias',
            category_slug: 'aromatizacion-velas',
            slug: 'repuestos-aromatizadores',
            name: 'Repuestos de Esencias Líquidas',
            description: 'Botellas de recarga de 500ml para aromatizadores continuos',
            display_order: 2
          },
          {
            id: 'aroma-difusores-aceites',
            subcategory_id: 'aroma-difusores',
            subcategory_slug: 'difusores-esencias',
            category_slug: 'aromatizacion-velas',
            slug: 'aceites-esenciales-puros',
            name: 'Aceites Esenciales e Hidrosolubles',
            description: 'Esencias concentradas para humidificadores ultrasónicos y hornillos',
            display_order: 3
          }
        ]
      },
      {
        id: 'aroma-velas',
        category_id: 'aromatizacion-velas',
        category_slug: 'aromatizacion-velas',
        slug: 'velas-aromaticas',
        name: 'Velas Aromáticas',
        description: 'Velas de cera de soja vegetal en cuencos y vasos de vidrio',
        icon: 'flame',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'aroma-velas-soja-ceramica',
            subcategory_id: 'aroma-velas',
            subcategory_slug: 'velas-aromaticas',
            category_slug: 'aromatizacion-velas',
            slug: 'velas-soja-cuenco',
            name: 'Velas de Soja en Cuenco',
            description: 'Velas de cera vegetal de soja 100% natural en cerámica artesanal',
            display_order: 1
          },
          {
            id: 'aroma-velas-vaso-vidrio',
            subcategory_id: 'aroma-velas',
            subcategory_slug: 'velas-aromaticas',
            category_slug: 'aromatizacion-velas',
            slug: 'velas-aromaticas-vidrio',
            name: 'Velas Aromáticas en Vaso de Vidrio',
            description: 'Velas en vaso de vidrio esmerilado con tapa de madera',
            display_order: 2
          },
          {
            id: 'aroma-velas-noche',
            subcategory_id: 'aroma-velas',
            subcategory_slug: 'velas-aromaticas',
            category_slug: 'aromatizacion-velas',
            slug: 'velas-de-noche-packs',
            name: 'Velas de Noche y Repuestos',
            description: 'Packs x10, x25 y x50 unidades en molde de aluminio',
            display_order: 3
          }
        ]
      },
      {
        id: 'aroma-sahumerios',
        category_id: 'aromatizacion-velas',
        category_slug: 'aromatizacion-velas',
        slug: 'sahumerios-porta',
        name: 'Sahumerios y Portasahumerios',
        description: 'Varillas masala, conos de reflujo cascada y quemadores decorativos',
        icon: 'flame',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'aroma-sahumerios-varillas',
            subcategory_id: 'aroma-sahumerios',
            subcategory_slug: 'sahumerios-porta',
            category_slug: 'aromatizacion-velas',
            slug: 'sahumerios-varillas-masala',
            name: 'Sahumerios en Varillas Masala',
            description: 'Varillas importadas aromaterapia extra duración',
            display_order: 1
          },
          {
            id: 'aroma-sahumerios-conos',
            subcategory_id: 'aroma-sahumerios',
            subcategory_slug: 'sahumerios-porta',
            category_slug: 'aromatizacion-velas',
            slug: 'conos-cascada-humo',
            name: 'Conos de Humo Cascada',
            description: 'Conos de reflujo aromáticos para fuentes y quemadores cascada',
            display_order: 2
          },
          {
            id: 'aroma-sahumerios-porta',
            subcategory_id: 'aroma-sahumerios',
            subcategory_slug: 'sahumerios-porta',
            category_slug: 'aromatizacion-velas',
            slug: 'portasahumerios-artesanales',
            name: 'Portasahumerios y Quemadores',
            description: 'Quemadores de resina, madera de mango y cerámica',
            display_order: 3
          }
        ]
      }
    ]
  },
  {
    id: 'arte-manualidades',
    slug: 'arte-manualidades',
    name: 'Arte y Manualidades',
    description: 'Pinturas, pinceles, masas, bastidores y materiales creativos.',
    icon: 'palette',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'arte-pinturas',
        category_id: 'arte-manualidades',
        category_slug: 'arte-manualidades',
        slug: 'pinturas-acrilicos',
        name: 'Pinturas y Acrílicos',
        description: 'Acrílicos profesionales, témperas y óleos de alta pigmentación',
        icon: 'palette',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'arte-pinturas-acrilicos-set',
            subcategory_id: 'arte-pinturas',
            subcategory_slug: 'pinturas-acrilicos',
            category_slug: 'arte-manualidades',
            slug: 'sets-acrilicos-profesionales',
            name: 'Sets de Pinturas Acrílicas',
            description: 'Sets de 12 y 24 pomos con pigmentación de alta resistencia',
            display_order: 1
          },
          {
            id: 'arte-pinturas-temperas-escolares',
            subcategory_id: 'arte-pinturas',
            subcategory_slug: 'pinturas-acrilicos',
            category_slug: 'arte-manualidades',
            slug: 'temperas-escolares-lavables',
            name: 'Témperas Lavables Escolares',
            description: 'Potes de témpera lavable no tóxica para niños y escuelas',
            display_order: 2
          },
          {
            id: 'arte-pinturas-acuarelas',
            subcategory_id: 'arte-pinturas',
            subcategory_slug: 'pinturas-acrilicos',
            category_slug: 'arte-manualidades',
            slug: 'acuarelas-pastillas-tubo',
            name: 'Acuarelas en Pastilla y Tubo',
            description: 'Cajas de acuarela para estudiantes y artistas',
            display_order: 3
          }
        ]
      },
      {
        id: 'arte-pinceles',
        category_id: 'arte-manualidades',
        category_slug: 'arte-manualidades',
        slug: 'pinceles-espatulas',
        name: 'Pinceles y Espátulas',
        description: 'Sets de pinceles sintéticos, de cerda natural y espátulas de mezcla',
        icon: 'palette',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'arte-pinceles-sets',
            subcategory_id: 'arte-pinceles',
            subcategory_slug: 'pinceles-espatulas',
            category_slug: 'arte-manualidades',
            slug: 'sets-pinceles-sinteticos',
            name: 'Sets de Pinceles Multiuso',
            description: 'Kits surtidos chatos, redondos y lengua de gato',
            display_order: 1
          },
          {
            id: 'arte-pinceles-espatulas',
            subcategory_id: 'arte-pinceles',
            subcategory_slug: 'pinceles-espatulas',
            category_slug: 'arte-manualidades',
            slug: 'espatulas-mezcla-oleo',
            name: 'Espátulas para Óleo y Acrílico',
            description: 'Espátulas flexibles de acero con mango de madera',
            display_order: 2
          }
        ]
      },
      {
        id: 'arte-bastidores',
        category_id: 'arte-manualidades',
        category_slug: 'arte-manualidades',
        slug: 'bastidores-lienzos',
        name: 'Bastidores y Lienzos',
        description: 'Lienzos entelados de algodón y tablas de madera preparadas',
        icon: 'palette',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'arte-bastidores-lienzos',
            subcategory_id: 'arte-bastidores',
            subcategory_slug: 'bastidores-lienzos',
            category_slug: 'arte-manualidades',
            slug: 'lienzos-entelados-algodon',
            name: 'Bastidores Entelados de Algodón',
            description: 'Bastidores reforzados con tela imprimada para acrílico y óleo',
            display_order: 1
          },
          {
            id: 'arte-bastidores-tablas',
            subcategory_id: 'arte-bastidores',
            subcategory_slug: 'bastidores-lienzos',
            category_slug: 'arte-manualidades',
            slug: 'tablas-mdf-enteladas',
            name: 'Tablas Enteladas MDF',
            description: 'Paneles rígidos livianos ideales para estudio y bocetos',
            display_order: 2
          }
        ]
      },
      {
        id: 'arte-modelado',
        category_id: 'arte-manualidades',
        category_slug: 'arte-manualidades',
        slug: 'modelado-arcilla',
        name: 'Modelado, Masas y Porcelana',
        description: 'Porcelana fría, plastilinas y masas de secado al aire',
        icon: 'palette',
        display_order: 4,
        sub_subcategories: [
          {
            id: 'arte-modelado-porcelana',
            subcategory_id: 'arte-modelado',
            subcategory_slug: 'modelado-arcilla',
            category_slug: 'arte-manualidades',
            slug: 'porcelana-fria-profesional',
            name: 'Porcelana Fría Tradicional y Soft',
            description: 'Paquetes de 500g y 1kg de máxima elasticidad sin grietas',
            display_order: 1
          },
          {
            id: 'arte-modelado-plastilinas',
            subcategory_id: 'arte-modelado',
            subcategory_slug: 'modelado-arcilla',
            category_slug: 'arte-manualidades',
            slug: 'plastilinas-masas-moldear',
            name: 'Plastilinas y Masas Didácticas',
            description: 'Barras de plastilina colorida para talleres escolares',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'articulos-viaje',
    slug: 'articulos-viaje',
    name: 'Artículos para Viaje',
    description: 'Organizadores de valija, candados, almohadillas y accesorios.',
    icon: 'plane',
    imageUrl: 'https://images.unsplash.com/photo-1581553680321-4fffae59fccd?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'viaje-organizadores',
        category_id: 'articulos-viaje',
        category_slug: 'articulos-viaje',
        slug: 'valijas-organizadores',
        name: 'Organizadores de Equipaje',
        description: 'Sets de cubos organizadores, fundas para valija y bolsas de compresión',
        icon: 'plane',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'viaje-organizadores-cubos',
            subcategory_id: 'viaje-organizadores',
            subcategory_slug: 'valijas-organizadores',
            category_slug: 'articulos-viaje',
            slug: 'sets-cubos-organizadores',
            name: 'Sets de Cubos Organizadores x6 y x8',
            description: 'Bolsas organizadoras impermeables con malla respirable',
            display_order: 1
          },
          {
            id: 'viaje-organizadores-fundas',
            subcategory_id: 'viaje-organizadores',
            subcategory_slug: 'valijas-organizadores',
            category_slug: 'articulos-viaje',
            slug: 'fundas-elasticas-valija',
            name: 'Fundas Elásticas para Valija',
            description: 'Fundas protectoras estampadas de spandex lavables',
            display_order: 2
          }
        ]
      },
      {
        id: 'viaje-seguridad',
        category_id: 'articulos-viaje',
        category_slug: 'articulos-viaje',
        slug: 'seguridad-viaje',
        name: 'Seguridad y Documentación',
        description: 'Candados aprobados TSA, porta pasaportes RFID y balanzas portátiles',
        icon: 'plane',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'viaje-seguridad-candados',
            subcategory_id: 'viaje-seguridad',
            subcategory_slug: 'seguridad-viaje',
            category_slug: 'articulos-viaje',
            slug: 'candados-tsa-combinacion',
            name: 'Candados TSA con Combinación',
            description: 'Candados normalizados para aduanas con dial de 3 dígitos',
            display_order: 1
          },
          {
            id: 'viaje-seguridad-portadocumentos',
            subcategory_id: 'viaje-seguridad',
            subcategory_slug: 'seguridad-viaje',
            category_slug: 'articulos-viaje',
            slug: 'porta-pasaportes-rfid',
            name: 'Porta Pasaportes y Billeteras de Viaje',
            description: 'Fundas con bloqueo anti-clonación RFID para tarjetas y pasaportes',
            display_order: 2
          }
        ]
      },
      {
        id: 'viaje-confort',
        category_id: 'articulos-viaje',
        category_slug: 'articulos-viaje',
        slug: 'confort-viaje',
        name: 'Confort y Accesorios Personales',
        description: 'Almohadas viscoelásticas, antifaces para dormir y botellas dosificadoras',
        icon: 'plane',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'viaje-confort-almohadas',
            subcategory_id: 'viaje-confort',
            subcategory_slug: 'confort-viaje',
            category_slug: 'articulos-viaje',
            slug: 'almohadas-cervicales-visco',
            name: 'Almohadas Cervicales Memory Foam',
            description: 'Almohadillas ergonómicas con broche frontal y funda suave',
            display_order: 1
          },
          {
            id: 'viaje-confort-botellas',
            subcategory_id: 'viaje-confort',
            subcategory_slug: 'confort-viaje',
            category_slug: 'articulos-viaje',
            slug: 'sets-botellas-silicona-viaje',
            name: 'Sets de Botellas de Silicona Aptas Avión',
            description: 'Envases dosificadores de 60ml y 90ml antifuga',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'bazar-cocina',
    slug: 'bazar-cocina',
    name: 'Bazar y Cocina',
    description: 'Utensilios, vajilla, termos, recipientes y accesorios de cocina.',
    icon: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'bazar-termos',
        category_id: 'bazar-cocina',
        category_slug: 'bazar-cocina',
        slug: 'termos-botellas',
        name: 'Termos y Botellas',
        description: 'Termos bala de acero inoxidable, botellas térmicas y mates',
        icon: 'coffee',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'bazar-termos-acero-inox',
            subcategory_id: 'bazar-termos',
            subcategory_slug: 'termos-botellas',
            category_slug: 'bazar-cocina',
            slug: 'botellas-acero-inoxidable',
            name: 'Botellas Térmicas de Acero Inoxidable',
            description: 'Botellas de doble pared aisladas al vacío 500ml / 750ml / 1L',
            display_order: 1
          },
          {
            id: 'bazar-termos-pico-cebador',
            subcategory_id: 'bazar-termos',
            subcategory_slug: 'termos-botellas',
            category_slug: 'bazar-cocina',
            slug: 'termos-pico-cebador',
            name: 'Termos con Pico Cebador',
            description: 'Termos tipo bala ideales para mate con manija ergonómica',
            display_order: 2
          },
          {
            id: 'bazar-termos-mates-termicos',
            subcategory_id: 'bazar-termos',
            subcategory_slug: 'termos-botellas',
            category_slug: 'bazar-cocina',
            slug: 'mates-termicos-acero',
            name: 'Mates Térmicos y Bombillas',
            description: 'Mates térmicos de acero inoxidable y bombillas de alpaca',
            display_order: 3
          }
        ]
      },
      {
        id: 'bazar-vajilla',
        category_id: 'bazar-cocina',
        category_slug: 'bazar-cocina',
        slug: 'vajilla-utensilios',
        name: 'Vajilla y Utensilios',
        description: 'Platos, cubiertos en set, recipientes herméticos y tablas de picar',
        icon: 'coffee',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'bazar-vajilla-hermeticos',
            subcategory_id: 'bazar-vajilla',
            subcategory_slug: 'vajilla-utensilios',
            category_slug: 'bazar-cocina',
            slug: 'recipientes-hermeticos',
            name: 'Recipientes Herméticos y Tupperwares',
            description: 'Sets herméticos libres de BPA aptos para microondas',
            display_order: 1
          },
          {
            id: 'bazar-vajilla-cubiertos-set',
            subcategory_id: 'bazar-vajilla',
            subcategory_slug: 'vajilla-utensilios',
            category_slug: 'bazar-cocina',
            slug: 'cubiertos-acero-sets',
            name: 'Juegos de Cubiertos',
            description: 'Sets de 24 piezas en acero inoxidable con mango pulido',
            display_order: 2
          },
          {
            id: 'bazar-vajilla-tablas-corte',
            subcategory_id: 'bazar-vajilla',
            subcategory_slug: 'vajilla-utensilios',
            category_slug: 'bazar-cocina',
            slug: 'tablas-corte-bambu',
            name: 'Tablas de Corte en Bambú y Madera',
            description: 'Tablas antibacterianas con canaleta para jugos',
            display_order: 3
          }
        ]
      },
      {
        id: 'bazar-cafe',
        category_id: 'bazar-cocina',
        category_slug: 'bazar-cocina',
        slug: 'cafeteria-infusiones',
        name: 'Cafetería e Infusiones',
        description: 'Cafeteras prensa francesa, teteras con infusor y espumadores',
        icon: 'coffee',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'bazar-cafe-prensa',
            subcategory_id: 'bazar-cafe',
            subcategory_slug: 'cafeteria-infusiones',
            category_slug: 'bazar-cocina',
            slug: 'cafeteras-prensa-francesa',
            name: 'Cafeteras Francesas de Émbolo',
            description: 'Prensas de vidrio borosilicato resistente y émbolo metálico',
            display_order: 1
          },
          {
            id: 'bazar-cafe-espumadores',
            subcategory_id: 'bazar-cafe',
            subcategory_slug: 'cafeteria-infusiones',
            category_slug: 'bazar-cocina',
            slug: 'espumadores-leche-portatiles',
            name: 'Espumadores de Leche a Pilas',
            description: 'Batidores eléctricos compactos de acero inoxidable para capuchino',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'belleza-accesorios',
    slug: 'belleza-accesorios',
    name: 'Belleza y Accesorios',
    description: 'Cosméticos, cuidado personal, peines, espejos y accesorios.',
    icon: 'sparkles',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'belleza-maquillaje',
        category_id: 'belleza-accesorios',
        category_slug: 'belleza-accesorios',
        slug: 'maquillaje-cosmetica',
        name: 'Maquillaje y Cosmética',
        description: 'Labiales, paletas de sombras, bases y brochas de maquillaje',
        icon: 'sparkles',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'belleza-maquillaje-brochas',
            subcategory_id: 'belleza-maquillaje',
            subcategory_slug: 'maquillaje-cosmetica',
            category_slug: 'belleza-accesorios',
            slug: 'sets-brochas-maquillaje',
            name: 'Sets de Brochas Profesionales',
            description: 'Kits completos con estuche cilíndrico o cartuchera enrollable',
            display_order: 1
          },
          {
            id: 'belleza-maquillaje-labiales',
            subcategory_id: 'belleza-maquillaje',
            subcategory_slug: 'maquillaje-cosmetica',
            category_slug: 'belleza-accesorios',
            slug: 'labiales-brillos-gloss',
            name: 'Labiales Matte y Brillos Gloss',
            description: 'Labiales de larga duración e hidratantes labiales con color',
            display_order: 2
          }
        ]
      },
      {
        id: 'belleza-skincare',
        category_id: 'belleza-accesorios',
        category_slug: 'belleza-accesorios',
        slug: 'cuidado-facial-skincare',
        name: 'Cuidado Facial y Skincare',
        description: 'Mascarillas faciales, rodillos de jade y sérums hidratantes',
        icon: 'sparkles',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'belleza-skincare-rodillos',
            subcategory_id: 'belleza-skincare',
            subcategory_slug: 'cuidado-facial-skincare',
            category_slug: 'belleza-accesorios',
            slug: 'rodillos-jade-gua-sha',
            name: 'Rodillos de Jade y Gua Sha',
            description: 'Piedras naturales pulidas para masaje facial linfático',
            display_order: 1
          },
          {
            id: 'belleza-skincare-mascarillas',
            subcategory_id: 'belleza-skincare',
            subcategory_slug: 'cuidado-facial-skincare',
            category_slug: 'belleza-accesorios',
            slug: 'mascarillas-faciales-colageno',
            name: 'Mascarillas Faciales y Parches de Ojos',
            description: 'Máscaras coreanas de colágeno, ácido hialurónico y carbón activado',
            display_order: 2
          }
        ]
      },
      {
        id: 'belleza-cabello',
        category_id: 'belleza-accesorios',
        category_slug: 'belleza-accesorios',
        slug: 'accesorios-cabello',
        name: 'Accesorios para el Cabello',
        description: 'Hebillas, scrunchies, peines desenredantes y diademas',
        icon: 'sparkles',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'belleza-cabello-scrunchies',
            subcategory_id: 'belleza-cabello',
            subcategory_slug: 'accesorios-cabello',
            category_slug: 'belleza-accesorios',
            slug: 'colitas-scrunchies-satén',
            name: 'Colitas y Scrunchies de Satén',
            description: 'Elásticos de tela suave antiequiebre para peinados',
            display_order: 1
          },
          {
            id: 'belleza-cabello-cepillos',
            subcategory_id: 'belleza-cabello',
            subcategory_slug: 'accesorios-cabello',
            category_slug: 'belleza-accesorios',
            slug: 'cepillos-desenredantes-antifrizz',
            name: 'Cepillos Desenredantes sin Tirones',
            description: 'Cepillos anatómicos para cabello húmedo o seco',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'cartucheras-carpetas',
    slug: 'cartucheras-carpetas',
    name: 'Cartucheras y Carpetas',
    description: 'Cartucheras escolares, carpetas clasificadoras y folios.',
    icon: 'folder',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'cartu-cartucheras',
        category_id: 'cartucheras-carpetas',
        category_slug: 'cartucheras-carpetas',
        slug: 'cartucheras-escolares',
        name: 'Cartucheras Escolares y Universitarias',
        description: 'Cartucheras con cierre simple, doble compartimento y modelos tubo',
        icon: 'folder',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'cartu-cartucheras-doble',
            subcategory_id: 'cartu-cartucheras',
            subcategory_slug: 'cartucheras-escolares',
            category_slug: 'cartucheras-carpetas',
            slug: 'cartucheras-doble-cierre',
            name: 'Cartucheras de 2 y 3 Pisos',
            description: 'Cartucheras con elásticos organizadores para lápices y fibras',
            display_order: 1
          },
          {
            id: 'cartu-cartucheras-silicona',
            subcategory_id: 'cartu-cartucheras',
            subcategory_slug: 'cartucheras-escolares',
            category_slug: 'cartucheras-carpetas',
            slug: 'cartucheras-tubo-silicona',
            name: 'Cartucheras Tubo y de Silicona',
            description: 'Modelos flexibles lavables y livianos de colores pastel',
            display_order: 2
          }
        ]
      },
      {
        id: 'cartu-carpetas',
        category_id: 'cartucheras-carpetas',
        category_slug: 'cartucheras-carpetas',
        slug: 'carpetas-archivadores',
        name: 'Carpetas y Archivadores',
        description: 'Carpetas de 3 anillos N° 3, carpetas acordeón y biblioratos',
        icon: 'folder',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'cartu-carpetas-escolares',
            subcategory_id: 'cartu-carpetas',
            subcategory_slug: 'carpetas-archivadores',
            category_slug: 'cartucheras-carpetas',
            slug: 'carpetas-escolares-3-anillos',
            name: 'Carpetas Escolares N° 3',
            description: 'Carpetas de cartón rígido plastificado con mecanismo metálico',
            display_order: 1
          },
          {
            id: 'cartu-carpetas-acordeon',
            subcategory_id: 'cartu-carpetas',
            subcategory_slug: 'carpetas-archivadores',
            category_slug: 'cartucheras-carpetas',
            slug: 'carpetas-clasificadoras-acordeon',
            name: 'Carpetas Acordeón Clasificadoras',
            description: 'Carpetas con 12 divisiones y solapas con etiquetas mensuales',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'cotillon',
    slug: 'cotillon',
    name: 'Cotillón',
    description: 'Globos, guirnaldas, antifaces y artículos para fiestas.',
    icon: 'party',
    imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'coti-globos',
        category_id: 'cotillon',
        category_slug: 'cotillon',
        slug: 'globos-guirnaldas',
        name: 'Globos y Guirnaldas',
        description: 'Globos de látex, metalizados de números y cortinas metalizadas',
        icon: 'party',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'coti-globos-numeros',
            subcategory_id: 'coti-globos',
            subcategory_slug: 'globos-guirnaldas',
            category_slug: 'cotillon',
            slug: 'globos-metalizados-numeros',
            name: 'Globos Metalizados de Números',
            description: 'Números gigantes de 40cm y 70cm dorados y plateados',
            display_order: 1
          },
          {
            id: 'coti-globos-latex',
            subcategory_id: 'coti-globos',
            subcategory_slug: 'globos-guirnaldas',
            category_slug: 'cotillon',
            slug: 'globos-latex-perlado-packs',
            name: 'Packs de Globos Látex Perlados',
            description: 'Bolsas x50 unidades de látex biodegradable reforzado',
            display_order: 2
          }
        ]
      },
      {
        id: 'coti-descartables',
        category_id: 'cotillon',
        category_slug: 'cotillon',
        slug: 'vajilla-descartable-fiesta',
        name: 'Vajilla Descartable para Fiestas',
        description: 'Platos temáticos, vasos de polipapel, servilletas y manteles',
        icon: 'party',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'coti-descartables-vasos',
            subcategory_id: 'coti-descartables',
            subcategory_slug: 'vajilla-descartable-fiesta',
            category_slug: 'cotillon',
            slug: 'vasos-platos-polipapel',
            name: 'Vasos y Platos de Polipapel Temáticos',
            description: 'Sets descartables con foil dorado y temáticas infantiles',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'deco-organizacion-hogar',
    slug: 'deco-organizacion-hogar',
    name: 'Deco y Organización del Hogar',
    description: 'Cajas organizadoras, perchas, marcos y decoración.',
    icon: 'home',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'deco-cajas',
        category_id: 'deco-organizacion-hogar',
        category_slug: 'deco-organizacion-hogar',
        slug: 'cajas-canastos-organizadores',
        name: 'Cajas y Canastos Organizadores',
        description: 'Canastos de tela plegables, organizadores de cajón y cajas apilables',
        icon: 'home',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'deco-cajas-canastos-tela',
            subcategory_id: 'deco-cajas',
            subcategory_slug: 'cajas-canastos-organizadores',
            category_slug: 'deco-organizacion-hogar',
            slug: 'canastos-tela-plegables',
            name: 'Canastos de Tela y Yute Plegables',
            description: 'Canastos con manija para estantes y ropa blanca',
            display_order: 1
          },
          {
            id: 'deco-cajas-organizadores-cajon',
            subcategory_id: 'deco-cajas',
            subcategory_slug: 'cajas-canastos-organizadores',
            category_slug: 'deco-organizacion-hogar',
            slug: 'organizadores-cajones-ropa-interior',
            name: 'Organizadores de Cajón x3 y x4',
            description: 'Separadores tipo colmena para medias y accesorios',
            display_order: 2
          }
        ]
      },
      {
        id: 'deco-perchas',
        category_id: 'deco-organizacion-hogar',
        category_slug: 'deco-organizacion-hogar',
        slug: 'perchas-placard',
        name: 'Perchas y Accesorios de Placard',
        description: 'Perchas aterciopeladas ultradelgadas y perchas de madera',
        icon: 'home',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'deco-perchas-terciopelo',
            subcategory_id: 'deco-perchas',
            subcategory_slug: 'perchas-placard',
            category_slug: 'deco-organizacion-hogar',
            slug: 'perchas-terciopelo-antideslizantes',
            name: 'Packs de Perchas de Terciopelo',
            description: 'Packs x10 y x20 unidades con gancho giratorio 360°',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'electro',
    slug: 'electro',
    name: 'Electro',
    description: 'Pequeños electrodomésticos, cables, lámparas LED y gadgets.',
    icon: 'deviceLaptop',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'electro-celulares',
        category_id: 'electro',
        category_slug: 'electro',
        slug: 'cables-cargadores',
        name: 'Cables y Cargadores',
        description: 'Cables mallados Tipo C, Lightning y cargadores turbo 20W',
        icon: 'deviceLaptop',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'electro-cables-usb-c',
            subcategory_id: 'electro-celulares',
            subcategory_slug: 'cables-cargadores',
            category_slug: 'electro',
            slug: 'cables-usb-c-carga-rapida',
            name: 'Cables USB-C Carga Rápida',
            description: 'Cables mallados de 1m y 2m con soporte Power Delivery',
            display_order: 1
          },
          {
            id: 'electro-cargadores-20w',
            subcategory_id: 'electro-celulares',
            subcategory_slug: 'cables-cargadores',
            category_slug: 'electro',
            slug: 'cargadores-pared-turbo',
            name: 'Cargadores Turbo de Pared 20W',
            description: 'Fuentes de carga rápida compactas con puerto dual USB + Tipo C',
            display_order: 2
          }
        ]
      },
      {
        id: 'electro-audio',
        category_id: 'electro',
        category_slug: 'electro',
        slug: 'auriculares-audio',
        name: 'Auriculares y Audio',
        description: 'Auriculares TWS inalámbricos y parlantes portátiles bluetooth',
        icon: 'deviceLaptop',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'electro-audio-tws',
            subcategory_id: 'electro-audio',
            subcategory_slug: 'auriculares-audio',
            category_slug: 'electro',
            slug: 'auriculares-tws-inalambricos',
            name: 'Auriculares Inalámbricos TWS',
            description: 'Auriculares bluetooth con estuche de carga y reducción de ruido',
            display_order: 1
          },
          {
            id: 'electro-audio-parlantes',
            subcategory_id: 'electro-audio',
            subcategory_slug: 'auriculares-audio',
            category_slug: 'electro',
            slug: 'parlantes-bluetooth-portatiles',
            name: 'Parlantes Bluetooth Resistentes al Agua',
            description: 'Altavoces portátiles con batería de hasta 8 horas y luces RGB',
            display_order: 2
          }
        ]
      },
      {
        id: 'electro-iluminacion',
        category_id: 'electro',
        category_slug: 'electro',
        slug: 'iluminacion-smart',
        name: 'Iluminación y Lámparas LED',
        description: 'Lámparas táctiles dimerizables, tiras LED RGB y aros de luz para celular',
        icon: 'deviceLaptop',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'electro-luz-lampara-tactil',
            subcategory_id: 'electro-iluminacion',
            subcategory_slug: 'iluminacion-smart',
            category_slug: 'electro',
            slug: 'lamparas-tactiles-led',
            name: 'Lámparas Táctiles LED Recargables',
            description: 'Lámparas portátiles con dimerización de intensidad y base de madera',
            display_order: 1
          },
          {
            id: 'electro-luz-tiras-rgb',
            subcategory_id: 'electro-iluminacion',
            subcategory_slug: 'iluminacion-smart',
            category_slug: 'electro',
            slug: 'tiras-led-rgb-control',
            name: 'Tiras LED RGB con Control Remoto',
            description: 'Rollos de 5 metros con adhesivo 3M y control de colores',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'embalajes',
    slug: 'embalajes',
    name: 'Embalajes',
    description: 'Cintas adhesivas, bolsas de envío, papel kraft y film.',
    icon: 'package',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'emb-cintas',
        category_id: 'embalajes',
        category_slug: 'embalajes',
        slug: 'cintas-adhesivas',
        name: 'Cintas Adhesivas de Embalar',
        description: 'Cintas de 48mm transparentes, marrones y con leyenda frágil',
        icon: 'package',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'emb-cintas-transparente',
            subcategory_id: 'emb-cintas',
            subcategory_slug: 'cintas-adhesivas',
            category_slug: 'embalajes',
            slug: 'cintas-embalaje-transparentes',
            name: 'Cintas de Embalar Transparentes 100m',
            description: 'Rollos de polipropileno de alta adherencia y desenrolle suave',
            display_order: 1
          },
          {
            id: 'emb-cintas-fragil',
            subcategory_id: 'emb-cintas',
            subcategory_slug: 'cintas-adhesivas',
            category_slug: 'embalajes',
            slug: 'cintas-impresas-fragil',
            name: 'Cintas con Impresión "FRÁGIL"',
            description: 'Cintas de advertencia para envíos seguros de paquetería',
            display_order: 2
          }
        ]
      },
      {
        id: 'emb-bolsas',
        category_id: 'embalajes',
        category_slug: 'embalajes',
        slug: 'bolsas-envio-ecommerce',
        name: 'Bolsas para Envíos y Ecommerce',
        description: 'Sobres de plástico inviolables con solapa autoadhesiva',
        icon: 'package',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'emb-bolsas-inviolables',
            subcategory_id: 'emb-bolsas',
            subcategory_slug: 'bolsas-envio-ecommerce',
            category_slug: 'embalajes',
            slug: 'sobres-ecommerce-inviolables',
            name: 'Sobres de Correo con Pegado Permanente',
            description: 'Packs x50 y x100 sobres tricapa opacos con adhesivo de seguridad',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'ferreteria-pesca',
    slug: 'ferreteria-pesca',
    name: 'Ferretería y Pesca',
    description: 'Herramientas de mano, linternas, cuerdas y artículos de pesca.',
    icon: 'tool',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'ferre-herramientas',
        category_id: 'ferreteria-pesca',
        category_slug: 'ferreteria-pesca',
        slug: 'herramientas-manuales',
        name: 'Herramientas Manuales',
        description: 'Destornilladores, pinzas, martillos y llaves fijas',
        icon: 'tool',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'ferre-destornilladores',
            subcategory_id: 'ferre-herramientas',
            subcategory_slug: 'herramientas-manuales',
            category_slug: 'ferreteria-pesca',
            slug: 'juegos-destornilladores-precision',
            name: 'Sets de Destornilladores de Precisión',
            description: 'Kits para electrónica y reparación de celulares con puntas imantadas',
            display_order: 1
          },
          {
            id: 'ferre-pinzas',
            subcategory_id: 'ferre-herramientas',
            subcategory_slug: 'herramientas-manuales',
            category_slug: 'ferreteria-pesca',
            slug: 'pinzas-alicates-universales',
            name: 'Pinzas Universales y Alicates',
            description: 'Herramientas forjadas en acero al carbono con aislación 1000V',
            display_order: 2
          }
        ]
      },
      {
        id: 'ferre-pesca',
        category_id: 'ferreteria-pesca',
        category_slug: 'ferreteria-pesca',
        slug: 'articulos-pesca-camping',
        name: 'Artículos de Pesca y Camping',
        description: 'Reeles, señuelos, tanza de nylon y linternas frontales LED',
        icon: 'tool',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'ferre-pesca-senuelos',
            subcategory_id: 'ferre-pesca',
            subcategory_slug: 'articulos-pesca-camping',
            category_slug: 'ferreteria-pesca',
            slug: 'senuelos-cucharas-variadas',
            name: 'Señuelos y Cucharas de Pesca',
            description: 'Kits surtidos con anzuelos triples para dorados y tarariras',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'higiene-limpieza',
    slug: 'higiene-limpieza',
    name: 'Higiene Personal y Limpieza',
    description: 'Jabones, paños de microfibra, esponjas y limpieza del hogar.',
    icon: 'wash',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'hig-limpieza',
        category_id: 'higiene-limpieza',
        category_slug: 'higiene-limpieza',
        slug: 'panos-esponjas-limpieza',
        name: 'Paños y Esponjas de Limpieza',
        description: 'Paños de microfibra multiuso, esponjas mágicas y guantes reforzados',
        icon: 'wash',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'hig-panos-microfibra',
            subcategory_id: 'hig-limpieza',
            subcategory_slug: 'panos-esponjas-limpieza',
            category_slug: 'higiene-limpieza',
            slug: 'panos-microfibra-multiuso',
            name: 'Packs de Paños de Microfibra 40x40',
            description: 'Paños ultrasuaves que no rayan para autos, vidrios y cocina',
            display_order: 1
          }
        ]
      },
      {
        id: 'hig-personal',
        category_id: 'higiene-limpieza',
        category_slug: 'higiene-limpieza',
        slug: 'cuidado-personal-bano',
        name: 'Cuidado Personal y Baño',
        description: 'Dispensadores de jabón, toallitas desinfectantes y jaboneras',
        icon: 'wash',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'hig-dispensadores',
            subcategory_id: 'hig-personal',
            subcategory_slug: 'cuidado-personal-bano',
            category_slug: 'higiene-limpieza',
            slug: 'dispensadores-jabon-liquido',
            name: 'Dispensadores de Jabón en Cerámica y Vidrio',
            description: 'Dosificadores con bomba metálica antioxidante',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'indumentaria',
    slug: 'indumentaria',
    name: 'Indumentaria',
    description: 'Ropa básica, medias, gorros, bufandas e indumentaria variada.',
    icon: 'shirt',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'indu-medias',
        category_id: 'indumentaria',
        category_slug: 'indumentaria',
        slug: 'medias-soquetes',
        name: 'Medias y Soquetes',
        description: 'Soquetes invisibles de algodón, medias térmicas y medias deportivas',
        icon: 'shirt',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'indu-soquetes-algodon',
            subcategory_id: 'indu-medias',
            subcategory_slug: 'medias-soquetes',
            category_slug: 'indumentaria',
            slug: 'soquetes-algodon-invisibles',
            name: 'Packs de Soquetes de Algodón x3 y x6',
            description: 'Soquetes con talón anatómico antideslizante',
            display_order: 1
          },
          {
            id: 'indu-medias-termicas',
            subcategory_id: 'indu-medias',
            subcategory_slug: 'medias-soquetes',
            category_slug: 'indumentaria',
            slug: 'medias-termicas-polar',
            name: 'Medias Térmicas con Interior Polar',
            description: 'Medias abrigadas de invierno de máxima retención térmica',
            display_order: 2
          }
        ]
      },
      {
        id: 'indu-accesorios',
        category_id: 'indumentaria',
        category_slug: 'indumentaria',
        slug: 'accesorios-invierno-verano',
        name: 'Gorros, Guantes y Bufandas',
        description: 'Gorros de lana con corderito, guantes touch y cuellitos térmicos',
        icon: 'shirt',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'indu-gorros-lana',
            subcategory_id: 'indu-accesorios',
            subcategory_slug: 'accesorios-invierno-verano',
            category_slug: 'indumentaria',
            slug: 'gorros-lana-corderito',
            name: 'Gorros de Lana con Forro Polar',
            description: 'Gorros unisex térmicos con puño elástico adaptable',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'jugueteria',
    slug: 'jugueteria',
    name: 'Juguetería',
    description: 'Juguetes infantiles, juegos de mesa, autos, bloques y muñecas.',
    icon: 'puzzle',
    imageUrl: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'juguetes-primera',
        category_id: 'jugueteria',
        category_slug: 'jugueteria',
        slug: 'primera-infancia',
        name: 'Primera Infancia',
        description: 'Sonajeros musicales, mordillos sensoriales y bloques blandos',
        icon: 'puzzle',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'juguetes-primera-mordillos',
            subcategory_id: 'juguetes-primera',
            subcategory_slug: 'primera-infancia',
            category_slug: 'jugueteria',
            slug: 'sonajeros-mordillos-silicona',
            name: 'Sonajeros y Mordillos Refrigerables',
            description: 'Juguetes de silicona libres de BPA para dentición',
            display_order: 1
          }
        ]
      },
      {
        id: 'juguetes-bloques',
        category_id: 'jugueteria',
        category_slug: 'jugueteria',
        slug: 'bloques-construccion',
        name: 'Bloques de Construcción',
        description: 'Sets de bloques plásticos y pistas de autos ensamblables',
        icon: 'puzzle',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'juguetes-bloques-sets',
            subcategory_id: 'juguetes-bloques',
            subcategory_slug: 'bloques-construccion',
            category_slug: 'jugueteria',
            slug: 'baldes-bloques-plasticos',
            name: 'Baldes de Bloques Didácticos',
            description: 'Baldes de 50, 100 y 150 piezas compatibles multicolores',
            display_order: 1
          }
        ]
      },
      {
        id: 'juguetes-juegos-mesa',
        category_id: 'jugueteria',
        category_slug: 'jugueteria',
        slug: 'juegos-de-mesa',
        name: 'Juegos de Mesa y Naipes',
        description: 'Juegos de tablero familiares, naipes españoles y cartas temáticas',
        icon: 'puzzle',
        display_order: 3,
        sub_subcategories: [
          {
            id: 'juguetes-naipes-espanoles',
            subcategory_id: 'juguetes-juegos-mesa',
            subcategory_slug: 'juegos-de-mesa',
            category_slug: 'jugueteria',
            slug: 'naipes-espanoles-plastificados',
            name: 'Mazas de Naipes Españoles Plastificados',
            description: 'Cartas tradicionales de truco con caja acrílica protectora',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'libreria',
    slug: 'libreria',
    name: 'Librería',
    description: 'Cuadernos, bolígrafos, marcadores, tijeras y papelería comercial.',
    icon: 'pencil',
    imageUrl: 'https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'lib-cuadernos',
        category_id: 'libreria',
        category_slug: 'libreria',
        slug: 'cuadernos-repuestos',
        name: 'Cuadernos y Repuestos',
        description: 'Cuadernos espiralados A4, repuestos N° 3 y libretas de notas',
        icon: 'pencil',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'lib-cuadernos-espiral-a4',
            subcategory_id: 'lib-cuadernos',
            subcategory_slug: 'cuadernos-repuestos',
            category_slug: 'libreria',
            slug: 'cuadernos-espiralados-a4',
            name: 'Cuadernos Espiralados A4',
            description: 'Cuadernos tapa dura de 80 y 100 hojas microperforadas',
            display_order: 1
          },
          {
            id: 'lib-repuestos-n3',
            subcategory_id: 'lib-cuadernos',
            subcategory_slug: 'cuadernos-repuestos',
            category_slug: 'libreria',
            slug: 'repuestos-hojas-n3',
            name: 'Repuestos de Hojas N° 3',
            description: 'Packs de 480 y 96 hojas con banda reforzada rayadas y cuadriculadas',
            display_order: 2
          }
        ]
      },
      {
        id: 'lib-escritura',
        category_id: 'libreria',
        category_slug: 'libreria',
        slug: 'escritura-marcadores',
        name: 'Escritura y Marcadores',
        description: 'Bolígrafos punta fina, microfibras, resaltadores pastel y marcadores',
        icon: 'pencil',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'lib-resaltadores-pastel',
            subcategory_id: 'lib-escritura',
            subcategory_slug: 'escritura-marcadores',
            category_slug: 'libreria',
            slug: 'resaltadores-tonos-pastel',
            name: 'Sets de Resaltadores Pastel',
            description: 'Kits de 6 colores pastel de punta biselada suave',
            display_order: 1
          },
          {
            id: 'lib-boligrafos-gel',
            subcategory_id: 'lib-escritura',
            subcategory_slug: 'escritura-marcadores',
            category_slug: 'libreria',
            slug: 'boligrafos-tinta-gel-borrables',
            name: 'Bolígrafos Gel Borrables por Fricción',
            description: 'Plumas con goma borradora incorporada y tinta termosensible',
            display_order: 2
          }
        ]
      }
    ]
  },
  {
    id: 'libros',
    slug: 'libros',
    name: 'Libros',
    description: 'Libros infantiles, novelas, libros de colorear y guías.',
    icon: 'book',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'libros-infantiles',
        category_id: 'libros',
        category_slug: 'libros',
        slug: 'libros-infantiles-colorear',
        name: 'Libros Infantiles y de Colorear',
        description: 'Cuentos con stickers, libros de mandalas y actividades para niños',
        icon: 'book',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'libros-mandalas',
            subcategory_id: 'libros-infantiles',
            subcategory_slug: 'libros-infantiles-colorear',
            category_slug: 'libros',
            slug: 'libros-mandalas-antiestres',
            name: 'Libros de Mandalas Antiestrés para Adultos',
            description: 'Ilustraciones botánicas y geométricas en papel ilustración grueso',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'marroquineria',
    slug: 'marroquineria',
    name: 'Marroquinería',
    description: 'Carteras, billeteras, cinturones, riñoneras y bolsos.',
    icon: 'briefcase',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'marro-billeteras',
        category_id: 'marroquineria',
        category_slug: 'marroquineria',
        slug: 'billeteras-tarjeteros',
        name: 'Billeteras y Tarjeteros',
        description: 'Billeteras de cuero ecológico, tarjeteros automáticos y monederos',
        icon: 'briefcase',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'marro-tarjeteros-auto',
            subcategory_id: 'marro-billeteras',
            subcategory_slug: 'billeteras-tarjeteros',
            category_slug: 'marroquineria',
            slug: 'tarjeteros-automaticos-rfid',
            name: 'Tarjeteros Automáticos con Pop-Up',
            description: 'Tarjeteros de aluminio con gatillo eyector y bloqueo RFID',
            display_order: 1
          },
          {
            id: 'marro-billeteras-cuero',
            subcategory_id: 'marro-billeteras',
            subcategory_slug: 'billeteras-tarjeteros',
            category_slug: 'marroquineria',
            slug: 'billeteras-hombre-mujer-cuero',
            name: 'Billeteras Clásicas de Cuero PU',
            description: 'Modelos con doble visor de documentos y monedero con cierre',
            display_order: 2
          }
        ]
      },
      {
        id: 'marro-rinoneras',
        category_id: 'marroquineria',
        category_slug: 'marroquineria',
        slug: 'rinoneras-morrales',
        name: 'Riñoneras y Morrales',
        description: 'Riñoneras urbanas deportivas y bandoleras cruzadas unisex',
        icon: 'briefcase',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'marro-rinoneras-urbanas',
            subcategory_id: 'marro-rinoneras',
            subcategory_slug: 'rinoneras-morrales',
            category_slug: 'marroquineria',
            slug: 'rinoneras-deportivas-expandibles',
            name: 'Riñoneras Urbanas Impermeables',
            description: 'Riñoneras con correa regulable y salida para auriculares',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'mascotas',
    slug: 'mascotas',
    name: 'Mascotas',
    description: 'Juguetes para mascotas, correas, comederos y accesorios.',
    icon: 'paw',
    imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'mascotas-paseo',
        category_id: 'mascotas',
        category_slug: 'mascotas',
        slug: 'paseo-seguridad',
        name: 'Paseo y Seguridad',
        description: 'Correas retráctiles, arneses antitirones y collares luminosos',
        icon: 'paw',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'mascotas-correas-retractiles',
            subcategory_id: 'mascotas-paseo',
            subcategory_slug: 'paseo-seguridad',
            category_slug: 'mascotas',
            slug: 'correas-retractiles-5m',
            name: 'Correas Retráctiles de 5 Metros',
            description: 'Correas para perros de hasta 15kg y 25kg con freno de botón',
            display_order: 1
          }
        ]
      },
      {
        id: 'mascotas-comederos',
        category_id: 'mascotas',
        category_slug: 'mascotas',
        slug: 'comederos-bebederos',
        name: 'Comederos y Bebederos',
        description: 'Platos de acero inoxidable antideslizantes y bebederos portátiles',
        icon: 'paw',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'mascotas-platos-acero',
            subcategory_id: 'mascotas-comederos',
            subcategory_slug: 'comederos-bebederos',
            category_slug: 'mascotas',
            slug: 'comederos-acero-goma',
            name: 'Comederos de Acero con Base de Goma',
            description: 'Cuencos higiénicos aptos para lavavajillas',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'mochilas-maletines',
    slug: 'mochilas-maletines',
    name: 'Mochilas y Maletines',
    description: 'Mochilas urbanas, escolares, mochilas para notebook y maletines.',
    icon: 'backpack',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80',
    featured: true,
    subcategories: [
      {
        id: 'mochilas-urbanas',
        category_id: 'mochilas-maletines',
        category_slug: 'mochilas-maletines',
        slug: 'mochilas-notebook',
        name: 'Mochilas Urbanas y para Notebook',
        description: 'Mochilas reforzadas con bolsillo acolchado para laptop de 15.6"',
        icon: 'backpack',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'mochilas-antirrobo',
            subcategory_id: 'mochilas-urbanas',
            subcategory_slug: 'mochilas-notebook',
            category_slug: 'mochilas-maletines',
            slug: 'mochilas-antirrobo-notebook',
            name: 'Mochilas Antirrobo con Puerto USB',
            description: 'Cierres ocultos impermeables y conector de carga externa',
            display_order: 1
          },
          {
            id: 'mochilas-ejecutivas',
            subcategory_id: 'mochilas-urbanas',
            subcategory_slug: 'mochilas-notebook',
            category_slug: 'mochilas-maletines',
            slug: 'mochilas-ejecutivas-expandibles',
            name: 'Mochilas Ejecutivas de Alta Capacidad',
            description: 'Apertura 180° estilo valija apta para viajes de negocios',
            display_order: 2
          }
        ]
      },
      {
        id: 'mochilas-escolares',
        category_id: 'mochilas-maletines',
        category_slug: 'mochilas-maletines',
        slug: 'mochilas-escolares-carrito',
        name: 'Mochilas Escolares y con Carrito',
        description: 'Mochilas estampadas reforzadas y mochilas con ruedas triples',
        icon: 'backpack',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'mochilas-carrito-reforzadas',
            subcategory_id: 'mochilas-escolares',
            subcategory_slug: 'mochilas-escolares-carrito',
            category_slug: 'mochilas-maletines',
            slug: 'mochilas-ruedas-triples',
            name: 'Mochilas con Carrito de 3 Ruedas para Escalera',
            description: 'Estructura metálica resistente con base de plástico rígido',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'navidad',
    slug: 'navidad',
    name: 'Navidad',
    description: 'Árboles de navidad, luces, adornos, guirnaldas y pesebres.',
    icon: 'gift',
    imageUrl: 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=300&auto=format&fit=crop&q=80',
    isSeasonal: true,
    featured: false,
    subcategories: [
      {
        id: 'nav-arboles',
        category_id: 'navidad',
        category_slug: 'navidad',
        slug: 'arboles-pesebres',
        name: 'Árboles de Navidad y Pesebres',
        description: 'Pinos artificiales verdes y nevados de 1.20m a 2.10m',
        icon: 'gift',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'nav-pinos-canadienses',
            subcategory_id: 'nav-arboles',
            subcategory_slug: 'arboles-pesebres',
            category_slug: 'navidad',
            slug: 'arboles-navidenos-pino-canadiense',
            name: 'Árboles Pino Canadiense Extra Frondosos',
            description: 'Pinos con ramas articuladas y pie metálico plegable',
            display_order: 1
          }
        ]
      },
      {
        id: 'nav-luces',
        category_id: 'navidad',
        category_slug: 'navidad',
        slug: 'luces-guirnaldas-led',
        name: 'Luces y Guirnaldas Navideñas',
        description: 'Luces arroz LED cálidas, frías y de colores con efectos',
        icon: 'gift',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'nav-luces-arroz-100',
            subcategory_id: 'nav-luces',
            subcategory_slug: 'luces-guirnaldas-led',
            category_slug: 'navidad',
            slug: 'luces-arroz-100-led-calidas',
            name: 'Tiras de 100 y 200 Luces LED Cálidas',
            description: 'Cable transparente u oscuro con 8 secuencias lumínicas',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'pelucheria',
    slug: 'pelucheria',
    name: 'Peluchería',
    description: 'Peluches de colección, personajes y almohadones afelpados.',
    icon: 'heart',
    imageUrl: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'pelu-clasicos',
        category_id: 'pelucheria',
        category_slug: 'pelucheria',
        slug: 'peluches-animales-clasicos',
        name: 'Osos y Animales de Peluche',
        description: 'Osos gigantes de 1 metro, perritos, conejos y gatitos ultrasuaves',
        icon: 'heart',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'pelu-osos-gigantes',
            subcategory_id: 'pelu-clasicos',
            subcategory_slug: 'peluches-animales-clasicos',
            category_slug: 'pelucheria',
            slug: 'osos-peluche-gigantes-1m',
            name: 'Osos Gigantes de Peluche con Moño',
            description: 'Peluches de felpa premium hipoalergénica con relleno vellón siliconado',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'simbolos-patrios',
    slug: 'simbolos-patrios',
    name: 'Símbolos Patrios',
    description: 'Banderas, escarapelas, cintas y artículos conmemorativos.',
    icon: 'flag',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'patrio-banderas',
        category_id: 'simbolos-patrios',
        category_slug: 'simbolos-patrios',
        slug: 'banderas-argentinas',
        name: 'Banderas de Ceremonia y Flameo',
        description: 'Banderas argentinas con sol bordado o estampado en tafeta',
        icon: 'flag',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'patrio-banderas-exterior',
            subcategory_id: 'patrio-banderas',
            subcategory_slug: 'banderas-argentinas',
            category_slug: 'simbolos-patrios',
            slug: 'banderas-argentinas-exterior-sol',
            name: 'Banderas de Flameo Exterior 1.40m x 0.90m',
            description: 'Tela poliéster resistente a la intemperie con sol nítido',
            display_order: 1
          }
        ]
      },
      {
        id: 'patrio-escarapelas',
        category_id: 'simbolos-patrios',
        category_slug: 'simbolos-patrios',
        slug: 'escarapelas-pines',
        name: 'Escarapelas y Pines Conmemorativos',
        description: 'Escarapelas de cinta plisada, pines metálicos esmaltados y prendedores',
        icon: 'flag',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'patrio-escarapelas-metalicas',
            subcategory_id: 'patrio-escarapelas',
            subcategory_slug: 'escarapelas-pines',
            category_slug: 'simbolos-patrios',
            slug: 'pines-escarapela-esmaltados',
            name: 'Packs de Pines Escarapela Esmaltados x50',
            description: 'Pines metálicos con broche de mariposa de alta calidad',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'textil',
    slug: 'textil',
    name: 'Textil',
    description: 'Toallas, mantas, sábanas, repasadores y cortinas.',
    icon: 'layout',
    imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=300&auto=format&fit=crop&q=80',
    featured: false,
    subcategories: [
      {
        id: 'textil-bano',
        category_id: 'textil',
        category_slug: 'textil',
        slug: 'toallas-toallones',
        name: 'Toallas y Toallones de Baño',
        description: 'Juegos de toalla y toallón 500 gramos 100% algodón',
        icon: 'layout',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'textil-juegos-500g',
            subcategory_id: 'textil-bano',
            subcategory_slug: 'toallas-toallones',
            category_slug: 'textil',
            slug: 'juegos-toalla-toallon-500g',
            name: 'Juegos de Baño de 500g Hotelero',
            description: 'Toallón de 140x70 y toalla de 80x50 de puro algodón peinado',
            display_order: 1
          }
        ]
      },
      {
        id: 'textil-cocina',
        category_id: 'textil',
        category_slug: 'textil',
        slug: 'manteles-repasadores',
        name: 'Manteles y Repasadores de Cocina',
        description: 'Manteles antimanchas impermeables y repasadores nido de abeja',
        icon: 'layout',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'textil-manteles-antimanchas',
            subcategory_id: 'textil-cocina',
            subcategory_slug: 'manteles-repasadores',
            category_slug: 'textil',
            slug: 'manteles-ecocuero-antimanchas',
            name: 'Manteles de Ecocuero y Tela Antimancha',
            description: 'Manteles rectangulares y redondos de fácil limpieza con paño húmedo',
            display_order: 1
          }
        ]
      }
    ]
  },
  {
    id: 'verano',
    slug: 'verano',
    name: 'Verano',
    description: 'Inflables, sombrillas, toallas de playa, salvavidas y lentes.',
    icon: 'sun',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    isSeasonal: true,
    featured: false,
    subcategories: [
      {
        id: 'verano-inflables',
        category_id: 'verano',
        category_slug: 'verano',
        slug: 'inflables-pileta',
        name: 'Inflables y Flotadores para Pileta',
        description: 'Colchonetas gigantes, sillones flotantes y salvavidas infantiles',
        icon: 'sun',
        display_order: 1,
        sub_subcategories: [
          {
            id: 'verano-flotadores-gigantes',
            subcategory_id: 'verano-inflables',
            subcategory_slug: 'inflables-pileta',
            category_slug: 'verano',
            slug: 'flotadores-figuras-gigantes',
            name: 'Flotadores Gigantes Inflables',
            description: 'Inflables con doble cámara de seguridad de vinilo reforzado',
            display_order: 1
          }
        ]
      },
      {
        id: 'verano-playa',
        category_id: 'verano',
        category_slug: 'verano',
        slug: 'sombrillas-reposeras-playa',
        name: 'Sombrillas y Reposeras de Playa',
        description: 'Sombrillas con filtro UV50+, reposeras plegables y conservadoras',
        icon: 'sun',
        display_order: 2,
        sub_subcategories: [
          {
            id: 'verano-sombrillas-uv',
            subcategory_id: 'verano-playa',
            subcategory_slug: 'sombrillas-reposeras-playa',
            category_slug: 'verano',
            slug: 'sombrillas-playa-uv50-reforzadas',
            name: 'Sombrillas de Playa de 2m con Filtro UV50+',
            description: 'Varillas de fibra de vidrio flexibles y caño reclinable',
            display_order: 1
          }
        ]
      }
    ]
  }
];

export const CATEGORY_MAP = new Map(
  PRODUCT_CATEGORIES.map((cat) => [cat.slug, cat])
);

/**
 * Obtiene todas las subcategorías (Nivel 2) de una categoría principal
 */
export function getSubcategoriesByCategory(categorySlug: string): SubCategory[] {
  const cat = CATEGORY_MAP.get(categorySlug);
  return cat?.subcategories || [];
}

/**
 * Obtiene todas las sub-subcategorías (Nivel 3) para una categoría y subcategoría dadas
 */
export function getSubSubcategories(
  categorySlug: string,
  subcategorySlug: string
): SubSubCategory[] {
  const subcategories = getSubcategoriesByCategory(categorySlug);
  const sub = subcategories.find((s) => s.slug === subcategorySlug);
  return sub?.sub_subcategories || [];
}

/**
 * Devuelve la jerarquía completa en formato de texto / breadcrumbs para presentación visual
 */
export function formatCategoryBreadcrumb(
  categorySlug?: string,
  subcategorySlug?: string,
  subSubcategorySlug?: string
): string {
  if (!categorySlug) return '';
  const cat = CATEGORY_MAP.get(categorySlug);
  if (!cat) return categorySlug;

  const parts: string[] = [cat.name];

  if (subcategorySlug) {
    const sub = cat.subcategories?.find((s) => s.slug === subcategorySlug);
    if (sub) {
      parts.push(sub.name);

      if (subSubcategorySlug) {
        const subSub = sub.sub_subcategories?.find((ss) => ss.slug === subSubcategorySlug);
        if (subSub) {
          parts.push(subSub.name);
        }
      }
    }
  }

  return parts.join(' > ');
}
