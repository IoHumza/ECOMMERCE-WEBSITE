"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { Cart } from "@/types";

const EMPTY_CART: Cart = { items: [], subtotal: 0, itemCount: 0 };

type CartContextValue = {
  cart: Cart;
  isLoading: boolean;
  refresh: () => Promise<void>;
  addItem: (variantId: number, quantity?: number) => Promise<void>;
  updateItem: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await apiFetch<Cart>("/api/cart");
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (variantId: number, quantity = 1) => {
    const data = await apiFetch<Cart>("/api/cart", {
      method: "POST",
      body: JSON.stringify({ variantId, quantity }),
    });
    setCart(data);
  }, []);

  const updateItem = useCallback(async (itemId: number, quantity: number) => {
    const data = await apiFetch<Cart>(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId: number) => {
    const data = await apiFetch<Cart>(`/api/cart/items/${itemId}`, { method: "DELETE" });
    setCart(data);
  }, []);

  const clearCart = useCallback(async () => {
    const data = await apiFetch<Cart>("/api/cart", { method: "DELETE" });
    setCart(data);
  }, []);

  return (
    <CartContext.Provider value={{ cart, isLoading, refresh, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export { ApiClientError };
