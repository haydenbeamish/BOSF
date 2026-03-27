import { cn } from "../../lib/cn";

const colorPairs = [
  { bg: "bg-rose-500/20", text: "text-rose-300", ring: "ring-rose-500/30" },
  { bg: "bg-blue-500/20", text: "text-blue-300", ring: "ring-blue-500/30" },
  { bg: "bg-emerald-500/20", text: "text-emerald-300", ring: "ring-emerald-500/30" },
  { bg: "bg-purple-500/20", text: "text-purple-300", ring: "ring-purple-500/30" },
  { bg: "bg-cyan-500/20", text: "text-cyan-300", ring: "ring-cyan-500/30" },
  { bg: "bg-orange-500/20", text: "text-orange-300", ring: "ring-orange-500/30" },
  { bg: "bg-pink-500/20", text: "text-pink-300", ring: "ring-pink-500/30" },
  { bg: "bg-teal-500/20", text: "text-teal-300", ring: "ring-teal-500/30" },
  { bg: "bg-indigo-500/20", text: "text-indigo-300", ring: "ring-indigo-500/30" },
  { bg: "bg-amber-500/20", text: "text-amber-300", ring: "ring-amber-500/30" },
  { bg: "bg-lime-500/20", text: "text-lime-300", ring: "ring-lime-500/30" },
  { bg: "bg-fuchsia-500/20", text: "text-fuchsia-300", ring: "ring-fuchsia-500/30" },
  { bg: "bg-sky-500/20", text: "text-sky-300", ring: "ring-sky-500/30" },
  { bg: "bg-red-500/20", text: "text-red-300", ring: "ring-red-500/30" },
];

interface AvatarProps {
  name: string;
  id: number;
  size?: "sm" | "md" | "lg" | "xl";
  showRing?: boolean;
  ringColor?: "accent" | "gold" | "silver" | "bronze" | null;
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
  xl: "w-16 h-16 text-lg",
};

const ringColors = {
  accent: "ring-2 ring-accent/50",
  gold: "ring-2 ring-amber-400/60",
  silver: "ring-2 ring-zinc-400/50",
  bronze: "ring-2 ring-amber-600/50",
};

export function Avatar({ name, id, size = "md", showRing = false, ringColor = null, className }: AvatarProps) {
  const pair = colorPairs[Math.abs(id) % colorPairs.length];
  const initial = name.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-display font-bold shrink-0",
        pair.bg, pair.text,
        sizes[size],
        showRing && pair.ring,
        ringColor && ringColors[ringColor],
        className
      )}
    >
      {initial}
    </div>
  );
}
