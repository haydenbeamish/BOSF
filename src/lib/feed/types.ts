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
  | "last_place_banter";

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
}
