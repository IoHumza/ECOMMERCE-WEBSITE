"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
    setMobileOpen(false);
  }

  async function handleLogout() {
    await logout();
    setAccountOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
          <span className="mt-1 block h-0.5 w-5 bg-current" />
        </button>

        <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-950">
          <span className="rounded-lg bg-slate-900 px-2 py-1 text-sm text-white">LX</span>
          Luxora
        </Link>

        <nav className="ml-4 hidden items-center gap-6 lg:flex" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700 hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} role="search" className="ml-auto hidden max-w-md flex-1 items-center sm:flex">
          <label htmlFor="nav-search" className="sr-only">
            Search products
          </label>
          <div className="relative w-full">
            <input
              id="nav-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 pl-4 pr-10 text-sm outline-none transition focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-200"
            />
            <button type="submit" aria-label="Search" className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 hover:bg-slate-200">
              🔍
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:ml-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((v) => !v)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              className="flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span aria-hidden="true">👤</span>
              <span className="hidden sm:inline">{user ? user.name.split(" ")[0] : "Account"}</span>
            </button>
            {accountOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                onMouseLeave={() => setAccountOpen(false)}
              >
                {user ? (
                  <>
                    <p className="truncate px-3 py-2 text-xs text-slate-500">Signed in as {user.email}</p>
                    <Link href="/account" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      My Profile
                    </Link>
                    <Link href="/account/orders" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      My Orders
                    </Link>
                    <Link href="/account/wishlist" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      Wishlist
                    </Link>
                    <Link href="/account/addresses" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      Addresses
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" role="menuitem" className="block rounded-lg px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50" onClick={() => setAccountOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button type="button" role="menuitem" onClick={handleLogout} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      Sign in
                    </Link>
                    <Link href="/register" role="menuitem" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-100" onClick={() => setAccountOpen(false)}>
                      Create account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link href="/account/wishlist" className="hidden rounded-lg p-2 text-slate-700 hover:bg-slate-100 sm:block" aria-label="Wishlist">
            ♡
          </Link>

          <Link href="/cart" className="relative rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label={`Cart, ${cart.itemCount} items`}>
            🛍
            {cart.itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[1.125rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-slate-950">
                {cart.itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-slate-200 px-4 pb-4 pt-2 lg:hidden">
          <form onSubmit={handleSearch} role="search" className="mb-3 flex items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products..."
              className="w-full rounded-full border border-slate-300 bg-slate-50 py-2 px-4 text-sm outline-none focus:border-slate-500"
            />
          </form>
          <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
