import type { CompetitionEvent, Prediction } from "../types";

/**
 * BOSF Scoring System:
 * Each event has a points pool (default 14 — one point per participant).
 * The pool is divided equally among all correct predictors.
 * E.g., 1 correct = 14 pts, 2 correct = 7 pts each, 7 correct = 2 pts each.
 */

const DEFAULT_POOL = 14;

/** Calculate points earned per correct predictor for a single event. */
export function pointsPerCorrect(event: CompetitionEvent, correctCount: number): number {
  if (correctCount <= 0) return 0;
  const pool = event.points_value || DEFAULT_POOL;
  return pool / correctCount;
}

/**
 * Recalculate points for all predictions using the pool system.
 * Returns a Map of participant_id → total recalculated points.
 */
export function recalculatePoints(
  events: CompetitionEvent[],
  predictions: Prediction[]
): Map<number, number> {
  const totals = new Map<number, number>();

  // Group predictions by event
  const predsByEvent = new Map<number, Prediction[]>();
  for (const p of predictions) {
    const eid = Number(p.event_id);
    const arr = predsByEvent.get(eid);
    if (arr) arr.push(p);
    else predsByEvent.set(eid, [p]);
  }

  for (const event of events) {
    if (event.status !== "completed" || !event.correct_answer) continue;

    const eventPreds = predsByEvent.get(Number(event.id)) ?? [];
    const correctPreds = eventPreds.filter((p) => p.is_correct === true);
    const ptsEach = pointsPerCorrect(event, correctPreds.length);

    for (const pred of correctPreds) {
      const pid = Number(pred.participant_id);
      totals.set(pid, (totals.get(pid) ?? 0) + ptsEach);
    }
  }

  return totals;
}

/**
 * Calculate the points a specific prediction earned under the pool system.
 * Returns 0 for incorrect/pending predictions.
 */
export function predictionPointsEarned(
  prediction: Prediction,
  events: CompetitionEvent[],
  allPredictions: Prediction[]
): number {
  if (prediction.is_correct !== true) return 0;

  const event = events.find((e) => Number(e.id) === Number(prediction.event_id));
  if (!event || event.status !== "completed") return 0;

  const eventPreds = allPredictions.filter(
    (p) => Number(p.event_id) === Number(event.id)
  );
  const correctCount = eventPreds.filter((p) => p.is_correct === true).length;

  return pointsPerCorrect(event, correctCount);
}
