import { useQuery } from "@tanstack/react-query";
import type { LeaderboardEntry } from "../types";
import { getLeaderboard, getResults } from "../data/api";
import { LUNCH_CONTRIBUTIONS } from "../lib/feed/index";

export interface EnhancedLeaderboardEntry extends LeaderboardEntry {
  decided_predictions: number;
  win_rate: number;
  penalty: number;
}

async function fetchLeaderboardData(): Promise<EnhancedLeaderboardEntry[]> {
  const [leaderboard, results] = await Promise.all([getLeaderboard(), getResults()]);
  const allPredictions = results.predictions ?? [];

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

  return leaderboard.map((entry, index) => {
    const stats = decidedByPlayer[entry.id];
    const decided = stats?.decided ?? 0;
    const correct = stats?.correct ?? entry.correct_predictions;
    const position = index + 1;
    const lunchEntry = LUNCH_CONTRIBUTIONS.find((lc) => lc.position === position);
    const penalty = lunchEntry?.contribution ?? LUNCH_CONTRIBUTIONS[LUNCH_CONTRIBUTIONS.length - 1].contribution;
    return {
      ...entry,
      decided_predictions: decided,
      win_rate: decided > 0 ? Math.round((correct / decided) * 100) : 0,
      penalty,
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
