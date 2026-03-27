import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CompetitionEvent } from "../types";
import { getEvents } from "../data/api";

const STATUS_ORDER: Record<string, number> = {
  in_progress: 0,
  upcoming: 1,
  completed: 2,
};

export function useEvents() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: events = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  const categories = useMemo(() => {
    const cats = new Set(events.map((e: CompetitionEvent) => e.sport));
    return ["All", ...Array.from(cats).sort()];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const base = selectedCategory === "All" ? events : events.filter((e: CompetitionEvent) => e.sport === selectedCategory);

    return [...base].sort((a: CompetitionEvent, b: CompetitionEvent) => {
      const statusDiff = (STATUS_ORDER[a.status] ?? 1) - (STATUS_ORDER[b.status] ?? 1);
      if (statusDiff !== 0) return statusDiff;

      if (a.status === "completed") {
        return (b.display_order ?? 0) - (a.display_order ?? 0);
      }

      if (a.event_date && b.event_date) return a.event_date.localeCompare(b.event_date);
      if (a.event_date) return -1;
      if (b.event_date) return 1;
      return (a.display_order ?? 0) - (b.display_order ?? 0);
    });
  }, [events, selectedCategory]);

  const statusCounts = useMemo(() => {
    const base = selectedCategory === "All" ? events : events.filter((e: CompetitionEvent) => e.sport === selectedCategory);
    return {
      live: base.filter((e: CompetitionEvent) => e.status === "in_progress").length,
      upcoming: base.filter((e: CompetitionEvent) => e.status === "upcoming").length,
      completed: base.filter((e: CompetitionEvent) => e.status === "completed").length,
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
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
