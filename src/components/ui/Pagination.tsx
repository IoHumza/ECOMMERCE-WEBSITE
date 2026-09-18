"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({ page, totalPages, basePath }: { page: number; totalPages: number; basePath: string }) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(targetPage));
    return `${basePath}?${params.toString()}`;
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium ${
          page === 1 ? "pointer-events-none opacity-40" : "hover:bg-slate-100"
        }`}
      >
        Prev
      </Link>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center gap-1.5">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">…</span>}
          <Link
            href={buildHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-[2.25rem] rounded-lg border px-3 py-2 text-center text-sm font-medium ${
              p === page ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 hover:bg-slate-100"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium ${
          page === totalPages ? "pointer-events-none opacity-40" : "hover:bg-slate-100"
        }`}
      >
        Next
      </Link>
    </nav>
  );
}
