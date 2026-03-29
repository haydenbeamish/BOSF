import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getLeaderboard, getEvents, getFeed } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { normalizeBackendFeedItem } from "../lib/feed/normalize";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry, CompetitionEvent, Prediction, Participant } from "../types";

interface FullNewsFeedData {
  feedItems: FeedItem[];
  leaderboard: LeaderboardEntry[];
  events: CompetitionEvent[];
}

/**
 * Enrich a backend feed item with structured odds & picks data
 * when the item references an event that has odds and predictions.
 */
function enrichFeedItemWithOddsAndPicks(
  item: FeedItem,
  events: CompetitionEvent[],
  predictions: Prediction[],
  participants: Participant[]
): FeedItem {
  const ODDS_TYPES = new Set(["odds_alert", "contrarian_pick", "underdog_backer", "pre_event_odds"]);
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

async function fetchFullNewsFeedData(): Promise<FullNewsFeedData> {
  const [results, lb, allEvents, backendFeedRaw] = await Promise.all([
    getResults(),
    getLeaderboard(),
    getEvents(),
    getFeed({ limit: 100 }).catch(() => [] as unknown[]),
  ]);

  const allPredictions = results.predictions ?? [];

  const resultsEventIds = new Set((results.events ?? []).map((e) => e.id));
  const mergedEvents = [
    ...(results.events ?? []),
    ...allEvents.filter((e) => !resultsEventIds.has(e.id)),
  ];

  // Normalise backend feed items — filter out boring admin types only
  const BORING_TYPES = new Set([
    "pick_summary",
    "group_consensus",
    "pre_event_odds",
  ]);

  const BORING_HEADLINE_PREFIXES = ["Date Check"];

  const backendItems = backendFeedRaw
    .map((raw) => normalizeBackendFeedItem(raw))
    .filter((item): item is FeedItem =>
      item !== null &&
      !BORING_TYPES.has(item.type) &&
      !BORING_HEADLINE_PREFIXES.some((prefix) => item.headline.startsWith(prefix))
    )
    .map((item) =>
      enrichFeedItemWithOddsAndPicks(item, mergedEvents, allPredictions, results.participants ?? [])
    );

  const clientItems = generateNewsFeed(
    mergedEvents,
    results.participants ?? [],
    allPredictions,
    lb
  );

  // Merge: backend items take priority, deduplicate
  const backendKeys = new Set(
    backendItems.map((item) => feedItemKey(item))
  );

  const uniqueClientItems = clientItems.filter(
    (item) => !backendKeys.has(feedItemKey(item))
  );

  const combined = [...backendItems, ...uniqueClientItems];

  // NO stale-item filtering — keep odds_alert, contrarian_pick,
  // underdog_backer, picks_open for completed events

  // Sort purely chronologically (newest first), with priority as tiebreaker
  combined.sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      const cmp = b.timestamp.localeCompare(a.timestamp);
      if (cmp !== 0) return cmp;
    } else if (a.timestamp) return -1;
    else if (b.timestamp) return 1;
    return b.priority - a.priority;
  });

  // No per-type capping, no interleaving — full chronological feed
  const MAX_FEED_ITEMS = 100;

  return { feedItems: combined.slice(0, MAX_FEED_ITEMS), leaderboard: lb, events: allEvents };
}

function feedItemKey(item: FeedItem): string {
  if (item.eventId && item.playerId) return `${item.type}-e${item.eventId}-p${item.playerId}`;
  if (item.eventId) return `${item.type}-e${item.eventId}`;
  if (item.playerId) return `${item.type}-p${item.playerId}`;
  return item.id;
}

export function useFullNewsFeed() {
  const [enhancedFeed, setEnhancedFeed] = useState<FeedItem[] | null>(null);
  const [banterKey, setBanterKey] = useState<string | null>(null);

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["full-newsfeed"],
    queryFn: fetchFullNewsFeedData,
  });

  const dataKey = data?.feedItems.map(f => f.id).join(",") ?? null;

  useEffect(() => {
    if (!data?.feedItems.length || dataKey === banterKey) return;

    let cancelled = false;
    const toEnhance = data.feedItems.filter((f) => f.type !== "odds_alert").slice(0, 25);

    enhanceBanter(toEnhance).then((enhanced) => {
      if (cancelled) return;
      if (enhanced && enhanced.length === toEnhance.length) {
        let enhIdx = 0;
        const merged = data.feedItems.map((item) => {
          if (item.type === "odds_alert") return item;
          if (enhIdx < enhanced.length && enhanced[enhIdx]?.headline && enhanced[enhIdx]?.subtext) {
            return { ...item, headline: enhanced[enhIdx].headline, subtext: enhanced[enhIdx++].subtext };
          }
          enhIdx++;
          return item;
        });
        setEnhancedFeed(merged);
        setBanterKey(dataKey);
      }
    });

    return () => { cancelled = true; };
  }, [data, dataKey, banterKey]);

  return {
    feed: enhancedFeed ?? data?.feedItems ?? [],
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
