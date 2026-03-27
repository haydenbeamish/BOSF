import { useState, useEffect } from "react";
import type { LeaderboardEntry } from "../types";
import { getLeaderboard } from "../data/api";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getLeaderboard()
      .then((data) => {
        if (!cancelled) {
          setEntries(data);
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
  }, []);

  const spud = entries.length > 0 ? entries[entries.length - 1] : null;

  return { entries, spud, loading, error };
}
