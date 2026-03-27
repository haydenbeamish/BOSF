import type { LeaderboardEntry } from "../../types";
import { PlayerRow } from "./PlayerRow";

interface LeaderboardListProps {
  entries: LeaderboardEntry[];
}

export function LeaderboardList({ entries }: LeaderboardListProps) {
  const spudId = entries.length > 0 ? entries[entries.length - 1].id : null;

  return (
    <div className="flex flex-col gap-2 px-4">
      {entries.map((entry, i) => (
        <PlayerRow
          key={entry.id}
          entry={entry}
          isSpud={entry.id === spudId}
          index={i}
        />
      ))}
    </div>
  );
}
