"use strict";
/* =========================================================
   APEX — Build your own F1 career
   Driver identity creator + run mode selection
   ========================================================= */
/* ---------------------------------------------------------
   Data
   --------------------------------------------------------- */
const MODES = [
    {
        id: "intense",
        name: "Intense",
        cadence: "1 decision per season",
        blurb: "Every season turns on a choice. The long way round, and the most detail.",
        sector: "S1",
    },
    {
        id: "normal",
        name: "Normal",
        cadence: "1 decision every 2 seasons",
        blurb: "Room to let results build between the moments that matter.",
        sector: "S2",
    },
    {
        id: "express",
        name: "Express",
        cadence: "1 decision every 3 seasons",
        blurb: "A full career in one sitting. Only the crossroads.",
        sector: "S3",
    },
];
const LIVERIES = [
    { id: "monza", name: "Monza", base: "#D8262C", accent: "#F2F0EA", trim: "#101214" },
    { id: "spa", name: "Spa", base: "#111417", accent: "#C724F5", trim: "#F2F0EA" },
    { id: "interlagos", name: "Interlagos", base: "#0B7A3B", accent: "#FFD400", trim: "#F2F0EA" },
    { id: "suzuka", name: "Suzuka", base: "#F2F0EA", accent: "#D8262C", trim: "#101214" },
    { id: "montreal", name: "Montréal", base: "#1B4FD8", accent: "#00E676", trim: "#0B0D0F" },
    { id: "jeddah", name: "Jeddah", base: "#E56A1C", accent: "#101214", trim: "#F2F0EA" },
];
/** Positions map onto a stylised circuit: entry, apex, exit. */
const TRAITS = [
    { id: "qualifier", label: "QLF", full: "Qualifier", blurb: "One lap, everything on it. You start further up than the car deserves.", x: 96, y: 60 },
    { id: "starter", label: "LCH", full: "Launch specialist", blurb: "Lights out and you're already two places better off.", x: 210, y: 42 },
    { id: "overtaker", label: "OVT", full: "Overtaker", blurb: "You go for gaps that close. Usually in time.", x: 330, y: 62 },
    { id: "defender", label: "DEF", full: "Defender", blurb: "Nobody comes past. Not cleanly, not for twenty laps.", x: 404, y: 132 },
    { id: "tyres", label: "TYR", full: "Tyre manager", blurb: "Your rubber lasts ten laps longer than it should. Strategists love you.", x: 336, y: 206 },
    { id: "wet", label: "WET", full: "Wet-weather master", blurb: "Rain flattens the grid and you climb straight over it.", x: 214, y: 226 },
    { id: "feedback", label: "ENG", full: "Engineer's driver", blurb: "Your debriefs develop the car. Upgrades land because you called them.", x: 96, y: 200 },
    { id: "consistency", label: "CNS", full: "Metronome", blurb: "No mistakes, no drama. The points pile up while others crash.", x: 40, y: 130 },
];
const RETIRED_NUMBERS = { 17: "retired" };
const COUNTRIES = [
    { code: "AR", name: "Argentina", flag: "🇦🇷" },
    { code: "AU", name: "Australia", flag: "🇦🇺" },
    { code: "AT", name: "Austria", flag: "🇦🇹" },
    { code: "BH", name: "Bahrain", flag: "🇧🇭" },
    { code: "BE", name: "Belgium", flag: "🇧🇪" },
    { code: "BR", name: "Brazil", flag: "🇧🇷" },
    { code: "BG", name: "Bulgaria", flag: "🇧🇬" },
    { code: "CA", name: "Canada", flag: "🇨🇦" },
    { code: "CL", name: "Chile", flag: "🇨🇱" },
    { code: "CN", name: "China", flag: "🇨🇳" },
    { code: "CO", name: "Colombia", flag: "🇨🇴" },
    { code: "HR", name: "Croatia", flag: "🇭🇷" },
    { code: "CZ", name: "Czechia", flag: "🇨🇿" },
    { code: "DK", name: "Denmark", flag: "🇩🇰" },
    { code: "EE", name: "Estonia", flag: "🇪🇪" },
    { code: "FI", name: "Finland", flag: "🇫🇮" },
    { code: "FR", name: "France", flag: "🇫🇷" },
    { code: "DE", name: "Germany", flag: "🇩🇪" },
    { code: "GR", name: "Greece", flag: "🇬🇷" },
    { code: "HK", name: "Hong Kong", flag: "🇭🇰" },
    { code: "HU", name: "Hungary", flag: "🇭🇺" },
    { code: "IS", name: "Iceland", flag: "🇮🇸" },
    { code: "IN", name: "India", flag: "🇮🇳" },
    { code: "ID", name: "Indonesia", flag: "🇮🇩" },
    { code: "IE", name: "Ireland", flag: "🇮🇪" },
    { code: "IL", name: "Israel", flag: "🇮🇱" },
    { code: "IT", name: "Italy", flag: "🇮🇹" },
    { code: "JP", name: "Japan", flag: "🇯🇵" },
    { code: "KZ", name: "Kazakhstan", flag: "🇰🇿" },
    { code: "LV", name: "Latvia", flag: "🇱🇻" },
    { code: "LT", name: "Lithuania", flag: "🇱🇹" },
    { code: "LU", name: "Luxembourg", flag: "🇱🇺" },
    { code: "MY", name: "Malaysia", flag: "🇲🇾" },
    { code: "MX", name: "Mexico", flag: "🇲🇽" },
    { code: "MC", name: "Monaco", flag: "🇲🇨" },
    { code: "MA", name: "Morocco", flag: "🇲🇦" },
    { code: "NL", name: "Netherlands", flag: "🇳🇱" },
    { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
    { code: "NG", name: "Nigeria", flag: "🇳🇬" },
    { code: "NO", name: "Norway", flag: "🇳🇴" },
    { code: "PY", name: "Paraguay", flag: "🇵🇾" },
    { code: "PE", name: "Peru", flag: "🇵🇪" },
    { code: "PH", name: "Philippines", flag: "🇵🇭" },
    { code: "PL", name: "Poland", flag: "🇵🇱" },
    { code: "PT", name: "Portugal", flag: "🇵🇹" },
    { code: "QA", name: "Qatar", flag: "🇶🇦" },
    { code: "RO", name: "Romania", flag: "🇷🇴" },
    { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
    { code: "RS", name: "Serbia", flag: "🇷🇸" },
    { code: "SG", name: "Singapore", flag: "🇸🇬" },
    { code: "SK", name: "Slovakia", flag: "🇸🇰" },
    { code: "SI", name: "Slovenia", flag: "🇸🇮" },
    { code: "ZA", name: "South Africa", flag: "🇿🇦" },
    { code: "KR", name: "South Korea", flag: "🇰🇷" },
    { code: "ES", name: "Spain", flag: "🇪🇸" },
    { code: "SE", name: "Sweden", flag: "🇸🇪" },
    { code: "CH", name: "Switzerland", flag: "🇨🇭" },
    { code: "TH", name: "Thailand", flag: "🇹🇭" },
    { code: "TR", name: "Türkiye", flag: "🇹🇷" },
    { code: "UA", name: "Ukraine", flag: "🇺🇦" },
    { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
    { code: "US", name: "United States", flag: "🇺🇸" },
    { code: "UY", name: "Uruguay", flag: "🇺🇾" },
    { code: "VE", name: "Venezuela", flag: "🇻🇪" },
    { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];
/* ---------------------------------------------------------
   State
   --------------------------------------------------------- */
const driver = {
    surname: "",
    number: 10,
    country: null,
    trait: null,
    setup: "oversteer",
    livery: LIVERIES[1],
    mode: null,
};
/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
const $ = (sel) => document.querySelector(sel);
function show(screen) {
    document.querySelectorAll(".screen").forEach((el) => {
        el.hidden = el.dataset.screen !== screen;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
}
/* ---------------------------------------------------------
   Screen 1 — run mode
   --------------------------------------------------------- */
function buildModes() {
    const wrap = $("#modeList");
    wrap.innerHTML = MODES.map((m) => `
    <button class="mode" type="button" data-mode="${m.id}" aria-pressed="false">
      <span class="mode__sector">${m.sector}</span>
      <span class="mode__name">${m.name}</span>
      <span class="mode__cadence">${m.cadence}</span>
      <span class="mode__blurb">${m.blurb}</span>
      <span class="mode__go">Start career <em>→</em></span>
    </button>`).join("");
    wrap.querySelectorAll(".mode").forEach((btn) => {
        btn.addEventListener("click", () => {
            driver.mode = btn.dataset.mode;
            wrap.querySelectorAll(".mode").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
            $("#modeTag").textContent = MODES.find((m) => m.id === driver.mode).cadence;
            show("identity");
        });
    });
}
/* ---------------------------------------------------------
   Screen 2a — helmet preview
   --------------------------------------------------------- */
function paintHelmet() {
    const { base, accent, trim } = driver.livery;
    $("#helmetShell").setAttribute("fill", base);
    document.querySelectorAll(".helmet-accent").forEach((el) => el.setAttribute("fill", accent));
    const num = $("#helmetNumber");
    num.setAttribute("fill", trim);
    num.textContent = String(driver.number);
    const name = $("#helmetName");
    name.setAttribute("fill", trim);
    name.textContent = (driver.surname || "SURNAME").toUpperCase().slice(0, 12);
}
function buildLiveries() {
    const wrap = $("#liveryRow");
    wrap.innerHTML = LIVERIES.map((l) => `
    <button class="swatch" type="button" data-livery="${l.id}" title="${l.name}" aria-label="${l.name} livery" aria-pressed="${l.id === driver.livery.id}">
      <span style="background:${l.base}"></span><span style="background:${l.accent}"></span>
    </button>`).join("");
    wrap.querySelectorAll(".swatch").forEach((btn) => {
        btn.addEventListener("click", () => {
            driver.livery = LIVERIES.find((l) => l.id === btn.dataset.livery);
            wrap.querySelectorAll(".swatch").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
            paintHelmet();
        });
    });
}
/* ---------------------------------------------------------
   Screen 2b — nationality
   --------------------------------------------------------- */
function renderCountries(filter = "") {
    const q = filter.trim().toLowerCase();
    const list = COUNTRIES.filter((c) => c.name.toLowerCase().includes(q));
    const grid = $("#countryGrid");
    if (list.length === 0) {
        grid.innerHTML = `<p class="empty">No country matches “${filter}”. Try fewer letters.</p>`;
        return;
    }
    grid.innerHTML = list
        .map((c) => `
    <button class="country" type="button" data-code="${c.code}" aria-pressed="${driver.country?.code === c.code}">
      <span class="country__flag">${c.flag}</span><span class="country__name">${c.name}</span>
    </button>`)
        .join("");
    grid.querySelectorAll(".country").forEach((btn) => {
        btn.addEventListener("click", () => {
            driver.country = COUNTRIES.find((c) => c.code === btn.dataset.code);
            grid.querySelectorAll(".country").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
            validate();
        });
    });
}
/* ---------------------------------------------------------
   Screen 2c — circuit trait map
   --------------------------------------------------------- */
function buildTraits() {
    const layer = $("#traitLayer");
    layer.innerHTML = TRAITS.map((t) => `
    <g class="node" data-trait="${t.id}" tabindex="0" role="button" aria-label="${t.full}" aria-pressed="false"
       transform="translate(${t.x},${t.y})">
      <rect x="-27" y="-15" width="54" height="30" rx="15"></rect>
      <text x="0" y="5" text-anchor="middle">${t.label}</text>
    </g>`).join("");
    const pick = (id) => {
        driver.trait = TRAITS.find((t) => t.id === id);
        layer.querySelectorAll(".node").forEach((n) => n.setAttribute("aria-pressed", String(n.dataset.trait === id)));
        $("#traitName").textContent = driver.trait.full;
        $("#traitBlurb").textContent = driver.trait.blurb;
        validate();
    };
    layer.querySelectorAll(".node").forEach((node) => {
        node.addEventListener("click", () => pick(node.dataset.trait));
        node.addEventListener("keydown", (e) => {
            const ev = e;
            if (ev.key === "Enter" || ev.key === " ") {
                ev.preventDefault();
                pick(node.dataset.trait);
            }
        });
    });
}
/* ---------------------------------------------------------
   Validation + confirm
   --------------------------------------------------------- */
function numberError(n) {
    if (!Number.isInteger(n) || n < 2 || n > 99)
        return "Pick a number between 2 and 99. Number 1 belongs to the reigning champion.";
    if (RETIRED_NUMBERS[n])
        return `${n} is retired from the grid. Choose another.`;
    return null;
}
function validate() {
    const nameOk = driver.surname.trim().length >= 2;
    const numErr = numberError(driver.number);
    const ok = nameOk && !numErr && !!driver.country && !!driver.trait;
    $("#numberNote").textContent = numErr ?? "";
    $("#numberNote").hidden = !numErr;
    const btn = $("#confirm");
    btn.disabled = !ok;
    const missing = [];
    if (!nameOk)
        missing.push("surname");
    if (!driver.country)
        missing.push("nationality");
    if (!driver.trait)
        missing.push("racing trait");
    $("#confirmNote").textContent = ok ? "Ready to go racing." : `Still needed: ${missing.join(", ")}.`;
    return ok;
}
function buildCard() {
    const mode = MODES.find((m) => m.id === driver.mode);
    const c = driver.country;
    const t = driver.trait;
    $("#cardNumber").textContent = String(driver.number);
    $("#cardName").textContent = driver.surname.toUpperCase();
    $("#cardFlag").textContent = c.flag;
    $("#cardCountry").textContent = c.name;
    $("#cardTrait").textContent = t.full;
    $("#cardTraitBlurb").textContent = t.blurb;
    $("#cardSetup").textContent = driver.setup === "oversteer" ? "Loose rear — oversteer" : "Stable front — understeer";
    $("#cardLivery").textContent = driver.livery.name;
    $("#cardMode").textContent = `${mode.name} — ${mode.cadence.toLowerCase()}`;
    const card = $("#cardArt");
    card.style.setProperty("--card-base", driver.livery.base);
    card.style.setProperty("--card-accent", driver.livery.accent);
}
/* ---------------------------------------------------------
   Wiring
   --------------------------------------------------------- */
function init() {
    buildModes();
    buildLiveries();
    renderCountries();
    buildTraits();
    paintHelmet();
    validate();
    $("#surname").addEventListener("input", (e) => {
        driver.surname = e.target.value;
        paintHelmet();
        validate();
    });
    $("#number").addEventListener("input", (e) => {
        driver.number = parseInt(e.target.value, 10);
        if (!Number.isNaN(driver.number))
            paintHelmet();
        validate();
    });
    $("#search").addEventListener("input", (e) => {
        renderCountries(e.target.value);
    });
    document.querySelectorAll("[data-setup]").forEach((btn) => {
        btn.addEventListener("click", () => {
            driver.setup = btn.dataset.setup;
            document.querySelectorAll("[data-setup]").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        });
    });
    $("#back").addEventListener("click", () => show("mode"));
    $("#restart").addEventListener("click", () => show("identity"));
    $("#confirm").addEventListener("click", () => {
        if (!validate())
            return;
        buildCard();
        show("card");
    });
}
document.addEventListener("DOMContentLoaded", init);
