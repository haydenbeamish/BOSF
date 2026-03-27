import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../lib/cn";
import { useEvent } from "../hooks/useEvent";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { Skeleton } from "../components/ui/Skeleton";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { event, loading, error } = useEvent(Number(id));

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4">{"\u{1F6AB}"}</p>
        <p className="text-slate-400 text-sm">Failed to load event</p>
        <p className="text-slate-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (loading || !event) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-3">
        <Skeleton className="h-20 rounded-xl" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  const isDecided = event.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Event header */}
      <div className="px-4 py-6">
        <div className="flex items-start gap-3">
          <SportIcon sport={event.sport} className="text-2xl mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-100 leading-tight">
              {event.event_name}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <StatusPill status={event.status} />
              <span className="text-xs text-slate-500">{event.sport}</span>
              {event.points_value > 1 && (
                <span className="text-xs text-gold-400 font-semibold">
                  {event.points_value} pts
                </span>
              )}
            </div>
          </div>
        </div>

        {isDecided && event.correct_answer && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">
              Result
            </p>
            <p className="text-base font-bold text-emerald-400">
              {event.correct_answer}
            </p>
          </div>
        )}
      </div>

      {/* Predictions */}
      <div className="px-4 pb-32">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          All Picks ({event.predictions?.length || 0})
        </h3>
        <div className="flex flex-col gap-2">
          {(event.predictions || []).map((pred, i) => {
            const isCorrect = pred.is_correct === true;
            const isWrong = pred.is_correct === false;

            return (
              <motion.div
                key={pred.participant_name + i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3",
                  isCorrect
                    ? "bg-emerald-500/10 border-emerald-500/20"
                    : isWrong
                    ? "bg-rose-500/5 border-rose-500/15"
                    : "bg-slate-800/30 border-slate-700/30"
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">
                    {pred.participant_name}
                  </p>
                  <p className={cn(
                    "text-xs mt-0.5 truncate",
                    isCorrect ? "text-emerald-400" : isWrong ? "text-rose-400" : "text-slate-400"
                  )}>
                    {pred.prediction}
                  </p>
                </div>

                {isDecided && (
                  <span className={cn(
                    "text-lg font-bold shrink-0",
                    isCorrect ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {isCorrect ? "\u2713" : "\u2717"}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
