export function Rating({ value, count, size = "sm" }: { value: number; count?: number; size?: "sm" | "md" }) {
  const stars = [0, 1, 2, 3, 4];
  const starSize = size === "md" ? "text-lg" : "text-sm";
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <div className={`flex ${starSize} text-amber-500`} aria-hidden="true">
        {stars.map((i) => {
          const filled = value >= i + 1;
          const half = !filled && value > i && value < i + 1;
          return (
            <span key={i}>
              {filled ? "★" : half ? "⯨" : "☆"}
            </span>
          );
        })}
      </div>
      {typeof count === "number" && <span className="text-xs text-slate-500">({count})</span>}
    </div>
  );
}
