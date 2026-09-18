"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; message: string; variant: "success" | "error" | "info" };

type ToastContextValue = {
  showToast: (message: string, variant?: Toast["variant"]) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: Toast["variant"] = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur transition-all ${
              toast.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : toast.variant === "error"
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-slate-200 bg-white text-slate-800"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
