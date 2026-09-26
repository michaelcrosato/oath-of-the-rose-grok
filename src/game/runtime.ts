import type { Settings } from '../engine/model';

export const INPUT_BINDINGS = {
  keyboard: {
    move: ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'],
    confirm: ['Enter', 'KeyZ'],
    cancel: ['Escape', 'KeyX'],
    menu: ['KeyC', 'KeyM'],
    save: ['KeyP'],
  },
  mouse: {
    move: 'click-tile',
    confirm: 'click',
    cancel: 'right-click',
  },
  touch: {
    dpad: true,
    confirm: true,
    menu: true,
    battleCommands: ['Attack', 'Magic', 'Item', 'Flee'],
  },
  gamepad: {
    move: 'left-stick-and-dpad',
    confirm: 0,
    cancel: 1,
    menu: 2,
    ask: 3,
    save: 9,
  },
} as const;

export interface RuntimeEnv {
  audio: { setMuted(muted: boolean): void; setVolume(volume: number): void };
  renderer: { setReducedEffects(reduced: boolean): void };
  display: { requestGameMode(): Promise<void>; exitGameMode(): Promise<void> };
}

export function applySettings(settings: Settings, env: RuntimeEnv): void {
  env.audio.setMuted(settings.mute);
  env.audio.setVolume(settings.mute ? 0 : settings.volume);
  env.renderer.setReducedEffects(settings.reducedEffects);
  if (settings.gameModeLock) void env.display.requestGameMode();
  else void env.display.exitGameMode();
}

export function browserEnv(audio: RuntimeEnv['audio'], renderer: RuntimeEnv['renderer']): RuntimeEnv {
  let lock: { release(): Promise<void> } | null = null;
  return {
    audio,
    renderer,
    display: {
      async requestGameMode() {
        const root = document.documentElement;
        if (!document.fullscreenElement && root.requestFullscreen) {
          try {
            await root.requestFullscreen();
          } catch {
            /* iOS Safari may reject; the layout still locks to the screen. */
          }
        }
        document.body.classList.add('game-lock');
        const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } };
        try {
          lock = await nav.wakeLock?.request('screen') ?? null;
        } catch {
          lock = null;
        }
      },
      async exitGameMode() {
        document.body.classList.remove('game-lock');
        if (lock) {
          try {
            await lock.release();
          } catch {
            /* already released */
          }
          lock = null;
        }
        if (document.fullscreenElement && document.exitFullscreen) {
          try {
            await document.exitFullscreen();
          } catch {
            /* already exited */
          }
        }
      },
    },
  };
}
