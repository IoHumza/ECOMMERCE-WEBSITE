"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { Address } from "@/types";

const EMPTY_FORM = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "", postalCode: "", country: "United States", isDefault: false };

export default function AddressesPage() {
  const { user, isLoading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?redirect=/account/addresses");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      apiFetch<Address[]>("/api/addresses").then(setAddresses).catch(() => {});
    }
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      const created = await apiFetch<Address>("/api/addresses", { method: "POST", body: JSON.stringify(form) });
      setAddresses((prev) => [created, ...prev.map((a) => (created.isDefault ? { ...a, isDefault: false } : a))]);
      setForm(EMPTY_FORM);
      setShowForm(false);
      showToast("Address added", "success");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not save address");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await apiFetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      showToast("Address removed", "info");
    } catch (err) {
      showToast(err instanceof ApiClientError ? err.message : "Could not delete address", "error");
    }
  }

  if (isLoading || !user) return <p className="text-sm text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Saved Addresses</h2>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Add new address"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-2">
          <Input label="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <Input label="Phone" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <div className="sm:col-span-2">
            <Input label="Address line 1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Input label="Address line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
          </div>
          <Input label="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <Input label="State / Province" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <Input label="Postal code" required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
          <Input label="Country" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-slate-800 sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Set as default address
          </label>
          {error && (
            <p className="text-sm text-red-600 sm:col-span-2" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" isLoading={isSaving} className="self-start sm:col-span-2">
            Save Address
          </Button>
        </form>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.length === 0 && !showForm && (
          <div className="sm:col-span-2">
            <EmptyState title="No saved addresses" description="Add an address to speed up checkout next time." icon="📍" />
          </div>
        )}
        {addresses.map((address) => (
          <div key={address.id} className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-slate-900">{address.fullName}</p>
              {address.isDefault && <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">Default</span>}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}, {address.country}
            </p>
            <p className="mt-1 text-sm text-slate-500">{address.phone}</p>
            <button type="button" onClick={() => handleDelete(address.id)} className="mt-3 text-sm font-medium text-red-600 underline hover:text-red-700">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
