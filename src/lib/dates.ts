/**
 * Returns the best display date for an event.
 * The API stores `event_date` as the prediction-lock date and `close_date` as
 * the actual resolution date for season-long events. We pick whichever is later
 * so that long-running events (e.g. AFL H&A season) show their end date, not
 * the round-1 lock date.
 */
export function getEventDisplayDate(
  event_date: string | null | undefined,
  close_date: string | null | undefined
): string | null {
  if (!event_date && !close_date) return null;
  if (!event_date) return close_date!;
  if (!close_date) return event_date;
  return event_date > close_date ? event_date : close_date;
}

export function formatEventDate(date: string | null): string | null {
  if (!date) return null;
  // Append T00:00:00 to date-only strings to avoid UTC parsing shifting the day
  const safeDate = date.includes("T") ? date : date + "T00:00:00";
  return new Date(safeDate).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Sort comparator for upcoming events by display date.
 * Season-long events use close_date; others use event_date.
 */
export function compareByDisplayDate(
  a: { event_date: string | null; close_date: string | null; display_order?: number },
  b: { event_date: string | null; close_date: string | null; display_order?: number }
): number {
  const dateA = a.close_date && a.close_date > (a.event_date ?? "") ? a.close_date : (a.event_date ?? "");
  const dateB = b.close_date && b.close_date > (b.event_date ?? "") ? b.close_date : (b.event_date ?? "");
  if (dateA && dateB) return dateA.localeCompare(dateB);
  if (dateA) return -1;
  if (dateB) return 1;
  return (a.display_order ?? 0) - (b.display_order ?? 0);
}

/** Parse an API date (ISO or date-only) to epoch ms. */
export function toEpochMs(value: string | null | undefined): number | null {
  if (!value) return null;
  const safe = value.includes("T") ? value : `${value}T00:00:00`;
  const ms = new Date(safe).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export interface FeedTimestampFields {
  decided_at?: string | null;
  result_at?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  event_end_date?: string | null;
  event_date?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
}

/**
 * Best "when did this news actually happen" stamp.
 * Result times are always trusted. Scheduled dates and created_at are
 * ignored when they sit in the future so they cannot outrank a real result.
 */
export function bestFeedTimestamp(
  fields: FeedTimestampFields,
  nowMs: number = Date.now()
): string | undefined {
  const trusted = [fields.decided_at, fields.result_at, fields.published_at];
  for (const value of trusted) {
    if (toEpochMs(value) != null) return value!;
  }
  const fallbacks = [
    fields.updated_at,
    fields.event_end_date,
    fields.event_date,
    fields.timestamp,
    fields.created_at,
  ];
  for (const value of fallbacks) {
    const ms = toEpochMs(value);
    if (ms != null && ms <= nowMs) return value!;
  }
  return undefined;
}

/** Newest-first. Non-future times always beat a future or missing stamp. */
export function compareFeedRecency(
  a?: string | null,
  b?: string | null,
  nowMs: number = Date.now()
): number {
  const aMs = toEpochMs(a);
  const bMs = toEpochMs(b);
  const aReal = aMs != null && aMs <= nowMs;
  const bReal = bMs != null && bMs <= nowMs;
  if (aReal && bReal) return bMs - aMs;
  if (aReal) return -1;
  if (bReal) return 1;
  if (aMs != null && bMs != null) return bMs - aMs;
  if (aMs != null) return -1;
  if (bMs != null) return 1;
  return 0;
}
