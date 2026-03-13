import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartItemCustomization } from "@/types";

interface CartStore {
  items: CartItem[];
  promoCode: string | null;
  promoDiscount: number;

  // Actions
  addItem: (item: Omit<CartItem, "id" | "lineTotal">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateCustomizations: (id: string, customizations: CartItemCustomization, specialInstructions?: string) => void;
  clearCart: () => void;
  setPromoCode: (code: string | null, discount: number) => void;

  // Computed
  getSubtotal: () => number;
  getItemCount: () => number;
  getTotal: () => number;
}

function calculateLineTotal(item: Omit<CartItem, "id" | "lineTotal">): number {
  let base = item.price;
  if (item.customizations.sizePrice) {
    base = item.customizations.sizePrice;
  }
  const addOnsTotal = item.customizations.addOns?.reduce((sum, a) => sum + a.price, 0) ?? 0;
  return (base + addOnsTotal) * item.quantity;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,
      promoDiscount: 0,

      addItem: (item) => {
        const id = crypto.randomUUID();
        const lineTotal = calculateLineTotal(item);
        set((state) => ({
          items: [...state.items, { ...item, id, lineTotal }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const updated = { ...item, quantity };
            return { ...updated, lineTotal: calculateLineTotal(updated) };
          }),
        }));
      },

      updateCustomizations: (id, customizations, specialInstructions) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            const updated = {
              ...item,
              customizations,
              specialInstructions: specialInstructions ?? item.specialInstructions,
            };
            return { ...updated, lineTotal: calculateLineTotal(updated) };
          }),
        }));
      },

      clearCart: () => {
        set({ items: [], promoCode: null, promoDiscount: 0 });
      },

      setPromoCode: (code, discount) => {
        set({ promoCode: code, promoDiscount: discount });
      },

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.lineTotal, 0),

      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () => {
        const subtotal = get().getSubtotal();
        return Math.max(0, subtotal - get().promoDiscount);
      },
    }),
    {
      name: "delicacies-cart",
    }
  )
);
