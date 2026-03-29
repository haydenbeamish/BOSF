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
  LEADER_BANTER_TEMPLATES,
  LAST_PLACE_BANTER_TEMPLATES,
  NEW_LEADER_TEMPLATES,
  NEW_SPUD_TEMPLATES,
} from "./templates";
import { computeStreaks, STREAK_THRESHOLD } from "./streaks";
import { findOutliers, MAX_OUTLIERS } from "./outliers";
import { generateOddsFeedItems } from "./odds";

export type { FeedItem, FeedItemType, BackendFeedItem } from "./types";
export { normalizeBackendFeedItem } from "./normalize";

/**
 * Lunch contributions table — maps leaderboard position (1-14) to the
 * dollar amount that person contributes to the group lunch.
 * Position 1 (leader) pays $0; position 14 (last) pays $325.
 */
export const LUNCH_CONTRIBUTIONS: { position: number; contribution: number }[] = [
  { position: 1, contribution: 0 },
  { position: 2, contribution: 5 },
  { position: 3, contribution: 10 },
  { position: 4, contribution: 15 },
  { position: 5, contribution: 20 },
  { position: 6, contribution: 25 },
  { position: 7, contribution: 30 },
  { position: 8, contribution: 40 },
  { position: 9, contribution: 50 },
  { position: 10, contribution: 65 },
  { position: 11, contribution: 80 },
  { position: 12, contribution: 110 },
  { position: 13, contribution: 150 },
  { position: 14, contribution: 325 },
];

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

  // 1. Event results — show who won for every completed event
  for (const event of completedEvents) {
    const preds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));
    const correctCount = preds.filter((p) => Boolean(p.is_correct)).length;

    // Result for every event — who won
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
      priority: 7,
    });

    // Nobody got it right — always hilarious, higher priority
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
        priority: 9,
      });
    }

    // Only one person got it right — lone genius moment
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

    // Winners list — only when the split is lopsided (≤30% won OR ≥70% won = drama)
    if (correctCount > 0 && correctCount < preds.length && preds.length >= 3) {
      const winRatio = correctCount / preds.length;
      if (winRatio <= 0.3 || winRatio >= 0.7) {
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
          priority: 8,
        });
      }
    }
  }

  // Group consensus removed — too noisy, not interesting enough for the feed

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

  // 5. Leader & last-place banter (fires when there are completed events)
  if (completedEvents.length > 0 && leaderboard.length >= 2) {
    const leader = leaderboard[0];
    const lastPlace = leaderboard[leaderboard.length - 1];
    const lastContribution = LUNCH_CONTRIBUTIONS[Math.min(leaderboard.length, LUNCH_CONTRIBUTIONS.length) - 1];
    const liability = `$${lastContribution?.contribution ?? 325}`;

    const lt = hashPick(LEADER_BANTER_TEMPLATES, `leader-${leader.id}`);
    const { headline: lh, subtext: ls } = lt(leader.name);
    feed.push({
      id: `leader-banter`,
      type: "leader_banter",
      emoji: "\u{1F451}",
      headline: lh,
      subtext: ls,
      playerName: leader.name,
      playerId: leader.id,
      priority: 8,
    });

    const bt = hashPick(LAST_PLACE_BANTER_TEMPLATES, `lastplace-${lastPlace.id}`);
    const { headline: bh, subtext: bs } = bt(lastPlace.name, liability);
    feed.push({
      id: `last-place-banter`,
      type: "last_place_banter",
      emoji: "\u{1F4B8}",
      headline: bh,
      subtext: bs,
      playerName: lastPlace.name,
      playerId: lastPlace.id,
      priority: 8,
    });
  }

  // 6. New leader / new spud detection
  // If the current leader only leads by the points value of the most recent event,
  // they likely just took the lead — call it out. Same logic for last place.
  if (completedEvents.length >= 2 && leaderboard.length >= 3) {
    const leader = leaderboard[0];
    const second = leaderboard[1];
    const lastPlace = leaderboard[leaderboard.length - 1];
    const secondLast = leaderboard[leaderboard.length - 2];
    const mostRecentEvent = completedEvents[0];
    const pointsValue = mostRecentEvent?.points_value ?? 1;

    // New leader: leader's margin over 2nd is within the last event's points
    // (meaning before that event, they were behind or tied)
    const leaderGap = leader.total_points - second.total_points;
    if (leaderGap > 0 && leaderGap <= pointsValue) {
      const t = hashPick(NEW_LEADER_TEMPLATES, `newleader-${leader.id}`);
      const { headline, subtext } = t(leader.name, second.name);
      feed.push({
        id: `new-leader`,
        type: "new_leader",
        emoji: "\u{1F4AA}",
        headline,
        subtext,
        playerName: leader.name,
        playerId: leader.id,
        priority: 9,
      });
    }

    // New spud: last place's deficit from 2nd-last is within the last event's points
    const spudGap = secondLast.total_points - lastPlace.total_points;
    if (spudGap > 0 && spudGap <= pointsValue) {
      const t = hashPick(NEW_SPUD_TEMPLATES, `newspud-${lastPlace.id}`);
      const { headline, subtext } = t(lastPlace.name, secondLast.name);
      feed.push({
        id: `new-spud`,
        type: "new_spud",
        emoji: "\u{1F954}",
        headline,
        subtext,
        playerName: lastPlace.name,
        playerId: lastPlace.id,
        priority: 9,
      });
    }
  }

  // 7. Odds-based alerts
  feed.push(...generateOddsFeedItems(events, allPredictions, participants));

  // Sort: highest priority first, then by timestamp (newest first)
  feed.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
    return 0;
  });

  return feed;
}
