/* =========================================================
   ORIENTATION
   Three things the playtest asked for: a running summary of
   what you've picked, a moment before the season starts, and
   control over how fast a season plays.
   ========================================================= */

/* --------------------------- running picks --------------------------- */

/** Highest and lowest attribute, for the summary lines. */
function attrExtreme(a: Attributes, want: "max" | "min"): [keyof Attributes, string] {
  return ATTR_LABELS.reduce<[keyof Attributes, string]>((best, entry) => {
    const better = want === "max" ? a[entry[0]] > a[best[0]] : a[entry[0]] < a[best[0]];
    return better ? entry : best;
  }, ATTR_LABELS[0]);
}

function pick(label: string, value: string, cls = ""): string {
  return `<span class="pick ${cls}"><em>${label}</em><b>${value}</b></span>`;
}

function renderPicks(): void {
  const a = computeAttrs();
  const best = attrExtreme(a, "max");

  const parts = [
    driver.surname ? pick("Name", `${driver.surname.toUpperCase()} ${driver.number || ""}`) : pick("Name", "not set", "pick--empty"),
    driver.country ? pick("From", `${flagSvg(driver.country.code, 18)} ${driver.country.name}`) : pick("From", "not set", "pick--empty"),
    driver.trait ? pick("Trait", driver.trait.full) : pick("Trait", "not set", "pick--empty"),
    pick("Balance", driver.setup === "oversteer" ? "Loose rear" : "Stable front"),
    pick("Strongest", best[1]),
    pick("Overall", String(overall()), "pick--ovr"),
  ];
  if (currentSeat) {
    parts.push(pick("Seat", currentSeat.name));
    parts.push(pick("Car", currentSeat.philosophy === driver.setup ? "Suits you" : "Fights you"));
  }

  const html = parts.join("");
  const one = document.querySelector("#picks");
  const two = document.querySelector("#picksAcademy");
  if (one) one.innerHTML = html;
  if (two) two.innerHTML = html;
}

/* --------------------------- pre-season briefing --------------------------- */

let briefingReady = false;

function showBriefing(year: number): void {
  const div = currentDivision();
  const a = computeAttrs();
  const strongest = attrExtreme(a, "max");
  const weakest = attrExtreme(a, "min");

  $("#brEyebrow").textContent = `Season ${year} · ${div.name}`;
  $("#brTitle").textContent = year === 1 ? "Your first season" : `Season ${year}`;

  const fits = currentSeat ? currentSeat.philosophy === driver.setup : true;
  $("#brLine").textContent = currentSeat
    ? `${currentSeat.name} expect ${currentSeat.expectation.toLowerCase()}. The car ${fits ? "suits your balance, which is worth real pace" : "fights your balance, and you will feel it every lap"}.`
    : "A season of racing ahead.";

  const mateName = teamMate.name || "to be confirmed";
  const rows: Array<[string, string, string?]> = [
    ["Division", div.name, `${div.rounds.length} rounds`],
    ["Team", currentSeat?.name ?? "-", currentSeat ? `${contractLeft} year${contractLeft === 1 ? "" : "s"} left on the contract` : undefined],
    ["Team-mate", mateName, teamMate.seasons ? `${teamMate.seasons} season${teamMate.seasons === 1 ? "" : "s"} together, ${teamMate.beat}–${teamMate.lost}, ${relationshipLabel().toLowerCase()}` : "New to you"],
    ["Your trait", driver.trait?.full ?? "-", driver.trait?.blurb],
    ["Age", String(age), age >= 30 ? "Past your peak, and you know things you didn't" : "Still improving"],
    ["Strongest", `${strongest[1]} ${a[strongest[0]]}`, `Weakest: ${weakest[1]} ${a[weakest[0]]}`],
    ["Overall", String(overall()), ovrBand(overall())],
  ];

  $("#brGrid").innerHTML = rows.map(([k, v, note]) =>
    `<div><span>${k}</span><b>${v}${note ? `<small>${note}</small>` : ""}</b></div>`).join("");

  briefingReady = true;
  show("briefing");
}

/* --------------------------- pace --------------------------- */

const PACE: Record<string, number> = { slow: 1400, normal: 850, fast: 380 };
let racePace = 850;

function setPace(id: string): void {
  racePace = PACE[id] ?? 850;
  $$<HTMLElement>("[data-speed]").forEach((b) =>
    b.setAttribute("aria-pressed", String(b.dataset.speed === id)));
  try { localStorage.setItem("swami-pace", id); } catch { /* not persisted */ }
}

document.addEventListener("DOMContentLoaded", () => {
  let saved = "normal";
  try { saved = localStorage.getItem("swami-pace") ?? "normal"; } catch { /* ignore */ }
  setPace(saved);
  $$<HTMLElement>("[data-speed]").forEach((b) =>
    b.addEventListener("click", () => setPace(b.dataset.speed!)));

  $("#brGo").addEventListener("click", () => { briefingReady = false; startSeason(pendingYear); });
  $("#brAch").addEventListener("click", () => { achOrigin = "briefing"; renderAchievements(); show("achievements"); });
  $("#hubAch").addEventListener("click", () => { achOrigin = "summary"; renderAchievements(); show("achievements"); });

  // keep the picks bar current as the driver is built
  ["#surname", "#number", "#search"].forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.addEventListener("input", renderPicks);
  });
  document.addEventListener("click", () => window.setTimeout(renderPicks, 0));
  renderPicks();
});
