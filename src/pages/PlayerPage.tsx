import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Clock, Check, X, Flame } from "lucide-react";
import { usePlayer } from "../hooks/usePlayer";
import { Avatar } from "../components/ui/Avatar";
import { GlassCard } from "../components/ui/GlassCard";
import { SportIcon } from "../components/ui/SportIcon";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { cn } from "../lib/cn";

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);
  const { data, loading, error } = usePlayer(numId);

  if (!id || isNaN(numId)) {
    return <EmptyState icon={<X size={28} />} title="Invalid player" description="This player doesn't exist." />;
  }
  if (error) {
    return <EmptyState icon={<X size={28} />} title="Couldn't load player" description={error} />;
  }
  if (loading || !data) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-3">
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { participant, predictions, total_points } = data;
  const wins = predictions.filter((p) => p.is_correct === true).length;
  const losses = predictions.filter((p) => p.is_correct === false).length;
  const pending = predictions.filter((p) => p.is_correct === null).length;
  const winRate = (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;
  const decided = predictions.filter((p) => p.is_correct !== null);
  const pendingList = predictions.filter((p) => p.is_correct === null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="pb-24"
    >
      {/* Profile header */}
      <div className="px-4 pt-6 pb-2">
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={participant.name} id={participant.id} size="xl" ringColor="accent" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-extrabold text-xl text-zinc-100 truncate">
                {participant.name}
              </h1>
              <p className="text-3xl font-display font-extrabold text-gradient-accent mt-1">
                {total_points} <span className="text-sm text-surface-500 font-body font-normal">pts</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-4">
        {[
          { label: "Won", value: wins, icon: <Trophy size={12} />, color: "text-accent" },
          { label: "Lost", value: losses, icon: <X size={12} />, color: "text-red-400" },
          { label: "Pending", value: pending, icon: <Clock size={12} />, color: "text-surface-500" },
          { label: "Win %", value: `${winRate}%`, icon: <Target size={12} />, color: winRate >= 50 ? "text-accent" : "text-surface-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl border border-surface-200/50 bg-surface-50/80 p-3 text-center"
          >
            <div className="flex justify-center mb-1.5 text-surface-400">{stat.icon}</div>
            <p className={cn("font-display font-extrabold text-lg", stat.color)}>{stat.value}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-surface-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Decided picks */}
      {decided.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 px-1">
            Decided ({decided.length})
          </h3>
          <div className="flex flex-col gap-2">
            {decided.map((pred, i) => (
              <motion.div
                key={pred.id ?? `d-${pred.event_id}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.02 }}
                onClick={() => navigate(`/events/${pred.event_id}`)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all",
                  pred.is_correct
                    ? "border-accent/15 bg-accent/[0.03]"
                    : "border-red-500/10 bg-red-500/[0.02]"
                )}
              >
                <SportIcon sport={pred.sport || "AFL"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate font-medium">{pred.event_name}</p>
                  <p className="text-xs text-surface-500 truncate mt-0.5">
                    Picked: <span className="text-surface-600">{pred.prediction}</span>
                    {pred.correct_answer && (
                      <> &middot; <span className={pred.is_correct ? "text-accent" : "text-red-400"}>{pred.correct_answer}</span></>
                    )}
                  </p>
                </div>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  pred.is_correct ? "bg-accent/10" : "bg-red-500/10"
                )}>
                  {pred.is_correct ? <Check size={14} className="text-accent" /> : <X size={14} className="text-red-400" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Pending picks */}
      {pendingList.length > 0 && (
        <div className="px-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-surface-500 mb-3 px-1">
            Pending ({pendingList.length})
          </h3>
          <div className="flex flex-col gap-2">
            {pendingList.map((pred, i) => (
              <motion.div
                key={pred.id ?? `p-${pred.event_id}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 + i * 0.02 }}
                onClick={() => navigate(`/events/${pred.event_id}`)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-surface-200/30 bg-surface-50/30 cursor-pointer active:scale-[0.98] transition-all"
              >
                <SportIcon sport={pred.sport || "AFL"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-300 truncate font-medium">{pred.event_name}</p>
                  <p className="text-xs text-surface-500 truncate mt-0.5">
                    Picked: <span className="text-surface-600">{pred.prediction}</span>
                  </p>
                </div>
                <Clock size={12} className="text-surface-400 shrink-0" />
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {predictions.length === 0 && (
        <EmptyState
          icon={<Flame size={24} />}
          title="No predictions yet"
          description={`${participant.name} hasn't made any picks yet.`}
        />
      )}
    </motion.div>
  );
}
