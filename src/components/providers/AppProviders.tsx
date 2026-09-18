"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { CartProvider } from "./CartProvider";
import { ToastProvider } from "./ToastProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
