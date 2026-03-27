import { useState, useEffect } from "react";
import { getResults, getLeaderboard } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import type { LeaderboardEntry } from "../types";

export function useNewsFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getResults(), getLeaderboard()])
      .then(([results, lb]) => {
        if (cancelled) return;

        // Flatten predictions from the nested record
        const allPredictions = Object.values(results.predictions).flatMap((byEvent) =>
          Object.values(byEvent)
        );

        const feedItems = generateNewsFeed(
          results.events,
          results.participants,
          allPredictions,
          lb
        );

        setFeed(feedItems);
        setLeaderboard(lb);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { feed, leaderboard, loading, error };
}
