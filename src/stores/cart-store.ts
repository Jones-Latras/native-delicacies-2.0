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

function normalizeCustomizations(customizations: CartItemCustomization) {
  return {
    size: customizations.size,
    sizePrice: customizations.sizePrice,
    addOns: (customizations.addOns ?? [])
      .slice()
      .sort((a, b) => `${a.name}:${a.price}`.localeCompare(`${b.name}:${b.price}`)),
    modifications: (customizations.modifications ?? []).slice().sort(),
  };
}

function buildStackKey(item: Omit<CartItem, "id" | "lineTotal">): string {
  return JSON.stringify({
    menuItemId: item.menuItemId,
    price: item.price,
    customizations: normalizeCustomizations(item.customizations),
    specialInstructions: item.specialInstructions?.trim() || null,
  });
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
        const nextKey = buildStackKey(item);
        set((state) => {
          const existing = state.items.find((i) =>
            buildStackKey({
              menuItemId: i.menuItemId,
              name: i.name,
              price: i.price,
              quantity: i.quantity,
              maxQuantity: i.maxQuantity,
              imageUrl: i.imageUrl,
              customizations: i.customizations,
              specialInstructions: i.specialInstructions,
            }) === nextKey
          );

          if (existing) {
            const maxQuantity = existing.maxQuantity ?? item.maxQuantity;
            const nextQuantity = maxQuantity
              ? Math.min(existing.quantity + item.quantity, maxQuantity)
              : existing.quantity + item.quantity;

            return {
              items: state.items.map((i) => {
                if (i.id !== existing.id) return i;
                const updated = {
                  ...i,
                  quantity: nextQuantity,
                  maxQuantity,
                };
                return { ...updated, lineTotal: calculateLineTotal(updated) };
              }),
            };
          }

          const id = crypto.randomUUID();
          const cappedQuantity = item.maxQuantity
            ? Math.min(item.quantity, item.maxQuantity)
            : item.quantity;
          const nextItem = { ...item, quantity: cappedQuantity };
          const lineTotal = calculateLineTotal(nextItem);

          return {
            items: [...state.items, { ...nextItem, id, lineTotal }],
          };
        });
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
            const capped = item.maxQuantity ? Math.min(quantity, item.maxQuantity) : quantity;
            const updated = { ...item, quantity: capped };
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
        // Clear server-side saved cart for logged-in users
        fetch("/api/cart", { method: "DELETE" }).catch(() => {});
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
      name: "jj-native-delicacies-cart",
    }
  )
);
