# Swami Formula

Build your own F1 career. Pick a decision cadence, define a driver, and let the seasons play out into trophies, stats and one defining moment.

Currently built: the landing page and the full driver creator. The season simulation is next.

---

## Running it

**Just play it:** download `swami-formula.html` and double-click. One self-contained file — no install, no server, no internet needed. If double-clicking does something odd, right-click → Open with → Chrome.

**Edit the code:** use the `swami-formula/` folder.

```bash
npm install -g typescript          # once
cd swami-formula
tsc src/app.ts --target ES2020 --lib ES2020,DOM --strict --outDir .
node build.js
```

`tsc` compiles `src/app.ts` → `app.js`. `build.js` squashes `index.html` + `app.js` + `hero.jpg` into the standalone `swami-formula.html`. Add `--watch` to the `tsc` line to recompile on save.

You can also just open `index.html` directly while developing — it loads `app.js` from disk, so you only need `build.js` when you want a new single file to share.

### Files

| File | What it is |
|---|---|
| `swami-formula.html` | The game. Everything inlined. This is the one to share. |
| `swami-formula/index.html` | Markup + all CSS. Where the design lives. |
| `swami-formula/src/app.ts` | All logic, typed. The only file you should edit for behaviour. |
| `swami-formula/app.js` | Compiled output. Generated — don't edit by hand. |
| `swami-formula/build.js` | Bundler. |
| `swami-formula/hero.jpg` | Landing image. Swap it for a different photo without touching code. |
| `swami-formula/logo.svg` | The car silhouette, traced to vector. Uses `currentColor`, so it picks up whatever colour you set. |

---

## What's in it

**Landing** — hero photo with a Ferrari-red duotone, three cadence pills (Intense / Normal / Express, Normal preselected), and a Start career button.

**Driver creator** — three columns:
- *Identity*: live helmet preview, six liveries, surname, race number, natural balance (oversteer / understeer).
- *Nationality*: 65 countries, searchable, selection pins to a chip so it stays visible while scrolling.
- *Racing trait*: eight traits placed around a circuit. Picking one shows its attribute trade-offs before you commit.

**Driver card** — six animated attribute bars computed from your trait *and* your balance choice, plus the full spec and your first pending decision.

### The rules so far

- **Race number** is 1–99. A third digit can't be typed, letters are stripped, and an empty or zero field corrects to 1 when you click away.
- **Racing trait** is permanent. It weights the simulation *and* gates which decisions the career will ever offer you — an Engineer's driver sees development choices a pure Overtaker never will.
- **Natural balance** is a hidden compatibility score against each team's car philosophy. The right seat at the wrong team is a bad seat.
- **Run mode** only changes how often you're asked to decide. It never changes simulation quality.

---

## Changelog

**Phase 1 — the season loop**
- Start season 1 now runs a 12-round karting season, race by race, with results appearing live.
- Each round rolls for weather (about 1 in 5 wet) and reliability. Rain flattens the machinery advantage and hands the race to whoever can drive in it.
- Your attributes do real work: Qualifying sets your grid slot, Racecraft decides how much of it you keep, Tyres and Consistency decide whether you're still there at the end.
- Running sidebar: championship position, points, wins, podiums, and the team-mate head-to-head with its own bar.
- Standings show the top six with you and your team-mate highlighted.
- Skip to end button for when you don't want to watch all twelve.
- End-of-season summary with a flat verdict — the game never congratulates you.
- Seeded RNG derived from your surname, number, nationality and trait. One driver, one career, same story every time.
- Career saves to `localStorage` after every race.
- `test-balance.js` runs six full careers headlessly and prints the results, for tuning. Needs `npm install jsdom`.

**Number cap**
- Race numbers are now 1–99 with a hard cap in the field itself.
- Removed the two previous exclusions (number 1 reserved for the champion, 17 retired). Any number in range is fair game.

**Bundler fix — this was the big one**
- The single-file build was silently corrupting the JavaScript. In JS, `$$` inside a `String.replace()` replacement string is an escape meaning "one literal `$`", so every `$$` in the code became `$` during bundling. That produced a duplicate declaration, the script threw on load, and *nothing* ran — not the theme toggle, not the country list, not the traits. The source folder was always fine; only the shared single file was broken.
- `build.js` now passes a replacement *function*, which disables that escaping, and asserts the `$$` count matches before and after.

**Branding**
- Renamed from APEX to Swami Formula.
- Car silhouette traced from bitmap to a vector path and used as the logo, at 82px (60px on phones).

**Light / dark mode**
- Toggle in the header. Follows your system setting on first open, remembers your choice after that.
- Light mode is a paper timing-sheet look with its own track colours and darkened green/yellow, not an inversion.

**Ferrari red**
- Hero duotone runs through rosso corsa (`#DC001A`) into deep maroon.
- Red carried through the whole interface, replacing the previous violet, since the two fought each other. Green still means "go", yellow still means "check this".

**Buttons**
- One system: pill-shaped, light sweep on hover, lift on hover, press-down on click. Red gradient for primary, ghost for secondary, green for Confirm driver.

**Earlier visual pass**
- Step indicator in the header, animated screen transitions.
- Helmet gained a gradient shell, visor, vents and a rotate-in on livery change.
- Number field became a stepper with a mono readout.
- Circuit gained layered track surfaces, a start/finish gantry and a pace car tracing a lap.
- Driver card gained the animated attribute bars.
- Removed the status pill from the header.

---

## Next

The season loop: simulate a season race by race, show the results table with the intra-team head-to-head, then surface a decision at the chosen cadence. `swami-formula-build-prompt.md` has the full spec for the ladder, decision design and simulation model.

## Note on the hero image

`hero.jpg` is licensed press photography of real drivers with team and sponsor branding. Fine while you're building; you'd need rights before publishing it anywhere public.
