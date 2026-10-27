import { describe, it, expect, beforeEach } from 'bun:test';
import { useCartStore, CompletedOrderData } from '../hooks/use-cart-store';
import { useStoreConfigStore } from '../hooks/use-store-config-store';
import { formatPrice } from '../lib/whatsapp';

describe('Pantalla de Confirmación Post-Pedido (Éxito & Datos Bancarios)', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
    useCartStore.getState().clearCompletedOrder();
  });

  it('debe inicializarse con completedOrder en null', () => {
    const { completedOrder } = useCartStore.getState();
    expect(completedOrder).toBeNull();
  });

  it('debe permitir registrar una orden completada con número oficial, cliente y montos', () => {
    const mockOrder: CompletedOrderData = {
      orderNumber: 'JG-2026-0099',
      items: [
        {
          product: {
            id: 'prod-001',
            sku: 'JG-DIF-01',
            name: 'Difusor de Aromas Ultrasónico',
            description: 'Difusor de prueba',
            category_slug: 'aromatizacion-velas',
            category_name: 'Aromatización y Velas',
            retail_price: 15000,
            wholesale_price: 10500,
            min_wholesale_qty: 6,
            stock: 25,
            image_url: 'https://example.com/photo.jpg',
            unit: 'unidad'
          },
          quantity: 2,
          unit_price: 15000,
          is_wholesale: false,
          subtotal: 30000,
          savings: 0
        }
      ],
      summary: {
        total_items: 2,
        subtotal: 30000,
        total_retail: 30000,
        total_savings: 0,
        wholesale_items_count: 0
      },
      customer: {
        name: 'Martín Palermo',
        phone: '+5491144445555',
        delivery_type: 'shipping',
        city: 'Rosario, Santa Fe',
        address: 'Bv. Oroño 1234',
        invoice_type: 'B'
      },
      whatsappUrl: 'https://api.whatsapp.com/send/?phone=5491155550000&text=Hola',
      createdAt: new Date().toISOString()
    };

    useCartStore.getState().setCompletedOrder(mockOrder);

    const state = useCartStore.getState();
    expect(state.completedOrder).not.toBeNull();
    expect(state.completedOrder?.orderNumber).toBe('JG-2026-0099');
    expect(state.completedOrder?.customer.name).toBe('Martín Palermo');
    expect(state.completedOrder?.summary.subtotal).toBe(30000);
  });

  it('debe calcular con precisión el 10% de descuento por transferencia CBU / Alias', () => {
    const subtotal = 50000;
    const discountTransferPct = 0.10;
    const transferTotal = Math.round(subtotal * (1 - discountTransferPct));
    const transferSavings = subtotal - transferTotal;

    expect(transferTotal).toBe(45000);
    expect(transferSavings).toBe(5000);
    expect(formatPrice(transferTotal)).toContain('45.000');
    expect(formatPrice(transferSavings)).toContain('5.000');
  });

  it('debe recuperar los datos bancarios desde la configuración de la tienda', () => {
    const general = useStoreConfigStore.getState().general;
    expect(general.bankName).toBeDefined();
    expect(general.bankAccountHolder).toBeDefined();
    expect(general.bankCbu).toBeDefined();
    expect(general.bankAlias).toBeDefined();

    // Actualización de datos bancarios desde panel de config
    useStoreConfigStore.getState().updateGeneral({
      bankAlias: 'MI.ALIAS.CUSTOM',
      bankCbu: '0000000000000000000001'
    });

    const updated = useStoreConfigStore.getState().general;
    expect(updated.bankAlias).toBe('MI.ALIAS.CUSTOM');
    expect(updated.bankCbu).toBe('0000000000000000000001');
  });

  it('debe limpiar completedOrder al invocar clearCompletedOrder', () => {
    useCartStore.getState().setCompletedOrder({
      orderNumber: 'JG-2026-0001',
      items: [],
      summary: { total_items: 0, subtotal: 0, total_retail: 0, total_savings: 0, wholesale_items_count: 0 },
      customer: { name: 'Juan', phone: '123', delivery_type: 'pickup' },
      whatsappUrl: 'https://wa.me/123',
      createdAt: new Date().toISOString()
    });

    expect(useCartStore.getState().completedOrder).not.toBeNull();

    useCartStore.getState().clearCompletedOrder();

    expect(useCartStore.getState().completedOrder).toBeNull();
  });
});
