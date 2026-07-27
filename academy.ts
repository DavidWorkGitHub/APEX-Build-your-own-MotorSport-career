/* =========================================================
   ACADEMY — three offers, one seat
   Generated from the career seed, so a driver always gets
   the same three doors to choose between.
   ========================================================= */

interface Academy {
  id: string;
  name: string;
  archetype: "works" | "midfield" | "family";
  car: number;                 // machinery quality, 40–95
  philosophy: Setup;           // the car's natural balance
  perk: { key: keyof Attributes; value: number; label: string } | null;
  mateEdge: number;            // how much stronger the team-mate is
  expectation: string;
  flavour: string;
}

const ACADEMY_POOL = [
  "Rosso Kart", "Vanguard", "Nordic Racing", "Aeris", "Prima Corse", "Halcyon",
  "Meridian", "Blackline", "Onyx Motorsport", "Ferrata", "Sable", "Argent",
];

let academies: Academy[] = [];
let chosenAcademy: Academy | null = null;

function makeAcademies(): Academy[] {
  const pool = [...ACADEMY_POOL];
  const pick = (): string => pool.splice(Math.floor(rng() * pool.length), 1)[0];
  const phil = (): Setup => (rng() < 0.5 ? "oversteer" : "understeer");

  const offers: Academy[] = [
    {
      id: "works", name: pick(), archetype: "works",
      car: 68 + rng() * 6, philosophy: phil(), perk: null, mateEdge: 7,
      expectation: "Podiums, or they find someone else",
      flavour: "A works programme with a queue of drivers behind you. The best kart on the grid, and a team-mate who has been winning in it for two years.",
    },
    {
      id: "midfield", name: pick(), archetype: "midfield",
      car: 57 + rng() * 6, philosophy: phil(),
      perk: { key: "racecraft", value: 5, label: "+5 Racecraft" }, mateEdge: 1,
      expectation: "Points, and beat the other car",
      flavour: "A serious midfield outfit that races hard and expects you to do the same. Nobody's favourite. Nobody's whipping boy either.",
    },
    {
      id: "family", name: pick(), archetype: "family",
      car: 52 + rng() * 6, philosophy: phil(),
      perk: { key: "feedback", value: 9, label: "+9 Technical feedback" }, mateEdge: -6,
      expectation: "Learn, and tell them what the kart needs",
      flavour: "A family-run team that builds everything around one driver. The kart is slow and they will change it to whatever you ask for.",
    },
  ];

  // one seat always suits your balance, one always fights it — the third is luck
  const suits = Math.floor(rng() * 3);
  const fights = (suits + 1 + Math.floor(rng() * 2)) % 3;
  offers[suits].philosophy = driver.setup;
  offers[fights].philosophy = driver.setup === "oversteer" ? "understeer" : "oversteer";
  return offers;
}

/** Machinery the player actually gets, once balance compatibility is applied. */
function academyCar(a: Academy): number {
  return a.car + (a.philosophy === driver.setup ? 4 : -3);
}

/* --------------------------- overall rating --------------------------- */

/** One number for the whole driver. Weighted — qualifying and racecraft win races. */
function overall(): number {
  const a = computeAttrs();
  const raw =
    a.qualifying * 0.22 + a.racecraft * 0.24 + a.tyres * 0.16 +
    a.wet * 0.10 + a.feedback * 0.12 + a.consistency * 0.16;
  const machinery = chosenAcademy ? (academyCar(chosenAcademy) - 58) * 0.18 : 0;
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
  academies = makeAcademies();
  chosenAcademy = null;

  const bar = (v: number): string => {
    const pct = clamp((v - 40) / 45 * 100, 4, 100);
    return `<span class="ac-bar"><i style="width:${pct}%"></i></span>`;
  };

  $("#academyList").innerHTML = academies.map((a) => {
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
      ${a.perk ? `<span class="academy__perk">${a.perk.label}</span>` : '<span class="academy__perk academy__perk--none">No development support</span>'}
      <span class="academy__exp">${a.expectation}</span>
    </button>`;
  }).join("");

  $$<HTMLButtonElement>(".academy").forEach((btn) => {
    btn.addEventListener("click", () => {
      chosenAcademy = academies.find((a) => a.id === btn.dataset.academy)!;
      $$(".academy").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      $<HTMLButtonElement>("#confirmAcademy").disabled = false;
      $("#academyNote").innerHTML =
        `<i class="dot dot--go"></i>${chosenAcademy.name} · overall now ${overall()}`;
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
  $("#confirmAcademy").addEventListener("click", () => { if (chosenAcademy) startSeason(); });
});
