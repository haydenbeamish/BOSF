import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getLeaderboard, getEvents, getFeed } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { normalizeBackendFeedItem } from "../lib/feed/normalize";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry, CompetitionEvent } from "../types";
import {
  enrichFeedItemWithOddsAndPicks,
  feedItemKey,
  mergeBanterIntoFeed,
  BORING_TYPES,
  BORING_HEADLINE_PREFIXES,
  STALE_WHEN_COMPLETED,
  RESULT_TYPES,
  UNCAPPED_TYPES,
} from "./newsfeed-shared";

interface NewsFeedData {
  feedItems: FeedItem[];
  leaderboard: LeaderboardEntry[];
  events: CompetitionEvent[];
}

async function fetchNewsFeedData(): Promise<NewsFeedData> {
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

  // Sort: event results first, then by timestamp (newest first), then priority
  filtered.sort((a, b) => {
    const aIsResult = RESULT_TYPES.has(a.type) ? 1 : 0;
    const bIsResult = RESULT_TYPES.has(b.type) ? 1 : 0;
    if (aIsResult !== bIsResult) return bIsResult - aIsResult;

    if (a.timestamp && b.timestamp) {
      const cmp = b.timestamp.localeCompare(a.timestamp);
      if (cmp !== 0) return cmp;
    } else if (a.timestamp) return -1;
    else if (b.timestamp) return 1;
    return b.priority - a.priority;
  });

  // Cap per type
  const MAX_PER_TYPE = 3;
  const typeCounts: Record<string, number> = {};
  const capped = filtered.filter((item) => {
    if (UNCAPPED_TYPES.has(item.type)) return true;
    const count = typeCounts[item.type] ?? 0;
    if (count >= MAX_PER_TYPE) return false;
    typeCounts[item.type] = count + 1;
    return true;
  });

  // Interleave: avoid runs of 3+ same-type cards
  for (let i = 2; i < capped.length; i++) {
    if (capped[i].type === capped[i - 1].type && capped[i].type === capped[i - 2].type) {
      const swapIdx = capped.findIndex((item, j) => j > i && item.type !== capped[i].type);
      if (swapIdx !== -1) {
        [capped[i], capped[swapIdx]] = [capped[swapIdx], capped[i]];
      }
    }
  }

  const MAX_FEED_ITEMS = 50;
  return { feedItems: capped.slice(0, MAX_FEED_ITEMS), leaderboard: lb, events: allEvents };
}

export function useNewsFeed() {
  const [enhancedFeed, setEnhancedFeed] = useState<FeedItem[] | null>(null);
  const [banterKey, setBanterKey] = useState<string | null>(null);

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["newsfeed"],
    queryFn: fetchNewsFeedData,
  });

  const dataKey = data?.feedItems.map(f => f.id).join(",") ?? null;

  // Clear stale enhanced feed when underlying data changes
  useEffect(() => {
    if (dataKey !== banterKey) {
      setEnhancedFeed(null);
    }
  }, [dataKey, banterKey]);

  // Async AI banter enhancement (non-blocking)
  useEffect(() => {
    if (!data?.feedItems.length || dataKey === banterKey) return;

    let cancelled = false;
    const toEnhance = data.feedItems.filter((f) => f.type !== "odds_alert").slice(0, 25);

    enhanceBanter(toEnhance).then((enhanced) => {
      if (cancelled) return;
      if (enhanced && enhanced.length === toEnhance.length) {
        const merged = mergeBanterIntoFeed(data.feedItems, toEnhance, enhanced);
        setEnhancedFeed(merged);
        setBanterKey(dataKey);
      }
    });

    return () => { cancelled = true; };
  }, [data, dataKey, banterKey]);

  return {
    feed: enhancedFeed ?? data?.feedItems ?? [],
    leaderboard: data?.leaderboard ?? [],
    events: data?.events ?? [],
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
