"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { useCart } from "@/components/providers/CartProvider";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { AuthUser } from "@/types";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const { refresh: refreshCart } = useCart();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const data = await apiFetch<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      await refreshCart();
      const redirect = searchParams.get("redirect");
      router.push(redirect || (data.user.role === "admin" ? "/admin" : "/account"));
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not sign in");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-black text-slate-950">Sign in to Luxora</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome back! Enter your details to continue.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
        <Input label="Email address" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm font-medium text-slate-600 hover:text-slate-950">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-slate-950 underline">
          Create one
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Demo credentials</p>
        <p>Admin: admin@luxora.dev / Admin123!</p>
        <p>Customer: jane@example.com / Customer123!</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
