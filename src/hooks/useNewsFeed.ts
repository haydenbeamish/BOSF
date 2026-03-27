import { useState, useEffect } from "react";
import { getResults, getLeaderboard, getEvents } from "../data/api";
import { generateNewsFeed, type FeedItem } from "../lib/newsfeed";
import { enhanceBanter } from "../data/ai";
import type { LeaderboardEntry, CompetitionEvent } from "../types";

export function useNewsFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [events, setEvents] = useState<CompetitionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getResults(), getLeaderboard(), getEvents()])
      .then(async ([results, lb, allEvents]) => {
        if (cancelled) return;

        // API returns predictions[event_id][participant_id] = Prediction
        // (grid is "events × participants", so outer key = event_id)
        const allPredictions = Object.entries(results.predictions ?? {}).flatMap(
          ([eventKey, byParticipant]) =>
            Object.entries(byParticipant ?? {}).map(([participantKey, pred]) => ({
              ...pred,
              event_id: pred.event_id ?? Number(eventKey),
              participant_id: pred.participant_id ?? Number(participantKey),
              // Normalize is_correct: API may return 1/0 instead of true/false
              is_correct: pred.is_correct === null || pred.is_correct === undefined
                ? null
                : Boolean(pred.is_correct),
            }))
        );

        const feedItems = generateNewsFeed(
          results.events ?? [],
          results.participants ?? [],
          allPredictions,
          lb
        );

        // Show template-based feed immediately
        setFeed(feedItems);
        setLeaderboard(lb);
        setEvents(allEvents);
        setLoading(false);

        // Then try to enhance with AI banter (non-blocking)
        if (feedItems.length > 0) {
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

  return { feed, leaderboard, events, loading, error };
}
