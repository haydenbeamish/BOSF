import type { CompetitionEvent, Prediction, Participant } from "../../types";
import type { FeedItem } from "./types";
import {
  hashPick,
  ODDS_ALERT_TEMPLATES,
  CONTRARIAN_PICK_TEMPLATES,
  UNDERDOG_BACKER_TEMPLATES,
} from "./templates";

export function generateOddsFeedItems(
  events: CompetitionEvent[],
  allPredictions: Prediction[],
  participants: Participant[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  const upcomingWithOdds = events.filter(
    (e) => e.status !== "completed" && e.favourite && e.favourite_odds
  );

  for (const event of upcomingWithOdds) {
    const favOdds = `$${event.favourite_odds!.toFixed(2)}`;
    const eventPreds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));

    // Odds alert — show odds for events happening soon
    const eventDate = event.event_date ?? event.close_date;
    if (eventDate) {
      const msUntil = new Date(eventDate).getTime() - Date.now();
      const hoursUntil = msUntil / (1000 * 60 * 60);
      if (hoursUntil > 0 && hoursUntil <= 48) {
        const t = hashPick(ODDS_ALERT_TEMPLATES, `odds-${event.id}`);
        const { headline, subtext } = t(event.event_name, event.favourite!, favOdds);
        feed.push({
          id: `odds-${event.id}`,
          type: "odds_alert",
          emoji: "\u{1F4CA}",
          headline,
          subtext,
          eventId: event.id,
          eventName: event.event_name,
          sport: event.sport,
          timestamp: eventDate,
          priority: 6,
        });
      }
    }

    // Contrarian pick — the group's most popular pick differs from the bookies' favourite
    if (eventPreds.length >= 3) {
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
      const favouriteKey = event.favourite!.toLowerCase().trim();

      if (popularKey && popularKey !== favouriteKey) {
        const t = hashPick(CONTRARIAN_PICK_TEMPLATES, `contrarian-${event.id}`);
        const { headline, subtext } = t(event.event_name, event.favourite!, favOdds, popularDisplay);
        feed.push({
          id: `contrarian-${event.id}`,
          type: "contrarian_pick",
          emoji: "\u{1F914}",
          headline,
          subtext,
          eventId: event.id,
          eventName: event.event_name,
          sport: event.sport,
          priority: 7,
        });
      }
    }

    // Underdog backer — someone picked the underdog
    if (event.underdog && event.underdog_odds) {
      const underdogKey = event.underdog.toLowerCase().trim();
      const underdogOdds = `$${event.underdog_odds.toFixed(2)}`;
      for (const pred of eventPreds) {
        const pickKey = pred.prediction.toLowerCase().trim();
        if (pickKey === underdogKey) {
          const participant = participants.find((p) => Number(p.id) === Number(pred.participant_id));
          if (participant) {
            const t = hashPick(UNDERDOG_BACKER_TEMPLATES, `underdog-${pred.id}`);
            const { headline, subtext } = t(participant.name, event.event_name, pred.prediction, underdogOdds);
            feed.push({
              id: `underdog-${pred.id}`,
              type: "underdog_backer",
              emoji: "\u{1F40E}",
              headline,
              subtext,
              playerName: participant.name,
              playerId: participant.id,
              eventId: event.id,
              eventName: event.event_name,
              sport: event.sport,
              priority: 5,
            });
          }
        }
      }
    }
  }

  return feed;
}
