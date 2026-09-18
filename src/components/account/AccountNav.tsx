"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/account", label: "Profile" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2" aria-label="Account navigation">
      {LINKS.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
