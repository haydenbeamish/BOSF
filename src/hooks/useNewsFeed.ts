import { buildNewsFeedHook } from "./newsfeed-shared";

/**
 * Dashboard news feed — results pinned to the top, interleaved so we don't
 * show three of the same type in a row, capped at 50 items.
 */
export const useNewsFeed = buildNewsFeedHook("newsfeed", {
  maxItems: 50,
  resultsFirst: true,
  interleave: true,
});
