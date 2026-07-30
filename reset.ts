/* =========================================================
   STARTING OVER
   Everything a career touches lives in module-level state.
   Starting a second driver in the same session has to clear
   all of it, or the new career inherits the old one's
   attributes, cabinet and save slot.
   ========================================================= */

function resetCareer(): void {
  // identity
  driver.surname = "";
  driver.number = 10;
  driver.country = null;
  driver.trait = null;
  driver.setup = "oversteer";
  driver.livery = LIVERIES[0];

  // progress
  tier = 0;
  age = 15;
  yearsInTier = 0;
  contractLeft = 0;
  comebacks = 0;
  carBonus = 0;
  retired = false;
  hallWritten = false;
  lastRoll = null;
  currentSeat = null;
  season = null;
  contender = null;
  deciderShown = false;
  comebackOffer = null;
  lockedOut.clear();

  // development and reputation
  (Object.keys(careerGrowth) as Array<keyof Attributes>).forEach((k) => {
    careerGrowth[k] = 0; earnedGrowth[k] = 0;
  });
  (Object.keys(reputation) as Array<keyof Reputation>).forEach((k) => { reputation[k] = 0; });

  // records
  careerHistory.length = 0;
  decisionLog.length = 0;
  usedDecisions.clear();
  pending = [];
  Object.assign(careerTotals, { seasons: 0, points: 0, wins: 0, podiums: 0, titles: 0, beat: 0, lost: 0 });
  Object.assign(cabinet, {
    titles: [], wins: [], podiums: 0, poles: 0, dnfs: 0, races: 0,
    helmets: [], rivals: [], firsts: [], cursed: [],
  });

  // people
  Object.assign(teamMate, { name: "", skill: 0, years: 0, seasons: 0, beat: 0, lost: 0, relationship: "cordial", team: "" });
  Object.assign(nemesis, { name: "", edge: 0, metIn: 0, beat: 0, lost: 0 });

  // this driver gets their own save slot
  newSlot();

  // reset the creator UI back to a blank driver
  const surname = document.querySelector<HTMLInputElement>("#surname");
  if (surname) surname.value = "";
  const num = document.querySelector<HTMLInputElement>("#number");
  if (num) num.value = "10";
  const chip = document.querySelector<HTMLElement>("#natChip");
  if (chip) chip.hidden = true;
  document.querySelectorAll<HTMLElement>(".country, .node").forEach((el) => el.setAttribute("aria-pressed", "false"));
  const read = document.querySelector<HTMLElement>("#traitRead");
  if (read) read.classList.remove("is-set");
  const traitName = document.querySelector<HTMLElement>("#traitName");
  if (traitName) traitName.textContent = "Choose a trait";
  const delta = document.querySelector<HTMLElement>("#traitDelta");
  if (delta) delta.innerHTML = "";

  if (typeof renderPicks === "function") renderPicks();
  if (typeof validate === "function") validate();
  if (typeof paintHelmet === "function") paintHelmet();
}

document.addEventListener("DOMContentLoaded", () => {
  // the logo goes home
  const brand = document.querySelector<HTMLElement>(".brand");
  if (!brand) return;
  brand.setAttribute("role", "button");
  brand.setAttribute("tabindex", "0");
  brand.setAttribute("aria-label", "Back to the start");
  brand.title = "Back to the start";

  const home = (): void => {
    if (typeof raceTimer !== "undefined") window.clearTimeout(raceTimer);
    if (typeof refreshResumeBadge === "function") refreshResumeBadge();
    show("mode");
  };

  brand.addEventListener("click", home);
  brand.addEventListener("keydown", (e) => {
    const ev = e as KeyboardEvent;
    if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); home(); }
  });

  // starting fresh from the landing page also means a fresh driver
  $("#startCareer").addEventListener("click", () => {
    if (careerHistory.length > 0 || retired || slotId) resetCareer();
  });
});
