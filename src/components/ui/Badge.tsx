import { cn } from "../../lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "silver" | "bronze" | "spud" | "correct" | "incorrect" | "pending";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-slate-700 text-slate-300",
  gold: "bg-gold-500/20 text-gold-400 border border-gold-500/30",
  silver: "bg-slate-400/20 text-slate-300 border border-slate-400/30",
  bronze: "bg-amber-700/20 text-amber-500 border border-amber-700/30",
  spud: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
  correct: "bg-emerald-500/20 text-emerald-400",
  incorrect: "bg-rose-500/20 text-rose-400",
  pending: "bg-slate-600/20 text-slate-400",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
