"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/lib/i18n";
type CartItem = { productId: string; quantity: number };
type ShopState = {
  locale: Locale;
  items: CartItem[];
  setLocale: (locale: Locale) => void;
  add: (productId: string, max: number) => void;
  quantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};
export const useShop = create<ShopState>()(
  persist(
    (set) => ({
      locale: "en",
      items: [],
      setLocale: (locale) => set({ locale }),
      add: (productId, max) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          return {
            items: existing
              ? state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(i.quantity + 1, max, 50) }
                    : i,
                )
              : [...state.items, { productId, quantity: 1 }],
          };
        }),
      quantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? {
                  ...i,
                  quantity: Math.min(50, Math.max(1, Math.floor(quantity))),
                }
              : i,
          ),
        })),
      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "ethiosource-shop", version: 1, skipHydration: true },
  ),
);
