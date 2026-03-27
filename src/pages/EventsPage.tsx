import { motion } from "framer-motion";
import { useEvents } from "../hooks/useEvents";
import { EventCategoryTabs } from "../components/events/EventCategoryTabs";
import { EventList } from "../components/events/EventList";
import { Skeleton } from "../components/ui/Skeleton";

export function EventsPage() {
  const { events, allEvents, categories, selectedCategory, setSelectedCategory, loading, error } = useEvents();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4" role="img" aria-label="error">{"\u{1F6AB}"}</p>
        <p className="text-slate-400 text-sm">Failed to load events</p>
        <p className="text-slate-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="px-4 pt-4">
        <h2 className="text-base font-bold text-slate-200 mb-4">Events</h2>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const completed = allEvents.filter((e) => e.status === "completed").length;
  const total = allEvents.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Summary bar */}
      <div className="flex items-center justify-between px-4 pt-4 pb-1">
        <div>
          <h2 className="text-base font-bold text-slate-200">Events</h2>
          <p className="text-xs text-slate-500">{total} events &middot; {completed} decided</p>
        </div>
        {/* Progress ring */}
        <div className="relative w-10 h-10">
          <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-800" />
            <circle
              cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3"
              className="text-gold-400"
              strokeDasharray={`${(completed / Math.max(total, 1)) * 94.25} 94.25`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-gold-400">
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </span>
        </div>
      </div>

      <EventCategoryTabs
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <EventList events={events} />
    </motion.div>
  );
}
