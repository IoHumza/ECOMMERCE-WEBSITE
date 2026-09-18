import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Product } from "@/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your filters or search terms." icon="🔍" />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
