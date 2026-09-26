import { audio } from './audio';
import { applySettings, browserEnv, type RuntimeEnv } from './runtime';
import { loadSettings } from '../engine/save';
import {
  createNewGame,
  dispatch,
  hasSave,
  loadGame,
  type Action,
  type GameState,
} from '../engine';

const listeners = new Set<() => void>();

export const session: {
  state: GameState | null;
  screen: 'title' | 'play';
  notice: string;
  reduced: boolean;
  revision: number;
} = {
  state: null,
  screen: 'title',
  notice: '',
  reduced: false,
  revision: 0,
};

let env: RuntimeEnv | null = null;

export function bindRuntime(): void {
  env = browserEnv(
    {
      setMuted: (muted) => audio.setMuted(muted),
      setVolume: (volume) => audio.setVolume(volume),
    },
    {
      setReducedEffects: (reduced) => {
        session.reduced = reduced;
        audio.setReduced(reduced);
      },
    },
  );
  const store = window.localStorage;
  const settings = loadSettings(store);
  if (settings && env) applySettings(settings, env);
}

export function subscribe(listener: () => void): void {
  listeners.add(listener);
}

function bump(): void {
  session.revision += 1;
  const mode = session.state?.mode;
  if (mode === 'battle') audio.play('battle');
  else if (mode === 'ending') audio.play('ending');
  else if (session.screen === 'title') audio.play('title');
  else audio.play('field');
  if (session.state && env) applySettings(session.state.settings, env);
  for (const listener of listeners) listener();
}

export function act(action: Action): void {
  if (!session.state) return;
  const result = dispatch(session.state, action);
  if (!result.ok && result.messages[0]) session.notice = result.messages[0];
  else if (result.messages[0]) session.notice = result.messages[0];
  if (result.error?.startsWith('encounter:')) {
    dispatch(session.state, { type: 'start-battle', encounterId: result.error.slice(10) });
    audio.sfx('confirm');
  } else if (result.ok && action.type === 'resolve-round') {
    audio.sfx(session.state.mode === 'field' ? 'win' : 'hit');
  } else if (result.ok) audio.sfx('confirm');
  bump();
}

export function newGame(): void {
  const settings = session.state?.settings;
  session.state = createNewGame(Date.now() % 100000);
  if (settings) session.state.settings = { ...settings };
  session.screen = 'play';
  session.notice = session.state.objective;
  audio.sfx('confirm');
  bump();
}

export function continueGame(): void {
  const loaded = loadGame(window.localStorage);
  if (!loaded) {
    session.notice = 'No oath has been recorded yet.';
    bump();
    return;
  }
  session.state = loaded;
  session.screen = 'play';
  session.notice = loaded.objective;
  bump();
}

export function title(): void {
  session.screen = 'title';
  session.state = null;
  audio.play('title');
  bump();
}

export function savedGameExists(): boolean {
  return hasSave(window.localStorage);
}
