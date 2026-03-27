import { useState, useEffect } from "react";
import type { EventWithPredictions } from "../types";
import { getEvent } from "../data/api";

export function useEvent(id: number) {
  const [event, setEvent] = useState<EventWithPredictions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEvent(id)
      .then((data) => {
        if (!cancelled) {
          setEvent(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  return { event, loading, error };
}
