/* =========================================================
   PHASE 4 — the trophy cabinet
   A room you can walk back into. Everything here is earned
   during play and recorded as it happens.
   ========================================================= */

interface TrophyWin { year: number; circuit: string; label: string; team: string; wet: boolean }
interface Title { year: number; division: string; label: string; team: string; tier: number }
interface HelmetEntry { team: string; label: string; seasons: number; wins: number; from: number; to: number }
interface RivalEntry { name: string; team: string; label: string; beat: number; lost: number; years: number[] }
interface FirstEntry { what: string; year: number; where: string; note: string }

const cabinet = {
  titles: [] as Title[],
  wins: [] as TrophyWin[],
  podiums: 0,
  poles: 0,
  dnfs: 0,
  races: 0,
  helmets: [] as HelmetEntry[],
  rivals: [] as RivalEntry[],
  firsts: [] as FirstEntry[],
  cursed: [] as FirstEntry[],
};

/** Called once per season, after the results are final. */
function ingestSeason(): void {
  const div = currentDivision();
  const team = currentSeat?.name ?? "—";
  const st = seasonStats();
  const yr = season!.year;

  cabinet.races += st.races;
  cabinet.podiums += st.podiums;
  cabinet.poles += st.poles;
  cabinet.dnfs += st.dnfs;

  // race wins, tagged by circuit and year
  season!.results.forEach((r) => {
    if (r.finish === 1) cabinet.wins.push({ year: yr, circuit: r.circuit, label: div.label, team, wet: r.wet });
  });

  // championships
  if (championshipPos() === 1) {
    cabinet.titles.push({ year: yr, division: div.name, label: div.label, team, tier: div.tier });
  }

  // helmets — one per team you drove for
  const helmet = cabinet.helmets.find((h) => h.team === team && h.label === div.label);
  const seasonWins = season!.results.filter((r) => r.finish === 1).length;
  if (helmet) { helmet.seasons++; helmet.wins += seasonWins; helmet.to = yr; }
  else cabinet.helmets.push({ team, label: div.label, seasons: 1, wins: seasonWins, from: yr, to: yr });

  // rivals — every team-mate you've been measured against
  const mate = season!.field.find((r) => r.isTeamMate);
  if (mate) {
    const rival = cabinet.rivals.find((r) => r.name === mate.name);
    if (rival) { rival.beat += st.beat; rival.lost += st.lost; rival.years.push(yr); }
    else cabinet.rivals.push({ name: mate.name, team, label: div.label, beat: st.beat, lost: st.lost, years: [yr] });
  }

  // firsts — small trophies, disproportionate weight
  const add = (what: string, where: string, note: string): void => {
    if (!cabinet.firsts.some((f) => f.what === what)) cabinet.firsts.push({ what, year: yr, where, note });
  };
  const firstPoints = season!.results.find((r) => r.points > 0);
  const firstPodium = season!.results.find((r) => r.finish !== null && r.finish <= 3);
  const firstWin = season!.results.find((r) => r.finish === 1);
  const firstPole = season!.results.find((r) => r.grid === 1);
  if (firstPoints) add("First points", firstPoints.circuit, `${ORD(firstPoints.finish!)} in ${div.name}`);
  if (firstPole) add("First pole", firstPole.circuit, `${div.name}, season ${yr}`);
  if (firstPodium) add("First podium", firstPodium.circuit, `${ORD(firstPodium.finish!)}, ${div.name}`);
  if (firstWin) add("First win", firstWin.circuit, `${div.name}, aged ${age}`);
  const curse = (what: string, where: string, note: string): void => {
    if (!cabinet.cursed.some((f) => f.what === what)) cabinet.cursed.push({ what, year: yr, where, note });
  };
  if (st.dnfs >= 4) curse("The DNF trophy", `${st.dnfs} retirements`, `Season ${yr} in ${div.name}. You saw the flag ${st.races - st.dnfs} times.`);
  if (championshipPos() >= div.fieldSize - 1) curse("Wooden spoon", `P${championshipPos()} of ${div.fieldSize}`, `Season ${yr}. Somebody has to be last.`);
  if (st.poles >= 3 && st.wins === 0) curse("Sunday driver", `${st.poles} poles, no wins`, `Season ${yr}. Fast on Saturday. Ask again on Sunday.`);

  if (cabinet.titles.length === 1 && championshipPos() === 1) add("First championship", div.name, `Season ${yr}, aged ${age}`);
}

/** One framed item per career: the choice that turned it. */
function definingMoment(): LogEntry | null {
  if (decisionLog.length === 0) return null;
  // the choice made in the season before your best year
  const best = careerHistory.reduce<SeasonRecord | null>((b, h) => {
    if (!b) return h;
    const score = (r: SeasonRecord): number => (r.outcome === "jump" ? 40 : 0) + (r.pos === 1 ? 30 : 0) + r.wins * 3 - r.pos;
    return score(h) > score(b) ? h : b;
  }, null);
  if (!best) return decisionLog[decisionLog.length - 1];
  const before = [...decisionLog].reverse().find((e) => e.year <= best.year);
  return before ?? decisionLog[0];
}

/* --------------------------- rendering --------------------------- */

const teamHue = (name: string): number => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  return h;
};

function trophySvg(tier: number): string {
  // kart trophies look cheap next to an F1 one, deliberately
  const gold = tier >= 5 ? "#F5C518" : tier >= 3 ? "#D8D3C4" : "#B08A57";
  const glow = tier >= 5 ? .5 : tier >= 3 ? .3 : .15;
  const h = 20 + tier * 2.5;
  return `<svg viewBox="0 0 60 ${h + 34}" class="trophy__svg" aria-hidden="true">
    <ellipse cx="30" cy="${h + 30}" rx="16" ry="3" fill="${gold}" opacity="${glow}"/>
    <rect x="21" y="${h + 20}" width="18" height="8" rx="2" fill="${gold}"/>
    <rect x="26" y="${h + 12}" width="8" height="9" fill="${gold}" opacity=".8"/>
    <path d="M16 6h28v${h * 0.55}c0 8-6 ${h * 0.4} -14 ${h * 0.4}S16 ${h * 0.55 + 8} 16 ${h * 0.55 + 6}z" fill="${gold}"/>
    <path d="M16 10H9a6 6 0 006 10zM44 10h7a6 6 0 01-6 10z" fill="${gold}" opacity=".75"/>
  </svg>`;
}

function renderCabinet(): void {
  const c = cabinet;
  const empty = (t: string): string => `<p class="empty">${t}</p>`;

  // championships
  $("#cabTitles").innerHTML = c.titles.length
    ? c.titles.map((t) => `
        <div class="trophy" title="${t.division}">
          ${trophySvg(t.tier)}
          <b>${t.label}</b>
          <span>S${t.year} · ${t.team}</span>
        </div>`).join("")
    : empty("No championships yet. A title in any division puts a trophy on this shelf — and they don't all look the same.");

  // wins
  $("#cabWins").innerHTML = c.wins.length
    ? c.wins.map((w) => `
        <div class="win-chip">
          <b>${w.circuit}</b>
          <span>S${w.year} · ${w.label}${w.wet ? " · wet" : ""}</span>
        </div>`).join("")
    : empty("The win shelf is empty. Every race you win gets tagged here with the circuit and the year.");

  // counters
  $("#cabCounts").innerHTML = `
    <div><b>${c.titles.length}</b><span>Titles</span></div>
    <div><b>${c.wins.length}</b><span>Wins</span></div>
    <div><b>${c.podiums}</b><span>Podiums</span></div>
    <div><b>${c.poles}</b><span>Poles</span></div>
    <div><b>${c.races}</b><span>Races</span></div>
    <div><b>${c.dnfs}</b><span>DNFs</span></div>`;

  // helmets
  $("#cabHelmets").innerHTML = c.helmets.length
    ? c.helmets.map((h) => {
        const hue = teamHue(h.team);
        return `<div class="helmet-card">
          <svg viewBox="0 0 100 84" aria-hidden="true">
            <path d="M50 8c20 0 32 13 32 31 0 8-2 14-5 18-2 3-6 5-10 5H28c-7 0-11-5-12-12-1-4-2-8-2-11 0-18 13-31 36-31z"
              fill="hsl(${hue} 62% 42%)"/>
            <path d="M50 8c3 0 7 0 10 1l-5 53h-9L40 9c3-1 7-1 10-1z" fill="hsl(${(hue + 40) % 360} 70% 68%)"/>
            <path d="M22 36c6-7 16-10 28-10s22 3 28 10c1 5 0 9-1 12-9 3-17 4-27 4s-18-1-27-4c-1-3-2-7-1-12z" fill="#0A0C0E"/>
          </svg>
          <b>${h.team}</b>
          <span>${h.label} · S${h.from}${h.to !== h.from ? `–${h.to}` : ""} · ${h.wins} win${h.wins === 1 ? "" : "s"}</span>
        </div>`;
      }).join("")
    : empty("A helmet appears here for every team you drive for.");

  // firsts
  $("#cabFirsts").innerHTML = c.firsts.length
    ? c.firsts.map((f) => `
        <div class="first-row">
          <b>${f.what}</b>
          <span>${f.where}</span>
          <small>${f.note}</small>
        </div>`).join("")
    : empty("First points, first pole, first podium, first win. Small trophies, disproportionate weight.");

  // rivals
  $("#cabRivals").innerHTML = c.rivals.length
    ? c.rivals.map((r) => {
        const total = r.beat + r.lost;
        const pct = total ? (r.beat / total) * 100 : 0;
        return `<div class="rival">
          <div class="rival__top"><b>${r.name}</b><span class="mono ${r.beat > r.lost ? "up" : "down"}">${r.beat}–${r.lost}</span></div>
          <div class="rival__bar"><i style="width:${pct}%"></i></div>
          <small>${r.team} · ${r.label} · season${r.years.length > 1 ? "s" : ""} ${r.years.join(", ")}</small>
        </div>`;
      }).join("")
    : empty("Every team-mate you're measured against ends up on this wall.");

  // cursed items
  $("#cabCursed").innerHTML = c.cursed.length
    ? c.cursed.map((f) => `
        <div class="first-row first-row--cursed">
          <b>${f.what}</b><span>${f.where}</span><small>${f.note}</small>
        </div>`).join("")
    : empty("Nothing cursed yet. Retire enough times in one season and something will appear here.");

  // defining moment
  const dm = definingMoment();
  $("#cabMoment").innerHTML = dm
    ? `<div class="moment">
         <p class="moment__eyebrow">Season ${dm.year}</p>
         <p class="moment__choice">${dm.chose}</p>
         <p class="moment__outcome">${dm.outcome}</p>
       </div>`
    : empty("Every career has exactly one defining moment. Yours hasn't happened yet.");
}

document.addEventListener("DOMContentLoaded", () => {
  $("#openCabinet").addEventListener("click", () => { renderCabinet(); show("cabinet"); });
  $("#cabinetBack").addEventListener("click", () => show("summary"));
});
