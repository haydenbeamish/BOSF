import { useQuery } from "@tanstack/react-query";
import type { Participant, Prediction } from "../types";
import { getParticipant } from "../data/api";

interface PlayerData {
  participant: Participant;
  predictions: Prediction[];
  total_points: number;
}

export function usePlayer(id: number) {
  // React Query's built-in structuralSharing ensures that `data` keeps the same
  // reference when the payload hasn't changed — so `useMemo([data])` downstream
  // only re-runs on real changes. No custom `select` needed.
  const {
    data = null,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<PlayerData, Error, PlayerData>({
    queryKey: ["player", id],
    queryFn: () => getParticipant(id),
    enabled: id > 0 && !isNaN(id),
  });

  return {
    data,
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => {
      refetch();
    },
  };
}
