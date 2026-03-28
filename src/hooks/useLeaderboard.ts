import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "../types";
import { getLeaderboard, getResults } from "../data/api";

export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  decided_predictions: number;
  win_rate: number;
  /** Recent form: array of booleans (most recent first), true = correct, false = incorrect */
  recent_form: boolean[];
}

async function fetchLeaderboardData(): Promise<EnhancedLeaderboardEntry[]> {
  const [leaderboard, results] = await Promise.all([getLeaderboard(), getResults()]);
  const allPredictions = results.predictions ?? [];

  const decidedByPlayer: Record<number, { correct: number; decided: number }> = {};
  const predictionsByPlayer: Record<number, typeof allPredictions> = {};
  for (const pred of allPredictions) {
    if (pred.is_correct !== null && pred.is_correct !== undefined) {
      if (!decidedByPlayer[pred.participant_id]) {
        decidedByPlayer[pred.participant_id] = { correct: 0, decided: 0 };
        predictionsByPlayer[pred.participant_id] = [];
      }
      decidedByPlayer[pred.participant_id].decided++;
      if (pred.is_correct === true) {
        decidedByPlayer[pred.participant_id].correct++;
      }
      predictionsByPlayer[pred.participant_id].push(pred);
    }
  }

  return leaderboard.map((entry) => {
    const stats = decidedByPlayer[entry.id];
    const decided = stats?.decided ?? 0;
    const correct = stats?.correct ?? entry.correct_predictions;
    // Recent form: sort by event_id descending (most recent first), take last 5
    const playerPreds = predictionsByPlayer[entry.id] ?? [];
    const recent_form = playerPreds
      .sort((a, b) => (b.event_id ?? 0) - (a.event_id ?? 0))
      .slice(0, 5)
      .map((p) => p.is_correct === true);
    return {
      ...entry,
      decided_predictions: decided,
      win_rate: decided > 0 ? Math.round((correct / decided) * 100) : 0,
      recent_form,
    };
  });
}

export function useLeaderboard() {
  const { data: entries = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: fetchLeaderboardData,
  });

  // Spud = last place, but only if they're actually behind everyone else (not tied)
  const spud = (() => {
    if (entries.length < 2) return null;
    const last = entries[entries.length - 1];
    const secondLast = entries[entries.length - 2];
    if (last.total_points < secondLast.total_points) return last;
    return null;
  })();

  return {
    entries,
    spud,
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
