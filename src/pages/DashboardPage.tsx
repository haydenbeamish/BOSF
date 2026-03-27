import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, ChevronRight, Zap, Newspaper, ScrollText, Target, Flame, Check } from "lucide-react";
import { getEventDisplayDate, formatEventDate } from "../lib/dates";
import { useNewsFeed } from "../hooks/useNewsFeed";
import { useEvents } from "../hooks/useEvents";
import { GlassCard } from "../components/ui/GlassCard";
import { Avatar } from "../components/ui/Avatar";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { Podium } from "../components/leaderboard/Podium";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { getCategoryInfo } from "../lib/categories";
import { cn } from "../lib/cn";

export function DashboardPage() {
  const navigate = useNavigate();
  const { feed, leaderboard, loading, error } = useNewsFeed();
  const {
    events: filteredEvents,
    allEvents,
    categories,
    selectedCategory,
    setSelectedCategory,
    statusCounts,
    loading: eventsLoading,
  } = useEvents();

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeTabRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeTabRef.current;
      const scrollLeft = button.offsetLeft - container.offsetWidth / 2 + button.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [selectedCategory]);

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

      {/* All Events */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ScrollText size={14} className="text-zinc-400" />
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              All Events
            </h2>
          </div>
          <div className="flex gap-1.5">
            {statusCounts.upcoming > 0 && (
              <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                {statusCounts.upcoming} Upcoming
              </span>
            )}
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">
              {completedEvents}/{totalEvents} Decided
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div
          ref={scrollRef}
          className="flex gap-1.5 py-2 overflow-x-auto scrollbar-none"
        >
          {categories.map((cat) => {
            const isActive = cat === selectedCategory;
            const info = cat === "All" ? null : getCategoryInfo(cat);
            return (
              <button
                key={cat}
                ref={isActive ? activeTabRef : null}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-all shrink-0 active:scale-95",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                    : "bg-zinc-100 text-zinc-500 border border-zinc-200/50"
                )}
              >
                {info && <span className="text-[11px]">{info.emoji}</span>}
                {cat === "All" ? "All" : info?.label ?? cat}
              </button>
            );
          })}
        </div>

        {/* Events list */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm">
            No {selectedCategory === "All" ? "" : selectedCategory + " "}events to show.
          </div>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            {filteredEvents.map((evt, i) => {
              const prevEvt = i > 0 ? filteredEvents[i - 1] : null;
              const showHeader = !prevEvt || prevEvt.status !== evt.status;
              const sectionLabel = evt.status === "in_progress" ? "Live Now" : evt.status === "upcoming" ? "Upcoming" : "Decided";

              return (
                <div key={evt.id}>
                  {showHeader && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn("text-[11px] font-bold uppercase tracking-wider px-1 mt-3 mb-2", i === 0 && "mt-1",
                        evt.status === "in_progress" ? "text-amber-600" :
                        evt.status === "upcoming" ? "text-zinc-400" :
                        "text-emerald-600"
                      )}
                    >
                      {sectionLabel}
                    </motion.div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.025, 0.5), duration: 0.3 }}
                    onClick={() => navigate(`/events/${evt.id}`)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm",
                      evt.status === "in_progress"
                        ? "border-amber-200/60 bg-amber-50/30"
                        : "border-zinc-200/60 bg-white"
                    )}
                  >
                    <SportIcon sport={evt.sport} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{evt.event_name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {evt.correct_answer ? (
                          <div className="flex items-center gap-1 min-w-0">
                            <Check size={10} className="text-emerald-600 shrink-0" />
                            <p className="text-xs text-emerald-600 truncate">{evt.correct_answer}</p>
                          </div>
                        ) : formatEventDate(getEventDisplayDate(evt.event_date, evt.close_date)) ? (
                          <p className="text-xs text-zinc-400">
                            {formatEventDate(getEventDisplayDate(evt.event_date, evt.close_date))}
                          </p>
                        ) : null}
                        {evt.points_value > 1 && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 rounded-full px-1.5 py-0.5 shrink-0">
                            {evt.points_value}pt
                          </span>
                        )}
                        <StatusPill status={evt.status} />
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-zinc-300 shrink-0" />
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
