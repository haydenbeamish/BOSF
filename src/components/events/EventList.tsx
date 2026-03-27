import type { CompetitionEvent } from "../../types";
import { EventCard } from "./EventCard";

export function EventList({ events }: { events: CompetitionEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-500 text-sm">
        No events found
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-32">
      {events.map((event, i) => (
        <EventCard key={event.id} event={event} index={i} />
      ))}
    </div>
  );
}
