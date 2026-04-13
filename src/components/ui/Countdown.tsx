import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface CountdownProps {
  /** ISO date string of the target moment */
  target: string | null | undefined;
  /** Hide when the target is in the past (default: true) */
  hideWhenPast?: boolean;
  /** Maximum hours out to display; beyond this, show nothing (default: 72) */
  maxHours?: number;
  /** Show with a leading icon */
  prefix?: ReactNode;
  className?: string;
}

/** Parses an ISO-ish date string, tolerating "YYYY-MM-DD" (treated as local midnight). */
function parseTarget(s: string | null | undefined): number | null {
  if (!s) return null;
  const safe = s.includes("T") ? s : s + "T00:00:00";
  const t = new Date(safe).getTime();
  return Number.isFinite(t) ? t : null;
}

function format(msRemaining: number): string {
  if (msRemaining <= 0) return "now";
  const s = Math.floor(msRemaining / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `in ${d}d ${h % 24}h`;
}

/**
 * Lightweight countdown display. Ticks every 30s (enough granularity for a
 * sports event display, cheap on renders).
 */
export function Countdown({
  target,
  hideWhenPast = true,
  maxHours = 72,
  prefix,
  className,
}: CountdownProps) {
  const targetMs = parseTarget(target);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!targetMs) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(Date.now());
      // Self-schedule so we shorten the interval as we approach kickoff.
      const remaining = targetMs - Date.now();
      const next = remaining < 2 * 60 * 1000 ? 5000 : 30_000;
      timer = setTimeout(tick, next);
    };
    timer = setTimeout(tick, targetMs - Date.now() < 2 * 60 * 1000 ? 5000 : 30_000);
    return () => clearTimeout(timer);
  }, [targetMs]);

  if (!targetMs) return null;
  const remaining = targetMs - now;
  if (hideWhenPast && remaining < 0) return null;
  if (remaining > maxHours * 60 * 60 * 1000) return null;

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {prefix}
      {format(remaining)}
    </span>
  );
}
