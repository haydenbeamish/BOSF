import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Check } from "lucide-react";
import { getEventDisplayDate, formatEventDate } from "../lib/dates";
import { useEvents } from "../hooks/useEvents";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { SportIcon } from "../components/ui/SportIcon";
import { getCategoryInfo } from "../lib/categories";
import { cn } from "../lib/cn";
import { Zap } from "lucide-react";

export function EventsPage() {
  const navigate = useNavigate();
  const {
    allEvents,
    categories,
    selectedCategory,
    setSelectedCategory,
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

  if (error) {
    return (
      <EmptyState
        icon={<Zap size={28} />}
        title="Couldn't load events"
        description={error}
      />
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Skeleton className="h-10 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
        <Skeleton className="h-16 rounded-2xl" />
      </div>
    );
  }

  // Only future events (upcoming), filtered by category
  const base = selectedCategory === "All" ? allEvents : allEvents.filter((e) => e.sport === selectedCategory);
  const futureEvents = base
    .filter((e) => e.status === "upcoming")
    .sort((a, b) => {
      if (a.event_date && b.event_date) return a.event_date.localeCompare(b.event_date);
      if (a.event_date) return -1;
      if (b.event_date) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-6"
    >
      <div className="px-4 pt-3">
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

        {/* Events list */}
        {futureEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-400 text-sm">
            No upcoming{selectedCategory === "All" ? "" : " " + selectedCategory} events.
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 pt-1">
            {futureEvents.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.025, 0.5), duration: 0.3 }}
                onClick={() => navigate(`/events/${evt.id}`)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-zinc-200/60 bg-white cursor-pointer active:scale-[0.98] hover:shadow-md hover:-translate-y-0.5 transition-all shadow-sm"
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
                  </div>
                </div>
                <ChevronRight size={14} className="text-zinc-300 shrink-0" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
export default EventsPage;
