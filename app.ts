/* =========================================================
   Swami Formula — Build your own F1 career
   Landing → driver creator → grid card
   ========================================================= */

type Mode = "intense" | "normal" | "express";
type Setup = "oversteer" | "understeer";
type ScreenName = "mode" | "identity" | "card";

interface Country { code: string; name: string; flag: string }
interface Livery { id: string; name: string; base: string; shade: string; accent: string; trim: string }

interface Attributes {
  qualifying: number; racecraft: number; tyres: number;
  wet: number; feedback: number; consistency: number;
}

interface Trait {
  id: string; label: string; full: string; blurb: string;
  x: number; y: number; corner: string;
  mods: Partial<Attributes>;
}

interface ModeDef { id: Mode; name: string; cadence: string; blurb: string; sector: string; seasons: string }

/* --------------------------- data --------------------------- */

const MODES: ModeDef[] = [
  { id: "intense", name: "Intense", cadence: "1 decision per season", seasons: "~18 decisions", sector: "01",
    blurb: "Every season turns on a choice. The long way round, and the most detail." },
  { id: "normal", name: "Normal", cadence: "1 decision every 2 seasons", seasons: "~9 decisions", sector: "02",
    blurb: "Room to let results build between the moments that matter." },
  { id: "express", name: "Express", cadence: "1 decision every 3 seasons", seasons: "~6 decisions", sector: "03",
    blurb: "A full career in one sitting. Only the crossroads." },
];

const LIVERIES: Livery[] = [
  { id: "spa",        name: "Spa",        base: "#15181C", shade: "#0A0C0E", accent: "#C724F5", trim: "#F2F0EA" },
  { id: "monza",      name: "Monza",      base: "#D8262C", shade: "#8E1418", accent: "#F2F0EA", trim: "#FFFFFF" },
  { id: "interlagos", name: "Interlagos", base: "#0B7A3B", shade: "#054C24", accent: "#FFD400", trim: "#FFFFFF" },
  { id: "suzuka",     name: "Suzuka",     base: "#EFEDE6", shade: "#B9B6AC", accent: "#D8262C", trim: "#101214" },
  { id: "montreal",   name: "Montréal",   base: "#1B4FD8", shade: "#0E2E86", accent: "#00E676", trim: "#FFFFFF" },
  { id: "jeddah",     name: "Jeddah",     base: "#E56A1C", shade: "#9A430D", accent: "#101214", trim: "#FFFFFF" },
];

const BASE_ATTRS: Attributes = {
  qualifying: 52, racecraft: 52, tyres: 52, wet: 52, feedback: 52, consistency: 52,
};

const ATTR_LABELS: Array<[keyof Attributes, string]> = [
  ["qualifying", "Qualifying"], ["racecraft", "Racecraft"], ["tyres", "Tyre management"],
  ["wet", "Wet weather"], ["feedback", "Technical feedback"], ["consistency", "Consistency"],
];

const TRAITS: Trait[] = [
  { id: "qualifier", label: "QLF", full: "Qualifier", corner: "T1",
    blurb: "One lap, everything on it. You start further up than the car deserves.",
    x: 104, y: 62, mods: { qualifying: 22, consistency: -6, tyres: -4 } },
  { id: "starter", label: "LCH", full: "Launch specialist", corner: "T3",
    blurb: "Lights out and you're already two places better off.",
    x: 214, y: 44, mods: { racecraft: 14, qualifying: 6, feedback: -4 } },
  { id: "overtaker", label: "OVT", full: "Overtaker", corner: "T5",
    blurb: "You go for gaps that close. Usually in time.",
    x: 330, y: 64, mods: { racecraft: 20, consistency: -8, tyres: -4 } },
  { id: "defender", label: "DEF", full: "Defender", corner: "T7",
    blurb: "Nobody comes past. Not cleanly, not for twenty laps.",
    x: 402, y: 134, mods: { racecraft: 14, consistency: 8, qualifying: -6 } },
  { id: "tyres", label: "TYR", full: "Tyre manager", corner: "T9",
    blurb: "Your rubber lasts ten laps longer than it should. Strategists love you.",
    x: 336, y: 206, mods: { tyres: 22, qualifying: -8, racecraft: 2 } },
  { id: "wet", label: "WET", full: "Wet-weather master", corner: "T11",
    blurb: "Rain flattens the grid and you climb straight over it.",
    x: 214, y: 228, mods: { wet: 26, consistency: -4, qualifying: 4 } },
  { id: "feedback", label: "ENG", full: "Engineer's driver", corner: "T13",
    blurb: "Your debriefs develop the car. Upgrades land because you called them.",
    x: 100, y: 202, mods: { feedback: 24, tyres: 6, racecraft: -6 } },
  { id: "consistency", label: "CNS", full: "Metronome", corner: "T15",
    blurb: "No mistakes, no drama. The points pile up while others crash.",
    x: 40, y: 132, mods: { consistency: 24, racecraft: -4, qualifying: -2 } },
];

const COUNTRIES: Country[] = [
  { code: "AR", name: "Argentina", flag: "🇦🇷" }, { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "AT", name: "Austria", flag: "🇦🇹" }, { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "BE", name: "Belgium", flag: "🇧🇪" }, { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "BG", name: "Bulgaria", flag: "🇧🇬" }, { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "CL", name: "Chile", flag: "🇨🇱" }, { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" }, { code: "HR", name: "Croatia", flag: "🇭🇷" },
  { code: "CZ", name: "Czechia", flag: "🇨🇿" }, { code: "DK", name: "Denmark", flag: "🇩🇰" },
  { code: "EE", name: "Estonia", flag: "🇪🇪" }, { code: "FI", name: "Finland", flag: "🇫🇮" },
  { code: "FR", name: "France", flag: "🇫🇷" }, { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "GR", name: "Greece", flag: "🇬🇷" }, { code: "HU", name: "Hungary", flag: "🇭🇺" },
  { code: "IS", name: "Iceland", flag: "🇮🇸" }, { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" }, { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "IL", name: "Israel", flag: "🇮🇱" }, { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "JP", name: "Japan", flag: "🇯🇵" }, { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "LV", name: "Latvia", flag: "🇱🇻" }, { code: "LT", name: "Lithuania", flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", flag: "🇱🇺" }, { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" }, { code: "MC", name: "Monaco", flag: "🇲🇨" },
  { code: "MA", name: "Morocco", flag: "🇲🇦" }, { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" }, { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "NO", name: "Norway", flag: "🇳🇴" }, { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "PE", name: "Peru", flag: "🇵🇪" }, { code: "PH", name: "Philippines", flag: "🇵🇭" },
  { code: "PL", name: "Poland", flag: "🇵🇱" }, { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" }, { code: "RO", name: "Romania", flag: "🇷🇴" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" }, { code: "RS", name: "Serbia", flag: "🇷🇸" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" }, { code: "SK", name: "Slovakia", flag: "🇸🇰" },
  { code: "SI", name: "Slovenia", flag: "🇸🇮" }, { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" }, { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "SE", name: "Sweden", flag: "🇸🇪" }, { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "TH", name: "Thailand", flag: "🇹🇭" }, { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "UA", name: "Ukraine", flag: "🇺🇦" }, { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" }, { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "UY", name: "Uruguay", flag: "🇺🇾" }, { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

/* --------------------------- state --------------------------- */

interface Driver {
  surname: string; number: number; country: Country | null; trait: Trait | null;
  setup: Setup; livery: Livery; mode: Mode | null;
}

const driver: Driver = {
  surname: "", number: 10, country: null, trait: null,
  setup: "oversteer", livery: LIVERIES[0], mode: null,
};

/* --------------------------- helpers --------------------------- */

const $ = <T extends HTMLElement>(sel: string): T => document.querySelector(sel) as T;
const $$ = <T extends HTMLElement>(sel: string): T[] => Array.from(document.querySelectorAll(sel));
const clamp = (n: number, lo: number, hi: number): number => Math.max(lo, Math.min(hi, n));

function show(name: ScreenName): void {
  $$<HTMLElement>(".screen").forEach((el) => {
    const on = el.dataset.screen === name;
    el.hidden = !on;
    if (on) { el.classList.remove("is-in"); void el.offsetWidth; el.classList.add("is-in"); }
  });
  const order: ScreenName[] = ["mode", "identity", "card"];
  const idx = order.indexOf(name);
  $$<HTMLElement>(".step").forEach((s, i) => {
    s.dataset.state = i < idx ? "done" : i === idx ? "now" : "todo";
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function computeAttrs(): Attributes {
  const a: Attributes = { ...BASE_ATTRS };
  if (driver.trait) {
    (Object.keys(driver.trait.mods) as Array<keyof Attributes>).forEach((k) => {
      a[k] = clamp(a[k] + (driver.trait!.mods[k] ?? 0), 5, 99);
    });
  }
  if (driver.setup === "oversteer") { a.qualifying += 4; a.consistency -= 3; a.tyres -= 2; }
  else { a.consistency += 4; a.tyres += 3; a.qualifying -= 3; }
  (Object.keys(a) as Array<keyof Attributes>).forEach((k) => { a[k] = clamp(a[k], 5, 99); });
  return a;
}

/* --------------------------- screen 1: modes --------------------------- */

function selectMode(id: Mode): void {
  driver.mode = id;
  const m = MODES.find((x) => x.id === id)!;
  $$("[data-mode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === id)));
  $("#modeDesc").textContent = `${m.blurb} ${m.seasons} across a career.`;
}

function buildModes(): void {
  const wrap = $("#modePills");
  wrap.innerHTML = MODES.map((m) => `
    <button class="pill" type="button" data-mode="${m.id}" aria-pressed="false">
      <b>${m.name}</b><small>${m.cadence}</small>
    </button>`).join("");

  wrap.querySelectorAll<HTMLButtonElement>(".pill").forEach((btn) => {
    btn.addEventListener("click", () => selectMode(btn.dataset.mode as Mode));
  });

  selectMode("normal");
}

/* --------------------------- helmet --------------------------- */

function paintHelmet(): void {
  const { base, shade, accent, trim } = driver.livery;
  $("#lvBase").setAttribute("stop-color", base);
  $("#lvShade").setAttribute("stop-color", shade);
  $$<HTMLElement>(".hl-accent").forEach((el) => el.setAttribute("fill", accent));
  const num = $("#helmetNumber");
  num.setAttribute("fill", trim);
  num.textContent = Number.isNaN(driver.number) ? "—" : String(driver.number);
  const name = $("#helmetName");
  name.setAttribute("fill", trim);
  name.textContent = (driver.surname || "surname").toUpperCase().slice(0, 12);

  const stage = $("#helmetStage");
  stage.classList.remove("is-swap"); void stage.offsetWidth; stage.classList.add("is-swap");
}

function buildLiveries(): void {
  const wrap = $("#liveryRow");
  wrap.innerHTML = LIVERIES.map((l) => `
    <button class="swatch" type="button" data-livery="${l.id}" aria-label="${l.name} livery"
      aria-pressed="${l.id === driver.livery.id}">
      <span class="swatch__chip"><i style="background:${l.base}"></i><i style="background:${l.accent}"></i></span>
      <span class="swatch__name">${l.name}</span>
    </button>`).join("");

  wrap.querySelectorAll<HTMLButtonElement>(".swatch").forEach((btn) => {
    btn.addEventListener("click", () => {
      driver.livery = LIVERIES.find((l) => l.id === btn.dataset.livery)!;
      wrap.querySelectorAll(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      paintHelmet();
    });
  });
}

/* --------------------------- nationality --------------------------- */

function renderCountries(filter = ""): void {
  const q = filter.trim().toLowerCase();
  const list = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
  const grid = $("#countryGrid");

  if (list.length === 0) {
    grid.innerHTML = `<p class="empty">Nothing matches “${filter}”. Try fewer letters.</p>`;
    return;
  }

  grid.innerHTML = list.map((c) => `
    <button class="country" type="button" data-code="${c.code}" aria-pressed="${driver.country?.code === c.code}">
      <span class="country__flag">${c.flag}</span><span class="country__name">${c.name}</span>
      <span class="country__code">${c.code}</span>
    </button>`).join("");

  grid.querySelectorAll<HTMLButtonElement>(".country").forEach((btn) => {
    btn.addEventListener("click", () => {
      driver.country = COUNTRIES.find((c) => c.code === btn.dataset.code)!;
      grid.querySelectorAll(".country").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const chip = $("#natChip");
      chip.innerHTML = `<span>${driver.country.flag}</span>${driver.country.name}`;
      chip.hidden = false;
      validate();
    });
  });
}

/* --------------------------- circuit traits --------------------------- */

function buildTraits(): void {
  const layer = $("#traitLayer");
  layer.innerHTML = TRAITS.map((t) => `
    <g class="node" data-trait="${t.id}" tabindex="0" role="button" aria-label="${t.full}"
       aria-pressed="false" transform="translate(${t.x},${t.y})">
      <rect class="node__halo" x="-32" y="-19" width="64" height="38" rx="19"></rect>
      <rect class="node__box" x="-27" y="-15" width="54" height="30" rx="15"></rect>
      <text x="0" y="5" text-anchor="middle">${t.label}</text>
    </g>`).join("");

  const pick = (id: string): void => {
    driver.trait = TRAITS.find((t) => t.id === id)!;
    layer.querySelectorAll<SVGGElement>(".node").forEach((n) =>
      n.setAttribute("aria-pressed", String(n.dataset.trait === id)));
    $("#traitCorner").textContent = driver.trait.corner;
    $("#traitName").textContent = driver.trait.full;
    $("#traitBlurb").textContent = driver.trait.blurb;
    $("#traitRead").classList.add("is-set");
    renderTraitDelta();
    validate();
  };

  layer.querySelectorAll<SVGGElement>(".node").forEach((node) => {
    node.addEventListener("click", () => pick(node.dataset.trait!));
    node.addEventListener("keydown", (e) => {
      const ev = e as KeyboardEvent;
      if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); pick(node.dataset.trait!); }
    });
  });
}

function renderTraitDelta(): void {
  if (!driver.trait) return;
  const mods = driver.trait.mods;
  const parts = (Object.keys(mods) as Array<keyof Attributes>).map((k) => {
    const v = mods[k] ?? 0;
    const label = ATTR_LABELS.find(([key]) => key === k)![1];
    return `<span class="delta ${v > 0 ? "up" : "down"}">${v > 0 ? "+" : ""}${v} ${label}</span>`;
  });
  $("#traitDelta").innerHTML = parts.join("");
}

/* --------------------------- validation --------------------------- */

function numberError(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 99) return "Pick a number from 1 to 99.";
  return null;
}

function validate(): boolean {
  const nameOk = driver.surname.trim().length >= 2;
  const numErr = numberError(driver.number);
  const ok = nameOk && !numErr && !!driver.country && !!driver.trait;

  const note = $("#numberNote");
  note.textContent = numErr ?? "";
  note.hidden = !numErr;
  $("#number").classList.toggle("is-bad", !!numErr);

  const missing: string[] = [];
  if (!nameOk) missing.push("surname");
  if (numErr) missing.push("number");
  if (!driver.country) missing.push("nationality");
  if (!driver.trait) missing.push("trait");

  $<HTMLButtonElement>("#confirm").disabled = !ok;
  $("#confirmNote").innerHTML = ok
    ? `<i class="dot dot--go"></i>Ready to go racing`
    : `<i class="dot"></i>Still needed: ${missing.join(", ")}`;

  return ok;
}

/* --------------------------- driver card --------------------------- */

function buildCard(): void {
  const mode = MODES.find((m) => m.id === driver.mode)!;
  const c = driver.country!, t = driver.trait!, a = computeAttrs();

  $("#cardNumber").textContent = String(driver.number);
  $("#cardName").textContent = driver.surname.toUpperCase();
  $("#cardFlag").textContent = c.flag;
  $("#cardCountry").textContent = c.name;
  $("#cardTraitTag").textContent = t.full;

  const art = $("#cardArt");
  art.style.setProperty("--card-base", driver.livery.base);
  art.style.setProperty("--card-shade", driver.livery.shade);
  art.style.setProperty("--card-accent", driver.livery.accent);
  art.style.setProperty("--card-trim", driver.livery.trim);

  $("#bars").innerHTML = ATTR_LABELS.map(([key, label]) => `
    <div class="bar">
      <span class="bar__label">${label}</span>
      <span class="bar__track"><i style="width:0%" data-w="${a[key]}"></i></span>
      <span class="bar__val">${a[key]}</span>
    </div>`).join("");

  requestAnimationFrame(() => {
    $$<HTMLElement>(".bar__track i").forEach((el, i) => {
      setTimeout(() => { el.style.width = `${el.dataset.w}%`; }, 60 * i);
    });
  });

  $("#cardSetup").textContent = driver.setup === "oversteer" ? "Loose rear · oversteer" : "Stable front · understeer";
  $("#cardLivery").textContent = driver.livery.name;
  $("#cardMode").textContent = `${mode.name} — ${mode.cadence.toLowerCase()}`;
  $("#cardTraitBlurb").textContent = t.blurb;
}

/* --------------------------- theme --------------------------- */

type Theme = "dark" | "light";
const THEME_KEY = "swami-theme";

function applyTheme(t: Theme): void {
  document.documentElement.dataset.theme = t;
  $("#thDark").classList.toggle("on", t === "dark");
  $("#thLight").classList.toggle("on", t === "light");
  $("#themeToggle").setAttribute("aria-label",
    t === "dark" ? "Switch to light mode" : "Switch to dark mode");
  try { localStorage.setItem(THEME_KEY, t); } catch { /* file:// or private mode */ }
}

function initTheme(): void {
  let saved: string | null = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch { /* ignore */ }
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  applyTheme((saved as Theme) ?? (prefersLight ? "light" : "dark"));

  $("#themeToggle").addEventListener("click", () => {
    applyTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
  });
}

/* --------------------------- init --------------------------- */

function init(): void {
  initTheme();
  buildModes(); buildLiveries(); renderCountries(); buildTraits(); paintHelmet(); validate();

  $<HTMLInputElement>("#surname").addEventListener("input", (e) => {
    driver.surname = (e.target as HTMLInputElement).value;
    paintHelmet(); validate();
  });

  const numInput = $<HTMLInputElement>("#number");
  const setNumber = (n: number): void => {
    driver.number = n;
    numInput.value = Number.isNaN(n) ? "" : String(n);
    paintHelmet(); validate();
  };
  numInput.addEventListener("input", () => {
    // hard cap: strip anything non-numeric and refuse a third digit / zero
    const digits = numInput.value.replace(/\D/g, "").slice(0, 2);
    const n = parseInt(digits, 10);
    const capped = Number.isNaN(n) ? "" : String(clamp(n, 0, 99));
    if (numInput.value !== capped) numInput.value = capped;
    driver.number = capped === "" ? NaN : parseInt(capped, 10);
    paintHelmet(); validate();
  });
  numInput.addEventListener("blur", () => {
    if (Number.isNaN(driver.number) || driver.number < 1) setNumber(1);
  });
  $("#numUp").addEventListener("click", () => setNumber(clamp((driver.number || 0) + 1, 1, 99)));
  $("#numDown").addEventListener("click", () => setNumber(clamp((driver.number || 2) - 1, 1, 99)));

  $<HTMLInputElement>("#search").addEventListener("input", (e) => {
    renderCountries((e.target as HTMLInputElement).value);
  });

  $$<HTMLButtonElement>("[data-setup]").forEach((btn) => {
    btn.addEventListener("click", () => {
      driver.setup = btn.dataset.setup as Setup;
      $$("[data-setup]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
    });
  });

  $("#startCareer").addEventListener("click", () => show("identity"));
  $("#back").addEventListener("click", () => show("mode"));
  $("#restart").addEventListener("click", () => show("identity"));
  $("#confirm").addEventListener("click", () => {
    if (!validate()) return;
    buildCard(); show("card");
  });
}

document.addEventListener("DOMContentLoaded", init);
