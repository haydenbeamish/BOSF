import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      className={cn("rounded-2xl bg-zinc-100 skeleton-shimmer", className)}
    >
      <span className="sr-only">Loading…</span>
    </div>
  );
}
