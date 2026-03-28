// Banter templates and deterministic template selection

export const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} has dropped ${n} in a row`,
    subtext: `Someone check on them... ${n} wrong picks and counting. Absolutely cooked.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is ice cold`,
    subtext: `${n} straight Ls. Couldn't pick their nose right now.`,
  }),
  (name: string, n: number) => ({
    headline: `Thoughts and prayers for ${name}`,
    subtext: `${n} wrong in a row. At this point it's genuinely impressive how shit they are.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a historic losing run`,
    subtext: `${n} consecutive wrong picks. A blindfolded monkey would do better.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is an absolute fraud`,
    subtext: `${n} wrong on the trot. Their crystal ball is well and truly cooked.`,
  }),
];

export const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is absolutely cooking`,
    subtext: `${n} correct in a row. Someone drug test this person.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't bloody miss`,
    subtext: `${n} straight wins. Either a genius or the luckiest bastard alive.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} on a tear`,
    subtext: `${n} in a row. The rest of you clowns should be worried.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is seeing the damn Matrix`,
    subtext: `${n} correct picks running. Everyone else is just making up the numbers.`,
  }),
];

export const PERFECT_PICK_TEMPLATES = [
  (name: string, event: string) => ({
    headline: `${name} is a certified genius`,
    subtext: `Only one to nail ${event}. The rest of you should be embarrassed.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} stood alone and was proven right`,
    subtext: `The only correct pick on ${event}. Bow down.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} backed themselves on ${event}`,
    subtext: `Sole correct pick. The rest of you followed the herd like sheep.`,
  }),
];

export const EVERYONE_WRONG_TEMPLATES = [
  (event: string) => ({
    headline: `What a pack of idiots`,
    subtext: `Not a single correct pick on ${event}. Collective brain cell count: zero.`,
  }),
  (event: string) => ({
    headline: `Complete wipeout on ${event}`,
    subtext: `Zero correct picks. A coin flip would've done a better job than all of you.`,
  }),
  (event: string) => ({
    headline: `${event} made mugs out of everyone`,
    subtext: `Not one correct pick across the board. Absolutely shameful scenes.`,
  }),
];

export const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `${name} has gone rogue on ${event}`,
    subtext: `Picked "${prediction}" while everyone else piled on "${popular}". Genius or idiot — we'll find out.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going full lone wolf on ${event}`,
    subtext: `"${prediction}" — absolutely nobody else went there. Balls of steel or rocks in the head.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} with a wildcard pick on ${event}`,
    subtext: `Backing "${prediction}" against the pack. Either hero or village idiot by week's end.`,
  }),
];

export const EVENT_RESULT_TEMPLATES = [
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${answer} wins ${event}`,
    subtext: `${correct} of ${total} got it right${correct === 0 ? " — absolute scenes, you're all useless" : correct === total ? " — too easy, no one's getting points for that" : ""}.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event} is decided`,
    subtext: `${answer} was the answer. ${correct}/${total} got it right. The rest — have a word with yourselves.`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event}: ${answer} gets it done`,
    subtext: `${correct === 0 ? "Nobody called it. Embarrassing" : `${correct} of ${total} called it right`}.`,
  }),
];

export const CLOSE_RACE_TEMPLATES = [
  (name1: string, name2: string, gap: number) => ({
    headline: `It's neck and neck at the top`,
    subtext: `${name1} leads ${name2} by just ${gap} point${gap === 1 ? "" : "s"}. One bad pick and it's all over.`,
  }),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (name1: string, name2: string, _gap: number) => ({
    headline: `${name1} vs ${name2} — this is getting spicy`,
    subtext: `The gap at the top is razor thin. Someone's about to choke.`,
  }),
];

export const ODDS_ALERT_TEMPLATES = [
  (event: string, favourite: string, odds: string) => ({
    headline: `${event} is almost here`,
    subtext: `${favourite} is the bookies' pick at ${odds}. Have you got the guts to go against it?`,
  }),
  (event: string, favourite: string, odds: string) => ({
    headline: `The odds are in for ${event}`,
    subtext: `${favourite} at ${odds} is the favourite. Half of you will still get it wrong.`,
  }),
  (event: string, favourite: string, odds: string) => ({
    headline: `${event} tips off soon`,
    subtext: `Bookmakers have ${favourite} at ${odds}. Time to put your money where your mouth is.`,
  }),
];

export const CONTRARIAN_PICK_TEMPLATES = [
  (event: string, favourite: string, favOdds: string, popularPick: string) => ({
    headline: `The group is going against the bookies on ${event}`,
    subtext: `${favourite} is the ${favOdds} favourite but most of you picked "${popularPick}". Someone's about to look very stupid.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string) => ({
    headline: `Bookies vs the group on ${event}`,
    subtext: `The money says ${favourite} (${favOdds}) but you lot reckon "${popularPick}". This'll be entertaining.`,
  }),
  (event: string, _favourite: string, _favOdds: string, popularPick: string) => ({
    headline: `Bold move from the group on ${event}`,
    subtext: `Most backed "${popularPick}" over the bookmaker favourite. Brave or bloody stupid?`,
  }),
];

export const UNDERDOG_BACKER_TEMPLATES = [
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} is riding the long shot on ${event}`,
    subtext: `Backing "${pick}" at ${odds}. Either a visionary or a complete lunatic.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} loves a punt on the underdog`,
    subtext: `Picked "${pick}" (${odds}) for ${event}. Big risk, big reward, big chance of looking like an idiot.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} going against the grain on ${event}`,
    subtext: `"${pick}" at ${odds} — the kind of pick that's either legendary or embarrassing. No in between.`,
  }),
];

export const WINNERS_LIST_TEMPLATES = [
  (event: string, winners: string, losers: string) => ({
    headline: `Who cashed in on ${event}`,
    subtext: `Points to: ${winners}. ${losers ? `Unlucky: ${losers}.` : ""}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `${event} — the scorecard`,
    subtext: `${winners} pocketed the points. ${losers ? `${losers} got nothing.` : "Everyone cleaned up."}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `Points awarded for ${event}`,
    subtext: `${winners} called it right. ${losers ? `${losers} can stew on it.` : ""}`,
  }),
];

export const GROUP_CONSENSUS_TEMPLATES = [
  (event: string, pick: string, count: number, total: number) => ({
    headline: `The group has spoken on ${event}`,
    subtext: `${count} of ${total} have gone with "${pick}". The rest are taking their chances.`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `Everyone's piling on "${pick}" for ${event}`,
    subtext: `${count}/${total} picked the same thing. Bold strategy — or just the obvious answer?`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `${event}: the crowd goes with "${pick}"`,
    subtext: `${count} out of ${total} in agreement. Let's see if the herd is right this time.`,
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
