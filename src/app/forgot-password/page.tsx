"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// NOTE: This demonstrates the password-reset request flow and UX. Wiring it
// to an actual email delivery provider only requires adding an
// /api/auth/forgot-password route that issues a signed, time-limited reset
// token and sends it via the EMAIL_API_KEY-backed email service.
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitting(false);
    setSubmitted(true);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-black text-slate-950">Reset your password</h1>
      <p className="mt-2 text-sm text-slate-600">Enter your email and we&apos;ll send you a link to reset your password.</p>

      {submitted ? (
        <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4" noValidate>
          <Input label="Email address" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button type="submit" size="lg" fullWidth isLoading={isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        Remembered your password?{" "}
        <Link href="/login" className="font-semibold text-slate-950 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
