import type {
  FeedItem,
  FeedItemDetail,
  FeedItemType,
  BackendFeedItem,
  FeedAccent,
} from "./types";

/** Allowed accent values from the backend */
const ALLOWED_ACCENTS: Set<FeedAccent> = new Set([
  "green",
  "red",
  "blue",
  "amber",
  "purple",
  "gold",
  "zinc",
]);

/** Default emoji per feed item type */
const TYPE_EMOJI: Record<string, string> = {
  new_leader: "\u{1F4AA}",
  new_spud: "\u{1F954}",
  event_result: "\u{1F3C6}",
  perfect_pick: "\u{1F3AF}",
  everyone_wrong: "\u{1F602}",
  winning_streak: "\u{1F525}",
  losing_streak: "\u{1F480}",
  outlier_alert: "\u{1F52E}",
  close_race: "\u{26A1}",
  hot_take: "\u{1F4A1}",
  odds_alert: "\u{1F4CA}",
  contrarian_pick: "\u{1F914}",
  underdog_backer: "\u{1F40E}",
  winners_list: "\u{1F4B0}",
  group_consensus: "\u{1F5F3}\u{FE0F}",
  leader_banter: "\u{1F451}",
  last_place_banter: "\u{1F4B8}",
  pick_summary: "\u{1F4CB}",
  result_commentary: "\u{1F3C6}",
  pre_event_odds: "\u{1F4CA}",
  upset_alert: "\u{1F4A5}",
  accuracy_check: "\u{1F4C8}",
  lunch_liability: "\u{1F4B3}",
  picks_open: "\u{1F514}",
};

/** Default priority per feed item type */
const TYPE_PRIORITY: Record<string, number> = {
  event_result: 10,
  perfect_pick: 9,
  winners_list: 9,
  everyone_wrong: 8,
  close_race: 8,
  leader_banter: 8,
  last_place_banter: 8,
  result_commentary: 8,
  new_leader: 9,
  new_spud: 9,
  winning_streak: 7,
  losing_streak: 7,
  contrarian_pick: 7,
  odds_alert: 6,
  pre_event_odds: 6,
  pick_summary: 6,
  outlier_alert: 5,
  underdog_backer: 5,
  group_consensus: 4,
  hot_take: 4,
  upset_alert: 9,
  accuracy_check: 6,
  lunch_liability: 6,
  picks_open: 8,
};

/** Known type aliases the backend might use — map to our FeedItemType */
const TYPE_ALIASES: Record<string, FeedItemType> = {
  result: "event_result",
  pick: "pick_summary",
  picks: "pick_summary",
  commentary: "result_commentary",
  banter: "result_commentary",
  odds: "odds_alert",
  pre_event: "pre_event_odds",
  streak: "winning_streak",
  consensus: "group_consensus",
  underdog: "underdog_backer",
  contrarian: "contrarian_pick",
  leader: "leader_banter",
  last_place: "last_place_banter",
  outlier: "outlier_alert",
  perfect: "perfect_pick",
  wrong: "everyone_wrong",
  winners: "winners_list",
  close: "close_race",
};

/**
 * Normalise a raw backend feed item into our FeedItem shape.
 * Returns null if the item can't be meaningfully converted.
 */
export function normalizeBackendFeedItem(raw: unknown): FeedItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as BackendFeedItem;

  const headline = item.headline || item.title || "";
  const subtext = item.subtext || item.body || item.description || "";

  // Must have at least a headline or subtext to be useful
  if (!headline && !subtext) return null;

  const rawType = String(item.type ?? "result_commentary").toLowerCase().trim();
  const type: FeedItemType = TYPE_ALIASES[rawType] ?? (rawType as FeedItemType);

  const meta = item.metadata ?? {};

  // Build odds from metadata if present
  const odds =
    meta.favourite && meta.favourite_odds != null
      ? {
          favourite: meta.favourite,
          favouriteOdds: meta.favourite_odds,
          underdog: meta.underdog ?? undefined,
          underdogOdds: meta.underdog_odds ?? undefined,
        }
      : undefined;

  // The backend may ship a structured `card` payload OR a `detail` object
  // OR a plain string `detail` (legacy). We accept all three.
  let detail: FeedItemDetail | undefined;
  const cardLike =
    item.card && typeof item.card === "object"
      ? (item.card as Record<string, unknown>)
      : typeof item.detail === "object" && item.detail !== null
      ? (item.detail as Record<string, unknown>)
      : undefined;
  if (cardLike) {
    detail = {
      picks: cardLike.picks as FeedItemDetail["picks"],
      timeline: cardLike.timeline as FeedItemDetail["timeline"],
      ladder: cardLike.ladder as FeedItemDetail["ladder"],
      market: cardLike.market as FeedItemDetail["market"],
      momentum: cardLike.momentum as FeedItemDetail["momentum"],
      week_ahead: cardLike.week_ahead as FeedItemDetail["week_ahead"],
      h2h: cardLike.h2h as FeedItemDetail["h2h"],
      stat: cardLike.stat as FeedItemDetail["stat"],
    };
    // If none of the known keys are present, drop detail entirely
    const hasAny = Object.values(detail).some((v) => v !== undefined);
    if (!hasAny) detail = undefined;
  }

  // Carry picks from detail to the top-level `picks` field so the existing
  // card renderer continues to work without changes.
  const picks = detail?.picks
    ? {
        options: detail.picks.options.map((o) => ({
          label: o.label,
          count: o.count,
          names: o.names ?? [],
          isFavourite: o.isFavourite ?? o.market_role === "favourite",
          market_role: o.market_role,
          isCorrect: o.isCorrect,
        })),
        total: detail.picks.total,
      }
    : undefined;

  const rawAccent = typeof item.accent === "string" ? (item.accent as FeedAccent) : undefined;
  const accent = rawAccent && ALLOWED_ACCENTS.has(rawAccent) ? rawAccent : undefined;

  const legacyDetailString =
    typeof item.detail === "string" ? item.detail : "";

  return {
    id: `backend-${item.id ?? `${rawType}-${(item.event_id ?? "")}-${(item.player_id ?? item.participant_id ?? "")}-${headline.slice(0, 20)}`}`,
    type,
    emoji: item.emoji || TYPE_EMOJI[type] || "\u{1F4E2}",
    headline,
    subtext: subtext || legacyDetailString || "",
    playerName: item.player_name || item.participant_name,
    playerId: item.player_id ?? item.participant_id,
    eventId: item.event_id ?? meta.event_id,
    eventName: item.event_name ?? meta.event_name,
    sport: item.sport ?? meta.sport,
    timestamp: item.timestamp || item.created_at,
    priority: item.priority ?? TYPE_PRIORITY[type] ?? 5,
    accent,
    icon: typeof item.icon === "string" ? item.icon : undefined,
    ...(odds ? { odds } : {}),
    ...(picks ? { picks } : {}),
    ...(detail ? { detail } : {}),
  };
}
