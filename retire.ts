/* =========================================================
   PHASE 5 — retirement
   The career ends, gets written up from what actually
   happened, and goes into the hall of fame.
   ========================================================= */

interface HallEntry {
  surname: string; number: number; flag: string; trait: string;
  seasons: number; titles: number; wins: number; podiums: number;
  peak: string; ending: string; moment: string;
}

const HALL_KEY = "swami-hall";
let retired = false;
/** Storage can be blocked (file://, private mode). The hall still works this session. */
let hallMemory: HallEntry[] = [];

function hallOfFame(): HallEntry[] {
  try {
    const stored = JSON.parse(localStorage.getItem(HALL_KEY) ?? "[]") as HallEntry[];
    if (stored.length >= hallMemory.length) return stored;
  } catch { /* fall through to memory */ }
  return hallMemory;
}

function saveToHall(e: HallEntry): void {
  hallMemory = [e, ...hallMemory].slice(0, 12);
  try { localStorage.setItem(HALL_KEY, JSON.stringify(hallMemory)); }
  catch { /* kept in memory for this session only */ }
}

/** The highest rung you ever reached, named. */
function peakDivision(): string {
  const best = careerHistory.reduce((b, h) => {
    const t = DIVISIONS.findIndex((d) => d.name === h.division);
    return t > b ? t : b;
  }, 0);
  return DIVISIONS[best].name;
}

/** Retirement can be forced, or chosen. */
function retirementReason(): { headline: string; detail: string } {
  const t = cabinet.titles.length;
  const peak = peakDivision();
  if (lastRoll?.outcome === "out") {
    return { headline: "It stopped", detail: lastRoll.detail };
  }
  if (age >= 34) {
    return { headline: "You walk away", detail: `You're ${age}. The seat is still yours, and you hand it back before anyone asks you to.` };
  }
  if (t > 0) {
    return { headline: "You walk away on your terms", detail: `${t} title${t > 1 ? "s" : ""}, and you stop while ${peak} still wants you.` };
  }
  return { headline: "You walk away", detail: `No titles, ${cabinet.wins.length} win${cabinet.wins.length === 1 ? "" : "s"}, and a career that got as far as ${peak}.` };
}

/** The epilogue is assembled from the log and the history, never invented at the end. */
function epilogue(): string[] {
  const lines: string[] = [];
  const t = cabinet.titles.length;
  const peak = peakDivision();
  const first = careerHistory[0];
  const last = careerHistory[careerHistory.length - 1];
  const jumps = careerHistory.filter((h) => h.outcome === "jump").length;
  const drops = careerHistory.filter((h) => h.outcome === "drop").length;
  const stalls = careerHistory.filter((h) => h.outcome === "stall").length;
  const totalBeat = careerHistory.reduce((n, h) => n + h.beat, 0);
  const totalLost = careerHistory.reduce((n, h) => n + h.lost, 0);

  lines.push(`${driver.surname.toUpperCase()} started at ${first?.age ?? 15} in ${first?.division ?? "karting"} and finished at ${age} in ${last?.division ?? peak}.`);

  if (t > 0) {
    const named = cabinet.titles.slice(0, 4).map((x) => `${x.label} in season ${x.year}`).join(", ");
    lines.push(`${t} championship${t > 1 ? "s" : ""}: ${named}${t > 4 ? `, and ${t - 4} more` : ""}.`);
  }
  else lines.push("No championship. That is true of almost everyone who ever raced.");

  if (jumps) lines.push(`${jumps === 1 ? "Once" : `${jumps} times`} a seat came free two levels above and you took it before you were ready.`);
  if (stalls >= 3) lines.push(`${stalls} seasons ended with nowhere to go — the results were there and the seat wasn't.`);
  if (drops) lines.push(`You went backwards ${drops === 1 ? "once" : `${drops} times`}, and came back.`);

  lines.push(totalBeat > totalLost
    ? `Across ${totalBeat + totalLost} races you out-scored your team-mate ${totalBeat} times. The paddock reads that number first, and it read well.`
    : `Across ${totalBeat + totalLost} races your team-mates finished ahead ${totalLost} times. That is the number people remembered.`);

  if (nemesis.name) lines.push(`${nemesis.name} was on the grid for most of it.`);
  lines.push(`Reputation at the end: ${repLabel().toLowerCase()}.`);
  return lines;
}

function showRetirement(): void {
  retired = true;
  const r = retirementReason();
  const dm = definingMoment();

  $("#retHeadline").textContent = r.headline;
  $("#retDetail").textContent = r.detail;
  $("#retName").textContent = driver.surname.toUpperCase();
  $("#retNumber").textContent = String(driver.number);
  $("#retFlag").textContent = driver.country?.flag ?? "🏁";
  $("#retPeak").textContent = peakDivision();

  const art = $("#retCard");
  art.style.setProperty("--card-base", driver.livery.base);
  art.style.setProperty("--card-shade", driver.livery.shade);
  art.style.setProperty("--card-accent", driver.livery.accent);
  art.style.setProperty("--card-trim", driver.livery.trim);

  $("#retStats").innerHTML = `
    <div><b>${careerHistory.length}</b><span>Seasons</span></div>
    <div><b>${cabinet.titles.length}</b><span>Titles</span></div>
    <div><b>${cabinet.wins.length}</b><span>Wins</span></div>
    <div><b>${cabinet.podiums}</b><span>Podiums</span></div>
    <div><b>${cabinet.poles}</b><span>Poles</span></div>
    <div><b>${cabinet.races}</b><span>Races</span></div>`;

  $("#retStory").innerHTML = epilogue().map((l) => `<p>${l}</p>`).join("");
  $("#retMoment").innerHTML = dm
    ? `<p class="moment__eyebrow">Defining moment · season ${dm.year}</p>
       <p class="moment__choice">${dm.chose}</p>
       <p class="moment__outcome">${dm.outcome}</p>`
    : `<p class="moment__outcome">No single choice defined this one.</p>`;

  saveToHall({
    surname: driver.surname.toUpperCase(), number: driver.number,
    flag: driver.country?.flag ?? "🏁", trait: driver.trait?.full ?? "—",
    seasons: careerHistory.length, titles: cabinet.titles.length,
    wins: cabinet.wins.length, podiums: cabinet.podiums,
    peak: peakDivision(), ending: r.headline, moment: dm?.chose ?? "—",
  });

  show("retire");
}

function renderHall(): void {
  const hall = hallOfFame();
  $("#hallBody").innerHTML = hall.length
    ? hall.map((h) => `
      <div class="hall-row">
        <span class="hall-num">${h.number}</span>
        <span class="hall-main">
          <b>${h.flag} ${h.surname}</b>
          <small>${h.trait} · peaked at ${h.peak} · ${h.ending.toLowerCase()}</small>
        </span>
        <span class="hall-stats mono">${h.titles}T · ${h.wins}W · ${h.seasons} seasons</span>
      </div>`).join("")
    : `<p class="empty">No drivers here yet. Finish a career and it lands on this wall.</p>`;
}

document.addEventListener("DOMContentLoaded", () => {
  $("#hubRetire").addEventListener("click", () => {
    if (window.confirm("Retire now? The career ends here and goes into the hall of fame.")) showRetirement();
  });
  $("#retCabinet").addEventListener("click", () => { renderCabinet(); show("cabinet"); });
  $("#retHall").addEventListener("click", () => { renderHall(); show("hall"); });
  $("#hallBack").addEventListener("click", () => show("retire"));
  $("#retNew").addEventListener("click", () => window.location.reload());
});
