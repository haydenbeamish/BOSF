import type {
  CompetitionEvent,
  Participant,
  LeaderboardEntry,
  Prediction,
  StatsOverview,
  EventWithPredictions,
  LunchContribution,
} from "../types";
import { sanitizeText } from "../lib/sanitize";

const API_BASE = import.meta.env.VITE_API_URL || "/api/competition";
const API_KEY = import.meta.env.VITE_LASERBEAMNODE_API_KEY;

const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: baseHeaders });
  if (!res.ok) {
    // Include the failed endpoint in the message so errors are actionable.
    throw new Error(`API error (${path}): ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Safely parse a number from unknown API data, falling back to `fallback` on NaN/null. */
function toNum(value: unknown, fallback = 0): number {
  if (value == null) return fallback;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Nullable number — preserves `null` but coerces bad data to null rather than NaN. */
function toNumOrNull(value: unknown): number | null {
  if (value == null) return null;
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : null;
}

function toArray<T>(data: unknown, ...keys: string[]): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (Array.isArray(val)) return val as T[];
    }
    const firstArray = Object.values(data as object).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
}

/** Normalise a raw API event object to our CompetitionEvent shape. */
function normalizeEvent(e: Record<string, unknown>): CompetitionEvent {
  return {
    id: toNum(e.id),
    event_name: sanitizeText(e.event_name, 200),
    sport: sanitizeText(e.sport, 40),
    event_date: (e.event_date as string) ?? null,
    // API sends event_end_date; fall back to close_date if present
    close_date: (e.event_end_date as string) ?? (e.close_date as string) ?? null,
    points_value: toNum(e.available_points ?? e.points_value, 14),
    correct_answer: e.correct_answer ? sanitizeText(e.correct_answer, 120) : null,
    status: (e.status as CompetitionEvent["status"]) ?? "upcoming",
    display_order: toNum(e.event_number ?? e.display_order ?? e.id),
    created_at: e.created_at as string | undefined,
    // Odds fields — populated by backend cron from The Odds API
    favourite: e.favourite ? sanitizeText(e.favourite, 80) : null,
    favourite_odds: toNumOrNull(e.favourite_odds),
    underdog: e.underdog ? sanitizeText(e.underdog, 80) : null,
    underdog_odds: toNumOrNull(e.underdog_odds),
    odds_last_updated: (e.odds_last_updated as string) ?? null,
  };
}

export async function getEvents(status?: string): Promise<CompetitionEvent[]> {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const query = params.toString() ? `?${params}` : "";
  const data = await fetchJson<unknown>(`/events${query}`);
  return toArray<Record<string, unknown>>(data, "events", "data", "results").map(normalizeEvent);
}

function buildEventWithPredictions(raw: Record<string, unknown>): EventWithPredictions {
  const rawPreds = Array.isArray(raw.predictions) ? raw.predictions : [];
  // Sanitize + normalize prediction fields so downstream UI/LLM is safe.
  const predictions = rawPreds.map((p) => {
    const r = p as Record<string, unknown>;
    return {
      id: toNumOrNull(r.id) ?? 0,
      participant_id: toNum(r.participant_id),
      event_id: toNum(r.event_id ?? raw.id),
      prediction: sanitizeText(r.prediction, 120),
      participant_name: sanitizeText(r.participant_name ?? "Unknown", 80),
      is_correct:
        r.is_correct === null || r.is_correct === undefined
          ? null
          : Boolean(r.is_correct),
      points_earned: toNum(r.points_earned),
    };
  });
  return {
    id: toNum(raw.id),
    event_name: sanitizeText(raw.event_name, 200),
    sport: sanitizeText(raw.sport, 40),
    event_date: (raw.event_date as string) ?? null,
    close_date: (raw.event_end_date as string) ?? (raw.close_date as string) ?? null,
    points_value: toNum(raw.available_points ?? raw.points_value, 14),
    correct_answer: raw.correct_answer ? sanitizeText(raw.correct_answer, 120) : null,
    status: (raw.status as CompetitionEvent["status"]) ?? "upcoming",
    display_order: toNum(raw.event_number ?? raw.display_order ?? raw.id),
    created_at: raw.created_at as string | undefined,
    favourite: raw.favourite ? sanitizeText(raw.favourite, 80) : null,
    favourite_odds: toNumOrNull(raw.favourite_odds),
    underdog: raw.underdog ? sanitizeText(raw.underdog, 80) : null,
    underdog_odds: toNumOrNull(raw.underdog_odds),
    odds_last_updated: (raw.odds_last_updated as string) ?? null,
    predictions,
  };
}

export async function getEvent(id: number): Promise<EventWithPredictions> {
  const data = await fetchJson<unknown>(`/events/${id}`);
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    // API may return the event wrapped in { event: {...}, predictions: [...] }
    if (obj.event && typeof obj.event === "object") {
      const event = obj.event as Record<string, unknown>;
      const predictions = Array.isArray(obj.predictions) ? obj.predictions : (event.predictions ?? []);
      return buildEventWithPredictions({ ...event, predictions });
    }
    // Or flat with id + event_name at root
    if ("id" in obj && "event_name" in obj) {
      return buildEventWithPredictions(obj);
    }
  }
  // Fallback: try to build from whatever we got
  return buildEventWithPredictions((data ?? {}) as Record<string, unknown>);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await fetchJson<unknown>("/leaderboard");
  const raw = toArray<Record<string, unknown>>(data, "leaderboard", "data", "results");
  return raw.map((e) => ({
    id: toNum(e.id),
    name: sanitizeText(e.name, 80),
    total_points: toNum(e.total_points),
    correct_predictions: toNum(e.correct_predictions),
    total_predictions: toNum(e.total_predictions),
    rank: toNum(e.rank),
  }));
}

export async function getParticipants(): Promise<Participant[]> {
  const data = await fetchJson<unknown>("/participants");
  const raw = toArray<Record<string, unknown>>(data, "participants", "data", "results");
  return raw.map((p) => ({
    id: toNum(p.id),
    name: sanitizeText(p.name, 80),
    created_at: p.created_at as string | undefined,
  }));
}

export async function getParticipant(id: number): Promise<{
  participant: Participant;
  predictions: Prediction[];
  total_points: number;
}> {
  const data = await fetchJson<unknown>(`/participants/${id}`);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    // Handle case where participant data is at root or nested
    const rawParticipant = (obj.participant ?? obj.data ?? obj) as Record<string, unknown>;
    const participant: Participant = {
      id: toNum(rawParticipant.id ?? id),
      name: sanitizeText(rawParticipant.name, 80),
      created_at: rawParticipant.created_at as string | undefined,
    };
    const rawPredictions = Array.isArray(obj.predictions)
      ? (obj.predictions as Record<string, unknown>[])
      : [];
    const predictions: Prediction[] = rawPredictions.map((p) => ({
      id: toNum(p.id),
      participant_id: toNum(p.participant_id ?? id),
      event_id: toNum(p.event_id),
      prediction: sanitizeText(p.prediction, 120),
      is_correct:
        p.is_correct === null || p.is_correct === undefined
          ? null
          : Boolean(p.is_correct),
      points_earned: toNum(p.points_earned),
      participant_name: p.participant_name
        ? sanitizeText(p.participant_name, 80)
        : undefined,
      event_name: p.event_name ? sanitizeText(p.event_name, 200) : undefined,
      sport: p.sport ? sanitizeText(p.sport, 40) : undefined,
      status: p.status as Prediction["status"],
      correct_answer: p.correct_answer
        ? sanitizeText(p.correct_answer, 120)
        : null,
    }));
    const participantObj = obj.participant as Record<string, unknown> | undefined;
    const total_points = toNum(
      obj.total_points ??
        (participantObj && participantObj.total_points) ??
        predictions.reduce((sum, p) => sum + (p.points_earned || 0), 0)
    );
    return { participant, predictions, total_points };
  }
  return data as { participant: Participant; predictions: Prediction[]; total_points: number };
}

export async function getResults(): Promise<{
  events: CompetitionEvent[];
  participants: Participant[];
  predictions: Prediction[];
}> {
  const raw = await fetchJson<Record<string, unknown>>("/results");

  const rawParticipantsRaw = toArray<Record<string, unknown>>(raw, "participants");
  const participants: Participant[] = rawParticipantsRaw.map((p) => ({
    id: toNum(p.id),
    name: sanitizeText(p.name, 80),
    created_at: p.created_at as string | undefined,
  }));
  const nameToId = new Map(participants.map((p) => [p.name, p.id]));

  const rawEvents = toArray<Record<string, unknown>>(raw, "events");
  const events: CompetitionEvent[] = rawEvents.map(normalizeEvent);

  // Flatten per-event embedded predictions (keyed by participant name) into a flat array
  const predictions: Prediction[] = rawEvents.flatMap((e) => {
    const eventId = toNum(e.id);
    const embeddedPreds = e.predictions;
    if (!embeddedPreds || typeof embeddedPreds !== "object" || Array.isArray(embeddedPreds)) return [];
    return Object.entries(embeddedPreds as Record<string, Record<string, unknown>>).map(
      ([rawName, pred]) => {
        const name = sanitizeText(rawName, 80);
        return {
          id: 0,
          event_id: eventId,
          participant_id: nameToId.get(name) ?? 0,
          prediction: sanitizeText(pred.prediction, 120),
          is_correct:
            pred.is_correct === null || pred.is_correct === undefined
              ? null
              : Boolean(pred.is_correct),
          points_earned: toNum(pred.points_awarded ?? pred.points_earned),
          participant_name: name,
        };
      }
    );
  });

  return { events, participants, predictions };
}

export async function getFeed(options?: {
  limit?: number;
  offset?: number;
  type?: string;
  since?: string;
  category?: string;
}): Promise<unknown[]> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", String(options.limit));
  if (options?.offset) params.set("offset", String(options.offset));
  if (options?.type) params.set("type", options.type);
  if (options?.since) params.set("since", options.since);
  if (options?.category) params.set("category", options.category);
  const query = params.toString() ? `?${params}` : "";
  const data = await fetchJson<unknown>(`/feed${query}`);
  return toArray<unknown>(data, "feed", "items", "data", "results");
}

export async function getStats(): Promise<StatsOverview> {
  const [stats, lb] = await Promise.all([
    fetchJson<StatsOverview>("/stats"),
    getLeaderboard(),
  ]);

  // Build the full lunch contributions table (14 positions) with participant names
  const { LUNCH_CONTRIBUTIONS } = await import("../lib/feed/index");
  const lunch_contributions: LunchContribution[] = LUNCH_CONTRIBUTIONS.map((entry) => {
    const player = lb[entry.position - 1];
    return {
      position: entry.position,
      contribution: entry.contribution,
      participant_name: player?.name,
    };
  });

  return { ...stats, lunch_contributions };
}
