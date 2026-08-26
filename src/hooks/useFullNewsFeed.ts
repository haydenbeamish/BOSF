import { buildNewsFeedHook } from "./newsfeed-shared";

/**
 * Full news feed (News page) — newest first (decided_at / created_at),
 * no interleaving, capped at 100 items.
 */
export const useFullNewsFeed = buildNewsFeedHook("full-newsfeed", {
  maxItems: 100,
  resultsFirst: false,
  interleave: false,
});
