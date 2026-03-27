import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/cn";
import { SportIcon } from "../ui/SportIcon";
import { StatusPill } from "../ui/StatusPill";
import type { CompetitionEvent } from "../../types";

interface EventCardProps {
  event: CompetitionEvent;
  index: number;
}

export function EventCard({ event, index }: EventCardProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      onClick={() => navigate(`/events/${event.id}`)}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all active:scale-[0.98]",
        event.status === "completed"
          ? "bg-slate-800/30 border-slate-700/30"
          : "bg-slate-800/50 border-slate-700/40"
      )}
    >
      <SportIcon sport={event.sport} className="text-lg shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-200 truncate">
          {event.event_name}
        </p>
        {event.correct_answer && (
          <p className="text-xs text-emerald-400 truncate mt-0.5">
            {"\u2713"} {event.correct_answer}
          </p>
        )}
        {!event.correct_answer && event.event_date && (
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date(event.event_date).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </p>
        )}
      </div>

      <StatusPill status={event.status} />

      <svg className="w-4 h-4 text-slate-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </motion.div>
  );
}
