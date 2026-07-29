# Playtest feedback — triage

From the friends' run-through. Grouped by what it actually is, not the order it came in.

---

## 1. Bugs (fix first, these break trust)

**Overall rating can be farmed.** Clicking between options before committing applies effects each time, so you keep clicking until one shows +1 and take that. Same root cause as "whatever I clicked first counts despite me changing it": the options stay live after a choice, and effects apply on click rather than on commit. Fix: a choice locks immediately, options disable, effects apply exactly once.

**The callback banner repeats forever.** "Your old team-mate is a team principal now" printed about thirty times down the season screen. A delayed consequence is being re-added or re-rendered every round instead of once at season start.

**"Stay in Formula 3" appears on a career-ending roll.** That button should only exist on a sportscar promotion. It's showing on OUT, which means you can decline retirement.

**Retirement ages are inconsistent.** One screen says "You're 26, junior programmes want teenagers", another says "You're 42" in Formula 3. And a two-time world champion is retired at 34 with no say in it. The age rules need to be one coherent set, and the top of the sport should not force you out at 34.

**"Someone called" did nothing, then later worked.** The comeback button is firing before its offer exists.

**A two-time world champion is retired against his will at 34.** Separate from the age-consistency bug, this is a design problem: at the top of the sport, with titles and a seat, the decision to stop should be the player's. Being told "career over" after winning it twice is the game overruling the only thing it is about.

**The reserve season is incoherent.** Racing four times and finishing 5th in a championship you're not really in. A reserve year needs its own presentation: appearances, not a championship position.

**Team-mates change without warning on the real roster.** "Your team-mate stays too" and then Lando Norris appears instead. The persistence logic isn't holding when the field is built from the real driver pool.

**Real drivers are not attached to their real teams.** Reserve driver at Red Bull with Piastri as a team-mate. Lindblad one season, Norris the next. When the real roster is on, the pairings from `roster.ts` are being thrown away and drivers are scattered across whatever teams the field generator invents. Drivers should stay with their team, and a team-mate change should mean a transfer, not a shuffle.

**Real teams sit at the wrong level.** Ferrari as a backmarker seat, and Audi/Williams/Mercedes as the front-runners. Funny once, wrong twice. Real teams need a tier band so the grid reads plausibly.

**The skip button stays on screen at round 9 of 9.** Once the calendar is done there is nothing left to skip.

**Callbacks are easy to miss and can contradict the season.** "Staying paid off, the team's new chassis is built to your feedback" appeared while they sat 10th in the championship, and they only noticed the banner several rounds later. A delayed consequence needs to be unmissable when it lands, and its wording should not claim an outcome the results are visibly not showing.

**Verdict text ignores context.** "Top three in your first year" shown in season four. "Champion. The junior programmes have your number now" shown for a Formula 1 title in season nineteen. These strings need to check where and when they are.

---

## 2. Balance

**It's too easy.** Consistent across testers, and the overall-farming bug made it worse. Needs a pass once the farm is closed.

**Driver characteristics don't feel like they matter.** Trait and natural balance are chosen with ceremony and then disappear. They do feed the simulation, but nothing ever tells you so. Two fixes needed: make the effect bigger, and surface it during the season ("your qualifying put you P4 on a day the car was worth P9").

**Results swing without explanation.** 4th, then 12th, then 12th again, with nothing saying why. The season needs to attribute causes: worse car, stronger field, a team-mate upgrade, a bad reliability year.

**One reaction went unexplained.** "Wow that was weird" and "It's so weird, first season F3 I was doing super well and then it just kept plummeting". Worth asking what was on screen, because an unexplained swing that reads as a glitch is worse than a swing that reads as bad luck.

---

## 3. What the game shows you

**No running summary of your picks.** By the academy screen they'd forgotten what their trait and balance did. Wanted a persistent panel building up as you go through the setup steps.

**No pre-season briefing.** The season starts and it's already happening. Wanted a moment beforehand: where you are, who you're driving for, what's expected, who your team-mate is.

**The season is too fast to read.** Rounds fly past and the summary arrives before you've registered anything. Needs a slower default, or speed control, and probably a pause on notable results.

**Achievements were only findable in one place.** Toasts vanished before they could be read. There is a viewer now, but they didn't find it from the landing page, so the entry points need to be more obvious, and the toast should last longer or stack.

**Decision outcomes should be more of a gamble.** They liked not knowing, and want less signposting of what each option gives. Once the farming exploit is closed, this mostly resolves itself, but the per-option hints could say less.

---

## 4. Writing

**Too many em dashes.** Throughout the scene text and the interface copy. Replace most with commas, full stops, or colons, and keep only the ones doing real work.

---

## 5. What worked (don't break these)

- The suits-your-balance / fights-your-balance tag on seat offers.
- Being 15 at the start.
- The real grid producing absurd, memorable moments: reserve driver alongside Piastri, bringing Williams back, "I am glad the junior programmes have my number now".
- The real junior teams landing well. "Yaaay my first podium in Campos!" and racing for Prema both got a reaction. The junior grid is doing as much work as the F1 one.
- First podium and first win both registered as moments. Those beats are working.
- The randomisation itself. "The randomisation is funny" was meant kindly, and the absurd team combinations are part of the appeal. Fixing team tiers should not flatten this completely.
- The overall arc. "Looks very finished and polished already."

---

## Suggested order

1. Lock in decisions (kills the farm and the wrong-choice-registered bug)
2. Callback repeat, plus making callbacks unmissable and non-contradictory
3. Stay-button on OUT, skip button at season end, comeback button
4. Retirement: age coherence, and champions choosing when to stop
5. Real roster: drivers stay with their real teams, teams sit at a sensible tier
6. Reserve year presented as appearances, not a championship
7. Context-aware verdict strings
8. Pacing controls and the pre-season briefing
9. Running pick summary during setup
10. Difficulty pass, now that the exploit is gone
11. Make traits legible during a season
12. Em dash sweep
