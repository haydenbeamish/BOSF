import { useState, useEffect, useMemo } from "react";
import type { CompetitionEvent } from "../types";
import { getEvents } from "../data/api";

export function useEvents() {
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEvents()
      .then((data) => {
        if (!cancelled) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

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
  };
}
