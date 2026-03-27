import type { CompetitionEvent, Prediction, LeaderboardEntry, Participant } from "../types";

export type FeedItemType =
  | "event_result"
  | "outlier_alert"
  | "winning_streak"
  | "losing_streak"
  | "perfect_pick"
  | "everyone_wrong"
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
  // Get completed event IDs sorted by display_order (most recent first)
  const completedEventIds = new Set(
    events.filter((e) => e.status === "completed").map((e) => e.id)
  );

  const sorted = predictions
    .filter((p) => p.participant_id === participantId && completedEventIds.has(p.event_id))
    .sort((a, b) => {
      const eA = events.find((e) => e.id === a.event_id);
      const eB = events.find((e) => e.id === b.event_id);
      return (eB?.display_order ?? 0) - (eA?.display_order ?? 0);
    });

  let winStreak = 0;
  let loseStreak = 0;

  for (const pred of sorted) {
    if (pred.is_correct === true) {
      if (loseStreak > 0) break;
      winStreak++;
    } else if (pred.is_correct === false) {
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
    const eventPreds = allPredictions.filter((p) => p.event_id === event.id);
    if (eventPreds.length < 3) continue;

    // Count predictions per answer
    const counts: Record<string, number> = {};
    for (const p of eventPreds) {
      const key = p.prediction.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
    }

    // Find the most popular pick
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const popularPick = sorted[0]?.[0] ?? "";

    // Find outliers (unique or <= 20% of picks)
    const threshold = Math.max(1, Math.floor(eventPreds.length * 0.2));

    for (const pred of eventPreds) {
      const key = pred.prediction.toLowerCase().trim();
      const count = counts[key] ?? 0;
      if (count <= threshold && key !== popularPick) {
        const participant = participants.find((p) => p.id === pred.participant_id);
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
  _leaderboard: LeaderboardEntry[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  const completedEvents = events
    .filter((e) => e.status === "completed" && e.correct_answer)
    .sort((a, b) => (b.display_order ?? 0) - (a.display_order ?? 0));

  // 1. Event results
  for (const event of completedEvents) {
    const preds = allPredictions.filter((p) => p.event_id === event.id);
    const correctCount = preds.filter((p) => p.is_correct === true).length;
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
      const winner = preds.find((p) => p.is_correct === true);
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

    if (winStreak >= 3) {
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

    if (loseStreak >= 3) {
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
  for (const outlier of outliers.slice(0, 6)) {
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

  // Sort: highest priority first, then by timestamp (newest first)
  feed.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
    return 0;
  });

  return feed;
}
