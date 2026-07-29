/* =========================================================
   TITLE FIGHTS
   The championship stops being a readout. A named rival is
   locked in for the season, the closing rounds put both of
   you under pressure, and a decider is a decision.
   ========================================================= */

interface Contender { id: number; name: string; locked: boolean }

let contender: Contender | null = null;
let deciderShown = false;

/** One-race modifiers, set by the decider and consumed by the next race. */
const raceMods = { pace: 0, dnf: 0, rivalDnf: 0 };

function clearRaceMods(): void { raceMods.pace = 0; raceMods.dnf = 0; raceMods.rivalDnf = 0; }

/** Locks the fight to whoever you're actually racing, once the season has shape. */
function updateContender(): void {
  if (!season) return;
  const table = standings();
  const me = table.findIndex((r) => r.isPlayer);
  const near = me === 0 ? table[1] : table[me - 1];
  if (!near) return;

  if (!contender) { contender = { id: near.id, name: near.name, locked: false }; return; }

  const current = table.find((r) => r.id === contender!.id);
  const gapToCurrent = current ? Math.abs(table[me].points - current.points) : 999;

  // once it's close and late, the fight is fixed — no swapping rivals round to round
  const late = season.results.length > season.division.rounds.length * 0.6;
  if (late && gapToCurrent <= 50) { contender.locked = true; return; }
  if (!contender.locked && near.id !== contender.id) contender = { id: near.id, name: near.name, locked: false };
}

function contenderRacer(): Racer | undefined {
  return contender ? season?.field.find((r) => r.id === contender!.id) : undefined;
}

/** True when the last round decides a championship you're actually in. */
function isTitleDecider(): boolean {
  if (!season || !contender) return false;
  const table = standings();
  const me = table.findIndex((r) => r.isPlayer);
  const rival = contenderRacer();
  if (!rival || me > 1) return false;
  const roundsLeft = season.division.rounds.length - season.results.length;
  return roundsLeft === 1 && Math.abs(table[me].points - rival.points) <= 26;
}

/** The closing rounds of a title fight are heavier for everyone in them. */
function pressureFor(r: Racer): number {
  if (!season) return 0;
  const roundsLeft = season.division.rounds.length - season.results.length;
  if (roundsLeft > 3) return 0;
  const inFight = r.isPlayer || r.id === contender?.id;
  if (!inFight) return 0;
  // a settled driver handles it; a fragile reputation does not
  const steady = r.isPlayer ? (computeAttrs().consistency - 52) / 100 : 0.1;
  return 0.035 - steady * 0.05;
}

/* --------------------------- the decider --------------------------- */

const DECIDER: Decision = {
  id: "__decider",
  eyebrow: "Final round",
  scene: "",
  question: "One race. However this goes, it's the thing you'll be asked about for the rest of your life.",
  options: [
    { label: "Drive it flat out", detail: "Take the race to him from lap one.",
      outcome: "You attack from the start.",
      effect: { rep: { fragile: 1 } },
      roll: [
        { w: 55, outcome: "It works. You're past him by lap nine and he never gets back on terms.", effect: { attrs: { racecraft: 4 } } },
        { w: 45, outcome: "You overdrive it, cook the tyres by half distance and spend the last twenty laps hanging on.", effect: { attrs: { tyres: -2 } } },
      ] },
    { label: "Race the points, not the man", detail: "Take what the day gives you.",
      outcome: "You drive a careful, calculated race.",
      effect: { attrs: { consistency: 3 }, rep: { loyal: 1 } } },
    { label: "Make him beat you", detail: "Sit on him and wait for the mistake.",
      outcome: "You shadow him and refuse to go away.",
      effect: { rep: { political: 1 } },
      roll: [
        { w: 50, outcome: "He cracks at half distance, runs wide, and hands you the corner and the year.", effect: { attrs: { racecraft: 3, consistency: 2 } } },
        { w: 50, outcome: "He doesn't crack. He never once looks like cracking.", effect: { attrs: { consistency: 2 } } },
      ] },
  ],
};

/** Modifiers each decider option puts on the final race. */
const DECIDER_MODS: Record<string, { pace: number; dnf: number; rivalDnf: number }> = {
  "Drive it flat out": { pace: 4.5, dnf: 0.06, rivalDnf: 0 },
  "Race the points, not the man": { pace: 1, dnf: -0.03, rivalDnf: 0 },
  "Make him beat you": { pace: 2, dnf: 0.01, rivalDnf: 0.07 },
};

function showDecider(): void {
  const rival = contenderRacer();
  const table = standings();
  const me = table.find((r) => r.isPlayer)!;
  const gap = rival ? me.points - rival.points : 0;
  const where = season!.division.rounds[season!.division.rounds.length - 1];

  DECIDER.scene = gap === 0
    ? `${where}. You and ${rival?.name ?? "your rival"} are level on points with one race left. Whoever finishes ahead is champion.`
    : gap > 0
      ? `${where}. You lead ${rival?.name ?? "your rival"} by ${gap} points with one race to go. Finish near him and it's yours.`
      : `${where}. You're ${Math.abs(gap)} points behind ${rival?.name ?? "your rival"} with one race left. You need to beat him, and you need help.`;

  deciderShown = true;
  renderDecision(DECIDER);
  // the decider resolves back into the season, not into the next one
  $("#decContinue").textContent = "Go racing";
  $("#decContinue").dataset.decider = "1";
}

function applyDeciderChoice(label: string): void {
  const m = DECIDER_MODS[label];
  if (!m) return;
  raceMods.pace = m.pace;
  raceMods.dnf = m.dnf;
  raceMods.rivalDnf = m.rivalDnf;
}
