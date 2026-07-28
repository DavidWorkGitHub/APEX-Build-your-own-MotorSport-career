/* =========================================================
   PHASE 3 — the ladder
   Eight divisions, a five-outcome end-of-season roll, and
   seats that exist whether or not you deserve them.
   ========================================================= */

interface DivisionDef extends Division {
  tier: number;
  seatChance: number;   // odds a seat opens above you at all
  label: string;        // short tag for tables
}

const CIRCUITS = {
  kart: ["Genk", "Lonato", "Sarno", "Zuera", "Kristianstad", "Adria", "Wackersdorf", "Le Mans",
         "Portimão", "Franciacorta", "Salbris", "Val d'Argenton"],
  junior: ["Oschersleben", "Zandvoort", "Imola", "Red Bull Ring", "Hungaroring", "Spa-Francorchamps",
           "Monza", "Barcelona", "Paul Ricard", "Silverstone"],
  f1: ["Melbourne", "Jeddah", "Suzuka", "Shanghai", "Miami", "Imola", "Monaco", "Montréal",
       "Barcelona", "Red Bull Ring", "Silverstone", "Budapest", "Spa-Francorchamps", "Zandvoort",
       "Monza", "Singapore", "Austin", "Mexico City", "São Paulo", "Abu Dhabi"],
};

const DIVISIONS: DivisionDef[] = [
  { id: "karting", name: "Karting — national", label: "KART", tier: 0, fieldSize: 24,
    rounds: CIRCUITS.kart, skillBand: [42, 72], carBand: [44, 70], seatChance: 0.85 },
  { id: "f4", name: "Formula 4", label: "F4", tier: 1, fieldSize: 22,
    rounds: CIRCUITS.junior, skillBand: [50, 76], carBand: [48, 72], seatChance: 0.65 },
  { id: "f3", name: "Formula 3", label: "F3", tier: 2, fieldSize: 20,
    rounds: CIRCUITS.junior.slice(0, 9), skillBand: [56, 80], carBand: [52, 76], seatChance: 0.5 },
  { id: "f2", name: "Formula 2", label: "F2", tier: 3, fieldSize: 18,
    rounds: CIRCUITS.junior, skillBand: [62, 84], carBand: [56, 80], seatChance: 0.3 },
  { id: "reserve", name: "F1 reserve driver", label: "RES", tier: 4, fieldSize: 20,
    rounds: CIRCUITS.f1.slice(0, 4), skillBand: [70, 92], carBand: [50, 74], seatChance: 0.45 },
  { id: "backmarker", name: "Formula 1 — backmarker", label: "F1", tier: 5, fieldSize: 20,
    rounds: CIRCUITS.f1, skillBand: [70, 92], carBand: [42, 58], seatChance: 0.35 },
  { id: "midfield", name: "Formula 1 — midfield", label: "F1", tier: 6, fieldSize: 20,
    rounds: CIRCUITS.f1, skillBand: [70, 92], carBand: [60, 76], seatChance: 0.3 },
  { id: "front", name: "Formula 1 — front-running", label: "F1", tier: 7, fieldSize: 20,
    rounds: CIRCUITS.f1, skillBand: [70, 92], carBand: [80, 94], seatChance: 0 },
];

type RollOutcome = "jump" | "promote" | "stall" | "drop" | "out";

interface SeasonRecord {
  year: number; age: number; division: string; label: string; team: string;
  pos: number; points: number; wins: number; podiums: number; poles: number;
  dnfs: number; beat: number; lost: number; gained: number; avgFinish: number;
  outcome: RollOutcome;
}

const careerHistory: SeasonRecord[] = [];

let tier = 0;
let age = 15;
let yearsInTier = 0;
let lastRoll: { outcome: RollOutcome; headline: string; detail: string } | null = null;

const currentDivision = (): DivisionDef => DIVISIONS[tier];

/* --------------------------- season stats --------------------------- */

interface SeasonStats {
  races: number; poles: number; wins: number; podiums: number; pointsFinishes: number;
  dnfs: number; avgGrid: number; avgFinish: number; gained: number; best: number | null;
  worst: number | null; beat: number; lost: number; points: number; wetRaces: number;
}

function seasonStats(): SeasonStats {
  const rs = season!.results;
  const fins = rs.map((r) => r.finish).filter((f): f is number => f !== null);
  const gained = rs.reduce((n, r) => n + (r.finish === null ? 0 : r.grid - r.finish), 0);
  const beat = rs.filter((r) => r.beatTeamMate).length;
  return {
    races: rs.length,
    poles: rs.filter((r) => r.grid === 1).length,
    wins: fins.filter((f) => f === 1).length,
    podiums: fins.filter((f) => f <= 3).length,
    pointsFinishes: rs.filter((r) => r.points > 0).length,
    dnfs: rs.filter((r) => r.finish === null).length,
    avgGrid: rs.length ? rs.reduce((n, r) => n + r.grid, 0) / rs.length : 0,
    avgFinish: fins.length ? fins.reduce((n, f) => n + f, 0) / fins.length : 0,
    gained,
    best: fins.length ? Math.min(...fins) : null,
    worst: fins.length ? Math.max(...fins) : null,
    beat, lost: rs.length - beat,
    points: season!.field[0].points,
    wetRaces: rs.filter((r) => r.wet).length,
  };
}

/* --------------------------- the roll --------------------------- */

function promotionRoll(): { outcome: RollOutcome; headline: string; detail: string } {
  const div = currentDivision();
  const pos = championshipPos();
  const st = seasonStats();
  const top = tier >= DIVISIONS.length - 1;

  // results score
  let score = pos === 1 ? 42 : pos === 2 ? 32 : pos === 3 ? 26 : pos <= 5 ? 17 : pos <= 8 ? 9 : 2;
  score += st.beat > st.lost ? 10 : st.beat === st.lost ? 2 : -8;   // the team-mate is the benchmark
  score += Math.min(reputation.political, 4);
  score += Math.min(reputation.loyal, 3);
  score -= Math.min(reputation.fragile * 2, 8);
  score -= Math.min(yearsInTier * 2, 6);   // the door narrows, but never shuts entirely                                          // the door narrows

  // a seat above you exists, or it doesn't — nothing to do with how you drove
  const seatOpen = !top && rng() < div.seatChance;
  const secondSeat = seatOpen && tier < DIVISIONS.length - 2 && rng() < 0.22;

  const teamMate = season!.field.find((r) => r.isTeamMate);
  const mateName = teamMate?.name ?? "your team-mate";

  if (top) {
    return { outcome: "stall", headline: "You're already there",
      detail: `${div.name}. There is no rung above this one — only the championship.` };
  }
  if (age >= 26 && tier < 4) {
    return { outcome: "out", headline: "The phone stops ringing",
      detail: `You're ${age}. Junior programmes want teenagers, and the seats you could have taken went to them.` };
  }
  if (score >= 40 && secondSeat && rng() < 0.55) {
    return { outcome: "jump", headline: "Two rungs at once",
      detail: `A dominant season, and then the luck: a seat two levels up came free mid-winter. ${DIVISIONS[Math.min(tier + 2, 7)].name} wants you now, ready or not.` };
  }
  // the junior rungs turn over faster than the ones above them
  const bar = tier === 0 ? 13 : tier === 1 ? 17 : 20;

  if (score >= bar && seatOpen) {
    return { outcome: "promote", headline: "Moving up",
      detail: `${DIVISIONS[tier + 1].name}. The results were there and, for once, so was the seat.` };
  }
  if (score >= bar && !seatOpen) {
    return { outcome: "stall", headline: "Nowhere to go",
      detail: "You did enough. Nobody above you retired, crashed out of a contract or got sacked. Another year here." };
  }
  // stalling is the default. You have to be genuinely going nowhere to lose a seat.
  if (score >= 2 || yearsInTier < 3) {
    return { outcome: "stall", headline: "Another year",
      detail: `Not enough to move, not bad enough to lose the seat. ${mateName} is staying too.` };
  }
  if (tier === 0) {
    return { outcome: "out", headline: "The money runs out",
      detail: `Four seasons and you're still ${ORD(pos)}. The family budget is gone and nobody else is offering.` };
  }
  return { outcome: "drop", headline: "Back down",
    detail: `${DIVISIONS[tier - 1].name}. Nobody says it's a demotion. Everybody knows it is.` };
}

function applyRoll(r: { outcome: RollOutcome }): void {
  const prev = tier;
  if (r.outcome === "jump") tier = Math.min(tier + 2, DIVISIONS.length - 1);
  else if (r.outcome === "promote") tier = Math.min(tier + 1, DIVISIONS.length - 1);
  else if (r.outcome === "drop") tier = Math.max(tier - 1, 0);
  yearsInTier = tier === prev ? yearsInTier + 1 : 0;
}

function recordSeason(outcome: RollOutcome): void {
  const st = seasonStats();
  careerHistory.push({
    year: season!.year, age, division: currentDivision().name, label: currentDivision().label,
    team: currentSeat?.name ?? "—", pos: championshipPos(), points: st.points,
    wins: st.wins, podiums: st.podiums, poles: st.poles, dnfs: st.dnfs,
    beat: st.beat, lost: st.lost, gained: st.gained,
    avgFinish: st.avgFinish, outcome,
  });
}
