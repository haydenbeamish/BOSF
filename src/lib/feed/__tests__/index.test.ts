import { describe, it, expect } from "vitest";
import { generateNewsFeed } from "../index";
import type { CompetitionEvent, Prediction, LeaderboardEntry, Participant } from "../../../types";

const participants: Participant[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" },
];

const leaderboard: LeaderboardEntry[] = [
  { id: 1, name: "Alice", total_points: 5, correct_predictions: 5, total_predictions: 8, rank: 1 },
  { id: 2, name: "Bob", total_points: 4, correct_predictions: 4, total_predictions: 8, rank: 2 },
  { id: 3, name: "Charlie", total_points: 2, correct_predictions: 2, total_predictions: 8, rank: 3 },
];

function makeCompletedEvent(id: number, answer: string): CompetitionEvent {
  return {
    id,
    event_name: `Event ${id}`,
    sport: "Test",
    event_date: null,
    close_date: null,
    points_value: 1,
    correct_answer: answer,
    status: "completed",
    display_order: id,
  };
}

function makePred(participantId: number, eventId: number, isCorrect: boolean): Prediction {
  return {
    id: 0,
    participant_id: participantId,
    event_id: eventId,
    prediction: isCorrect ? "Correct" : "Wrong",
    is_correct: isCorrect,
    points_earned: isCorrect ? 1 : 0,
    participant_name: participants.find(p => p.id === participantId)?.name,
  };
}

describe("generateNewsFeed", () => {
  it("does not generate result cards client-side (backend feed is the source)", () => {
    const events = [makeCompletedEvent(1, "Team A")];
    const predictions = [
      makePred(1, 1, true),
      makePred(2, 1, false),
      makePred(3, 1, false),
    ];

    const feed = generateNewsFeed(events, participants, predictions, leaderboard);
    expect(feed.filter((f) => f.type === "event_result")).toHaveLength(0);
    expect(feed.filter((f) => f.type === "everyone_wrong")).toHaveLength(0);
    expect(feed.filter((f) => f.type === "perfect_pick")).toHaveLength(0);
  });

  it("generates close_race when top 2 are within 3 points", () => {
    const feed = generateNewsFeed([], participants, [], leaderboard);
    const races = feed.filter(f => f.type === "close_race");
    expect(races).toHaveLength(1);
  });

  it("does not generate close_race when gap is large", () => {
    const wideLeaderboard: LeaderboardEntry[] = [
      { id: 1, name: "Alice", total_points: 10, correct_predictions: 10, total_predictions: 10, rank: 1 },
      { id: 2, name: "Bob", total_points: 2, correct_predictions: 2, total_predictions: 10, rank: 2 },
    ];
    const feed = generateNewsFeed([], participants, [], wideLeaderboard);
    const races = feed.filter(f => f.type === "close_race");
    expect(races).toHaveLength(0);
  });

  it("sorts by priority descending", () => {
    const events = [makeCompletedEvent(1, "Team A")];
    const predictions = [
      makePred(1, 1, true),
      makePred(2, 1, false),
      makePred(3, 1, false),
    ];

    const feed = generateNewsFeed(events, participants, predictions, leaderboard);
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1].priority).toBeGreaterThanOrEqual(feed[i].priority);
    }
  });

  it("returns empty feed when there is no data", () => {
    const feed = generateNewsFeed([], [], [], []);
    expect(feed).toHaveLength(0);
  });

  it("stamps leader/last-place banter with the latest decided_at", () => {
    const events = [
      { ...makeCompletedEvent(1, "A"), decided_at: "2026-06-01T00:00:00.000Z" },
      { ...makeCompletedEvent(2, "B"), decided_at: "2026-08-25T12:08:33.773Z" },
    ];
    const feed = generateNewsFeed(events, participants, [], leaderboard);
    const banter = feed.filter(
      (f) => f.type === "leader_banter" || f.type === "last_place_banter"
    );
    expect(banter).toHaveLength(2);
    expect(banter.every((f) => f.timestamp === "2026-08-25T12:08:33.773Z")).toBe(true);
    expect(feed[0].timestamp).toBe("2026-08-25T12:08:33.773Z");
  });
});
