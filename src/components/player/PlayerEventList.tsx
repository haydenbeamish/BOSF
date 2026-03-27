import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { SportIcon } from "../ui/SportIcon";
import type { Prediction } from "../../types";

interface PlayerEventListProps {
  predictions: Prediction[];
}

function getStatusIcon(isCorrect: boolean | null) {
  if (isCorrect === true) return { icon: "\u2713", color: "text-emerald-400", bg: "bg-emerald-500/10" };
  if (isCorrect === false) return { icon: "\u2717", color: "text-rose-400", bg: "bg-rose-500/10" };
  return { icon: "\u2022", color: "text-slate-500", bg: "bg-slate-700/30" };
}

export function PlayerEventList({ predictions }: PlayerEventListProps) {
  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <p className="text-slate-500 text-sm">No predictions yet</p>
      </div>
    );
  }

  const decided = predictions.filter((p) => p.is_correct !== null);
  const pending = predictions.filter((p) => p.is_correct === null);

  return (
    <div className="px-4 pb-32">
      {decided.length > 0 && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Decided ({decided.length})
          </h3>
          <div className="flex flex-col gap-2 mb-6">
            {decided.map((pred, i) => {
              const status = getStatusIcon(pred.is_correct);
              return (
                <motion.div
                  key={pred.id ?? `decided-${pred.event_id}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                    status.bg,
                    pred.is_correct === true
                      ? "border-emerald-500/20"
                      : pred.is_correct === false
                      ? "border-rose-500/20"
                      : "border-slate-700/30"
                  )}
                >
                  <SportIcon sport={pred.sport || "AFL"} className="shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 truncate font-medium">
                      {pred.event_name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      Picked: <span className="text-slate-300">{pred.prediction}</span>
                      {pred.correct_answer && (
                        <> &middot; Answer: <span className={pred.is_correct ? "text-emerald-400" : "text-rose-400"}>{pred.correct_answer}</span></>
                      )}
                    </p>
                  </div>
                  <span className={cn("text-lg font-bold shrink-0", status.color)}>
                    {status.icon}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {pending.length > 0 && (
        <>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Pending ({pending.length})
          </h3>
          <div className="flex flex-col gap-2">
            {pending.map((pred, i) => (
              <motion.div
                key={pred.id ?? `pending-${pred.event_id}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
                className="flex items-center gap-3 rounded-xl border border-slate-700/30 bg-slate-800/30 px-3 py-2.5"
              >
                <SportIcon sport={pred.sport || "AFL"} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-300 truncate font-medium">
                    {pred.event_name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Picked: <span className="text-slate-400">{pred.prediction}</span>
                  </p>
                </div>
                <span className="text-xs text-slate-600 shrink-0">TBD</span>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
