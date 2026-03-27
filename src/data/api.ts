import type {
  CompetitionEvent,
  Participant,
  LeaderboardEntry,
  Prediction,
  StatsOverview,
  EventWithPredictions,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "/api/competition";

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getEvents(status?: string): Promise<CompetitionEvent[]> {
  const query = status ? `?status=${status}` : "";
  return fetchJson<CompetitionEvent[]>(`/events${query}`);
}

export async function getEvent(id: number): Promise<EventWithPredictions> {
  return fetchJson<EventWithPredictions>(`/events/${id}`);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchJson<LeaderboardEntry[]>("/leaderboard");
}

export async function getParticipants(): Promise<Participant[]> {
  return fetchJson<Participant[]>("/participants");
}

export async function getParticipant(id: number): Promise<{
  participant: Participant;
  predictions: Prediction[];
  total_points: number;
}> {
  return fetchJson(`/participants/${id}`);
}

export async function getResults(): Promise<{
  events: CompetitionEvent[];
  participants: Participant[];
  predictions: Record<string, Record<string, Prediction>>;
}> {
  return fetchJson("/results");
}

export async function getStats(): Promise<StatsOverview> {
  return fetchJson("/stats");
}
