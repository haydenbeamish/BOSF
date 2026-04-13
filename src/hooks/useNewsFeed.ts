import { buildNewsFeedHook } from "./newsfeed-shared";

/**
 * Dashboard news feed — a tight, curated teaser of the main feed.
 *
 * Selectivity rules (deliberately stricter than /news):
 *   • `resultsFirst: true`  — event results and upsets are pinned to the top
 *   • `interleave: true`    — avoids three cards of the same type in a row
 *   • `maxItems: 8`         — hero + ~7 below, enough to skim without scroll-fatigue
 *
 * The News page (useFullNewsFeed) gets the full 100-item chronological feed.
 */
export const useNewsFeed = buildNewsFeedHook("newsfeed", {
  maxItems: 8,
  resultsFirst: true,
  interleave: true,
});
