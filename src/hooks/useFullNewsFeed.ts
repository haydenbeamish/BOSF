import { buildNewsFeedHook } from "./newsfeed-shared";

/**
 * Full news feed (News page) — strictly chronological, no interleaving,
 * capped at 100 items.
 */
export const useFullNewsFeed = buildNewsFeedHook("full-newsfeed", {
  maxItems: 100,
  resultsFirst: false,
  interleave: false,
});
