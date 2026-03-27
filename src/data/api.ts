import type {
  CompetitionEvent,
  Participant,
  LeaderboardEntry,
  Prediction,
  StatsOverview,
  EventWithPredictions,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api/competition";
const API_KEY = import.meta.env.VITE_LASERBEAMNODE_API_KEY;

const baseHeaders: HeadersInit = {
  "Content-Type": "application/json",
  ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
};

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: baseHeaders });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
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

export async function getEvents(status?: string): Promise<CompetitionEvent[]> {
  const query = status ? `?status=${status}` : "";
  const data = await fetchJson<unknown>(`/events${query}`);
  return toArray<CompetitionEvent>(data, "events", "data", "results");
}

export async function getEvent(id: number): Promise<EventWithPredictions> {
  const data = await fetchJson<unknown>(`/events/${id}`);
  // API may return the event directly or wrapped in { event: {...}, predictions: [...] }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const obj = data as Record<string, unknown>;
    // If wrapped: merge event fields + predictions into a single object
    if (obj.event && typeof obj.event === "object") {
      const event = obj.event as Record<string, unknown>;
      const predictions = Array.isArray(obj.predictions) ? obj.predictions : (event.predictions ?? []);
      return { ...event, predictions } as unknown as EventWithPredictions;
    }
    // If flat with predictions array, return as-is
    if ("id" in obj && "event_name" in obj) {
      if (!Array.isArray(obj.predictions)) {
        (obj as Record<string, unknown>).predictions = [];
      }
      return data as EventWithPredictions;
    }
  }
  return data as EventWithPredictions;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await fetchJson<unknown>("/leaderboard");
  return toArray<LeaderboardEntry>(data, "leaderboard", "data", "results");
}

export async function getParticipants(): Promise<Participant[]> {
  const data = await fetchJson<unknown>("/participants");
  return toArray<Participant>(data, "participants", "data", "results");
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
    const participant = (obj.participant ?? obj.data ?? obj) as Participant;
    const rawPredictions = Array.isArray(obj.predictions) ? obj.predictions as Prediction[] : [];
    // Normalize is_correct: API may return 1/0 instead of true/false
    const predictions = rawPredictions.map((p) => ({
      ...p,
      is_correct: p.is_correct === null || p.is_correct === undefined ? null : Boolean(p.is_correct),
    }));
    const participantObj = obj.participant as Record<string, unknown> | undefined;
    const total_points =
      typeof obj.total_points === "number" ? obj.total_points :
      (participantObj && typeof participantObj === "object" && typeof participantObj.total_points === "number") ? participantObj.total_points :
      predictions.reduce((sum: number, p: Prediction) => sum + (p.points_earned || (p.is_correct ? 1 : 0)), 0);
    return { participant, predictions, total_points };
  }
  return data as { participant: Participant; predictions: Prediction[]; total_points: number };
}

export async function getResults(): Promise<{
  events: CompetitionEvent[];
  participants: Participant[];
  predictions: Record<string, Record<string, Prediction>>;
}> {
  return fetchJson<{ events: CompetitionEvent[]; participants: Participant[]; predictions: Record<string, Record<string, Prediction>> }>("/results");
}

export async function getStats(): Promise<StatsOverview> {
  return fetchJson("/stats");
}
