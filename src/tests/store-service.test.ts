import { describe, it, expect } from 'bun:test';
import {
  fetchStoreProductsWithMeta,
  fetchStoreProducts,
  fetchProductById,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct
} from '@/lib/store-service';

describe('Servicio de Catálogo y Productos JG Store (`store-service`)', () => {
  it('fetchStoreProductsWithMeta debe devolver productos del catálogo inicial por defecto', async () => {
    const res = await fetchStoreProductsWithMeta();
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.products[0]).toHaveProperty('sku');
    expect(res.products[0]).toHaveProperty('retail_price');
    expect(res.products[0]).toHaveProperty('wholesale_price');
  });

  it('debe filtrar correctamente por departamento oficial (Nivel 1)', async () => {
    const res = await fetchStoreProductsWithMeta({ category: 'aromatizacion-velas' });
    expect(res.products.length).toBeGreaterThan(0);
    for (const p of res.products) {
      expect(p.category_slug).toBe('aromatizacion-velas');
    }
  });

  it('debe ordenar productos según el parámetro sort', async () => {
    // 1. Menor precio
    const resAsc = await fetchStoreProductsWithMeta({ sort: 'price_asc' });
    for (let i = 0; i < resAsc.products.length - 1; i++) {
      expect(resAsc.products[i].retail_price).toBeLessThanOrEqual(resAsc.products[i + 1].retail_price);
    }

    // 2. Mayor precio
    const resDesc = await fetchStoreProductsWithMeta({ sort: 'price_desc' });
    for (let i = 0; i < resDesc.products.length - 1; i++) {
      expect(resDesc.products[i].retail_price).toBeGreaterThanOrEqual(resDesc.products[i + 1].retail_price);
    }
  });

  it('debe filtrar solo productos con stock disponible', async () => {
    const res = await fetchStoreProductsWithMeta({ onlyInStock: true });
    for (const p of res.products) {
      expect(p.stock).toBeGreaterThan(0);
    }
  });

  it('debe buscar y devolver metadata de búsqueda inteligente', async () => {
    const res = await fetchStoreProductsWithMeta({ search: 'vela' });
    expect(res.products.length).toBeGreaterThan(0);
    expect(res.searchMetadata).toBeDefined();
    expect(res.searchMetadata?.originalQuery).toBe('vela');
  });

  it('debe permitir crear, actualizar, consultar y eliminar productos en el catálogo', async () => {
    // 1. Crear producto con jerarquía completa
    const created = await createStoreProduct({
      sku: 'JG-TEST-999',
      name: 'Producto de Prueba Test Suite',
      description: 'Descripción para test unitario',
      category_slug: 'bazar-cocina',
      category_name: 'Bazar y Cocina',
      subcategory_id: 'bazar-termos',
      subcategory_slug: 'termos-botellas',
      subcategory_name: 'Termos y Botellas',
      sub_subcategory_id: 'bazar-termos-pico',
      sub_subcategory_slug: 'termos-pico-cebador',
      sub_subcategory_name: 'Termos con Pico Cebador',
      retail_price: 15000,
      wholesale_price: 11000,
      min_wholesale_qty: 6,
      stock: 40,
      unit: 'unidad',
      image_url: 'https://example.com/test.jpg'
    });

    expect(created.id).toBeDefined();
    expect(created.sku).toBe('JG-TEST-999');
    expect(created.subcategory_slug).toBe('termos-botellas');

    // 2. Consultar por ID
    const found = await fetchProductById(created.id);
    expect(found).toBeDefined();
    expect(found?.name).toBe('Producto de Prueba Test Suite');

    // 3. Actualizar
    const updated = await updateStoreProduct(created.id, {
      name: 'Producto de Prueba Test Suite - Modificado',
      stock: 75
    });
    expect(updated?.name).toBe('Producto de Prueba Test Suite - Modificado');
    expect(updated?.stock).toBe(75);

    // 4. Eliminar
    const deleted = await deleteStoreProduct(created.id);
    expect(deleted).toBe(true);

    const checkDeleted = await fetchProductById(created.id);
    expect(checkDeleted).toBeNull();
  });
});
