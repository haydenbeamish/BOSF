import { motion } from "framer-motion";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { LeaderboardList } from "../components/leaderboard/LeaderboardList";
import { SpudBanner } from "../components/leaderboard/SpudBanner";
import { Skeleton } from "../components/ui/Skeleton";

export function LeaderboardPage() {
  const { entries, spud, loading, error } = useLeaderboard();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4">{"\u{1F6AB}"}</p>
        <p className="text-slate-400 text-sm">Failed to load leaderboard</p>
        <p className="text-slate-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Stats bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <h2 className="text-base font-bold text-slate-200">Standings</h2>
          <p className="text-xs text-slate-500">{entries.length} punters</p>
        </div>
        {entries.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-slate-500">Leader</p>
            <p className="text-sm font-bold text-gold-400">{entries[0].name}</p>
          </div>
        )}
      </div>

      {spud && <SpudBanner spud={spud} />}
      <LeaderboardList entries={entries} />

      <div className="h-24" />
    </motion.div>
  );
}
