import { GEAR_BY_ID, INNS, SANCTUARIES, type GearDef } from '../data/content';
import type { KeywordId } from '../data/content';
import {
  LOCATIONS,
  MAPS,
  SNOWCRAFT_AT,
  canReach,
  visibleNpcs,
  type Action,
  type GameState,
} from '../engine';
import type { Ride } from '../engine/model';
import { CANOE_AT } from '../engine/world';

export type EquipSlot = 'main' | 'off' | 'head' | 'body' | 'hands' | 'accessory';

const RIDES: Ride[] = ['foot', 'canoe', 'ship', 'snowcraft', 'airship', 'chocobo'];

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function hereOf(state: GameState): { x: number; y: number } {
  return state.mapId === 'world' ? { x: state.worldX, y: state.worldY } : { x: state.x, y: state.y };
}

export function locationAt(state: GameState): { id: string; name: string } | null {
  if (state.mapId !== 'world') return null;
  const loc = LOCATIONS.find((entry) => entry.x === state.worldX && entry.y === state.worldY);
  return loc ? { id: loc.id, name: loc.name } : null;
}

export function journeyAction(locationId: string): Action {
  return { type: 'journey', locationId };
}

export function enterAction(locationId: string): Action {
  return { type: 'enter', locationId };
}

export function boardAction(ride: string): Action {
  const safe = RIDES.includes(ride as Ride) ? (ride as Ride) : 'foot';
  return { type: 'board', ride: safe };
}

export function sailAction(): Action {
  return { type: 'sail' };
}

export function restAction(state: GameState): Action | null {
  if (!INNS[state.mapId]) return null;
  return { type: 'rest', innId: state.mapId };
}

export function reviveTargets(state: GameState): string[] {
  if (!SANCTUARIES.includes(state.mapId)) return [];
  return state.party.filter((member) => member.dead && !state.fallen.includes(member.id)).map((member) => member.id);
}

export function reviveAction(townId: string, characterId: string): Action {
  return { type: 'revive', townId, characterId };
}

export function equipAction(characterId: string, slot: EquipSlot, itemId: string | null): Action {
  return { type: 'equip', characterId, slot, itemId };
}

export function sellAction(shopId: string, itemId: string): Action {
  return { type: 'sell', shopId, itemId };
}

export function fieldUseAction(itemId: string, targetId?: string): Action {
  return targetId ? { type: 'use-item', itemId, targetId } : { type: 'use-item', itemId };
}

export function journeyChoices(state: GameState): { locationId: string; name: string }[] {
  if (state.mode !== 'field' || state.phase === 'intro' || state.battle) return [];
  return LOCATIONS.filter((loc) => loc.id !== 'leviathan' && canReach(state, loc.id))
    .filter((loc) => !(state.mapId === 'world' && state.worldX === loc.x && state.worldY === loc.y))
    .map((loc) => ({ locationId: loc.id, name: loc.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function rideChoices(state: GameState): Action[] {
  if (state.mode !== 'field' || state.phase === 'intro' || state.battle) return [];
  const out: Action[] = [];
  if (state.phase === 'to-leila' && state.party.some((member) => member.id === 'leila')) out.push(sailAction());
  if (state.vehicles.airship) out.push(boardAction('airship'));
  if (state.vehicles.ship) out.push(boardAction('ship'));
  const onCanoe = state.mapId === 'world' && state.worldX === CANOE_AT.x && state.worldY === CANOE_AT.y;
  const onSnow = state.mapId === 'world' && state.worldX === SNOWCRAFT_AT.x && state.worldY === SNOWCRAFT_AT.y;
  if (state.vehicles.canoe || onCanoe) out.push(boardAction('canoe'));
  if (state.vehicles.snowcraft || onSnow) out.push(boardAction('snowcraft'));
  if (state.ride !== 'foot' || state.chocoboMounted) out.push(boardAction('foot'));
  if (state.mapId === 'chocobo-forest' && !state.chocoboMounted) out.push({ type: 'mount-chocobo' });
  if (state.chocoboMounted) out.push({ type: 'dismount-chocobo' });
  return out;
}

function fits(item: GearDef, slot: EquipSlot): boolean {
  if (slot === 'main') return item.kind === 'weapon';
  if (slot === 'off') return item.kind === 'weapon' || item.kind === 'shield';
  if (slot === 'accessory') return item.kind === 'accessory';
  return item.slot === slot;
}

export function equipChoices(state: GameState, characterId: string, slot: EquipSlot): { itemId: string; name: string }[] {
  const seen = new Set<string>();
  const out: { itemId: string; name: string }[] = [];
  for (const [id, count] of Object.entries(state.items)) {
    if (count <= 0 || seen.has(id)) continue;
    const item = GEAR_BY_ID[id];
    if (!item || !fits(item, slot)) continue;
    seen.add(id);
    out.push({ itemId: id, name: item.name });
  }
  return out;
}

export function sellChoices(state: GameState, shopId: string): { itemId: string; name: string; price: number }[] {
  void shopId;
  const out: { itemId: string; name: string; price: number }[] = [];
  for (const [id, count] of Object.entries(state.items)) {
    if (count <= 0) continue;
    const item = GEAR_BY_ID[id];
    if (!item || !item.sellable || item.key) continue;
    out.push({ itemId: id, name: item.name, price: Math.max(1, Math.floor(item.price / 2)) });
  }
  return out;
}

export function fieldUseChoices(state: GameState): { itemId: string; name: string; count: number }[] {
  const out: { itemId: string; name: string; count: number }[] = [];
  for (const [id, count] of Object.entries(state.items)) {
    if (count <= 0) continue;
    const item = GEAR_BY_ID[id];
    if (!item) continue;
    const field =
      item.kind === 'tome' ||
      id === 'sunfire' ||
      id === 'ultima-tome' ||
      item.effect === 'field-full' ||
      item.effect === 'cure-death' ||
      !!item.effect?.startsWith('heal-');
    if (field) out.push({ itemId: id, name: item.name, count });
  }
  return out;
}

/** The action Talk / confirm should send. Null means there is nothing in reach. */
export function confirmAction(state: GameState, ask: KeywordId | null): Action | null {
  if (state.mode !== 'field') return null;
  if (state.phase === 'intro' && state.mapId === 'outskirts') {
    return { type: 'start-battle', encounterId: 'opening' };
  }
  const here = hereOf(state);
  const adjacent = visibleNpcs(state)
    .filter((entry) => entry.mapId === state.mapId && dist(here.x, here.y, entry.x, entry.y) <= 1)
    .sort((a, b) => dist(here.x, here.y, a.x, a.y) - dist(here.x, here.y, b.x, b.y))[0];
  if (ask && adjacent) return { type: 'talk', npcId: adjacent.id, keyword: ask };
  if (state.mapId !== 'world' && adjacent) {
    if (adjacent.id.endsWith('-inn') && INNS[state.mapId]) return restAction(state);
    if (adjacent.id.endsWith('-priest')) {
      const dead = reviveTargets(state);
      if (dead[0]) return reviveAction(state.mapId, dead[0]);
    }
    return { type: 'talk', npcId: adjacent.id };
  }
  const map = MAPS[state.mapId];
  if (map && state.mapId !== 'world') {
    const chest = map.chests
      .filter((entry) => !state.chests.includes(entry.id) && dist(state.x, state.y, entry.x, entry.y) <= 1)
      .sort((a, b) => dist(state.x, state.y, a.x, a.y) - dist(state.x, state.y, b.x, b.y))[0];
    if (chest) return { type: 'open-chest', chestId: chest.id };
    const stair = map.stairs
      .filter((entry) => dist(state.x, state.y, entry.x, entry.y) <= 1)
      .sort((a, b) => dist(state.x, state.y, a.x, a.y) - dist(state.x, state.y, b.x, b.y))[0];
    if (stair) return { type: 'stairs' };
    if (map.boss && dist(state.x, state.y, map.boss.x, map.boss.y) <= 1) {
      return { type: 'start-battle', encounterId: map.boss.encounterId };
    }
    if (map.rows[state.y]?.[state.x] === 'e') return { type: 'leave' };
  }
  if (state.mapId === 'world') {
    const place = locationAt(state);
    if (place) return enterAction(place.id);
    if (state.worldX === SNOWCRAFT_AT.x && state.worldY === SNOWCRAFT_AT.y) return boardAction('snowcraft');
    if (state.worldX === CANOE_AT.x && state.worldY === CANOE_AT.y) return boardAction('canoe');
  }
  return null;
}

export function confirmLabel(state: GameState, ask: KeywordId | null): string {
  const action = confirmAction(state, ask);
  if (!action) return 'Talk';
  if (action.type === 'enter') return 'Enter';
  if (action.type === 'leave') return 'Leave';
  if (action.type === 'rest') return 'Rest';
  if (action.type === 'revive') return 'Revive';
  if (action.type === 'board') return 'Board';
  if (action.type === 'sail') return 'Sail';
  if (action.type === 'stairs') return 'Stairs';
  if (action.type === 'open-chest') return 'Chest';
  if (action.type === 'start-battle') return 'Fight';
  return 'Talk';
}
