export type FeedItemType =
  | "event_result"
  | "outlier_alert"
  | "winning_streak"
  | "losing_streak"
  | "perfect_pick"
  | "everyone_wrong"
  | "close_race"
  | "hot_take"
  | "odds_alert"
  | "contrarian_pick"
  | "underdog_backer"
  | "winners_list"
  | "group_consensus"
  | "leader_banter"
  | "last_place_banter"
  | "pick_summary"
  | "result_commentary"
  | "pre_event_odds"
  | "new_leader"
  | "new_spud"
  | "upset_alert"
  | "accuracy_check"
  | "lunch_liability"
  | "picks_open"
  // Backend-driven rich card shapes — carry a structured `detail` payload.
  | "post_event_rubbing"
  | "odds_vs_picks"
  | "outlier_bet"
  | "streak_spotlight"
  | "leaderboard_change"
  | "ladder_leader"
  | "ladder_last"
  | "season_milestone"
  | "lunch_bill_climb"
  | "momentum_index"
  | "week_ahead"
  | "h2h_rivalry"
  | "stat_callout";

/** Accent hints supplied by the backend for colour coding. */
export type FeedAccent =
  | "green"
  | "red"
  | "blue"
  | "amber"
  | "purple"
  | "gold"
  | "zinc";

/** A pick row tagged with the market role, for colour coding in pick cards. */
export interface PickBreakdownRow {
  label: string;
  count: number;
  names: string[];
  isFavourite?: boolean;
  market_role?: "favourite" | "underdog" | "other";
  /** Flag a row as the winning one; shown with a ✓ */
  isCorrect?: boolean;
}

/** Shared structured payloads from the backend — all optional. */
export interface FeedItemDetail {
  /** Pick-breakdown cards. */
  picks?: {
    total: number;
    options: PickBreakdownRow[];
  };
  /** Timeline cards (e.g. streak_spotlight) — last N event results */
  timeline?: {
    results: Array<{ event_name?: string; is_correct: boolean }>;
    hotness?: "hot" | "cold";
    rank?: number;
    points?: number;
    lunch_bill?: number;
  };
  /** Ladder cards */
  ladder?: {
    rows: Array<{
      rank: number;
      name: string;
      points: number;
      is_focus?: boolean;
    }>;
    progress_pct?: number;
    rank_move?: number;
    bill_move?: number;
  };
  /** Market/odds block */
  market?: {
    favourite: string;
    favouriteOdds: number;
    underdog?: string;
    underdogOdds?: number;
    implied_pct?: number;
    variant?: "48h" | "24h" | "2h";
    kickoff?: string;
    gap_multiplier?: number;
    group_agrees?: boolean;
  };
  /** momentum_index */
  momentum?: {
    bars: Array<{ label: string; value: number }>; // values pre-normalised 0..100
  };
  /** week_ahead */
  week_ahead?: {
    by_day: Array<{
      day: string;
      events: Array<{ event_name: string; sport?: string; event_id?: number }>;
    }>;
    sport_chips: Array<{ sport: string; count: number }>;
  };
  /** h2h_rivalry — one pair with both players' recent form */
  h2h?: {
    pair: Array<{
      name: string;
      id?: number;
      wins: number;
      losses: number;
      recent_form: Array<"W" | "L">;
    }>;
  };
  /** single-stat callout */
  stat?: {
    value: string | number;
    label: string;
    context?: string;
    unit?: string;
  };
}

export interface FeedItem {
  id: string;
  type: FeedItemType;
  emoji: string;
  headline: string;
  subtext: string;
  playerName?: string;
  playerId?: number;
  eventId?: number;
  eventName?: string;
  sport?: string;
  timestamp?: string;
  priority: number;
  /** Backend hints so the UI doesn't have to pattern-match on `type`. */
  accent?: FeedAccent;
  icon?: string;
  /** Structured odds data for visual rendering on odds-flavoured cards. */
  odds?: {
    favourite: string;
    favouriteOdds: number;
    underdog?: string;
    underdogOdds?: number;
  };
  /** Who picked what — for showing pick distribution alongside odds */
  picks?: {
    options: Array<{
      label: string;
      count: number;
      names: string[];
      isFavourite?: boolean;
      market_role?: "favourite" | "underdog" | "other";
      isCorrect?: boolean;
    }>;
    total: number;
  };
  /** Structured backend payload for rich card types. */
  detail?: FeedItemDetail;
}

/**
 * Shape of a feed item returned by the backend /api/competition/feed endpoint.
 * We normalise these into FeedItem before display.
 */
export interface BackendFeedItem {
  id: number | string;
  type: string;
  headline?: string;
  title?: string;
  subtext?: string;
  body?: string;
  description?: string;
  emoji?: string;
  player_name?: string;
  participant_name?: string;
  player_id?: number;
  participant_id?: number;
  event_id?: number;
  event_name?: string;
  sport?: string;
  timestamp?: string;
  created_at?: string;
  priority?: number;
  /** Free-text detail string OR a structured object (rich card shapes). */
  detail?: string | Record<string, unknown>;
  /** Backend hint for colour coding — green/red/blue/amber/purple/gold. */
  accent?: FeedAccent | string;
  /** Backend hint for icon — trophy/flame/crown/zap/etc. */
  icon?: string;
  /** Rich structured payload — caller can set this directly or via `detail`. */
  card?: Record<string, unknown>;
  metadata?: {
    event_id?: number;
    event_name?: string;
    sport?: string;
    favourite?: string;
    favourite_odds?: number;
    underdog?: string;
    underdog_odds?: number;
    [key: string]: unknown;
  };
}
