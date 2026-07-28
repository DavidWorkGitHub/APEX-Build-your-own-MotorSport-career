# Swami Formula — roadmap

Where the game goes from here. Tick things off as they land; the ideas section is a menu, not a promise.

**Done:** landing page · driver creator · driver card · academy selection · overall rating · season loop · decisions · the ladder · season hub · trophy cabinet · retirement · hall of fame
**Next up:** all five phases done — polish, more decisions, sound

---

## The ladder — you start at the bottom

You never begin in F1. You begin as a fourteen-year-old in a kart with a surname nobody knows, and the whole point is the climb. Most careers should stall somewhere on this ladder, and stalling should still be worth playing.

| # | Division | Seasons | Field | Get promoted by |
|---|---|---|---|---|
| 1 | **Karting** | 2 | 24 | Winning a national title, or being noticed by a junior programme |
| 2 | **Formula 4** | 2 | 22 | Top 3 in the championship |
| 3 | **Formula 3** | 2 | 20 | Top 3, or one standout season a scout can't ignore |
| 4 | **Formula 2** | 2–3 | 18 | Title or runner-up **and** an F1 seat actually being free |
| 5 | **F1 reserve** | 1–2 | — | A crash, a sacking, or a mid-season injury |
| 6 | **F1 backmarker** | — | 20 | Out-driving the car often enough to get called |
| 7 | **F1 midfield** | — | 20 | Podiums in a car that shouldn't podium |
| 8 | **F1 front-running** | — | 20 | You've arrived. Now win it. |

**Rules that make the climb mean something**
- [ ] Promotion needs results **and** an opening. A free seat is not guaranteed — you can win F2 and spend a year as a reserve.
- [ ] Going backwards is possible. A bad year in a bad car sends you down, or out.
- [ ] Money matters early. In karting and F4 a decision can be "take the paid seat in a worse car".
- [ ] Age is a clock. Past about 24 without an F1 seat, junior programmes stop calling.
- [ ] Every division has a rival who climbs alongside you and shows up again later.
- [ ] A career that ends in F2 gets a real ending, not a failure screen.

### End-of-season roll

Nothing about the climb is automatic. Every season ends with one roll, and there are five ways out of it.

| Outcome | Roughly | When it happens |
|---|---|---|
| **Jump two rungs** | rare | A dominant title *and* someone above you got hurt, sacked or retired. F3 straight to a reserve seat. The kind of thing that makes a career. |
| **Promote** | common on a good year | Results clear the bar and a seat exists |
| **Stall** | the default | You did enough, and nothing opened up. Another year in the same division. |
| **Drop** | uncommon | Two poor seasons, or a car nobody could score in |
| **Out** | rare, and permanent | Out of money, out of time, out of interest |

What feeds the roll:
- Championship position, weighted heaviest
- Head-to-head against your team-mate — losing to them cancels out a good points haul
- Whether a seat is actually free in the division above, which is generated independently of you
- Reputation: loyal, mercenary, political, fast-but-fragile
- Age, and how many seasons you've spent in this division already
- Backing — a junior programme, a sponsor, family money

**Stalling has to be playable.** A second year in F3 shouldn't feel like a punishment: you're the experienced one now, the rival is new, and the decisions change to reflect it. Three years in the same division, though, and the game should start telling you the door is closing.

**The jump should be earnable but never expected.** It needs the dominant season *and* the lucky opening — so a player can't plan for it, but when it lands it's the story they tell.

---

## Trophy cabinet

The reward for the whole thing. A room you can walk back into.

- [ ] **Championship trophies** — one per title, per division. Kart titles look cheap and plasticky next to an F1 trophy, deliberately.
- [ ] **Race win trophies** — a shelf that fills up, tagged by circuit and year.
- [ ] **Podium count** — the near misses, because they're the ones you remember.
- [ ] **Helmets** — one per team you drove for, in that team's colours. Your own livery underneath.
- [ ] **The defining moment** — a single framed item pulled from your decision log. Every career has exactly one.
- [ ] **Rival wall** — team-mates and rivals, with your head-to-head record against each.
- [ ] **Cabinet fills in real time.** Winning something mid-career means it's *there* next time you open the cabinet.
- [ ] Empty cabinet at the start says what would go where. An empty shelf is an invitation.

**Ideas worth stealing later**
- A "first" shelf: first points, first podium, first win, first pole. Small trophies, disproportionate weight.
- Cursed items: a DNF trophy for the season you retired eight times, a wooden spoon for finishing last.
- Hover any trophy for the one line of story attached to it.

---

## Build checklist

### Phase 1 — the season loop ✅ done
- [x] Season simulates race by race, results table filling in live
- [x] Points, championship standings, position after each round
- [x] Team-mate head-to-head — the stat the paddock actually judges
- [x] Trait and balance visibly affect results
- [x] Weather roll and reliability roll per race
- [x] End-of-season summary screen
- [x] Save to `localStorage` so a career survives a refresh
- [x] Seeded RNG — one driver, one career, same story

### Phase 2 — decisions ✅ done
- [x] Decision screen: short scene, 2–3 options, no preview of outcomes
- [x] Fires at the chosen cadence (1 / 2 / 3 seasons)
- [x] Hidden weightings across seat quality, reputation, development, risk
- [x] At least a third of decisions pay off two or three seasons later
- [x] Decision log, so the career can be retold at the end
- [x] Trait gates which decisions you're ever offered
- [x] Multi-season progression with attribute development
- [ ] More scenes — ten is enough to prove it, not enough for a full career

### Phase 3 — the ladder ✅ mostly done
- [x] Eight divisions, with the five-outcome end-of-season roll
- [x] Seat availability generated independently of the player
- [x] Jump-two-rungs path, gated behind a dominant season plus a lucky opening
- [x] Stalling is the default outcome, not a punishment
- [x] Named teams per division with a car philosophy (matches oversteer or understeer)
- [x] Age clock and the seats that stop appearing
- [x] Development ceilings — a division can only teach you so much
- [x] Season hub: the season ends and waits for you
- [x] Contracts: length and a clause you might regret
- [x] Recurring rival who climbs with you

### Phase 4 — trophy cabinet ✅ done
- [x] Cabinet screen, fills as you go
- [x] Trophies, helmets, rival wall, defining moment
- [x] Career stats: wins, podiums, poles, DNFs, races
- [x] Firsts shelf
- [x] Kart titles deliberately look cheaper than F1 ones
- [x] Cursed items — DNF trophy, wooden spoon, Sunday driver

### Phase 5 — retirement ✅ done
- [x] Retirement trigger — age, running out of road, or walking away
- [x] Career summary written from the log, not generated at the end
- [x] A career card: name, number, peak division, defining moment
- [x] Start a new career, keeping a hall of fame

### Polish, ongoing
- [ ] Sound: a single engine note on season start, nothing more
- [ ] Keyboard support through the whole loop
- [ ] Mobile pass on every new screen
- [ ] Light mode checked on every new screen

---

## Open questions

Worth deciding before Phase 2, because they change the design:

1. **Can you fail out entirely?** A career that ends at 19 with no seat is honest, and brutal. Yes or no?
2. **Do you see the standings for the whole field, or only around you?** Only around you is more claustrophobic and more realistic.
3. **How long is a full career?** Roughly 15–20 seasons feels right, which is 6 decisions on Express and 18 on Intense.
4. **Should a run be replayable?** Fixed seed means one career per driver. Free re-rolls make decisions weightless.
5. **Does the team-mate get a name and a face, or just a name?**

My leaning on each: yes to failing out, only around you, ~18 seasons, one career per driver, name and a colour but no face.
