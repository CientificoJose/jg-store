import { describe, it, expect } from 'bun:test';
import {
  PRODUCT_CATEGORIES,
  CATEGORY_MAP,
  getSubcategoriesByCategory,
  getSubSubcategories,
  formatCategoryBreadcrumb
} from '@/constants/categories';
import {
  categoryOptions,
  getSubcategoryOptions,
  getSubSubcategoryOptions
} from '@/features/products/constants/product-options';

describe('Jerarquía de Categorías JG Store (3 Niveles)', () => {
  it('debe contener exactamente los 24 departamentos oficiales de JG Store', () => {
    expect(PRODUCT_CATEGORIES.length).toBe(24);
    expect(CATEGORY_MAP.size).toBe(24);

    const expectedSlugs = [
      'aromatizacion-velas',
      'arte-manualidades',
      'articulos-viaje',
      'bazar-cocina',
      'belleza-accesorios',
      'cartucheras-carpetas',
      'cotillon',
      'deco-organizacion-hogar',
      'electro',
      'embalajes',
      'ferreteria-pesca',
      'higiene-limpieza',
      'indumentaria',
      'jugueteria',
      'libreria',
      'libros',
      'marroquineria',
      'mascotas',
      'mochilas-maletines',
      'navidad',
      'pelucheria',
      'simbolos-patrios',
      'textil',
      'verano'
    ];

    for (const slug of expectedSlugs) {
      expect(CATEGORY_MAP.has(slug)).toBe(true);
      const cat = CATEGORY_MAP.get(slug);
      expect(cat).toBeDefined();
      expect(cat?.name.length).toBeGreaterThan(2);
      expect(cat?.icon).toBeDefined();
      expect(cat?.imageUrl).toMatch(/^https?:\/\//);
    }
  });

  it('todos los 24 departamentos deben poseer subcategorías comerciales de Nivel 2', () => {
    for (const cat of PRODUCT_CATEGORIES) {
      const subcategories = getSubcategoriesByCategory(cat.slug);
      expect(subcategories.length).toBeGreaterThan(0);

      for (const sub of subcategories) {
        expect(sub.category_slug).toBe(cat.slug);
        expect(sub.name).toBeDefined();
        expect(sub.slug).toBeDefined();
        expect(sub.slug.length).toBeGreaterThan(2);
      }
    }
  });

  it('las subcategorías deben contar con líneas específicas de producto de Nivel 3', () => {
    // Verificamos por ejemplo Bazar y Cocina > Termos y Botellas
    const subcategories = getSubcategoriesByCategory('bazar-cocina');
    const termosSub = subcategories.find((s) => s.slug === 'termos-botellas');
    expect(termosSub).toBeDefined();

    const subSubs = getSubSubcategories('bazar-cocina', 'termos-botellas');
    expect(subSubs.length).toBeGreaterThanOrEqual(2);

    const aceroInox = subSubs.find((ss) => ss.slug === 'botellas-acero-inoxidable');
    expect(aceroInox).toBeDefined();
    expect(aceroInox?.name).toContain('Botellas');
  });

  it('formatCategoryBreadcrumb debe generar rutas jerárquicas legibles de 1, 2 y 3 niveles', () => {
    // 1 nivel
    const crumb1 = formatCategoryBreadcrumb('bazar-cocina');
    expect(crumb1).toBe('Bazar y Cocina');

    // 2 niveles
    const crumb2 = formatCategoryBreadcrumb('bazar-cocina', 'termos-botellas');
    expect(crumb2).toBe('Bazar y Cocina > Termos y Botellas');

    // 3 niveles
    const crumb3 = formatCategoryBreadcrumb(
      'bazar-cocina',
      'termos-botellas',
      'botellas-acero-inoxidable'
    );
    expect(crumb3).toBe('Bazar y Cocina > Termos y Botellas > Botellas Térmicas de Acero Inoxidable');
  });

  it('debe manejar slugs inexistentes sin romper la aplicación', () => {
    const crumbEmpty = formatCategoryBreadcrumb('');
    expect(crumbEmpty).toBe('');

    const crumbUnknown = formatCategoryBreadcrumb('categoria-inexistente');
    expect(crumbUnknown).toBe('categoria-inexistente');

    const subsUnknown = getSubcategoriesByCategory('categoria-falsa');
    expect(subsUnknown).toEqual([]);

    const subSubsUnknown = getSubSubcategories('bazar-cocina', 'subcategoria-falsa');
    expect(subSubsUnknown).toEqual([]);
  });

  it('product-options helpers deben devolver opciones válidas para los Selectores en cascada', () => {
    expect(categoryOptions.length).toBe(24);

    const subOpts = getSubcategoryOptions('bazar-cocina');
    expect(subOpts.length).toBeGreaterThan(0);
    expect(subOpts[0]).toHaveProperty('value');
    expect(subOpts[0]).toHaveProperty('label');

    const subSubOpts = getSubSubcategoryOptions('bazar-cocina', 'termos-botellas');
    expect(subSubOpts.length).toBeGreaterThan(0);
    expect(subSubOpts[0]).toHaveProperty('value');
    expect(subSubOpts[0]).toHaveProperty('label');

    // Manejo de valores vacíos
    expect(getSubcategoryOptions('')).toEqual([]);
    expect(getSubSubcategoryOptions('', '')).toEqual([]);
  });
});
