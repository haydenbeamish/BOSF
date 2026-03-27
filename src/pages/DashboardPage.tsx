import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Zap, Newspaper, ScrollText } from "lucide-react";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { Podium } from "../components/leaderboard/Podium";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";

export function DashboardPage() {
  const navigate = useNavigate();
  const { feed, leaderboard, events, loading, error } = useNewsFeed();

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
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const leader = leaderboard[0];

  // Get next upcoming/in-progress events (not completed), sorted by date, limit 10
  const upcomingEvents = events
    .filter((e) => e.status !== "completed")
    .sort((a, b) => {
      // Sort by event_date, nulls last
      if (a.event_date && b.event_date) return a.event_date.localeCompare(b.event_date);
      if (a.event_date) return -1;
      if (b.event_date) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    })
    .slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      {/* Welcome header */}
      <div className="px-4 pt-5 pb-2 flex items-center gap-3">
        <motion.img
          src="/logo.png"
          alt="BOSF Logo"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="h-14 w-14 object-contain rounded-xl"
        />
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-extrabold text-xl text-zinc-900"
          >
            BOSF
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-sm text-zinc-400 mt-0.5"
          >
            Punting Leaderboard
          </motion.p>
        </div>
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

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ScrollText size={14} className="text-zinc-400" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Upcoming Events
              </h2>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="text-[11px] font-semibold text-emerald-600"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {upcomingEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.03, duration: 0.3 }}
                onClick={() => navigate(`/events/${evt.id}`)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-200/60 bg-white cursor-pointer active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
              >
                <SportIcon sport={evt.sport} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 truncate">{evt.event_name}</p>
                  {evt.event_date ? (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(evt.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  ) : null}
                </div>
                <StatusPill status={evt.status} />
                <ChevronRight size={14} className="text-zinc-300 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
