import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import type { LeaderboardEntry } from "../../types";

function getRankDisplay(rank: number) {
  if (rank === 1) return { icon: "\u{1F947}", bg: "bg-gold-500/10 border-gold-500/20" };
  if (rank === 2) return { icon: "\u{1F948}", bg: "bg-slate-400/10 border-slate-400/20" };
  if (rank === 3) return { icon: "\u{1F949}", bg: "bg-amber-700/10 border-amber-700/20" };
  return { icon: null, bg: "bg-slate-800/50 border-slate-700/30" };
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

const avatarColors = [
  "bg-rose-500/30 text-rose-300",
  "bg-blue-500/30 text-blue-300",
  "bg-emerald-500/30 text-emerald-300",
  "bg-purple-500/30 text-purple-300",
  "bg-cyan-500/30 text-cyan-300",
  "bg-orange-500/30 text-orange-300",
  "bg-pink-500/30 text-pink-300",
  "bg-teal-500/30 text-teal-300",
  "bg-indigo-500/30 text-indigo-300",
  "bg-amber-500/30 text-amber-300",
  "bg-lime-500/30 text-lime-300",
  "bg-fuchsia-500/30 text-fuchsia-300",
  "bg-sky-500/30 text-sky-300",
  "bg-red-500/30 text-red-300",
];

interface PlayerRowProps {
  entry: LeaderboardEntry;
  isSpud: boolean;
  index: number;
}

export function PlayerRow({ entry, isSpud, index }: PlayerRowProps) {
  const navigate = useNavigate();
  const { icon, bg } = getRankDisplay(entry.rank);
  const colorIndex = Math.abs(entry.id) % avatarColors.length;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={() => navigate(`/player/${entry.id}`)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 border rounded-xl cursor-pointer transition-all active:scale-[0.98]",
        bg,
        isSpud && "border-orange-500/30 bg-orange-500/5"
      )}
    >
      {/* Rank */}
      <div className="flex items-center justify-center w-8 shrink-0">
        {icon ? (
          <span className="text-xl">{icon}</span>
        ) : (
          <span className={cn(
            "text-sm font-bold",
            isSpud ? "text-orange-400" : "text-slate-500"
          )}>
            {entry.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div
        className={cn(
          "flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold shrink-0",
          avatarColors[colorIndex]
        )}
      >
        {getInitial(entry.name)}
      </div>

      {/* Name + stats */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-100 truncate">
            {entry.name}
          </span>
          {isSpud && <span className="text-sm" role="img" aria-label="last place">{"\u{1F954}"}</span>}
        </div>
        <p className="text-xs text-slate-500">
          {entry.correct_predictions} correct of {entry.total_predictions}
        </p>
      </div>

      {/* Points */}
      <div className="text-right shrink-0">
        <span className={cn(
          "text-lg font-bold tabular-nums",
          entry.rank === 1 ? "text-gold-400" : isSpud ? "text-orange-400" : "text-slate-200"
        )}>
          {entry.total_points}
        </span>
        <p className="text-[10px] text-slate-500 uppercase tracking-wider">pts</p>
      </div>

      {/* Chevron */}
      <svg className="w-4 h-4 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </motion.div>
  );
}
