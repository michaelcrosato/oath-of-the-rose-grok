import type { ActionResult, GameState, Settings } from './model';

export const SAVE_KEY = 'oath-of-the-rose-save';
export const SETTINGS_KEY = 'oath-of-the-rose-settings';

export interface Store {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const TOWNS = new Set(['altair', 'gatrea', 'paloom', 'poft', 'salamand', 'bafsk', 'fynn', 'mysidia']);

export function canSaveHere(state: GameState): boolean {
  if (state.battle || state.mode === 'battle' || state.mode === 'gameover') return false;
  if (state.mode === 'ending') return true;
  if (state.mapId === 'world') return true;
  return TOWNS.has(state.mapId);
}

export function saveGame(state: GameState, store: Store): ActionResult {
  if (!canSaveHere(state)) {
    return { ok: false, error: 'no-save', messages: ['You can save in towns and on the world map.'] };
  }
  const snapshot = structuredClone(state);
  snapshot.battle = null;
  snapshot.pendingVictory = null;
  store.setItem(SAVE_KEY, JSON.stringify({ v: 1, savedAt: '2026-09-26', model: 'Grok', state: snapshot }));
  store.setItem(SETTINGS_KEY, JSON.stringify(state.settings));
  return { ok: true, messages: ['The oath is recorded.'] };
}

export function loadGame(store: Store): GameState | null {
  const raw = store.getItem(SAVE_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw) as { state?: GameState };
  if (!parsed.state) return null;
  const state = structuredClone(parsed.state);
  state.battle = null;
  state.pendingVictory = null;
  if (state.mode === 'battle') state.mode = 'field';
  return state;
}

export function hasSave(store: Store): boolean {
  return !!store.getItem(SAVE_KEY);
}

export function loadSettings(store: Store): Settings | null {
  const raw = store.getItem(SETTINGS_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as Settings;
}

export function memoryStore(): Store {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}
