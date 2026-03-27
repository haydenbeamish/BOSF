import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getResults, getLeaderboard, getEvents } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry, CompetitionEvent } from "../types";

interface NewsFeedData {
  feedItems: FeedItem[];
  leaderboard: LeaderboardEntry[];
  events: CompetitionEvent[];
}

async function fetchNewsFeedData(): Promise<NewsFeedData> {
  const [results, lb, allEvents] = await Promise.all([
    getResults(),
    getLeaderboard(),
    getEvents(),
  ]);

  const allPredictions = results.predictions ?? [];

  const feedItems = generateNewsFeed(
    results.events ?? [],
    results.participants ?? [],
    allPredictions,
    lb
  );

  return { feedItems, leaderboard: lb, events: allEvents };
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
    const toEnhance = data.feedItems.slice(0, 15);

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
