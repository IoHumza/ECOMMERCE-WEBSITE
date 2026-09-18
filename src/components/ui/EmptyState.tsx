import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
  icon = "🛒",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-16 text-center">
      <span className="text-4xl" aria-hidden="true">
        {icon}
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-slate-600">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
