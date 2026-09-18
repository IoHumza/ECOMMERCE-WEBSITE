import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const SITE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Luxora — Modern Ecommerce",
    template: "%s | Luxora",
  },
  description: "Discover curated apparel, footwear, and lifestyle goods at Luxora — quality you can feel, prices you will love.",
  openGraph: {
    title: "Luxora — Modern Ecommerce",
    description: "Discover curated apparel, footwear, and lifestyle goods at Luxora.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-slate-900 antialiased">
        <AppProviders>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
