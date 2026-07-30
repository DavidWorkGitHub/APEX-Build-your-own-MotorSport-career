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
| `swami-formula/favicon.svg` | The tab icon — the same car, red on a dark rounded square. |
| `swami-formula/favicon.png` | 180px PNG for iOS home-screen bookmarks. |

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

**Fixes and adjustments**

- **Career history was being overwritten.** Starting a second driver in the same session reused the first driver's save slot, so the earlier career was silently replaced. Every new driver now gets their own slot, and starting fresh from the landing page or the history screen clears all career state first: attributes, cabinet, reputation, decision log, team-mate, rival, the lot. Tested with three drivers in one session, two retired and one left running, all kept separately.
- **Retiring straight from the hub lost the season you had just raced.** It is now recorded before the career closes.
- **The logo goes home.** Click or tab to it from anywhere to get back to the landing page. Careers save at the start of each season, so nothing is lost by doing it.
- **Achievement thresholds corrected.** Youngest champion is now a Formula 1 title at 23 or under. All-time greatest is eight Formula 1 championships. Mr Four In A Row is four consecutive Formula 1 titles. The old three-in-a-row stays as a rare achievement at any level.

**Title fights, and achievements**

*The title fight is a mechanic now, not a readout.*
- A **named rival locks in** once the season has shape. No more recalculating who you're fighting every round — past 60% distance and within 50 points, that's your fight for the year.
- **The closing rounds carry pressure.** In the last three races, both you and your rival are more likely to make a mistake. A high Consistency rating cancels most of it; a fragile reputation doesn't.
- **The final round is a decision.** Go into the last race in the top two and within 26 points and the season *stops*: the circuit, the gap and the name, then three ways to play it — drive it flat out, race the points rather than the man, or sit on him and wait for the mistake. Each carries real modifiers into the race: pace, your own risk of retiring, and his. Two of the three are gambles.
- It **interrupts a skip**. This is the one race you shouldn't be able to fast-forward past.
- A test career hit seven deciders across twenty seasons, at real circuits, with gaps from 2 to 22 points.

*Achievements — 38 of them, with a viewer.* Reachable from **Achievements** on the landing page or from inside the trophy cabinet. Progress bar, three rarity tiers, and each one shows the driver and season that earned it. They're tracked **across every career**, not per driver.

They cover first steps (first points, pole, win, title), the climb (reaching F1, the front, skipping a division, three titles in a row), the long way round (taking the sportscar fork, winning Hypercar, getting back to F1 afterwards, coming out of retirement), team-mates (a whitewash season, 100 lifetime wins over team-mates, open war, four years alongside the same driver), how you drive (winning in the wet, six poles, twenty net places gained, a season with no retirements), the other kind (the DNF trophy, wooden spoon, five seasons going nowhere), who you became (loyal, mercenary, political), and the long haul (twenty seasons, still racing at 38, a hundred starts, five teams).

**Three are hidden** and show as ??? until earned. One of them can only come from winning a final-round decider.

Unlocks pop up as a toast while you play, colour-coded by rarity.

**More scenarios — 32 → 54**

Twenty-two new scenes, aimed squarely at the parts of a career that had nothing in them:

- **Sportscars** had no decisions at all despite being a whole branch. Now there's Le Mans at 03:40 behind a weaving driver who's been in the seat too long, the paying amateur co-driver who's four seconds off and also the reason the team exists, a manufacturer hypercar programme that arrives the same week as an F1 reserve seat, and a performance-balance row you can either defuse or pour petrol on.
- **The reserve year** was a dead season. Now it asks what you do with your one Friday practice all year — send it on low fuel for a headline lap, or run the programme they actually asked for — and whether to go race something, anything, in a lesser series to stay sharp.
- **Team-mate at war** scenes, which only appear once the relationship has actually broken down: data arriving an hour late every time, and a second collision the board wants explained.
- **The comeback** now has its own questions. Eight tenths off a twenty-three-year-old, and a live interviewer asking whether you came back for money, ego, or because you had nothing else.
- Plus more junior scenes (the last good engine, a coach who'll be hard on you, a team that folds four rounds from the end) and more F1 (declaring yourself number one, a final-lap title fight where neither of you has to yield, a fuel-save call you think is wrong).

**Repeats fixed properly.** Scenes used to be released back into the pool every five seasons whether or not they were needed. Now a scene only comes round again when that stage of the career has genuinely run out — so an Intense career, which asks a question *every* season, went twenty seasons with **twenty distinct decisions and no repeats**.

The pool now stands at 54 scenes, 41 of them gated to a context, 16 containing gambles across 39 weighted branches, and 36 options that plant a consequence landing seasons later.

**Multiple drivers, and a bug sweep**

*Career history.* You can now have up to **six careers on the go at once**. Each one saves automatically at the start of every season and picks up exactly where it left off — same seed, same story, right down to which decisions you'd already seen. One screen holds everything, reached from **Career history** on the landing page: **Still racing** at the top with division, team, season, age, titles and the run mode each was started on, and **Finished** underneath with every retired driver — click any of them to read their full career back. Delete a career and it's gone without going into the hall of fame. Retiring frees the slot and moves that driver to the hall; a comeback opens a fresh slot for the second career.

This also closes the old gap where the game saved after every race and never once read it back. Close the tab now and nothing is lost.

*Bug sweep.* Wrote a stress harness (`test-stress.js`) that plays whole careers with randomised choices — random mode, roster, surname, number, nationality, trait, seat and decision at every turn — while checking for script errors, `NaN`/`undefined` leaking into any screen, empty outcomes, negative career stats, dead-ends and wrong Back destinations. It also walks the endgame: comeback offer, hall, archive, compare, theme toggle. Sixteen randomised careers came back clean. The only two flags were the harness itself typing a one-letter surname and a zero race number, which validation correctly refuses.

**Fix — you could refuse to retire**
- After the career ended, opening the trophy cabinet or the decision log and pressing Back landed you on the *season hub* rather than the ending. Continue was still live from there, so you could keep racing seasons indefinitely after retiring — and each pass wrote another hall-of-fame entry.
- Back now returns to the ending once you've retired, the hub's Continue refuses to advance a finished career, retiring twice does nothing, and the hall entry is written exactly once per career. A comeback deliberately un-retires you and earns its own entry when *it* ends.

**Favicon**
- The car logo is now the tab icon, red on a dark rounded square with the corner radius matching the panels.
- It's **embedded as a data URI** in the `<head>`, so the single-file build keeps its icon no matter where you move it — no separate file to lose.
- `favicon.svg` and a 180px `favicon.png` are in the project folder for anywhere that wants real files (iOS home-screen bookmarks use the PNG).
- Added `theme-color`, so mobile browsers tint their chrome to match the app background instead of flashing white.

**Career history, mobile, and staying on in sportscars**

- **Career history** replaces "Back to games" on the landing page. It opens the hall of fame straight from the front screen, so you can read past drivers without finishing a career first, and Back returns you to the landing page rather than dumping you on a retirement screen.
- **Staying in sportscars.** GT3 and Hypercar no longer push you up the moment you win. When a promotion comes and you're in sportscars, a second button offers to stay: *"There's a car you understand, a team that wants you, and no reason to leave yet."* A test career won GT3, chose to stay, and won it again the following year. Sportscars are now a career you can choose rather than a corridor back to F1.
- **Full mobile pass.** Several screens built after the last one — the season hub, the cabinet, retirement, the archive, the roll, the fork — had never been checked at phone width. Everything now reflows below 720px: buttons go full-width, tabs and stat grids reflow, the seat cards stack, the standings and race table tighten up, the season-by-season table scrolls sideways instead of crushing to nothing, and the driver card scales down. There's a second breakpoint at 380px for small phones.

**Gambles — decisions that can go either way**

- Some options are now **gambles**, marked with a small yellow tag. You can see that an option is risky; you can never see which way it will fall.
- Eight scenes have them so far: the cut-price engine, the slick-tyre gamble in the rain, the corner you take flat that works three times in four, racing on a cracked bone, double-stacking in the pits, beating the simulator kid, staying out on dead tyres, and accepting a rival team's help in a title fight.
- Each gamble has weighted branches. Racing on the broken hand: 45% it holds and a scout writes your name down, 35% you finish nowhere in agony, 20% the bone goes properly on lap nine and that's your season. The same option in two different careers came out **+2 overall** and **−2 overall**.
- **Every decision now shows the swing** — "Overall 56 → 58 +2" — in green or yellow, so you see immediately what a choice bought or cost you.
- **Decision rewards are no longer capped by your division.** Natural development is still limited by what your level can teach you, but what you win or lose from a choice always counts in full. Before this, a +9 attribute reward in karting was being silently clamped away, which made decisions feel weightless early on.

**Balance and flags — fixes**

- **Flags now render everywhere.** Windows doesn't support regional-indicator emoji at all, so Chrome and Edge were showing two letter boxes instead of a flag. Every flag is now drawn as inline SVG from a small band-and-shape table in `src/flags.ts` — all 65 countries, no font dependency, no internet needed. The awkward ones (UK, US, Brazil, South Africa, Switzerland, Chile, Bahrain, Portugal, Czechia, UAE) are hand-drawn special cases.
- **Titles were far too easy.** The player's attributes were being counted twice — once inside the skill rating, then again as a per-race bonus — which was worth roughly thirteen points of pace no AI ever received. A career was winning fifteen championships and taking an F1 title in a backmarker car. The per-race bonus is now a fraction of what it was, so attributes still shape *how* you race without deciding every result.
- **The front of the grid is now genuinely fast.** From F1 upward, four or five drivers are scaled to you *and* put in front-running machinery, because that's why they're at the front. Winning a championship in a backmarker car no longer happens. Twenty-season careers now finish with three to seven titles instead of fifteen, and plenty of seasons with none.
- **You can't win a division twice.** The lockout applied when dropping back down but not when climbing, so a driver could win F2, fall to F3, and win F2 again. Promotions now skip straight over anything you've already won.
- **The epilogue reads properly.** Titles are grouped by division ("5 championships — one in F4, one in F2, one in GT3, one in HYP and one in F3") rather than listed season by season and cut off at "and 11 more". The opening line leads with the span of the career, and a comeback is now mentioned explicitly instead of leaving an unexplained jump in age.

**Real grid, mandatory promotion, and sportscars**

- **Grid toggle** on the landing page: *Invented* or *Real*. Real uses the 2026 Formula 1 grid — eleven teams, twenty-two drivers, so you're fighting the actual field — plus real junior teams (Prema, ART, Campos, MP, Rodin…), real karting outfits, and real sportscar teams (Porsche Penske, Toyota Gazoo, AF Corse, Jota…). Your choice is remembered.
- Everything lives in **`src/roster.ts`** as plain data. Grids change every year: edit that one file and the game follows. Nothing else needs touching.
- **A title is a promotion.** Win your category and you leave it — you don't get to defend it. The roll says "Champion — moving up" and the seat question becomes where, not whether.
- **You can never return to a division you've won.** A drop skips past it.
- **The F2 fork.** Win Formula 2 and the rules won't let you race it again, so you choose: an **F1 reserve seat** (four rounds a year, a simulator programme, and a phone that might ring) or a **works sportscar drive** (a full season, real wins, and a paddock that doesn't care what your junior record said).
- **GT3 and Hypercar endurance** added as a full branch, with their own calendars — Sebring, Le Mans, Fuji, the Nürburgring. Win your way up it and Hypercar leads *back* to an F1 reserve seat. The long way round genuinely works.

A test career went karting → F4 → F3 → F2 title → sportscars → GT3 title → Hypercar title → F1 reserve → backmarker → midfield → front-running, and retired at 35 with eleven championships.

### On the real grid and publishing
Real names are fine for playing yourself. If this ever goes public, F1 games license driver likenesses and team marks for a reason — at that point switch the default back to the invented grid, or replace the roster with your own names. That's why it's one editable file.

**The five**

1. **Team-mates who stay.** Your team-mate now has a contract of their own, one to three seasons, and stays put while it runs. The head-to-head accumulates across seasons — "3 seasons · 41–22 lifetime" — and the relationship moves between cordial, tense and open war depending on how badly you beat them and how mercenary or political you've become. A twelve-season career now sees about five team-mates instead of twelve.

2. **Ageing and the comeback.** Attributes fall after 31, and unevenly: qualifying and racecraft go first, tyre management and consistency hold years longer, and technical feedback actually *rises* — you know more than you did. Retirement isn't a wall any more. If you reached F1 and left with credit, the phone can ring one to three seasons later: an injury, a mid-season sacking, a team at the back that wants somebody who can tell them what's wrong with it. Mercenary and fragile reputations don't get the call. One comeback per career, short terms, worse machinery, and the decision pool resets because the questions are different now.

3. **Twenty-two more scenarios**, taking the pool from 10 to 32 and banded by where the career is: junior money and school, an F1 team order in your third race, an engineer who lied about fuel loads, a team-mate veto in your contract, a rule change that kills your driving style, a twenty-year-old team-mate who's quicker, when to stop, a final-round deal a rival team offers you. Scenes come back around every five seasons so a long career never runs dry.

4. **Past runs.** The hall of fame is a place now, not a list. Every retired driver keeps their full season-by-season table, decision log, epilogue and stats — click any of them to walk back in. Pick two and compare them side by side, with the better number in each row highlighted.

5. **Title fights.** A live box in the season sidebar showing who you're actually fighting, the points gap, and how many rounds are left. If you go into the final round within 25 points of the lead, it flags as a decider.

**Phase 5 — retirement, plus the last of Phase 3**

*Retirement* triggers three ways: you run out of road (the roll comes back "out"), you turn 34, or you press Retire on the hub whenever you want.

*The epilogue is assembled from what actually happened* — not generated at the end. Where you started and where you finished, the titles by name and season, how many times a seat came free two levels up, how many seasons ended with nowhere to go, your lifetime head-to-head against team-mates, your rival, and the reputation you ended with.

*Hall of fame* keeps every driver you retire, on the device. It falls back to memory if storage is blocked.

*Contracts* now have a length and a clause — performance, funding, loan, team option, release, or plain terms. A contract protects you: a season bad enough to lose the seat won't, if there are years left on paper.

*A recurring rival* is generated at the start of the career and stays on the grid as you climb, marked in the standings and turning up in the epilogue.

*Cursed items* in the cabinet: a DNF trophy for a season with four or more retirements, a wooden spoon for finishing last, and "Sunday driver" for three poles and no wins.

**UI pass**
- Seat cards rebuilt: bigger team names, spec rows separated by rules with values right-aligned, machinery bar capped and glowing, the contract clause in its own panel, expectation set in italic.
- A quieter third button tier for actions like Retire.
- Panels, headings and stat grids brought onto one spacing and type scale.

**Phase 4 — the trophy cabinet**
- Reachable from the season hub, and it fills as you play rather than being assembled at the end.
- **Championships** as trophies you can see. Kart titles are dull bronze and small; F1 trophies are gold, taller and glow. The shelf tells you what level you won at before you read a word.
- **Race wins** tagged with circuit, season, division and whether it was wet.
- **Firsts** — first points, first pole, first podium, first win, first championship — each with where it happened and how old you were.
- **Helmets**, one per team you drove for, coloured from the team name, with the seasons you were there and how many wins you got them.
- **Rival wall** — every team-mate you've been measured against, with the head-to-head and a bar.
- **Defining moment** — one framed decision per career, chosen as the choice you made going into your best season.
- Empty states describe what would go on each shelf, so a new cabinet reads as an invitation rather than a blank.
- A sixteen-season test career filled it with 5 titles, 38 wins, 88 podiums, 31 poles, 4 helmets and 12 rivals.

**Phase 3 — the ladder, and a season that stops**

*Nothing advances on its own.* When a season ends you land on a hub and stay there until you press Continue. Three tabs:
- **This season** — points, wins, podiums, poles, points finishes, DNFs, average grid slot, average finish, net places gained on track, best and worst result, wet races, head-to-head.
- **Season by season** — every year of the career in one table: age, division, team, championship position, points, wins, podiums, head-to-head and what the end-of-season roll did.
- **Team & contract** — your seat, what they expect of you, whether the car suits your balance, development support, seasons in this division, reputation, consequences still pending, and your team-mate's season next to yours.

*Eight divisions:* karting, F4, F3, F2, F1 reserve, then F1 backmarker, midfield and front-running. Each has its own field strength, machinery band, calendar and odds of a seat opening above you.

*The five-outcome roll.* Every season ends with one roll: jump two rungs, promote, stall, drop, or out. Seat availability is generated independently of how you drove — you can win a title and be told nobody above you retired. Stalling is the default and it is not a punishment.

*Promotion means new offers.* Every time you move, three seats in the new division are generated and you pick one, same as the academy.

*Development ceilings.* You can't develop past what your current level can teach you, so climbing is the only way to keep improving. This is what stops a good driver dominating karting forever.

*Age.* You start at 15. Past 26 without reaching F1, the phone stops ringing.

`test-ladder.js` plays a fourteen-season career and prints every roll.

**Phase 2 — decisions**
- Careers now run season after season. Attributes develop each year, fast early and flattening out, and your overall climbs with them.
- A decision fires at your chosen cadence: every season on Intense, every second on Normal, every third on Express.
- Ten scenes so far, each with two or three options and **no preview of what any of them do**. You find out after you commit.
- Decisions are gated. The flat-out corner scene only appears for a Qualifier or an Overtaker; the wet-tyre gamble only if it actually rained; the junior-programme call only if you beat your team-mate or finished top five.
- **Delayed consequences.** Roughly half the options plant something that lands two or three seasons later — the cheap engine supplier folding, an old engineer becoming a chief strategist who owes you one, a corner that catches you out in front of a scout. These appear as a red strip above the results when the season opens.
- **Reputation** tracks four axes (loyal, mercenary, political, fast-but-fragile) and shows the dominant one in the season header.
- **Decision log** from the summary screen: every choice, what came of it, career totals, and how many choices are still to land.
- Bundler rewritten to read script tags out of the HTML rather than a hard-coded list, so adding a file can't silently break the build. It now checks the script count too.
- `test-career.js` plays six seasons headlessly and prints every decision, outcome and callback.

**Academy selection + overall rating**
- After confirming your driver you're offered three seats, generated from your career seed — the same driver always gets the same three doors.
- A works programme (best kart, established winner as team-mate, podiums expected), a midfield outfit (even team-mate, +5 Racecraft), or a family-run team (slow kart, beatable team-mate, +9 Technical feedback, built around you).
- Exactly one seat always suits your natural balance and one always fights it. The third is luck. A matching car philosophy is worth real pace.
- **Overall** rating on the driver card, with a ring gauge and a band (Unproven → Exceptional). Weighted so qualifying and racecraft count most, and it moves once you have machinery.
- `test-academies.js` runs the same driver through all three seats. Typical spread: works P4 with 135 points but beaten 11–1 by your team-mate; family P14 with 6 points while winning the intra-team battle 10–2.

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
