export interface CategoryInfo {
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  F1: { label: "F1", emoji: "\u{1F3CE}\u{FE0F}", color: "text-red-400" },
  Basketball: { label: "Basketball", emoji: "\u{1F3C0}", color: "text-orange-400" },
  Golf: { label: "Golf", emoji: "\u{26F3}", color: "text-green-400" },
  UFC: { label: "UFC", emoji: "\u{1F94A}", color: "text-red-500" },
  Surfing: { label: "Surfing", emoji: "\u{1F3C4}", color: "text-cyan-400" },
  "Horse Racing": { label: "Horse Racing", emoji: "\u{1F3C7}", color: "text-emerald-400" },
  Soccer: { label: "Soccer", emoji: "\u{26BD}", color: "text-green-500" },
  Darts: { label: "Darts", emoji: "\u{1F3AF}", color: "text-rose-400" },
  Tennis: { label: "Tennis", emoji: "\u{1F3BE}", color: "text-yellow-400" },
  "World Cup": { label: "World Cup", emoji: "\u{1F3C6}", color: "text-gold-400" },
  "Ice Hockey": { label: "Ice Hockey", emoji: "\u{1F3D2}", color: "text-blue-400" },
  "Rugby League": { label: "Rugby League", emoji: "\u{1F3C8}", color: "text-lime-400" },
  Cricket: { label: "Cricket", emoji: "\u{1F3CF}", color: "text-emerald-300" },
  Cycling: { label: "Cycling", emoji: "\u{1F6B4}", color: "text-yellow-500" },
  Poker: { label: "Poker", emoji: "\u{1F0CF}", color: "text-purple-400" },
  TV: { label: "TV", emoji: "\u{1F4FA}", color: "text-pink-400" },
  AFL: { label: "AFL", emoji: "\u{1F3C8}", color: "text-gold-400" },
  WAFL: { label: "WAFL", emoji: "\u{1F3C8}", color: "text-amber-500" },
};

export function getCategoryInfo(sport: string): CategoryInfo {
  return CATEGORIES[sport] ?? { label: sport, emoji: "\u{1F3C6}", color: "text-slate-400" };
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORIES);
}
