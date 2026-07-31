/* =========================================================
   THE DRIVER POOL
   AI drivers used to be generated fresh every season, which
   is why a name could vanish or a real driver could still be
   on the grid at sixty. They now have ages, careers and
   contracts of their own, and they leave when they're done.
   ========================================================= */

interface PoolDriver {
  name: string;
  age: number;
  peak: number;        // raw talent ceiling
  skill: number;       // where they are now
  tier: number;        // which division they're racing in
  team: string;
  seasons: number;
  retired: boolean;
}

const FIRST_POOL = [
  "Luca","Mateo","Elias","Nico","Théo","Kai","Rafa","Jonas","Milan","Otto","Arno","Dries","Sander","Tomas",
  "Ravi","Enzo","Bruno","Felix","Aksel","Mika","Pau","Ivo","Noah","Levi","Casper","Emil","Iker","Joris",
  "Matteo","Lukas","Andrei","Bence","Tobias","Rasmus","Diogo","Yuki","Hiro","Santiago","Nikola","Aleks",
  "Gustav","Marek","Pedro","Stefan","Viktor","Adam","Ollie","Finn","Jean","Karl","Mo","Amir","Dario","Sem",
  "Tiago","Kristian","Janne","Ruben","Halil","Nuno","Eero","Zoltán","Ionut","Ciaran","Declan","Seb","Rory",
];

const LAST_POOL = [
  "Berger","Kovač","Lindqvist","Moreau","Sasaki","Duarte","Vogel","Halonen","Ricci","Novák","Baptista",
  "Ahlberg","Meijer","Serrano","Okada","Brandt","Lefèvre","Marchetti","Nilsen","Varga","Costa","Zieliński",
  "Hoffman","Renard","Merilai","Laine","Bakker","Dumont","Ferrer","Grönholm","Haas","Iversen","Jansen",
  "Kaufmann","Larsen","Moreno","Nagy","Olsen","Pereira","Quintero","Rossi","Sorensen","Toth","Ueda",
  "Vidal","Wenger","Ziegler","Andersson","Boucher","Carvalho","Delgado","Eriksen","Fontaine","Gallo",
  "Horvat","Ilves","Jokinen","Kral","Lombardi","Mizuno","Novotny","Ortiz","Petrov","Rasmussen","Sandoval",
  "Tamm","Urban","Verhoeven","Wagner","Yilmaz","Zanetti","Byrne","Doyle","Finnegan","Keane","O'Rourke",
];

/** Drivers who exist by name, whatever the roster setting. */
const FANTASY_FIXTURES = ["Mark Merilai"];

const pool: PoolDriver[] = [];
let poolRetired = 0;   // running count, since retired entries get pruned
let poolReady = false;

function makeName(used: Set<string>): string {
  for (let i = 0; i < 40; i++) {
    const n = `${FIRST_POOL[Math.floor(rng() * FIRST_POOL.length)]} ${LAST_POOL[Math.floor(rng() * LAST_POOL.length)]}`;
    if (!used.has(n)) return n;
  }
  return `${FIRST_POOL[Math.floor(rng() * FIRST_POOL.length)]} ${LAST_POOL[Math.floor(rng() * LAST_POOL.length)]} ${Math.floor(rng() * 90)}`;
}

function makePoolDriver(t: number, used: Set<string>, name?: string): PoolDriver {
  const div = DIVISIONS[t];
  const n = name ?? makeName(used);
  used.add(n);
  const age = t <= 1 ? 15 + Math.floor(rng() * 4)
    : t <= 3 ? 18 + Math.floor(rng() * 5)
    : 21 + Math.floor(rng() * 13);
  const peak = div.skillBand[0] + rng() * (div.skillBand[1] - div.skillBand[0]) + 4;
  return {
    name: n, age, peak,
    skill: clamp(peak - Math.max(0, 24 - age) * 1.2, 30, 97),
    tier: t, team: "", seasons: 0, retired: false,
  };
}

/** Built once per career, then aged forward each season. */
function buildPool(): void {
  pool.length = 0;
  poolRetired = 0;
  const used = new Set<string>();
  FANTASY_FIXTURES.forEach((n) => used.add(n));

  DIVISIONS.forEach((d, t) => {
    const n = Math.max(d.fieldSize + 6, 24);
    for (let i = 0; i < n; i++) pool.push(makePoolDriver(t, used));
  });

  // guaranteed names, dropped in somewhere they'd plausibly be
  FANTASY_FIXTURES.forEach((n) => {
    const t = 1 + Math.floor(rng() * 3);
    const d = makePoolDriver(t, used, n);
    d.age = 17 + Math.floor(rng() * 3);
    pool.push(d);
  });

  poolReady = true;
}

/** A season passes for everyone, not just you. */
function agePool(): void {
  if (!poolReady) { buildPool(); return; }
  const used = new Set(pool.map((p) => p.name));

  pool.forEach((p) => {
    if (p.retired) return;
    p.age++;
    p.seasons++;

    // development, then decline
    if (p.age <= 26) p.skill = clamp(p.skill + 1.2 + rng() * 1.8, 30, 97);
    else if (p.age >= 32) p.skill = clamp(p.skill - (p.age - 31) * 0.7, 30, 97);

    // the juniors move up or run out of road
    if (p.tier <= 3 && p.age >= 24 && rng() < 0.45) { p.retired = true; return; }
    if (p.tier <= 6 && rng() < 0.18) p.tier = Math.min(p.tier + 1, 7);

    // and everybody stops eventually
    const stopAge = p.tier >= 5 ? 34 + Math.floor(rng() * 4) : 29;
    if (p.age >= stopAge) p.retired = true;
    else if (p.age >= stopAge - 3 && rng() < 0.3) p.retired = true;

    // teams change hands between seasons
    if (rng() < 0.25) p.team = "";
  });

  // named fixtures always have somebody carrying the name
  FANTASY_FIXTURES.forEach((n) => {
    const alive = pool.some((p) => p.name === n && !p.retired);
    if (!alive) {
      const d = makePoolDriver(1 + Math.floor(rng() * 2), used, n);
      d.age = 17 + Math.floor(rng() * 3);
      pool.push(d);
    }
  });

  // rookies to replace them
  const gone = pool.filter((p) => p.retired).length;
  for (let i = 0; i < Math.max(4, Math.round(gone * 0.8)); i++) {
    pool.push(makePoolDriver(Math.floor(rng() * 3), used));
  }

  // keep it from growing forever
  poolRetired += pool.filter((p) => p.retired).length;
  if (pool.length > 320) {
    const keep = pool.filter((p) => !p.retired);
    pool.length = 0;
    pool.push(...keep);
  }
}

/** The names racing in a division this season, strongest first. */
function fieldNamesFor(t: number, count: number): string[] {
  if (!poolReady) buildPool();
  const here = pool.filter((p) => !p.retired && p.tier === t).sort((a, b) => b.skill - a.skill);
  const names = here.slice(0, count).map((p) => p.name);

  // top up if a division has thinned out
  const used = new Set(pool.map((p) => p.name));
  while (names.length < count) {
    const d = makePoolDriver(t, used);
    pool.push(d);
    names.push(d.name);
  }
  return names;
}

/** Age of a named driver, where we know it. */
function poolAge(name: string): number | null {
  return pool.find((p) => p.name === name)?.age ?? null;
}
