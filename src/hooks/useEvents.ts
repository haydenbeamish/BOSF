import { useState, useEffect, useMemo, useCallback } from "react";
import type { CompetitionEvent } from "../types";
import { getEvents } from "../data/api";

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
    if (selectedCategory === "All") return events;
    return events.filter((e) => e.sport === selectedCategory);
  }, [events, selectedCategory]);

  return {
    events: filteredEvents,
    allEvents: events,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    retry: fetchData,
  };
}
