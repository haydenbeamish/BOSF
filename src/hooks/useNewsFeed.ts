import { useState, useEffect } from "react";
import { getResults, getLeaderboard } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry } from "../types";

export function useNewsFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getResults(), getLeaderboard()])
      .then(async ([results, lb]) => {
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

        // Show template-based feed immediately
        setFeed(feedItems);
        setLeaderboard(lb);
        setLoading(false);

        // Then try to enhance with AI banter (non-blocking)
        if (feedItems.length > 0) {
          // Only send up to 15 items to keep costs/latency reasonable
          const toEnhance = feedItems.slice(0, 15);
          const enhanced = await enhanceBanter(toEnhance);

          if (cancelled) return;

          if (enhanced && enhanced.length === toEnhance.length) {
            const enhancedFeed = feedItems.map((item, i) => {
              if (i < enhanced.length && enhanced[i]?.headline && enhanced[i]?.subtext) {
                return {
                  ...item,
                  headline: enhanced[i].headline,
                  subtext: enhanced[i].subtext,
                };
              }
              return item;
            });
            setFeed(enhancedFeed);
          }
        }
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
