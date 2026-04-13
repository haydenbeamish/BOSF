import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import { useFullNewsFeed } from "../hooks/useFullNewsFeed";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { FeedCard } from "../components/feed/FeedCard";
import { cn } from "../lib/cn";
import type { FeedItem } from "../lib/newsfeed";

type FeedFilter = "all" | "results" | "streaks" | "odds" | "ladder" | "players";

const FILTER_OPTIONS: { key: FeedFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "results", label: "Results" },
  { key: "odds", label: "Odds" },
  { key: "streaks", label: "Streaks" },
  { key: "ladder", label: "Ladder" },
  { key: "players", label: "Players" },
];

const FILTER_TYPES: Record<FeedFilter, (t: string) => boolean> = {
  all: () => true,
  results: (t) =>
    t === "event_result" ||
    t === "perfect_pick" ||
    t === "everyone_wrong" ||
    t === "upset_alert" ||
    t === "result_commentary" ||
    t === "post_event_rubbing",
  odds: (t) =>
    t === "odds_alert" ||
    t === "odds_vs_picks" ||
    t === "pre_event_odds" ||
    t === "outlier_bet" ||
    t === "underdog_backer" ||
    t === "contrarian_pick" ||
    t === "picks_open",
  streaks: (t) =>
    t === "winning_streak" ||
    t === "losing_streak" ||
    t === "streak_spotlight" ||
    t === "momentum_index",
  ladder: (t) =>
    t === "new_leader" ||
    t === "new_spud" ||
    t === "leader_banter" ||
    t === "last_place_banter" ||
    t === "leaderboard_change" ||
    t === "ladder_leader" ||
    t === "ladder_last" ||
    t === "season_milestone" ||
    t === "lunch_bill_climb" ||
    t === "close_race" ||
    t === "accuracy_check",
  players: (t) =>
    t === "perfect_pick" ||
    t === "pick_summary" ||
    t === "hot_take" ||
    t === "h2h_rivalry",
};

function dayKey(ts?: string): string {
  if (!ts) return "undated";
  const safe = ts.includes("T") ? ts : ts + "T00:00:00";
  const d = new Date(safe);
  if (!Number.isFinite(d.getTime())) return "undated";
  d.setHours(0, 0, 0, 0);
  return String(d.getTime());
}

function dayLabel(key: string): string {
  if (key === "undated") return "Timeless";
  const ms = Number(key);
  const d = new Date(ms);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - ms) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7 && diff > 0) return `${diff} days ago`;
  return d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function NewsPage() {
  const { feed, loading, error } = useFullNewsFeed();
  const [filter, setFilter] = useState<FeedFilter>("all");

  const filteredGrouped = useMemo(() => {
    const pred = FILTER_TYPES[filter];
    const filtered = feed.filter((f) => pred(f.type));
    const grouped = new Map<string, FeedItem[]>();
    for (const item of filtered) {
      const k = dayKey(item.timestamp);
      const arr = grouped.get(k);
      if (arr) arr.push(item);
      else grouped.set(k, [item]);
    }
    // Sort keys: numeric (newer) first, "undated" last
    const keys = [...grouped.keys()].sort((a, b) => {
      if (a === "undated") return 1;
      if (b === "undated") return -1;
      return Number(b) - Number(a);
    });
    return keys.map((k) => ({ key: k, label: dayLabel(k), items: grouped.get(k)! }));
  }, [feed, filter]);

  const counts = useMemo(() => {
    const out: Record<FeedFilter, number> = {
      all: feed.length,
      results: 0,
      odds: 0,
      streaks: 0,
      ladder: 0,
      players: 0,
    };
    for (const f of feed) {
      for (const key of Object.keys(FILTER_TYPES) as FeedFilter[]) {
        if (key === "all") continue;
        if (FILTER_TYPES[key](f.type)) out[key]++;
      }
    }
    return out;
  }, [feed]);

  if (error) {
    return (
      <EmptyState
        icon={<Zap size={28} />}
        title="Couldn't load news"
        description="Something's gone wrong, mate. Give it another crack."
      />
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
        <Skeleton className="h-24 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-20"
    >
      {/* Filter chips */}
      <div className="px-4 pt-4 mb-3 sticky top-0 z-10 bg-surface-50/80 backdrop-blur-sm">
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-surface-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-surface-50 to-transparent z-10 pointer-events-none" />
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none px-1 py-1">
            {FILTER_OPTIONS.map((opt) => {
              const active = filter === opt.key;
              const count = counts[opt.key];
              return (
                <button
                  key={opt.key}
                  onClick={() => setFilter(opt.key)}
                  aria-pressed={active}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all shrink-0 active:scale-95",
                    active
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                      : "bg-zinc-100 text-zinc-500 border border-zinc-200/50"
                  )}
                >
                  {opt.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "text-[10px] rounded-full px-1.5 py-0.5 font-bold",
                        active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-white text-zinc-500"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <AnimatePresence mode="wait">
          {filteredGrouped.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-10 text-zinc-400 text-sm"
            >
              {filter === "all"
                ? "No news yet — check back when events start getting decided."
                : "Nothing in this category right now. Try another filter."}
            </motion.div>
          ) : (
            <motion.div
              key={`grouped-${filter}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-5"
            >
              {filteredGrouped.map((group) => (
                <div key={group.key} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      {group.label}
                    </h3>
                    <span className="text-[10px] text-zinc-300">·</span>
                    <span className="text-[10px] text-zinc-400">
                      {group.items.length} item{group.items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {group.items.map((item, i) => (
                    <FeedCard key={item.id} item={item} index={i} />
                  ))}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default NewsPage;
