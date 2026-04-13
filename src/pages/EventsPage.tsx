import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, CheckCircle2, Zap } from "lucide-react";
import { getEventDisplayDate, compareByDisplayDate } from "../lib/dates";
import { useEvents } from "../hooks/useEvents";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { EventListItem } from "../components/ui/EventListItem";
import { getCategoryInfo } from "../lib/categories";
import { cn } from "../lib/cn";
import type { CompetitionEvent } from "../types";

type EventTab = "upcoming" | "decided";

function startOfDay(d: Date): number {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

function dayLabel(ms: number): string {
  const d = new Date(ms);
  const today = startOfDay(new Date());
  const diffDays = Math.round((ms - today) / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  const fmt = d.toLocaleDateString("en-AU", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  // Prepend "Last" for events in the past beyond yesterday
  if (diffDays < -1 && diffDays > -7) return `Last ${d.toLocaleDateString("en-AU", { weekday: "long" })}`;
  return fmt;
}

function eventBucketMs(event: CompetitionEvent): number | null {
  const d = getEventDisplayDate(event.event_date, event.close_date);
  if (!d) return null;
  const safe = d.includes("T") ? d : d + "T00:00:00";
  const t = new Date(safe).getTime();
  return Number.isFinite(t) ? startOfDay(new Date(t)) : null;
}

interface DayGroup {
  key: string;
  label: string;
  events: CompetitionEvent[];
}

function groupByDay(events: CompetitionEvent[]): DayGroup[] {
  const bucket = new Map<number, CompetitionEvent[]>();
  const undated: CompetitionEvent[] = [];
  for (const e of events) {
    const ms = eventBucketMs(e);
    if (ms == null) undated.push(e);
    else {
      const arr = bucket.get(ms);
      if (arr) arr.push(e);
      else bucket.set(ms, [e]);
    }
  }
  const sortedKeys = [...bucket.keys()].sort((a, b) => a - b);
  const groups: DayGroup[] = sortedKeys.map((k) => ({
    key: String(k),
    label: dayLabel(k),
    events: bucket.get(k)!,
  }));
  if (undated.length) {
    groups.push({ key: "undated", label: "Season long", events: undated });
  }
  return groups;
}

export function EventsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");
  const {
    allEvents,
    categories,
    selectedCategory,
    setSelectedCategory,
    statusCounts,
    loading,
    error,
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

  const { upcomingGroups, decidedEvents, thisWeekCount } = useMemo(() => {
    const base =
      selectedCategory === "All"
        ? allEvents
        : allEvents.filter((e) => e.sport === selectedCategory);

    const upcoming = base
      .filter((e) => e.status === "upcoming" || e.status === "in_progress")
      .sort(compareByDisplayDate);

    const decided = base
      .filter((e) => e.status === "completed")
      .sort((a, b) => {
        if (a.event_date && b.event_date) return b.event_date.localeCompare(a.event_date);
        if (a.event_date) return -1;
        if (b.event_date) return 1;
        return (b.display_order ?? 0) - (a.display_order ?? 0);
      });

    const sevenDaysMs = startOfDay(new Date()) + 7 * 24 * 60 * 60 * 1000;
    const thisWeek = upcoming.filter((e) => {
      const ms = eventBucketMs(e);
      return ms != null && ms <= sevenDaysMs;
    }).length;

    return {
      upcomingGroups: groupByDay(upcoming),
      decidedEvents: decided,
      thisWeekCount: thisWeek,
    };
  }, [allEvents, selectedCategory]);

  if (error) {
    return (
      <EmptyState icon={<Zap size={28} />} title="Couldn't load events" description={error} />
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton className="h-10 rounded-2xl" />
        <Skeleton className="h-10 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  }

  const upcomingCount = statusCounts.upcoming + statusCounts.live;
  const decidedCount = statusCounts.completed;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-20"
    >
      <div className="px-4 pt-4">
        {/* Upcoming / Decided segmented control */}
        <div className="relative flex gap-1 p-1 rounded-xl bg-zinc-100 mb-3">
          <motion.div
            layoutId="segment-pill"
            className="absolute top-1 bottom-1 rounded-lg bg-white shadow-sm"
            style={{ width: "calc(50% - 4px)", left: activeTab === "upcoming" ? 4 : "calc(50% + 0px)" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button
            onClick={() => setActiveTab("upcoming")}
            aria-pressed={activeTab === "upcoming"}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200",
              activeTab === "upcoming" ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <CalendarDays size={13} />
            Upcoming
            {upcomingCount > 0 && (
              <span
                className={cn(
                  "text-[10px] rounded-full px-1.5 py-0.5 font-bold transition-colors duration-200",
                  activeTab === "upcoming"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-200 text-zinc-500"
                )}
              >
                {upcomingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("decided")}
            aria-pressed={activeTab === "decided"}
            className={cn(
              "relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-200",
              activeTab === "decided" ? "text-zinc-900" : "text-zinc-400"
            )}
          >
            <CheckCircle2 size={13} />
            Decided
            {decidedCount > 0 && (
              <span
                className={cn(
                  "text-[10px] rounded-full px-1.5 py-0.5 font-bold transition-colors duration-200",
                  activeTab === "decided"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-zinc-200 text-zinc-500"
                )}
              >
                {decidedCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs with edge fades */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-surface-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-surface-50 to-transparent z-10 pointer-events-none" />
          <div
            ref={scrollRef}
            className="flex gap-1.5 py-2 overflow-x-auto scrollbar-none px-1"
          >
            {categories.map((cat) => {
              const isActive = cat === selectedCategory;
              const info = cat === "All" ? null : getCategoryInfo(cat);
              return (
                <button
                  key={cat}
                  ref={isActive ? activeTabRef : null}
                  onClick={() => setSelectedCategory(cat)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all shrink-0 active:scale-95",
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
        </div>

        {/* This Week pinned callout */}
        {activeTab === "upcoming" && thisWeekCount > 0 && (
          <div className="flex items-center gap-2 mt-2 mb-1 px-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              This Week
            </span>
            <span className="text-[10px] rounded-full bg-emerald-100 text-emerald-700 px-1.5 py-0.5 font-bold">
              {thisWeekCount}
            </span>
          </div>
        )}

        {/* Events list */}
        <AnimatePresence mode="wait">
          {activeTab === "upcoming" ? (
            upcomingGroups.length === 0 ? (
              <motion.div
                key="empty-upcoming"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="py-8 flex flex-col items-center gap-3 text-center"
              >
                <p className="text-sm text-zinc-400">
                  No upcoming{selectedCategory === "All" ? "" : " " + selectedCategory} events.
                </p>
                <button
                  onClick={() => navigate("/leaderboard")}
                  className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
                >
                  See the standings
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list-upcoming"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 pt-1"
              >
                {upcomingGroups.map((group) => (
                  <div key={group.key} className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 px-1">
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {group.label}
                      </h3>
                      <span className="text-[10px] text-zinc-300">&middot;</span>
                      <span className="text-[10px] text-zinc-400">
                        {group.events.length} event{group.events.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {group.events.map((evt, i) => (
                      <EventListItem key={evt.id} event={evt} index={i} />
                    ))}
                  </div>
                ))}
              </motion.div>
            )
          ) : decidedEvents.length === 0 ? (
            <motion.div
              key="empty-decided"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="py-8 flex flex-col items-center gap-3 text-center"
            >
              <p className="text-sm text-zinc-400">
                No decided{selectedCategory === "All" ? "" : " " + selectedCategory} events yet.
              </p>
              <button
                onClick={() => setActiveTab("upcoming")}
                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
              >
                See what's coming up
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="list-decided"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-1.5 pt-1"
            >
              {decidedEvents.map((evt, i) => (
                <EventListItem key={evt.id} event={evt} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
export default EventsPage;
