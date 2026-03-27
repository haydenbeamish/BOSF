import { cn } from "../../lib/cn";
import type { EventStatus } from "../../types";

const statusStyles: Record<EventStatus, string> = {
  completed: "bg-emerald-500/20 text-emerald-400",
  in_progress: "bg-gold-500/20 text-gold-400",
  upcoming: "bg-slate-600/30 text-slate-400",
};

const statusLabels: Record<EventStatus, string> = {
  completed: "Decided",
  in_progress: "Live",
  upcoming: "Pending",
};

export function StatusPill({ status }: { status: EventStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        statusStyles[status]
      )}
    >
      {status === "in_progress" && (
        <span className="mr-1 h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
      )}
      {statusLabels[status]}
    </span>
  );
}
