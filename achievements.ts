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
    id: a.id, driver: driver.surname.toUpperCase() || "-",
    year: season?.year ?? 0, at: Date.now(),
  };
  unlockedMemory = [...unlockedList(), entry];
  unlockedCache = unlockedMemory;
  try { localStorage.setItem(ACH_KEY, JSON.stringify(unlockedMemory)); } catch { /* session only */ }
  toastAchievement(a);
}

/* --------------------------- the list --------------------------- */

const seasonNow = (): SeasonStats | null => (season && season.results.length ? seasonStats() : null);
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
  { id: "triple", name: "Three in a row", how: "Win three championships in consecutive seasons, any level", tier: "rare",
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
  { id: "indycar", name: "Across the water", how: "Take the IndyCar road out of F2", tier: "rare",
    flavour: "Ovals, streets and road courses, all in one year.",
    test: () => tier === 10 || careerHistory.some((h) => h.label === "INDY") },
  { id: "indy500", name: "The 500", how: "Win at the Indianapolis 500", tier: "legendary",
    flavour: "Milk, bricks, and a face on a trophy forever.",
    test: () => cabinet.wins.some((w) => w.circuit === "Indianapolis 500") },
  { id: "indy-title", name: "IndyCar champion", how: "Win an IndyCar championship", tier: "legendary",
    flavour: "The closest field in racing, and you were the front of it.",
    test: () => cabinet.titles.some((t) => t.label === "INDY") },
  { id: "comeback", name: "One more year", how: "Come back after retiring", tier: "rare",
    flavour: "The phone rang and you picked it up.", test: () => comebacks > 0 },

  /* ---- team-mates ---- */
  { id: "clean-sweep", name: "Whitewash", how: "Beat your team-mate at every round of a season", tier: "rare",
    flavour: "Twelve out of twelve. He asked to be moved.", test: () => { const s = seasonNow(); return !!s && s.races >= 8 && s.lost === 0; } },
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
    flavour: "Saturdays belonged to you.", test: () => { const s = seasonNow(); return !!s && s.poles >= 6; } },
  { id: "recovery", name: "Twenty places", how: "Gain 20 net places on track in a season", tier: "rare",
    flavour: "You start badly and finish angry.", test: () => { const s = seasonNow(); return !!s && s.gained >= 20; } },
  { id: "perfect", name: "No mistakes", how: "Finish every race of a season", tier: "rare",
    flavour: "Not dramatic. Just there, every time.", test: () => { const s = seasonNow(); return !!s && s.races >= 8 && s.dnfs === 0; } },
  { id: "double-figures", name: "Ten in a year", how: "Win ten races in one season", tier: "legendary",
    flavour: "A season nobody else got a say in.", test: () => { const s = seasonNow(); return !!s && s.wins >= 10; } },

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

  /* ---- the named ones ---- */
  { id: "youngest", name: "Youngest champion", how: "Win a Formula 1 championship at 23 or under", tier: "legendary",
    flavour: "The youngest name on the trophy, and it stays that way for a long time.",
    test: () => cabinet.titles.some((t) => t.tier >= 5 && (t.age ?? 99) <= 23) },
  { id: "greatest", name: "All-time greatest", how: "Win eight Formula 1 championships", tier: "legendary",
    flavour: "Eight. There is no argument left to have.",
    test: () => cabinet.titles.filter((t) => t.tier >= 5).length >= 8 },
  { id: "four-row", name: "Mr Four In A Row", how: "Win four Formula 1 championships in consecutive seasons", tier: "legendary",
    flavour: "Four straight at the top. The argument stops being an argument.",
    test: () => {
      const yrs = [...new Set(cabinet.titles.filter((t) => t.tier >= 5).map((t) => t.year))].sort((a, b) => a - b);
      return yrs.some((y) => yrs.includes(y + 1) && yrs.includes(y + 2) && yrs.includes(y + 3));
    } },
  { id: "xaverra", name: "The Xaverra Classic", how: "As a Dutch driver, win at Zandvoort three times", tier: "legendary",
    flavour: "Orange everywhere, three times over. They will not let you buy a drink again.",
    test: () => driver.country?.code === "NL" && cabinet.wins.filter((w) => w.circuit === "Zandvoort").length >= 3 },
  { id: "trifecta", name: "The trifecta", how: "Win the F3, F2 and Formula 1 championships", tier: "legendary",
    flavour: "The whole ladder, one rung at a time, all of them won.",
    test: () => cabinet.titles.some((t) => t.label === "F3")
      && cabinet.titles.some((t) => t.label === "F2")
      && cabinet.titles.some((t) => t.tier >= 5) },

  { id: "fangio", name: "The Fangio Special", how: "Still racing in your fifties", tier: "legendary",
    flavour: "Driving with your walking stick in the cockpit next to you.",
    test: () => age >= 50 },

  /* ---- reserve and the long way ---- */
  { id: "stand-in", name: "Called up", how: "Score points as a stand-in reserve driver", tier: "rare",
    flavour: "Somebody got hurt, and you were ready.",
    test: () => currentDivision().id === "reserve" && (seasonNow()?.points ?? 0) > 0 },
  { id: "reserve-podium", name: "Not bad for a stand-in", how: "Take a podium as a reserve driver", tier: "legendary",
    flavour: "Four races all year, and one of them ended on the podium.",
    test: () => currentDivision().id === "reserve" && (seasonNow()?.podiums ?? 0) > 0 },
  { id: "every-series", name: "Been everywhere", how: "Race in F1, sportscars and IndyCar", tier: "legendary",
    flavour: "Three paddocks, three sets of rules, one career.",
    test: () => careerHistory.some((h) => h.label === "F1")
      && careerHistory.some((h) => h.label === "GT3" || h.label === "HYP")
      && careerHistory.some((h) => h.label === "INDY") },
  { id: "triple-crown", name: "Something like the triple crown", how: "Win at Monaco, the Indy 500 and Le Mans", tier: "legendary",
    flavour: "Three races, three disciplines, one name on all of them.",
    test: () => cabinet.wins.some((w) => w.circuit === "Monaco")
      && cabinet.wins.some((w) => w.circuit === "Indianapolis 500")
      && cabinet.wins.some((w) => w.circuit === "Le Mans") },

  /* ---- races and moments ---- */
  { id: "the-gap", name: "It was a gap", how: "Win a place on the last lap by pushing", tier: "common",
    flavour: "It was not really a gap. It was a gap.",
    test: () => momentsPushed >= 1 && momentsWon >= 1 },
  { id: "gambler-race", name: "Nerves of something", how: "Push in ten in-race moments", tier: "rare",
    flavour: "You have never once settled for the position you were in.",
    test: () => momentsPushed >= 10 },
  { id: "burned", name: "Into the barrier", how: "End a race in the wall by pushing", tier: "common",
    flavour: "It did not stick.",
    test: () => momentsCrashed >= 1 },
  { id: "clean-hands", name: "Never once tempted", how: "Hold position in ten in-race moments", tier: "rare",
    flavour: "Every time the door opened, you closed it yourself.",
    test: () => momentsHeld >= 10 },
  { id: "podium-hat", name: "Three on the bounce", how: "Podium in three consecutive races", tier: "rare",
    flavour: "A run where the car and the driver agreed about everything.",
    test: () => {
      const f = (season?.results ?? []).filter((r) => !r.didNotStart).map((r) => r.finish);
      return f.some((_, i) => i >= 2 && [f[i], f[i - 1], f[i - 2]].every((x) => x !== null && x <= 3));
    } },
  { id: "points-every-race", name: "In the points all year", how: "Score in every round of a season", tier: "legendary",
    flavour: "Not one weekend wasted.",
    test: () => { const s = seasonNow(); return !!s && s.races >= 10 && s.pointsFinishes === s.races; } },

  /* ---- careers ---- */
  { id: "one-team", name: "One team, ten years", how: "Spend ten seasons at the same team", tier: "rare",
    flavour: "They named a corner of the factory after you.",
    test: () => cabinet.helmets.some((h) => h.seasons >= 10) },
  { id: "journeyman", name: "Journeyman", how: "Drive for ten different teams", tier: "common",
    flavour: "Ten helmets, ten sets of overalls, one steering wheel.",
    test: () => cabinet.helmets.length >= 10 },
  { id: "two-hundred", name: "Two hundred starts", how: "Start 200 races", tier: "rare",
    flavour: "More Sundays in a car than most people spend on anything.",
    test: () => cabinet.races >= 200 },
  { id: "fifty-wins", name: "Fifty wins", how: "Win fifty races", tier: "legendary",
    flavour: "Fifty times, the anthem was for you.",
    test: () => cabinet.wins.length >= 50 },
  { id: "unlucky", name: "Cruel year", how: "Retire from six races in one season", tier: "common",
    flavour: "The car broke, and then it broke again.",
    test: () => (seasonNow()?.dnfs ?? 0) >= 6 },
  { id: "beaten-badly", name: "Out-driven", how: "Lose the head-to-head in a season by ten or more", tier: "common",
    flavour: "He had your number all year and everybody saw it.",
    test: () => { const s = seasonNow(); return !!s && s.lost - s.beat >= 10; } },
  { id: "late-bloomer", name: "Late bloomer", how: "Win your first championship at 30 or older", tier: "rare",
    flavour: "Everybody had already decided what you were.",
    test: () => cabinet.titles.length > 0 && (cabinet.titles[0].age ?? 0) >= 30 },
  { id: "wet-double", name: "Rain specialist", how: "Win three wet races", tier: "rare",
    flavour: "When it rains, the paddock looks at you.",
    test: () => cabinet.wins.filter((w) => w.wet).length >= 3 },

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
  if (toastQueue.length === 1) showNextToast();
}

let toastTimer = 0;

function showNextToast(): void {
  const a = toastQueue[0];
  const el = $("#achToast");
  if (!a) { el.hidden = true; el.classList.remove("is-in"); return; }

  window.clearTimeout(toastTimer);
  const queued = toastQueue.length - 1;
  el.className = `ach-toast ach-toast--${a.tier} is-in`;
  el.innerHTML = `<span>Achievement</span><b>${a.name}</b><small>${a.flavour}</small>` +
    (queued > 0 ? `<span class="ach-toast__more">${queued} more unlocked, see Achievements</span>` : "");
  el.hidden = false;

  toastTimer = window.setTimeout(() => {
    el.classList.remove("is-in");
    window.setTimeout(() => {
      toastQueue.shift();
      showNextToast();
    }, 380);
  }, queued > 0 ? 2600 : 5200);
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
