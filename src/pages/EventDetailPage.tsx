import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Clock } from "lucide-react";
import { useEvent } from "../hooks/useEvent";
import { SportIcon } from "../components/ui/SportIcon";
import { StatusPill } from "../components/ui/StatusPill";
import { Avatar } from "../components/ui/Avatar";
import { GlassCard } from "../components/ui/GlassCard";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../lib/cn";

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);
  const { event, loading, error } = useEvent(numId);

  if (!id || isNaN(numId)) {
    return <EmptyState icon={<X size={28} />} title="Invalid event" description="This event doesn't exist." />;
  }
  if (error) {
    return <EmptyState icon={<X size={28} />} title="Couldn't load event" description={error} />;
  }
  if (loading || !event) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-3">
        <Skeleton className="h-28 rounded-2xl" />
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  const isDecided = event.status === "completed";
  const predictions = event.predictions ?? [];
  const correctCount = predictions.filter((p) => p.is_correct === true).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* Event header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-start gap-3">
          <SportIcon sport={event.sport} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-extrabold text-lg text-zinc-100 leading-tight">
              {event.event_name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusPill status={event.status} />
              <span className="text-xs text-surface-500">{event.sport}</span>
              {event.points_value > 1 && (
                <span className="text-xs text-amber-400 font-bold">{event.points_value} pts</span>
              )}
            </div>
          </div>
        </div>

        {/* Result banner */}
        {isDecided && event.correct_answer && (
          <GlassCard glow="accent" className="mt-4 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                <Check size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent mb-0.5">Result</p>
                <p className="font-display font-extrabold text-base text-zinc-100">{event.correct_answer}</p>
              </div>
            </div>
            {predictions.length > 0 && (
              <p className="text-xs text-surface-500 mt-3 pt-3 border-t border-surface-200/30">
                {correctCount} of {predictions.length} got it right
              </p>
            )}
          </GlassCard>
        )}
      </div>

      {/* Predictions */}
      <div className="px-4">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 px-1">
          All Picks ({predictions.length})
        </h3>
        <div className="flex flex-col gap-2">
          {predictions.map((pred, i) => {
            const isCorrect = pred.is_correct === true;
            const isWrong = pred.is_correct === false;

            return (
              <motion.div
                key={pred.id ?? `${pred.participant_name}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                onClick={() => navigate(`/player/${pred.participant_id}`)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all",
                  isCorrect
                    ? "border-accent/15 bg-accent/[0.04]"
                    : isWrong
                    ? "border-red-500/10 bg-red-500/[0.02]"
                    : "border-surface-200/30 bg-surface-50/40"
                )}
              >
                <Avatar name={pred.participant_name ?? "?"} id={pred.participant_id} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm text-zinc-200 truncate">
                    {pred.participant_name}
                  </p>
                  <p className={cn(
                    "text-xs mt-0.5 truncate",
                    isCorrect ? "text-accent" : isWrong ? "text-red-400" : "text-surface-500"
                  )}>
                    {pred.prediction}
                  </p>
                </div>

                {isDecided && (
                  <div className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
                    isCorrect ? "bg-accent/10" : "bg-red-500/10"
                  )}>
                    {isCorrect ? (
                      <Check size={16} className="text-accent" />
                    ) : (
                      <X size={16} className="text-red-400" />
                    )}
                  </div>
                )}
                {!isDecided && (
                  <Clock size={14} className="text-surface-400 shrink-0" />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
