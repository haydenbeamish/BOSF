import type { CompetitionEvent, Prediction, LeaderboardEntry, Participant } from "../types";

export type FeedItemType =
  | "event_result"
  | "outlier_alert"
  | "winning_streak"
  | "losing_streak"
  | "perfect_pick"
  | "everyone_wrong"
  | "close_race"
  | "hot_take";

export interface FeedItem {
  id: string;
  type: FeedItemType;
  emoji: string;
  headline: string;
  subtext: string;
  playerName?: string;
  playerId?: number;
  eventId?: number;
  eventName?: string;
  sport?: string;
  timestamp?: string;
  priority: number; // higher = more important
}

// --- Constants ---
const STREAK_THRESHOLD = 3;
const OUTLIER_PERCENTAGE = 0.2;
const MAX_OUTLIERS = 6;

// --- Banter templates ---

const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} has lost ${n} in a row`,
    subtext: `Someone check on them... ${n} wrong picks and counting.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is ice cold`,
    subtext: `${n} straight Ls. Couldn't pick their nose right now.`,
  }),
  (name: string, n: number) => ({
    headline: `Thoughts and prayers for ${name}`,
    subtext: `${n} wrong in a row. At this point it's a talent.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a historic losing run`,
    subtext: `${n} consecutive wrong picks. Maybe try picking the opposite?`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is the king of bad takes`,
    subtext: `${n} wrong on the trot. Their crystal ball is well and truly broken.`,
  }),
];

const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is absolutely cooking`,
    subtext: `${n} correct in a row. Hide your predictions.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't miss`,
    subtext: `${n} straight wins. Is this person from the future?`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a tear`,
    subtext: `${n} in a row! The rest of you should be worried.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is seeing the Matrix`,
    subtext: `${n} correct picks running. Everyone else is playing catch-up.`,
  }),
];

const PERFECT_PICK_TEMPLATES = [
  (name: string, event: string) => ({
    headline: `Big brain move from ${name}`,
    subtext: `Only one to get ${event} right. Galaxy brain stuff.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} stood alone and was proven right`,
    subtext: `The only correct pick on ${event}. Respect.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} backed themselves on ${event}`,
    subtext: `Sole correct pick. Sometimes the crowd is wrong.`,
  }),
];

const EVERYONE_WRONG_TEMPLATES = [
  (event: string) => ({
    headline: `Nobody saw that coming`,
    subtext: `Not a single correct pick on ${event}. The collective brain failed.`,
  }),
  (event: string) => ({
    headline: `A complete wipeout on ${event}`,
    subtext: `Zero correct picks. Should have asked a coin.`,
  }),
  (event: string) => ({
    headline: `${event} broke everyone's brain`,
    subtext: `Not one correct pick across the board. Nobody saw it coming.`,
  }),
];

const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `Bold call from ${name}`,
    subtext: `Picked "${prediction}" for ${event} — everyone else went "${popular}".`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going rogue on ${event}`,
    subtext: `"${prediction}" — a lone wolf pick that could pay off big.`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} with the wildcard on ${event}`,
    subtext: `Backing "${prediction}" against the pack. Fortune favours the bold?`,
  }),
];

const EVENT_RESULT_TEMPLATES = [
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${answer} wins ${event}`,
    subtext: `${correct} of ${total} got it right${correct === 0 ? " — absolute scenes" : correct === total ? " — too easy" : ""}.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event} is decided`,
    subtext: `${answer} was the answer. ${correct}/${total} correct picks.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event}: ${answer} gets it done`,
    subtext: `${correct === 0 ? "Nobody" : `${correct} of ${total}`} called it right.`,
  }),
];

const CLOSE_RACE_TEMPLATES = [
  (name1: string, name2: string, gap: number) => ({
    headline: `It's neck and neck at the top`,
    subtext: `${name1} leads ${name2} by just ${gap} point${gap === 1 ? "" : "s"}. Any event could flip it.`,
  }),
  (name1: string, name2: string, _gap: number) => ({
    headline: `${name1} vs ${name2} — the race is on`,
    subtext: `The gap at the top is razor thin. One big pick changes everything.`,
  }),
];

// Use a seeded index based on string hash for deterministic template selection
function hashPick<T>(templates: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return templates[Math.abs(hash) % templates.length];
}

// --- Streak detection ---

function computeStreaks(
  participantId: number,
  predictions: Prediction[],
  events: CompetitionEvent[]
): { winStreak: number; loseStreak: number } {
  const completedEventIds = new Set(
    events.filter((e) => e.status === "completed").map((e) => Number(e.id))
  );

  const sorted = predictions
    .filter((p) => Number(p.participant_id) === Number(participantId) && completedEventIds.has(Number(p.event_id)))
    .sort((a, b) => {
      const eA = events.find((e) => Number(e.id) === Number(a.event_id));
      const eB = events.find((e) => Number(e.id) === Number(b.event_id));
      return (eB?.display_order ?? 0) - (eA?.display_order ?? 0);
    });

  let winStreak = 0;
  let loseStreak = 0;

  for (const pred of sorted) {
    const correct = pred.is_correct === true || (pred.is_correct as unknown) === 1;
    const incorrect = pred.is_correct === false || (pred.is_correct as unknown) === 0;
    if (correct) {
      if (loseStreak > 0) break;
      winStreak++;
    } else if (incorrect) {
      if (winStreak > 0) break;
      loseStreak++;
    }
  }

  return { winStreak, loseStreak };
}

// --- Outlier detection ---

interface OutlierInfo {
  participant: Participant;
  prediction: Prediction;
  event: CompetitionEvent;
  popularPick: string;
  pickCount: number;
  totalPicks: number;
}

function findOutliers(
  events: CompetitionEvent[],
  allPredictions: Prediction[],
  participants: Participant[]
): OutlierInfo[] {
  const outliers: OutlierInfo[] = [];
  const upcomingEvents = events.filter((e) => e.status !== "completed");

  for (const event of upcomingEvents) {
    const eventPreds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));
    if (eventPreds.length < 3) continue;

    const counts: Record<string, number> = {};
    for (const p of eventPreds) {
      const key = p.prediction.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const popularPick = sorted[0]?.[0] ?? "";
    const threshold = Math.max(1, Math.floor(eventPreds.length * OUTLIER_PERCENTAGE));

    for (const pred of eventPreds) {
      const key = pred.prediction.toLowerCase().trim();
      const count = counts[key] ?? 0;
      if (count <= threshold && key !== popularPick) {
        const participant = participants.find((p) => Number(p.id) === Number(pred.participant_id));
        if (participant) {
          outliers.push({
            participant,
            prediction: pred,
            event,
            popularPick: sorted[0]?.[0] ?? "",
            pickCount: count,
            totalPicks: eventPreds.length,
          });
        }
      }
    }
  }

  return outliers;
}

// --- Main feed generator ---

export function generateNewsFeed(
  events: CompetitionEvent[],
  participants: Participant[],
  allPredictions: Prediction[],
  leaderboard: LeaderboardEntry[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  const completedEvents = events
    .filter((e) => e.status === "completed" && e.correct_answer)
    .sort((a, b) => (b.display_order ?? 0) - (a.display_order ?? 0));

  // 1. Event results
  for (const event of completedEvents) {
    const preds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));
    const correctCount = preds.filter((p) => Boolean(p.is_correct)).length;
    const template = hashPick(EVENT_RESULT_TEMPLATES, `result-${event.id}`);
    const { headline, subtext } = template(
      event.event_name,
      event.correct_answer!,
      correctCount,
      preds.length
    );

    feed.push({
      id: `result-${event.id}`,
      type: "event_result",
      emoji: "🏆",
      headline,
      subtext,
      eventId: event.id,
      eventName: event.event_name,
      sport: event.sport,
      timestamp: event.event_date ?? event.created_at,
      priority: 10,
    });

    // Check if nobody got it right
    if (correctCount === 0 && preds.length > 0) {
      const t = hashPick(EVERYONE_WRONG_TEMPLATES, `wrong-${event.id}`);
      const { headline: h, subtext: s } = t(event.event_name);
      feed.push({
        id: `wrong-${event.id}`,
        type: "everyone_wrong",
        emoji: "😂",
        headline: h,
        subtext: s,
        eventId: event.id,
        eventName: event.event_name,
        sport: event.sport,
        timestamp: event.event_date ?? event.created_at,
        priority: 8,
      });
    }

    // Check if only one person got it right
    if (correctCount === 1) {
      const winner = preds.find((p) => p.is_correct === true || (p.is_correct as unknown) === 1);
      if (winner) {
        const t = hashPick(PERFECT_PICK_TEMPLATES, `perfect-${event.id}`);
        const { headline: h, subtext: s } = t(
          winner.participant_name ?? "Someone",
          event.event_name
        );
        feed.push({
          id: `perfect-${event.id}`,
          type: "perfect_pick",
          emoji: "🎯",
          headline: h,
          subtext: s,
          playerName: winner.participant_name,
          playerId: winner.participant_id,
          eventId: event.id,
          eventName: event.event_name,
          sport: event.sport,
          timestamp: event.event_date ?? event.created_at,
          priority: 9,
        });
      }
    }
  }

  // 2. Streaks per participant
  for (const participant of participants) {
    const { winStreak, loseStreak } = computeStreaks(
      participant.id,
      allPredictions,
      events
    );

    if (winStreak >= STREAK_THRESHOLD) {
      const t = hashPick(WINNING_STREAK_TEMPLATES, `wstreak-${participant.id}`);
      const { headline, subtext } = t(participant.name, winStreak);
      feed.push({
        id: `wstreak-${participant.id}`,
        type: "winning_streak",
        emoji: "🔥",
        headline,
        subtext,
        playerName: participant.name,
        playerId: participant.id,
        priority: 7,
      });
    }

    if (loseStreak >= STREAK_THRESHOLD) {
      const t = hashPick(LOSING_STREAK_TEMPLATES, `lstreak-${participant.id}`);
      const { headline, subtext } = t(participant.name, loseStreak);
      feed.push({
        id: `lstreak-${participant.id}`,
        type: "losing_streak",
        emoji: "💀",
        headline,
        subtext,
        playerName: participant.name,
        playerId: participant.id,
        priority: 7,
      });
    }
  }

  // 3. Outlier alerts for upcoming events
  const outliers = findOutliers(events, allPredictions, participants);
  for (const outlier of outliers.slice(0, MAX_OUTLIERS)) {
    const t = hashPick(OUTLIER_TEMPLATES, `outlier-${outlier.prediction.id}`);
    const { headline, subtext } = t(
      outlier.participant.name,
      outlier.prediction.prediction,
      outlier.event.event_name,
      outlier.popularPick
    );
    feed.push({
      id: `outlier-${outlier.prediction.id}`,
      type: "outlier_alert",
      emoji: "🔮",
      headline,
      subtext,
      playerName: outlier.participant.name,
      playerId: outlier.participant.id,
      eventId: outlier.event.id,
      eventName: outlier.event.event_name,
      sport: outlier.event.sport,
      priority: 5,
    });
  }

  // 4. Close race at the top of the leaderboard
  if (leaderboard.length >= 2) {
    const first = leaderboard[0];
    const second = leaderboard[1];
    const gap = first.total_points - second.total_points;

    if (gap <= 3 && gap >= 0 && first.total_points > 0) {
      const t = hashPick(CLOSE_RACE_TEMPLATES, `race-${first.id}-${second.id}`);
      const { headline, subtext } = t(first.name, second.name, gap);
      feed.push({
        id: `close-race`,
        type: "close_race",
        emoji: "⚡",
        headline,
        subtext,
        priority: 8,
      });
    }
  }

  // Sort: highest priority first, then by timestamp (newest first)
  feed.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
    return 0;
  });

  return feed;
}
