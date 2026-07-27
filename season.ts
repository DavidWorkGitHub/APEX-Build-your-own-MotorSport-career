/* =========================================================
   PHASE 1 — the season loop
   Field generation, race simulation, standings, persistence
   ========================================================= */

interface Racer {
  id: number;
  name: string;
  skill: number;      // raw pace, 40–95
  car: number;        // machinery, 40–95
  wetSkill: number;   // 0–100
  reliability: number;// 0–100, higher finishes more
  team: string;
  isPlayer: boolean;
  isTeamMate: boolean;
  points: number;
  wins: number;
  podiums: number;
}

interface RaceResult {
  round: number;
  circuit: string;
  wet: boolean;
  grid: number;
  finish: number | null;  // null = DNF
  points: number;
  teamMateFinish: number | null;
  beatTeamMate: boolean;
}

interface Division {
  id: string;
  name: string;
  fieldSize: number;
  rounds: string[];
  skillBand: [number, number];
  carBand: [number, number];
}

interface Season {
  year: number;
  division: Division;
  results: RaceResult[];
  field: Racer[];
  finished: boolean;
}

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

const KARTING: Division = {
  id: "karting", name: "Karting — national",
  fieldSize: 24,
  skillBand: [42, 72], carBand: [44, 70],
  rounds: ["Genk", "Lonato", "Sarno", "Zuera", "Kristianstad", "Adria",
           "Wackersdorf", "Le Mans", "Portimão", "Franciacorta", "Salbris", "Val d'Argenton"],
};

const FIRST_NAMES = ["Luca","Mateo","Elias","Nico","Théo","Kai","Rafa","Jonas","Milan","Otto","Arno","Dries",
  "Sander","Tomas","Ravi","Enzo","Bruno","Felix","Aksel","Mika","Pau","Ivo","Noah","Levi"];
const LAST_NAMES = ["Berger","Kovač","Lindqvist","Moreau","Sasaki","Duarte","Vogel","Halonen","Ricci","Novák",
  "Baptista","Ahlberg","Meijer","Serrano","Okada","Brandt","Lefèvre","Marchetti","Nilsen","Varga",
  "Costa","Zieliński","Hoffman","Renard"];
const TEAM_NAMES = ["Rosso Kart","Vanguard","Nordic Racing","Aeris","Prima Corse","Halcyon","Meridian",
  "Blackline","Onyx Motorsport","Ferrata","Sable","Argent"];

/* seeded RNG so a career is one career — same driver, same story */
function mulberry(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

let rng: () => number = Math.random;

/** normal-ish noise, so results cluster around true pace with rare outliers */
function noise(scale: number): number {
  return ((rng() + rng() + rng()) / 3 - 0.5) * 2 * scale;
}

const band = ([lo, hi]: [number, number]): number => lo + rng() * (hi - lo);

let season: Season | null = null;

/* --------------------------- field --------------------------- */

function playerRacer(div: Division): Racer {
  const a = computeAttrs();
  const skill = (a.qualifying + a.racecraft + a.tyres + a.consistency) / 4;
  return {
    id: 0, name: driver.surname.toUpperCase(), team: "",
    // a rookie sits just under the midfield; traits and decisions move you from there
    skill: clamp(52 + (skill - 52) * 1.05 + 6, 40, 95),
    car: band(div.carBand),
    wetSkill: a.wet,
    reliability: 55 + (a.consistency - 52) * 0.7,
    isPlayer: true, isTeamMate: false, points: 0, wins: 0, podiums: 0,
  };
}

function buildField(div: Division): Racer[] {
  const player = playerRacer(div);
  const field: Racer[] = [player];
  const used = new Set<string>();

  for (let i = 1; i < div.fieldSize; i++) {
    let name = "";
    do {
      name = `${FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]}`;
    } while (used.has(name));
    used.add(name);
    field.push({
      id: i, name, team: "",
      skill: band(div.skillBand),
      car: band(div.carBand),
      wetSkill: 30 + rng() * 60,
      reliability: 45 + rng() * 45,
      isPlayer: false, isTeamMate: false, points: 0, wins: 0, podiums: 0,
    });
  }

  // pair into teams of two; the player's pair is the team-mate that matters
  const teams = [...TEAM_NAMES];
  for (let i = 0; i < field.length; i += 2) {
    const team = teams[(i / 2) % teams.length];
    field[i].team = team;
    if (field[i + 1]) field[i + 1].team = team;
  }
  const mate = field.find((r) => !r.isPlayer && r.team === player.team);
  if (mate) {
    mate.isTeamMate = true;
    mate.car = player.car + noise(2);           // same machinery, near enough
    mate.skill = clamp(player.skill + noise(9), 40, 95); // a real benchmark
  }
  return field;
}

/* --------------------------- one race --------------------------- */

function runRace(round: number, div: Division): RaceResult {
  const wet = rng() < 0.22;
  const field = season!.field;

  const pace = field.map((r) => {
    let p = r.car * 0.46 + r.skill * 0.54;
    if (wet) {
      const wetEdge = (r.wetSkill - 50) / 100;
      p += wetEdge * 14 - 2;      // rain flattens the machinery advantage
      p -= (r.car - 60) * 0.18;
    }
    return { r, p };
  });

  // qualifying — one-lap pace, with the player's Qualifying attribute biting here
  const attrs = computeAttrs();
  const gridOrder = pace
    .map(({ r, p }) => ({ r, q: p + noise(wet ? 7 : 4.5) + (r.isPlayer ? (attrs.qualifying - 52) * 0.14 : 0) }))
    .sort((a, b) => b.q - a.q);
  const gridPos = new Map<number, number>();
  gridOrder.forEach((g, i) => gridPos.set(g.r.id, i + 1));

  // race — racecraft, tyres and consistency decide how the grid gets rearranged
  const finishers: Array<{ r: Racer; score: number }> = [];
  const retired: Racer[] = [];

  pace.forEach(({ r, p }) => {
    const dnfChance = clamp(0.10 - (r.reliability - 50) / 900, 0.015, 0.16) + (wet ? 0.035 : 0);
    if (rng() < dnfChance) { retired.push(r); return; }

    let score = p - (gridPos.get(r.id)! - 1) * 0.55;   // track position matters
    score += noise(wet ? 6 : 3.8);
    if (r.isPlayer) {
      score += (attrs.racecraft - 52) * 0.13;
      score += (attrs.tyres - 52) * 0.10;
      score += (attrs.consistency - 52) * 0.06;
    }
    finishers.push({ r, score });
  });

  finishers.sort((a, b) => b.score - a.score);

  finishers.forEach(({ r }, i) => {
    const pos = i + 1;
    const pts = POINTS[i] ?? 0;
    r.points += pts;
    if (pos === 1) r.wins++;
    if (pos <= 3) r.podiums++;
  });

  const player = field[0];
  const mate = field.find((r) => r.isTeamMate);
  const posOf = (r: Racer | undefined): number | null => {
    if (!r) return null;
    const i = finishers.findIndex((f) => f.r.id === r.id);
    return i === -1 ? null : i + 1;
  };

  const finish = posOf(player);
  const mateFinish = posOf(mate);

  return {
    round, circuit: div.rounds[round - 1], wet,
    grid: gridPos.get(0)!, finish,
    points: finish ? (POINTS[finish - 1] ?? 0) : 0,
    teamMateFinish: mateFinish,
    beatTeamMate: finish !== null && (mateFinish === null || finish < mateFinish),
  };
}

/* --------------------------- standings --------------------------- */

function standings(): Racer[] {
  return [...season!.field].sort((a, b) =>
    b.points - a.points || b.wins - a.wins || b.podiums - a.podiums);
}

function championshipPos(): number {
  return standings().findIndex((r) => r.isPlayer) + 1;
}

/* --------------------------- persistence --------------------------- */

const SAVE_KEY = "swami-career";

function saveCareer(): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      driver: { ...driver, trait: driver.trait?.id, country: driver.country?.code, livery: driver.livery.id },
      season: season && {
        year: season.year, division: season.division.id,
        results: season.results, finished: season.finished,
        field: season.field.map((r) => ({ ...r })),
      },
    }));
  } catch { /* file:// or private mode — career just won't persist */ }
}
