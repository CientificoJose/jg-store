import { describe, it, expect } from 'bun:test';
import {
  calculateCartSummary,
  formatPrice,
  generateWhatsAppOrderMessage,
  buildWhatsAppUrl,
  WHOLESALE_MIN_AMOUNT_ARS
} from '@/lib/whatsapp';
import { CartItem, CustomerOrderInfo, StoreProduct } from '@/types/store';

const sampleProductA: StoreProduct = {
  id: 'prod-a',
  sku: 'JG-ARO-001',
  name: 'Vela Aromática Soja',
  description: 'Vela en cuenco',
  category_slug: 'aromatizacion-velas',
  category_name: 'Aromatización y Velas',
  retail_price: 10000,
  wholesale_price: 7000,
  min_wholesale_qty: 6,
  stock: 50,
  image_url: 'https://example.com/a.jpg',
  unit: 'unidad'
};

const sampleProductB: StoreProduct = {
  id: 'prod-b',
  sku: 'JG-BAZ-001',
  name: 'Botella Térmica 750ml',
  description: 'Acero inoxidable',
  category_slug: 'bazar-cocina',
  category_name: 'Bazar y Cocina',
  retail_price: 20000,
  wholesale_price: 15000,
  min_wholesale_qty: 4,
  stock: 30,
  image_url: 'https://example.com/b.jpg',
  unit: 'unidad'
};

describe('Reglas Comerciales y Generación de WhatsApp (`whatsapp`)', () => {
  it('formatPrice debe formatear adecuadamente en Pesos Argentinos ($ ARS)', () => {
    const formatted = formatPrice(15000);
    expect(formatted).toContain('$');
    expect(formatted).toContain('15.000');
  });

  it('calculateCartSummary: debe cobrar precio detal si no supera cantidad mínima ni umbral global', () => {
    const items: CartItem[] = [
      {
        product: sampleProductA,
        quantity: 2, // < 6
        unit_price: 10000,
        is_wholesale: false,
        subtotal: 20000,
        savings: 0
      }
    ];

    const summary = calculateCartSummary(items);
    expect(summary.total_items).toBe(2);
    expect(summary.subtotal).toBe(20000);
    expect(summary.total_retail).toBe(20000);
    expect(summary.total_savings).toBe(0);
    expect(summary.wholesale_items_count).toBe(0);
  });

  it('calculateCartSummary: debe activar precio mayorista si la cantidad unitaria supera el mínimo', () => {
    const items: CartItem[] = [
      {
        product: sampleProductA,
        quantity: 6, // >= min_wholesale_qty (6)
        unit_price: 7000,
        is_wholesale: true,
        subtotal: 42000,
        savings: 18000
      }
    ];

    const summary = calculateCartSummary(items);
    expect(summary.total_items).toBe(6);
    expect(summary.subtotal).toBe(42000); // 6 * 7000
    expect(summary.total_retail).toBe(60000); // 6 * 10000
    expect(summary.total_savings).toBe(18000);
    expect(summary.wholesale_items_count).toBe(1);
  });

  it(`calculateCartSummary: debe activar tarifa mayorista global si el total minorista supera $${WHOLESALE_MIN_AMOUNT_ARS} ARS`, () => {
    // 3 unidades de Botella B = $ 60.000 ARS minorista (> $ 50.000 ARS umbral), aunque cantidad < 4
    const items: CartItem[] = [
      {
        product: sampleProductB,
        quantity: 3, // < 4 min_wholesale_qty pero total retail = $60.000 >= $50.000
        unit_price: 15000,
        is_wholesale: true,
        subtotal: 45000,
        savings: 15000
      }
    ];

    const summary = calculateCartSummary(items);
    // Debe haber desbloqueado precio mayorista ($ 15.000 * 3 = $ 45.000)
    expect(summary.subtotal).toBe(45000);
    expect(summary.total_retail).toBe(60000);
    expect(summary.total_savings).toBe(15000);
    expect(summary.wholesale_items_count).toBe(1);
  });

  it('generateWhatsAppOrderMessage: no debe contener selectores \\uFE0F (garantía de emojis limpios sin diamantes rotos)', () => {
    const items: CartItem[] = [
      {
        product: sampleProductA,
        quantity: 6,
        unit_price: 7000,
        is_wholesale: true,
        subtotal: 42000,
        savings: 18000
      }
    ];

    const customer: CustomerOrderInfo = {
      name: 'Comercial Belgrano',
      phone: '1144556677',
      delivery_type: 'shipping',
      address: 'Av. Cabildo 2040',
      city: 'CABA',
      postal_code: '1428',
      invoice_type: 'A',
      notes: 'Expreso Cruz del Sur'
    };

    const message = generateWhatsAppOrderMessage(items, customer);
    // Verificar que no contenga \uFE0F
    expect(message).not.toContain('\uFE0F');
    // Debe incluir datos del cliente y pedido
    expect(message).toContain('Comercial Belgrano');
    expect(message).toContain('Factura A (Responsable Inscripto)');
    expect(message).toContain('Av. Cabildo 2040');
    expect(message).toContain('JG-ARO-001');
    expect(message).toContain('PRECIO MAYORISTA');
  });

  it('generateWhatsAppOrderMessage: debe reflejar modalidad de Retiro en Persona', () => {
    const items: CartItem[] = [
      {
        product: sampleProductA,
        quantity: 1,
        unit_price: 10000,
        is_wholesale: false,
        subtotal: 10000,
        savings: 0
      }
    ];

    const customer: CustomerOrderInfo = {
      name: 'María Gómez',
      phone: '1199887766',
      delivery_type: 'pickup',
      invoice_type: 'B'
    };

    const message = generateWhatsAppOrderMessage(items, customer);
    expect(message).toContain('Retiro en Persona');
    expect(message).toContain('Factura B (Consumidor Final / Monotributo)');
  });

  it('buildWhatsAppUrl: debe usar endpoint api.whatsapp.com directo y sanitizar el teléfono', () => {
    const items: CartItem[] = [
      {
        product: sampleProductA,
        quantity: 2,
        unit_price: 10000,
        is_wholesale: false,
        subtotal: 20000,
        savings: 0
      }
    ];

    const customer: CustomerOrderInfo = {
      name: 'Juan Pérez',
      phone: '+54 9 11 2345-6789',
      delivery_type: 'pickup'
    };

    const url = buildWhatsAppUrl(items, customer, '+54 (911) 5555-0000');
    // Debe usar endpoint directo api.whatsapp.com
    expect(url).toMatch(/^https:\/\/api\.whatsapp\.com\/send\/\?phone=5491155550000&text=/);
    const parsedUrl = new URL(url);
    const phone = parsedUrl.searchParams.get('phone');
    expect(phone).toBe('5491155550000');
    expect(phone).not.toContain('+');
    expect(phone).not.toContain('(');
    expect(phone).not.toContain(')');
  });
});
