import { describe, it, expect } from "vitest";
import { bestFeedTimestamp, compareFeedRecency } from "../dates";

const NOW = Date.parse("2026-08-25T23:59:59.000Z");

describe("bestFeedTimestamp", () => {
  it("prefers decided_at over a future event_date", () => {
    expect(
      bestFeedTimestamp(
        {
          decided_at: "2026-08-25T12:08:33.773Z",
          event_date: "2026-10-23T16:00:00.000Z",
          created_at: "2026-10-18T18:51:40.989Z",
        },
        NOW
      )
    ).toBe("2026-08-25T12:08:33.773Z");
  });

  it("ignores a future created_at when a real decided_at exists", () => {
    expect(
      bestFeedTimestamp(
        {
          decided_at: "2026-07-21T12:21:42.581Z",
          created_at: "2026-10-18T18:49:38.452Z",
          event_date: "2026-10-03T16:00:00.000Z",
        },
        NOW
      )
    ).toBe("2026-07-21T12:21:42.581Z");
  });

  it("falls back to event_end_date then event_date when those are in the past", () => {
    expect(
      bestFeedTimestamp(
        {
          event_end_date: "2026-08-01T15:59:59.000Z",
          event_date: "2026-07-31T16:00:00.000Z",
        },
        NOW
      )
    ).toBe("2026-08-01T15:59:59.000Z");
  });

  it("trusts decided_at even when it is a few minutes ahead of now", () => {
    expect(
      bestFeedTimestamp(
        {
          decided_at: "2026-08-25T12:08:33.773Z",
          created_at: "2026-10-18T18:51:40.989Z",
        },
        Date.parse("2026-08-25T12:00:00.000Z")
      )
    ).toBe("2026-08-25T12:08:33.773Z");
  });

  it("returns undefined when every stamp is in the future", () => {
    expect(
      bestFeedTimestamp(
        {
          event_date: "2026-10-23T16:00:00.000Z",
          created_at: "2026-10-18T18:51:40.989Z",
        },
        NOW
      )
    ).toBeUndefined();
  });
});

describe("compareFeedRecency", () => {
  it("sorts newest real result first", () => {
    const items = [
      "2026-07-21T12:21:42.581Z",
      "2026-08-25T12:08:33.773Z",
      "2026-06-20T16:00:56.568Z",
    ];
    items.sort((a, b) => compareFeedRecency(a, b, NOW));
    expect(items[0]).toBe("2026-08-25T12:08:33.773Z");
  });

  it("never ranks a future created_at above a more recently decided result", () => {
    const cmp = compareFeedRecency(
      "2026-10-18T18:49:38.452Z",
      "2026-08-25T12:08:33.773Z",
      NOW
    );
    expect(cmp).toBeGreaterThan(0);
  });
});
