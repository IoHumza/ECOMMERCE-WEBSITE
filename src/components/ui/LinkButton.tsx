import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-700 focus-visible:outline-slate-900",
  secondary: "bg-amber-500 text-slate-950 hover:bg-amber-400 focus-visible:outline-amber-500",
  outline: "border border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-400",
  danger: "bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-600",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-xl",
  lg: "px-7 py-3.5 text-base rounded-xl",
};

type Props = ComponentProps<typeof Link> & { variant?: Variant; size?: Size; className?: string };

export function LinkButton({ variant = "primary", size = "md", className = "", children, ...rest }: Props) {
  return (
    <Link
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
