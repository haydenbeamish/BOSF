import { cn } from "../../lib/cn";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "gold" | "loss" | "void" | "outline";
  size?: "sm" | "md";
  className?: string;
}

const variants: Record<string, string> = {
  default: "bg-surface-200/50 text-surface-600",
  accent: "bg-accent/10 text-accent border border-accent/20",
  gold: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  loss: "bg-red-500/10 text-red-400 border border-red-500/20",
  void: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
  outline: "border border-surface-300 text-surface-600",
};

export function Badge({ children, variant = "default", size = "sm", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
