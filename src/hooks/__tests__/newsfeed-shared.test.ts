import { describe, it, expect } from "vitest";
import { compareFeedNewestFirst, feedCreatedAtMs } from "../newsfeed-shared";
import type { FeedItem } from "../../lib/newsfeed";

function item(partial: Partial<FeedItem> & Pick<FeedItem, "id">): FeedItem {
  return {
    type: "result_commentary",
    emoji: "x",
    headline: partial.id,
    subtext: "",
    priority: 5,
    ...partial,
  };
}

describe("feedCreatedAtMs", () => {
  it("parses backend created_at", () => {
    expect(feedCreatedAtMs(item({ id: "a", createdAt: "2026-08-25T12:05:23.613Z" }))).toBe(
      Date.parse("2026-08-25T12:05:23.613Z")
    );
  });

  it("ignores event_date stamped on timestamp — only createdAt counts", () => {
    expect(
      feedCreatedAtMs(
        item({
          id: "picks",
          timestamp: "2026-12-15T16:00:00.000Z",
        })
      )
    ).toBe(0);
  });
});

describe("compareFeedNewestFirst", () => {
  it("orders cards by created_at descending (most recent first)", () => {
    const older = item({ id: "older", createdAt: "2026-08-21T09:00:32.392Z", priority: 10 });
    const newer = item({ id: "newer", createdAt: "2026-08-25T12:06:08.603Z", priority: 8 });
    const mid = item({ id: "mid", createdAt: "2026-08-25T12:05:23.613Z", priority: 10 });

    const sorted = [older, newer, mid].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["newer", "mid", "older"]);
  });

  it("does not let a future event_date timestamp leapfrog a just-landed result", () => {
    const result = item({
      id: "result",
      type: "event_result",
      createdAt: "2026-08-25T12:05:23.613Z",
      timestamp: "2026-08-25T12:05:23.613Z",
      priority: 10,
    });
    const upcomingPicks = item({
      id: "picks-open",
      type: "picks_open",
      timestamp: "2026-12-15T16:00:00.000Z",
      priority: 8,
    });

    const sorted = [upcomingPicks, result].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["result", "picks-open"]);
  });

  it("does not sort by event_number-like priority when created_at differs", () => {
    const lowPriNew = item({ id: "banter", createdAt: "2026-08-25T12:06:08.603Z", priority: 5 });
    const highPriOld = item({
      id: "old-result",
      type: "event_result",
      createdAt: "2026-07-21T12:25:50.002Z",
      priority: 10,
    });

    const sorted = [highPriOld, lowPriNew].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["banter", "old-result"]);
  });

  it("pins result types first only when resultsFirst is set", () => {
    const banter = item({ id: "banter", createdAt: "2026-08-25T12:06:08.603Z", priority: 8 });
    const result = item({
      id: "result",
      type: "event_result",
      createdAt: "2026-08-25T12:05:23.613Z",
      priority: 10,
    });

    const chrono = [banter, result].sort((a, b) => compareFeedNewestFirst(a, b, false));
    expect(chrono.map((f) => f.id)).toEqual(["banter", "result"]);

    const pinned = [banter, result].sort((a, b) => compareFeedNewestFirst(a, b, true));
    expect(pinned.map((f) => f.id)).toEqual(["result", "banter"]);
  });
});
