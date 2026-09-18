"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { LinkButton } from "@/components/ui/LinkButton";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/format";
import type { Address, Order } from "@/types";

const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;
const TAX_RATE = 0.08;

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { cart, isLoading: cartLoading, refresh: refreshCart } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | "new">("new");
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
  });
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash_on_delivery">("card");
  const [couponCode, setCouponCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    apiFetch<Address[]>("/api/addresses")
      .then((data) => {
        setAddresses(data);
        const defaultAddress = data.find((a) => a.isDefault);
        if (defaultAddress) setSelectedAddressId(defaultAddress.id);
      })
      .catch(() => {});
  }, [user]);

  async function handleApplyCoupon() {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponMessage(null);
    try {
      const result = await apiFetch<{ discount: number; description: string | null }>("/api/coupons/validate", {
        method: "POST",
        body: JSON.stringify({ code: couponCode.trim(), subtotal: cart.subtotal }),
      });
      setAppliedDiscount(result.discount);
      setCouponMessage(`Coupon applied: -${formatCurrency(result.discount)}`);
    } catch (error) {
      setAppliedDiscount(0);
      setCouponMessage(error instanceof ApiClientError ? error.message : "Invalid coupon");
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  const discountedSubtotal = Math.max(0, cart.subtotal - appliedDiscount);
  const shipping = discountedSubtotal === 0 || discountedSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = Number((discountedSubtotal * TAX_RATE).toFixed(2));
  const total = Number((discountedSubtotal + shipping + tax).toFixed(2));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    if (selectedAddressId === "new") {
      if (!newAddress.fullName || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postalCode) {
        setFormError("Please complete all required shipping address fields.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload =
        selectedAddressId === "new"
          ? { address: newAddress, paymentMethod, couponCode: couponCode || undefined }
          : { addressId: selectedAddressId, paymentMethod, couponCode: couponCode || undefined };

      const order = await apiFetch<Order>("/api/orders", { method: "POST", body: JSON.stringify(payload) });
      await refreshCart();
      showToast("Order placed successfully!", "success");
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (error) {
      setFormError(error instanceof ApiClientError ? error.message : "Could not place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (authLoading || cartLoading) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-500">Loading checkout...</div>;
  }

  if (!user) return null;

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Your cart is empty" description="Add some products before checking out." action={<LinkButton href="/shop">Shop Now</LinkButton>} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-black text-slate-950">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">Shipping Address</h2>
            <div className="mt-3 flex flex-col gap-3">
              {addresses.map((address) => (
                <label key={address.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selectedAddressId === address.id ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                  <input
                    type="radio"
                    name="address"
                    className="mt-1"
                    checked={selectedAddressId === address.id}
                    onChange={() => setSelectedAddressId(address.id)}
                  />
                  <div className="text-sm">
                    <p className="font-semibold text-slate-900">{address.fullName}</p>
                    <p className="text-slate-600">
                      {address.line1}, {address.city}, {address.state} {address.postalCode}, {address.country}
                    </p>
                    <p className="text-slate-500">{address.phone}</p>
                  </div>
                </label>
              ))}
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${selectedAddressId === "new" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                <input type="radio" name="address" className="mt-1" checked={selectedAddressId === "new"} onChange={() => setSelectedAddressId("new")} />
                <span className="text-sm font-semibold text-slate-900">Ship to a new address</span>
              </label>
            </div>

            {selectedAddressId === "new" && (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Full name" required value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
                <Input label="Phone" required value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} />
                <div className="sm:col-span-2">
                  <Input label="Address line 1" required value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <Input label="Address line 2 (optional)" value={newAddress.line2} onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })} />
                </div>
                <Input label="City" required value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
                <Input label="State / Province" required value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
                <Input label="Postal code" required value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} />
                <Input label="Country" required value={newAddress.country} onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })} />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Payment Method</h2>
            <div className="mt-3 flex flex-col gap-3">
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${paymentMethod === "card" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                <input type="radio" name="payment" checked={paymentMethod === "card"} onChange={() => setPaymentMethod("card")} />
                <span className="text-sm font-medium text-slate-900">Credit / Debit Card (simulated)</span>
              </label>
              <label className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${paymentMethod === "cash_on_delivery" ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                <input type="radio" name="payment" checked={paymentMethod === "cash_on_delivery"} onChange={() => setPaymentMethod("cash_on_delivery")} />
                <span className="text-sm font-medium text-slate-900">Cash on Delivery</span>
              </label>
              <p className="text-xs text-slate-500">
                This demo does not process real payments. Card payments are marked as paid immediately via a payment
                provider abstraction (see <code>src/server/services/payment.service.ts</code>).
              </p>
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {cart.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-slate-700">
                  {item.product.name} ({item.variant.color}/{item.variant.size}) × {item.quantity}
                </span>
                <span className="font-medium text-slate-900">{formatCurrency(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <Input placeholder="Coupon code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="flex-1" />
            <Button type="button" variant="outline" onClick={handleApplyCoupon} isLoading={isApplyingCoupon}>
              Apply
            </Button>
          </div>
          {couponMessage && <p className="mt-2 text-xs text-slate-600">{couponMessage}</p>}

          <dl className="mt-4 flex flex-col gap-2 border-t border-slate-300 pt-4 text-sm text-slate-700">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatCurrency(cart.subtotal)}</dd>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Discount</dt>
                <dd>-{formatCurrency(appliedDiscount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{shipping === 0 ? "Free" : formatCurrency(shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Estimated tax</dt>
              <dd>{formatCurrency(tax)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-slate-300 pt-3 text-base font-bold text-slate-950">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>

          {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

          <Button type="submit" size="lg" fullWidth className="mt-6" isLoading={isSubmitting}>
            Place Order
          </Button>
        </aside>
      </form>
    </div>
  );
}
