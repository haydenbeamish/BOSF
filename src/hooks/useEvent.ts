import { useQuery } from "@tanstack/react-query";
import { getEvent } from "../data/api";
import { chooseLivePollInterval } from "./useLivePollInterval";

export function useEvent(id: number) {
  const { data: event = null, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["event", id],
    queryFn: () => getEvent(id),
    enabled: id > 0 && !isNaN(id),
    refetchInterval: (query) => {
      const evt = query.state.data;
      return evt ? chooseLivePollInterval([evt]) : 5 * 60 * 1000;
    },
  });

  return {
    event,
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
