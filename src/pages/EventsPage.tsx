import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollText, ChevronRight, Check, RefreshCw, Radio } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { getCategoryInfo } from "../lib/categories";
import { cn } from "../lib/cn";

export function EventsPage() {
  const navigate = useNavigate();
  const { events, allEvents, categories, selectedCategory, setSelectedCategory, statusCounts, loading, error, retry } = useEvents();
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
        icon={<ScrollText size={28} />}
        title="Couldn't load events"
        description={error}
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

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-2">
        <Skeleton className="h-10 rounded-full w-full mb-2" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  const completed = allEvents.filter((e) => e.status === "completed").length;
  const total = allEvents.length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      {/* Summary */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="font-display font-extrabold text-base text-zinc-900">Events</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{completed} of {total} decided</p>
        </div>
        {/* Progress ring */}
        <div className="relative w-11 h-11">
          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-200" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="text-emerald-500"
              strokeDasharray={`${(completed / Math.max(total, 1)) * 87.96} 87.96`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-display font-extrabold text-emerald-600">
            {progress}%
          </span>
        </div>
      </div>

      {/* Status summary chips */}
      <div className="flex gap-2 px-4 pb-2">
        {statusCounts.live > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/50 px-2.5 py-1">
            <Radio size={10} className="text-amber-600 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-700">{statusCounts.live} Live</span>
          </div>
        )}
        <div className="flex items-center gap-1.5 rounded-full bg-zinc-100 border border-zinc-200/50 px-2.5 py-1">
          <span className="text-[10px] font-semibold text-zinc-500">{statusCounts.upcoming} Upcoming</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/50 px-2.5 py-1">
          <span className="text-[10px] font-semibold text-emerald-600">{statusCounts.completed} Decided</span>
        </div>
      </div>

      {/* Category tabs */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none sticky top-0 z-30 bg-white/90 backdrop-blur-xl"
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
      {events.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={24} />}
          title="No events here"
          description={`No ${selectedCategory === "All" ? "" : selectedCategory + " "}events to show`}
        />
      ) : (
        <div className="flex flex-col gap-2 px-4 pt-2">
          {events.map((evt, i) => {
            // Show section headers when status changes
            const prevEvt = i > 0 ? events[i - 1] : null;
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
                      ) : evt.event_date ? (
                        <p className="text-xs text-zinc-400">
                          {new Date(evt.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}
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
    </motion.div>
  );
}
