import { useState, useEffect } from "react";
import type { Participant, Prediction } from "../types";
import { getParticipant } from "../data/api";

interface PlayerData {
  participant: Participant;
  predictions: Prediction[];
  total_points: number;
}

export function usePlayer(id: number) {
  const [data, setData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getParticipant(id)
      .then((result) => {
        if (!cancelled) {
          setData(result);
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

  return { data, loading, error };
}
