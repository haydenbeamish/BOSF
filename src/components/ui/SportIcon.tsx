import { getCategoryInfo } from "../../lib/categories";
import { cn } from "../../lib/cn";

export function SportIcon({ sport, className }: { sport: string; className?: string }) {
  const info = getCategoryInfo(sport);
  return (
    <span className={cn("text-base", info.color, className)} role="img" aria-label={info.label}>
      {info.emoji}
    </span>
  );
}
