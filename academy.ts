/* =========================================================
   ACADEMY, three offers, one seat
   Generated from the career seed, so a driver always gets
   the same three doors to choose between.
   ========================================================= */

interface Clause { id: string; label: string; detail: string }

interface Perk {
  label: string;
  detail: string;
  mods: Partial<Attributes>;   // some of these take away as well as give
}

/** Development support a team can actually offer. Not all of it is free. */
const PERKS: Perk[] = [
  { label: "Race engineer of their own", detail: "A dedicated engineer who has done this before.",
    mods: { feedback: 8, consistency: 3 } },
  { label: "Qualifying programme", detail: "Low-fuel running every Friday, at the cost of race preparation.",
    mods: { qualifying: 9, tyres: -4 } },
  { label: "Long-run focus", detail: "Every Friday spent on race pace. Saturdays suffer.",
    mods: { tyres: 9, consistency: 4, qualifying: -5 } },
  { label: "Wet running", detail: "They will send you out in anything.",
    mods: { wet: 12, consistency: -2 } },
  { label: "Simulator access", detail: "Unlimited rig time, and the travel that comes with it.",
    mods: { feedback: 6, racecraft: 3, consistency: -2 } },
  { label: "Racecraft coaching", detail: "A former driver in your ear about wheel-to-wheel work.",
    mods: { racecraft: 8, tyres: -2 } },
  { label: "Data from the lead car", detail: "You see everything your team-mate does. He sees everything you do.",
    mods: { racecraft: 4, qualifying: 4, feedback: -3 } },
  { label: "Physio and conditioning", detail: "A programme built around you finishing races strongly.",
    mods: { consistency: 8, tyres: 3 } },
  { label: "Aggressive setup philosophy", detail: "They build the car on the edge and expect you to hold it.",
    mods: { qualifying: 7, racecraft: 4, consistency: -5 } },
  { label: "Conservative setup philosophy", detail: "Nothing exciting, nothing broken.",
    mods: { consistency: 6, tyres: 5, qualifying: -4 } },
  { label: "Development driver duties", detail: "You test their new parts, which is time you don't spend racing.",
    mods: { feedback: 10, racecraft: -4 } },
  { label: "Left to get on with it", detail: "No programme, no interference, no help.",
    mods: {} },
];

interface Seat {
  years: number;
  clause: Clause;
  id: string;
  name: string;
  archetype: "works" | "midfield" | "family";
  car: number;                 // machinery quality, 40–95
  philosophy: Setup;           // the car's natural balance
  perk: Perk | null;
  mateEdge: number;            // how much stronger the team-mate is
  expectation: string;
  flavour: string;
}

const ACADEMY_POOL = [
  "Rosso Kart", "Vanguard", "Nordic Racing", "Aeris", "Prima Corse", "Halcyon",
  "Meridian", "Blackline", "Onyx Motorsport", "Ferrata", "Sable", "Argent",
];

let seatOffers: Seat[] = [];

/** Same three archetypes, told in the language of the division you're in. */
const CLAUSES: Clause[] = [
  { id: "performance", label: "Performance clause", detail: "Finish in the bottom half and they can release you at any point." },
  { id: "pay", label: "Funding clause", detail: "You bring a third of the budget. Miss a payment and the seat goes." },
  { id: "loan", label: "Loan clause", detail: "They can place you at another team mid-season without asking." },
  { id: "option", label: "Team option", detail: "They decide whether you stay. You don't." },
  { id: "release", label: "Release clause", detail: "A bigger team can buy you out cheaply. That cuts both ways." },
  { id: "clean", label: "No unusual terms", detail: "A plain contract. Rare, and worth something." },
  { id: "results", label: "Results trigger", detail: "Beat your team-mate over the year and the next season is automatically yours." },
  { id: "buyout", label: "Buy-out clause", detail: "Any team can take you for a fixed fee. You don't get asked first." },
  { id: "media", label: "Media obligation", detail: "Forty appearance days a year, and they choose the dates." },
  { id: "testing", label: "Testing commitment", detail: "Every test day is yours, whether you want it or not." },
  { id: "veto", label: "Team-mate veto", detail: "They can put anyone they like in the other car, including someone quicker." },
  { id: "no-1", label: "Number two by contract", detail: "If the other car is fighting for something, you move over." },
  { id: "wage-cut", label: "Deferred terms", detail: "You take less now. If they score, you are paid properly later." },
  { id: "loyalty", label: "Loyalty term", detail: "Leave early and you cannot race against them for a season." },
];

function seatFlavour(kind: "works" | "midfield" | "family"): string {
  const junior = typeof tier !== "undefined" && tier <= 3;
  const car = junior ? (tier === 0 ? "kart" : "car") : "car";
  return {
    works: `The strongest ${car} on the grid, and a team-mate who has been winning in it for two years. There is a queue of drivers behind you.`,
    midfield: `A serious outfit that races hard and expects the same from you. Nobody's favourite. Nobody's whipping boy either.`,
    family: `A small team that builds everything around one driver. The ${car} is slow and they will change it to whatever you ask for.`,
  }[kind];
}
let currentSeat: Seat | null = null;

function makeSeats(): Seat[] {
  const div = typeof currentDivision === "function" ? currentDivision() : null;
  const lo = div ? div.carBand[0] : 44;
  const hi = div ? div.carBand[1] : 70;
  const at = (f: number): number => lo + (hi - lo) * f + rng() * 4;
  const pool = typeof teamPool === "function" ? teamPool(tier) : [...ACADEMY_POOL];
  const pick = (): string => pool.splice(Math.floor(rng() * pool.length), 1)[0];
  const phil = (): Setup => (rng() < 0.5 ? "oversteer" : "understeer");

  const blank: Pick<Seat, "years" | "clause"> = { years: 1, clause: CLAUSES[5] };
  const offers: Seat[] = [
    {
      id: "works", name: pick(), archetype: "works", ...blank,
      car: at(0.92), philosophy: phil(), perk: null, mateEdge: 7,
      expectation: "Podiums, or they find someone else",
      flavour: seatFlavour("works"),
    },
    {
      id: "midfield", name: pick(), archetype: "midfield", ...blank,
      car: at(0.55), philosophy: phil(),
      perk: null, mateEdge: 1,
      expectation: "Points, and beat the other car",
      flavour: seatFlavour("midfield"),
    },
    {
      id: "family", name: pick(), archetype: "family", ...blank,
      car: at(0.2), philosophy: phil(),
      perk: null, mateEdge: -6,
      expectation: "Learn, and tell them what the car needs",
      flavour: seatFlavour("family"),
    },
  ];

  offers.forEach((o) => {
    // a works programme is less likely to build anything around you
    o.perk = (o.archetype === "works" && rng() < 0.45)
      ? PERKS[PERKS.length - 1]
      : PERKS[Math.floor(rng() * (PERKS.length - 1))];

    o.years = o.archetype === "works" ? 1 + Math.floor(rng() * 2) : 2 + Math.floor(rng() * 2);

    // the better the seat, the more likely it comes with strings
    const clausePool = o.archetype === "works" ? CLAUSES.slice(0, 8)
      : o.archetype === "midfield" ? CLAUSES.slice(0, 11)
      : CLAUSES.slice(4);
    o.clause = clausePool[Math.floor(rng() * clausePool.length)];
  });

  // one seat always suits your balance, one always fights it, the third is luck
  const suits = Math.floor(rng() * 3);
  const fights = (suits + 1 + Math.floor(rng() * 2)) % 3;
  offers[suits].philosophy = driver.setup;
  offers[fights].philosophy = driver.setup === "oversteer" ? "understeer" : "oversteer";
  return offers;
}

/** Machinery the player actually gets, once balance compatibility is applied. */
/** The give and take of a perk, as chips. */
function perkMods(p: Perk): string {
  return (Object.keys(p.mods) as Array<keyof Attributes>).map((k) => {
    const v = p.mods[k] ?? 0;
    const label = ATTR_LABELS.find(([key]) => key === k)![1];
    return `<em class="${v > 0 ? "up" : "down"}">${v > 0 ? "+" : ""}${v} ${label}</em>`;
  }).join("");
}

function academyCar(a: Seat): number {
  return a.car + (a.philosophy === driver.setup ? 4 : -3);
}

/* --------------------------- overall rating --------------------------- */

/** One number for the whole driver. Weighted, qualifying and racecraft win races. */
function overall(): number {
  const a = computeAttrs();
  const raw =
    a.qualifying * 0.22 + a.racecraft * 0.24 + a.tyres * 0.16 +
    a.wet * 0.10 + a.feedback * 0.12 + a.consistency * 0.16;
  const bonus = typeof carBonus !== "undefined" ? carBonus : 0;
  const machinery = currentSeat ? (academyCar(currentSeat) + bonus - 58) * 0.18 : 0;
  return Math.round(clamp(raw + machinery, 1, 99));
}

function ovrBand(n: number): string {
  if (n >= 78) return "Exceptional";
  if (n >= 70) return "Strong";
  if (n >= 62) return "Promising";
  if (n >= 54) return "Raw";
  return "Unproven";
}

/* --------------------------- screen --------------------------- */

function renderAcademies(): void {
  seatOffers = makeSeats();
  currentSeat = null;

  const bar = (v: number): string => {
    const pct = clamp((v - 40) / 45 * 100, 4, 100);
    return `<span class="ac-bar"><i style="width:${pct}%"></i></span>`;
  };

  $("#academyList").innerHTML = seatOffers.map((a) => {
    const fits = a.philosophy === driver.setup;
    return `
    <button class="academy" type="button" data-academy="${a.id}" aria-pressed="false">
      <span class="academy__top">
        <span class="academy__name">${a.name}</span>
        ${fits ? '<span class="academy__fit">Suits your balance</span>'
               : '<span class="academy__misfit">Fights your balance</span>'}
      </span>
      <span class="academy__flavour">${a.flavour}</span>
      <span class="academy__row"><em>Machinery</em>${bar(a.car)}</span>
      <span class="academy__row"><em>Car balance</em><b>${a.philosophy === "oversteer" ? "Loose rear" : "Stable front"}</b></span>
      <span class="academy__row"><em>Team-mate</em><b>${a.mateEdge > 4 ? "Established winner" : a.mateEdge > 0 ? "Evenly matched" : "Beatable"}</b></span>
      <span class="academy__row"><em>Contract</em><b>${a.years} season${a.years > 1 ? "s" : ""}</b></span>
      <span class="academy__clause" title="${a.clause.detail}"><b>${a.clause.label}</b><small>${a.clause.detail}</small></span>
      ${a.perk ? `<span class="academy__perk">${a.perk.label}</span>` : '<span class="academy__perk academy__perk--none">No development support</span>'}
      <span class="academy__exp">${a.expectation}</span>
    </button>`;
  }).join("");

  const cards = Array.from($("#academyList").querySelectorAll<HTMLButtonElement>(".academy"));
  cards.forEach((btn) => {
    btn.addEventListener("click", () => {
      currentSeat = seatOffers.find((a) => a.id === btn.dataset.academy)!;
      cards.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      $<HTMLButtonElement>("#confirmAcademy").disabled = false;
      $("#academyNote").innerHTML =
        `<i class="dot dot--go"></i>${currentSeat.name} · overall now ${overall()}`;
      renderOverall();
    });
  });

  $<HTMLButtonElement>("#confirmAcademy").disabled = true;
  $("#academyNote").innerHTML = `<i class="dot"></i>Pick a seat. You can't change it this season.`;
}

/** Paints the OVR badge wherever it appears. */
function renderOverall(): void {
  const n = overall();
  $$<HTMLElement>(".ovr-value").forEach((el) => { el.textContent = String(n); });
  $$<HTMLElement>(".ovr-band").forEach((el) => { el.textContent = ovrBand(n); });
  const ring = document.querySelector<SVGCircleElement>("#ovrRing");
  if (ring) {
    const c = 2 * Math.PI * 26;
    ring.style.strokeDasharray = String(c);
    ring.style.strokeDashoffset = String(c - (n / 99) * c);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  $("#toAcademy").addEventListener("click", () => { renderAcademies(); show("academy"); });
  $("#academyBack").addEventListener("click", () => show("card"));
  $("#confirmAcademy").addEventListener("click", () => {
    if (!currentSeat) return;
    if (!slotId) slotId = `d${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
    contractLeft = currentSeat.years;
    pendingYear = typeof pendingYear !== "undefined" ? pendingYear : 1;
    showBriefing(pendingYear);
  });
});
