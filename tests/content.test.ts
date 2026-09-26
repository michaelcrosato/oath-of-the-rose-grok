import { readFileSync, readdirSync } from 'node:fs';
import { INPUT_BINDINGS, applySettings } from '../src/game/runtime';
import { describe, expect, it } from 'vitest';
import {
  ARMOR,
  CONSUMABLES,
  ENEMIES,
  KEYWORDS,
  REQUIRED_LOCATIONS,
  SPELLS,
  STORY_BEAT_IDS,
  WEAPONS,
} from '../src/data/content';
import {
  LOCATIONS,
  canSaveHere,
  createNewGame,
  dispatch,
  evasionOf,
  loadGame,
  memoryStore,
  saveGame,
  type GameState,
} from '../src/engine';
import { must, speak } from './play';

function wake(): GameState {
  const state = createNewGame(11);
  must(state, { type: 'start-battle', encounterId: 'opening' });
  for (const member of state.party) {
    if (!member.dead) must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: 'e0' } });
  }
  must(state, { type: 'resolve-round' });
  speak(state, 'altair-rebel');
  speak(state, 'hilda', 'wild-rose');
  return state;
}

describe('save, services, and source coverage', () => {
  it('saves and loads party, growth, inventory, position, keywords, flags, and settings', () => {
    const state = wake();
    state.settings.volume = 0.35;
    state.settings.mute = true;
    state.settings.reducedEffects = true;
    state.settings.gameModeLock = true;
    const store = memoryStore();
    expect(canSaveHere(state)).toBe(true);
    must(state, { type: 'save', store });
    state.gil = 1;
    state.keywords = [];
    state.mapId = 'nowhere';
    const loaded = loadGame(store);
    expect(loaded).not.toBeNull();
    expect(loaded!.mapId).toBe('altair');
    expect(loaded!.keywords).toContain('wild-rose');
    expect(loaded!.flags.joinedRebellion).toBe(true);
    expect(loaded!.party.map((c) => c.id)).toEqual(['firion', 'maria', 'guy']);
    expect(loaded!.gil).toBeGreaterThan(1);
    expect(loaded!.settings.mute).toBe(true);
    expect(loaded!.settings.volume).toBe(0.35);
    expect(loaded!.settings.reducedEffects).toBe(true);
    expect(loaded!.settings.gameModeLock).toBe(true);
    expect(loaded!.items.potion).toBeGreaterThan(0);
    loaded!.gil = 0;
    expect(state.gil).toBe(1);
  });

  it('runs the inn, the shop, and the sanctuary', () => {
    const state = wake();
    const firion = state.party.find((c) => c.id === 'firion')!;
    firion.hp = 5;
    firion.mp = 0;
    const gil = state.gil;
    must(state, { type: 'rest', innId: 'altair' });
    expect(state.gil).toBe(gil - 20);
    expect(firion.hp).toBe(firion.maxHp);
    expect(firion.mp).toBe(firion.maxMp);
    const before = state.items.potion ?? 0;
    must(state, { type: 'buy', shopId: 'altair-items', itemId: 'potion' });
    expect(state.items.potion).toBe(before + 1);
    must(state, { type: 'sell', shopId: 'altair-items', itemId: 'potion' });
    expect(state.items.potion).toBe(before);
    must(state, { type: 'move-to', x: 13, y: 8 });
    must(state, { type: 'open-chest', chestId: 'altair-death' });
    must(state, { type: 'use-item', itemId: 'tome-death', targetId: 'maria' });
    must(state, { type: 'rest', innId: 'altair' });
    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'death', targetId: 'guy' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    expect(state.party.find((c) => c.id === 'guy')!.dead).toBe(true);
    if (state.battle) {
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
      must(state, { type: 'resolve-round' });
    }
    const cost = state.gil;
    must(state, { type: 'revive', townId: 'altair', characterId: 'guy' });
    expect(state.gil).toBe(cost - 200);
    expect(state.party.find((c) => c.id === 'guy')!.dead).toBe(false);
    expect(state.party.find((c) => c.id === 'guy')!.hp).toBeGreaterThan(0);
  });

  it('plays the Gatrea courier side errand', () => {
    const state = wake();
    must(state, { type: 'journey', locationId: 'gatrea' });
    must(state, { type: 'enter', locationId: 'gatrea' });
    speak(state, 'gatrea-courier');
    expect(state.flags.courierStarted).toBe(true);
    expect(state.items['sealed-dispatch']).toBe(1);
    must(state, { type: 'journey', locationId: 'altair' });
    must(state, { type: 'enter', locationId: 'altair' });
    const before = evasionOf(state.party[0]);
    speak(state, 'quartermaster');
    expect(state.flags.courierComplete).toBe(true);
    must(state, { type: 'equip', characterId: 'firion', slot: 'accessory', itemId: 'rebel-armband' });
    expect(evasionOf(state.party[0])).toBeGreaterThan(before);
  });

  it('covers the guide checklist at 90 percent or better', () => {
    const checklist = JSON.parse(readFileSync('docs/coverage-checklist.json', 'utf8')) as {
      rows: { id: string; kind: string; origin: string; implementationId: string }[];
    };
    expect(checklist.rows.length).toBeGreaterThan(200);
    for (const row of checklist.rows) {
      expect(row.implementationId.length).toBeGreaterThan(0);
      expect(row.origin === 'source' || row.origin === 'addition').toBe(true);
    }
    const ids = new Set(checklist.rows.map((row) => row.implementationId));
    for (const id of REQUIRED_LOCATIONS) expect(ids.has(id)).toBe(true);
    for (const id of STORY_BEAT_IDS) expect(ids.has(id)).toBe(true);
    for (const id of KEYWORDS) expect(ids.has(id)).toBe(true);
    for (const location of REQUIRED_LOCATIONS) expect(LOCATIONS.some((entry) => entry.id === location)).toBe(true);
    const ratio = (kind: string, registry: string[]) => {
      const listed = checklist.rows.filter((row) => row.kind === kind);
      const have = listed.filter((row) => registry.includes(row.implementationId)).length;
      expect(listed.length).toBeGreaterThan(0);
      expect(have / listed.length).toBeGreaterThanOrEqual(0.9);
    };
    ratio('spell', SPELLS.map((s) => s.id));
    ratio('weapon', WEAPONS.map((s) => s.id));
    ratio('armor', ARMOR.map((s) => s.id));
    ratio('consumable', CONSUMABLES.map((s) => s.id));
    ratio('enemy', ENEMIES.map((s) => s.id));
    expect(SPELLS.length).toBeGreaterThanOrEqual(36);
    expect(WEAPONS.length).toBeGreaterThanOrEqual(40);
    expect(ARMOR.length).toBeGreaterThanOrEqual(30);
    expect(CONSUMABLES.length).toBeGreaterThanOrEqual(15);
    expect(ENEMIES.length).toBeGreaterThanOrEqual(60);
    const guides = readdirSync('docs/guides');
    expect(guides.length).toBeGreaterThan(0);
    expect(checklist.rows.some((row) => row.origin === 'addition' && row.implementationId === 'gatrea-courier')).toBe(true);
    expect(INPUT_BINDINGS.keyboard.move.length).toBeGreaterThan(0);
    expect(INPUT_BINDINGS.touch.dpad).toBe(true);
    expect(INPUT_BINDINGS.mouse.move).toBe('click-tile');
    expect(INPUT_BINDINGS.gamepad.confirm).toBe(0);
    const calls: string[] = [];
    applySettings(
      { mute: true, volume: 0.25, reducedEffects: true, gameModeLock: true },
      {
        audio: {
          setMuted: (muted) => calls.push(`mute:${muted}`),
          setVolume: (volume) => calls.push(`vol:${volume}`),
        },
        renderer: { setReducedEffects: (reduced) => calls.push(`fx:${reduced}`) },
        display: {
          requestGameMode: async () => {
            calls.push('lock');
          },
          exitGameMode: async () => {
            calls.push('unlock');
          },
        },
      },
    );
    expect(calls).toContain('mute:true');
    expect(calls).toContain('vol:0');
    expect(calls).toContain('fx:true');
    expect(calls).toContain('lock');
  });
});
