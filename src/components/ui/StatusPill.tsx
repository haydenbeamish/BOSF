import { cn } from "../../lib/cn";
import type { EventStatus } from "../../types";

const config: Record<EventStatus, { label: string; dot: string; text: string; bg: string }> = {
  completed: { label: "Decided", dot: "bg-accent", text: "text-accent", bg: "bg-accent/10" },
  in_progress: { label: "Live", dot: "bg-amber-400 animate-pulse", text: "text-amber-400", bg: "bg-amber-400/10" },
  upcoming: { label: "Pending", dot: "bg-surface-500", text: "text-surface-500", bg: "bg-surface-200/50" },
};

export function StatusPill({ status }: { status: EventStatus }) {
  const c = config[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5", c.bg)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", c.dot)} />
      <span className={cn("text-[10px] font-bold uppercase tracking-wider", c.text)}>
        {c.label}
      </span>
    </span>
  );
}
