import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Calendar, TrendingUp, ChevronRight, Zap } from "lucide-react";
import { getStats, getEvents } from "../data/api";
import { GlassCard } from "../components/ui/GlassCard";
import { StatCard } from "../components/ui/StatCard";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import type { StatsOverview, CompetitionEvent } from "../types";

export function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsOverview | null>(null);
  const [recentEvents, setRecentEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getStats(), getEvents()])
      .then(([statsData, eventsData]) => {
        if (cancelled) return;
        setStats(statsData);
        // Show most recent completed + upcoming events
        const decided = eventsData.filter((e) => e.status === "completed").slice(-5).reverse();
        const upcoming = eventsData.filter((e) => e.status !== "completed").slice(0, 5);
        setRecentEvents([...decided, ...upcoming].slice(0, 8));
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <EmptyState
        icon={<Zap size={28} />}
        title="Couldn't load dashboard"
        description={error}
      />
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <div className="grid grid-cols-2 gap-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  const leaderboard = stats?.leaderboard ?? [];
  const leader = leaderboard[0];
  const completedCount = stats?.completed_events ?? 0;
  const totalCount = stats?.total_events ?? 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* Welcome header */}
      <div className="px-4 pt-5 pb-4">
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display font-extrabold text-xl text-zinc-100"
        >
          BOSF
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-sm text-surface-500 mt-0.5"
        >
          Punting Leaderboard &middot; {totalCount} events
        </motion.p>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-2 px-4 mb-4">
        <StatCard
          label="Decided"
          value={`${completedCount}/${totalCount}`}
          icon={<Target size={14} />}
          delay={0.05}
        />
        <StatCard
          label="Progress"
          value={`${progress}%`}
          icon={<TrendingUp size={14} />}
          accent={progress > 50 ? "accent" : "default"}
          delay={0.1}
        />
        <StatCard
          label="Remaining"
          value={totalCount - completedCount}
          icon={<Calendar size={14} />}
          delay={0.15}
        />
        <StatCard
          label="Punters"
          value={leaderboard.length}
          icon={<Trophy size={14} />}
          delay={0.2}
        />
      </div>

      {/* Leader card */}
      {leader && (
        <div className="px-4 mb-4">
          <GlassCard
            glow="gold"
            className="p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={leader.name} id={leader.id} size="lg" ringColor="gold" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    Current Leader
                  </span>
                  <Trophy size={12} className="text-amber-400" />
                </div>
                <p className="font-display font-extrabold text-lg text-zinc-100 truncate mt-0.5">
                  {leader.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-display font-extrabold text-gradient-gold">
                    {leader.total_points} pts
                  </span>
                  <span className="text-xs text-surface-500">
                    {leader.correct_predictions} correct
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/leaderboard")}
                className="p-2 rounded-xl bg-surface-100 text-surface-500 active:scale-95 transition-transform"
                aria-label="View leaderboard"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Quick leaderboard preview */}
      {leaderboard.length > 1 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
              Top 5
            </h2>
            <button
              onClick={() => navigate("/leaderboard")}
              className="text-[11px] font-semibold text-accent"
            >
              View all
            </button>
          </div>
          <GlassCard className="divide-y divide-surface-200/30">
            {leaderboard.slice(0, 5).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                onClick={() => navigate(`/player/${entry.id}`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-surface-100/50 transition-colors"
              >
                <span className="font-display font-extrabold text-xs text-surface-500 w-5 text-center">
                  {entry.rank}
                </span>
                <Avatar name={entry.name} id={entry.id} size="sm" />
                <span className="font-display font-bold text-sm text-zinc-200 flex-1 truncate">
                  {entry.name}
                </span>
                <span className="font-display font-extrabold text-sm tabular-nums text-zinc-300">
                  {entry.total_points}
                </span>
              </motion.div>
            ))}
          </GlassCard>
        </div>
      )}

      {/* Recent events */}
      {recentEvents.length > 0 && (
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-surface-500">
              Recent Events
            </h2>
            <button
              onClick={() => navigate("/bets")}
              className="text-[11px] font-semibold text-accent"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {recentEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.03 }}
                onClick={() => navigate(`/events/${evt.id}`)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-surface-200/30 bg-surface-50/40 cursor-pointer active:scale-[0.98] hover:bg-surface-100/50 transition-all"
              >
                <SportIcon sport={evt.sport} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{evt.event_name}</p>
                  {evt.correct_answer && (
                    <p className="text-xs text-accent truncate mt-0.5">{evt.correct_answer}</p>
                  )}
                </div>
                <StatusPill status={evt.status} />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
