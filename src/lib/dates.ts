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
