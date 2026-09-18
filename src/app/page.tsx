import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getFeaturedProducts, getNewArrivals, getPopularProducts } from "@/server/services/product.service";
import { listCategories } from "@/server/services/category.service";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LinkButton } from "@/components/ui/LinkButton";
import { Rating } from "@/components/ui/Rating";

export const metadata: Metadata = {
  title: "Luxora — Shop Apparel, Footwear & Lifestyle Goods",
  description: "Discover curated apparel, footwear, electronics and lifestyle goods at Luxora.",
};

const TESTIMONIALS = [
  { name: "Priya S.", quote: "The quality is outstanding and shipping was faster than expected. My new go-to store.", rating: 5 },
  { name: "Daniel K.", quote: "Customer support helped me exchange a size within minutes. Genuinely impressed.", rating: 5 },
  { name: "Sofia R.", quote: "Beautiful packaging and the hoodie fits perfectly. Will be ordering again.", rating: 4 },
];

export default async function HomePage() {
  const [featured, newArrivals, popular, categories] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8),
    getPopularProducts(8),
    listCategories(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">New season arrivals</p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
              Elevate Your <span className="text-amber-400">Everyday</span> Style
            </h1>
            <p className="mt-6 max-w-lg text-lg text-slate-300">
              Discover thoughtfully curated apparel, footwear, and lifestyle essentials — designed to last, priced to love.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <LinkButton href="/shop" size="lg" variant="secondary">
                Shop the Collection
              </LinkButton>
              <LinkButton href="/categories" size="lg" variant="outline" className="border-slate-600 text-white hover:bg-white/10">
                Browse Categories
              </LinkButton>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-3xl">
            <Image
              src="https://images.pexels.com/photos/19461584/pexels-photo-19461584.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900"
              alt="Models wearing Luxora apparel"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 500px"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.slice(0, 8).map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
            >
              {category.imageUrl && (
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-3 text-sm font-semibold text-white sm:text-base">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Handpicked</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Featured Products</h2>
            </div>
            <Link href="/shop?featured=true" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
              View all →
            </Link>
          </div>
          <div className="mt-8">
            <ProductGrid products={featured} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">Just landed</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">New Arrivals</h2>
          </div>
          <Link href="/shop?sort=newest" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            View all →
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={newArrivals} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-amber-500 py-16 text-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black sm:text-4xl">Free shipping on orders over $100</h2>
          <p className="max-w-xl text-slate-900/80">
            Plus, use code <span className="font-bold">WELCOME10</span> at checkout for 10% off your first order.
          </p>
          <LinkButton href="/shop" size="lg" className="bg-slate-950 text-white hover:bg-slate-800">
            Start Shopping
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold text-slate-950 sm:text-3xl">Most Popular</h2>
          <Link href="/shop?sort=popularity" className="text-sm font-semibold text-slate-700 hover:text-slate-950">
            View all →
          </Link>
        </div>
        <div className="mt-8">
          <ProductGrid products={popular} />
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">What Our Customers Say</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <blockquote key={t.name} className="rounded-2xl bg-white/5 p-6">
                <Rating value={t.rating} />
                <p className="mt-4 text-sm text-slate-200">&ldquo;{t.quote}&rdquo;</p>
                <footer className="mt-4 text-sm font-semibold text-amber-400">{t.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
