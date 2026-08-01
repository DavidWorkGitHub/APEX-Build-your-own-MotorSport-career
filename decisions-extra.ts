/* =========================================================
   MORE SCENES
   Covering the gaps: sportscars, the reserve year, a
   team-mate you're at war with, the comeback, and the
   quieter parts of a career that had nothing in them.
   ========================================================= */

const isGT = (): boolean => tier === 8 || tier === 9;
const isIndy = (): boolean => tier === 10;
const isReserve = (): boolean => tier === 4;
const atWar = (): boolean => teamMate.relationship === "war";
const isBack = (): boolean => comebacks > 0;

const EXTRA_DECISIONS: Decision[] = [

  /* ---------- sportscars ---------- */
  { id: "le-mans-night", eyebrow: "Le Mans · 03:40", scene: "Fourth hour of darkness, second in class, and there's a slower car weaving on the Mulsanne because his driver has been in the seat too long. Your engineer says hold station. The gap to the leader is eleven seconds.",
    question: "You have one clear run at him before the next stop.",
    options: [
      { label: "Go through him", detail: "In the dark, at 300kph, past a driver who isn't seeing straight.",
        outcome: "You commit.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 55, outcome: "He never sees you and you're gone. The class lead comes twenty minutes later.", effect: { attrs: { racecraft: 7, wet: 2 } } },
          { w: 45, outcome: "He moves the same way you do. Both cars survive. Yours is missing a headlight and forty minutes.", effect: { attrs: { racecraft: 2, consistency: -4 }, car: -2 } },
        ] },
      { label: "Hold station", detail: "Nineteen hours left.", outcome: "You sit behind him for two laps and take him at the chicane in daylight.",
        effect: { attrs: { tyres: 5, consistency: 4 }, rep: { loyal: 2 } } },
    ], when: isGT },

  { id: "co-driver", eyebrow: "Sportscars", scene: "Your car has three drivers and one of them is a paying amateur who is four seconds off. He is also the reason the team exists.",
    question: "The team ask how you want the stints split.",
    options: [
      { label: "Minimum stint for him", detail: "Fastest way to win. Humiliating for him.",
        outcome: "You have his stints cut to the regulation minimum. He signs the cheque anyway and doesn't look at you.",
        effect: { attrs: { racecraft: 3 }, rep: { mercenary: 3 } } },
      { label: "Coach him instead", detail: "Spend your weekends teaching.",
        outcome: "You spend three race weekends walking him through corners. He finds two seconds.",
        effect: { attrs: { feedback: 6, consistency: 2 }, rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "The amateur you coached buys a bigger team, and he wants you in it.", effect: { car: 6 } } },
    ], when: isGT },

  { id: "manufacturer-call", eyebrow: "Sportscars", scene: "A manufacturer wants you on their hypercar programme. It's the biggest sportscar drive there is, and signing means turning down an F1 reserve seat that came in the same week.",
    question: "Both want an answer by Monday.",
    options: [
      { label: "Take the hypercar", detail: "Race for wins. Give up on the other thing.",
        outcome: "You sign. It's the best car you've ever driven and it isn't a Formula 1 car.",
        effect: { car: 7, attrs: { tyres: 4, feedback: 3 }, rep: { loyal: 2 } } },
      { label: "Keep the F1 door open", detail: "A worse seat, and a maybe.",
        outcome: "You turn the manufacturer down. Their press officer wishes you luck in a way that isn't kind.",
        effect: { attrs: { qualifying: 3 }, rep: { political: 3 } },
        later: { inSeasons: 3, text: "The hypercar programme wins everything for three years. You watch it from a simulator.", effect: { rep: { fragile: 2 } } } },
    ], when: isGT },

  { id: "gt-balance", eyebrow: "Sportscars", scene: "The series has adjusted performance again and your car is thirty kilos heavier than it was in March. Half the paddock is briefing journalists about it.",
    question: "A reporter asks you directly.",
    options: [
      { label: "Say the rules are the rules", detail: "Boring. Correct.", outcome: "You give a dull answer and the story dies.",
        effect: { attrs: { consistency: 3 }, rep: { political: 2 } } },
      { label: "Say what everyone's thinking", detail: "Name the teams doing the lobbying.",
        outcome: "You name them. It runs everywhere for a week and the organisers remember.",
        effect: { attrs: { racecraft: 2 }, rep: { mercenary: 3, fragile: 1 } } },
    ], when: isGT },

  /* ---------- the reserve year ---------- */
  { id: "reserve-friday", eyebrow: "Reserve", scene: "You get one Friday practice session all year, in a car set up for someone else, on a track you've never driven. Everyone will read the timesheet and nobody will read the context.",
    question: "Ninety minutes.",
    options: [
      { label: "Send it on low fuel", detail: "One headline lap. Risk the wall.",
        outcome: "You go for the lap.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 55, outcome: "You end up P6 and three tenths off the race driver. Everyone reads the timesheet.", effect: { attrs: { qualifying: 8 }, car: 4 } },
          { w: 45, outcome: "You lose it at the last corner with four minutes left. That's the lap everyone sees.", effect: { attrs: { qualifying: -2, consistency: -3 }, rep: { fragile: 3 } } },
        ] },
      { label: "Run the programme", detail: "Do the job they actually asked for.",
        outcome: "You complete every item on the sheet and hand back a car they learned something from.",
        effect: { attrs: { feedback: 7, consistency: 3 }, rep: { loyal: 3 } } },
    ], when: isReserve },

  { id: "reserve-waiting", eyebrow: "Reserve", scene: "You are twenty-four, race-fit, and have not raced anything for eleven months. A second-tier series has a seat free for the back half of the year. Your team would rather you stayed on call.",
    question: "Being ready and being sharp are different things.",
    options: [
      { label: "Go and race something", detail: "Anything. Just race.",
        outcome: "You take the drive. It's a worse car in a smaller series and you feel like a driver again.",
        effect: { attrs: { racecraft: 6, tyres: 3 }, rep: { mercenary: 2 } },
        later: { inSeasons: 2, text: "The team never quite forgave you for not being at the factory that autumn.", effect: { car: -2 } } },
      { label: "Stay on call", detail: "Be there the day it happens.",
        outcome: "You stay. You spend the season in a simulator and a fireproof suit that never gets dirty.",
        effect: { attrs: { feedback: 5, racecraft: -3 }, rep: { loyal: 4 } },
        later: { inSeasons: 2, text: "Being in the building the week a seat came free is the only reason you got it.", effect: { car: 5 } } },
    ], when: isReserve },

  /* ---------- a team-mate you're at war with ---------- */
  { id: "war-data", eyebrow: "Inside the team", scene: "Data sharing between the two cars is contractual. Your team-mate has started sending his an hour late, always after the setup deadline.",
    question: "You can do the same thing tomorrow.",
    options: [
      { label: "Do it back", detail: "Two can play.", outcome: "You start sending yours late too. The engineers spend the year working around both of you.",
        effect: { attrs: { qualifying: 2, feedback: -4 }, rep: { mercenary: 3 } },
        later: { inSeasons: 2, text: "The team restructure both garages to stop it happening again. Neither of you is trusted with much.", effect: { car: -4 } } },
      { label: "Take it to the principal", detail: "Make it his problem.", outcome: "You raise it formally. It stops within a week and everybody knows who complained.",
        effect: { attrs: { feedback: 3 }, rep: { political: 4 } } },
      { label: "Keep sending yours on time", detail: "Be the one who didn't.",
        outcome: "You keep to the deadline all year. The engineers notice, and engineers talk.",
        effect: { attrs: { feedback: 5, consistency: 2 }, rep: { loyal: 4 } } },
    ], when: atWar },

  { id: "war-crash", eyebrow: "Inside the team", scene: "You've taken each other out. Second time this year. The board have asked the principal for an explanation and he's asking you first.",
    question: "He hasn't decided who to believe yet.",
    options: [
      { label: "Offer a truce", detail: "Publicly, together, and mean it.",
        outcome: "You go to him yourself and suggest a joint statement. It holds, mostly.",
        effect: { attrs: { consistency: 3 }, rep: { political: 3, loyal: 2 } } },
      { label: "Give them the radio", detail: "The recording that makes it his fault.",
        outcome: "You hand over the audio. He's moved on at the end of the year.",
        effect: { rep: { mercenary: 4, political: 2 } },
        later: { inSeasons: 3, text: "Your old team-mate is a team principal now, at a team you needed.", effect: { car: -6 } } },
    ], when: atWar },

  /* ---------- the comeback ---------- */
  { id: "back-pace", eyebrow: "The comeback", scene: "Three races in and you are eight tenths off your team-mate, who is twenty-three. The pace is not coming back the way you assumed it would.",
    question: "Nobody has said anything yet.",
    options: [
      { label: "Change everything", detail: "Setup, style, braking, all of it.",
        outcome: "You rebuild your driving around the car instead of the other way round.",
        effect: { attrs: { tyres: 6, feedback: 4, qualifying: -2 } } },
      { label: "Wait for it to come", detail: "It always came back before.",
        outcome: "You keep doing what always worked.",
        effect: {},
        roll: [
          { w: 45, outcome: "By midseason it has. You out-qualify him at three circuits in a row.", effect: { attrs: { qualifying: 6, racecraft: 4 } } },
          { w: 55, outcome: "It doesn't. The gap is the same in November as it was in March.", effect: { attrs: { qualifying: -4, racecraft: -3 }, rep: { fragile: 2 } } },
        ] },
    ], when: isBack },

  { id: "back-why", eyebrow: "The comeback", scene: "An interviewer asks, live, why you came back at all, whether it was money, or ego, or because you had nothing else.",
    question: "It's a fair question and you've been avoiding it.",
    options: [
      { label: "Be honest", detail: "Say the real reason out loud.",
        outcome: "You tell the truth: you stopped too early and it's been eating you since.",
        effect: { attrs: { consistency: 4 }, rep: { loyal: 3 } } },
      { label: "Give the professional answer", detail: "Say nothing, warmly.",
        outcome: "You give a smooth non-answer. It's a good clip and it says nothing at all.",
        effect: { rep: { political: 4 } } },
    ], when: isBack },

  /* ---------- junior ---------- */
  { id: "kart-engine", eyebrow: "Junior", scene: "The engine builder everyone uses has one good motor left this month, and two customers who want it. You've been with him longer. The other family are paying double.",
    question: "He's asking you what he should do, which means he's already decided.",
    options: [
      { label: "Match the money", detail: "It's your parents' savings.",
        outcome: "Your parents find the money. Nobody talks about what it came out of.",
        effect: { car: 5, rep: { mercenary: 1 } },
        later: { inSeasons: 2, text: "The budget for your second season is thinner than it should have been.", effect: { car: -3 } } },
      { label: "Let them have it", detail: "Race the motor you've got.",
        outcome: "You take the older engine and beat the kid with the new one twice.",
        effect: { attrs: { racecraft: 5, tyres: 3 }, rep: { loyal: 3 } } },
    ], when: isJunior },

  { id: "coach", eyebrow: "Junior", scene: "A former driver offers to coach you. He is very good and openly says he'll be hard on you, video after every session, no excuses accepted, and he'll tell your parents everything.",
    question: "You are sixteen.",
    options: [
      { label: "Take him on", detail: "A year of being told what's wrong with you.",
        outcome: "It's the worst year you've had and you come out of it two tenths quicker everywhere.",
        effect: { attrs: { consistency: 6, feedback: 4, racecraft: 3 } } },
      { label: "Keep doing it your way", detail: "It's got you this far.",
        outcome: "You pass. You keep the parts of your driving that are yours, good and bad.",
        effect: { attrs: { qualifying: 5, consistency: -2 }, rep: { fragile: 1 } } },
    ], when: isJunior },

  { id: "team-fold", eyebrow: "Junior", scene: "Your team has run out of money four rounds from the end. The mechanics haven't been paid. There is a truck, a car, and nobody to run it.",
    question: "Somebody has to decide whether the season ends here.",
    options: [
      { label: "Race anyway", detail: "Unpaid crew, borrowed tyres.",
        outcome: "The mechanics turn up anyway. You finish the season on goodwill and other people's spares.",
        effect: { attrs: { racecraft: 4, feedback: 3 }, rep: { loyal: 5 } },
        later: { inSeasons: 2, text: "Two of those mechanics are now at a front-running team, and they remember who stayed.", effect: { car: 5 } } },
      { label: "Find another seat", detail: "Get out before it collapses.",
        outcome: "Your manager places you elsewhere within a fortnight. The truck never moves again.",
        effect: { car: 3, rep: { mercenary: 3 } } },
    ], when: isJunior },

  /* ---------- F1 ---------- */
  { id: "number-one", eyebrow: "F1", scene: "The team want to declare a number one driver for the second half of the season. You're eleven points ahead of your team-mate. They'd like it to be you, and they'd like you to ask for it.",
    question: "Asking is the part that costs.",
    options: [
      { label: "Ask for it", detail: "Get it in writing.",
        outcome: "You ask. You get it, and the garage knows exactly what kind of driver you are.",
        effect: { car: 5, rep: { political: 4, mercenary: 2 } },
        later: { inSeasons: 2, text: "When your form dips, the same clause is used to make somebody else number one.", effect: { car: -5 } } },
      { label: "Say let it be decided on track", detail: "Eleven points is eleven points.",
        outcome: "You tell them to leave it open. It stays close all year.",
        effect: { attrs: { racecraft: 4, consistency: 3 }, rep: { loyal: 3 } } },
    ], when: isF1 },

  { id: "title-last-lap", eyebrow: "F1 · final lap", scene: "You need to finish ahead of him to win the championship. He is half a second behind with two corners left and he is not going to lift.",
    question: "Neither of you has to yield.",
    options: [
      { label: "Leave him no room", detail: "Win it or wreck it.",
        outcome: "You take the racing line and close the door.",
        effect: { rep: { fragile: 2, mercenary: 2 } },
        roll: [
          { w: 50, outcome: "He backs out with two wheels on the grass. You take the flag and the title.", effect: { attrs: { racecraft: 6, qualifying: 2 } } },
          { w: 30, outcome: "You touch. Both of you finish, wings hanging off, and the stewards spend four hours on it.", effect: { attrs: { racecraft: 2, consistency: -4 } } },
          { w: 20, outcome: "You're both in the gravel and the championship goes to a third driver watching from behind.", effect: { attrs: { racecraft: -3, consistency: -5 }, rep: { fragile: 4 } } },
        ] },
      { label: "Leave the room", detail: "Race him clean and hope it's enough.",
        outcome: "You leave a car's width and race him properly to the line.",
        effect: { attrs: { racecraft: 3, consistency: 4 }, rep: { loyal: 4 } },
        roll: [
          { w: 55, outcome: "He can't quite get by. You win it the way you wanted to.", effect: { attrs: { racecraft: 3 } } },
          { w: 45, outcome: "He gets the run out of the last corner and beats you by a car length.", effect: { attrs: { consistency: 2 }, rep: { loyal: 2 } } },
        ] },
    ], when: () => tier >= 6 },

  { id: "sponsor-politics", eyebrow: "F1", scene: "A title sponsor's country is in the news for the wrong reasons. Drivers are being asked to comment, and yours is the only team not to have said anything.",
    question: "Your contract has a clause about bringing the team into disrepute.",
    options: [
      { label: "Say something anyway", detail: "Accept the fine.",
        outcome: "You answer honestly and the team fine you a week's pay.",
        effect: { rep: { mercenary: 2, fragile: 1 } },
        later: { inSeasons: 2, text: "Two other drivers say later that you made it easier for them to speak.", effect: { rep: { political: 3 } } } },
      { label: "Stay out of it", detail: "Not your fight, not this year.",
        outcome: "You decline to comment, repeatedly and politely.",
        effect: { attrs: { consistency: 2 }, rep: { political: 3 } } },
    ], when: isF1 },

  { id: "fuel-save", eyebrow: "F1", scene: "You're running third with twelve laps left and the pit wall tell you to lift and coast to make the finish. The car behind isn't saving anything.",
    question: "They may be wrong. They have been before.",
    options: [
      { label: "Ignore them and race", detail: "Trust the fuel is there.",
        outcome: "You keep racing.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 50, outcome: "You make the flag with a lap's worth in the tank. They were being cautious and you were right.", effect: { attrs: { racecraft: 5, feedback: 3 } } },
          { w: 50, outcome: "You run dry on the last lap. Third becomes eleventh in about ninety seconds.", effect: { attrs: { racecraft: -2, tyres: -2, consistency: -3 } } },
        ] },
      { label: "Do what they say", detail: "Lose the place, make the finish.",
        outcome: "You lift and coast. He's past within two laps and you finish fourth with fuel to spare.",
        effect: { attrs: { tyres: 5, consistency: 3 }, rep: { loyal: 3 } } },
    ], when: isF1 },

  /* ---------- any stage ---------- */
  { id: "manager", eyebrow: "Off-track", scene: "Your manager has done well by you and is now managing three drivers who want the same seats as you. He says he can handle it. Everyone says that.",
    question: "The other two are younger.",
    options: [
      { label: "Stay with him", detail: "He got you here.",
        outcome: "You stay. He does handle it, mostly, and you never quite stop wondering.",
        effect: { rep: { loyal: 4 } },
        roll: [
          { w: 60, outcome: "He puts you first when it counts.", effect: { car: 4 } },
          { w: 40, outcome: "One of the younger two ends up in the seat you were promised.", effect: { car: -4, rep: { fragile: 1 } } },
        ] },
      { label: "Find someone exclusive", detail: "Start again with a smaller name.",
        outcome: "You leave and sign with someone hungrier who has only you.",
        effect: { attrs: { consistency: 2 }, rep: { mercenary: 3 } } },
    ] },

  { id: "training", eyebrow: "Winter", scene: "A physio has looked at your neck and told you that the way you train is storing up a problem for your mid-thirties.",
    question: "You're twenty-six and it hurts now, too.",
    options: [
      { label: "Overhaul the programme", detail: "Slower this year. Longer career.",
        outcome: "You rebuild your training around the injury. You lose a winter of conditioning.",
        effect: { attrs: { consistency: -2, tyres: 3, feedback: 2 } },
        later: { inSeasons: 3, text: "The neck holds. Several drivers your age are managing something that no longer bothers you.", effect: { attrs: { racecraft: 4, consistency: 4 } } } },
      { label: "Push through it", detail: "Deal with it later.",
        outcome: "You carry on. It's fine, and it's louder every year.",
        effect: { attrs: { racecraft: 4, qualifying: 2 }, rep: { fragile: 2 } },
        later: { inSeasons: 3, text: "The neck is now the first thing you think about on a Sunday morning.", effect: { attrs: { consistency: -5, tyres: -3 } } } },
    ] },

  { id: "documentary", eyebrow: "Off-track", scene: "A streaming series wants to make you one of their three main characters this season. Total access, including the debriefs where you're told what you did wrong.",
    question: "The exposure is real, and so are the cameras.",
    options: [
      { label: "Let them in", detail: "Everything, including the bad days.",
        outcome: "They film everything. You come across better than you feared and more honest than you meant.",
        effect: { attrs: { consistency: -2 }, rep: { political: 4 } },
        later: { inSeasons: 2, text: "The series made you famous outside the sport. Sponsors call your manager now.", effect: { car: 4 } } },
      { label: "Keep the debriefs private", detail: "Access, but not that.",
        outcome: "You give them the paddock and keep the engineering room. They lose interest by round six.",
        effect: { attrs: { feedback: 4 }, rep: { loyal: 2 } } },
    ] },

  { id: "young-team", eyebrow: "Contract", scene: "A brand new team is entering next year. No history, no results, no idea whether they'll still exist in three seasons, and they want you as their first signing.",
    question: "It would be your team from day one.",
    options: [
      { label: "Sign the new team", detail: "Build it, or go down with it.",
        outcome: "You sign.",
        effect: { rep: { loyal: 3 } },
        roll: [
          { w: 40, outcome: "They're organised, funded and quick within two years. You're the reason the good people joined.", effect: { car: 8, attrs: { feedback: 5 } } },
          { w: 60, outcome: "It's chaos. Parts arrive late, the wind tunnel numbers are fiction, and you spend a year qualifying last.", effect: { car: -6, attrs: { racecraft: 4, feedback: 3 } } },
        ] },
      { label: "Stay somewhere real", detail: "Boring, and it exists.",
        outcome: "You stay put. The new team sign somebody else and you read about them all year.",
        effect: { attrs: { consistency: 3 } } },
    ], when: () => tier >= 3 },

  { id: "test-crash-2", eyebrow: "Mid-season", scene: "A rival has been complaining to the stewards about your defending. Nothing has been upheld, but the stewards have started watching your onboards first.",
    question: "There's a corner coming this weekend where you always take the inside late.",
    options: [
      { label: "Defend the way you always have", detail: "Make them prove it.",
        outcome: "You defend exactly as before.",
        effect: {},
        roll: [
          { w: 50, outcome: "Nothing is called all weekend and the complaints stop being taken seriously.", effect: { attrs: { racecraft: 5 }, rep: { mercenary: 1 } } },
          { w: 50, outcome: "You get a ten-second penalty for something you've done a hundred times.", effect: { attrs: { racecraft: -2, consistency: -2 }, rep: { fragile: 2 } } },
        ] },
      { label: "Adjust it", detail: "Give them nothing to look at.",
        outcome: "You start defending a car's width earlier. It costs you two positions across the year and nothing else.",
        effect: { attrs: { consistency: 4, racecraft: -1 }, rep: { political: 2 } } },
    ], when: () => tier >= 3 },
];

DECISIONS.push(...EXTRA_DECISIONS);

/* =========================================================
   A further batch, weighted towards the middle of a career
   and the things a season throws at you.
   ========================================================= */

const EXTRA_TWO: Decision[] = [
  { id: "clause-called", eyebrow: "Contract", scene: "The clause in your contract has been triggered. A rival team has paid the fee and your current team cannot stop it, and did not try very hard.",
    question: "You find out from a journalist.",
    options: [
      { label: "Go, and say nothing", detail: "Take the seat. Keep the grievance.",
        outcome: "You move without comment. The old team's statement thanks you warmly.",
        effect: { car: 4, rep: { political: 2 } } },
      { label: "Say they let you go", detail: "Publicly, on the record.",
        outcome: "You tell the truth about who did not fight to keep you.",
        effect: { attrs: { racecraft: 2 }, rep: { mercenary: 3 } },
        later: { inSeasons: 2, text: "Your honesty about that transfer is quoted back at you in every contract meeting since.", effect: { car: -2 } } },
    ], when: () => tier >= 4 },

  { id: "loan-out", eyebrow: "Mid-season", scene: "The loan clause has been used. You are being placed at another team for the rest of the year, in a worse car, to keep a sponsor happy.",
    question: "Nobody asked you.",
    options: [
      { label: "Go and win them over", detail: "New garage, new people, prove it again.",
        outcome: "You arrive as an inconvenience and leave as the reason they had a good year.",
        effect: { attrs: { feedback: 5, racecraft: 4 }, car: -3, rep: { loyal: 3 } },
        later: { inSeasons: 2, text: "The team you were loaned to want you permanently, and they are paying.", effect: { car: 6 } } },
      { label: "Refuse to go", detail: "Sit the season out if you have to.",
        outcome: "You refuse. Lawyers get involved and you miss four rounds.",
        effect: { attrs: { racecraft: -3, consistency: -2 }, rep: { mercenary: 4, fragile: 2 } } },
    ], when: () => currentSeat?.clause.id === "loan" || tier >= 4 },

  { id: "second-driver-clause", eyebrow: "Mid-season", scene: "Your contract says you move over if the other car is fighting for something. The other car is now fighting for something, and you are quicker.",
    question: "The radio call is coming this weekend.",
    options: [
      { label: "Honour it", detail: "You signed it.",
        outcome: "You move over. You keep doing it for eleven rounds.",
        effect: { attrs: { consistency: 4 }, rep: { loyal: 5 } },
        later: { inSeasons: 2, text: "The team remember you kept to a deal that cost you. The next contract has no such clause.", effect: { car: 5 } } },
      { label: "Ignore it once", detail: "One race. See what happens.",
        outcome: "You stay ahead at the one race you badly wanted.",
        effect: { attrs: { racecraft: 4 }, rep: { mercenary: 3, fragile: 1 } },
        roll: [
          { w: 50, outcome: "They fine you and nothing else changes.", effect: {} },
          { w: 50, outcome: "They put it in writing that you are replaceable, and start looking.", effect: { car: -4 } },
        ] },
    ], when: () => currentSeat?.clause.id === "no-1" || tier >= 5 },

  { id: "media-days", eyebrow: "Off-track", scene: "Forty appearance days is more than three a month, and the team have scheduled six of them in a triple-header week.",
    question: "You can push back once a year without it becoming a story.",
    options: [
      { label: "Do them all", detail: "Smile in six countries.",
        outcome: "You do every one and arrive at the third race running on nothing.",
        effect: { attrs: { consistency: -4 }, rep: { loyal: 3, political: 2 } } },
      { label: "Cancel half of them", detail: "Use the goodwill now.",
        outcome: "You cancel three and the sponsor's people are cold with you for months.",
        effect: { attrs: { consistency: 3 }, rep: { mercenary: 2 } } },
    ], when: () => currentSeat?.clause.id === "media" || tier >= 4 },

  { id: "junior-quicker", eyebrow: "Mid-season", scene: "The team's junior did a Friday session in your car and was two tenths quicker than you were on the same fuel.",
    question: "Everyone in the garage saw the trace.",
    options: [
      { label: "Ask for his data", detail: "Learn from a nineteen-year-old.",
        outcome: "You go through his lap corner by corner. He is braking later at three of them and it works.",
        effect: { attrs: { qualifying: 6, feedback: 3 } } },
      { label: "Put it down to fuel", detail: "Say nothing, believe nothing.",
        outcome: "You dismiss it publicly. Privately it sits with you all season.",
        effect: { attrs: { consistency: -3, racecraft: 2 }, rep: { fragile: 2 } } },
    ], when: () => tier >= 4 && age >= 27 },

  { id: "weather-call", eyebrow: "Mid-season", scene: "Qualifying is drying and there is one lap left. Slicks are half a second quicker if the last sector has dried, and four seconds slower if it has not.",
    question: "Your engineer will not make the call for you.",
    options: [
      { label: "Slicks", detail: "Bet on the sector.",
        outcome: "You take slicks.",
        effect: {},
        roll: [
          { w: 45, outcome: "It has dried. Pole by three tenths, and nobody else even gets a lap in.", effect: { attrs: { qualifying: 8, wet: 4 } } },
          { w: 55, outcome: "It has not. You cross the line seventeenth and the team say nothing on the radio.", effect: { attrs: { qualifying: -3, wet: 2 } } },
        ] },
      { label: "Stay on wets", detail: "Bank a lap you know is there.",
        outcome: "You bank the lap. Sixth, and no drama.",
        effect: { attrs: { consistency: 3, wet: 2 } } },
    ] },

  { id: "team-radio-leak", eyebrow: "Off-track", scene: "A radio message of yours, sworn at and unflattering about the pit wall, has been broadcast and clipped everywhere.",
    question: "You did say it.",
    options: [
      { label: "Own it", detail: "It was a bad day and you meant it.",
        outcome: "You own it without excuses. It becomes a shirt within a fortnight.",
        effect: { rep: { political: 2, mercenary: 1 } } },
      { label: "Apologise to the wall privately", detail: "Fix the relationship, ignore the noise.",
        outcome: "You apologise to the people it was actually about and say nothing publicly.",
        effect: { attrs: { feedback: 4 }, rep: { loyal: 3 } } },
    ], when: () => tier >= 4 },

  { id: "final-seat", eyebrow: "Late career", scene: "One seat is left on the grid for next year and there are three of you in the running. Two are younger than you and one of them is quicker.",
    question: "Your manager wants to know how hard to push.",
    options: [
      { label: "Push with everything", detail: "Call in every favour you have.",
        outcome: "You spend every bit of goodwill you have accumulated.",
        effect: { rep: { political: 4 } },
        roll: [
          { w: 55, outcome: "It works. You get the seat and owe several people something unspecified.", effect: { car: 4 } },
          { w: 45, outcome: "It does not. Everyone now knows how badly you wanted it.", effect: { rep: { fragile: 2 } } },
        ] },
      { label: "Let the results argue", detail: "If it is not enough, it is not enough.",
        outcome: "You do nothing except drive well, and wait.",
        effect: { attrs: { consistency: 4 }, rep: { loyal: 2 } } },
    ], when: () => age >= 31 },
];

DECISIONS.push(...EXTRA_TWO);

/* =========================================================
   A third batch: the reserve year, sportscars, IndyCar,
   and the parts of a season that had nothing in them.
   ========================================================= */

const EXTRA_THREE: Decision[] = [
  { id: "res-call", eyebrow: "Reserve", scene: "A race driver has food poisoning and you are being put in the car with ninety minutes until qualifying. The seat is not moulded to you and the pedals are wrong.",
    question: "Nobody expects anything except that you finish.",
    options: [
      { label: "Drive within yourself", detail: "Bring it home, learn the car.",
        outcome: "You drive a careful weekend and hand back a car with no marks on it.",
        effect: { attrs: { consistency: 5, feedback: 3 }, rep: { loyal: 3 } } },
      { label: "Treat it as an audition", detail: "One chance, take it.",
        outcome: "You attack it.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 50, outcome: "You out-qualify the other car and the paddock talks about nothing else for a week.", effect: { attrs: { qualifying: 8, racecraft: 4 }, car: 4 } },
          { w: 50, outcome: "You overdrive it, put it in the gravel on Saturday, and the story writes itself.", effect: { attrs: { qualifying: -2, consistency: -3 }, rep: { fragile: 3 } } },
        ] },
    ], when: isReserve },

  { id: "res-loyalty", eyebrow: "Reserve", scene: "A rival team offer you a race seat at the back of the grid for next year. Your team say wait, their seat comes free in two seasons, probably.",
    question: "Probably is doing a lot of work in that sentence.",
    options: [
      { label: "Take the race seat", detail: "A bad car you actually drive.",
        outcome: "You take it. Racing badly beats not racing.",
        effect: { seat: "worse", attrs: { racecraft: 5 }, rep: { mercenary: 2 } } },
      { label: "Wait for the promise", detail: "Two more years of Fridays.",
        outcome: "You wait.",
        effect: { rep: { loyal: 4 } },
        roll: [
          { w: 45, outcome: "The seat comes free exactly when they said it would.", effect: { seat: "better", contract: 2 } },
          { w: 55, outcome: "They sign somebody else's junior and apologise in person.", effect: { attrs: { consistency: -2 }, rep: { fragile: 2 } } },
        ] },
    ], when: isReserve },

  { id: "res-sim", eyebrow: "Reserve", scene: "You have run every setup the engineers asked for and one they did not. Yours is quicker, and admitting you tried it means admitting you went off programme.",
    question: "The race drivers are two tenths off all weekend.",
    options: [
      { label: "Hand it over", detail: "Tell them what you did.",
        outcome: "You own up and give them the numbers. They use it that weekend.",
        effect: { attrs: { feedback: 7 }, rep: { loyal: 3, political: 1 } } },
      { label: "Keep it for yourself", detail: "For when you get the car.",
        outcome: "You say nothing and file it away.",
        effect: { attrs: { qualifying: 4, feedback: 2 }, rep: { mercenary: 2 } } },
    ], when: isReserve },

  { id: "indy-oval", eyebrow: "IndyCar", scene: "Your first oval. Four laps of practice in and you have not lifted, which everyone tells you is the easy part.",
    question: "The wall does not move.",
    options: [
      { label: "Trust it and commit", detail: "Flat, all four corners, all race.",
        outcome: "You commit.",
        effect: { rep: { fragile: 1 } },
        roll: [
          { w: 60, outcome: "By lap forty it feels normal, and you spend the last stint learning where the air goes.", effect: { attrs: { racecraft: 6, consistency: 3 } } },
          { w: 40, outcome: "You catch a tow wrong at 220mph and end the day in the fence.", effect: { attrs: { consistency: -4 }, rep: { fragile: 3 } } },
        ] },
      { label: "Build up to it", detail: "Lift, learn, repeat.",
        outcome: "You build up over two race weekends and arrive at the same place, slower.",
        effect: { attrs: { consistency: 5, tyres: 2 } } },
    ], when: isIndy },

  { id: "indy-500", eyebrow: "Indianapolis", scene: "Qualifying for the 500 is four laps at absolute maximum with a car trimmed until it barely wants to turn. There is a setting the engineer will use if you tell him to.",
    question: "It is worth half a row, and it makes the car horrible.",
    options: [
      { label: "Trim it out", detail: "Four terrifying laps.",
        outcome: "You have him trim it.",
        effect: {},
        roll: [
          { w: 55, outcome: "Four laps that feel like an hour, and you are on the front two rows.", effect: { attrs: { qualifying: 9, racecraft: 3 } } },
          { w: 45, outcome: "The car is unmanageable and you abort on lap two. You start deep in the field.", effect: { attrs: { qualifying: -3 } } },
        ] },
      { label: "Keep it drivable", detail: "Qualify midfield, race well.",
        outcome: "You keep downforce in it, qualify eleventh, and can actually follow people on Sunday.",
        effect: { attrs: { racecraft: 5, tyres: 3 } } },
    ], when: isIndy },

  { id: "gt-am", eyebrow: "Sportscars", scene: "Your amateur co-driver has just handed the car over four laps down after a spin, and there is a television camera pointed at your face.",
    question: "He is standing right there.",
    options: [
      { label: "Take the blame yourself", detail: "Say the setup was your call.",
        outcome: "You say the balance was your fault. Everyone in the garage knows it was not.",
        effect: { rep: { loyal: 5 } },
        later: { inSeasons: 2, text: "Your co-driver funds a second car the following year, and asks for you in it.", effect: { car: 5 } } },
      { label: "Say nothing and drive", detail: "Get the laps back.",
        outcome: "You say nothing, get in, and take three of the four laps back before the flag.",
        effect: { attrs: { racecraft: 6, tyres: 3 } } },
    ], when: isGT },

  { id: "gt-factory", eyebrow: "Sportscars", scene: "The manufacturer want you at the factory for three weeks of development on next year's car, which means missing two races of this one.",
    question: "You are second in the championship.",
    options: [
      { label: "Go to the factory", detail: "Next year's car, this year's points.",
        outcome: "You go. The championship goes with it, and next year's car is built around how you drive.",
        effect: { car: 6, attrs: { feedback: 6 }, rep: { loyal: 3 } } },
      { label: "Race the season out", detail: "Finish what you started.",
        outcome: "You stay in the car and fight the championship to the last round.",
        effect: { attrs: { racecraft: 4, consistency: 3 }, rep: { mercenary: 1 } } },
    ], when: isGT },

  { id: "night-stint", eyebrow: "Endurance", scene: "Four in the morning, seventh hour of rain, and the team ask if you want out. You have been in the car for three stints.",
    question: "The next driver is awake but not warm.",
    options: [
      { label: "Stay in", detail: "You know where the grip is.",
        outcome: "You stay in for two more stints and give the car back four places better off.",
        effect: { attrs: { wet: 8, tyres: 4, consistency: -2 }, rep: { loyal: 3 } } },
      { label: "Hand it over", detail: "Sleep, and come back sharp.",
        outcome: "You hand over and sleep for ninety minutes. It is the right call and it costs two places.",
        effect: { attrs: { consistency: 5 } } },
    ], when: isGT },

  { id: "mid-title-fight", eyebrow: "Mid-season", scene: "You lead the championship by nine points with five to go, and the team want to change the car's concept to something they think is faster.",
    question: "It might be. It might take four races to work.",
    options: [
      { label: "Change it", detail: "Chase the pace.",
        outcome: "You take the new package.",
        effect: {},
        roll: [
          { w: 50, outcome: "It works from the first session and you close the season out comfortably.", effect: { car: 5, attrs: { racecraft: 2 } } },
          { w: 50, outcome: "It takes three races to understand and the lead is gone by the time it does.", effect: { car: -3, attrs: { consistency: -2 } } },
        ] },
      { label: "Keep what you have", detail: "Win it with a known car.",
        outcome: "You keep the car you understand and grind out the points.",
        effect: { attrs: { consistency: 5, tyres: 2 } } },
    ], when: () => tier >= 4 },

  { id: "young-manager", eyebrow: "Off-track", scene: "Your manager of nine years wants to retire. His replacement is thirty, hungry, and has never negotiated a Formula 1 contract.",
    question: "He knows every principal on the grid. She does not, yet.",
    options: [
      { label: "Stay with the firm", detail: "New face, same contacts.",
        outcome: "You stay. She is better than anyone expected within a year.",
        effect: { rep: { loyal: 3, political: 2 } } },
      { label: "Represent yourself", detail: "Nobody knows what you want better than you.",
        outcome: "You take your own meetings. Some go very well and some are excruciating.",
        effect: { attrs: { feedback: 3 }, rep: { mercenary: 3, political: 2 } } },
    ], when: () => tier >= 4 },

  { id: "kart-parents", eyebrow: "Junior", scene: "Your parents have remortgaged to keep the season going and have not told you. You found the paperwork.",
    question: "There are four rounds left.",
    options: [
      { label: "Say you know", detail: "Talk about it properly.",
        outcome: "You bring it up. It is the worst conversation of your life and something changes afterwards.",
        effect: { attrs: { consistency: 4, feedback: 2 }, rep: { loyal: 4 } } },
      { label: "Say nothing and win", detail: "Make it worth it.",
        outcome: "You say nothing and drive like the season depends on it, because it does.",
        effect: { attrs: { qualifying: 5, racecraft: 4, consistency: -2 }, rep: { fragile: 2 } } },
    ], when: isJunior },

  { id: "f1-boycott", eyebrow: "F1", scene: "The drivers are being asked to sign a joint statement about safety at a circuit the promoter refuses to change. Two of the biggest names have not signed.",
    question: "Your team would rather this went away.",
    options: [
      { label: "Sign it", detail: "With everyone who did.",
        outcome: "You sign. The circuit is changed eighteen months later.",
        effect: { rep: { loyal: 3, political: 3 } } },
      { label: "Stay out of it", detail: "Not your fight this year.",
        outcome: "You do not sign, and the drivers who did notice who did not.",
        effect: { rep: { mercenary: 2 } },
        later: { inSeasons: 2, text: "The drivers who signed that statement look after each other now. You are not in that group.", effect: { rep: { political: -2 } } } },
    ], when: isF1 },
];

DECISIONS.push(...EXTRA_THREE);
