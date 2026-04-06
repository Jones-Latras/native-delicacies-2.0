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

  useEffect(() => {
    function handleStorageChange(e: StorageEvent) {
      if (e.key === "jj-native-delicacies-cart" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.state) {
            const { items, promoCode, promoDiscount } = parsed.state;
            const store = useCartStore.getState();
            if (JSON.stringify(store.items) !== JSON.stringify(items)) {
              useCartStore.setState({ items, promoCode, promoDiscount });
            }
          }
        } catch {
          // Ignore parse errors.
        }
      }
    }

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    async function mergeCartOnLogin() {
      try {
        const res = await fetch("/api/cart");
        if (!res.ok) return;

        const data = await res.json();
        if (!data.success || !data.data) return;

        const serverCart = data.data;
        const localState = useCartStore.getState();
        const hasLocalSnapshot =
          window.localStorage.getItem("jj-native-delicacies-cart") !== null;

        // Only restore server cart for a browser that has never stored a local cart.
        if (!hasLocalSnapshot && localState.items.length === 0 && serverCart.items?.length > 0) {
          useCartStore.setState({
            items: serverCart.items,
            promoCode: serverCart.promoCode ?? null,
            promoDiscount: serverCart.promoDiscount ?? 0,
          });
          return;
        }

        // Otherwise local state is the source of truth, even when intentionally empty.
        if (localState.items.length > 0) {
          await saveCartToServer();
        } else {
          await clearCartOnServer();
        }
      } catch {
        // Silently fail. Cart still works via localStorage.
      }
    }

    mergeCartOnLogin();

    let lastSavedJson = "";
    const interval = setInterval(() => {
      const state = useCartStore.getState();
      const currentJson = JSON.stringify({
        items: state.items,
        promoCode: state.promoCode,
        promoDiscount: state.promoDiscount,
      });

      if (currentJson !== lastSavedJson) {
        lastSavedJson = currentJson;
        if (state.items.length > 0) {
          saveCartToServer();
        } else {
          clearCartOnServer();
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
    // Silently fail.
  }
}

async function clearCartOnServer() {
  try {
    await fetch("/api/cart", { method: "DELETE" });
  } catch {
    // Silently fail.
  }
}
