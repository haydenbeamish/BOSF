import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { cn } from "../../lib/cn";
import type { LeaderboardEntry } from "../../types";

interface RankRowProps {
  entry: LeaderboardEntry;
  isSpud: boolean;
  index: number;
  totalEntries: number;
}

export function RankRow({ entry, isSpud, index }: RankRowProps) {
  const navigate = useNavigate();
  const winRate = entry.total_predictions > 0
    ? Math.round((entry.correct_predictions / entry.total_predictions) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + index * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => navigate(`/player/${entry.id}`)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-200",
        "border border-surface-200/30 bg-surface-50/40",
        "active:scale-[0.98] hover:bg-surface-100/60 hover:border-surface-300/40",
        isSpud && "border-red-500/15 bg-red-500/[0.03]"
      )}
    >
      {/* Rank */}
      <div className="w-7 flex items-center justify-center shrink-0">
        <span className={cn(
          "font-display font-extrabold text-sm",
          entry.rank <= 3 ? "text-amber-400" : isSpud ? "text-red-400" : "text-surface-500"
        )}>
          {entry.rank}
        </span>
      </div>

      {/* Avatar */}
      <Avatar name={entry.name} id={entry.id} size="md" />

      {/* Name + win rate */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-display font-bold text-sm text-zinc-100 truncate">
            {entry.name}
          </span>
          {isSpud && (
            <span className="text-[10px]" role="img" aria-label="last place">{"\u{1F954}"}</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px] text-surface-500">
            {entry.correct_predictions}/{entry.total_predictions} correct
          </span>
          <span className="text-[11px] text-surface-400">&middot;</span>
          <span className={cn("text-[11px] font-semibold", winRate >= 50 ? "text-accent" : "text-surface-500")}>
            {winRate}%
          </span>
        </div>
      </div>

      {/* Points */}
      <div className="text-right shrink-0 mr-1">
        <span className={cn(
          "font-display font-extrabold text-base tabular-nums",
          entry.rank === 1 ? "text-amber-400" : isSpud ? "text-red-400" : "text-zinc-200"
        )}>
          {entry.total_points}
        </span>
        <p className="text-[9px] font-semibold uppercase tracking-wider text-surface-500">pts</p>
      </div>

      <ChevronRight size={14} className="text-surface-400 shrink-0" />
    </motion.div>
  );
}
