import { describe, it, expect } from "vitest";
import { normalizeBackendFeedItem } from "../normalize";

describe("normalizeBackendFeedItem timestamps", () => {
  it("uses decided_at instead of a future created_at", () => {
    const item = normalizeBackendFeedItem({
      id: 1,
      type: "event_result",
      title: "Seth Moniz wins Tahiti Pro (Mens)",
      created_at: "2099-10-18T18:51:40.989Z",
      decided_at: "2026-08-25T12:08:33.773Z",
      event_date: "2099-10-23T16:00:00.000Z",
    });
    expect(item?.timestamp).toBe("2026-08-25T12:08:33.773Z");
  });

  it("drops a future-only created_at so the card cannot sort above real results", () => {
    const item = normalizeBackendFeedItem({
      id: 2,
      type: "odds_alert",
      title: "Upcoming lock",
      created_at: "2099-10-18T18:51:40.989Z",
    });
    expect(item?.timestamp).toBeUndefined();
  });
});
