import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoreProduct, CartItem, CartSummary, CustomerOrderInfo } from '@/types/store';
import { calculateCartSummary } from '@/lib/whatsapp';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  wholesaleMode: boolean; // Si el cliente activó vista mayorista global
  customer: CustomerOrderInfo;
  
  // Acciones UI
  setOpen: (open: boolean) => void;
  toggleWholesaleMode: () => void;
  setCustomerInfo: (info: Partial<CustomerOrderInfo>) => void;

  // Acciones de Carrito
  addItem: (product: StoreProduct, qty?: number) => { success: boolean; message?: string };
  updateQuantity: (productId: string, qty: number) => { success: boolean; message?: string };
  removeItem: (productId: string) => void;
  clearCart: () => void;

  // Selectores
  getSummary: () => CartSummary;
}

import { WHOLESALE_MIN_AMOUNT_ARS } from '@/lib/whatsapp';

function refreshCartItems(items: { product: StoreProduct; quantity: number }[]): CartItem[] {
  const totalRetail = items.reduce((sum, item) => sum + item.product.retail_price * item.quantity, 0);
  const qualifiesGlobalWholesale = totalRetail >= WHOLESALE_MIN_AMOUNT_ARS;

  return items.map(({ product, quantity }) => {
    const isWholesale = qualifiesGlobalWholesale || quantity >= product.min_wholesale_qty;
    const unitPrice = isWholesale ? product.wholesale_price : product.retail_price;
    const subtotal = Math.round(unitPrice * quantity);
    const retailSubtotal = Math.round(product.retail_price * quantity);
    const savings = Math.max(0, retailSubtotal - subtotal);

    return {
      product,
      quantity,
      unit_price: unitPrice,
      is_wholesale: isWholesale,
      subtotal,
      savings
    };
  });
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      wholesaleMode: false,
      customer: {
        name: '',
        phone: '',
        delivery_type: 'shipping',
        city: '',
        postal_code: '',
        province: '',
        invoice_type: 'B',
        address: '',
        notes: ''
      },

      setOpen: (open) => set({ isOpen: open }),

      toggleWholesaleMode: () =>
        set((state) => ({ wholesaleMode: !state.wholesaleMode })),

      setCustomerInfo: (info) =>
        set((state) => ({
          customer: { ...state.customer, ...info }
        })),

      addItem: (product, qty = 1) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.product.id === product.id);
        const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
        const newQty = currentQty + qty;

        // Control estricto de Stock
        if (product.stock <= 0) {
          return {
            success: false,
            message: `El producto "${product.name}" se encuentra agotado.`
          };
        }

        if (newQty > product.stock) {
          return {
            success: false,
            message: `Solo quedan ${product.stock} unidades disponibles de "${product.name}".`
          };
        }

        let rawItems: { product: StoreProduct; quantity: number }[];
        if (existingIndex >= 0) {
          rawItems = items.map((i, idx) =>
            idx === existingIndex ? { product, quantity: newQty } : { product: i.product, quantity: i.quantity }
          );
        } else {
          rawItems = [...items.map(i => ({ product: i.product, quantity: i.quantity })), { product, quantity: newQty }];
        }

        const updatedItems = refreshCartItems(rawItems);
        set({ items: updatedItems });
        return { success: true };
      },

      updateQuantity: (productId, qty) => {
        const { items } = get();
        const item = items.find((i) => i.product.id === productId);

        if (!item) return { success: false, message: 'Producto no encontrado en el carrito.' };

        if (qty <= 0) {
          get().removeItem(productId);
          return { success: true };
        }

        if (qty > item.product.stock) {
          return {
            success: false,
            message: `No podés agregar más de ${item.product.stock} unidades de este producto.`
          };
        }

        const rawItems = items.map((i) =>
          i.product.id === productId ? { product: i.product, quantity: qty } : { product: i.product, quantity: i.quantity }
        );

        const updatedItems = refreshCartItems(rawItems);
        set({ items: updatedItems });
        return { success: true };
      },

      removeItem: (productId) => {
        const { items } = get();
        const remaining = items
          .filter((i) => i.product.id !== productId)
          .map((i) => ({ product: i.product, quantity: i.quantity }));
        set({ items: refreshCartItems(remaining) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSummary: () => {
        return calculateCartSummary(get().items);
      }
    }),
    {
      name: 'jg-store-cart-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        wholesaleMode: state.wholesaleMode,
        customer: state.customer
      })
    }
  )
);
