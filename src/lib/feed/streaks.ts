import type { CompetitionEvent, Prediction } from "../../types";
import { isCorrect, isIncorrect } from "../predictions";

const STREAK_THRESHOLD = 3;

export { STREAK_THRESHOLD };

export function computeStreaks(
  participantId: number,
  predictions: Prediction[],
  events: CompetitionEvent[]
): { winStreak: number; loseStreak: number } {
  const completedEventIds = new Set(
    events.filter((e) => e.status === "completed").map((e) => Number(e.id))
  );

  // Pre-index events by ID for O(1) lookups during sort
  const eventMap = new Map(events.map((e) => [Number(e.id), e]));

  const sorted = predictions
    .filter((p) => Number(p.participant_id) === Number(participantId) && completedEventIds.has(Number(p.event_id)))
    .sort((a, b) => {
      const eA = eventMap.get(Number(a.event_id));
      const eB = eventMap.get(Number(b.event_id));
      return (eB?.display_order ?? 0) - (eA?.display_order ?? 0);
    });

  let winStreak = 0;
  let loseStreak = 0;

  for (const pred of sorted) {
    if (isCorrect(pred.is_correct)) {
      if (loseStreak > 0) break;
      winStreak++;
    } else if (isIncorrect(pred.is_correct)) {
      if (winStreak > 0) break;
      loseStreak++;
    }
  }

  return { winStreak, loseStreak };
}
