import { commandError, resolveRound } from './battle';
import { beginBattle } from './battle';
import { ENCOUNTER_BY_ID, type KeywordId } from '../data/content';
import {
  type ActionResult,
  type BattleCommand,
  type GameState,
  type Ride,
  note,
} from './model';
import { saveGame, type Store } from './save';
import { maybeSnowFarewell, onEnter, onVictory, sail, storyBattleBlock, talk, useFieldItem } from './story';
import {
  board,
  buy,
  dismountChocobo,
  enterLocation,
  equipItem,
  journeyTo,
  leaveMap,
  mountChocobo,
  moveTo,
  openChest,
  rest,
  revive,
  sell,
  setRow,
  step,
  travelToTile,
  useStairs,
  canFight,
} from './world';

export type Action =
  | { type: 'start-battle'; encounterId: string }
  | { type: 'command'; actorId: string; command: BattleCommand }
  | { type: 'resolve-round' }
  | { type: 'talk'; npcId: string; keyword?: KeywordId }
  | { type: 'journey'; locationId: string }
  | { type: 'enter'; locationId: string }
  | { type: 'leave' }
  | { type: 'step'; dx: number; dy: number }
  | { type: 'move-to'; x: number; y: number }
  | { type: 'travel-tile'; x: number; y: number }
  | { type: 'board'; ride: Ride }
  | { type: 'mount-chocobo' }
  | { type: 'dismount-chocobo' }
  | { type: 'use-item'; itemId: string; targetId?: string }
  | { type: 'equip'; characterId: string; slot: 'main' | 'off' | 'head' | 'body' | 'hands' | 'accessory'; itemId: string | null }
  | { type: 'row'; characterId: string; row: 'front' | 'back' }
  | { type: 'buy'; shopId: string; itemId: string }
  | { type: 'sell'; shopId: string; itemId: string }
  | { type: 'rest'; innId: string }
  | { type: 'revive'; townId: string; characterId: string }
  | { type: 'open-chest'; chestId: string }
  | { type: 'stairs' }
  | { type: 'sail' }
  | { type: 'save'; store: Store }
  | { type: 'settings'; patch: Partial<GameState['settings']> };

function gateBattle(state: GameState, encounterId: string): ActionResult | null {
  if (!ENCOUNTER_BY_ID[encounterId]) return { ok: false, error: 'unknown', messages: ['No such encounter.'] };
  const story = storyBattleBlock(state, encounterId);
  if (story) return { ok: false, error: 'story', messages: [story] };
  const where = canFight(state, encounterId);
  if (where) return { ok: false, error: where, messages: ['You cannot start that battle here.'] };
  return null;
}

export function dispatch(state: GameState, action: Action): ActionResult {
  switch (action.type) {
    case 'start-battle': {
      const blocked = gateBattle(state, action.encounterId);
      if (blocked) return blocked;
      beginBattle(state, action.encounterId);
      return { ok: true, messages: state.battle?.log ?? [] };
    }
    case 'command': {
      const error = commandError(state, action.actorId, action.command);
      if (error) return { ok: false, error, messages: [error] };
      state.battle!.commands[action.actorId] = action.command;
      return { ok: true, messages: ['Command set.'] };
    }
    case 'resolve-round': {
      const result = resolveRound(state);
      if (state.pendingVictory) {
        const id = state.pendingVictory;
        state.pendingVictory = null;
        onVictory(state, id);
      }
      return result;
    }
    case 'talk':
      return talk(state, action.npcId, action.keyword);
    case 'journey':
      return journeyTo(state, action.locationId);
    case 'enter': {
      const entered = enterLocation(state, action.locationId);
      if (entered.ok) onEnter(state, action.locationId);
      return entered;
    }
    case 'leave': {
      maybeSnowFarewell(state);
      return leaveMap(state);
    }
    case 'step':
      return step(state, action.dx, action.dy);
    case 'move-to':
      return moveTo(state, action.x, action.y);
    case 'travel-tile':
      return travelToTile(state, action.x, action.y);
    case 'board':
      return board(state, action.ride);
    case 'mount-chocobo':
      return mountChocobo(state);
    case 'dismount-chocobo':
      return dismountChocobo(state);
    case 'use-item':
      return useFieldItem(state, action.itemId, action.targetId);
    case 'equip':
      return equipItem(state, action.characterId, action.slot, action.itemId);
    case 'row':
      return setRow(state, action.characterId, action.row);
    case 'buy':
      return buy(state, action.shopId, action.itemId);
    case 'sell':
      return sell(state, action.shopId, action.itemId);
    case 'rest':
      return rest(state, action.innId);
    case 'revive':
      return revive(state, action.townId, action.characterId);
    case 'open-chest':
      return openChest(state, action.chestId);
    case 'stairs':
      return useStairs(state);
    case 'sail':
      return sail(state);
    case 'save':
      return saveGame(state, action.store);
    case 'settings': {
      state.settings = { ...state.settings, ...action.patch };
      if (state.settings.volume < 0) state.settings.volume = 0;
      if (state.settings.volume > 1) state.settings.volume = 1;
      note(state, 'Settings kept.');
      return { ok: true, messages: ['Settings kept.'] };
    }
    default:
      return { ok: false, error: 'bad-action', messages: ['Unknown action.'] };
  }
}
