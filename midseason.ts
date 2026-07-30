/* =========================================================
   MID-SEASON EVENTS
   Things that happen *during* a season rather than between
   them. Some are luck, some are the garage, and several are
   your team-mate relationship finally costing you something.
   ========================================================= */

interface MidEvent {
  id: string;
  text: string;
  tone: "good" | "bad" | "neutral";
  effect?: Effect;
  /** applied to the rest of this season only */
  carShift?: number;
  when?: () => boolean;
}

const MID_EVENTS: MidEvent[] = [
  /* ---- the garage ---- */
  { id: "upgrade-works", tone: "good", text: "The upgrade package lands and it works. The car is a step quicker from here.",
    carShift: 4 },
  { id: "upgrade-fails", tone: "bad", text: "The upgrade package lands and it is slower than the old floor. Nobody will admit it for six weeks.",
    carShift: -4 },
  { id: "engineer-swap", tone: "neutral", text: "Your race engineer has been moved to the other car. His replacement is younger and talks less.",
    effect: { attrs: { feedback: -3, consistency: 2 } } },
  { id: "reliability-run", tone: "bad", text: "Three failures in four rounds. The team have found the cause and cannot fix it until winter.",
    carShift: -2, effect: { attrs: { consistency: -2 } } },
  { id: "setup-breakthrough", tone: "good", text: "You and your engineer find something in the rear suspension that nobody else has.",
    effect: { attrs: { tyres: 4, feedback: 3 } } },

  /* ---- the team-mate ---- */
  { id: "mate-favoured", tone: "bad", text: "The new parts went to the other car first. They say it is a supply issue. It is the third time.",
    carShift: -3, when: () => teamMate.relationship !== "cordial" },
  { id: "mate-strategy", tone: "bad", text: "You were left out a lap longer than him at two consecutive races. Nobody explains it.",
    effect: { attrs: { tyres: -2, consistency: -2 } }, when: () => teamMate.relationship === "war" },
  { id: "garage-split", tone: "bad", text: "The garage has quietly split in two. Your side is smaller and does not talk to his.",
    effect: { attrs: { feedback: -4, racecraft: 2 } }, when: () => teamMate.relationship === "war" },
  { id: "mate-helps", tone: "good", text: "Your team-mate hands you his data before qualifying, unasked.",
    effect: { attrs: { qualifying: 3, feedback: 3 } }, when: () => teamMate.relationship === "cordial" && teamMate.seasons >= 2 },
  { id: "mate-injured", tone: "neutral", text: "Your team-mate is out for two rounds. The whole team is pointed at your car for the first time.",
    carShift: 3, effect: { attrs: { feedback: 2 } } },

  /* ---- the sport ---- */
  { id: "sacking", tone: "neutral", text: "A driver two teams up has been sacked mid-season. Every manager in the paddock is on the phone to somebody.",
    effect: { rep: { political: 1 } } },
  { id: "rule-clarification", tone: "bad", text: "A technical directive has outlawed the thing your car was best at.",
    carShift: -3 },
  { id: "rival-banned", tone: "good", text: "Your closest rival has a race ban. One weekend, one open door.",
    effect: { attrs: { racecraft: 1 } } },
  { id: "red-flag-win", tone: "good", text: "A red flag at half distance froze the order while you were briefly leading. You will take it.",
    effect: { rep: { fragile: -1 } } },
  { id: "stewards-watching", tone: "bad", text: "The stewards have started reviewing your onboards first. Two penalties in three rounds.",
    effect: { attrs: { racecraft: -2, consistency: -1 } } },
  { id: "paddock-talk", tone: "good", text: "Somebody senior said something complimentary about you on television, and the paddock heard it.",
    effect: { rep: { political: 2 } } },

  /* ---- you ---- */
  { id: "illness", tone: "bad", text: "You race a triple-header with a fever and remember almost none of it.",
    effect: { attrs: { consistency: -3 } } },
  { id: "click", tone: "good", text: "Something clicked at the last round. You cannot explain it and you do not want to look at it too closely.",
    effect: { attrs: { qualifying: 3, racecraft: 3 } } },
  { id: "home-crowd", tone: "good", text: "Your home round sold out on the strength of your name.",
    effect: { rep: { political: 2, loyal: 1 } }, when: () => tier >= 4 },
];

let midFired: string[] = [];
const midUsed = new Set<string>();   // across the career, so you are not told the same thing yearly
let seasonCarShift = 0;

function resetMidSeason(): void { midFired = []; seasonCarShift = 0; }

/** Rolled between rounds. Two a season at most, never in the first two rounds. */
function maybeMidEvent(round: number): MidEvent | null {
  if (!season) return null;
  const rounds = season.division.rounds.length;
  if (round < 3 || round > rounds - 2) return null;
  if (midFired.length >= 2) return null;
  if (rng() > 0.16) return null;

  const fits = (e: MidEvent): boolean => !midFired.includes(e.id) && (!e.when || e.when());
  let pool = MID_EVENTS.filter((e) => fits(e) && !midUsed.has(e.id));
  if (!pool.length) { midUsed.clear(); pool = MID_EVENTS.filter(fits); }
  if (!pool.length) return null;
  const ev = pool[Math.floor(rng() * pool.length)];

  midFired.push(ev.id);
  midUsed.add(ev.id);
  if (ev.effect) applyEffect(ev.effect);
  if (ev.carShift) {
    seasonCarShift += ev.carShift;
    const me = season.field[0];
    me.car = clamp(me.car + ev.carShift, 35, 97);
  }
  return ev;
}

function renderMidEvent(ev: MidEvent): void {
  const body = $("#raceBody");
  const row = document.createElement("div");
  row.className = `mid mid--${ev.tone} is-new`;
  row.innerHTML = `<i></i><span>${ev.text}</span>`;
  body.appendChild(row);
  body.scrollTop = body.scrollHeight;
}
