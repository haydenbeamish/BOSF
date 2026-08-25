import { describe, it, expect } from "vitest";
import { normalizeBackendFeedItem } from "../normalize";

describe("normalizeBackendFeedItem created_at", () => {
  it("sorts from created_at, not an event-date timestamp", () => {
    const item = normalizeBackendFeedItem({
      id: 66752,
      type: "event_result",
      title: "Tadej Pogacar wins Tour de France (Cycling)",
      created_at: "2026-08-25T12:05:23.613Z",
      timestamp: "2026-07-27T00:00:00.000Z",
    });

    expect(item).not.toBeNull();
    expect(item!.createdAt).toBe("2026-08-25T12:05:23.613Z");
    expect(item!.timestamp).toBe("2026-08-25T12:05:23.613Z");
  });

  it("falls back to timestamp when created_at is missing", () => {
    const item = normalizeBackendFeedItem({
      id: 1,
      type: "result_commentary",
      title: "Legacy card",
      timestamp: "2026-08-01T00:00:00.000Z",
    });

    expect(item!.createdAt).toBeUndefined();
    expect(item!.timestamp).toBe("2026-08-01T00:00:00.000Z");
  });
});
