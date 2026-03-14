"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/stores/cart-store";

/**
 * Handles cross-tab localStorage sync and server cart sync for logged-in users.
 * Mount this component once in the storefront layout.
 */
export function CartSync() {
  const { data: session, status } = useSession();

  // Cross-tab sync via storage event
  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "delicacies-cart" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.state) {
            // Zustand persist stores state under { state, version }
            const { items, promoCode, promoDiscount } = parsed.state;
            const store = useCartStore.getState();
            // Only update if different to prevent loops
            if (JSON.stringify(store.items) !== JSON.stringify(items)) {
              useCartStore.setState({ items, promoCode, promoDiscount });
            }
          }
        } catch {
          // Ignore parse errors
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sync cart to server when user is logged in
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    // On login: merge server cart with local cart
    async function mergeCartOnLogin() {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.data) return;

        const serverCart = data.data;
        const localItems = useCartStore.getState().items;

        // If local cart is empty but server has items, restore server cart
        if (localItems.length === 0 && serverCart.items?.length > 0) {
          useCartStore.setState({
            items: serverCart.items,
            promoCode: serverCart.promoCode ?? null,
            promoDiscount: serverCart.promoDiscount ?? 0,
          });
        }
        // If local has items, save to server (local takes priority)
        else if (localItems.length > 0) {
          await saveCartToServer();
        }
      } catch {
        // Silently fail — cart still works via localStorage
      }
    }

    mergeCartOnLogin();

    // Set up periodic save (every 30 seconds if cart changes)
    let lastSavedJson = "";
    const interval = setInterval(() => {
      const state = useCartStore.getState();
      const currentJson = JSON.stringify({ items: state.items, promoCode: state.promoCode, promoDiscount: state.promoDiscount });
      if (currentJson !== lastSavedJson) {
        lastSavedJson = currentJson;
        if (state.items.length > 0) {
          saveCartToServer();
        } else {
          // Sync empty cart to server so cleared carts stay cleared
          fetch("/api/cart", { method: "DELETE" }).catch(() => {});
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status, session]);

  return null;
}

async function saveCartToServer() {
  try {
    const state = useCartStore.getState();
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      }),
    });
  } catch {
    // Silently fail
  }
}
