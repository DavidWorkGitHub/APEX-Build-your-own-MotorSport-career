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

interface Branch {
  w: number;                // relative weight
  outcome: string;
  effect: Effect;
  later?: Consequence;
}

interface DecisionOption {
  label: string;
  detail: string;
  outcome: string;          // shown only after choosing
  effect: Effect;
  later?: Consequence;
  /** A gamble: one of these fires. The player sees the odds exist, never which way it went. */
  roll?: Branch[];
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

/** Natural development — capped by the level you're racing in. */
const careerGrowth: Attributes = { qualifying: 0, racecraft: 0, tyres: 0, wet: 0, feedback: 0, consistency: 0 };
/** Won or lost through decisions — not capped, because a choice should always count. */
const earnedGrowth: Attributes = { qualifying: 0, racecraft: 0, tyres: 0, wet: 0, feedback: 0, consistency: 0 };
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
      earnedGrowth[k] += e.attrs![k] ?? 0;
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
      { label: "Take the pace", detail: "Faster, and it might not last the year.",
        outcome: "You take it.",
        effect: { car: 4, attrs: { consistency: -3 }, rep: { fragile: 2 } },
        roll: [
          { w: 45, outcome: "It's a rocket all year and never misses a beat.", effect: { car: 3, attrs: { qualifying: 4 } } },
          { w: 35, outcome: "It's quick, until it isn't. Three engines in five rounds.", effect: { attrs: { consistency: -4 } } },
          { w: 20, outcome: "It lets go at the worst possible moment, in front of everyone who mattered.", effect: { car: -4, attrs: { qualifying: -3 }, rep: { fragile: 3 } } },
        ],
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
        outcome: "You stay out.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 40, outcome: "The shower passes in eight minutes and you drive away from the entire field.", effect: { attrs: { wet: 8, racecraft: 4, qualifying: 2 } } },
          { w: 35, outcome: "It rains harder. You survive it, barely, and learn more in twenty minutes than in the year before.", effect: { attrs: { wet: 5, consistency: -2 } } },
          { w: 25, outcome: "You're in the wall at turn four before the second lap is done.", effect: { attrs: { wet: -3, consistency: -4 }, rep: { fragile: 3 } } },
        ] },
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
      { label: "Keep taking it flat", detail: "Four tenths is four tenths. Three times in four.",
        outcome: "You keep doing it.",
        effect: { rep: { fragile: 3 } },
        roll: [
          { w: 50, outcome: "It holds all season and it becomes the thing people know you for.", effect: { attrs: { qualifying: 9, racecraft: 3 } } },
          { w: 30, outcome: "It bites in qualifying at the worst circuit on the calendar and the chassis is bent.", effect: { attrs: { qualifying: 3, consistency: -5 }, car: -3 } },
          { w: 20, outcome: "You put it in the barrier hard enough that the team stop you doing it.", effect: { attrs: { qualifying: -4, consistency: -3 }, car: -4 } },
        ],
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
        outcome: "You race.",
        effect: { rep: { fragile: 2 } },
        roll: [
          { w: 45, outcome: "It holds. You finish fourth and the scout writes your name down.", effect: { attrs: { racecraft: 6, consistency: 2 }, car: 3 } },
          { w: 35, outcome: "It's the worst pain of your life and you finish, nowhere.", effect: { attrs: { racecraft: 3, consistency: -3 } } },
          { w: 20, outcome: "The bone goes properly on lap nine. That's the season.", effect: { attrs: { racecraft: -3, tyres: -4, consistency: -4 } } },
        ],
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

/** Picks one branch of a gamble, weighted. */
function resolveRoll(branches: Branch[]): Branch {
  const total = branches.reduce((n, b) => n + b.w, 0);
  let pick = rng() * total;
  for (const b of branches) { pick -= b.w; if (pick <= 0) return b; }
  return branches[branches.length - 1];
}

/** Returns the text to show, which for a gamble is the branch that actually fired. */
function chooseOption(opt: DecisionOption): string {
  applyEffect(opt.effect);
  if (opt.later) pending.push({ ...opt.later, dueYear: (season?.year ?? 1) + opt.later.inSeasons });

  let text = opt.outcome;
  if (opt.roll && opt.roll.length) {
    const b = resolveRoll(opt.roll);
    applyEffect(b.effect);
    if (b.later) pending.push({ ...b.later, dueYear: (season?.year ?? 1) + b.later.inSeasons });
    text = `${opt.outcome} ${b.outcome}`;
  }

  decisionLog.push({
    year: season?.year ?? 1,
    decision: currentDecision!.id,
    chose: opt.label,
    outcome: text,
  });
  usedDecisions.add(currentDecision!.id);
  return text;
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
  const rate = year <= 3 ? 2.2 : year <= 6 ? 1.5 : 0.8;
  (Object.keys(careerGrowth) as Array<keyof Attributes>).forEach((k) => {
    careerGrowth[k] += rate * (0.5 + rng() * 0.9);
  });
}

/* ---- more scenes, banded by where the career is ---- */

const isJunior = (): boolean => tier <= 3;
const isF1 = (): boolean => tier >= 5;
const isLate = (): boolean => age >= 30;

const MORE_DECISIONS: Decision[] = [
  { id: "rival-father", eyebrow: "Junior", scene: "A rival's father has bought the seat next to yours for next season. He's slower than you and the team know it. He also brings the budget that keeps the lights on.",
    question: "The principal wants your blessing, or at least your silence.",
    options: [
      { label: "Say nothing", detail: "The team survives. So does the seat under you.", outcome: "You say nothing. The money lands and the season happens.", effect: { car: 3, rep: { political: 2 } } },
      { label: "Tell them he's not quick enough", detail: "Honest. Expensive.", outcome: "You say it out loud. The father hears about it within a week.", effect: { attrs: { feedback: 2 }, rep: { mercenary: 2 } },
        later: { inSeasons: 2, text: "That father now runs a junior programme. Your name is not on their list.", effect: { car: -3 } } },
    ], when: isJunior },
  { id: "school", eyebrow: "Junior", scene: "Exams are in June, which is four race weekends. Your parents have been patient and are running out of patience.",
    question: "One of the two is going to suffer.",
    options: [
      { label: "Race, and wing the exams", detail: "The season stays intact.", outcome: "You race. The results come back in August and nobody mentions them again.", effect: { attrs: { racecraft: 3 }, rep: { fragile: 1 } } },
      { label: "Miss two rounds", detail: "Points gone. Home peace restored.", outcome: "You sit out June. Your rival wins both.", effect: { attrs: { consistency: 3, feedback: 2 }, rep: { loyal: 1 } } },
    ], when: isJunior },
  { id: "team-order-rookie", eyebrow: "F1 · your third race", scene: "You're fourth, your team-mate is fifth and quicker tonight. The pit wall asks you to let him through 'for the team'. It's lap nine of fifty-two.",
    question: "Everyone can hear the radio.",
    options: [
      { label: "Move over", detail: "Early loyalty is worth something.", outcome: "You move over. He finishes third and thanks you on the podium.", effect: { rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "The team remember the rookie who did what he was told. Your contract gets extended without a fight.", effect: { car: 4 } } },
      { label: "Ignore it", detail: "It's lap nine. There's a race to run.", outcome: "You pretend the radio broke. You finish fourth, ahead of him.", effect: { attrs: { racecraft: 4 }, rep: { mercenary: 3, fragile: 1 } },
        later: { inSeasons: 2, text: "Team orders come the other way now, and they don't ask nicely.", effect: { car: -3 } } },
    ], when: isF1 },
  { id: "media-pileon", eyebrow: "F1", scene: "A clumsy answer in a press conference has become a two-week story. Your sponsors are asking questions. None of it is what you actually meant.",
    question: "The team's press officer has drafted three statements.",
    options: [
      { label: "Apologise cleanly", detail: "Kill it in a day.", outcome: "You apologise without qualifying it. The story dies by Friday.", effect: { rep: { political: 3 } } },
      { label: "Refuse to walk it back", detail: "You meant most of it.", outcome: "You stand by it. Half the paddock quietly agrees with you.", effect: { attrs: { racecraft: 2 }, rep: { mercenary: 3, fragile: 1 } } },
      { label: "Say nothing at all", detail: "Let it burn out.", outcome: "You go quiet for a fortnight. It burns out, slower.", effect: { attrs: { consistency: 2 }, rep: { loyal: 1 } } },
    ], when: isF1 },
  { id: "engineer-lie", eyebrow: "F1", scene: "Your engineer told you the car was on the same fuel load as your team-mate's. The data says otherwise, and he knows you've seen it.",
    question: "He's been on your car for two years.",
    options: [
      { label: "Raise it privately", detail: "Keep it between you.", outcome: "You raise it in the truck, alone. He doesn't do it again.", effect: { attrs: { feedback: 5 }, rep: { loyal: 2 } } },
      { label: "Raise it in the debrief", detail: "In front of everyone who let it happen.", outcome: "You put the trace on the screen. The room goes cold.", effect: { attrs: { feedback: 3 }, rep: { political: 3, mercenary: 1 } },
        later: { inSeasons: 2, text: "The garage has never quite trusted you since the debrief.", effect: { attrs: { feedback: -3 } } } },
    ], when: isF1 },
  { id: "veto", eyebrow: "Contract", scene: "A top team will sign you. The contract gives you a veto over your future team-mate — and they want the same clause the other way round next year.",
    question: "Your lawyer thinks it's fine.",
    options: [
      { label: "Take the veto", detail: "Control who sits next to you.", outcome: "You sign with the veto. You use it once, on the fastest rookie available.", effect: { car: 4, rep: { political: 4 } },
        later: { inSeasons: 3, text: "The driver you vetoed is now beating everyone at a rival team, and tells the story often.", effect: { rep: { mercenary: 2 } } } },
      { label: "Refuse it", detail: "Take whoever they give you.", outcome: "You refuse the clause. They put a quick young driver alongside you within a year.", effect: { attrs: { qualifying: 3, racecraft: 3 }, rep: { loyal: 3 } } },
    ], when: isF1 },
  { id: "rule-change", eyebrow: "Winter", scene: "The regulations have changed and the new cars reward a driving style that isn't yours. Half the grid is rebuilding how they drive.",
    question: "You're good at something the sport no longer asks for.",
    options: [
      { label: "Rebuild your style", detail: "Painful, slow, and permanent.", outcome: "You take a winter apart and rebuild how you brake.", effect: { attrs: { tyres: 6, consistency: 4, qualifying: -3 } } },
      { label: "Race the way you race", detail: "Bet on the rules moving back.", outcome: "You refuse to change. Some weekends it's still the fastest way round.", effect: { attrs: { qualifying: 4, racecraft: 3, tyres: -4 }, rep: { fragile: 2 } } },
    ] },
  { id: "young-mate", eyebrow: "Late career", scene: "Your new team-mate is twenty and quicker than you over one lap. Not sometimes. Most weekends.",
    question: "The garage has noticed.",
    options: [
      { label: "Out-race him on Sundays", detail: "Beat him where it counts.", outcome: "You stop chasing Saturday and start winning Sundays.", effect: { attrs: { racecraft: 5, tyres: 4, qualifying: -2 } } },
      { label: "Help him", detail: "Be the one who made him.", outcome: "You give him everything you know. He's grateful, and faster.", effect: { attrs: { feedback: 6 }, rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "He's a title contender now and says your name in every interview.", effect: { rep: { political: 3 } } } },
      { label: "Freeze him out", detail: "Split the garage.", outcome: "You stop sharing data. The team spends a season managing you both.", effect: { attrs: { qualifying: 2 }, rep: { mercenary: 3, fragile: 2 } } },
    ], when: isLate },
  { id: "lead-role", eyebrow: "Contract", scene: "A worse team wants you as their number one. Your current team want you as their number two, in a much faster car.",
    question: "Both offers expire on Friday.",
    options: [
      { label: "Take the lead role", detail: "Slower car. Built around you.", outcome: "You take the lead role. The car is a second off and entirely yours.", effect: { car: -4, attrs: { feedback: 5, consistency: 3 }, rep: { loyal: 2 } },
        later: { inSeasons: 2, text: "Two years of your feedback and the slow team isn't slow any more.", effect: { car: 8 } } },
      { label: "Stay the number two", detail: "Faster car. Someone else's team.", outcome: "You stay. The car is quick and the garage faces the other way.", effect: { car: 5, rep: { political: 2 } } },
    ], when: () => tier >= 4 },
  { id: "when-to-stop", eyebrow: "Late career", scene: "You're still quick enough to be here and not quick enough to win. A broadcaster has offered you a seat in the booth for next season.",
    question: "Nobody has asked you to leave.",
    options: [
      { label: "Race on", detail: "One more year. Maybe two.", outcome: "You sign again. The car is what it is and you drive it anyway.", effect: { attrs: { consistency: 3 }, rep: { loyal: 2 } } },
      { label: "Start planning the exit", detail: "Go before you're pushed.", outcome: "You tell the team this is the last one. The season feels different immediately.", effect: { attrs: { racecraft: 3, feedback: 4 }, rep: { political: 2 } } },
    ], when: isLate },
  { id: "safety-car", eyebrow: "Mid-season", scene: "A safety car has just wiped out a twenty-second lead. You're on old tyres and the pit lane is open for exactly one lap.",
    question: "The call is yours. Now.",
    options: [
      { label: "Stay out", detail: "Track position, dead rubber.",
        outcome: "You stay out.", effect: { rep: { fragile: 1 } },
        roll: [
          { w: 45, outcome: "You defend for eleven laps on tyres that gave up long ago, and win it.", effect: { attrs: { tyres: 7, racecraft: 5 } } },
          { w: 55, outcome: "They come past you one by one over the last four laps. Nothing you could do.", effect: { attrs: { tyres: 3, racecraft: -2, consistency: -2 } } },
        ] },
      { label: "Pit", detail: "Fresh tyres, back in the pack.", outcome: "You pit and rejoin sixth with everything to do.", effect: { attrs: { racecraft: 4, consistency: 2 } } },
    ] },
  { id: "upgrade", eyebrow: "Mid-season", scene: "The big upgrade has arrived and it's slower than the old floor. The aerodynamicists say the numbers are good and the numbers have been good all year.",
    question: "There's one set of old parts left.",
    options: [
      { label: "Insist on the old floor", detail: "Trust the seat of your pants.", outcome: "You run the old floor and out-qualify your team-mate by three tenths.", effect: { attrs: { feedback: 6 }, car: 2, rep: { political: 2 } } },
      { label: "Run the upgrade and give data", detail: "Take the hit, fix the car.", outcome: "You run it, hate it, and describe exactly why for six weekends.", effect: { attrs: { feedback: 4, consistency: 2 }, car: -2, rep: { loyal: 3 } },
        later: { inSeasons: 2, text: "The floor they built from your data is the best part of the car.", effect: { car: 6 } } },
    ], when: () => tier >= 3 },
  { id: "penalty", eyebrow: "Stewards", scene: "You've been given a five-place grid penalty for an incident that wasn't yours. The team can appeal, which means a hearing, headlines and a stewards' room that remembers names.",
    question: "It's one race.",
    options: [
      { label: "Appeal it", detail: "Fight for the five places.", outcome: "You appeal. You lose, and the room remembers.", effect: { rep: { political: 3, fragile: 1 } } },
      { label: "Take the penalty", detail: "Start eleventh and race.", outcome: "You take it without comment and pass six cars on Sunday.", effect: { attrs: { racecraft: 4 }, rep: { loyal: 2 } } },
    ] },
  { id: "bad-year", eyebrow: "Winter", scene: "The new car is bad. Not fixable-bad — conceptually bad. The team say twelve months. Your manager says a rival needs a driver by March.",
    question: "You have a contract.",
    options: [
      { label: "Stay and drag it", detail: "A year of scrapping for tenth.", outcome: "You stay and drag a bad car further up the road than it deserves.", effect: { attrs: { racecraft: 5, tyres: 3 }, rep: { loyal: 5 } },
        later: { inSeasons: 2, text: "People noticed what you did with that car. Everyone noticed.", effect: { car: 7 } } },
      { label: "Push for the release", detail: "Burn the bridge, take the seat.", outcome: "Your manager gets you out. The team principal doesn't shake your hand.", effect: { car: 6, rep: { mercenary: 5 } } },
    ], when: () => tier >= 4 },
  { id: "charity", eyebrow: "Off-track", scene: "A children's hospital near your home town wants your name on a fundraising campaign. It's twenty days a year and no money.",
    question: "The season is already full.",
    options: [
      { label: "Do it", detail: "Twenty days you don't have.", outcome: "You do it. It's the part of the year you look forward to.", effect: { attrs: { consistency: 2 }, rep: { loyal: 3, political: 2 } } },
      { label: "Send money instead", detail: "Quiet, and not the same.", outcome: "You write a cheque and skip the photos.", effect: { attrs: { racecraft: 2 } } },
    ] },
  { id: "team-mate-crash", eyebrow: "Mid-season", scene: "Your team-mate has had a big one in practice and is out for three rounds. The team want you to take his engineers and his development programme for the rest of the year.",
    question: "He'll be back.",
    options: [
      { label: "Take everything", detail: "Own the whole garage.", outcome: "You take the lot. By the time he's back, the car is yours.", effect: { car: 4, attrs: { feedback: 3 }, rep: { mercenary: 3 } } },
      { label: "Keep it as it was", detail: "He comes back to his own team.", outcome: "You keep his side of the garage intact. He notices.", effect: { rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "He turns down a rival's offer to stay alongside you.", effect: { attrs: { feedback: 3 } } } },
    ] },
  { id: "sponsor-clash", eyebrow: "Money", scene: "Your personal sponsor and the team's title sponsor are competitors. One of them has to go, and the team's lawyers are already writing.",
    question: "Yours has funded you since F4.",
    options: [
      { label: "Drop your sponsor", detail: "Keep the seat clean.", outcome: "You drop them. The call is short and awful.", effect: { car: 3, rep: { mercenary: 2 } } },
      { label: "Keep them", detail: "Loyalty, and a smaller seat.", outcome: "You keep them and take a pay cut to make the maths work.", effect: { attrs: { consistency: 2 }, rep: { loyal: 5 } } },
    ], when: () => tier >= 3 },
  { id: "double-stack", eyebrow: "Strategy", scene: "Rain is coming with eight laps left. Double-stacking both cars costs whoever goes second about four seconds. The team ask which of you goes first.",
    question: "You're ahead on track.",
    options: [
      { label: "Insist on going first", detail: "You're ahead. Take the position.",
        outcome: "You go first.", effect: { rep: { mercenary: 2 } },
        roll: [
          { w: 55, outcome: "Clean stop, position kept, and he loses two places behind you.", effect: { attrs: { racecraft: 4 } } },
          { w: 45, outcome: "The second car catches you in the box. Four seconds gone and you both lose out.", effect: { attrs: { racecraft: -2, consistency: -2 }, rep: { fragile: 1 } } },
        ] },
      { label: "Let him stack first", detail: "Give up four seconds.", outcome: "You wave him through the box and lose the position.", effect: { attrs: { tyres: 3, wet: 3 }, rep: { loyal: 3 } } },
    ], when: () => tier >= 4 },
  { id: "simulator-kid", eyebrow: "Off-season", scene: "The team's new simulator driver is seventeen, faster than you on the rig every single time, and openly being lined up for your seat.",
    question: "He asks you for advice constantly.",
    options: [
      { label: "Teach him properly", detail: "The rig isn't the car.", outcome: "You teach him. He's better for it, and still seventeen.", effect: { attrs: { feedback: 5 }, rep: { loyal: 3 } } },
      { label: "Beat him on the rig", detail: "Spend the winter proving a point.",
        outcome: "You spend December on the simulator.", effect: { rep: { fragile: 2 } },
        roll: [
          { w: 50, outcome: "You come out of it quicker than a teenager and sharper than you have been in years.", effect: { attrs: { qualifying: 7, racecraft: 3 } } },
          { w: 50, outcome: "You come out of it exhausted, having proved something nobody was arguing about.", effect: { attrs: { qualifying: 2, consistency: -4, feedback: -2 } } },
        ] },
    ], when: () => tier >= 4 },
  { id: "boss-change", eyebrow: "Politics", scene: "The team principal who signed you has been forced out. The new one arrives from a rival and brought a driver he likes.",
    question: "Your contract runs another year.",
    options: [
      { label: "Work him", detail: "Be indispensable by March.", outcome: "You spend three months making yourself impossible to replace.", effect: { rep: { political: 5 }, car: 2 } },
      { label: "Keep your head down and drive", detail: "Let the results argue.", outcome: "You say nothing and score in eight consecutive races.", effect: { attrs: { consistency: 5, racecraft: 2 }, rep: { loyal: 2 } } },
    ], when: () => tier >= 4 },
  { id: "last-round-deal", eyebrow: "Final round", scene: "You're fighting for the championship and a rival team offers to help you — their driver holds up your rival, and next year you owe them a favour nobody will write down.",
    question: "It would probably decide it.",
    options: [
      { label: "Accept the help", detail: "Win it. Owe it.",
        outcome: "You take the deal.", effect: { rep: { political: 5, mercenary: 2 } },
        roll: [
          { w: 60, outcome: "Their car defends like it is their own title, and you win the fight on track.", effect: { car: 4, attrs: { racecraft: 3 } } },
          { w: 40, outcome: "Their driver holds up the wrong car and then holds you up too. Everyone knows there was a deal.", effect: { car: -2, rep: { fragile: 2, mercenary: 2 } } },
        ],

        later: { inSeasons: 2, text: "The favour is called in, and it costs you a seat you wanted.", effect: { car: -5 } } },
      { label: "Do it yourself", detail: "However it ends.", outcome: "You tell them no and line up to do it the hard way.", effect: { attrs: { racecraft: 4, consistency: 3 }, rep: { loyal: 4 } } },
    ], when: () => tier >= 5 },
  { id: "home-race", eyebrow: "Home race", scene: "Your home race, your first one as somebody people have heard of. Every ticket sold has your face on it and the grandstand at turn three is named after you for the weekend.",
    question: "You've been awake since four.",
    options: [
      { label: "Lean into it", detail: "Take the whole week.", outcome: "You do every appearance, sign everything, and qualify badly.", effect: { attrs: { qualifying: -3, consistency: -1 }, rep: { political: 3, loyal: 2 } } },
      { label: "Hide until Sunday", detail: "Treat it like any other race.", outcome: "You hide in the motorhome all week and drive one of your best races.", effect: { attrs: { qualifying: 3, racecraft: 3 }, rep: { mercenary: 1 } } },
    ], when: () => tier >= 3 },
];

DECISIONS.push(...MORE_DECISIONS);

/** Scenes can come round again after a while, framed by where you are now. */
function releaseOldDecisions(year: number): void {
  if (year % 5 === 0) usedDecisions.clear();
}
