// Banter templates and deterministic template selection

export const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} has dropped ${n} in a row`,
    subtext: `${n} wrong picks and counting. The form slump continues.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is ice cold`,
    subtext: `${n} straight misses. The run has to turn eventually.`,
  }),
  (name: string, n: number) => ({
    headline: `Rough patch for ${name}`,
    subtext: `${n} wrong in a row. The ladder won't be kind.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a historic losing run`,
    subtext: `${n} consecutive wrong picks. Due for a correction?`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't buy a win`,
    subtext: `${n} wrong on the trot. The crystal ball needs recalibrating.`,
  }),
];

export const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is in red-hot form`,
    subtext: `${n} correct in a row. The streak keeps building.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't miss right now`,
    subtext: `${n} straight wins. The rest of the field is on notice.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a tear`,
    subtext: `${n} in a row. Serious momentum building.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} reading the form guide perfectly`,
    subtext: `${n} correct picks running. Everyone else is playing catch-up.`,
  }),
];

export const PERFECT_PICK_TEMPLATES = [
  (name: string, event: string) => ({
    headline: `${name} nailed it on ${event}`,
    subtext: `The only one to get it right. That's a quality pick.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} stood alone and was proven right`,
    subtext: `The only correct pick on ${event}. Conviction rewarded.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} backed themselves on ${event}`,
    subtext: `Sole correct pick. Sometimes the crowd gets it wrong.`,
  }),
];

export const EVERYONE_WRONG_TEMPLATES = [
  (event: string) => ({
    headline: `Nobody saw that coming`,
    subtext: `Not a single correct pick on ${event}. A genuine upset.`,
  }),
  (event: string) => ({
    headline: `A clean sweep of wrong picks on ${event}`,
    subtext: `Zero correct. The result surprised everyone.`,
  }),
  (event: string) => ({
    headline: `${event} caught the whole field out`,
    subtext: `Not one correct pick across the board. That's a rare one.`,
  }),
];

export const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `Bold call from ${name} on ${event}`,
    subtext: `Picked "${prediction}" — most others went with "${popular}".`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going against the grain on ${event}`,
    subtext: `Backing "${prediction}" while the rest of the field went elsewhere.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} with a contrarian pick on ${event}`,
    subtext: `"${prediction}" — going against the pack. Could be the difference.`,
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
    headline: `The group is going against the market on ${event}`,
    subtext: `${favourite} is the ${favOdds} favourite but most picked "${popularPick}". Someone's wrong.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string) => ({
    headline: `Market vs the group on ${event}`,
    subtext: `The money says ${favourite} (${favOdds}) but the popular pick is "${popularPick}".`,
  }),
  (event: string, _favourite: string, _favOdds: string, popularPick: string) => ({
    headline: `Bold move from the group on ${event}`,
    subtext: `Most backed "${popularPick}" over the bookmaker favourite. Conviction or hubris?`,
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
