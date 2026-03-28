import { cn } from "../../lib/cn";

interface FormGuideProps {
  /** Array of recent results, most recent first. true = win, false = loss. */
  results: boolean[];
  /** Max results to display (default 5) */
  limit?: number;
  /** Size variant */
  size?: "sm" | "md";
  /** Show W/L labels under dots */
  showLabels?: boolean;
  className?: string;
}

export function FormGuide({ results, limit = 5, size = "sm", showLabels = false, className }: FormGuideProps) {
  const form = results.slice(0, limit);

  if (form.length === 0) return null;

  const dotSize = size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5";
  const gap = size === "sm" ? "gap-1" : "gap-1.5";

  return (
    <div className={cn("flex items-center", gap, className)}>
      {form.map((won, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={cn(
              dotSize,
              "rounded-full transition-colors",
              won
                ? "bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.4)]"
                : "bg-red-400 shadow-[0_0_4px_rgba(248,113,113,0.3)]"
            )}
            title={`${won ? "W" : "L"} (${i === 0 ? "latest" : `${i + 1} ago`})`}
          />
          {showLabels && (
            <span className={cn(
              "text-[8px] font-bold mt-0.5",
              won ? "text-emerald-600" : "text-red-400"
            )}>
              {won ? "W" : "L"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
