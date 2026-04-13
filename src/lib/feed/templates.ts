// Banter templates and deterministic template selection

export const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is shitting the bed`,
    subtext: `${n} wrong in a row. Picks as useful as a screen door on a submarine.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} couldn't tip a bucket of water`,
    subtext: `${n} straight Ls. Can't pick their arse with both hands.`,
  }),
  (name: string, n: number) => ({
    headline: `Thoughts and prayers for ${name}`,
    subtext: `${n} wrong running. Impressively shit.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is pissing into the wind`,
    subtext: `${n} wrong. A drunk toddler would do better.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is a dumpster fire`,
    subtext: `${n} wrong on the trot. Brain smoother than a baby's arse.`,
  }),
];

export const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is cooking with gas`,
    subtext: `${n} straight. Someone piss-test this jammy bastard.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't miss`,
    subtext: `${n} in a row. Genius or luckiest prick alive.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is making you all look stupid`,
    subtext: `${n} running. The rest of you, don't bother showing up.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is seeing the Matrix`,
    subtext: `${n} correct running. Everyone else is pissing money away.`,
  }),
];

export const PERFECT_PICK_TEMPLATES = [
  (name: string, event: string) => ({
    headline: `${name} — certified genius`,
    subtext: `Only one to nail ${event}. The rest of you, ashamed.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} stood alone on ${event}. Correct.`,
    subtext: `Only correct pick. Bow down, you pack of sheep.`,
  }),
  (name: string, event: string) => ({
    headline: `${name} has massive balls on ${event}`,
    subtext: `Sole correct pick. Everyone else copied homework and still failed.`,
  }),
];

export const EVERYONE_WRONG_TEMPLATES = [
  (event: string) => ({
    headline: `${event} — nobody got it right`,
    subtext: `Zero correct. Collective IQ of a dead goldfish.`,
  }),
  (event: string) => ({
    headline: `Complete shitshow on ${event}`,
    subtext: `Zero correct. A blind dog would've done better.`,
  }),
  (event: string) => ({
    headline: `${event} made mugs of the lot of you`,
    subtext: `Not one correct pick. Embarrassing.`,
  }),
];

export const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `${name} has lost the plot on ${event}`,
    subtext: `Picked "${prediction}" while everyone went "${popular}". Madman or moron.`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going kamikaze on ${event}`,
    subtext: `"${prediction}" — nobody else had the balls to go there.`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `What is ${name} smoking?`,
    subtext: `"${prediction}" against the pack on ${event}. Genius or psych eval.`,
  }),
];

export const EVENT_RESULT_TEMPLATES = [
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${answer} wins ${event}`,
    subtext: `${correct}/${total} got it right${correct === 0 ? ". Not one of you called it" : correct === total ? ". Too easy" : `. The other ${total - correct}? Cooked.`}`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${event}: it's ${answer}`,
    subtext: `${correct}/${total} called it. ${correct === 0 ? "Pathetic. All frauds." : correct < total / 2 ? "Most of you are hopeless." : "Not bad for a bunch of degenerates."}`,
  }),
  (event: string, answer: string, correct: number, total: number) => ({
    headline: `${answer} gets it done — ${event}`,
    subtext: `${correct === 0 ? "Zero correct. Disgraceful" : correct === total ? "Everyone got it. Snooze" : `${correct}/${total} nailed it. Rest of you, sort it out`}.`,
  }),
];

export const CLOSE_RACE_TEMPLATES = [
  (name1: string, name2: string, gap: number) => ({
    headline: `${name1} vs ${name2} — ${gap}pt${gap === 1 ? "" : "s"} in it`,
    subtext: `One shit pick and it flips. Clench up.`,
  }),
  (name1: string, name2: string, _gap: number) => ({
    headline: `${name1} vs ${name2} — scenes incoming`,
    subtext: `Razor thin gap. Someone's about to bottle it.`,
  }),
];

export const CONTRARIAN_PICK_TEMPLATES = [
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `Group vs bookies on ${event}`,
    subtext: `Bookies: ${favourite} at ${favOdds}. Group: ${pctGroup}% on ${popularPick}.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `${event}: backing against the market`,
    subtext: `${favourite} at ${favOdds} but ${pctGroup}% went ${popularPick}. Someone's wrong.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `${event}: group vs bookies`,
    subtext: `${favourite} at ${favOdds}, yet ${pctGroup}% picked ${popularPick}. One side looks silly soon.`,
  }),
];

export const UNDERDOG_BACKER_TEMPLATES = [
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} is off their rocker on ${event}`,
    subtext: `"${pick}" at ${odds}. Visionary or lunatic.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} throwing money in the bin`,
    subtext: `"${pick}" (${odds}) for ${event}. Sectioning-worthy pick.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `Has ${name} been drinking?`,
    subtext: `"${pick}" at ${odds} for ${event}. Ballsiest or dumbest. No in between.`,
  }),
];

export const WINNERS_LIST_TEMPLATES = [
  (event: string, winners: string, losers: string) => ({
    headline: `${event} — bloodbath scorecard`,
    subtext: `${winners} cashed in.${losers ? ` ${losers} got nothing. Suck it.` : ""}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `${event} — winners and losers`,
    subtext: `${winners} pocketed points.${losers ? ` ${losers} can cry about it.` : " Everyone cleaned up."}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `Who's laughing after ${event}?`,
    subtext: `${winners} called it.${losers ? ` ${losers} — what were you thinking?` : ""}`,
  }),
];

export const GROUP_CONSENSUS_TEMPLATES = [
  (event: string, pick: string, count: number, total: number) => ({
    headline: `Group has spoken on ${event}`,
    subtext: `${count}/${total} on "${pick}". The rest are gambling.`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `Piling on "${pick}" for ${event}`,
    subtext: `${count}/${total} same pick. Bold or just obvious?`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `${event}: crowd backs "${pick}"`,
    subtext: `${count}/${total} agree. Let's see if the herd is right.`,
  }),
];

export const LEADER_BANTER_TEMPLATES = [
  (name: string) => ({
    headline: `${name} eats free. You pay.`,
    subtext: `Top of the ladder, zero dollars owed. Must be nice.`,
  }),
  (name: string) => ({
    headline: `${name} is laughing at all of you`,
    subtext: `Rent-free in your wallets and your heads.`,
  }),
  (name: string) => ({
    headline: `Free lunch for ${name}`,
    subtext: `Royalty at the top. Peasants below, wallets out.`,
  }),
];

export const LAST_PLACE_BANTER_TEMPLATES = [
  (name: string, liability: string) => ({
    headline: `${name} is cooked — ${liability} lunch bill`,
    subtext: `Dead last. We're ordering lobster. Get the card ready.`,
  }),
  (name: string, liability: string) => ({
    headline: `${name}: dead last, ${liability} deep`,
    subtext: `Wagyu and champagne on this clown's tab.`,
  }),
  (name: string, liability: string) => ({
    headline: `${name} owes ${liability} and counting`,
    subtext: `Last place. The group's personal ATM. Start a GoFundMe.`,
  }),
];

export const NEW_LEADER_TEMPLATES = [
  (name: string, prevLeader: string) => ({
    headline: `${name} knocks ${prevLeader} off the perch`,
    subtext: `New leader. Free lunch secured. Wallet out, ${prevLeader}.`,
  }),
  (name: string, prevLeader: string) => ({
    headline: `${prevLeader} just got mugged by ${name}`,
    subtext: `Was talking shit. Now paying for lunch. Beautiful.`,
  }),
  (name: string, prevLeader: string) => ({
    headline: `Coup — ${name} takes the top`,
    subtext: `${prevLeader} choked. ${name} swooped. New arse on the throne.`,
  }),
];

export const NEW_SPUD_TEMPLATES = [
  (name: string, prevSpud: string) => ({
    headline: `${name} sinks to dead last`,
    subtext: `Even ${prevSpud} is looking down now. Max lunch bill incoming.`,
  }),
  (name: string, prevSpud: string) => ({
    headline: `New spud: ${name}`,
    subtext: `${prevSpud} dodged the bullet. ${name} caught it in the face. Enjoy the bill.`,
  }),
  (name: string, prevSpud: string) => ({
    headline: `Congrats ${name}, you useless spud`,
    subtext: `Dead last. ${prevSpud} sends thanks. Hide the credit card.`,
  }),
];

export const UPSET_ALERT_TEMPLATES = [
  (event: string, winner: string, favourite: string, favOdds: string) => ({
    headline: `Upset! ${winner} rolls ${favourite} — ${event}`,
    subtext: `Bookies had ${favourite} at ${favOdds}. If you called it, you're a genius.`,
  }),
  (event: string, winner: string, favourite: string, favOdds: string) => ({
    headline: `${favourite} (${favOdds}) pantsed`,
    subtext: `${winner} wins ${event}. Bookies wrong. You too if you followed them.`,
  }),
  (event: string, winner: string, favourite: string, _favOdds: string) => ({
    headline: `${event}: bookies in shambles`,
    subtext: `${winner} over ${favourite}. Tipped the upset? Take a bow.`,
  }),
];

export const ACCURACY_TEMPLATES = [
  (name: string, pct: number, correct: number, total: number) => ({
    headline: `${name} running at ${pct}%`,
    subtext: `${correct}/${total}. ${pct >= 70 ? "Annoyingly good." : pct <= 30 ? "Embarrassingly shit." : "Thoroughly mid."}`,
  }),
  (name: string, pct: number, correct: number, total: number) => ({
    headline: `${name}: ${correct}/${total} — ${pct}%`,
    subtext: `${pct >= 70 ? "Smug bastard making it look easy." : pct <= 30 ? "Ban this person from picking." : "Nothing to brag about."}`,
  }),
];

export const LUNCH_LIABILITY_TEMPLATES = [
  (name: string, amount: string, position: string) => ({
    headline: `${name} owes ${amount}`,
    subtext: `Sitting ${position}. Every wrong pick stings from here.`,
  }),
  (name: string, amount: string, position: string) => ({
    headline: `${name}'s wallet: ${amount} lighter`,
    subtext: `${position}. Tip better or that bill goes up.`,
  }),
];

export const PICKS_OPEN_TEMPLATES = [
  (event: string, pickCount: number, totalParticipants: number) => ({
    headline: `${event} — ${pickCount}/${totalParticipants} picked`,
    subtext: `Pick or cop a zero. Don't be that person.`,
  }),
  (event: string, pickCount: number, totalParticipants: number) => ({
    headline: `${event} waiting on ${totalParticipants - pickCount} picks`,
    subtext: `${pickCount} in. Haven't picked yet? Sort your life out.`,
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
