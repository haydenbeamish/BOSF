import { useState, useEffect, useCallback } from "react";
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

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    getParticipant(id)
      .then((result) => {
        setData(result);
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

  return { data, loading, error, retry: fetchData };
}
