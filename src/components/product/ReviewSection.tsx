"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/Button";
import { Textarea, Input } from "@/components/ui/Input";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { apiFetch, ApiClientError } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import type { Review } from "@/types";

export function ReviewSection({ productId, initialReviews }: { productId: number; initialReviews: Review[] }) {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!user) {
      router.push("/login");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({ productId, rating, title, body }),
      });
      setReviews((prev) => [{ id: Date.now(), rating, title, body, createdAt: new Date().toISOString(), userName: user.name }, ...prev]);
      setTitle("");
      setBody("");
      setShowForm(false);
      showToast("Thanks for your review!", "success");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Could not submit review");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-16 border-t border-slate-200 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-950">Customer Reviews ({reviews.length})</h2>
        <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Write a review"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <fieldset>
            <legend className="text-sm font-semibold text-slate-900">Your rating</legend>
            <div className="mt-2 flex gap-1" role="radiogroup" aria-label="Select a rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={rating === value}
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                  className={`text-2xl ${value <= rating ? "text-amber-500" : "text-slate-300"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-4">
            <Input label="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
          </div>
          <div className="mt-4">
            <Textarea
              label="Your review"
              required
              minLength={5}
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <Button type="submit" className="mt-4" isLoading={isSubmitting}>
            Submit Review
          </Button>
        </form>
      )}

      <div className="mt-8 flex flex-col gap-6">
        {reviews.length === 0 && <p className="text-sm text-slate-600">No reviews yet. Be the first to share your thoughts!</p>}
        {reviews.map((review) => (
          <article key={review.id} className="border-b border-slate-100 pb-6">
            <div className="flex items-center justify-between">
              <Rating value={review.rating} />
              <time className="text-xs text-slate-500" dateTime={String(review.createdAt)}>
                {formatDate(review.createdAt)}
              </time>
            </div>
            {review.title && <h3 className="mt-2 text-sm font-semibold text-slate-900">{review.title}</h3>}
            <p className="mt-1 text-sm text-slate-700">{review.body}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">— {review.userName}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
