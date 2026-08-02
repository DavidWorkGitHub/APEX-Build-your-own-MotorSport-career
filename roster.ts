/* =========================================================
   ROSTER
   Two grids: a real one and a made-up one. Toggled on the
   landing page. Everything here is data, edit this file to
   change the grid without touching any game code.

   The real grid is the 2026 Formula 1 season as announced.
   Grids change every year: if it's out of date, edit it here.
   ========================================================= */

interface RealTeam { name: string; drivers: [string, string] }

const REAL_F1: RealTeam[] = [
  { name: "McLaren",       drivers: ["Lando Norris", "Oscar Piastri"] },
  { name: "Ferrari",       drivers: ["Charles Leclerc", "Lewis Hamilton"] },
  { name: "Red Bull",      drivers: ["Max Verstappen", "Isack Hadjar"] },
  { name: "Mercedes",      drivers: ["George Russell", "Kimi Antonelli"] },
  { name: "Aston Martin",  drivers: ["Fernando Alonso", "Lance Stroll"] },
  { name: "Williams",      drivers: ["Alex Albon", "Carlos Sainz"] },
  { name: "Audi",          drivers: ["Nico Hülkenberg", "Gabriel Bortoleto"] },
  { name: "Alpine",        drivers: ["Pierre Gasly", "Franco Colapinto"] },
  { name: "Haas",          drivers: ["Esteban Ocon", "Oliver Bearman"] },
  { name: "Racing Bulls",  drivers: ["Liam Lawson", "Arvid Lindblad"] },
  { name: "Cadillac",      drivers: ["Sergio Pérez", "Valtteri Bottas"] },
];

/* A real reserve paddock is four kinds of driver at once: ex-Formula 1 drivers
   waiting for a way back, F2 graduates with nowhere to go, drivers who left for
   sportscars or IndyCar and kept a testing role, and junior-programme names.
   All four are here. Edit freely, this is just data. */

/** Ex-Formula 1 drivers who kept a testing or reserve role. */
const RESERVES_EX_F1 = [
  "Mick Schumacher", "Zhou Guanyu", "Daniel Ricciardo", "Kevin Magnussen", "Logan Sargeant",
  "Nyck de Vries", "Antonio Giovinazzi", "Daniil Kvyat", "Stoffel Vandoorne", "Jack Doohan",
  "Robert Shwartzman", "Callum Ilott", "Nicholas Latifi",
];

/** Formula 2 graduates and title contenders on the edge of a seat. */
const RESERVES_F2 = [
  "Felipe Drugovich", "Frederik Vesti", "Théo Pourchaire", "Ayumu Iwasa", "Jak Crawford",
  "Paul Aron", "Zane Maloney", "Victor Martins", "Luke Browning", "Dennis Hauger",
  "Richard Verschoor", "Pepe Martí", "Oliver Goethe", "Roman Staněk", "Kush Maini",
  "Amaury Cordeel", "Gabriele Minì", "Leonardo Fornaroli", "Rafael Villagómez",
];

/** Drivers who went to sportscars or IndyCar and kept a foot in the door. */
const RESERVES_OTHER_SERIES = [
  "Ryo Hirakawa", "Pato O'Ward", "Sébastien Buemi", "Brendon Hartley", "Kamui Kobayashi",
  "Jean-Éric Vergne", "Antonio Félix da Costa", "Will Stevens", "Nick Cassidy",
  "Robin Frijns", "Norman Nato", "Marcus Ericsson", "Felix Rosenqvist",
];

/** Junior-programme drivers coming up behind them. */
const RESERVES_JUNIOR = [
  "Tim Tramnitz", "Martinius Stenshorne", "Alex Dunne", "Freddie Slater", "Christian Mansell",
  "Nikola Tsolov", "James Wharton", "Ugo Ugochukwu", "Rafael Câmara", "Noel León",
  "Brando Badoer", "Arvid Lindblad", "Sami Meguetounif",
];

const REAL_RESERVES = [
  ...RESERVES_EX_F1, ...RESERVES_F2, ...RESERVES_OTHER_SERIES, ...RESERVES_JUNIOR,
];

const REAL_JUNIOR_TEAMS = [
  "Prema", "ART Grand Prix", "Campos Racing", "Hitech", "MP Motorsport", "Rodin Motorsport",
  "Invicta Racing", "DAMS Lucas Oil", "Trident", "AIX Racing", "Van Amersfoort Racing", "PHM Racing",
];

const REAL_INDY_TEAMS = [
  "Team Penske", "Chip Ganassi Racing", "Andretti Global", "Arrow McLaren", "Meyer Shank Racing",
  "Rahal Letterman Lanigan", "Ed Carpenter Racing", "Dale Coyne Racing", "Juncos Hollinger", "AJ Foyt Racing",
];

const REAL_GT_TEAMS = [
  "AF Corse", "Team WRT", "Manthey", "Jota", "Iron Lynx", "Toyota Gazoo Racing",
  "Porsche Penske", "Peugeot TotalEnergies", "Alpine Endurance", "Cadillac Racing",
];

const REAL_KART_TEAMS = [
  "Ricky Flynn Motorsport", "Rosberg Racing", "Forza Racing", "KR Motorsport",
  "Parolin Racing", "Tony Kart Racing", "CRG Keijzer", "Birel ART",
];

const FICTIONAL_TEAMS = [
  "Rosso Kart", "Vanguard", "Nordic Racing", "Aeris", "Prima Corse", "Halcyon",
  "Meridian", "Blackline", "Onyx Motorsport", "Ferrata", "Sable", "Argent",
];

/* --------------------------- toggle --------------------------- */

const ROSTER_KEY = "swami-roster";
let useRealRoster = false;

function applyRoster(real: boolean): void {
  useRealRoster = real;
  $$<HTMLElement>("[data-roster]").forEach((b) =>
    b.setAttribute("aria-pressed", String((b.dataset.roster === "real") === real)));
  const note = document.querySelector("#rosterNote");
  if (note) {
    note.textContent = real
      ? "Real teams and drivers. You'll be racing the actual grid."
      : "An invented grid. Different names in every career.";
  }
  try { localStorage.setItem(ROSTER_KEY, real ? "real" : "fictional"); } catch { /* not persisted */ }
}

/** Team names available at a given tier, for whichever grid is on. */
function teamPool(t: number): string[] {
  if (!useRealRoster) return [...FICTIONAL_TEAMS];
  if (t === 10) return [...REAL_INDY_TEAMS];
  if (t >= 8) return [...REAL_GT_TEAMS];
  if (t >= 4) return REAL_F1.map((x) => x.name);
  if (t === 0) return [...REAL_KART_TEAMS];
  return [...REAL_JUNIOR_TEAMS];
}

/** Real drivers for the F1 tiers, so the grid you join is the real one. */
/** A few names from a list, without repeats. */
function pickSome(list: string[], n: number): string[] {
  const copy = [...list];
  const out: string[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(rng() * copy.length), 1)[0]);
  }
  return out;
}

function realFieldNames(t: number): string[] | null {
  if (!useRealRoster || t < 4 || t >= 8) return null;
  // a reserve shares the paddock with the race drivers and a mixed reserve pool
  if (t === 4) {
    const mix = [
      ...pickSome(RESERVES_EX_F1, 4),
      ...pickSome(RESERVES_F2, 6),
      ...pickSome(RESERVES_OTHER_SERIES, 3),
      ...pickSome(RESERVES_JUNIOR, 3),
    ];
    return [...mix, ...REAL_F1.flatMap((x) => x.drivers)];
  }
  return REAL_F1.flatMap((x) => x.drivers);
}

document.addEventListener("DOMContentLoaded", () => {
  let saved: string | null = null;
  try { saved = localStorage.getItem(ROSTER_KEY); } catch { /* ignore */ }
  applyRoster(saved === "real");
  $$<HTMLElement>("[data-roster]").forEach((btn) => {
    btn.addEventListener("click", () => applyRoster(btn.dataset.roster === "real"));
  });
});
