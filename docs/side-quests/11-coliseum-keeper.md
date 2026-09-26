## Quest title

The Opener's Purse

## Existing-world touchpoint

The Coliseum, world location `coliseum` at (14, 15), kind `castle`, entry map `coliseum`. It sits just east of Fynn and Castle Fynn. The floor is one open room with no random encounters. `entryBlocked` keeps the building shut until `after-leviathan`, then leaves it open through the later phases already listed for that door. This quest uses only that existing door. It adds nothing the main route has to pass through.

The far tile of `coliseum` already carries the story bout. This quest never stands on that tile, never speaks its combatant, and never changes what happens if the gallery is ignored. A party that walks past the side door gets the same Coliseum bout the game already has.

## Premise

Under the stands, the house keeps one caged animal for the start of the card. The slate on the gallery wall prices it: OPENER — DITCHJAW — PURSE 700. The Ditchjaw is a young fen-crocodile dragged out of the ditches between Fynn and the river. The bills call it that. The beast-keeper, Vetch, calls it Hook and tells the party not to. A filmed eye. Ribs showing. A chain grown into the left shoulder, links under the skin.

The animal is the cheap blood that warms a crowd before the real card. The purse is the argument. If Hook bleeds on the sand, the stake is paid. If it dies in the aisle, cheap and unseen, the house keeps the gil and takes the difference out of the keeper. Vetch will not drug it to fall over pretty. He is short two fingers, and he is done pretending the cage is a kindness. Somebody is about to get bit, or somebody is about to get paid.

## Why the player becomes involved

The smell of ditchwater meets the party at a side door by the entrance, before the far sand. The slate is chalked where an armed body can read it. Vetch is at the bars with his remaining fingers hooked in the iron. He does not ask who they are or why they came. He tells them to get out of the aisle or put a name on the purse.

Hook's breath is hot and rotten. The bad eye does not track. The good one does. Standing there is already a part in it: the house will use any armed stranger as a free demonstration, and the keeper would rather have a witness than another handler. There is no password to learn and no errand to carry to another town. The involvement is the body in the cage and the number on the wall.

If Guy is in the party he can put a hand on the bar and say "Hurts." Vetch does not argue. That line is flavor. The quest does not require Guy, and it does not teach him anything new.

## Key NPCs

**Vetch**, beast-keeper. A pit contractor, not a soldier and not a rebel. Defiant toward the clerk and the slate, not toward the empire. He files the chain, misses, and files again. He will not make a speech about freedom. He talks about feed, hide, and who gets the seven hundred. He does not join the party. He leaves with the resolution and does not appear again.

**Harsk**, purse-clerk. He counts gil and crowds. An unsound opener embarrasses the card and makes the stands shout for their stake. He would rather scratch a line than refund a riot. He is not a fighter and not a boss. He has no interest in the party's war.

**Hook (the Ditchjaw).** One local beast, invented for this room. A young fen-crocodile, not a dragon and not any story boss. Too small and too ruined to be a feature, which is why the house uses it as the opener: it dies loud if it dies on the sand, and it is cheap if it dies in the pen. It is not tamed, not grateful, and not a guest.

## New locations or spaces

No new world-map location. One new interior, the **Beast Gallery** (`coliseum-gallery`), opened by a door near the spawn of `coliseum`, on the entrance side, away from the end tile.

The gallery is a short room: the cage, the chalked slate, a drain grate in the floor, and a patch of practice sand. No random encounters. No boss marker. Leaving puts the party back at the entrance side of the Coliseum floor, not on the story tile. The practice sand for this quest is in the gallery, so a demonstration never happens on the main card's ground.

The drain is a grate, not a dungeon. Nothing is mapped past it. An animal that goes down it is gone.

## Quest progression / major beats

**Beginning.** Once the Coliseum door is already open, the gallery can be entered. The slate, the cage, and Vetch are all in the first look. Harsk is not required for the player to understand the price. Hook shifts when people talk, and the chain clicks inside the shoulder. The main objective line on the screen is not replaced. This room writes only its own log notes. The party can leave at once. The slate stays up, and nothing outside the gallery changes.

**Escalation.** Harsk comes to weigh the opener. The ribs show, and a death in the aisle would void the stake. He wants a demonstration on the practice sand now: blood, then the seven hundred. Vetch refuses the drug Harsk offers. A beast that folds without biting gets the keeper beaten and the purse clawed back. Vetch shows the shoulder if asked. The links are under the skin. He also shows the file and the drain, when Harsk is turned. Cutting the chain will not make a friend. Hook will come up out of the straw, and the hands on the door will try to put the purse back in the cage. Harsk's offer is blunt. Sign and fight it. Pay the seven hundred and he strikes the line. Or get out of his count.

**Climax.** The player spends the animal, the purse, or both. Signing starts the demonstration bout against Hook on the gallery sand. Cutting the chain starts the short fight that gets the animal out: the pit hands rush the grate, and Hook is loose while they do. Paying the slate, or standing while Vetch makes Harsk look at the filmed eye and the in-grown chain, scratches the opener with no battle. All three are the same choice. The far tile of the Coliseum is not involved.

**Resolution.** The slate is chalked over, or the cage is empty, or both. Vetch is gone. Harsk does not stay to chat. The gallery has nothing further to say, and asking there teaches no keyword. The Coliseum floor outside is as it was. If this quest was skipped, ignored, or fled, the story bout at the end of `coliseum` still happens exactly as it does now.

## Important player choices

The choice is what to do with Hook and the opener's purse. It can be taken any time the gallery is open, before or after the story bout, and it can be walked away from. Fleeing either fight leaves the cage as it was and the quest open. A wipe uses the game's ordinary defeat. The slate is still there afterward.

Three resolutions:

1. **Sign the slate (combat).** Fight Hook as the demonstration bout. The house means blood, and the engine's victory is a dead foe. The opener dies on the practice sand. Harsk pays the 700. Vetch does not thank anyone. He drops the filing knife, because he will not use it on a carcass, and he quits.
2. **Cut the chain (combat).** Free Hook into a short fight. The animal bolts for the drain, not into the party and not onto the main floor. Two pit hands try to shut the grate and keep the purse in the cage. The party fights those hands. On victory the grate is open and Hook is gone, bleeding and untamed, with no later encounter. The purse is forfeit.
3. **Scratch the line (non-combat).** No bout and no rush. Either pay the posted 700 so Harsk strikes the opener as covered, or stand the inspection and say what the shoulder already shows, so Harsk can scratch it as unsound without refunding the stands. Vetch walks Hook out by the drain. The animal lives. The house will find some other cheap opener. This quest does not say who, and does not put that body on the story tile.

## Possible resolutions

The choice above ends in one of these. They are mutually exclusive. None of them sets a story flag, changes phase, or touches the end tile.

**Demonstration bout.** Encounter `ditchjaw-bout`: one Ditchjaw, not a boss, fleeable, no phase gate, not `scriptedWithdraw` (that flag is the Dark Knight's one-round exit and its log line). Proposed foe, in the range of a mid beast and well under the story card: about 130 HP, attack around 22, a bite that can poison. Victory kills Hook. Harsk counts out 700 gil on top of the foe's small gil. Vetch leaves the Filing Knife and does not travel with the party. The cage is hauled empty. Uneasy on purpose: the purse was earned the way the house earns it.

**Freed into a short fight.** Encounter `pen-rush`: two Pit Hands, humanoid locals, not imperial and not named canon fighters. About the weight of a pair of pirates. Not a boss. Fleeable. No phase gate. Hook is not an enemy unit. The log makes the release and the rush the same minute: the chain comes out of the shoulder with skin on it, Hook hits the grate, and the hands come in to save the stake. Victory: the hands drop, the animal is gone down the drain, and it does not return as a foe, a follower, or a world-map spawn. Reward is their carried gil only, plus the Shoulder Scale torn on the iron. No 700. Vetch is already in the dark after it. He does not come back to explain.

**Scratched, by witness or by payment.** Non-combat. Witness costs no gil: the player confirms the bad eye and the chain in the meat, Harsk strikes the line, and the stands are never called. Payment costs 700 gil up front: Harsk strikes the line because the stake is covered and he does not have to look. Both ways, Vetch takes Hook out through the drain while it can still walk. Witness leaves the Filing Knife (he will not need it on the road, and he will not owe a speech). Payment leaves the Shoulder Scale, the piece he had already started to file free, and no knife. If the party cannot pay, witness still works. There is no stat check and no way for this branch to fail once chosen.

Leaving, or fleeing, is not a fourth ending. The opener is still on the slate. The story bout is still available.

## Gameplay opportunities

A real, optional fight in a building that otherwise has no random encounters, scaled as an opener rather than a card. Weapon and spell use still train ranks, which is the only extra yield of fighting. Poison on the Ditchjaw bite spends an Antidote or a Cure rank without inventing a status. The pit hands are ordinary front-row bodies, so row, shields, and bows work as they do anywhere.

The non-combat branch is a purse decision, not a puzzle. Read the slate (700), look at the shoulder, then pay or witness. No new menu system. Talk, a confirm, and a gil check the shops already use. Broke parties are not stuck: witness scratches the line for nothing.

The gallery door is the whole dungeon. One room, three interactables (slate, cage, grate), then out. It must not lengthen the Coliseum into a corridor the story bout has to be hunted through. Save rules stay as they are. This room does not become a sanctuary.

Proposed gear, both new ids, neither a key item: Filing Knife (knife skill, attack 14, between the Dagger and the Main Gauche, unsold) and Shoulder Scale (accessory, defense 4, no evasion, so it is not another armband). Only one of them is given, by the resolution above.

## Worldbuilding revealed

The Coliseum sells a card with a priced start. The opener exists so the sand is already wet when the crowd sits. The purse is a public number. Die too fast, in the pen, and the stake never leaves the house. Die on the sand, and somebody gets paid. The clerk fears a bored, angry crowd more than he loves a beast.

Beast-keepers are hired hands. The empire can occupy Fynn and still not bother to run the pit. The cruelty is older than the garrison, and it does not pause for a rebellion. Vetch's missing fingers are the job. He is defiant about the count and the drug, not about banners. He will ruin the house's opener. He will not join a war.

Ditchjaws are fen-crocodiles from the drainage. Floods push the young ones into the ditches, and pit-buyers take the ones small enough to chain. They are not drake-kin, not palace monsters, and not a species the player has to meet again. A chain left unfiled grows into the meat. That is the whole natural history this quest needs.

The party can take the purse, void it, or buy it out, and every ending spends something that used to be alive or someone else's gil. The room does not congratulate them.

## Rewards

All of these are local. None is a key, a keyword, a guest, or a change to the main objective.

- **Demonstration:** 700 gil from Harsk, plus the Ditchjaw's own small gil (about 40). Filing Knife. Hook is dead. Vetch is gone.
- **Pen rush:** gil from the two hands only (about 70 together). Shoulder Scale. The 700 is not paid. Hook is gone down the drain, alive and not an ally.
- **Witness:** no gil. Filing Knife. Hook leaves with Vetch.
- **Pay the slate:** minus 700 gil. Shoulder Scale. Hook leaves with Vetch.

No reward path teaches a spell, opens a road, or restocks a shop. The knife and the scale can be sold if the rest of the gear can. They must not be required anywhere else.

## Canon dependencies

The only dependency is the Coliseum's existing door. The quest cannot start while `entryBlocked` still returns shut for `coliseum`. From `after-leviathan` onward, any phase that already allows entry is enough. It does not require the story bout, any keyword, any guest, or any other side quest.

It does not depend on the opening loss, Leon, Wild Rose, Scott, Minwu, Semitt, Josef, the Goddess's Bell, Sunfire, the Dreadnought, Leila, the Leviathan, the Lamia Queen, Hilda's rescue, the liberation of Fynn, Ricard, the Cyclone, Ultima, the Emperor, or the Dark Emperor. Those events may already have happened, or not, according to the phase list the door already uses. This quest does not read their flags.

## Collision risks

- Do not move, retype, or re-gate `coliseum`. Do not put the gallery door or the practice sand on the end tile. The existing boss marker stays `lamia-queen`. Skipping this quest must leave that bout unchanged, including its phase, its map, and its result text.
- Do not set `lamiaDefeated`, do not call `setPhase` for `after-lamia` or `to-coliseum`, and do not edit the note after the Leviathan that sends the party toward the Coliseum. Do not use the Lamia Queen, the false princess, Hilda, or that rumor as bait, dialogue, or reward.
- New encounter ids (`ditchjaw-bout`, `pen-rush`) must not be added to the story victory switch. Do not mark them `boss`, `noFlee`, `scriptedLoss`, or `scriptedWithdraw`. Do not reuse Dark Knight, practice-post, or executioner behavior.
- The Ditchjaw is a new enemy id. It is not Gottos, Behemoth, Lamia, any dragon, or the Emperor, and it must not replace those rows in wild tables or dungeon encounters.
- Vetch and Harsk are new. Do not kill, revive, replace, or rewrite Firion, Maria, Guy, Leon, Hilda, Minwu, Josef, Gordon, Leila, Ricard, Cid, Paul, Borghen, Scott, or the Emperor. Guy's one optional word must not become a required ability or a new speaking system.
- Do not add or redefine a keyword: Wild Rose, Mythril, Dreadnought, Airship, Sunfire, Goddess's Bell, Dragoons, Wyverns, Mysidia, Mask, Ekmet Teloess, Cyclone, Palamecia, Ultima Tome, Jade Passage.
- Do not copy or modify the Gatrea courier, the Rebel Armband, Heron Glade, or the Alarm Clock. Do not chain this room to any other side quest.
- The 700 gil payment must be skippable via the witness branch so a poor party is not stuck in the gallery. Neither branch may block the exit or the story tile.
- Hook must not become a follower, a mount, a world encounter, or a later boss. The drain is not a new dungeon.

## Why the quest remains self-contained

It starts and ends in the Beast Gallery. The animal and the purse are settled in one visit. Vetch does not join, Hook does not recur, and Harsk does not send the party anywhere. No letter, no second town, no follow-up flag.

Nothing in the main plot reads this room. Ignoring the side door leaves the Coliseum bout, the objective line, the keywords, the guests, and every other quest exactly as they are. Finishing the room does the same, aside from one local item and a change in gil. No other side quest is required, and none is changed. The defiance stays in the pen: a keeper, a body, and a number on the wall.
