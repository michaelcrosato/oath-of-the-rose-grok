import { describe, expect, it } from 'vitest';
import { LOCATIONS, createNewGame } from '../src/engine';
import {
  confirmAction,
  enterAction,
  equipAction,
  equipChoices,
  fieldUseAction,
  journeyAction,
  journeyChoices,
  restAction,
  reviveAction,
  sellAction,
  sellChoices,
} from '../src/game/field-actions';
import { VIEW_H, VIEW_W, cameraScroll, tilePixels } from '../src/game/field-scale';
import { goNpc, must } from './play';

describe('field controls the HUD sends', () => {
  it('scales a 16 by 12 room so the 960 by 540 view stays on the map', () => {
    const cols = 16;
    const rows = 12;
    const tile = tilePixels(cols, rows);
    const mapW = cols * tile;
    const mapH = rows * tile;
    expect(mapW).toBeGreaterThanOrEqual(VIEW_W);
    expect(mapH).toBeGreaterThanOrEqual(VIEW_H);
    const scroll = cameraScroll(2 * tile + tile / 2, 9 * tile + tile / 2, mapW, mapH);
    expect(scroll.x).toBeGreaterThanOrEqual(0);
    expect(scroll.y).toBeGreaterThanOrEqual(0);
    expect(scroll.x + VIEW_W).toBeLessThanOrEqual(mapW + 0.02);
    expect(scroll.y + VIEW_H).toBeLessThanOrEqual(mapH + 0.02);
    const worldTile = tilePixels(42, 30);
    expect(42 * worldTile).toBeGreaterThanOrEqual(VIEW_W);
    expect(30 * worldTile).toBeGreaterThanOrEqual(VIEW_H);
  });

  it('enters, travels, rests, revives, equips, sells, and uses items from a new game', () => {
    const state = createNewGame(5);
    const opening = confirmAction(state, null);
    expect(opening).toEqual({ type: 'start-battle', encounterId: 'opening' });
    must(state, opening!);
    for (const member of state.party) {
      if (!member.dead) must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: 'e0' } });
    }
    must(state, { type: 'resolve-round' });
    expect(state.mapId).toBe('altair');
    expect(state.flags.rescued).toBe(true);

    const room = restAction(state);
    expect(room).toEqual({ type: 'rest', innId: 'altair' });
    const gil = state.gil;
    must(state, room!);
    expect(state.gil).toBe(gil - 20);

    must(state, { type: 'buy', shopId: 'altair-weapons', itemId: 'knife' });
    const knife = equipChoices(state, 'guy', 'off').find((item) => item.itemId === 'knife');
    expect(knife?.name).toBe('Knife');
    must(state, equipAction('guy', 'off', 'knife'));
    expect(state.party.find((member) => member.id === 'guy')!.equip.off).toBe('knife');

    const beforePotions = state.items.potion ?? 0;
    const sale = sellChoices(state, 'altair-items').find((item) => item.itemId === 'potion');
    expect(sale).toBeTruthy();
    const purse = state.gil;
    must(state, sellAction('altair-items', sale!.itemId));
    expect(state.items.potion).toBe(beforePotions - 1);
    expect(state.gil).toBe(purse + sale!.price);

    const dose = fieldUseAction('potion', 'firion');
    expect(dose).toEqual({ type: 'use-item', itemId: 'potion', targetId: 'firion' });
    must(state, dose);
    expect(state.items.potion).toBe(beforePotions - 2);

    must(state, { type: 'move-to', x: 13, y: 8 });
    const chest = confirmAction(state, null);
    expect(chest).toEqual({ type: 'open-chest', chestId: 'altair-death' });
    must(state, chest!);
    must(state, fieldUseAction('tome-death', 'maria'));
    expect(state.party.find((member) => member.id === 'maria')!.spells).toContain('death');

    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'death', targetId: 'guy' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    expect(state.party.find((member) => member.id === 'guy')!.dead).toBe(true);
    if (state.battle) {
      for (const member of state.party) {
        if (!member.dead && !state.battle.commands[member.id]) {
          must(state, { type: 'command', actorId: member.id, command: { kind: 'flee' } });
        }
      }
      must(state, { type: 'resolve-round' });
    }
    expect(state.mode).toBe('field');

    goNpc(state, 'altair-priest');
    const raising = confirmAction(state, null);
    expect(raising).toEqual(reviveAction('altair', 'guy'));
    const cost = state.gil;
    must(state, raising!);
    expect(state.gil).toBe(cost - 200);
    expect(state.party.find((member) => member.id === 'guy')!.dead).toBe(false);

    must(state, { type: 'move-to', x: 1, y: 10 });
    const leaving = confirmAction(state, null);
    expect(leaving).toEqual({ type: 'leave' });
    must(state, leaving!);
    expect(state.mapId).toBe('world');
    const altair = LOCATIONS.find((entry) => entry.id === 'altair')!;
    expect(state.worldX).toBe(altair.x);
    expect(state.worldY).toBe(altair.y);
    const back = confirmAction(state, null);
    expect(back).toEqual(enterAction('altair'));
    must(state, back!);
    expect(state.mapId).toBe('altair');
    must(state, { type: 'move-to', x: 1, y: 10 });
    const leavingAgain = confirmAction(state, null);
    expect(leavingAgain).toEqual({ type: 'leave' });
    must(state, leavingAgain!);

    const gatrea = LOCATIONS.find((entry) => entry.id === 'gatrea')!;
    expect(journeyChoices(state).some((place) => place.locationId === 'gatrea')).toBe(true);
    must(state, journeyAction('gatrea'));
    expect(state.mapId).toBe('world');
    expect(state.worldX).toBe(gatrea.x);
    expect(state.worldY).toBe(gatrea.y);
    expect(confirmAction(state, null)).toEqual(enterAction('gatrea'));
    must(state, enterAction('gatrea'));
    expect(state.mapId).toBe('gatrea');
    const gatreaRoom = restAction(state);
    expect(gatreaRoom).toEqual({ type: 'rest', innId: 'gatrea' });
    must(state, gatreaRoom!);
  });
});
