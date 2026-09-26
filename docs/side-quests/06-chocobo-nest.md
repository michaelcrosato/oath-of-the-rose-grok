## Quest title

The Cold Egg

## Existing-world touchpoint

Chocobo Forest, the special wood on the world map at (30, 8), south of Kashuan and west of Bafsk. The interior is the existing `chocobo-forest` map. The yellow bird already standing in the square, at `TOWN_SPOTS.square` (8, 4), is not this quest. Talking to that NPC still calls `mountChocobo`. The ridden bird still dismisses when the player dismounts, still will not enter towns or dungeons, and is still the only reason the player can walk the thicket tiles west to Heron Glade at (22, 6). Heron Glade stays that chocobo-only trail and its small cache. Nothing in this quest moves it, restages it, or opens it.

The quest bird is a second animal, farther north in the same interior, and it never becomes a mount.

## Premise

One chocobo in Chocobo Forest will not kneel. It has a bent left tail feather and a pale scar on the beak from a low branch, not from a fight. The feathers on its breast are worn thin. Under that breast is a ground nest: a shallow oval scraped by feet, lined with beech mast, the bird's own down, and a strip of faded yellow cloth that is only cloth.

Three eggs sit in the scrape. The left one is whole and hot, and a dark vein shows if it is held to the gap in the leaves. The middle one has a hairline crack along the long side; it is warm only on the half that was against the breast, and the crack itself is cool and dry. The right one is the same size, heavier, cold on every side, with no vein in the light. The bird turns that one as carefully as the others.

The player does not fight for the nest and does not ride this bird. The work is care: food set on the ground, the cracked egg turned, the dry crack wetted, and then a choice about where the cold egg spends the night.

## Why the player becomes involved

Most players come into Chocobo Forest for the bird in the square. This one does not come to them. Its call is lower than the square bird's single bright note: three notes, with a wait between them, one for each egg. North of the square the scrape is easy to step in. The sitter does not attack. It puts its body over the eggs and stays there, hot and immovable, neck up.

There is no employer, no letter, and no password. The middle egg is cooling while the player stands there. That is the hook. Walking away is allowed. The square bird will still kneel, and the main road is unchanged.

## Key NPCs

The sitter. A new NPC on the `chocobo-forest` map, id distinct from `chocobo` (suggested id `nest-sitter`), placed at the north end of the interior and not on the exit tile (1, 10) or the square (8, 4). It does not join, does not speak a keyword, and does not leave the scrape except for the few steps described below. The mount command on this NPC fails and must not set `chocoboMounted`.

The square chocobo stays as it is. It is not a quest giver and must not be moved, removed, or given this nest.

No human NPC. If Guy is in the party he may add one line the player's hands can already prove: the bird is not angry, and the cold egg does not hear. That line is color. The quest does not check whether Guy joined, and it still completes if he is absent. No other party member is required, and none of them is rewritten.

## New locations or spaces

No new world-map location and no new entry in `LOCATIONS`. The scrape and the seep are pockets of the existing Chocobo Forest interior.

The scrape is the nest under a leaning beech at the north end of the map, a few tiles the ridden bird will not step on. The seep is a wet patch a short walk west of that, on the same map, where sour clover grows. Encounter rate on this map is already zero and stays zero.

These spaces are not Heron Glade, not the thicket path of `t` tiles from (30, 7) through (22, 6), and not a dungeon.

## Quest progression / major beats

**Beginning.** The player can enter Chocobo Forest on foot as soon as the eastern country is walkable. No story phase is required. The square bird still mounts. At the north end, the mount command on the sitter answers: "This one does not kneel. Something warm moves under the breast feathers." Stepping onto an egg tile does not crack it and does not start a battle. The bird tents, and the boots come back empty. Looking, by talk, names the three eggs as they are: whole and hot, cracked and cooling, cold and veinless.

If the player is already mounted, the ridden bird stops at the scrape and will not put a foot in it. That refusal does not dismount them. Dismount, if they choose it, is the existing dismiss. The sitter is not the bird that bolts. The square NPC remains and can be mounted again afterward.

**Escalation.** Sour clover grows at the seep. The player picks a handful. Offered from an adjacent tile, the sitter will not take it: "It will not take clover from a hand. The beak stays over the eggs." Dropped two tiles out, and only after the player steps back to a third tile, the bird comes off the nest far enough to eat. It takes three bites and does not turn its head all the way from the scrape. If the player steps in during the feeding, the bird returns to the eggs at once. The clover was scattered, not banked. The seep grows another handful. The quest cannot be stuck here.

While the bird is eating, two cares are possible and both are needed. Turn the middle egg so the crack faces the breast instead of the air. Dip a leaf in the seep and wet that crack. Water on the cold egg beads and stays cold. Water on the cracked egg warms at the rim. The whole egg needs neither turn nor water. People-magic does not help. A Potion, Cure, Life, or a Phoenix Down used on any egg is refused and not consumed: "The shell is only shell. That magic is for people."

**Climax.** Once the bird has eaten and the cracked egg is warm all the way around, it stands beside the scrape instead of over it. This is the only time the hands are allowed in. The cold egg is still in the warmest middle, taking the breast the other two need. The player chooses where it spends the night. Leaving the map before choosing sits the bird again. A later feeding reopens the same choice. Nothing is lost.

**Resolution.** The choice is kept, locally, the moment it is made. A return visit, after the player leaves the forest and comes back, shows what the night did. The sitter still will not kneel. The square bird is untouched. The main objective line is never replaced. The log can take one plain note. No phase changes.

## Important player choices

The choice is where the cold egg spends the night. It is offered only after the feeding, the turn, and the wetting. Both options finish the quest. The game does not label either one right.

1. Set the cold egg on the lip of the scrape, in the leaf-mold, still inside the smell of the nest, out from under the breast.
2. Leave the cold egg in the warmest middle, under the breast, with the other two.

Trying to lift a living egg is not a third way through. The bird sits harder. The hands come back empty. The choice remains the cold egg only. Trying to carry the cold egg out of the forest also fails: the bird takes it in its beak and puts it back where the player just put it, either the lip or the middle. Killing, fighting, or "saving" the bird from a hunter is not offered. Walking away before the choice leaves the nest as it was found.

## Possible resolutions

**The lip.** The player sets the cold egg on the leaf-mold at the edge of the scrape. The beak hits the wrist once and stops. No battle starts and no HP is lost. The sitter then tents the two warm eggs and will not put the cold one back in the center. If the player tries to take it away, the bird returns it to the lip and pulls one green leaf over it.

On the return visit, the cracked egg shows a star-shaped pip. The whole egg is still whole and warm. The cold egg is on the lip under that leaf. A long primary, worked loose from the left wing, lies on the mold. The player may take it. The call is still three notes. This bird will not kneel.

**The middle.** The player takes the hand back. The sitter turns the cold egg first, then the cracked one, then the whole one, and sits on all three.

On the return visit, a chick is out of the whole egg, small and already dry at the edges, under the breast. The cracked egg has gone quiet and is cooling, crowded off the warmest spot. The cold egg is still being turned. The bird is thinner along the keel. It does not drop the feather. It walks a few tiles inside this map only, not as a mount and not onto the world map, and waits at the seep while the player takes a second handful of sour clover. The player may sit there once. Then the bird walks back to the scrape. The call is two notes, then a wait where the third used to be. This bird will not kneel.

Leaving before the choice is not a resolution. The forest keeps the three eggs, and both of the endings above can still be reached later.

## Gameplay opportunities

A small spatial care scene on a map that already has no encounters, using talk, step, and item use. No `beginBattle`, no `setPhase`, no `learnKeyword`.

The feeding is a step puzzle, not a timer. Drop sour clover two tiles from the sitter, then stand three tiles away. Too close, and the bird will not eat. Step in early, and it aborts. Clover regrows at the seep, so a mistake only costs the walk back.

Egg handling is an examine-and-use scene while the bird eats. Each egg answers differently to touch, to leaf-light, and to water. The cold one never warms. That is how the player learns the choice, not from a speech.

Failed item uses are specific and safe. Potion, Cure, Life, and Phoenix Down do not consume when aimed at an egg. The mount command on the sitter does not set the ridden-chocobo flags. Standing on the scrape does not destroy an egg.

The return visit is the payoff, and it is only a change of what is in the scrape: a pip and a leaf, or a chick and a quiet egg. No second quest, no delivery to a town, no follow onto the world map.

Keep the main objective string on the war. This scene writes a log line, not the objective.

## Worldbuilding revealed

Chocobos in this country nest on the ground. The scrape is cut with the feet, and the bird stands over it. Brooding is a tent of breast feathers, not a kneel. The kneel that invites a saddle is a different gesture, and a bird with eggs does not do it. The square bird has no scrape. That is why it kneels. Players who only meet that bird think Chocobo Forest is a stable without walls. It is also a nursery, and the nursery is not on the trail west.

A cold egg stays in the nest because the sitter turns by touch and habit, and the cold one still fits the breast. A person can see the missing vein in the leaf-light. The bird does not use that test. It will give the warmest place to a shell that does not answer.

They eat sharp green stems, not from the hand, and not without a clear step back to the eggs. Water on a living crack is taken up. Water on a dead shell beads. Magic that heals or raises people does not cross into the egg. This is not a sanctuary, and it is not a character's death.

The square bird's call is one bright note. The sitter's is one low note per egg, with a wait between. After the middle ending, the missing note is the cracked egg. Tracks of some person come as far as the seep, turn, and leave. No one is waiting there, and no fight is attached. The bird did not need a rescue. It needed food, a turned egg, and a decision about the cold one.

## Rewards

Either ending may be skipped with no loss. Neither reward is a key, a keyword, a ride, or a change to travel. Neither is sold in a shop.

The lip gives the Sitter's Primary, a loose flight feather from the left wing. It may be an accessory in the existing band slot: defense 0, evasion +2, a small sell price, origin an addition. It does not quiet encounters, does not call a chocobo, and does not teach anything. It must not be named or described as a band, a medal, or a rebel token. The first handful of clover was eaten and is not returned.

The middle gives no feather. The return visit lets the player keep a second handful of sour clover, a consumable found only at this seep: it restores about 20 HP, cures no status, and is not the sleep item already sold in towns. Sitting once at the seep while the bird waits restores a trickle of HP to each living member, on the order of 15, and does not raise the dead, clear status, or replace an inn or a cottage.

Both endings leave the square mount, dismount, town refusal, and Heron Glade exactly as they are.

## Canon dependencies

None. The quest does not read or write the story phase, the fifteen keywords, or any main-plot flag. It does not advance, stall, or retell the war. It can be started or finished any time Chocobo Forest can be entered, including before the player has ever mounted, and including long after. Skipping it changes nothing that the main road checks.

Guy's animal-speech line, if he is present, is optional color. His place in the party is not a requirement.

## Collision risks

Do not replace, move, or re-script the square NPC `chocobo`. `mountChocobo` and `dismountChocobo` stay the path for that bird: mount only in this forest, dismiss on dismount, refuse towns and dungeons, and by that ride alone open the thicket walk to Heron Glade.

Do not move Heron Glade, change its `chocoboOk` thicket, or restage its small cache. Do not put the feather, the clover, or the nest in that glade. Do not make the sitter lead the player there.

Do not make the sitter mountable, dismissable, or a second `chocoboMounted`. A mounted player at the scrape is stopped, not forced off. Do not clear `chocoboCaught` from this scene.

Do not add a world location, a keyword, a story phase, or an objective-line change. Local flags for "fed," "turned," "wetted," and the choice are enough, and nothing else in the game should read them.

Do not start a battle with the sitter, a poacher, or a patrol. The peck deals no damage. Do not connect the scrape to Deist's riders, their pendant, or the egg already in the main plot. This bird has no rider and no wing to lend.

Do not structure this as a delivery between towns, a paid errand, or a status-cure gadget. Sour clover is food. The feather is a small worn token with a different job from the armband already in the game. Life and Phoenix Down must not gain a new use on the cold egg.

Do not soft-lock the care. Clover regrows. The choice reopens if the player leaves. Failed magic is not consumed. Eggs cannot be ruined by a boot.

## Why the quest remains self-contained

It starts and ends inside Chocobo Forest. No other place is visited, no one is hired, and no other side quest is read or written. The war does not know the scrape happened. The square bird still kneels for anyone who asks it, before the choice and after either ending. Heron Glade is still only the thicket trail and the small cache at the end of a chocobo ride. A player who never walks north of the square loses nothing the main road promised, and a player who does gains a night's decision about one cold egg and a bird that still will not be ridden.
