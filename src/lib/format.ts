export function formatCurrency(value: number | string): string {
  const number = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    Number.isFinite(number) ? number : 0
  );
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "short", day: "numeric" }).format(date);
}

export function formatOrderStatus(status: string): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
