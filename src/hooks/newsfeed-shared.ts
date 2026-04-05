import type { FeedItem } from "../lib/newsfeed";
import type { CompetitionEvent, Prediction, Participant } from "../types";

/**
 * Enrich a backend feed item with structured odds & picks data
 * when the item references an event that has odds and predictions.
 */
export function enrichFeedItemWithOddsAndPicks(
  item: FeedItem,
  events: CompetitionEvent[],
  predictions: Prediction[],
  participants: Participant[]
): FeedItem {
  if (!ODDS_TYPES.has(item.type)) return item;
  if (!item.eventId) return item;

  const event = events.find((e) => Number(e.id) === Number(item.eventId));
  if (!event || !event.favourite || !event.favourite_odds) return item;

  const enriched = { ...item };

  if (!enriched.odds) {
    enriched.odds = {
      favourite: event.favourite,
      favouriteOdds: event.favourite_odds,
      underdog: event.underdog ?? undefined,
      underdogOdds: event.underdog_odds ?? undefined,
    };
  }

  if (!enriched.picks) {
    const eventPreds = predictions.filter(
      (p) => Number(p.event_id) === Number(event.id)
    );
    if (eventPreds.length > 0) {
      const participantMap = new Map(
        participants.map((p) => [Number(p.id), p.name])
      );
      const groups: Record<string, { label: string; names: string[] }> = {};
      for (const pred of eventPreds) {
        const key = pred.prediction.toLowerCase().trim();
        if (!groups[key]) {
          groups[key] = { label: pred.prediction.trim(), names: [] };
        }
        const name =
          participantMap.get(Number(pred.participant_id)) ??
          pred.participant_name ??
          "Unknown";
        groups[key].names.push(name);
      }
      const favouriteKey = event.favourite.toLowerCase().trim();
      const options = Object.entries(groups)
        .map(([key, { label, names }]) => ({
          label,
          count: names.length,
          names,
          isFavourite: key === favouriteKey,
        }))
        .sort((a, b) => b.count - a.count);

      enriched.picks = { options, total: eventPreds.length };
    }
  }

  return enriched;
}

/** Produce a dedup key for a feed item based on type + context */
export function feedItemKey(item: FeedItem): string {
  if (item.eventId && item.playerId) return `${item.type}-e${item.eventId}-p${item.playerId}`;
  if (item.eventId) return `${item.type}-e${item.eventId}`;
  if (item.playerId) return `${item.type}-p${item.playerId}`;
  return item.id;
}

/**
 * Merge AI-enhanced banter into feed items.
 * The `enhanced` array corresponds 1:1 with `toEnhance` (which excludes odds_alert items).
 * This function maps enhanced items back to the correct positions in the full feed.
 */
export function mergeBanterIntoFeed(
  feedItems: FeedItem[],
  toEnhance: FeedItem[],
  enhanced: Array<{ headline: string; subtext: string }>
): FeedItem[] {
  // Build a set of IDs that were sent for enhancement
  const enhanceIds = new Set(toEnhance.map((f) => f.id));
  let enhIdx = 0;

  return feedItems.map((item) => {
    // Only apply enhancement to items that were actually in the toEnhance batch
    if (!enhanceIds.has(item.id)) return item;
    if (enhIdx >= enhanced.length) return item;
    const enh = enhanced[enhIdx];
    enhIdx++;
    if (enh?.headline && enh?.subtext) {
      return { ...item, headline: enh.headline, subtext: enh.subtext };
    }
    return item;
  });
}

// Static sets used by newsfeed hooks — defined once at module level
export const ODDS_TYPES = new Set(["odds_alert", "contrarian_pick", "underdog_backer", "pre_event_odds", "picks_open"]);
export const BORING_TYPES = new Set(["pick_summary", "group_consensus", "pre_event_odds", "odds_vs_picks"]);
export const BORING_HEADLINE_PREFIXES = ["Date Check", "Odds vs picks:"];
export const STALE_WHEN_COMPLETED = new Set(["odds_alert", "contrarian_pick", "underdog_backer", "picks_open"]);
export const RESULT_TYPES = new Set(["event_result", "perfect_pick", "everyone_wrong", "upset_alert"]);
export const UNCAPPED_TYPES = new Set(["event_result"]);
