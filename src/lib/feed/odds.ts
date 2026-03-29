import type { CompetitionEvent, Prediction, Participant } from "../../types";
import type { FeedItem } from "./types";
import { hashPick, CONTRARIAN_PICK_TEMPLATES, UNDERDOG_BACKER_TEMPLATES } from "./templates";

/** Maximum total odds-related items to include in the feed */
const MAX_ODDS_ITEMS = 3;

export function generateOddsFeedItems(
  events: CompetitionEvent[],
  allPredictions: Prediction[],
  participants: Participant[]
): FeedItem[] {
  const feed: FeedItem[] = [];

  const upcomingWithOdds = events.filter(
    (e) => e.status !== "completed" && e.favourite && e.favourite_odds
  );

  // --- Contrarian picks: group's most popular pick differs from bookmaker favourite ---
  // Collect all contrarian events with their disagreement strength, keep only the best
  const contrarianCandidates: {
    event: CompetitionEvent;
    popularDisplay: string;
    popularCount: number;
    total: number;
    favOdds: string;
  }[] = [];

  for (const event of upcomingWithOdds) {
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
    const favouriteKey = event.favourite!.toLowerCase().trim();

    if (popularKey && popularKey !== favouriteKey) {
      contrarianCandidates.push({
        event,
        popularDisplay,
        popularCount: sorted[0]?.[1] ?? 0,
        total: eventPreds.length,
        favOdds: `$${event.favourite_odds!.toFixed(2)}`,
      });
    }
  }

  // Sort by disagreement strength (highest % of group disagreeing with bookies first)
  contrarianCandidates.sort((a, b) => (b.popularCount / b.total) - (a.popularCount / a.total));

  // Only keep the top 2 most dramatic disagreements
  for (const c of contrarianCandidates.slice(0, 2)) {
    const pctGroup = Math.round((c.popularCount / c.total) * 100);
    const t = hashPick(CONTRARIAN_PICK_TEMPLATES, `contrarian-${c.event.id}`);
    const { headline, subtext } = t(c.event.event_name, c.event.favourite!, c.favOdds, c.popularDisplay);
    feed.push({
      id: `contrarian-${c.event.id}`,
      type: "contrarian_pick",
      emoji: "\u{1F914}",
      headline,
      subtext: `${c.popularCount}/${c.total} (${pctGroup}%) went against the bookies. ${subtext}`,
      eventId: c.event.id,
      eventName: c.event.event_name,
      sport: c.event.sport,
      priority: 7,
    });
  }

  // --- Underdog backers: only the single boldest pick (highest underdog odds) ---
  let boldestUnderdog: {
    participant: Participant;
    event: CompetitionEvent;
    prediction: Prediction;
    underdogOdds: number;
  } | null = null;

  for (const event of upcomingWithOdds) {
    if (!event.underdog || !event.underdog_odds) continue;
    const underdogKey = event.underdog.toLowerCase().trim();
    const eventPreds = allPredictions.filter((p) => Number(p.event_id) === Number(event.id));

    for (const pred of eventPreds) {
      const pickKey = pred.prediction.toLowerCase().trim();
      if (pickKey === underdogKey) {
        const participant = participants.find((p) => Number(p.id) === Number(pred.participant_id));
        if (participant && (!boldestUnderdog || event.underdog_odds > boldestUnderdog.underdogOdds)) {
          boldestUnderdog = { participant, event, prediction: pred, underdogOdds: event.underdog_odds };
        }
      }
    }
  }

  if (boldestUnderdog) {
    const { participant, event, prediction, underdogOdds } = boldestUnderdog;
    const underdogOddsStr = `$${underdogOdds.toFixed(2)}`;
    const t = hashPick(UNDERDOG_BACKER_TEMPLATES, `underdog-${prediction.id}`);
    const { headline, subtext } = t(participant.name, event.event_name, prediction.prediction, underdogOddsStr);
    feed.push({
      id: `underdog-${prediction.id}`,
      type: "underdog_backer",
      emoji: "\u{1F40E}",
      headline,
      subtext,
      playerName: participant.name,
      playerId: participant.id,
      eventId: event.id,
      eventName: event.event_name,
      sport: event.sport,
      priority: 6,
    });
  }

  // Hard cap on total odds items
  return feed.slice(0, MAX_ODDS_ITEMS);
}
