/* =========================================================
   OVERVIEW, SAVES AND FEEDBACK
   Somewhere for the season to sit still and be read, a way
   to carry progress between browsers, and a route to report
   what breaks.
   ========================================================= */

/* --------------------------- season overview --------------------------- */

/** The full round-by-round table, kept after the season ends. */
function renderOverview(): void {
  if (!season) return;
  const st = seasonStats();
  const div = currentDivision();
  const mate = season.field.find((r) => r.isTeamMate);

  $("#ovTitle").textContent = `Season ${season.year}`;
  $("#ovSub").textContent = `${div.name} · ${currentSeat?.name ?? "-"} · ${st.races} rounds`;

  $("#ovRounds").innerHTML = `
    <div class="race-head">
      <span>Rnd</span><span>Circuit</span><span>Grid</span><span>Finish</span><span>Mate</span><span>Pts</span>
    </div>` + season.results.map((r) => {
      const pos = r.finish === null ? "DNF" : ORD(r.finish);
      const cls = r.finish === null ? "dnf" : r.finish === 1 ? "win" : r.finish <= 3 ? "pod" : r.points > 0 ? "pts" : "";
      const m = r.teamMateFinish === null ? "DNF" : ORD(r.teamMateFinish);
      return `<div class="race-row">
        <span class="rr-round">R${String(r.round).padStart(2, "0")}</span>
        <span class="rr-circuit">${r.circuit}${r.wet ? ' <b class="wet">WET</b>' : ""}</span>
        <span class="rr-grid">P${r.grid}</span>
        <span class="rr-finish ${cls}">${pos}</span>
        <span class="rr-mate ${r.beatTeamMate ? "beat" : "lost"}">${m}</span>
        <span class="rr-pts">${r.points || "-"}</span>
      </div>`;
    }).join("");

  $("#ovStats").innerHTML = `
    <div><b>${ORD(championshipPos())}</b><span>Championship</span></div>
    <div><b>${st.points}</b><span>Points</span></div>
    <div><b>${st.wins}</b><span>Wins</span></div>
    <div><b>${st.podiums}</b><span>Podiums</span></div>
    <div><b>${st.poles}</b><span>Poles</span></div>
    <div><b>${st.dnfs}</b><span>DNFs</span></div>`;

  $("#ovTable").innerHTML = standings().slice(0, 10).map((r, i) => `
    <div class="st-row ${r.isPlayer ? "me" : ""} ${r.isTeamMate ? "mate" : ""}">
      <span>${i + 1}</span>
      <span class="st-name">${r.name}${r.isTeamMate ? ' <b class="mate-tag">team-mate</b>' : ""}</span>
      <span class="st-pts">${r.points}</span>
    </div>`).join("");

  $("#ovMate").textContent = mate
    ? `${mate.name}: ${mate.points} points, and you finished ahead of him ${st.beat} times out of ${st.races}.`
    : "";
}

/* --------------------------- saves --------------------------- */

const SAVE_VERSION = 1;

interface SaveBundle {
  v: number;
  when: number;
  achievements: unknown;
  hall: unknown;
  slots: unknown;
  theme: string | null;
  roster: string | null;
}

function readKey(k: string): unknown {
  try { return JSON.parse(localStorage.getItem(k) ?? "null"); } catch { return null; }
}

function exportSave(): string {
  const bundle: SaveBundle = {
    v: SAVE_VERSION,
    when: Date.now(),
    achievements: readKey("swami-achievements"),
    hall: readKey("swami-hall"),
    slots: readKey("swami-slots"),
    theme: (() => { try { return localStorage.getItem("swami-theme"); } catch { return null; } })(),
    roster: (() => { try { return localStorage.getItem("swami-roster"); } catch { return null; } })(),
  };
  return btoa(unescape(encodeURIComponent(JSON.stringify(bundle))));
}

function importSave(code: string): { ok: boolean; message: string } {
  let bundle: SaveBundle;
  try {
    bundle = JSON.parse(decodeURIComponent(escape(atob(code.trim())))) as SaveBundle;
  } catch {
    return { ok: false, message: "That code could not be read. Check it copied in full." };
  }
  if (!bundle || typeof bundle.v !== "number") return { ok: false, message: "That does not look like a Swami Formula save." };
  if (bundle.v > SAVE_VERSION) return { ok: false, message: "That save is from a newer version of the game." };

  try {
    // merge achievements rather than replacing, so nothing already earned is lost
    const mine = (readKey("swami-achievements") as Array<{ id: string }> | null) ?? [];
    const theirs = (bundle.achievements as Array<{ id: string }> | null) ?? [];
    const merged = [...mine];
    theirs.forEach((a) => { if (!merged.some((m) => m.id === a.id)) merged.push(a); });
    localStorage.setItem("swami-achievements", JSON.stringify(merged));

    if (bundle.hall) localStorage.setItem("swami-hall", JSON.stringify(bundle.hall));
    if (bundle.slots) localStorage.setItem("swami-slots", JSON.stringify(bundle.slots));
    if (bundle.theme) localStorage.setItem("swami-theme", bundle.theme);
    if (bundle.roster) localStorage.setItem("swami-roster", bundle.roster);
  } catch {
    return { ok: false, message: "Storage is blocked in this browser, so the save could not be written." };
  }

  unlockedCache = null;
  return { ok: true, message: "Loaded. Reloading the page to pick it up." };
}

document.addEventListener("DOMContentLoaded", () => {
  $("#ovBack").addEventListener("click", () => show("summary"));
  $("#hubOverview").addEventListener("click", () => { renderOverview(); show("overview"); });

  $("#saveExport").addEventListener("click", () => {
    const code = exportSave();
    const box = $<HTMLTextAreaElement>("#saveCode");
    box.value = code;
    box.hidden = false;
    box.select();
    try { navigator.clipboard?.writeText(code); } catch { /* user can copy manually */ }
    $("#saveNote").textContent = "Copied. Keep this somewhere safe, it holds your achievements, hall of fame and careers.";
  });

  $("#saveImport").addEventListener("click", () => {
    const box = $<HTMLTextAreaElement>("#saveCode");
    if (box.hidden || !box.value.trim()) {
      box.hidden = false;
      box.value = "";
      box.focus();
      $("#saveNote").textContent = "Paste a save code in the box, then press Load again.";
      return;
    }
    const res = importSave(box.value);
    $("#saveNote").textContent = res.message;
    if (res.ok) window.setTimeout(() => window.location.reload(), 900);
  });
});
