import { useState, useEffect, useCallback } from "react";
import type { LeaderboardEntry } from "../types";
import { getLeaderboard, getResults } from "../data/api";

export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  decided_predictions: number;
  win_rate: number;
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<EnhancedLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    Promise.all([getLeaderboard(), getResults()])
      .then(([leaderboard, results]) => {
        // Compute per-player decided prediction counts from results data
        const allPredictions = Object.values(results.predictions ?? {}).flatMap((byEvent) =>
          Object.values(byEvent ?? {})
        );

        const decidedByPlayer: Record<number, { correct: number; decided: number }> = {};
        for (const pred of allPredictions) {
          if (pred.is_correct !== null && pred.is_correct !== undefined) {
            if (!decidedByPlayer[pred.participant_id]) {
              decidedByPlayer[pred.participant_id] = { correct: 0, decided: 0 };
            }
            decidedByPlayer[pred.participant_id].decided++;
            if (pred.is_correct === true) {
              decidedByPlayer[pred.participant_id].correct++;
            }
          }
        }

        const enhanced: EnhancedLeaderboardEntry[] = leaderboard.map((entry) => {
          const stats = decidedByPlayer[entry.id];
          const decided = stats?.decided ?? 0;
          const correct = stats?.correct ?? entry.correct_predictions;
          return {
            ...entry,
            decided_predictions: decided,
            win_rate: decided > 0 ? Math.round((correct / decided) * 100) : 0,
          };
        });

        setEntries(enhanced);
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

  const spud = entries.length > 0 ? entries[entries.length - 1] : null;

  return { entries, spud, loading, error, retry: fetchData };
}
