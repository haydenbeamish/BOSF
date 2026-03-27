import { useState, useEffect, useMemo, useCallback } from "react";
import type { CompetitionEvent } from "../types";
import { getEvents } from "../data/api";

const STATUS_ORDER: Record<string, number> = {
  in_progress: 0,
  upcoming: 1,
  completed: 2,
};

export function useEvents() {
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.sport));
    return ["All", ...Array.from(cats).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const base = selectedCategory === "All" ? events : events.filter((e) => e.sport === selectedCategory);

    return [...base].sort((a, b) => {
      // Primary: status order (live first, then upcoming, then completed)
      const statusDiff = (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1);
      if (statusDiff !== 0) return statusDiff;

      // For completed: most recent first (by display_order descending)
      if (a.status === "completed") {
        return (b.display_order ?? 0) - (a.display_order ?? 0);
      }

      // For upcoming/live: by date ascending (soonest first), nulls last
      if (a.event_date && b.event_date) return a.event_date.localeCompare(b.event_date);
      if (a.event_date) return -1;
      if (b.event_date) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [events, selectedCategory]);

  // Count events by status for the filtered view
  const statusCounts = useMemo(() => {
    const base = selectedCategory === "All" ? events : events.filter((e) => e.sport === selectedCategory);
    return {
      live: base.filter((e) => e.status === "in_progress").length,
      upcoming: base.filter((e) => e.status === "upcoming").length,
      completed: base.filter((e) => e.status === "completed").length,
    };
  }, [events, selectedCategory]);

  return {
    events: filteredEvents,
    allEvents: events,
    categories,
    selectedCategory,
    setSelectedCategory,
    statusCounts,
    loading,
    error,
    retry: fetchData,
  };
}
