export interface CategoryInfo {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const CATEGORIES: Record<string, CategoryInfo> = {
  F1:             { label: "F1",            emoji: "\u{1F3CE}\u{FE0F}", color: "text-red-400",     bgColor: "bg-red-500/10" },
  Basketball:     { label: "Basketball",    emoji: "\u{1F3C0}",         color: "text-orange-400",  bgColor: "bg-orange-500/10" },
  Golf:           { label: "Golf",          emoji: "\u{26F3}",          color: "text-green-400",   bgColor: "bg-green-500/10" },
  UFC:            { label: "UFC",           emoji: "\u{1F94A}",         color: "text-red-500",     bgColor: "bg-red-500/10" },
  Surfing:        { label: "Surfing",       emoji: "\u{1F3C4}",         color: "text-cyan-400",    bgColor: "bg-cyan-500/10" },
  "Horse Racing": { label: "Racing",        emoji: "\u{1F3C7}",         color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  Soccer:         { label: "Soccer",        emoji: "\u{26BD}",          color: "text-green-500",   bgColor: "bg-green-500/10" },
  Darts:          { label: "Darts",         emoji: "\u{1F3AF}",         color: "text-rose-400",    bgColor: "bg-rose-500/10" },
  Tennis:         { label: "Tennis",         emoji: "\u{1F3BE}",         color: "text-yellow-400",  bgColor: "bg-yellow-500/10" },
  "World Cup":    { label: "World Cup",     emoji: "\u{1F3C6}",         color: "text-amber-400",   bgColor: "bg-amber-500/10" },
  "Ice Hockey":   { label: "Ice Hockey",    emoji: "\u{1F3D2}",         color: "text-blue-400",    bgColor: "bg-blue-500/10" },
  "Rugby League": { label: "NRL",           emoji: "\u{1F3C8}",         color: "text-lime-400",    bgColor: "bg-lime-500/10" },
  Cricket:        { label: "Cricket",       emoji: "\u{1F3CF}",         color: "text-emerald-300", bgColor: "bg-emerald-500/10" },
  Cycling:        { label: "Cycling",       emoji: "\u{1F6B4}",         color: "text-yellow-500",  bgColor: "bg-yellow-500/10" },
  Poker:          { label: "Poker",         emoji: "\u{1F0CF}",         color: "text-purple-400",  bgColor: "bg-purple-500/10" },
  TV:             { label: "TV",            emoji: "\u{1F4FA}",         color: "text-pink-400",    bgColor: "bg-pink-500/10" },
  AFL:            { label: "AFL",           emoji: "\u{1F3C8}",         color: "text-amber-400",   bgColor: "bg-amber-500/10" },
  WAFL:           { label: "WAFL",          emoji: "\u{1F3C8}",         color: "text-amber-500",   bgColor: "bg-amber-500/10" },
};

export function getCategoryInfo(sport: string): CategoryInfo {
  return CATEGORIES[sport] ?? { label: sport, emoji: "\u{1F3C6}", color: "text-zinc-400", bgColor: "bg-zinc-500/10" };
}

export function getAllCategories(): string[] {
  return Object.keys(CATEGORIES);
}
