import Image from "next/image";
import Link from "next/link";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/format";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice);
  const discountPercent = hasDiscount
    ? Math.round((1 - Number(product.basePrice) / Number(product.compareAtPrice)) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={primaryImage.altText ?? product.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">No image</div>
        )}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5">
          {product.isNewArrival && <Badge tone="dark">New</Badge>}
          {hasDiscount && <Badge tone="danger">-{discountPercent}%</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {product.category && <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{product.category.name}</span>}
        <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</h3>
        <Rating value={Number(product.avgRating)} count={product.reviewCount} />
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <span className="text-base font-bold text-slate-900">{formatCurrency(product.basePrice)}</span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">{formatCurrency(product.compareAtPrice!)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
