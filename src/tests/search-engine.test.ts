import { describe, it, expect } from 'bun:test';
import {
  normalizeText,
  levenshteinDistance,
  performSmartSearch
} from '@/lib/search-engine';
import { StoreProduct } from '@/types/store';

const mockCatalog: StoreProduct[] = [
  {
    id: 'prod-1',
    sku: 'JG-ARO-001',
    name: 'Vela Aromática Soja en Cuenco de Cerámica',
    description: 'Vela 100% cera de soja con fragancia premium de Vainilla & Caramelo. Duración +45hs.',
    category_slug: 'aromatizacion-velas',
    category_name: 'Aromatización y Velas',
    subcategory_id: 'aroma-velas',
    subcategory_slug: 'velas-aromaticas',
    subcategory_name: 'Velas Aromáticas',
    sub_subcategory_id: 'aroma-velas-soja-cuenco',
    sub_subcategory_slug: 'velas-soja-cuenco',
    sub_subcategory_name: 'Velas de Soja en Cuenco',
    retail_price: 8500,
    wholesale_price: 5900,
    min_wholesale_qty: 6,
    stock: 45,
    image_url: 'https://example.com/vela.jpg',
    unit: 'unidad',
    brand: 'AromaZen',
    tags: ['Velas', 'Aromaterapia', 'Hogar']
  },
  {
    id: 'prod-2',
    sku: 'JG-BAZ-001',
    name: 'Termo Bala Acero Inoxidable 1L con Pico Cebador',
    description: 'Termo doble capa térmica para mate y café frío/calor 24hs.',
    category_slug: 'bazar-cocina',
    category_name: 'Bazar y Cocina',
    subcategory_id: 'bazar-termos',
    subcategory_slug: 'termos-botellas',
    subcategory_name: 'Termos y Botellas',
    sub_subcategory_id: 'bazar-termos-pico',
    sub_subcategory_slug: 'termos-pico-cebador',
    sub_subcategory_name: 'Termos con Pico Cebador',
    retail_price: 24000,
    wholesale_price: 17500,
    min_wholesale_qty: 4,
    stock: 30,
    image_url: 'https://example.com/termo.jpg',
    unit: 'unidad',
    brand: 'Stanley',
    tags: ['Termos', 'Mate', 'Acero']
  },
  {
    id: 'prod-3',
    sku: 'JG-ELE-001',
    name: 'Auriculares Inalámbricos Bluetooth F9 TWS con Estuche Powerbank',
    description: 'Auriculares con pantalla LED digital, sonido Hi-Fi y cancelación pasiva de ruido.',
    category_slug: 'electro',
    category_name: 'Electro',
    subcategory_id: 'electro-audio',
    subcategory_slug: 'auriculares-audio',
    subcategory_name: 'Auriculares y Audio',
    sub_subcategory_id: 'electro-audio-tws',
    sub_subcategory_slug: 'auriculares-tws-inalambricos',
    sub_subcategory_name: 'Auriculares Inalámbricos TWS',
    retail_price: 14500,
    wholesale_price: 9900,
    min_wholesale_qty: 5,
    stock: 60,
    image_url: 'https://example.com/auriculares.jpg',
    unit: 'unidad',
    brand: 'F9',
    tags: ['Audio', 'Bluetooth', 'Gadgets']
  },
  {
    id: 'prod-4',
    sku: 'JG-LIB-001',
    name: 'Cuaderno Espiralado A4 Tapa Dura 100 Hojas',
    description: 'Hojas rayadas de 75g con microperforado para archivo.',
    category_slug: 'libreria',
    category_name: 'Librería',
    subcategory_id: 'lib-cuadernos',
    subcategory_slug: 'cuadernos-repuestos',
    subcategory_name: 'Cuadernos y Repuestos',
    sub_subcategory_id: 'lib-cuadernos-a4',
    sub_subcategory_slug: 'cuadernos-espiralados-a4',
    sub_subcategory_name: 'Cuadernos Espiralados A4',
    retail_price: 6800,
    wholesale_price: 4900,
    min_wholesale_qty: 10,
    stock: 120,
    image_url: 'https://example.com/cuaderno.jpg',
    unit: 'unidad',
    brand: 'Rivadavia',
    tags: ['Cuadernos', 'Escolar', 'A4']
  }
];

describe('Motor de Búsqueda Inteligente JG Store (`search-engine`)', () => {
  it('normalizeText debe limpiar acentos, signos y mayúsculas', () => {
    expect(normalizeText('¡TELÉFONOS & CUADERNOS!  ')).toBe('telefonos cuadernos');
    expect(normalizeText('Acrílicos, Óleos & Témperas')).toBe('acrilicos oleos temperas');
    expect(normalizeText('')).toBe('');
  });

  it('levenshteinDistance debe calcular correctamente la distancia de caracteres', () => {
    expect(levenshteinDistance('termo', 'termo')).toBe(0);
    expect(levenshteinDistance('termo', 'terno')).toBe(1);
    expect(levenshteinDistance('cuaderno', 'cuaderbo')).toBe(1);
    expect(levenshteinDistance('samsung', 'sansung')).toBe(1);
  });

  it('debe encontrar coincidencias exactas por nombre, marca o SKU', () => {
    const resName = performSmartSearch(mockCatalog, 'termo');
    expect(resName.products.length).toBe(1);
    expect(resName.products[0].sku).toBe('JG-BAZ-001');
    expect(resName.metadata.matchType).toBe('exact');

    const resSku = performSmartSearch(mockCatalog, 'JG-ELE-001');
    expect(resSku.products.length).toBe(1);
    expect(resSku.products[0].name).toContain('Auriculares');

    const resBrand = performSmartSearch(mockCatalog, 'Rivadavia');
    expect(resBrand.products.length).toBe(1);
    expect(resBrand.products[0].sku).toBe('JG-LIB-001');
  });

  it('debe detectar e indexar términos de la jerarquía de 3 niveles (Subcategoría y Línea)', () => {
    // Buscar por nombre de subcategoría: "cuadernos-repuestos" o "Cuadernos y Repuestos"
    const resSubcat = performSmartSearch(mockCatalog, 'cuadernos repuestos');
    expect(resSubcat.products.length).toBeGreaterThan(0);
    expect(resSubcat.products[0].sku).toBe('JG-LIB-001');

    // Buscar por línea específica Nivel 3: "pico cebador"
    const resSubSub = performSmartSearch(mockCatalog, 'pico cebador');
    expect(resSubSub.products.length).toBeGreaterThan(0);
    expect(resSubSub.products[0].sku).toBe('JG-BAZ-001');

    // Buscar por línea específica Nivel 3: "cuenco de ceramica"
    const resCuenco = performSmartSearch(mockCatalog, 'cuenco');
    expect(resCuenco.products.length).toBeGreaterThan(0);
    expect(resCuenco.products[0].sku).toBe('JG-ARO-001');
  });

  it('debe corregir errores ortográficos mediante Fuzzy Typos (Levenshtein)', () => {
    // "cuaderbo" en vez de "cuaderno"
    const resTypo = performSmartSearch(mockCatalog, 'cuaderbo');
    expect(resTypo.products.length).toBeGreaterThan(0);
    expect(resTypo.products[0].sku).toBe('JG-LIB-001');
    expect(resTypo.metadata.matchType).toBe('typo');
    expect(resTypo.metadata.correctedWord).toBe('cuaderno');
  });

  it('debe vincular conceptos de sinónimos polirrubro (ej. "telefono" / "celular")', () => {
    // Buscar "telefono" debe asociar la familia de Tecnología y sugerir productos afines
    const resSynonym = performSmartSearch(mockCatalog, 'telefono');
    expect(resSynonym.products.length).toBeGreaterThan(0);
    expect(resSynonym.metadata.matchType).toBe('related');
    expect(resSynonym.metadata.matchedConcept).toContain('Tecnología');
  });

  it('debe retornar lista vacía si no hay coincidencias exactas, fuzzy ni sinónimos', () => {
    const resEmpty = performSmartSearch(mockCatalog, 'palabraCompletamenteInexistenteXyZ999');
    expect(resEmpty.products.length).toBe(0);
    expect(resEmpty.metadata.matchType).toBe('empty');
  });
});
