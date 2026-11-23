import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { StoreProduct, CartItem, CartSummary, CustomerOrderInfo, ProductVariant } from '@/types/store';
import { calculateCartSummary } from '@/lib/whatsapp';

export interface CompletedOrderData {
  orderNumber: string;
  items: CartItem[];
  summary: CartSummary;
  customer: CustomerOrderInfo;
  whatsappUrl: string;
  createdAt: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  wholesaleMode: boolean; // Si el cliente activó vista mayorista global
  customer: CustomerOrderInfo;
  completedOrder: CompletedOrderData | null;
  
  // Acciones UI
  setOpen: (open: boolean) => void;
  toggleWholesaleMode: () => void;
  setCustomerInfo: (info: Partial<CustomerOrderInfo>) => void;
  setCompletedOrder: (order: CompletedOrderData | null) => void;
  clearCompletedOrder: () => void;

  // Acciones de Carrito
  addItem: (product: StoreProduct, qty?: number, variant?: ProductVariant) => { success: boolean; message?: string };
  updateQuantity: (productIdOrKey: string, qty: number) => { success: boolean; message?: string };
  removeItem: (productIdOrKey: string) => void;
  clearCart: () => void;

  // Selectores
  getSummary: () => CartSummary;
}

import { WHOLESALE_MIN_AMOUNT_ARS } from '@/lib/whatsapp';

export function getCartItemKey(productId: string, variantSku?: string): string {
  return variantSku ? `${productId}__${variantSku}` : productId;
}

function refreshCartItems(items: { product: StoreProduct; quantity: number; selected_variant?: ProductVariant }[]): CartItem[] {
  const totalRetail = items.reduce((sum, item) => sum + item.product.retail_price * item.quantity, 0);
  const qualifiesGlobalWholesale = totalRetail >= WHOLESALE_MIN_AMOUNT_ARS;

  return items.map(({ product, quantity, selected_variant }) => {
    const isWholesale = qualifiesGlobalWholesale || quantity >= product.min_wholesale_qty;
    const unitPrice = isWholesale ? product.wholesale_price : product.retail_price;
    const subtotal = Math.round(unitPrice * quantity);
    const retailSubtotal = Math.round(product.retail_price * quantity);
    const savings = Math.max(0, retailSubtotal - subtotal);

    return {
      product,
      selected_variant,
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
        dni_cuit: '',
        phone: '',
        delivery_type: 'shipping',
        city: '',
        postal_code: '',
        province: '',
        invoice_type: 'B',
        address: '',
        notes: ''
      },
      completedOrder: null,

      setOpen: (open) => set({ isOpen: open }),

      toggleWholesaleMode: () =>
        set((state) => ({ wholesaleMode: !state.wholesaleMode })),

      setCustomerInfo: (info) =>
        set((state) => ({
          customer: { ...state.customer, ...info }
        })),

      setCompletedOrder: (order) => set({ completedOrder: order }),
      clearCompletedOrder: () => set({ completedOrder: null }),

      addItem: (product, qty = 1, variant) => {
        const { items } = get();
        const targetKey = getCartItemKey(product.id, variant?.variant_sku);
        const existingIndex = items.findIndex(
          (i) => getCartItemKey(i.product.id, i.selected_variant?.variant_sku) === targetKey
        );
        const currentQty = existingIndex >= 0 ? items[existingIndex].quantity : 0;
        const newQty = currentQty + qty;

        // Control estricto de Stock
        const availableStock = variant?.stock ?? product.stock;
        if (availableStock <= 0) {
          return {
            success: false,
            message: `El producto "${product.name}"${variant?.attribute_color ? ` (${variant.attribute_color})` : ''} se encuentra agotado.`
          };
        }

        if (newQty > availableStock) {
          return {
            success: false,
            message: `Solo quedan ${availableStock} unidades disponibles de "${product.name}"${variant?.attribute_color ? ` (${variant.attribute_color})` : ''}.`
          };
        }

        let rawItems: { product: StoreProduct; quantity: number; selected_variant?: ProductVariant }[];
        if (existingIndex >= 0) {
          rawItems = items.map((i, idx) =>
            idx === existingIndex
              ? { product, quantity: newQty, selected_variant: variant || i.selected_variant }
              : { product: i.product, quantity: i.quantity, selected_variant: i.selected_variant }
          );
        } else {
          rawItems = [
            ...items.map((i) => ({
              product: i.product,
              quantity: i.quantity,
              selected_variant: i.selected_variant
            })),
            { product, quantity: newQty, selected_variant: variant }
          ];
        }

        const updatedItems = refreshCartItems(rawItems);
        set({ items: updatedItems });
        return { success: true };
      },

      updateQuantity: (productIdOrKey, qty) => {
        const { items } = get();
        const item = items.find(
          (i) =>
            i.product.id === productIdOrKey ||
            getCartItemKey(i.product.id, i.selected_variant?.variant_sku) === productIdOrKey
        );

        if (!item) return { success: false, message: 'Producto no encontrado en el carrito.' };

        if (qty <= 0) {
          get().removeItem(productIdOrKey);
          return { success: true };
        }

        const maxStock = item.selected_variant?.stock ?? item.product.stock;
        if (qty > maxStock) {
          return {
            success: false,
            message: `No podés agregar más de ${maxStock} unidades de este producto.`
          };
        }

        const rawItems = items.map((i) => {
          const currentKey = getCartItemKey(i.product.id, i.selected_variant?.variant_sku);
          const isTarget = i.product.id === productIdOrKey || currentKey === productIdOrKey;
          return isTarget
            ? { product: i.product, quantity: qty, selected_variant: i.selected_variant }
            : { product: i.product, quantity: i.quantity, selected_variant: i.selected_variant };
        });

        const updatedItems = refreshCartItems(rawItems);
        set({ items: updatedItems });
        return { success: true };
      },

      removeItem: (productIdOrKey) => {
        const { items } = get();
        const remaining = items
          .filter(
            (i) =>
              i.product.id !== productIdOrKey &&
              getCartItemKey(i.product.id, i.selected_variant?.variant_sku) !== productIdOrKey
          )
          .map((i) => ({ product: i.product, quantity: i.quantity, selected_variant: i.selected_variant }));
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
        customer: state.customer,
        completedOrder: state.completedOrder
      })
    }
  )
);
