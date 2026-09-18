import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/server/services/product.service";
import { listApprovedReviewsForProduct } from "@/server/services/review.service";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ReviewSection } from "@/components/product/ReviewSection";
import { ProductGrid } from "@/components/product/ProductGrid";
import type { Review } from "@/types";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.shortDescription ?? product.description.slice(0, 155),
    openGraph: {
      title: product.name,
      description: product.shortDescription ?? undefined,
      images: product.images[0] ? [{ url: product.images[0].url }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    listApprovedReviewsForProduct(product.id),
  ]);

  const reviewList: Review[] = reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
    userName: r.userName,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <ProductDetail product={product} />
      <ReviewSection productId={product.id} initialReviews={reviewList} />
      {related.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h2 className="text-2xl font-bold text-slate-950">You May Also Like</h2>
          <div className="mt-6">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
