/* =========================================================
   THE GARAGE
   Several drivers on the go at once. Each career is a slot:
   saved at the start of every season, resumed exactly where
   it was — same seed, same story.
   ========================================================= */

interface SlotMeta {
  id: string;
  surname: string;
  number: number;
  country: string;
  trait: string;
  division: string;
  label: string;
  team: string;
  year: number;
  age: number;
  titles: number;
  wins: number;
  savedAt: number;
}

interface SlotState extends SlotMeta {
  mode: Mode;
  setup: Setup;
  livery: string;
  realRoster: boolean;
  rng: number;
  tier: number;
  yearsInTier: number;
  contractLeft: number;
  comebacks: number;
  carBonus: number;
  lockedOut: number[];
  growth: Attributes;
  earned: Attributes;
  rep: Reputation;
  totals: typeof careerTotals;
  cabinet: typeof cabinet;
  history: SeasonRecord[];
  log: LogEntry[];
  used: string[];
  pending: Array<Consequence & { dueYear: number }>;
  seat: Seat | null;
  mate: typeof teamMate;
  rival: typeof nemesis;
}

const SLOT_KEY = "swami-slots";
const MAX_SLOTS = 6;
let slotId = "";

function readSlots(): SlotState[] {
  try { return JSON.parse(localStorage.getItem(SLOT_KEY) ?? "[]") as SlotState[]; }
  catch { return []; }
}

function writeSlots(list: SlotState[]): void {
  try { localStorage.setItem(SLOT_KEY, JSON.stringify(list.slice(0, MAX_SLOTS))); }
  catch { /* storage blocked — the career still works, it just won't persist */ }
}

/** Snapshot everything. Called at the start of each season. */
function saveSlot(): void {
  if (!slotId || retired) return;
  const state: SlotState = {
    id: slotId,
    surname: driver.surname, number: driver.number,
    country: driver.country?.code ?? "", trait: driver.trait?.id ?? "",
    division: currentDivision().name, label: currentDivision().label,
    team: currentSeat?.name ?? "—",
    year: season?.year ?? 1, age, titles: cabinet.titles.length, wins: cabinet.wins.length,
    savedAt: Date.now(),
    mode: driver.mode ?? "normal", setup: driver.setup, livery: driver.livery.id,
    realRoster: useRealRoster,
    rng: rngState, tier, yearsInTier, contractLeft, comebacks, carBonus,
    lockedOut: [...lockedOut],
    growth: { ...careerGrowth }, earned: { ...earnedGrowth }, rep: { ...reputation },
    totals: { ...careerTotals },
    cabinet: JSON.parse(JSON.stringify(cabinet)),
    history: careerHistory.map((h) => ({ ...h })),
    log: decisionLog.map((l) => ({ ...l })),
    used: [...usedDecisions],
    pending: pending.map((p) => ({ ...p })),
    seat: currentSeat ? { ...currentSeat } : null,
    mate: { ...teamMate }, rival: { ...nemesis },
  };
  const list = readSlots().filter((s) => s.id !== slotId);
  writeSlots([state, ...list]);
}

function deleteSlot(id: string): void {
  writeSlots(readSlots().filter((s) => s.id !== id));
}

/** Put a saved career back into every global it came from. */
function loadSlot(s: SlotState): void {
  slotId = s.id;
  driver.surname = s.surname;
  driver.number = s.number;
  driver.country = COUNTRIES.find((c) => c.code === s.country) ?? null;
  driver.trait = TRAITS.find((t) => t.id === s.trait) ?? null;
  driver.setup = s.setup;
  driver.mode = s.mode;
  driver.livery = LIVERIES.find((l) => l.id === s.livery) ?? LIVERIES[0];
  applyRoster(s.realRoster);

  tier = s.tier; age = s.age; yearsInTier = s.yearsInTier;
  contractLeft = s.contractLeft; comebacks = s.comebacks; carBonus = s.carBonus;
  retired = false;
  lockedOut.clear(); s.lockedOut.forEach((t) => lockedOut.add(t));

  (Object.keys(careerGrowth) as Array<keyof Attributes>).forEach((k) => {
    careerGrowth[k] = s.growth[k]; earnedGrowth[k] = s.earned[k];
  });
  (Object.keys(reputation) as Array<keyof Reputation>).forEach((k) => { reputation[k] = s.rep[k]; });
  Object.assign(careerTotals, s.totals);
  Object.assign(cabinet, s.cabinet);
  careerHistory.length = 0; s.history.forEach((h) => careerHistory.push(h));
  decisionLog.length = 0; s.log.forEach((l) => decisionLog.push(l));
  usedDecisions.clear(); s.used.forEach((u) => usedDecisions.add(u));
  pending = s.pending;
  currentSeat = s.seat;
  Object.assign(teamMate, s.mate);
  Object.assign(nemesis, s.rival);

  // restore the exact point in the sequence, so the career plays out the same way
  rng = mulberry(0);
  rngState = s.rng;

  startSeason(s.year);
}

/* --------------------------- the garage screen --------------------------- */

const MODE_LABEL: Record<Mode, string> = { intense: "Intense", normal: "Normal", express: "Express" };

function renderGarage(): void {
  renderHall();                       // the finished list lives on the same screen
  const slots = readSlots();
  const list = $("#garageBody");
  list.innerHTML = slots.length
    ? slots.map((s) => `
      <div class="slot">
        <span class="slot__num">${s.number}</span>
        <span class="slot__main">
          <b>${flagSvg(s.country, 20)} ${s.surname.toUpperCase()}</b>
          <small>${s.label} · ${s.team} · season ${s.year}, aged ${s.age}${s.titles ? ` · ${s.titles} title${s.titles > 1 ? "s" : ""}` : ""}
            <em class="mode-tag">${MODE_LABEL[s.mode]}</em></small>
        </span>
        <span class="slot__acts">
          <button class="btn btn--solid btn--tiny" data-resume="${s.id}" type="button">Resume</button>
          <button class="btn btn--quiet btn--tiny" data-drop="${s.id}" type="button">Delete</button>
        </span>
      </div>`).join("")
    : `<p class="empty">Nobody on the grid right now. Start a career and it'll wait here between seasons — up to ${MAX_SLOTS} drivers at once.</p>`;

  list.querySelectorAll<HTMLButtonElement>("[data-resume]").forEach((b) =>
    b.addEventListener("click", () => {
      const s = readSlots().find((x) => x.id === b.dataset.resume);
      if (s) loadSlot(s);
    }));
  list.querySelectorAll<HTMLButtonElement>("[data-drop]").forEach((b) =>
    b.addEventListener("click", () => {
      if (window.confirm("Delete this career? It won't go into the hall of fame.")) {
        deleteSlot(b.dataset.drop!);
        renderGarage();
        refreshResumeBadge();
      }
    }));
}

/** The landing button counts everything you've ever run. */
function refreshResumeBadge(): void {
  const running = readSlots().length;
  const done = hallOfFame().length;
  const total = running + done;
  $("#toHistory").textContent = total ? `Career history (${total})` : "Career history";
}

document.addEventListener("DOMContentLoaded", () => {
  refreshResumeBadge();
  $("#garageBack").addEventListener("click", () => show(typeof hallOrigin !== "undefined" ? hallOrigin : "mode"));
  $("#garageNew").addEventListener("click", () => show("identity"));
});
