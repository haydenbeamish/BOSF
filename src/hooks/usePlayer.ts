import { useQuery } from "@tanstack/react-query";
import type { Participant, Prediction } from "../types";
import { getParticipant, getResults, getEvents } from "../data/api";
import { pointsPerCorrect } from "../lib/points";

interface PlayerData {
  participant: Participant;
  predictions: Prediction[];
  total_points: number;
}

async function fetchPlayerData(id: number): Promise<PlayerData> {
  const [playerData, results, allEvents] = await Promise.all([
    getParticipant(id),
    getResults(),
    getEvents(),
  ]);

  const allPredictions = results.predictions ?? [];

  // Recalculate points for each of this player's predictions using the pool system
  let recalcTotal = 0;
  const enrichedPredictions = playerData.predictions.map((pred) => {
    if (pred.is_correct !== true) return { ...pred, points_earned: 0 };

    const event = allEvents.find((e) => Number(e.id) === Number(pred.event_id));
    if (!event || event.status !== "completed") return { ...pred, points_earned: 0 };

    // Count how many people got this event correct
    const eventPreds = allPredictions.filter(
      (p) => Number(p.event_id) === Number(event.id)
    );
    const correctCount = eventPreds.filter((p) => p.is_correct === true).length;
    const pts = pointsPerCorrect(event, correctCount);
    recalcTotal += pts;

    return { ...pred, points_earned: Math.round(pts * 100) / 100 };
  });

  return {
    participant: playerData.participant,
    predictions: enrichedPredictions,
    total_points: Math.round(recalcTotal * 100) / 100,
  };
}

export function usePlayer(id: number) {
  const { data = null, isLoading: loading, error, refetch } = useQuery<PlayerData>({
    queryKey: ["player", id],
    queryFn: () => fetchPlayerData(id),
  });

  return {
    data,
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
