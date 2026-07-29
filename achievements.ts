/* =========================================================
   ACHIEVEMENTS
   Earned across every career, not just the current one.
   Checked at the end of each season and at retirement.
   ========================================================= */

interface Achievement {
  id: string;
  name: string;
  how: string;              // what it takes, shown while locked
  flavour: string;          // shown once earned
  tier: "common" | "rare" | "legendary";
  hidden?: boolean;         // not described until unlocked
  test: () => boolean;
}

interface Unlocked { id: string; driver: string; year: number; at: number }

const ACH_KEY = "swami-achievements";
let unlockedCache: Unlocked[] | null = null;
let unlockedMemory: Unlocked[] = [];

function unlockedList(): Unlocked[] {
  if (unlockedCache) return unlockedCache;
  try {
    const stored = JSON.parse(localStorage.getItem(ACH_KEY) ?? "[]") as Unlocked[];
    unlockedCache = stored.length >= unlockedMemory.length ? stored : unlockedMemory;
  } catch { unlockedCache = unlockedMemory; }
  return unlockedCache;
}

function isUnlocked(id: string): boolean {
  return unlockedList().some((u) => u.id === id);
}

function unlock(a: Achievement): void {
  const entry: Unlocked = {
    id: a.id, driver: driver.surname.toUpperCase() || "—",
    year: season?.year ?? 0, at: Date.now(),
  };
  unlockedMemory = [...unlockedList(), entry];
  unlockedCache = unlockedMemory;
  try { localStorage.setItem(ACH_KEY, JSON.stringify(unlockedMemory)); } catch { /* session only */ }
  toastAchievement(a);
}

/* --------------------------- the list --------------------------- */

const st = (): SeasonStats | null => (season && season.results.length ? seasonStats() : null);
const lifetimeH2H = (): [number, number] => [
  careerHistory.reduce((n, h) => n + h.beat, 0),
  careerHistory.reduce((n, h) => n + h.lost, 0),
];

const ACHIEVEMENTS: Achievement[] = [
  /* ---- first steps ---- */
  { id: "first-points", name: "On the board", how: "Score your first points", tier: "common",
    flavour: "Everything else follows from this.", test: () => cabinet.firsts.some((f) => f.what === "First points") },
  { id: "first-pole", name: "Saturday man", how: "Take your first pole", tier: "common",
    flavour: "One lap, everything on it.", test: () => cabinet.poles > 0 },
  { id: "first-win", name: "First win", how: "Win a race", tier: "common",
    flavour: "You'll remember the circuit for the rest of your life.", test: () => cabinet.wins.length > 0 },
  { id: "first-title", name: "Champion", how: "Win any championship", tier: "common",
    flavour: "One down.", test: () => cabinet.titles.length > 0 },

  /* ---- the climb ---- */
  { id: "reach-f1", name: "You're in", how: "Reach a Formula 1 seat", tier: "rare",
    flavour: "Everything up to here was the queue.", test: () => tier >= 5 },
  { id: "reach-front", name: "The front", how: "Reach a front-running F1 seat", tier: "rare",
    flavour: "No excuses left.", test: () => tier >= 7 },
  { id: "the-jump", name: "Two rungs", how: "Skip a division entirely", tier: "rare",
    flavour: "A dominant season, and then the luck.", test: () => careerHistory.some((h) => h.outcome === "jump") },
  { id: "f1-title", name: "World champion", how: "Win a Formula 1 championship", tier: "legendary",
    flavour: "The only one that gets remembered by people who don't watch.", test: () => cabinet.titles.some((t) => t.tier >= 5) },
  { id: "triple", name: "Three in a row", how: "Win three championships in consecutive seasons", tier: "legendary",
    flavour: "Nobody argues with three.", test: () => {
      const yrs = cabinet.titles.map((t) => t.year).sort((a, b) => a - b);
      return yrs.some((y) => yrs.includes(y + 1) && yrs.includes(y + 2));
    } },

  /* ---- the long way ---- */
  { id: "sportscars", name: "The long way round", how: "Take the sportscar fork out of F2", tier: "rare",
    flavour: "Headlights at three in the morning.", test: () => tier >= 8 || careerHistory.some((h) => h.label === "GT3" || h.label === "HYP") },
  { id: "hypercar-title", name: "Overall win", how: "Win a Hypercar championship", tier: "legendary",
    flavour: "Twenty-four hours is a long time to be right.", test: () => cabinet.titles.some((t) => t.label === "HYP") },
  { id: "round-trip", name: "Round trip", how: "Reach F1 after racing sportscars", tier: "legendary",
    flavour: "They said it was a detour.", test: () => tier >= 4 && careerHistory.some((h) => h.label === "GT3" || h.label === "HYP") },
  { id: "comeback", name: "One more year", how: "Come back after retiring", tier: "rare",
    flavour: "The phone rang and you picked it up.", test: () => comebacks > 0 },

  /* ---- team-mates ---- */
  { id: "clean-sweep", name: "Whitewash", how: "Beat your team-mate at every round of a season", tier: "rare",
    flavour: "Twelve out of twelve. He asked to be moved.", test: () => { const s = st(); return !!s && s.races >= 8 && s.lost === 0; } },
  { id: "hundred-h2h", name: "The benchmark", how: "Out-score team-mates 100 times", tier: "rare",
    flavour: "The first number the paddock reads.", test: () => lifetimeH2H()[0] >= 100 },
  { id: "at-war", name: "Open war", how: "Fall out with a team-mate completely", tier: "common",
    flavour: "Two garages, one team, no conversation.", test: () => teamMate.relationship === "war" },
  { id: "long-partner", name: "Four years", how: "Spend four seasons with the same team-mate", tier: "rare",
    flavour: "You know exactly what he'll do at turn one.", test: () => teamMate.seasons >= 4 },

  /* ---- how you drive ---- */
  { id: "wet-master", name: "Rain man", how: "Win a wet race", tier: "common",
    flavour: "Rain flattens the grid and you climb over it.", test: () => cabinet.wins.some((w) => w.wet) },
  { id: "pole-sweep", name: "Six poles", how: "Take six poles in one season", tier: "rare",
    flavour: "Saturdays belonged to you.", test: () => { const s = st(); return !!s && s.poles >= 6; } },
  { id: "recovery", name: "Twenty places", how: "Gain 20 net places on track in a season", tier: "rare",
    flavour: "You start badly and finish angry.", test: () => { const s = st(); return !!s && s.gained >= 20; } },
  { id: "perfect", name: "No mistakes", how: "Finish every race of a season", tier: "rare",
    flavour: "Not dramatic. Just there, every time.", test: () => { const s = st(); return !!s && s.races >= 8 && s.dnfs === 0; } },
  { id: "double-figures", name: "Ten in a year", how: "Win ten races in one season", tier: "legendary",
    flavour: "A season nobody else got a say in.", test: () => { const s = st(); return !!s && s.wins >= 10; } },

  /* ---- the other kind ---- */
  { id: "dnf-trophy", name: "The DNF trophy", how: "Retire from four races in one season", tier: "common",
    flavour: "You saw the flag less often than the barriers.", test: () => cabinet.cursed.some((c) => c.what === "The DNF trophy") },
  { id: "wooden-spoon", name: "Wooden spoon", how: "Finish last in a championship", tier: "common",
    flavour: "Somebody has to be.", test: () => cabinet.cursed.some((c) => c.what === "Wooden spoon") },
  { id: "sunday-driver", name: "Sunday driver", how: "Take three poles and no wins in a season", tier: "common",
    flavour: "Fast on Saturday. Ask again tomorrow.", test: () => cabinet.cursed.some((c) => c.what === "Sunday driver") },
  { id: "stalled", name: "Nowhere to go", how: "Have five seasons end with no seat above you", tier: "common",
    flavour: "The results were there. The seat wasn't.", test: () => careerHistory.filter((h) => h.outcome === "stall").length >= 5 },
  { id: "dropped", name: "Back down", how: "Get relegated a division", tier: "common",
    flavour: "Nobody calls it a demotion.", test: () => careerHistory.some((h) => h.outcome === "drop") },

  /* ---- who you are ---- */
  { id: "loyal", name: "Company man", how: "Build a strongly loyal reputation", tier: "common",
    flavour: "They knew where you'd be.", test: () => reputation.loyal >= 12 },
  { id: "mercenary", name: "Gun for hire", how: "Build a strongly mercenary reputation", tier: "common",
    flavour: "Nothing personal. It never was.", test: () => reputation.mercenary >= 12 },
  { id: "political", name: "Paddock operator", how: "Build a strongly political reputation", tier: "common",
    flavour: "You won more meetings than races, for a while.", test: () => reputation.political >= 12 },
  { id: "gambler", name: "Roll of the dice", how: "Take ten gambles in one career", tier: "rare",
    flavour: "Some of them even worked.", test: () => decisionLog.length >= 10 && decisionLog.filter((l) => l.outcome.length > 90).length >= 6 },

  /* ---- long haul ---- */
  { id: "veteran", name: "Twenty seasons", how: "Race twenty seasons", tier: "rare",
    flavour: "Most people don't get five.", test: () => careerHistory.length >= 20 },
  { id: "old-man", name: "Still here", how: "Still racing at 38", tier: "rare",
    flavour: "The kids in the paddock were born after your debut.", test: () => age >= 38 },
  { id: "century", name: "A hundred starts", how: "Start 100 races", tier: "common",
    flavour: "Longevity is its own achievement.", test: () => cabinet.races >= 100 },
  { id: "collector", name: "Five teams", how: "Drive for five different teams", tier: "common",
    flavour: "Five helmets on the shelf.", test: () => cabinet.helmets.length >= 5 },

  /* ---- hidden ---- */
  { id: "no-titles", name: "Nearly", how: "Hidden", hidden: true, tier: "rare",
    flavour: "Fifteen seasons, a hundred races, and never once a champion. That's most careers.",
    test: () => retired && careerHistory.length >= 15 && cabinet.titles.length === 0 },
  { id: "decider-win", name: "Down to the last round", how: "Hidden", hidden: true, tier: "legendary",
    flavour: "It came down to one race, and you were the one holding the trophy.",
    test: () => !!season && deciderShown && championshipPos() === 1 && season.finished },
  { id: "two-careers", name: "Second life", how: "Hidden", hidden: true, tier: "rare",
    flavour: "You retired, came back, and won something after.",
    test: () => comebacks > 0 && cabinet.titles.some((t) => t.year > (careerHistory.find((h) => h.outcome === "out")?.year ?? 99)) },
];

/** Checked at the end of every season and at retirement. */
function checkAchievements(): void {
  ACHIEVEMENTS.forEach((a) => {
    if (isUnlocked(a.id)) return;
    let passed = false;
    try { passed = a.test(); } catch { passed = false; }
    if (passed) unlock(a);
  });
}

/* --------------------------- display --------------------------- */

let toastQueue: Achievement[] = [];

function toastAchievement(a: Achievement): void {
  toastQueue.push(a);
  if (toastQueue.length > 1) return;
  showNextToast();
}

function showNextToast(): void {
  const a = toastQueue[0];
  if (!a) return;
  const el = $("#achToast");
  el.className = `ach-toast ach-toast--${a.tier} is-in`;
  el.innerHTML = `<span>Achievement</span><b>${a.name}</b><small>${a.flavour}</small>`;
  el.hidden = false;
  window.setTimeout(() => {
    el.classList.remove("is-in");
    window.setTimeout(() => {
      el.hidden = true;
      toastQueue.shift();
      showNextToast();
    }, 400);
  }, 3200);
}

function renderAchievements(): void {
  const got = unlockedList();
  const total = ACHIEVEMENTS.length;
  $("#achCount").textContent = `${got.length} of ${total}`;
  $("#achBar").style.width = `${(got.length / total) * 100}%`;

  const order = { legendary: 0, rare: 1, common: 2 } as const;
  const sorted = [...ACHIEVEMENTS].sort((a, b) =>
    Number(isUnlocked(b.id)) - Number(isUnlocked(a.id)) || order[a.tier] - order[b.tier]);

  $("#achBody").innerHTML = sorted.map((a) => {
    const u = got.find((g) => g.id === a.id);
    const locked = !u;
    const name = locked && a.hidden ? "???" : a.name;
    const text = locked ? (a.hidden ? "Something you haven't done yet." : a.how) : a.flavour;
    return `
      <div class="ach ${locked ? "ach--locked" : ""} ach--${a.tier}">
        <span class="ach__mark">${locked ? "" : "✓"}</span>
        <span class="ach__main">
          <b>${name}</b>
          <small>${text}</small>
        </span>
        <span class="ach__meta">${u ? `${u.driver}${u.year ? ` · S${u.year}` : ""}` : a.tier}</span>
      </div>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  $("#toAchievements").addEventListener("click", () => { renderAchievements(); show("achievements"); });
  $("#achBack").addEventListener("click", () => show(achOrigin));
  $("#cabAchievements").addEventListener("click", () => { achOrigin = "cabinet"; renderAchievements(); show("achievements"); });
});

let achOrigin: ScreenName = "mode";
