/* =========================================================
   PHASE 2 — decisions
   A scene, two or three options, no preview of outcomes.
   Some of what you choose lands two or three seasons later.
   ========================================================= */

interface Reputation { loyal: number; mercenary: number; political: number; fragile: number }

interface Effect {
  attrs?: Partial<Attributes>;
  car?: number;
  rep?: Partial<Reputation>;
}

interface Consequence {
  inSeasons: number;
  text: string;
  effect?: Effect;
}

interface DecisionOption {
  label: string;
  detail: string;
  outcome: string;          // shown only after choosing
  effect: Effect;
  later?: Consequence;
}

interface Decision {
  id: string;
  eyebrow: string;
  scene: string;
  question: string;
  options: DecisionOption[];
  /** gating — trait, seat, year, or how the season actually went */
  when?: () => boolean;
}

interface LogEntry { year: number; decision: string; chose: string; outcome: string }

/* --------------------------- career state --------------------------- */

const careerGrowth: Attributes = { qualifying: 0, racecraft: 0, tyres: 0, wet: 0, feedback: 0, consistency: 0 };
const reputation: Reputation = { loyal: 0, mercenary: 0, political: 0, fragile: 0 };
const decisionLog: LogEntry[] = [];
const usedDecisions = new Set<string>();
let pending: Array<Consequence & { dueYear: number }> = [];
let carBonus = 0;
let currentDecision: Decision | null = null;

const careerTotals = { seasons: 0, points: 0, wins: 0, podiums: 0, titles: 0, beat: 0, lost: 0 };

function repLabel(): string {
  const entries = Object.entries(reputation) as Array<[keyof Reputation, number]>;
  const [top, val] = entries.sort((a, b) => b[1] - a[1])[0];
  if (val <= 0) return "Unknown quantity";
  return { loyal: "Loyal", mercenary: "Mercenary", political: "Political", fragile: "Fast but fragile" }[top];
}

function applyEffect(e: Effect | undefined): void {
  if (!e) return;
  if (e.attrs) {
    (Object.keys(e.attrs) as Array<keyof Attributes>).forEach((k) => {
      careerGrowth[k] += e.attrs![k] ?? 0;
    });
  }
  if (e.car) carBonus += e.car;
  if (e.rep) {
    (Object.keys(e.rep) as Array<keyof Reputation>).forEach((k) => {
      reputation[k] += e.rep![k] ?? 0;
    });
  }
}

/* --------------------------- the pool --------------------------- */

const lastSeasonPos = (): number => (season ? championshipPos() : 99);
const beatMate = (): boolean => {
  if (!season) return false;
  const b = season.results.filter((r) => r.beatTeamMate).length;
  return b > season.results.length - b;
};

const DECISIONS: Decision[] = [
  {
    id: "engine-deal",
    eyebrow: "Winter",
    scene: "A supplier offers your team a cut-price engine deal for next season. It's quick over one lap and everyone in the paddock knows it grenades by round eight.",
    question: "Your team asks what you want.",
    options: [
      { label: "Take the pace", detail: "Faster kart, and you'll be walking back from some races.",
        outcome: "You take it. The thing is a rocket for six weekends.",
        effect: { car: 4, attrs: { consistency: -3 }, rep: { fragile: 2 } },
        later: { inSeasons: 2, text: "The supplier folds. Everyone who ran their engines is scrambling for parts, you included.", effect: { car: -3 } } },
      { label: "Stay reliable", detail: "Slower, but you'll see the flag.",
        outcome: "You pass. The kart is ordinary and it finishes every race.",
        effect: { attrs: { consistency: 4 }, rep: { loyal: 1 } } },
    ],
  },
  {
    id: "mate-blame",
    eyebrow: "Round 7",
    scene: "Your team-mate ran you wide at the hairpin and it cost you both a podium. The team principal asks you, in front of the whole garage, what happened.",
    question: "You have about two seconds.",
    options: [
      { label: "Say it was racing", detail: "Absorb it. The garage sees a driver who doesn't create problems.",
        outcome: "You shrug it off. Your team-mate says nothing, but he knows.",
        effect: { rep: { loyal: 3 } },
        later: { inSeasons: 2, text: "Your old team-mate is asked about you by a bigger team. He tells them you're easy to work with.", effect: { car: 3 } } },
      { label: "Say it was him", detail: "True, and expensive.",
        outcome: "You say it plainly. The garage goes quiet. He doesn't speak to you for a month.",
        effect: { attrs: { racecraft: 3 }, rep: { political: 2, mercenary: 1 } },
        later: { inSeasons: 2, text: "A team you wanted to drive for hears you're difficult in a debrief.", effect: { car: -2 } } },
      { label: "Take the blame yourself", detail: "It wasn't yours to take.",
        outcome: "You take it on the chin. The engineers exchange a look.",
        effect: { rep: { loyal: 2, political: 1 }, attrs: { feedback: 2 } } },
    ],
  },
  {
    id: "wet-start",
    eyebrow: "Round 11",
    scene: "Rain arrives on the formation lap. Half the grid is diving into the pits for wets. Your engineer thinks the shower passes in ten minutes.",
    question: "Slicks or wets.",
    options: [
      { label: "Gamble on slicks", detail: "If he's right you win. If he's wrong you're last.",
        outcome: "You stay out. Six laps of tiptoeing, then the track dries and you're gone.",
        effect: { attrs: { wet: 5, racecraft: 2 }, rep: { fragile: 1 } } },
      { label: "Pit for wets", detail: "The safe half of the grid.",
        outcome: "You pit with everyone else and finish where you started.",
        effect: { attrs: { consistency: 3 } } },
    ],
    when: () => !!season && season.results.some((r) => r.wet),
  },
  {
    id: "sim-work",
    eyebrow: "Off-season",
    scene: "The team wants three weeks of your winter on the rig, mapping a new chassis. It's tedious, unpaid, and nobody outside the factory will ever know you did it.",
    question: "Winter is short.",
    options: [
      { label: "Do the work", detail: "Learn the car nobody else understands yet.",
        outcome: "You spend the winter in a dark room with an engineer called Marta. The chassis gets better.",
        effect: { attrs: { feedback: 6, tyres: 3 }, rep: { loyal: 2 } },
        later: { inSeasons: 2, text: "Marta moves to a front-running team and asks for you by name.", effect: { car: 4 } } },
      { label: "Race elsewhere instead", detail: "Endurance cameo. Seat time, exposure, money.",
        outcome: "You do a winter series abroad. Different tyres, different rivals, useful.",
        effect: { attrs: { racecraft: 4, tyres: 2 }, rep: { mercenary: 2 } } },
      { label: "Take the winter off", detail: "You're nineteen and exhausted.",
        outcome: "You go home. You come back rested and a step behind.",
        effect: { attrs: { consistency: 3, feedback: -2 } } },
    ],
  },
  {
    id: "rival-offer",
    eyebrow: "Contract talks",
    scene: "The team that beat you all season wants you. More money, better machinery, and a team-mate who has never been out-qualified by anyone.",
    question: "Your current team have been good to you.",
    options: [
      { label: "Sign with them", detail: "Better kart. Brutal benchmark.",
        outcome: "You sign. Your old engineer shakes your hand and doesn't look at you.",
        effect: { car: 6, rep: { mercenary: 3 } },
        later: { inSeasons: 3, text: "Your old team wins the title with the driver they signed instead of you.", effect: { rep: { fragile: 1 } } } },
      { label: "Stay where you are", detail: "Slower, and they build the car around you.",
        outcome: "You stay. The team principal tells the press you're family.",
        effect: { attrs: { feedback: 4, consistency: 2 }, rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "Staying paid off — the team's new chassis is built to your feedback.", effect: { car: 4 } } },
    ],
    when: () => lastSeasonPos() > 1,
  },
  {
    id: "sponsor",
    eyebrow: "Money",
    scene: "A sponsor will fund your whole season. They want twelve appearance days, a documentary crew at every round, and approval over what you say.",
    question: "The alternative is finding the money yourself.",
    options: [
      { label: "Sign the deal", detail: "Funded. Filmed. Managed.",
        outcome: "You sign. There is a camera in the garage before every session now.",
        effect: { car: 5, attrs: { consistency: -2 }, rep: { political: 3 } } },
      { label: "Turn it down", detail: "Keep your season quiet and your mouth free.",
        outcome: "You turn it down. Money is tight and nobody tells you what to say.",
        effect: { attrs: { racecraft: 3 }, rep: { loyal: 2 } },
        later: { inSeasons: 3, text: "The sponsor's other driver burns out under the attention. People remember you saw it coming.", effect: { rep: { political: 1 } } } },
    ],
  },
  {
    id: "test-crash",
    eyebrow: "Testing",
    scene: "You've found four tenths in a corner nobody else takes flat. It works about three times in four. The team have one chassis left and no budget for another.",
    question: "There's a test session tomorrow.",
    options: [
      { label: "Keep taking it flat", detail: "Four tenths is four tenths.",
        outcome: "You keep doing it. It works, until the session it doesn't.",
        effect: { attrs: { qualifying: 6, consistency: -4 }, rep: { fragile: 3 } },
        later: { inSeasons: 2, text: "The corner catches you out in front of a scout. It gets brought up for years.", effect: { attrs: { qualifying: -2 } } } },
      { label: "Bank it for qualifying only", detail: "Use it once a weekend, when it counts.",
        outcome: "You save it for the lap that matters. The engineers approve.",
        effect: { attrs: { qualifying: 3, feedback: 2 } } },
      { label: "Leave it alone", detail: "The chassis has to last the year.",
        outcome: "You back off. Someone else finds it two months later.",
        effect: { attrs: { consistency: 4, qualifying: -1 }, rep: { loyal: 1 } } },
    ],
    when: () => (driver.trait?.id === "qualifier" || driver.trait?.id === "overtaker"),
  },
  {
    id: "engineer-blame",
    eyebrow: "Post-race",
    scene: "A strategy call from the pit wall cost you a win. The press are asking, and your engineer is standing four feet away.",
    question: "Somebody is about to be blamed.",
    options: [
      { label: "Back your engineer publicly", detail: "Take the hit on his behalf.",
        outcome: "You say it was a shared call. He doesn't thank you. He never forgets it either.",
        effect: { attrs: { feedback: 4 }, rep: { loyal: 3 } },
        later: { inSeasons: 3, text: "Your engineer is now chief strategist somewhere serious, and he still owes you one.", effect: { car: 5 } } },
      { label: "Let the blame land", detail: "It wasn't your call and everyone knows it.",
        outcome: "You answer honestly. He's moved off your car by the next round.",
        effect: { attrs: { racecraft: 2 }, rep: { mercenary: 2, political: 1 } },
        later: { inSeasons: 2, text: "Your new engineer has heard what happened to the last one. The debriefs are shorter now.", effect: { attrs: { feedback: -3 } } } },
    ],
    when: () => driver.trait?.id === "feedback" || lastSeasonPos() <= 8,
  },
  {
    id: "junior-programme",
    eyebrow: "The call",
    scene: "A manufacturer junior programme calls. They want you on a development contract: their coaching, their doctors, their schedule — and they own where you race next.",
    question: "It's the fastest way up, and the least of it is yours.",
    options: [
      { label: "Sign with the programme", detail: "Doors open. You stop choosing which ones.",
        outcome: "You sign. Someone else manages your calendar from Monday.",
        effect: { car: 6, attrs: { consistency: 3, racecraft: -2 }, rep: { political: 2 } },
        later: { inSeasons: 3, text: "The programme has too many drivers and not enough seats. You're one of six.", effect: { car: -4 } } },
      { label: "Stay independent", detail: "Slower, and every choice stays yours.",
        outcome: "You stay independent. Nobody's phone rings for you but your own.",
        effect: { attrs: { racecraft: 4, feedback: 2 }, rep: { mercenary: 1, loyal: 1 } } },
    ],
    when: () => beatMate() || lastSeasonPos() <= 5,
  },
  {
    id: "injury",
    eyebrow: "Mid-season",
    scene: "You've cracked a bone in your hand. Two rounds off and it heals clean. Race on it and it holds, probably, and hurts every lap.",
    question: "There's a scout at the next round.",
    options: [
      { label: "Race on it", detail: "Nobody sees the hand. Everybody sees the result.",
        outcome: "You race. It's the worst pain of your life and you finish.",
        effect: { attrs: { consistency: -3, racecraft: 4 }, rep: { fragile: 2 } },
        later: { inSeasons: 2, text: "The hand never fully came back. Long races hurt now.", effect: { attrs: { tyres: -3 } } } },
      { label: "Sit out two rounds", detail: "Heal properly. Lose the points.",
        outcome: "You sit them out and watch your team-mate score in your kart.",
        effect: { attrs: { consistency: 4 } } },
    ],
  },
];

/* --------------------------- engine --------------------------- */

function decisionDue(year: number): boolean {
  const cadence = driver.mode === "intense" ? 1 : driver.mode === "normal" ? 2 : 3;
  return year % cadence === 0;
}

function pickDecision(): Decision | null {
  const eligible = DECISIONS.filter((d) => !usedDecisions.has(d.id) && (!d.when || d.when()));
  if (eligible.length === 0) return null;
  return eligible[Math.floor(rng() * eligible.length)];
}

function chooseOption(opt: DecisionOption): void {
  applyEffect(opt.effect);
  if (opt.later) pending.push({ ...opt.later, dueYear: (season?.year ?? 1) + opt.later.inSeasons });
  decisionLog.push({
    year: season?.year ?? 1,
    decision: currentDecision!.id,
    chose: opt.label,
    outcome: opt.outcome,
  });
  usedDecisions.add(currentDecision!.id);
}

/** Consequences that come due this season, applied and returned for display. */
function resolveDue(year: number): string[] {
  const due = pending.filter((c) => c.dueYear <= year);
  pending = pending.filter((c) => c.dueYear > year);
  due.forEach((c) => applyEffect(c.effect));
  return due.map((c) => c.text);
}

/** Natural development — fast early, flattening out. */
function growSeason(year: number): void {
  const rate = year <= 3 ? 3 : year <= 6 ? 2 : 1;
  (Object.keys(careerGrowth) as Array<keyof Attributes>).forEach((k) => {
    careerGrowth[k] += rate * (0.5 + rng() * 0.9);
  });
}
