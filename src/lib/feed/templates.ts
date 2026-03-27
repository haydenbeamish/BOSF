// Banter templates and deterministic template selection

export const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} has lost ${n} in a row`,
    subtext: `Someone check on them... ${n} wrong picks and counting.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is ice cold`,
    subtext: `${n} straight Ls. Couldn't pick their nose right now.`,
  }),
  (name: string, n: number) => ({
    headline: `Thoughts and prayers for ${name}`,
    subtext: `${n} wrong in a row. At this point it's a talent.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a historic losing run`,
    subtext: `${n} consecutive wrong picks. Maybe try picking the opposite?`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is the king of bad takes`,
    subtext: `${n} wrong on the trot. Their crystal ball is well and truly broken.`,
  }),
];

export const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is absolutely cooking`,
    subtext: `${n} correct in a row. Hide your predictions.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't miss`,
    subtext: `${n} straight wins. Is this person from the future?`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a tear`,
    subtext: `${n} in a row! The rest of you should be worried.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is seeing the Matrix`,
    subtext: `${n} correct picks running. Everyone else is playing catch-up.`,
  }),
];

export const PERFECT_PICK_TEMPLATES = [
  (name: string, event: string) => ({
    headline: `Big brain move from ${name}`,
    subtext: `Only one to get ${event} right. Galaxy brain stuff.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} stood alone and was proven right`,
    subtext: `The only correct pick on ${event}. Respect.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} backed themselves on ${event}`,
    subtext: `Sole correct pick. Sometimes the crowd is wrong.`,
  }),
];

export const EVERYONE_WRONG_TEMPLATES = [
  (event: string) => ({
    headline: `Nobody saw that coming`,
    subtext: `Not a single correct pick on ${event}. The collective brain failed.`,
  }),
  (event: string) => ({
    headline: `A complete wipeout on ${event}`,
    subtext: `Zero correct picks. Should have asked a coin.`,
  }),
  (event: string) => ({
    headline: `${event} broke everyone's brain`,
    subtext: `Not one correct pick across the board. Nobody saw it coming.`,
  }),
];

export const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `Bold call from ${name}`,
    subtext: `Picked "${prediction}" for ${event} — most others went "${popular}".`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going rogue on ${event}`,
    subtext: `"${prediction}" — a lone wolf pick that could pay off big.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} with the wildcard on ${event}`,
    subtext: `Backing "${prediction}" against the pack. Fortune favours the bold?`,
  }),
];

export const EVENT_RESULT_TEMPLATES = [
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${answer} wins ${event}`,
    subtext: `${correct} of ${total} got it right${correct === 0 ? " — absolute scenes" : correct === total ? " — too easy" : ""}.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event} is decided`,
    subtext: `${answer} was the answer. ${correct}/${total} correct picks.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event}: ${answer} gets it done`,
    subtext: `${correct === 0 ? "Nobody" : `${correct} of ${total}`} called it right.`,
  }),
];

export const CLOSE_RACE_TEMPLATES = [
  (name1: string, name2: string, gap: number) => ({
    headline: `It's neck and neck at the top`,
    subtext: `${name1} leads ${name2} by just ${gap} point${gap === 1 ? "" : "s"}. Any event could flip it.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name1: string, name2: string, _gap: number) => ({
    headline: `${name1} vs ${name2} — the race is on`,
    subtext: `The gap at the top is razor thin. One big pick changes everything.`,
  }),
];

export const ODDS_ALERT_TEMPLATES = [
  (event: string, favourite: string, odds: string) => ({
    headline: `${event} is almost here`,
    subtext: `${favourite} is the bookies' pick at ${odds}. Do you agree?`,
  }),
  (event: string, favourite: string, odds: string) => ({
    headline: `The odds are in for ${event}`,
    subtext: `${favourite} at ${odds} is the favourite. Let's see who called it.`,
  }),
  (event: string, favourite: string, odds: string) => ({
    headline: `${event} tips off soon`,
    subtext: `Bookmakers have ${favourite} at ${odds} to get it done.`,
  }),
];

export const CONTRARIAN_PICK_TEMPLATES = [
  (event: string, favourite: string, favOdds: string, popularPick: string) => ({
    headline: `The group is going against the bookies on ${event}`,
    subtext: `${favourite} is the ${favOdds} favourite but most of you picked "${popularPick}". Someone's wrong.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string) => ({
    headline: `Bookies vs the boys on ${event}`,
    subtext: `The money says ${favourite} (${favOdds}) but the people say "${popularPick}". Spicy.`,
  }),
  (event: string, _favourite: string, _favOdds: string, popularPick: string) => ({
    headline: `Bold move from the group on ${event}`,
    subtext: `Most of you backed "${popularPick}" over the bookmaker favourite. Brave or foolish?`,
  }),
];

export const UNDERDOG_BACKER_TEMPLATES = [
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} is riding the long shot on ${event}`,
    subtext: `Backing "${pick}" at ${odds}. Fortune favours the brave.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} loves an underdog`,
    subtext: `Picked "${pick}" (${odds}) for ${event}. Big risk, big reward.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} going against the grain on ${event}`,
    subtext: `"${pick}" at ${odds} — not for the faint-hearted.`,
  }),
];

/** Use a seeded index based on string hash for deterministic template selection */
export function hashPick<T>(templates: T[], seed: string): T {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  return templates[Math.abs(hash) % templates.length];
}
