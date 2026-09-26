import { describe, expect, it } from 'vitest';
import { KEYWORDS } from '../src/data/content';
import {
  MAPS,
  attackPower,
  canReach,
  createNewGame,
  dispatch,
  shopGoods,
  type GameState,
} from '../src/engine';
import { equipAction, fieldUseAction, restAction, rideChoices } from '../src/game/field-actions';
import { descend, fight, goNpc, must, reachBoss, speak } from './play';

function wake(state: GameState) {
  must(state, { type: 'start-battle', encounterId: 'opening' });
  for (const member of state.party) {
    if (!member.dead) must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: 'e0' } });
  }
  must(state, { type: 'resolve-round' });
  expect(state.flags.rescued).toBe(true);
  expect(state.mapId).toBe('altair');
  expect(state.party.some((c) => c.id === 'leon')).toBe(false);
  expect(state.flags.leonMissing).toBe(true);
}

function recruit(state: GameState) {
  const blocked = dispatch(state, { type: 'talk', npcId: 'hilda', keyword: 'wild-rose' });
  expect(blocked.ok).toBe(false);
  expect(blocked.error).toBe('unlearned-keyword');
  goNpc(state, 'hilda');
  const plain = dispatch(state, { type: 'talk', npcId: 'hilda' });
  expect(plain.ok).toBe(true);
  expect(state.flags.joinedRebellion).toBeFalsy();
  speak(state, 'altair-rebel');
  expect(state.keywords).toContain('wild-rose');
  speak(state, 'hilda', 'wild-rose');
  expect(state.flags.joinedRebellion).toBe(true);
  expect(state.phase).toBe('to-fynn');
  expect(state.objective.length).toBeGreaterThan(10);
}

function scott(state: GameState) {
  must(state, { type: 'journey', locationId: 'fynn' });
  must(state, { type: 'enter', locationId: 'fynn' });
  speak(state, 'scott');
  expect(state.flags.scottDead).toBe(true);
  expect(state.keywords).toContain('mythril');
  expect(state.keywords).toContain('dreadnought');
  expect(state.party.some((c) => c.id === 'minwu')).toBe(true);
  must(state, { type: 'journey', locationId: 'altair' });
  must(state, { type: 'enter', locationId: 'altair' });
  speak(state, 'hilda');
  expect(state.phase).toBe('to-salamand');
  expect(state.flags.ferryAvailable).toBe(true);
}

function east(state: GameState) {
  expect(canReach(state, 'poft')).toBe(false);
  must(state, { type: 'journey', locationId: 'paloom' });
  must(state, { type: 'enter', locationId: 'paloom' });
  speak(state, 'paloom-sailor');
  expect(state.flags.ferryPass).toBe(true);
  expect(canReach(state, 'poft')).toBe(true);
  expect(canReach(state, 'deist' in {} ? 'deist' : 'castle-deist')).toBe(false);
  expect(canReach(state, 'castle-deist')).toBe(false);
  must(state, { type: 'journey', locationId: 'poft' });
  must(state, { type: 'enter', locationId: 'poft' });
  speak(state, 'cid');
  expect(state.keywords).toContain('airship');
  expect(state.vehicles.airship).toBe(false);
  must(state, { type: 'journey', locationId: 'chocobo-forest' });
  must(state, { type: 'enter', locationId: 'chocobo-forest' });
  speak(state, 'chocobo');
  expect(state.chocoboMounted).toBe(true);
  expect(canReach(state, 'heron-glade')).toBe(true);
  expect(canReach(state, 'altair')).toBe(false);
  const refused = dispatch(state, { type: 'enter', locationId: 'altair' });
  expect(refused.ok).toBe(false);
  must(state, { type: 'journey', locationId: 'heron-glade' });
  for (let i = 0; i < 25; i++) {
    const step = dispatch(state, { type: 'step', dx: 1, dy: 0 });
    expect(step.error ?? '').not.toMatch(/^encounter/);
  }
  must(state, { type: 'dismount-chocobo' });
  expect(state.chocoboMounted).toBe(false);
  expect(canReach(state, 'heron-glade')).toBe(false);
  must(state, { type: 'journey', locationId: 'salamand' });
  must(state, { type: 'enter', locationId: 'salamand' });
  expect(canReach(state, 'semitt-falls')).toBe(false);
  goNpc(state, 'josef');
  const unnamed = dispatch(state, { type: 'talk', npcId: 'josef' });
  expect(unnamed.ok).toBe(true);
  expect(state.party.some((c) => c.id === 'josef')).toBe(false);
  speak(state, 'josef', 'mythril');
  expect(state.flags.josefJoined).toBe(true);
  expect(state.vehicles.canoe).toBe(true);
  expect(state.party.some((c) => c.id === 'josef')).toBe(true);
  expect(state.party.some((c) => c.id === 'minwu')).toBe(false);
  expect(canReach(state, 'semitt-falls')).toBe(true);
}

function semitt(state: GameState) {
  must(state, { type: 'journey', locationId: 'semitt-falls' });
  must(state, { type: 'enter', locationId: 'semitt-falls' });
  descend(state);
  descend(state);
  expect(state.mapId).toBe('semitt-3');
  speak(state, 'nelly');
  expect(state.flags.nellyFreed).toBeFalsy();
  reachBoss(state, 'sergeant');
  expect(state.party.some((c) => c.id === 'josef')).toBe(true);
  fight(state, 'sergeant');
  expect(state.flags.sergeantDefeated).toBe(true);
  speak(state, 'nelly');
  expect(state.flags.nellyFreed).toBe(true);
  speak(state, 'paul');
  expect(state.flags.paulMythril).toBe(true);
  expect(state.flags.paulOpenedMythrilDoor).toBe(true);
  const chest = MAPS['semitt-3'].chests.find((entry) => entry.id === 'mythril-chest')!;
  must(state, { type: 'move-to', x: chest.x, y: chest.y });
  must(state, { type: 'open-chest', chestId: 'mythril-chest' });
  expect(state.items.mythril).toBe(1);
  must(state, { type: 'journey', locationId: 'salamand' });
  must(state, { type: 'enter', locationId: 'salamand' });
  const before = attackPower(state.party.find((c) => c.id === 'firion')!);
  expect(shopGoods(state, 'salamand-weapons').some((item) => item.id === 'mythril-sword')).toBe(false);
  speak(state, 'smith');
  expect(state.flags.mythrilArmed).toBe(true);
  expect(state.items['mythril-sword']).toBe(1);
  must(state, equipAction('firion', 'main', 'mythril-sword'));
  expect(attackPower(state.party.find((c) => c.id === 'firion')!)).toBeGreaterThan(before);
  expect(shopGoods(state, 'salamand-weapons').some((item) => item.id === 'mythril-sword')).toBe(true);
  const room = restAction(state);
  expect(room).toEqual({ type: 'rest', innId: 'salamand' });
  must(state, room!);
}

function dreadnought(state: GameState) {
  must(state, { type: 'journey', locationId: 'bafsk' });
  must(state, { type: 'enter', locationId: 'bafsk' });
  speak(state, 'bafsk-miner');
  speak(state, 'paul');
  expect(state.flags.paulInfiltration).toBe(true);
  expect(state.items.pass).toBe(1);
  must(state, { type: 'journey', locationId: 'bafsk-cave' });
  must(state, { type: 'enter', locationId: 'bafsk-cave' });
  descend(state);
  speak(state, 'dreadnought-berth');
  expect(state.flags.sawDreadnought).toBe(true);
  must(state, { type: 'journey', locationId: 'altair' });
  must(state, { type: 'enter', locationId: 'altair' });
  speak(state, 'hilda');
  expect(state.keywords).toContain('goddess-bell');
  expect(state.phase).toBe('to-snow');
  const early = dispatch(state, { type: 'journey', locationId: 'kashuan-keep' });
  if (early.ok) {
    const sealed = dispatch(state, { type: 'enter', locationId: 'kashuan-keep' });
    expect(sealed.ok).toBe(false);
    expect(sealed.error).toBe('sealed');
  }
  must(state, { type: 'travel-tile', x: 32, y: 7 });
  expect(canReach(state, 'snow-cavern')).toBe(false);
  const snow = rideChoices(state).find((action) => action.type === 'board' && action.ride === 'snowcraft');
  expect(snow).toEqual({ type: 'board', ride: 'snowcraft' });
  must(state, snow!);
  expect(state.vehicles.snowcraft).toBe(true);
  expect(canReach(state, 'snow-cavern')).toBe(true);
  must(state, { type: 'journey', locationId: 'snow-cavern' });
  must(state, { type: 'enter', locationId: 'snow-cavern' });
  descend(state);
  descend(state);
  const bell = MAPS['snow-3'].chests.find((entry) => entry.id === 'bell-chest')!;
  must(state, { type: 'move-to', x: bell.x, y: bell.y });
  must(state, { type: 'open-chest', chestId: 'bell-chest' });
  expect(state.items['goddess-bell']).toBe(1);
  reachBoss(state, 'borghen');
  fight(state, 'borghen');
  expect(state.flags.borghenDefeated).toBe(true);
  must(state, { type: 'leave' });
  expect(state.flags.josefDead).toBe(true);
  expect(state.party.some((c) => c.id === 'josef')).toBe(false);
  expect(state.phase).toBe('after-josef');
  must(state, { type: 'journey', locationId: 'kashuan-keep' });
  must(state, { type: 'enter', locationId: 'kashuan-keep' });
  expect(state.flags.kashuanOpened).toBe(true);
  speak(state, 'gordon');
  expect(state.flags.gordonJoined).toBe(true);
  expect(state.party.some((c) => c.id === 'gordon')).toBe(true);
  expect(state.keywords).toContain('sunfire');
  descend(state);
  speak(state, 'kashuan-tablet');
  expect(state.keywords).toContain('ekmet-teloess');
  descend(state);
  speak(state, 'kashuan-flame');
  expect(state.items.sunfire ?? 0).toBe(0);
  speak(state, 'kashuan-flame', 'ekmet-teloess');
  expect(state.items.sunfire).toBe(1);
  expect(state.phase).toBe('to-dreadnought');
  must(state, { type: 'journey', locationId: 'dreadnought' });
  must(state, { type: 'enter', locationId: 'dreadnought' });
  descend(state);
  must(state, fieldUseAction('sunfire'));
  expect(state.battle?.encounterId).toBe('dark-knight');
  fight(state);
  expect(state.flags.leonDarkKnight).toBe(true);
  expect(state.flags.dreadnoughtDestroyed).toBe(true);
  expect(canReach(state, 'castle-palamecia')).toBe(false);
  must(state, { type: 'journey', locationId: 'poft' });
  must(state, { type: 'enter', locationId: 'poft' });
  speak(state, 'cid');
  expect(state.vehicles.airship).toBe(true);
  expect(canReach(state, 'castle-palamecia')).toBe(true);
  const lift = rideChoices(state).find((action) => action.type === 'board' && action.ride === 'airship');
  expect(lift).toEqual({ type: 'board', ride: 'airship' });
  must(state, lift!);
  expect(state.ride).toBe('airship');
  expect(state.mapId).toBe('world');
}

function leviathan(state: GameState) {
  expect(canReach(state, 'castle-deist')).toBe(false);
  must(state, { type: 'journey', locationId: 'paloom' });
  must(state, { type: 'enter', locationId: 'paloom' });
  speak(state, 'leila');
  expect(state.flags.leilaJoined).toBe(true);
  expect(state.party.some((c) => c.id === 'leila')).toBe(true);
  expect(state.phase).toBe('to-leila');
  const voyage = rideChoices(state).find((action) => action.type === 'sail');
  expect(voyage).toEqual({ type: 'sail' });
  must(state, voyage!);
  fight(state);
  expect(state.phase).toBe('leviathan');
  expect(state.mapId).toBe('leviathan-1');
  descend(state);
  reachBoss(state, 'roundworm');
  fight(state, 'roundworm');
  expect(state.flags.leviathanCleared).toBe(true);
  expect(state.vehicles.ship).toBe(true);
  expect(canReach(state, 'castle-deist')).toBe(true);
  expect(state.party.some((c) => c.id === 'gordon')).toBe(true);
}

function fynnFree(state: GameState) {
  must(state, { type: 'journey', locationId: 'coliseum' });
  must(state, { type: 'enter', locationId: 'coliseum' });
  reachBoss(state, 'lamia-queen');
  fight(state, 'lamia-queen');
  expect(state.flags.lamiaDefeated).toBe(true);
  expect(state.phase).toBe('after-lamia');
  must(state, { type: 'journey', locationId: 'castle-fynn' });
  must(state, { type: 'enter', locationId: 'castle-fynn' });
  speak(state, 'paul');
  expect(state.flags.paulFynnGate).toBe(true);
  descend(state);
  reachBoss(state, 'gottos');
  fight(state, 'gottos');
  expect(state.flags.gottosDefeated).toBe(true);
  descend(state);
  speak(state, 'hilda');
  expect(state.flags.hildaRescued).toBe(true);
  expect(state.flags.fynnLiberated).toBe(true);
  expect(state.phase).toBe('fynn-free');
}

function deist(state: GameState) {
  must(state, { type: 'journey', locationId: 'altair' });
  must(state, { type: 'enter', locationId: 'altair' });
  speak(state, 'hilda');
  expect(state.keywords).toContain('dragoons');
  expect(state.phase).toBe('to-deist');
  must(state, { type: 'journey', locationId: 'castle-deist' });
  must(state, { type: 'enter', locationId: 'castle-deist' });
  descend(state);
  speak(state, 'deist-dragoon');
  expect(state.keywords).toContain('wyverns');
  must(state, { type: 'journey', locationId: 'deist-cavern' });
  must(state, { type: 'enter', locationId: 'deist-cavern' });
  descend(state);
  speak(state, 'wyvern', 'wyverns');
  expect(state.flags.deistWyvern).toBe(true);
  speak(state, 'ricard', 'dragoons');
  expect(state.flags.ricardJoined).toBe(true);
  expect(state.party.some((c) => c.id === 'ricard')).toBe(true);
  expect(state.phase).toBe('ricard-joined');
}

function finale(state: GameState) {
  must(state, { type: 'journey', locationId: 'altair' });
  must(state, { type: 'enter', locationId: 'altair' });
  speak(state, 'hilda');
  expect(state.keywords).toContain('mysidia');
  must(state, { type: 'journey', locationId: 'mysidia' });
  must(state, { type: 'enter', locationId: 'mysidia' });
  speak(state, 'mysidia-elder');
  expect(state.keywords).toContain('mask');
  speak(state, 'mysidia-elder', 'mask');
  expect(state.keywords).toContain('ultima-tome');
  const unread = dispatch(state, { type: 'use-item', itemId: 'ultima-tome', targetId: 'maria' });
  expect(unread.ok).toBe(false);
  must(state, { type: 'journey', locationId: 'cave-of-mysidia' });
  must(state, { type: 'enter', locationId: 'cave-of-mysidia' });
  descend(state);
  const white = MAPS['mysidia-cave-2'].chests.find((entry) => entry.id === 'white-mask-chest')!;
  must(state, { type: 'move-to', x: white.x, y: white.y });
  must(state, { type: 'open-chest', chestId: 'white-mask-chest' });
  must(state, { type: 'journey', locationId: 'tropical-island' });
  must(state, { type: 'enter', locationId: 'tropical-island' });
  descend(state);
  const black = MAPS['tropical-2'].chests.find((entry) => entry.id === 'tropic-mask')!;
  must(state, { type: 'move-to', x: black.x, y: black.y });
  must(state, { type: 'open-chest', chestId: 'tropic-mask' });
  must(state, { type: 'journey', locationId: 'mysidian-tower' });
  must(state, { type: 'enter', locationId: 'mysidian-tower' });
  descend(state);
  descend(state);
  descend(state);
  expect(state.mapId).toBe('tower-4');
  speak(state, 'ultima-seal');
  expect(state.flags.minwuDead).toBe(true);
  expect(state.flags.ultimaLearnable).toBe(true);
  expect(state.party.some((c) => c.id === 'minwu')).toBe(false);
  expect(state.keywords).toContain('cyclone');
  expect(state.phase).toBe('cyclone');
  must(state, { type: 'use-item', itemId: 'ultima-tome', targetId: 'maria' });
  expect(state.party.find((c) => c.id === 'maria')!.spells).toContain('ultima');
  must(state, { type: 'journey', locationId: 'cyclone' });
  must(state, { type: 'enter', locationId: 'cyclone' });
  descend(state);
  reachBoss(state, 'green-dragon');
  fight(state, 'green-dragon');
  expect(state.flags.greenDragonDead).toBe(true);
  speak(state, 'cyclone-gate');
  expect(state.flags.ricardDead).toBe(true);
  expect(state.party.some((c) => c.id === 'ricard')).toBe(false);
  expect(state.phase).toBe('after-cyclone');
  must(state, { type: 'journey', locationId: 'castle-palamecia' });
  must(state, { type: 'enter', locationId: 'castle-palamecia' });
  expect(state.phase).toBe('to-palamecia');
  descend(state);
  descend(state);
  reachBoss(state, 'emperor');
  fight(state, 'emperor');
  expect(state.flags.emperorDefeated).toBe(true);
  expect(state.flags.leonJoined).toBe(true);
  expect(state.keywords).toContain('jade-passage');
  expect(state.party.some((c) => c.id === 'leon')).toBe(true);
  expect(state.party.filter((c) => ['firion', 'maria', 'guy'].includes(c.id))).toHaveLength(3);
  must(state, { type: 'journey', locationId: 'jade-passage' });
  must(state, { type: 'enter', locationId: 'jade-passage' });
  expect(state.flags.jadeOpened).toBe(true);
  must(state, { type: 'journey', locationId: 'pandaemonium' });
  must(state, { type: 'enter', locationId: 'pandaemonium' });
  descend(state);
  descend(state);
  descend(state);
  reachBoss(state, 'dark-emperor');
  fight(state, 'dark-emperor');
  expect(state.flags.darkEmperorDefeated).toBe(true);
  expect(state.flags.leonRedeemed).toBe(true);
  expect(state.phase).toBe('ending');
  expect(state.mode).toBe('ending');
  expect(state.endingText).toMatch(/Emperor of Palamecia/);
  expect(state.endingText).toMatch(/Pandaemonium/);
  expect(state.endingText).toMatch(/no longer the Dark Knight/);
  expect(state.endingText).toMatch(/Leon/);
  for (const keyword of KEYWORDS) expect(state.keywords).toContain(keyword);
  speak;
}

describe('story from a new game', () => {
  it('walks the rebellion through the Dreadnought', () => {
    const state = createNewGame(3);
    wake(state);
    recruit(state);
    scott(state);
    east(state);
    semitt(state);
    dreadnought(state);
  });

  it('walks Leila, the Leviathan, Fynn, and the wyvern', () => {
    const state = createNewGame(5);
    wake(state);
    recruit(state);
    scott(state);
    east(state);
    semitt(state);
    dreadnought(state);
    leviathan(state);
    fynnFree(state);
    deist(state);
  });

  it('walks Ultima, the Cyclone, both emperors, and Leon', () => {
    const state = createNewGame(9);
    wake(state);
    recruit(state);
    scott(state);
    east(state);
    semitt(state);
    dreadnought(state);
    leviathan(state);
    fynnFree(state);
    deist(state);
    finale(state);
  });
});
