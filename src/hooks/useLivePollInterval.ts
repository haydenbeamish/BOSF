import type { CompetitionEvent } from "../types";

/**
 * Choose a refetch interval based on the state of the events list.
 *
 * - If any event is currently in_progress OR starts within the next 2h, poll every 30s.
 * - If an event is within 24h, poll every 2 minutes.
 * - Otherwise use the default 5-minute poll.
 */
export function chooseLivePollInterval(
  events: CompetitionEvent[] | undefined,
  defaultMs = 5 * 60 * 1000
): number {
  if (!events || events.length === 0) return defaultMs;
  const now = Date.now();
  let closest = Infinity;
  let anyInProgress = false;
  for (const e of events) {
    if (e.status === "in_progress") anyInProgress = true;
    const d = e.event_date ?? e.close_date;
    if (!d) continue;
    const safe = d.includes("T") ? d : d + "T00:00:00";
    const t = new Date(safe).getTime();
    if (!Number.isFinite(t)) continue;
    const diff = t - now;
    if (diff > 0 && diff < closest) closest = diff;
  }

  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  if (anyInProgress || closest < TWO_HOURS) return 30_000;
  if (closest < ONE_DAY) return 2 * 60 * 1000;
  return defaultMs;
}
