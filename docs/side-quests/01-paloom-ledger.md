## Quest title

The Salt Book.

Paloom's tally clerks keep a day book the collector is allowed to see and a second book that says who the harbor has agreed to miscount. The quest is sitting in their loft, reading that second book line by line, and deciding whether those lines are burned, copied into the open record, or sealed into the wall. Nobody carries anything out of the room. Nothing is fought.

## Existing-world touchpoint

Paloom is the western harbor town already on the world map at (6, 24), map id `paloom`, on the same grass as Altair. The party can walk there as soon as the scripted opening ambush is over. No ship, pass, or password is required.

The town already has an innkeeper, a shopkeeper, and a priest on the shared service tiles, a sailor on the hall tile at (4, 6), and Leila on the square tile at (8, 4) until her existing recruitment takes her away. The sailor already sells passage to Poft for 50 gil once the main plot has made the packet available, and he refuses wanderers before that. This quest does not use his tile, change his lines, or sell passage of its own. The clerks' only new seam in the town is a stair at (12, 8), with Clerk Holm standing beside it at (12, 7) until the loft has been entered. Those tiles do not overlap the sailor, Leila, the services, the spawn at (2, 9), or the exit at (1, 10).

The loft is not a new world location. It does not appear in `LOCATIONS`, and Travel never lists it. Leave from the loft uses the ordinary leave-map path: the loft's `locationId` must be `paloom`, so Leave deposits the party on the world map at Paloom, not at Altair. The stair is the way back down into the town.

## Premise

Merrick Dass is the chief tally clerk. His niece Nia writes at night what he will not sign by day. Holm, who trained Merrick and is now retired, still comes up the stair to argue for a harbor that keeps only one book. Between them is a desk, a lamp, an iron box, and two ledgers.

The day book is dull on purpose. Packet fares are recorded there as the sailor's business, not the clerks'. The imperial harbor levy is marked paid in full. Three casks of salt are condemned and tipped off the west jetty. A young man named Bren is entered as drowned off the nets. Strangers are entered as not worth the ink.

The salt book is the other set. The casks are Joss, a net-mender, and two grandchildren whose names he would not give the clerks, hidden from a press-gang that counts heads on that jetty at dusk. Bren is alive on the east wharf; Anwen paid Merrick the last of a funeral to drown him on paper, because a bounty is paid when a deserter who is officially dead is found breathing. The levy line is short by two hundred and fifty gil, and that shortage bought both mercies. It sits in the box under the desk. The last line of the salt book is unfinished: "Three, Fynn road." Nia means Firion, Maria, and Guy, and she has stopped with the pen in the air.

The collector does not appear. "Dawn" is not a timer. It is the name the clerks give to the moment someone in this room chooses what the second book physically is. Until that moment the party may leave, fight the war, and come back. The lines wait.

## Why the player becomes involved

Everyone on the payroll is already a line in one of the books, so each of them will protect the sentence that keeps them fed. Holm says so on the wharf, without handing over an item and without asking for a password: "The loft keeps two books. One of them is a harbor. The other is a conscience. If you can read, they will make you finish a sentence. I would not."

Nia wants a reader who will leave Paloom afterward and therefore will not have to sleep under the sentence they write. She hates that this is the only judge the loft can afford. Merrick will add a column and will not make it good. He sits the party down because he is done choosing which of his neighbors remains uncounted. The party may refuse by walking out. The stair stays. The main road never notices.

No one in the loft asks whether the party serves the rebellion or the empire. Rebels and collectors both like a count. The clerks are asking whether these particular people get to remain a bad sum.

## Key NPCs

All three are new, local, and alive at the end of every resolution. None of them joins, leaves the loft for another town, or stands in for a canon figure. People named in the book — Joss, his grandchildren, Anwen, and Bren — are never sprites. The party meets them only as ink, and hears what the ink did to them only from the clerks. That is deliberate. A face on the jetty would let the player dodge the page.

**Merrick Dass** (`paloom-merrick`), inside the loft at (5, 3). Middle-aged, ink under the nails, finished with speeches about mercy. He took Anwen's money and he says so. He will explain the desk, repeat what is still unfinished, and, when every line and the box have been dealt with, state the last choice. He will not pick it. After the quest he keeps the stool if the salt book is burned or walled. If the books are made one, he gives Holm the stool and sits on the loft step, alive, and still willing to talk.

**Nia Dass** (`paloom-sera`), inside at (8, 4). Younger, sharper, the hand that actually wrote the salt book. She reads the Joss line and the unfinished line about the party, because those are hers. She will not thank the player for a kindness that cannot be proved, and she will not pretend a clean day book is anything but a warrant. She is not a romance and not a recruit. Her intimacy is the names.

**Clerk Holm** (`paloom-holm`), at (12, 7) in Paloom until `saltLoftEntered`, then only inside the loft at (3, 3). Old, dry, sincere in the unpleasant way. He believes a second column is how clerks get hanged and how harbors sink. He reads the skim aloud because he wants it put back. He is not an imperial officer and never becomes one. If the books are unified he takes the stool as a job, not as a victory parade.

The day book (`paloom-day-book`) at (6, 3), the salt book (`paloom-salt-book`) at (7, 3), and the iron box (`paloom-iron-box`) at (5, 5) are talkable objects, not chests and not inventory items. Choice slips are also NPCs, because Talk currently takes a person and an optional keyword, not a dialogue branch. They use short labels so the existing nameplates can carry them: Strike, File, and Leave while a line is open; Return, Names, and Pocket beside the box; Burn, One Book, and Wall after Merrick opens the last choice. A keyword asked of any of these people does nothing to the flags and teaches nothing. They answer with the ordinary "nothing new to say about that" line.

## New locations or spaces

One interior, map id `paloom-tally`, display name "Tally Room." Build it on its own, after the shared town loop, and push a stair only onto `maps.paloom`. Do not add the stair inside `openArea`, or every town inherits the loft.

The room is 10 by 8, walls on the border, floor otherwise, `encounterRate` 0, no wild table, no boss, no chests, no lock. `locationId` is `paloom`. Spawn at (2, 6). The return stair is at (1, 6) and leads to Paloom at (12, 8). The Paloom stair at (12, 8) leads to (2, 6). Taking that stair sets `saltLoftEntered`.

Add `paloom-tally` to the town set in `canSaveHere`. Otherwise the loft is the one room in a town where the ordinary save rule fails. Saving here must not write a phase, an objective, or a keyword.

Dressing is a desk, a lamp, two books, and a box. No cells, no jetty fight, no second harbor map. The west jetty and the east wharf exist only in sentences.

## Quest progression / major beats

Flags are booleans, matching `GameState.flags`. Absence of a flag is false. No string states, no step timer, no phase check beyond "the party can already be in Paloom," which already excludes the opening ambush. Clerk lines do not change with phase, guests, or the ferry. Leon is never written into the book. Guests are never written into it either, even when one of them is standing in the room.

Suggested flag set: `saltLoftEntered`; `saltDayRead`; `saltJossRead`, `saltJossStrike`, `saltJossFile`, `saltJossLeave`; the same four for `saltBren` and `saltParty`; `saltSkimRead`, `saltSkimReturn`, `saltSkimNames`, `saltSkimPocket`; `saltOpenJoss`, `saltOpenBren`, `saltOpenParty`, `saltOpenBook`; `saltBurn`, `saltFileBook`, `saltWall`; `saltComplete`. A line is marked when exactly one of Strike, File, or Leave is set. Opening a line clears the other `saltOpen*` flags. Choosing a mark clears the other two marks for that line and clears its open flag. The same mutual exclusion applies to the box and to the book's fate.

### Beginning

Holm on the wharf delivers the warning above. He does not set a start flag. The party climbs the stair. Merrick, if talked to before the day book is read, says: "Sit. The day book is the harbor I can show a collector. The other one is the harbor I can stand. Read both. Then you will do the thing I will not." Nia says: "Don't ask me to be brave for them. I already wrote them down, which was cowardice with a pen." Holm says: "If you wanted a clean conscience, you missed this coast by a lifetime. Read. Then pick the version that lets someone sleep."

Talking to the day book sets `saltDayRead` and gives the public page, in this sense if not in one unbroken speech: packet fares sit with the sailor and this desk does not sell them; the levy is entered as paid in full; three casks of salt were condemned and tipped off the west jetty; Bren, son of Anwen, is lost off the nets, with no body; strangers are not worth the ink. The salt book refuses to open before that flag. Merrick: "Read the lie first. Otherwise you will think the truth is the only book in the room."

### Escalation

The salt book is read in order. Each talk reveals the next unread entry only if the previous obligation is settled. Leaving the loft, resting, or crossing the world does not clear flags.

First talk, Joss, read by Nia, sets `saltJossRead` and `saltOpenJoss`, and spawns Strike, File, and Leave: "Three casks of salt, condemned, west jetty. That is the day book. In this one the casks have a name. Joss, who mends other people's nets, and his two grandchildren, whose names he would not give me. The press-gang counts heads on that jetty at dusk. A cask has no head. He paid with the net he works in. Strike this and the next pair of hands at this desk owes him nothing. Copy it into the day book and he becomes a person the gang can count. Leave it here and he stays a secret we can still sell."

Until Joss is marked, another talk to the salt book does not advance. Merrick: "Finish the line you opened." Re-talking an already marked entry reopens its slips, so the party can change the mark until the quest is completed.

Second, Bren, read by Merrick, once Joss is marked: "Anwen paid me to drown her son on paper. The day book says Bren is lost off the nets. He is on the east wharf, breathing, answering to nobody. The money was the last of a funeral she will not get to hold. There is a bounty when a drowned deserter is found alive. I took the coins. I am still taking the lie. Do not dress it up for me. Strike him out of this book, copy him into the open one, or leave him where only we are guilty." Same three slips, writing the `saltBren*` flags.

Third, the skim, read by Holm, once Bren is marked. This entry has no Strike / File / Leave slips. It sets `saltSkimRead` and makes the iron box speak: "The day book tells the collector his levy was paid in full. It was not. The difference is in the iron box under the desk. It bought Joss's casks and Bren's drowning. That is the whole romance of this loft: mercy funded by a theft from an empire that steals more, which does not make the theft clean. The box will not open until you say so. I would put it back. Nia would feed it to the names. You might keep it. Decide, and then live in the room with us." Return, Names, and Pocket then stand by the box. Their effects are flags only. Gil is not paid yet, so toggling the choice before the end cannot mint coins.

Fourth, the unfinished line, read by Nia, once the box has a flag: "I started a line and stopped. Three, Fynn road. Firion, Maria, Guy. I can strike it and we never knew you. I can copy your living names into the day book, where a collector could someday prove you stood in Paloom. I can leave you in the salt book only. None of those calls a soldier. The ferry does not care. The square does not care. I will care, which is the part you cannot spend." Strike, File, and Leave write the `saltParty*` flags. The filed sentence, if that mark survives into the day book, is exactly: "Alive, this harbor, this day: Firion, Maria, Guy." It never gains a guest, and it never names Leon.

### Climax

When Joss, Bren, and the party line are each marked and the box has one choice, Talk to Merrick sets `saltOpenBook` and speaks: "The lines you marked will stand. What you choose now is the body they stand in. Burn this book, and only what you already copied into the day book survives. File it, and every unstruck line becomes a day-book line, and we stop pretending there were two harbors. Wall it, and the salt book stays true behind the south plank, where an audit does not look and a niece with a nail still can. I will not let you carry it out. This is not an errand. It is a desk."

Burn, One Book, and Wall appear. Line slips hide while `saltOpenBook` is set. The box can still be re-talked until one of the three fate slips is used. Talking to a fate slip sets exactly one of `saltBurn`, `saltFileBook`, or `saltWall`, sets `saltComplete`, clears every `saltOpen*` flag, hides every slip, and pays the reward once.

What "the lines stand" means, mechanically:

- A struck line is gone from the salt book and is not copied later.
- A line already marked File is in the day book from that moment on, and neither fire nor the wall reaches it.
- A line marked Leave is still only in the salt book. Burning destroys it. Walling keeps it behind the plank. Choosing One Book copies every Leave line into the day book and then blanks the salt book.
- The box is independent. Return makes the levy line true and the coins gone. Names means Nia will get the coins to the people named, off the screen, inside Paloom, without the party escorting anyone. Pocket means the two hundred and fifty gil are the party's when the fate slip is chosen, not before.

None of these calls `beginBattle`, sets a bounty, changes encounter tables, or writes `state.objective`.

### Resolution

The three clerks speak the ending in the same room, then remain there for the rest of the game. The day book, talked to again, includes whatever lines actually landed in it. The salt book, talked to again, describes ash, a blank volume on the shelf, or a plank with a loose nail, and repeats the surviving salt lines if it was walled. After One Book, Holm takes the desk at (5, 3) and Merrick moves to (3, 6), beside the stair and not on it. Otherwise Merrick stays at (5, 3) and Holm stays at (3, 3). Nia keeps (8, 4) in every ending.

Baseline speeches assume Joss, Bren, and the party were all marked Leave. Burn: Nia says, "Ash keeps a secret the way a grave keeps a man. Joss is a cask again. Bren is drowned again. You were never here. I will remember the versions where you were kinder on paper, and I will not be able to prove them." Merrick says, "The audit will be boring. That is the wage." Holm says, "One book. I can sleep." One Book: Nia says, "Joss will not wait to be counted. Tonight he takes the children off the jetty in a rowboat that is not the packet and is not anyone's ship. Bren leaves the east wharf under his own name and a bounty that now has a page. I hope you like honesty. It walks." Merrick says, "Holm can have the stool. I am not dead. I am unemployed by my own ink." Holm says, "A harbor is a place that counts. Now it does." Wall: Nia says, "The nail is loose on purpose. Joss stays a cask to the gang and a man to me. Bren stays drowned in the day book and alive on the wharf. You are in the wall with them. If I ever pry it out, that is on me, not on a traveler." Merrick says, "I can live with a wall. I have been living with a drawer." Holm says, "You hid the crime and kept it. Call that what you like."

If a line was struck, Nia does not mourn it as something the fire or the wall could have saved. Joss struck: "You struck Joss before the end. Nothing of his was left for the fire, the shelf, or the wall. He is still on the jetty, and he does not owe this desk a thank-you." Bren struck: he remains a drowned entry in the day book and a living man on the wharf, and Anwen will not look at Merrick. The party struck: "You are not a line. Do not expect that to make you safe. It only makes you unproven." No encounter changes.

If a line was filed early, it is already in the day book when the salt book burns or is walled. Nia says so. Joss filed, whatever the book's body: he still takes that rowboat the same night, alive, off-screen, to no new map and no boardable vehicle. Bren filed: he leaves the east wharf under his own name. The party filed: the day book keeps "Alive, this harbor, this day: Firion, Maria, Guy." Holm adds, "Three names in a levy book. The collector is not a hound. He is a man who can add. Someday he might add you. Not from this desk." No soldiers are spawned, then or on a later visit.

The rowboat is a sentence. It is not the Poft packet, not Leila's ship, and not a vehicle flag. Joss and Bren are never shown dying, never arrested on screen, and never given sprites after the fact.

## Important player choices

The reading is the play. Each choice is Talk aimed at a slip that exists only while that decision is open. Walking away is always available and never fails the quest.

For Joss, for Bren, and for the unfinished line about Firion, Maria, and Guy, the three marks are distinct. Strike erases that line from the salt book and blocks it from ever being copied. File writes it into the day book immediately, where later fire and plaster cannot reach it. Leave keeps it only in the salt book, so the climax decides whether it dies, becomes public, or sits inside the wall. Marks can be changed by reopening the entry until a fate slip is chosen.

The iron box is the second choice, available after Holm has read the shortage. Return puts the coins back and makes the levy line true. Names leaves the coins for Nia to pass to the people in the book, inside Paloom, with no trip and no inventory item. Pocket keeps the shortage for the party. Only one stands, and it can be changed until the fate is locked. Gil is awarded at that locking moment from the flag as it stands then.

The climax is the third choice, and it is the one that ends the quest. Burn, One Book, or Wall. Burn destroys every salt line that was not already struck or filed. One Book copies every remaining Leave line into the day book and blanks the salt book. Wall seals the remaining salt lines behind the south plank and leaves the day book as it already is. Merrick will not open this choice until the three lines and the box are settled. The party cannot take the salt book, the day book, or a page of either into inventory. If they try, he repeats that the books do not leave the room.

## Possible resolutions

**Burn the salt book.** `saltBurn` and `saltComplete`. The salt book is ash. Struck lines were already gone. Filed lines remain in the day book and the fire is not allowed to pretend otherwise. Leave lines die with the salt book: Joss goes back to being a cask the clerks remember and could still betray without paperwork, Bren goes back to being a drowning on the only page an auditor will read, and the party's unfinished line is gone. Merrick keeps the desk. Holm is satisfied that the audit will be boring. Nia stays, and she gets the ash speech, amended by any earlier Strike or File as in the resolution beat. No one is killed. No soldier arrives.

**File the salt book into the day book.** `saltFileBook` and `saltComplete`. One harbor, on purpose. Every unstruck Leave line is copied into the day book, then the salt book is blanked and shelved. Holm takes the stool. Merrick is out of the job and sitting on the step, alive, preferring a smaller lie and saying he was outvoted. Nia keeps the pen. Joss, if his line was not struck, does not wait to be counted: he leaves the same night in the rowboat that is not the packet, with the children, alive, toward no playable place. Bren, if not struck, leaves the east wharf under his own name because the bounty now has a page. If either line was struck, that person never enters the day book and does not flee. If the party line was left or filed, the three names are in the levy book and still call no encounter. The moral result is a record, not a battle.

**Wall the salt book in the loft.** `saltWall` and `saltComplete`. The day book stays as it already stands, including any lines filed early. Everything still only in the salt book goes behind the south plank. Nia keeps the loose nail. Joss and Bren, if still only in that walled book, remain in Paloom as a cask and a drowning, and they are not given sprites. The party's Leave line is in the wall with them. Holm calls it the same crime with dust on it. Merrick keeps the desk and says he can live with a wall. A later talk can read the walled lines back. Nothing in the wall teaches a keyword, opens a road, or alters who will sail, fight, or die in the main plot.

**Return the skim, leave it for the names, or pocket it.** These three are locked at the same moment as the book's fate and do not create a fourth ending of the plot. Return: zero gil, the levy line becomes true, Holm gets the only clean number in the room, and the two mercies are thereafter unpaid kindness. Names: zero gil, Nia says she will get the coins to Joss and Anwen inside the town; if a filing has already sent Joss or Bren away, she says the coins will follow the rowboat and the party does not escort them. Pocket: `state.gil` increases by 250 at lock time, both clerks remember it, and neither of them turns hostile or calls a guard. The band and the single hi-potion are paid on Burn, One Book, and Wall alike, so the crueler book is not the more powerful book. Only the box makes a thief richer.

Any combination of line marks with any one book fate and any one box choice is a legal ending. There is no failure state, no bad flag that soft-locks the loft, and no second climax.

## Gameplay opportunities

The whole quest is Talk, stairs, and the log. It is the counterpart to a dungeon: a room with encounter rate zero where the use-based growth system deliberately does not move, because reading is not a swing and not a spell. Do not add a practice fight to compensate.

The current action shape is `talk` with `npcId` and an optional keyword. Do not encode Strike, File, Leave, Burn, One Book, or Wall as keywords, and do not add them to the fifteen-word list. Slips spawned only while a decision is open let the present Talk verb do the branching. One slip row at a time is enough: (4, 5), (6, 5), and (8, 5) for line marks or for the fate, labels swapped by which `saltOpen*` flag is set; the box's three slips at (4, 6), (6, 6), and (7, 6) can coexist with an open line because they are a different object. Hide fate slips whenever a line is open, so "File" cannot be confused with "One Book."

Books should speak in a few sentences each, as written above, so one log entry can hold them. Do not paginate them into an item. Do not require the Ask menu. Keyword asks on loft NPCs must return before any flag write.

A useful test, in the style of the existing courier test, is: walk to Paloom without setting the ferry flag, enter the loft, read and mark, lock a known combination, and assert phase, objective, keywords, `ferryPass`, `ferryAvailable`, party ids, and guest list are unchanged; assert the band, one hi-potion, and gil moved only as that combination claims; assert a second talk does not pay again; assert Leave from the loft lands on Paloom's world tile. Also assert the sailor's dialogue function was not edited by playing his three existing lines around the quest.

No optional encounter id should be added "for later." The collector is a fear inside a sentence.

## Worldbuilding revealed

Paloom survives occupation as a bad sum. The press-gang's power on the jetty is a headcount, not a warship. People buy a false drowning, a false cargo tally, a false levy. The clerks know exactly how unclean that is. Holm thinks a secret harbor is a harbor that will sink. Nia thinks a single honest book is how you hand your neighbors to a man who can add. Merrick thinks both of them are right and that rightness has never once balanced his desk.

The day book's packet line exists to show the boundary. Passage to Poft is already the sailor's table. The loft does not own it, skim it, or know Cid's business. The empire, in this room, is a collector and a gang with a list, not the great machine of the war. Nothing on either page is a rumor of a weapon, a password, a masked princess, or a ship that flies. The second book is local guilt with a lamp on it.

What the party leaves behind, if they leave anything, is a changed page in a room they can revisit. Ash, one book, or a plank with a nail. Paloom's inn, shop, sanctuary, and packet go on as before. The harbor does not become loyal, liberated, or ruined.

## Rewards

Paid once, on the talk that sets `saltComplete`, for every book fate:

- One **Salt-Ink Band**, new gear id `salt-ink-band`, display name "Salt-Ink Band." `kind: 'accessory'`, `slot: 'accessory'`, `defense: 0`, `eva: 3`, `price: 0`, `shops: []`, `sellable: true`, `origin: 'addition'`. No `mag`, no element, no effect string. Accessory evasion already applies in `evasionOf`; accessory defense and gear `mag` do not apply in the current formulas, so putting them on this band would look like a reward and do nothing. Evasion 3 is a keepsake next to the early bucklers and far under the Rebel Armband's evasion 8, on purpose. It must not be added to any shop list.
- One existing hi-potion, id `hi-potion`. A bottle from the desk, not a discount and not a new consumable.

Paid only if `saltSkimPocket` is the box flag at lock time: 250 gil, added to `state.gil` in that same talk. Return and Names pay no gil. Do not also pay gil on the book fate.

Nothing else. No key item, no weapon, no tome, no vehicle, no guest, no keyword, no change to a shop's goods, no permanent inn discount, no new spell. The band's price of 0 matches the other unsold accessory and sells for the engine's minimum of 1 gil if the player dumps it. The room itself is the other reward: the resulting books stay readable.

## Canon dependencies

The quest needs Paloom to exist and to be enterable on foot, which it is once the opening ambush no longer blocks the road. That is the only dependency. It does not read `joinedRebellion`, the ferry flags, Scott's ring, Leila's presence, the airship, or any later phase. It is valid before the party has a password and still valid after the last battle, and the clerks do not comment on which of those is true.

It does not teach, rename, require, or rewrite the fifteen key terms: Wild Rose, Mythril, Dreadnought, Airship, Sunfire, Goddess's Bell, Dragoons, Wyverns, Mysidia, Mask, Ekmet Teloess, Cyclone, Palamecia, Ultima Tome, Jade Passage. Asking those words in the loft is a no-op.

It does not move, kill, revive, recruit, or replace Firion, Maria, Guy, Leon, Hilda, Minwu, Josef, Gordon, Leila, Ricard, Cid, Paul, Borghen, Scott, or the Emperor. The filed names of Firion, Maria, and Guy are ink in a harbor ledger. They do not become a warrant the battle system can see. Hilda never sends the party here and never mentions the outcome. Cid never hears of it. The sailor keeps selling the packet on his own existing terms. Leila keeps her own square and her own later voyage. None of those roles becomes conditional on `saltComplete`.

Skipping the loft leaves every main-plot flag, guest, vehicle, and objective exactly as it was.

## Collision risks

The Paloom town map is a shared `openArea` with actors already pinned to tiles. The stair belongs at (12, 8) and Holm, before the loft is entered, at (12, 7). Do not use the hall (4, 6), the square (8, 4), the service row, the spawn, or the exit. Do not give the clerks the sailor's or Leila's npc id. Holm must leave the town map when `saltLoftEntered` is set, or he is in two rooms.

`leaveMap` falls back to Altair when a map's `locationId` is not in `LOCATIONS`. The loft has to be `locationId: 'paloom'` or Leave from a reading session teleports the party to the wrong town. Do not "fix" that by special-casing Leave into a ferry trip or an Altair cutscene.

`canSaveHere` keys off map id. Without `paloom-tally` in that set, the quest's only room is an accidental save hole.

The accessory slot holds one item. The Salt-Ink Band must stay a small evasion keepsake so it does not eclipse or copy the Gatrea courier's Rebel Armband. Do not pay a Rebel Armband here, do not spawn a sealed dispatch, and do not send the party to Altair's quartermaster. This is not that errand: nothing is carried, and the reward is not a hit bonus wearing a new name.

Do not use the Alarm Clock as a reward, a clue, or a joke, and do not put Heron Glade, a chocobo, or a cache in the clerks' mouths. Paloom's shop may already sell the clock; the loft does not mention the stock.

Do not hook `paloom-sailor`, `leila`, `cid`, or `hilda`. Do not set `ferryPass`, `ferryAvailable`, `leilaJoined`, or any vehicle. The day book's single sentence that fares sit with the sailor is the entire legal contact with his job. A rowboat sentence in an epilogue must not call `board` or add a ship.

Keyword leakage is the other real risk. A clerk who "helps" by naming the war's secrets will break the learning order. Keep their ignorance local. Phase-conditional gossip about a black knight, a swallowed ship, or a false princess will also break that order and will date the room. One set of lines for the whole campaign.

`flags` cannot store whose entry is open unless each open-state is its own boolean. A single reused slip npc is fine only if the handler checks `saltOpenJoss`, `saltOpenBren`, `saltOpenParty`, and `saltOpenBook` in a fixed order and never writes a mark when none of them is set.

Paying the pocket gil when the box is first clicked, rather than when the fate locks, lets a player toggle Pocket and Return and mint money. Pay once, inside the `saltComplete` talk.

## Why the quest remains self-contained

Every new id lives in the loft or on the one Paloom stair: three clerks, two books, one box, six slip NPCs (three reused for the line marks and the book's fate, three for the box), one map, one accessory. The flags are all `salt*`. No other side quest is read or written. The Gatrea courier, Heron Glade, and the Alarm Clock can be absent, unfinished, or already done, and the salt book does not notice.

The main plot stays true if the stair is never climbed. Phase, objective, keywords, canon deaths, canon joinings, the ferry, the airship, and the square are untouched either way. Finishing the quest changes a page, a stool, two hundred and fifty gil or none, a bottle, and a band. Paloom's job in the war — a place to buy goods, a place to meet a pirate captain when the plot is ready, a place whose sailor already sells the boat to Poft — is the same on the way out as on the way in.
