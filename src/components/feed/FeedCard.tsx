import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";
import type { FeedItem } from "../../lib/newsfeed";

// High-impact types get stronger visual treatment
const HIGH_IMPACT_TYPES = new Set(["everyone_wrong", "perfect_pick", "close_race", "winning_streak"]);

const TYPE_STYLES: Record<string, { bg: string; border: string; accent: string; glow?: string }> = {
  event_result: {
    bg: "bg-emerald-50/60",
    border: "border-emerald-200/40",
    accent: "text-emerald-700",
  },
  perfect_pick: {
    bg: "bg-amber-50/80",
    border: "border-amber-300/50",
    accent: "text-amber-700",
    glow: "shadow-[0_0_16px_rgba(217,119,6,0.1)]",
  },
  everyone_wrong: {
    bg: "bg-red-50/80",
    border: "border-red-300/50",
    accent: "text-red-600",
    glow: "shadow-[0_0_16px_rgba(220,38,38,0.1)]",
  },
  winning_streak: {
    bg: "bg-orange-50/80",
    border: "border-orange-300/50",
    accent: "text-orange-700",
    glow: "shadow-[0_0_16px_rgba(234,88,12,0.08)]",
  },
  losing_streak: {
    bg: "bg-red-50/50",
    border: "border-red-200/30",
    accent: "text-red-600",
  },
  outlier_alert: {
    bg: "bg-violet-50/60",
    border: "border-violet-200/40",
    accent: "text-violet-700",
  },
  close_race: {
    bg: "bg-amber-50/80",
    border: "border-amber-300/50",
    accent: "text-amber-700",
    glow: "shadow-[0_0_16px_rgba(217,119,6,0.08)]",
  },
  hot_take: {
    bg: "bg-sky-50/60",
    border: "border-sky-200/40",
    accent: "text-sky-700",
  },
  odds_alert: {
    bg: "bg-blue-50/60",
    border: "border-blue-200/40",
    accent: "text-blue-700",
  },
  contrarian_pick: {
    bg: "bg-fuchsia-50/60",
    border: "border-fuchsia-200/40",
    accent: "text-fuchsia-700",
  },
  underdog_backer: {
    bg: "bg-teal-50/60",
    border: "border-teal-200/40",
    accent: "text-teal-700",
  },
};

interface FeedCardProps {
  item: FeedItem;
  index: number;
}

export function FeedCard({ item, index }: FeedCardProps) {
  const navigate = useNavigate();
  const styles = TYPE_STYLES[item.type] ?? TYPE_STYLES.event_result;
  const isHighImpact = HIGH_IMPACT_TYPES.has(item.type);

  const handleClick = () => {
    if (item.eventId) {
      navigate(`/events/${item.eventId}`);
    } else if (item.playerId) {
      navigate(`/player/${item.playerId}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
      aria-label={item.headline}
      className={cn(
        "rounded-2xl border cursor-pointer transition-all duration-200",
        "hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]",
        isHighImpact ? "p-5 border-2" : "p-4",
        styles.bg,
        styles.border,
        styles.glow
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("leading-none mt-0.5 shrink-0", isHighImpact ? "text-2xl" : "text-xl")}>{item.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-display font-bold leading-snug",
            isHighImpact ? "text-[15px]" : "text-sm",
            styles.accent
          )}>
            {item.headline}
          </p>
          <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">
            {item.subtext}
          </p>
          {item.sport && (
            <span className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-400 bg-zinc-100 rounded-full px-2 py-0.5">
              {item.sport}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
