import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Flame } from "lucide-react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { Podium } from "../components/leaderboard/Podium";
import { RankRow } from "../components/leaderboard/RankRow";
import { SpudBanner } from "../components/leaderboard/SpudBanner";
import { StatCard } from "../components/ui/StatCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";

export function LeaderboardPage() {
  const { entries, spud, loading, error } = useLeaderboard();
  const navigate = useNavigate();

  if (error) {
    return (
      <EmptyState
        icon={<Trophy size={28} />}
        title="Couldn't load standings"
        description={error}
      />
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-3">
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-24 flex-1" />
          <Skeleton className="h-24 flex-1" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<Trophy size={28} />}
        title="No standings yet"
        description="Results will appear here once events start getting decided. Stay tuned."
      />
    );
  }

  const totalCorrect = entries.reduce((s, e) => s + e.correct_predictions, 0);
  const totalPredictions = entries.reduce((s, e) => s + e.total_predictions, 0);
  const groupWinRate = totalPredictions > 0 ? Math.round((totalCorrect / totalPredictions) * 100) : 0;
  const topScore = entries[0]?.total_points ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4">
        <StatCard
          label="Punters"
          value={entries.length}
          icon={<Trophy size={14} />}
          delay={0}
        />
        <StatCard
          label="Win Rate"
          value={`${groupWinRate}%`}
          icon={<Target size={14} />}
          accent={groupWinRate >= 50 ? "accent" : "default"}
          delay={0.05}
        />
        <StatCard
          label="Top Score"
          value={topScore}
          icon={<Flame size={14} />}
          accent="gold"
          delay={0.1}
        />
      </div>

      {/* Podium */}
      <Podium entries={entries} onSelect={(id) => navigate(`/player/${id}`)} />

      {/* Spud */}
      {spud && <SpudBanner spud={spud} />}

      {/* Rest of rankings */}
      <div className="px-4 mt-2">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 px-1">
          Full Standings
        </h3>
        <div className="flex flex-col gap-2">
          {entries.slice(3).map((entry, i) => (
            <RankRow
              key={entry.id}
              entry={entry}
              isSpud={spud?.id === entry.id}
              index={i}
              totalEntries={entries.length}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
