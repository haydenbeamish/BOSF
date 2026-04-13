import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Trophy,
  ChevronRight,
  Zap,
  Newspaper,
  Target,
  Flame,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useEvents } from "../hooks/useEvents";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { StatCard } from "../components/ui/StatCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { EventListItem } from "../components/ui/EventListItem";
import { ClickableRow } from "../components/ui/ClickableRow";
import { FeedCard } from "../components/feed/FeedCard";
import { Podium } from "../components/leaderboard/Podium";
import { SpudBanner } from "../components/leaderboard/SpudBanner";
import { compareByDisplayDate } from "../lib/dates";

export function DashboardPage() {
  const navigate = useNavigate();
  const { feed, loading, error, retry } = useNewsFeed();
  const { entries: leaderboard, spud, loading: lbLoading } = useLeaderboard();
  const { allEvents, loading: eventsLoading } = useEvents();

  if (error) {
    return (
      <EmptyState
        icon={<Zap size={28} />}
        title="Couldn't load dashboard"
        description="Something's gone wrong, mate. Give it another crack."
      >
        <button
          onClick={retry}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </EmptyState>
    );
  }

  if (loading || lbLoading || eventsLoading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  const leader = leaderboard[0];
  const completedEvents = allEvents.filter((e) => e.status === "completed").length;
  const totalEvents = allEvents.length;

  const upcomingEvents = allEvents
    .filter((e) => e.status === "upcoming" || e.status === "in_progress")
    .sort(compareByDisplayDate)
    .slice(0, 3);

  // Pick the most-recent-in-memory feed item as the "hero" — users want
  // the biggest news above the fold.
  const heroItem = feed[0];
  const restFeed = feed.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-20"
    >
      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4 mb-4">
        <StatCard
          label="Punters"
          value={leaderboard.length}
          icon={<Trophy size={14} />}
          delay={0.05}
        />
        <StatCard
          label="Decided"
          value={`${completedEvents}/${totalEvents}`}
          icon={<Target size={14} />}
          accent="accent"
          delay={0.1}
        />
        <StatCard
          label="Top Score"
          value={(leader?.total_points ?? 0).toFixed(1)}
          icon={<Flame size={14} />}
          accent="gold"
          delay={0.15}
        />
      </div>

      {/* Hero feed item — biggest news of the moment */}
      {heroItem && (
        <div className="px-4 mb-5">
          <FeedCard item={heroItem} index={0} />
        </div>
      )}

      {/* Podium - Top 3 */}
      {leaderboard.length >= 3 && (
        <Podium entries={leaderboard} onSelect={(id) => navigate(`/player/${id}`)} />
      )}

      {/* Show the spud on the dashboard too */}
      {spud && <SpudBanner spud={spud} />}

      {/* Top 5 quick leaderboard (below podium) */}
      {leaderboard.length > 3 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Full Standings
            </h2>
            <button
              onClick={() => navigate("/leaderboard")}
              className="text-[11px] font-semibold text-emerald-600 tap-target px-2 -mr-2"
            >
              View all
            </button>
          </div>
          <GlassCard className="divide-y divide-zinc-100">
            {leaderboard.slice(3, 8).map((entry, i) => (
              <ClickableRow
                key={entry.id}
                onActivate={() => navigate(`/player/${entry.id}`)}
                ariaLabel={`${entry.name}, rank ${entry.rank}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="font-display font-extrabold text-xs text-zinc-400 w-5 text-center">
                  {entry.rank}
                </span>
                <Avatar name={entry.name} id={entry.id} size="sm" />
                <span className="font-display font-bold text-sm text-zinc-800 flex-1 truncate">
                  {entry.name}
                </span>
                <span className="font-display font-extrabold text-sm tabular-nums text-zinc-600">
                  {entry.total_points.toFixed(1)}
                </span>
              </ClickableRow>
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
                    {leader.total_points.toFixed(1)} pts
                  </span>
                  <span className="text-xs text-zinc-400">
                    {leader.correct_predictions} correct
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate("/leaderboard")}
                className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-100 text-zinc-400 active:scale-95 transition-transform"
                aria-label="View leaderboard"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Upcoming Events mini-section */}
      {upcomingEvents.length > 0 && (
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-zinc-400" />
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Up Next
              </h2>
            </div>
            <button
              onClick={() => navigate("/events")}
              className="text-[11px] font-semibold text-emerald-600 tap-target px-2 -mr-2"
            >
              View all
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {upcomingEvents.map((evt, i) => (
              <EventListItem key={evt.id} event={evt} index={i} iconSize="sm" />
            ))}
          </div>
        </div>
      )}

      {/* News Feed */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Newspaper size={14} className="text-zinc-400" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              News Feed
            </h2>
          </div>
          <button
            onClick={() => navigate("/news")}
            className="text-[11px] font-semibold text-emerald-600 tap-target px-2 -mr-2"
          >
            View full feed
          </button>
        </div>
        {restFeed.length > 0 ? (
          <div className="flex flex-col gap-3">
            {restFeed.map((item, i) => (
              <FeedCard key={item.id} item={item} index={i + 1} />
            ))}
          </div>
        ) : heroItem ? null : (
          <div className="text-center py-8 text-zinc-400 text-sm flex flex-col items-center gap-3">
            <p>No news yet — check back when events start getting decided.</p>
            <button
              onClick={() => navigate("/events")}
              className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
            >
              Browse events
            </button>
          </div>
        )}
      </div>

    </motion.div>
  );
}

export default DashboardPage;
