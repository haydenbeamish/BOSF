import { motion } from "framer-motion";
import type { LeaderboardEntry } from "../../types";

export function SpudBanner({ spud }: { spud: LeaderboardEntry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3 flex items-center gap-3"
    >
      <span className="text-2xl" role="img" aria-label="potato">
        {"\u{1F954}"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
          The Spud
        </p>
        <p className="text-sm text-orange-300 font-semibold truncate">
          {spud.name} &mdash; {spud.total_points} pts
        </p>
      </div>
      <span className="text-2xl" role="img" aria-label="potato">
        {"\u{1F954}"}
      </span>
    </motion.div>
  );
}
