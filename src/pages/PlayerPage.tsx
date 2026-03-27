import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { usePlayer } from "../hooks/usePlayer";
import { PlayerHeader } from "../components/player/PlayerHeader";
import { PlayerEventList } from "../components/player/PlayerEventList";
import { Skeleton } from "../components/ui/Skeleton";

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const { data, loading, error } = usePlayer(numId);

  if (!id || isNaN(numId)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4" role="img" aria-label="error">{"\u{1F6AB}"}</p>
        <p className="text-slate-400 text-sm">Invalid player ID</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <p className="text-4xl mb-4" role="img" aria-label="error">{"\u{1F6AB}"}</p>
        <p className="text-slate-400 text-sm">Failed to load player</p>
        <p className="text-slate-600 text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="px-4 pt-6 flex flex-col gap-3">
        <Skeleton className="h-24 rounded-xl" />
        <Skeleton className="h-12 rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PlayerHeader
        name={data.participant.name}
        totalPoints={data.total_points}
        predictions={data.predictions}
      />
      <PlayerEventList predictions={data.predictions} />
    </motion.div>
  );
}
