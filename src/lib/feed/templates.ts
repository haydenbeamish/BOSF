// Banter templates and deterministic template selection
// Tone: vulgar Australian group-chat roasts — 1–2 sentences, cook people by name.

export const LOSING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is getting cooked alive`,
    subtext: `${n} wrong in a row and still tipping like a drunk at the TAB. Someone take their phone off them before they torch what's left of their dignity.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} couldn't tip a bucket of piss`,
    subtext: `${n} straight Ls — brain smoother than a baby's arse. The group chat is eating you alive and you keep serving up fresh meat.`,
  }),
  (name: string, n: number) => ({
    headline: `Thoughts and prayers for ${name}`,
    subtext: `${n} wrong running. You're not cold, you're fucking frozen — and every wrong pick is another course on your lunch tab.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is pissing into the wind`,
    subtext: `${n} wrong on the trot. A blindfolded toddler throwing darts would shred you on the ladder right now.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is a dumpster fire`,
    subtext: `${n} wrong. Form so shithouse the boys are already picking the wagyu they're charging to your card.`,
  }),
];

export const WINNING_STREAK_TEMPLATES = [
  (name: string, n: number) => ({
    headline: `${name} is cooking with gas`,
    subtext: `${n} straight and making the rest of you look like absolute flogs. Someone piss-test this jammy cunt before they run away with the free lunch.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} can't miss — unfortunately`,
    subtext: `${n} in a row. Either genius or the luckiest prick alive — either way you're all getting shredded in the group chat while they eat for free.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is shredding the field`,
    subtext: `${n} running and rubbing it in everyone's face. The rest of you might as well start a GoFundMe for your lunch bills now.`,
  }),
  (name: string, n: number) => ({
    headline: `${name} is seeing the Matrix`,
    subtext: `${n} correct running while everyone else pisses points away. Enjoy the streak — the boys will cook you twice as hard when it snaps.`,
  }),
];

export const OUTLIER_TEMPLATES = [
  (name: string, prediction: string, event: string, popular: string) => ({
    headline: `${name} has lost the plot on ${event}`,
    subtext: `Went "${prediction}" while the herd backed "${popular}". Madman or moron — either way we're all waiting to shred you when it lands.`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `${name} going kamikaze on ${event}`,
    subtext: `"${prediction}" — nobody else had the balls. Nail it and you're a legend; bottle it and you're lunch money.`,
  }),
  (name: string, prediction: string, event: string, _popular: string) => ({
    headline: `What is ${name} smoking?`,
    subtext: `"${prediction}" against the pack on ${event}. Genius or psych eval — the group chat vote is already in.`,
  }),
];

export const CLOSE_RACE_TEMPLATES = [
  (name1: string, name2: string, gap: number) => ({
    headline: `${name1} vs ${name2} — ${gap}pt${gap === 1 ? "" : "s"} in it`,
    subtext: `Razor thin. One shit pick and someone gets cooked in front of everyone. Clench up, flogs.`,
  }),
  (name1: string, name2: string, _gap: number) => ({
    headline: `${name1} vs ${name2} — scenes incoming`,
    subtext: `Gap's nothing. Someone's about to bottle it spectacularly and the roasting will be biblical.`,
  }),
];

export const CONTRARIAN_PICK_TEMPLATES = [
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `Group vs bookies on ${event}`,
    subtext: `Bookies say ${favourite} at ${favOdds}. ${pctGroup}% of you went ${popularPick}. Someone's getting shredded when the result drops.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `${event}: backing against the market`,
    subtext: `${favourite} at ${favOdds} but ${pctGroup}% picked ${popularPick}. One side looks like absolute dogshit soon.`,
  }),
  (event: string, favourite: string, favOdds: string, popularPick: string, pctGroup: number) => ({
    headline: `${event}: herd vs bookies`,
    subtext: `${favourite} at ${favOdds}, yet ${pctGroup}% on ${popularPick}. Cook whoever's wrong — probably most of you.`,
  }),
];

export const UNDERDOG_BACKER_TEMPLATES = [
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} is off their rocker on ${event}`,
    subtext: `"${pick}" at ${odds}. Visionary or sectioned — we're all watching to shred you either way.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `${name} throwing money in the bin`,
    subtext: `"${pick}" (${odds}) for ${event}. Ballsiest or dumbest pick of the year — no middle ground.`,
  }),
  (name: string, event: string, pick: string, odds: string) => ({
    headline: `Has ${name} been on the piss?`,
    subtext: `"${pick}" at ${odds} for ${event}. Nail it and never shut up; miss and you're the week's punchline.`,
  }),
];

export const WINNERS_LIST_TEMPLATES = [
  (event: string, winners: string, losers: string) => ({
    headline: `${event} — bloodbath scorecard`,
    subtext: `${winners} cashed in.${losers ? ` ${losers} got fuck all — suck it up, you cooked yourselves.` : ""}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `${event} — winners and losers`,
    subtext: `${winners} pocketed points.${losers ? ` ${losers} can cry into their wallets — what were you thinking?` : " Everyone cleaned up for once."}`,
  }),
  (event: string, winners: string, losers: string) => ({
    headline: `Who's laughing after ${event}?`,
    subtext: `${winners} called it.${losers ? ` ${losers} — absolute shithouse reads, get shredded accordingly.` : ""}`,
  }),
];

export const GROUP_CONSENSUS_TEMPLATES = [
  (event: string, pick: string, count: number, total: number) => ({
    headline: `Herd mentality on ${event}`,
    subtext: `${count}/${total} piled on "${pick}". Follow the crowd or get cooked — someone's going home humiliated.`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `Piling on "${pick}" for ${event}`,
    subtext: `${count}/${total} same pick. Bold or obvious — losers get roasted either way.`,
  }),
  (event: string, pick: string, count: number, total: number) => ({
    headline: `${event}: crowd backs "${pick}"`,
    subtext: `${count}/${total} agree. Let's see if the herd's right or you're all getting cooked together.`,
  }),
];

export const LEADER_BANTER_TEMPLATES = [
  (name: string) => ({
    headline: `${name} eats free while you pay`,
    subtext: `Top of the ladder, zero dollars owed, laughing at all of you. Must be nice being the cunt everyone else is funding at lunch.`,
  }),
  (name: string) => ({
    headline: `${name} is shredding you from the top`,
    subtext: `Rent-free in your wallets and your heads. Every wrong pick you make is another course on someone else's tab while ${name} coasts.`,
  }),
  (name: string) => ({
    headline: `Free lunch for ${name} — you mugs pay`,
    subtext: `Royalty at the top, peasants below with wallets out. The boys are already ordering the good shit on your dime.`,
  }),
];

export const LAST_PLACE_BANTER_TEMPLATES = [
  (name: string, liability: string) => ({
    headline: `${name} is cooked — ${liability} lunch bill`,
    subtext: `Dead last and the group's personal ATM. We're ordering wagyu and champagne on your tab, you absolute flog — get the card ready.`,
  }),
  (name: string, liability: string) => ({
    headline: `${name}: dead last, ${liability} deep`,
    subtext: `Shithouse tipping all season and now you're bankrolling everyone's degustation. Start a GoFundMe or sell a kidney.`,
  }),
  (name: string, liability: string) => ({
    headline: `${name} owes ${liability} and counting`,
    subtext: `Last place, maximum humiliation. The boys will remind you every smoko until that bill is paid in full.`,
  }),
];

export const NEW_LEADER_TEMPLATES = [
  (name: string, prevLeader: string) => ({
    headline: `${name} knocks ${prevLeader} off the perch`,
    subtext: `New leader, free lunch secured. ${prevLeader} was talking shit — now they're paying for it. Beautiful.`,
  }),
  (name: string, prevLeader: string) => ({
    headline: `${prevLeader} just got mugged by ${name}`,
    subtext: `Coup complete. ${name} shredded ${prevLeader} on the ladder and the group chat is loving it.`,
  }),
  (name: string, prevLeader: string) => ({
    headline: `Coup — ${name} takes the top`,
    subtext: `${prevLeader} choked, ${name} swooped. New arse on the throne and the roasting of the former king starts now.`,
  }),
];

export const NEW_SPUD_TEMPLATES = [
  (name: string, prevSpud: string) => ({
    headline: `${name} sinks to dead last`,
    subtext: `Even ${prevSpud} is looking down now. Max lunch bill incoming — hide the credit card and your dignity.`,
  }),
  (name: string, prevSpud: string) => ({
    headline: `New spud: ${name}`,
    subtext: `${prevSpud} dodged the bullet. ${name} caught it square in the face — enjoy funding everyone's lunch, you useless flog.`,
  }),
  (name: string, prevSpud: string) => ({
    headline: `Congrats ${name}, you useless spud`,
    subtext: `Dead last. ${prevSpud} sends thanks. The boys will cook you daily until someone takes the crown off you.`,
  }),
];

export const ACCURACY_TEMPLATES = [
  (name: string, pct: number, correct: number, total: number) => ({
    headline: `${name} running at ${pct}%`,
    subtext: `${correct}/${total}. ${pct >= 70 ? "Annoyingly good — still getting shredded when you miss." : pct <= 30 ? "Embarrassingly shit — ban this person from picking." : "Thoroughly mid — nothing to brag about, plenty to roast."}`,
  }),
  (name: string, pct: number, correct: number, total: number) => ({
    headline: `${name}: ${correct}/${total} — ${pct}%`,
    subtext: `${pct >= 70 ? "Smug bastard making it look easy while everyone else cooks." : pct <= 30 ? "Hit rate so bad the lunch bill basically writes itself." : "Mediocre tipping — the group chat has better material."}`,
  }),
];

export const LUNCH_LIABILITY_TEMPLATES = [
  (name: string, amount: string, position: string) => ({
    headline: `${name} owes ${amount}`,
    subtext: `Sitting ${position} and bleeding money. Every wrong pick from here stings — the boys are watching your bill climb.`,
  }),
  (name: string, amount: string, position: string) => ({
    headline: `${name}'s wallet: ${amount} lighter`,
    subtext: `${position} on the ladder, ${amount} on the lunch tab. Tip better or get cooked twice as hard at the degustation.`,
  }),
];

export const PICKS_OPEN_TEMPLATES = [
  (event: string, pickCount: number, totalParticipants: number) => ({
    headline: `${event} — ${pickCount}/${totalParticipants} picked`,
    subtext: `Haven't picked? Cop a zero and get shredded in the feed. Don't be that person.`,
  }),
  (event: string, pickCount: number, totalParticipants: number) => ({
    headline: `${event} waiting on ${totalParticipants - pickCount} picks`,
    subtext: `${pickCount} in. The rest of you — sort your life out before the group chat cooks you.`,
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
