import { describe, it, expect } from "vitest";
import { compareFeedNewestFirst } from "../newsfeed-shared";
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

describe("compareFeedNewestFirst", () => {
  it("orders cards by best real timestamp descending (most recent first)", () => {
    const older = item({
      id: "older",
      timestamp: "2026-08-21T09:00:32.392Z",
      createdAt: "2026-08-21T09:00:32.392Z",
      priority: 10,
    });
    const newer = item({
      id: "newer",
      timestamp: "2026-08-25T12:06:08.603Z",
      createdAt: "2026-08-25T12:06:08.603Z",
      priority: 8,
    });
    const mid = item({
      id: "mid",
      timestamp: "2026-08-25T12:05:23.613Z",
      createdAt: "2026-08-25T12:05:23.613Z",
      priority: 10,
    });

    const sorted = [older, newer, mid].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["newer", "mid", "older"]);
  });

  it("does not let a future event_date timestamp leapfrog a just-landed result", () => {
    const result = item({
      id: "result",
      type: "event_result",
      timestamp: "2026-08-25T12:05:23.613Z",
      createdAt: "2026-08-25T12:05:23.613Z",
      priority: 10,
    });
    const upcomingPicks = item({
      id: "picks-open",
      type: "picks_open",
      // Far-future stamp — compareFeedRecency treats future times as non-real.
      timestamp: "2099-12-15T16:00:00.000Z",
      priority: 8,
    });

    const sorted = [upcomingPicks, result].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["result", "picks-open"]);
  });

  it("does not sort by priority when recency differs", () => {
    const lowPriNew = item({
      id: "banter",
      timestamp: "2026-08-25T12:06:08.603Z",
      createdAt: "2026-08-25T12:06:08.603Z",
      priority: 5,
    });
    const highPriOld = item({
      id: "old-result",
      type: "event_result",
      timestamp: "2026-07-21T12:25:50.002Z",
      createdAt: "2026-07-21T12:25:50.002Z",
      priority: 10,
    });

    const sorted = [highPriOld, lowPriNew].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["banter", "old-result"]);
  });

  it("breaks same-decided_at ties with createdAt so API order is preserved", () => {
    const first = item({
      id: "first",
      type: "event_result",
      timestamp: "2026-08-25T12:23:02.062Z",
      createdAt: "2026-08-25T12:23:02.062Z",
      priority: 10,
    });
    const second = item({
      id: "second",
      type: "winners_list",
      timestamp: "2026-08-25T12:23:02.062Z",
      createdAt: "2026-08-25T12:23:10.000Z",
      priority: 9,
    });

    const sorted = [first, second].sort((a, b) => compareFeedNewestFirst(a, b));
    expect(sorted.map((f) => f.id)).toEqual(["second", "first"]);
  });

  it("pins result types first only when resultsFirst is set", () => {
    const banter = item({
      id: "banter",
      timestamp: "2026-08-25T12:06:08.603Z",
      createdAt: "2026-08-25T12:06:08.603Z",
      priority: 8,
    });
    const result = item({
      id: "result",
      type: "event_result",
      timestamp: "2026-08-25T12:05:23.613Z",
      createdAt: "2026-08-25T12:05:23.613Z",
      priority: 10,
    });

    const chrono = [banter, result].sort((a, b) => compareFeedNewestFirst(a, b, false));
    expect(chrono.map((f) => f.id)).toEqual(["banter", "result"]);

    const pinned = [banter, result].sort((a, b) => compareFeedNewestFirst(a, b, true));
    expect(pinned.map((f) => f.id)).toEqual(["result", "banter"]);
  });
});
