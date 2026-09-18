import Link from "next/link";
import { NewsletterForm } from "./NewsletterForm";

const FOOTER_LINKS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/categories", label: "Categories" },
      { href: "/shop?sort=newest", label: "New arrivals" },
      { href: "/shop?featured=true", label: "Featured" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/account", label: "My profile" },
      { href: "/account/orders", label: "Order history" },
      { href: "/account/wishlist", label: "Wishlist" },
      { href: "/login", label: "Sign in" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms & conditions" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight text-white">
              <span className="rounded-lg bg-white px-2 py-1 text-sm text-slate-950">LX</span>
              Luxora
            </Link>
            <p className="mt-4 max-w-sm text-sm text-slate-400">
              Thoughtfully curated apparel, footwear, and lifestyle goods. Quality you can feel, prices you will love.
            </p>
            <NewsletterForm />
          </div>
          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-white">{section.title}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-slate-400 hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Luxora, Inc. All rights reserved.</p>
          <p>Built with Next.js, PostgreSQL &amp; Drizzle ORM.</p>
        </div>
      </div>
    </footer>
  );
}
