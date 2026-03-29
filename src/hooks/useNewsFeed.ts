import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getLeaderboard, getEvents, getFeed } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { normalizeBackendFeedItem } from "../lib/feed/normalize";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry, CompetitionEvent } from "../types";

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
    getFeed({ limit: 100 }).catch(() => [] as unknown[]),
  ]);

  const allPredictions = results.predictions ?? [];

  // Merge results events with all events (deduped by id) so upcoming events
  // that carry odds data are included in odds-based feed items.
  const resultsEventIds = new Set((results.events ?? []).map((e) => e.id));
  const mergedEvents = [
    ...(results.events ?? []),
    ...allEvents.filter((e) => !resultsEventIds.has(e.id)),
  ];

  // Normalise backend feed items into our FeedItem shape
  const backendItems = backendFeedRaw
    .map((raw) => normalizeBackendFeedItem(raw))
    .filter((item): item is FeedItem => item !== null);

  // Generate client-side feed items as supplement
  const clientItems = generateNewsFeed(
    mergedEvents,
    results.participants ?? [],
    allPredictions,
    lb
  );

  // Merge: backend items take priority, deduplicate by matching type+eventId or type+playerId
  const backendKeys = new Set(
    backendItems.map((item) => feedItemKey(item))
  );

  const uniqueClientItems = clientItems.filter(
    (item) => !backendKeys.has(feedItemKey(item))
  );

  const combined = [...backendItems, ...uniqueClientItems];

  // Sort: highest priority first, then by timestamp (newest first)
  combined.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    if (a.timestamp && b.timestamp) return b.timestamp.localeCompare(a.timestamp);
    return 0;
  });

  return { feedItems: combined, leaderboard: lb, events: allEvents };
}

/** Produce a dedup key for a feed item based on type + context */
function feedItemKey(item: FeedItem): string {
  if (item.eventId && item.playerId) return `${item.type}-e${item.eventId}-p${item.playerId}`;
  if (item.eventId) return `${item.type}-e${item.eventId}`;
  if (item.playerId) return `${item.type}-p${item.playerId}`;
  return item.id;
}

export function useNewsFeed() {
  const [enhancedFeed, setEnhancedFeed] = useState<FeedItem[] | null>(null);
  const [banterKey, setBanterKey] = useState<string | null>(null);

  const { data, isLoading: loading, error, refetch } = useQuery({
    queryKey: ["newsfeed"],
    queryFn: fetchNewsFeedData,
  });

  // Track which data we've already enhanced to avoid re-running
  const dataKey = data?.feedItems.map(f => f.id).join(",") ?? null;

  // Async AI banter enhancement (non-blocking)
  useEffect(() => {
    if (!data?.feedItems.length || dataKey === banterKey) return;

    let cancelled = false;
    const toEnhance = data.feedItems.slice(0, 25);

    enhanceBanter(toEnhance).then((enhanced) => {
      if (cancelled) return;
      if (enhanced && enhanced.length === toEnhance.length) {
        const merged = data.feedItems.map((item, i) => {
          if (i < enhanced.length && enhanced[i]?.headline && enhanced[i]?.subtext) {
            return { ...item, headline: enhanced[i].headline, subtext: enhanced[i].subtext };
          }
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
    leaderboard: data?.leaderboard ?? [],
    events: data?.events ?? [],
    loading,
    error: error ? (error instanceof Error ? error.message : String(error)) : null,
    retry: () => { refetch(); },
  };
}
