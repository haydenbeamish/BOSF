import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollText, ChevronRight, Check } from "lucide-react";
import { useEvents } from "../hooks/useEvents";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { getCategoryInfo } from "../lib/categories";
import { cn } from "../lib/cn";

export function EventsPage() {
  const navigate = useNavigate();
  const { events, allEvents, categories, selectedCategory, setSelectedCategory, loading, error } = useEvents();
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
      />
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
      className="pb-24"
    >
      {/* Summary */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div>
          <h2 className="font-display font-extrabold text-base text-zinc-100">Events</h2>
          <p className="text-xs text-surface-500 mt-0.5">{completed} of {total} decided</p>
        </div>
        {/* Progress ring */}
        <div className="relative w-11 h-11">
          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-surface-200" />
            <circle
              cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="2.5"
              className="text-accent"
              strokeDasharray={`${(completed / Math.max(total, 1)) * 87.96} 87.96`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-display font-extrabold text-accent">
            {progress}%
          </span>
        </div>
      </div>

      {/* Category tabs */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 px-4 py-2 overflow-x-auto scrollbar-none sticky top-14 z-30 bg-surface-0/90 backdrop-blur-xl"
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
                  ? "bg-accent/10 text-accent border border-accent/20"
                  : "bg-surface-100 text-surface-500 border border-surface-200/50"
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
          {events.map((evt, i) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.3 }}
              onClick={() => navigate(`/events/${evt.id}`)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-surface-200/30 bg-surface-50/40 cursor-pointer active:scale-[0.98] hover:bg-surface-100/50 transition-all"
            >
              <SportIcon sport={evt.sport} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 truncate">{evt.event_name}</p>
                {evt.correct_answer ? (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Check size={10} className="text-accent" />
                    <p className="text-xs text-accent truncate">{evt.correct_answer}</p>
                  </div>
                ) : evt.event_date ? (
                  <p className="text-xs text-surface-500 mt-0.5">
                    {new Date(evt.event_date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                  </p>
                ) : null}
              </div>
              <StatusPill status={evt.status} />
              <ChevronRight size={14} className="text-surface-400 shrink-0" />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
