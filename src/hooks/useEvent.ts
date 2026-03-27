import { useState, useEffect, useCallback } from "react";
import type { EventWithPredictions } from "../types";
import { getEvent } from "../data/api";

export function useEvent(id: number) {
  const [event, setEvent] = useState<EventWithPredictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getEvent(id)
      .then((data) => {
        setEvent(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { event, loading, error, retry: fetchData };
}
