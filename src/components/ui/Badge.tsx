import type { ReactNode } from "react";

const styles: Record<string, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-sky-100 text-sky-800",
  dark: "bg-slate-900 text-white",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: ReactNode; tone?: keyof typeof styles; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles[tone]} ${className}`}>
      {children}
    </span>
  );
}
