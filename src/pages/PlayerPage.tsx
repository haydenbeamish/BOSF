import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Clock, Check, X, Flame, RefreshCw } from "lucide-react";
import { usePlayer } from "../hooks/usePlayer";
import { Avatar } from "../components/ui/Avatar";
import { GlassCard } from "../components/ui/GlassCard";
import { SportIcon } from "../components/ui/SportIcon";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { PlayerInsight } from "../components/feed/PlayerInsight";
import { cn } from "../lib/cn";

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const numId = Number(id);
  const { data, loading, error, retry } = usePlayer(numId);

  if (!id || isNaN(numId)) {
    return <EmptyState icon={<X size={28} />} title="Invalid player" description="This player doesn't exist." />;
  }
  if (error) {
    return (
      <EmptyState icon={<X size={28} />} title="Couldn't load player" description={error}>
        <button
          onClick={retry}
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-semibold active:scale-95 transition-transform"
        >
          <RefreshCw size={14} /> Try again
        </button>
      </EmptyState>
    );
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
      className="pb-6"
    >
      {/* Profile header */}
      <div className="px-4 pt-6 pb-2">
        <GlassCard className="p-5">
          <div className="flex items-center gap-4">
            <Avatar name={participant.name} id={participant.id} size="xl" ringColor="accent" />
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-extrabold text-xl text-zinc-900 truncate">
                {participant.name}
              </h1>
              <p className="text-3xl font-display font-extrabold text-gradient-accent mt-1">
                {total_points} <span className="text-sm text-zinc-400 font-body font-normal">pts</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* AI-generated player insight */}
      <PlayerInsight
        name={participant.name}
        wins={wins}
        losses={losses}
        pending={pending}
        totalPoints={total_points}
        winRate={winRate}
      />

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 px-4 mb-4">
        {[
          { label: "Won", value: wins, icon: <Trophy size={12} />, color: "text-emerald-600" },
          { label: "Lost", value: losses, icon: <X size={12} />, color: "text-red-500" },
          { label: "Pending", value: pending, icon: <Clock size={12} />, color: "text-zinc-400" },
          { label: "Win %", value: `${winRate}%`, icon: <Target size={12} />, color: winRate >= 50 ? "text-emerald-600" : "text-zinc-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className="rounded-2xl border border-zinc-200/60 bg-white p-3 text-center shadow-sm"
          >
            <div className="flex justify-center mb-1.5 text-zinc-400">{stat.icon}</div>
            <p className={cn("font-display font-extrabold text-lg", stat.color)}>{stat.value}</p>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Decided picks */}
      {decided.length > 0 && (
        <div className="px-4 mb-6">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
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
                    ? "border-emerald-200/40 bg-emerald-50/50"
                    : "border-red-200/30 bg-red-50/30"
                )}
              >
                <SportIcon sport={pred.sport || "AFL"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-800 truncate font-medium">{pred.event_name}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    Picked: <span className="text-zinc-600">{pred.prediction}</span>
                    {pred.correct_answer && (
                      <> &middot; <span className={pred.is_correct ? "text-emerald-600" : "text-red-500"}>{pred.correct_answer}</span></>
                    )}
                  </p>
                </div>
                <div className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                  pred.is_correct ? "bg-emerald-100" : "bg-red-100"
                )}>
                  {pred.is_correct ? <Check size={14} className="text-emerald-600" /> : <X size={14} className="text-red-400" />}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Pending picks */}
      {pendingList.length > 0 && (
        <div className="px-4">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 mb-3 px-1">
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
                className="flex items-center gap-3 px-3 py-2.5 rounded-2xl border border-zinc-200/60 bg-white cursor-pointer active:scale-[0.98] transition-all shadow-sm"
              >
                <SportIcon sport={pred.sport || "AFL"} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 truncate font-medium">{pred.event_name}</p>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">
                    Picked: <span className="text-zinc-600">{pred.prediction}</span>
                  </p>
                </div>
                <Clock size={12} className="text-zinc-300 shrink-0" />
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
