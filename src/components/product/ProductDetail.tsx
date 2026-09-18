"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Rating } from "@/components/ui/Rating";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { WishlistButton } from "./WishlistButton";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ApiClientError } from "@/lib/api-client";
import type { Product } from "@/types";

export function ProductDetail({ product }: { product: Product }) {
  const variants = product.variants ?? [];
  const colors = useMemo(() => Array.from(new Set(variants.map((v) => v.color))), [variants]);
  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const sizesForColor = useMemo(
    () => variants.filter((v) => v.color === selectedColor).map((v) => v.size),
    [variants, selectedColor]
  );
  const [selectedSize, setSelectedSize] = useState(sizesForColor[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  const selectedVariant = variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
  const price = Number(selectedVariant?.priceOverride ?? product.basePrice);
  const hasDiscount = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const maxQuantity = selectedVariant ? Math.min(selectedVariant.stock, 10) : 0;

  function handleColorChange(color: string) {
    setSelectedColor(color);
    const nextSizes = variants.filter((v) => v.color === color).map((v) => v.size);
    setSelectedSize(nextSizes[0] ?? "");
    setQuantity(1);
  }

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setIsAdding(true);
    try {
      await addItem(selectedVariant.id, quantity);
      showToast("Added to cart", "success");
    } catch (error) {
      showToast(error instanceof ApiClientError ? error.message : "Could not add to cart", "error");
    } finally {
      setIsAdding(false);
    }
  }

  const images = product.images.length ? product.images : [];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
          {images[activeImage] && (
            <Image
              src={images[activeImage].url}
              alt={images[activeImage].altText ?? product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={activeImage === index}
                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 ${activeImage === index ? "border-slate-900" : "border-transparent"}`}
              >
                <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {product.category && <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{product.category.name}</p>}
        <h1 className="mt-1 text-3xl font-black text-slate-950">{product.name}</h1>
        {product.brand && <p className="mt-1 text-sm text-slate-600">by {product.brand}</p>}

        <div className="mt-3 flex items-center gap-3">
          <Rating value={Number(product.avgRating)} count={product.reviewCount} size="md" />
          {product.isNewArrival && <Badge tone="dark">New Arrival</Badge>}
        </div>

        <div className="mt-5 flex items-baseline gap-3">
          <span className="text-3xl font-bold text-slate-950">{formatCurrency(price)}</span>
          {hasDiscount && <span className="text-lg text-slate-400 line-through">{formatCurrency(product.compareAtPrice!)}</span>}
        </div>

        {product.shortDescription && <p className="mt-4 text-slate-700">{product.shortDescription}</p>}

        {colors.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-semibold text-slate-900">Color: <span className="font-normal text-slate-600">{selectedColor}</span></p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Select color">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={selectedColor === color}
                  onClick={() => handleColorChange(color)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${
                    selectedColor === color ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        {sizesForColor.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-semibold text-slate-900">Size: <span className="font-normal text-slate-600">{selectedSize}</span></p>
            <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Select size">
              {sizesForColor.map((size) => {
                const variant = variants.find((v) => v.color === selectedColor && v.size === size);
                const outOfStock = !variant || variant.stock === 0;
                return (
                  <button
                    key={size}
                    type="button"
                    role="radio"
                    aria-checked={selectedSize === size}
                    disabled={outOfStock}
                    onClick={() => {
                      setSelectedSize(size);
                      setQuantity(1);
                    }}
                    className={`relative rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
                      selectedSize === size ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {size}
                    {outOfStock && <span className="sr-only"> (out of stock)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center gap-4">
          <label htmlFor="quantity" className="text-sm font-semibold text-slate-900">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            disabled={!inStock}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 disabled:opacity-50"
          >
            {Array.from({ length: Math.max(1, maxQuantity) }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {selectedVariant && (
            <span className={`text-sm ${inStock ? "text-emerald-700" : "text-red-600"}`}>
              {inStock ? `${selectedVariant.stock} in stock` : "Out of stock"}
            </span>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button size="lg" onClick={handleAddToCart} disabled={!inStock} isLoading={isAdding}>
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
          <WishlistButton productId={product.id} />
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6">
          <h2 className="text-lg font-semibold text-slate-900">Product Details</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description}</p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="font-semibold text-slate-900">SKU</dt>
              <dd className="text-slate-600">{selectedVariant?.sku ?? product.sku}</dd>
            </div>
            {product.brand && (
              <div>
                <dt className="font-semibold text-slate-900">Brand</dt>
                <dd className="text-slate-600">{product.brand}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}
