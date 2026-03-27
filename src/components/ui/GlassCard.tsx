import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: "accent" | "gold" | "loss" | null;
}

export function GlassCard({ children, className, hover = false, glow = null, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-surface-200/50 bg-surface-50/80 backdrop-blur-sm",
        hover && "cursor-pointer transition-all duration-200 active:scale-[0.98] hover:bg-surface-100/80 hover:border-surface-300/50",
        glow === "accent" && "border-accent/20 shadow-[0_0_15px_rgba(34,197,94,0.08)]",
        glow === "gold" && "border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.08)]",
        glow === "loss" && "border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.08)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
