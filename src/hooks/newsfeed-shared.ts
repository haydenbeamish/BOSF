import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getLeaderboard, getEvents, getFeed } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { normalizeBackendFeedItem } from "../lib/feed/normalize";
import { enhanceBanter } from "../data/ai";
import type { CompetitionEvent, LeaderboardEntry, Prediction, Participant } from "../types";

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
 */
export function mergeBanterIntoFeed(
  feedItems: FeedItem[],
  toEnhance: FeedItem[],
  enhanced: Array<{ headline: string; subtext: string }>
): FeedItem[] {
  const enhanceIds = new Set(toEnhance.map((f) => f.id));
  let enhIdx = 0;
  return feedItems.map((item) => {
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

// --- Shared feed-building logic --------------------------------------------

interface BuildFeedOptions {
  maxItems: number;
  /** When true, pin result types to the top; when false, sort strictly chronologically. */
  resultsFirst: boolean;
  /** When true, reshuffles to avoid 3 cards of the same type in a row. */
  interleave: boolean;
}

interface FeedBuildResult {
  feedItems: FeedItem[];
  leaderboard: LeaderboardEntry[];
  events: CompetitionEvent[];
}

async function fetchAndBuildFeed(options: BuildFeedOptions): Promise<FeedBuildResult> {
  const [results, lb, allEvents, backendFeedRaw] = await Promise.all([
    getResults(),
    getLeaderboard(),
    getEvents(),
    getFeed({ limit: 100, category: "bosf" }).catch(() => [] as unknown[]),
  ]);

  const allPredictions = results.predictions ?? [];

  const resultsEventIds = new Set((results.events ?? []).map((e) => e.id));
  const mergedEvents = [
    ...(results.events ?? []),
    ...allEvents.filter((e) => !resultsEventIds.has(e.id)),
  ];

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

  const backendKeys = new Set(backendItems.map((item) => feedItemKey(item)));
  const uniqueClientItems = clientItems.filter(
    (item) => !backendKeys.has(feedItemKey(item))
  );

  const combined = [...backendItems, ...uniqueClientItems];

  const completedEventIds = new Set(
    mergedEvents
      .filter((e) => e.status === "completed")
      .map((e) => Number(e.id))
  );
  const filtered = combined.filter((item) => {
    if (!item.eventId) return true;
    if (!STALE_WHEN_COMPLETED.has(item.type)) return true;
    return !completedEventIds.has(Number(item.eventId));
  });

  filtered.sort((a, b) => {
    if (options.resultsFirst) {
      const aIsResult = RESULT_TYPES.has(a.type) ? 1 : 0;
      const bIsResult = RESULT_TYPES.has(b.type) ? 1 : 0;
      if (aIsResult !== bIsResult) return bIsResult - aIsResult;
    }
    if (a.timestamp && b.timestamp) {
      const cmp = b.timestamp.localeCompare(a.timestamp);
      if (cmp !== 0) return cmp;
    } else if (a.timestamp) return -1;
    else if (b.timestamp) return 1;
    return b.priority - a.priority;
  });

  const MAX_PER_TYPE = 3;
  const typeCounts: Record<string, number> = {};
  const capped = filtered.filter((item) => {
    if (UNCAPPED_TYPES.has(item.type)) return true;
    const count = typeCounts[item.type] ?? 0;
    if (count >= MAX_PER_TYPE) return false;
    typeCounts[item.type] = count + 1;
    return true;
  });

  if (options.interleave) {
    for (let i = 2; i < capped.length; i++) {
      if (
        capped[i].type === capped[i - 1].type &&
        capped[i].type === capped[i - 2].type
      ) {
        const swapIdx = capped.findIndex((item, j) => j > i && item.type !== capped[i].type);
        if (swapIdx !== -1) {
          [capped[i], capped[swapIdx]] = [capped[swapIdx], capped[i]];
        }
      }
    }
  }

  return {
    feedItems: capped.slice(0, options.maxItems),
    leaderboard: lb,
    events: allEvents,
  };
}

/**
 * Shared hook factory for the news feed. `useNewsFeed` (Dashboard — results-first,
 * 50 items, interleaved) and `useFullNewsFeed` (News page — chronological, 100 items)
 * both come from this same implementation.
 */
export function buildNewsFeedHook(
  queryKey: string,
  options: BuildFeedOptions
) {
  return function useFeedHook() {
    const [enhancedFeed, setEnhancedFeed] = useState<FeedItem[] | null>(null);
    const [banterKey, setBanterKey] = useState<string | null>(null);

    const { data, isLoading: loading, error, refetch } = useQuery({
      queryKey: [queryKey],
      queryFn: () => fetchAndBuildFeed(options),
    });

    const dataKey = data?.feedItems.map((f) => f.id).join(",") ?? null;

    useEffect(() => {
      if (dataKey !== banterKey) setEnhancedFeed(null);
    }, [dataKey, banterKey]);

    useEffect(() => {
      if (!data?.feedItems.length || dataKey === banterKey) return;

      let cancelled = false;
      const toEnhance = data.feedItems
        .filter((f) => f.type !== "odds_alert")
        .slice(0, 25);

      enhanceBanter(toEnhance).then((enhanced) => {
        if (cancelled) return;
        if (enhanced && enhanced.length === toEnhance.length) {
          const merged = mergeBanterIntoFeed(data.feedItems, toEnhance, enhanced);
          setEnhancedFeed(merged);
          setBanterKey(dataKey);
        }
      });

      return () => {
        cancelled = true;
      };
    }, [data, dataKey, banterKey]);

    return {
      feed: enhancedFeed ?? data?.feedItems ?? [],
      leaderboard: data?.leaderboard ?? [],
      events: data?.events ?? [],
      loading,
      error: error ? (error instanceof Error ? error.message : String(error)) : null,
      retry: () => {
        refetch();
      },
    };
  };
}
