"use client";

import { useState, type FormEvent } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@")) return;
    // In production this would call an email marketing provider via
    // EMAIL_API_KEY. We acknowledge locally to keep the flow functional.
    setSubmitted(true);
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex max-w-sm gap-2">
      <label htmlFor="newsletter-email" className="sr-only">
        Email address
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email address"
        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-slate-400"
      />
      <button type="submit" className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
        {submitted ? "Thanks!" : "Subscribe"}
      </button>
    </form>
  );
}
