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
  return fetchJson<EventWithPredictions>(`/events/${id}`);
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
  return fetchJson<{ participant: Participant; predictions: Prediction[]; total_points: number }>(`/participants/${id}`);
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
