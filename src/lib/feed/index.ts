import type { CompetitionEvent, Prediction, LeaderboardEntry, Participant } from "../../types";
import type { FeedItem } from "./types";
import {
  hashPick,
  EVENT_RESULT_TEMPLATES,
  EVERYONE_WRONG_TEMPLATES,
  PERFECT_PICK_TEMPLATES,
  WINNING_STREAK_TEMPLATES,
  LOSING_STREAK_TEMPLATES,
  OUTLIER_TEMPLATES,
  CLOSE_RACE_TEMPLATES,
  WINNERS_LIST_TEMPLATES,
  GROUP_CONSENSUS_TEMPLATES,
} from "./templates";
import { computeStreaks, STREAK_THRESHOLD } from "./streaks";
import { findOutliers, MAX_OUTLIERS } from "./outliers";
import { generateOddsFeedItems } from "./odds";

export type { FeedItem, FeedItemType } from "./types";

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
      emoji: "\u{1F3C6}",
      headline,
      subtext,
      eventId: event.id,
      eventName: event.event_name,
      sport: event.sport,
      timestamp: event.event_date ?? event.created_at,
      priority: 10,
    });

    // Nobody got it right
    if (correctCount === 0 && preds.length > 0) {
      const t = hashPick(EVERYONE_WRONG_TEMPLATES, `wrong-${event.id}`);
      const { headline: h, subtext: s } = t(event.event_name);
      feed.push({
        id: `wrong-${event.id}`,
        type: "everyone_wrong",
        emoji: "\u{1F602}",
        headline: h,
        subtext: s,
        eventId: event.id,
        eventName: event.event_name,
        sport: event.sport,
        timestamp: event.event_date ?? event.created_at,
        priority: 8,
      });
    }

    // Only one person got it right
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
          emoji: "\u{1F3AF}",
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

    // Winners list — call out who scored and who missed (skip if everyone got it or nobody did)
    if (correctCount > 0 && correctCount < preds.length) {
      const winners = preds
        .filter((p) => p.is_correct === true || (p.is_correct as unknown) === 1)
        .map((p) => p.participant_name ?? "Unknown");
      const losers = preds
        .filter((p) => !p.is_correct && (p.is_correct as unknown) !== 1)
        .map((p) => p.participant_name ?? "Unknown");
      const t = hashPick(WINNERS_LIST_TEMPLATES, `winners-${event.id}`);
      const { headline: h, subtext: s } = t(
        event.event_name,
        winners.join(", "),
        losers.join(", ")
      );
      feed.push({
        id: `winners-${event.id}`,
        type: "winners_list",
        emoji: "\u{1F4B0}",
        headline: h,
        subtext: s,
        eventId: event.id,
        eventName: event.event_name,
        sport: event.sport,
        timestamp: event.event_date ?? event.created_at,
        priority: 9,
      });
    }
  }

  // 1b. Group consensus for upcoming events (within 90 days)
  const consensusCutoff = new Date();
  consensusCutoff.setDate(consensusCutoff.getDate() + 90);

  const upcomingForConsensus = events.filter((e) => {
    if (e.status === "completed") return false;
    const displayDate = e.close_date && e.close_date > (e.event_date ?? "")
      ? e.close_date
      : e.event_date;
    if (!displayDate) return true;
    return new Date(displayDate) <= consensusCutoff;
  });

  for (const event of upcomingForConsensus) {
    const eventPreds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));
    if (eventPreds.length < 3) continue;

    const counts: Record<string, number> = {};
    const originalCase: Record<string, string> = {};
    for (const p of eventPreds) {
      const key = p.prediction.toLowerCase().trim();
      counts[key] = (counts[key] || 0) + 1;
      if (!originalCase[key]) originalCase[key] = p.prediction.trim();
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const popularKey = sorted[0]?.[0] ?? "";
    const popularDisplay = originalCase[popularKey] ?? popularKey;
    const popularCount = sorted[0]?.[1] ?? 0;

    // Only post consensus if there's a clear majority (more than half)
    if (popularCount > eventPreds.length / 2) {
      const t = hashPick(GROUP_CONSENSUS_TEMPLATES, `consensus-${event.id}`);
      const { headline: h, subtext: s } = t(
        event.event_name,
        popularDisplay,
        popularCount,
        eventPreds.length
      );
      feed.push({
        id: `consensus-${event.id}`,
        type: "group_consensus",
        emoji: "\u{1F5F3}\u{FE0F}",
        eventId: event.id,
        eventName: event.event_name,
        sport: event.sport,
        headline: h,
        subtext: s,
        priority: 4,
      });
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
        emoji: "\u{1F525}",
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
        emoji: "\u{1F480}",
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
    const uid = `${outlier.prediction.event_id}-${outlier.prediction.participant_id}`;
    const t = hashPick(OUTLIER_TEMPLATES, `outlier-${uid}`);
    const { headline, subtext } = t(
      outlier.participant.name,
      outlier.prediction.prediction,
      outlier.event.event_name,
      outlier.popularPick
    );
    feed.push({
      id: `outlier-${uid}`,
      type: "outlier_alert",
      emoji: "\u{1F52E}",
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
        emoji: "\u{26A1}",
        headline,
        subtext,
        priority: 8,
      });
    }
  }

  // 5. Odds-based alerts
  feed.push(...generateOddsFeedItems(events, allPredictions, participants));

  // Sort: highest priority first, then by timestamp (newest first)
  feed.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
    return 0;
  });

  return feed;
}
