import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Zap, Newspaper, Target, Flame } from "lucide-react";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { useEvents } from "../hooks/useEvents";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { Podium } from "../components/leaderboard/Podium";

export function DashboardPage() {
  const navigate = useNavigate();
  const { feed, leaderboard, loading, error } = useNewsFeed();
  const {
    allEvents,
    loading: eventsLoading,
  } = useEvents();

  if (error) {
    return (
      <EmptyState
        icon={<Zap size={28} />}
        title="Couldn't load dashboard"
        description={error}
      />
    );
  }

  if (loading || eventsLoading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const leader = leaderboard[0];
  const completedEvents = allEvents.filter((e) => e.status === "completed").length;
  const totalEvents = allEvents.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-4 mt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-zinc-200/60 bg-white p-3 text-center shadow-sm"
        >
          <div className="flex justify-center mb-1 text-zinc-400"><Trophy size={12} /></div>
          <p className="font-display font-extrabold text-lg text-zinc-900">{leaderboard.length}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Punters</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-zinc-200/60 bg-white p-3 text-center shadow-sm"
        >
          <div className="flex justify-center mb-1 text-zinc-400"><Target size={12} /></div>
          <p className="font-display font-extrabold text-lg text-emerald-600">{completedEvents}/{totalEvents}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Decided</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-zinc-200/60 bg-white p-3 text-center shadow-sm"
        >
          <div className="flex justify-center mb-1 text-zinc-400"><Flame size={12} /></div>
          <p className="font-display font-extrabold text-lg text-gradient-gold">{leader?.total_points ?? 0}</p>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">Top Score</p>
        </motion.div>
      </div>

      {/* Podium - Top 3 */}
      {leaderboard.length >= 3 && (
        <Podium entries={leaderboard} onSelect={(id) => navigate(`/player/${id}`)} />
      )}

      {/* Top 5 quick leaderboard (below podium) */}
      {leaderboard.length > 3 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Full Standings
            </h2>
            <button
              onClick={() => navigate("/leaderboard")}
              className="text-[11px] font-semibold text-emerald-600"
            >
              View all
            </button>
          </div>
          <GlassCard className="divide-y divide-zinc-100">
            {leaderboard.slice(3, 8).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                onClick={() => navigate(`/player/${entry.id}`)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-zinc-50 transition-colors"
              >
                <span className="font-display font-extrabold text-xs text-zinc-400 w-5 text-center">
                  {entry.rank}
                </span>
                <Avatar name={entry.name} id={entry.id} size="sm" />
                <span className="font-display font-bold text-sm text-zinc-800 flex-1 truncate">
                  {entry.name}
                </span>
                <span className="font-display font-extrabold text-sm tabular-nums text-zinc-600">
                  {entry.total_points}
                </span>
              </motion.div>
            ))}
          </GlassCard>
        </div>
      )}

      {/* If less than 3 for podium, show the old leader card */}
      {leaderboard.length > 0 && leaderboard.length < 3 && leader && (
        <div className="px-4 mb-6">
          <GlassCard
            glow="gold"
            className="p-4 mb-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={leader.name} id={leader.id} size="lg" ringColor="gold" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                    Current Leader
                  </span>
                  <Trophy size={12} className="text-amber-600" />
                </div>
                <p className="font-display font-extrabold text-lg text-zinc-900 truncate mt-0.5">
                  {leader.name}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-display font-extrabold text-gradient-gold">
                    {leader.total_points} pts
                  </span>
                  <span className="text-xs text-zinc-400">
                    {leader.correct_predictions} correct
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/leaderboard")}
                className="p-2 rounded-xl bg-zinc-100 text-zinc-400 active:scale-95 transition-transform"
                aria-label="View leaderboard"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* News Feed */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Newspaper size={14} className="text-zinc-400" />
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            News Feed
          </h2>
        </div>
        {feed.length > 0 ? (
          <div className="flex flex-col gap-3">
            {feed.map((item, i) => (
              <FeedCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400 text-sm">
            No news yet — check back when events start getting decided.
          </div>
        )}
      </div>

    </motion.div>
  );
}

export default DashboardPage;
