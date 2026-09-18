"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { apiFetch, ApiClientError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) });
      await refresh();
      await refreshCart();
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not create account");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-black text-slate-950">Create your account</h1>
      <p className="mt-2 text-sm text-slate-600">Join Luxora to track orders, save favorites, and check out faster.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Input label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          hint="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-slate-950 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
