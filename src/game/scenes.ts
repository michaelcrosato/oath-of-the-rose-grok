import * as Phaser from 'phaser';
import harbor from '../assets/title-harbor.jpg';
import { MAPS, terrainAt, visibleNpcs } from '../engine';
import { audio } from './audio';
import { INPUT_BINDINGS } from './runtime';
import { act, session } from './session';

const TILE = 16;
const VIEW_W = 960;
const VIEW_H = 540;

const COLORS: Record<string, number> = {
  g: 0x3d6b45,
  f: 0x2e5a40,
  d: 0xc4a070,
  s: 0xd5e2ef,
  m: 0x5c564e,
  w: 0x1a4068,
  h: 0x3a78a8,
  r: 0x2f6f98,
  t: 0x243828,
  p: 0x8d734c,
  v: 0x140e18,
  '#': 0x2a2430,
  '.': 0x6e6258,
  e: 0xc4a070,
  '+': 0x4a3a28,
};

const WHO: Record<string, number> = {
  firion: 0xc44868,
  maria: 0xe0b060,
  guy: 0x6aaa78,
  minwu: 0xf0d8b0,
  josef: 0xd8c0a0,
  gordon: 0x88a0c8,
  leila: 0xc06048,
  ricard: 0x88e0c8,
  leon: 0x8c1c2c,
};

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('title');
  }

  preload(): void {
    this.load.image('harbor', harbor);
  }

  create(): void {
    this.add.image(VIEW_W / 2, VIEW_H / 2, 'harbor').setDisplaySize(VIEW_W, VIEW_H);
    this.add.rectangle(VIEW_W / 2, 430, VIEW_W, 230, 0x140e18, 0.62);
    this.add.text(VIEW_W / 2, 390, 'OATH OF THE ROSE', {
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '58px',
      color: '#f0d8b0',
    }).setOrigin(0.5);
    this.add.text(VIEW_W / 2, 455, 'Rebels, iron ships, and an oath that outlives the empire', {
      fontFamily: 'Georgia, serif',
      fontSize: '20px',
      color: '#e88898',
    }).setOrigin(0.5);
    this.add.text(VIEW_W / 2, 500, '2026-09-26   ·   Grok', {
      fontFamily: 'ui-monospace, monospace',
      fontSize: '16px',
      color: '#c4b8a4',
    }).setOrigin(0.5);
    audio.play('title');
  }
}

export class PlayScene extends Phaser.Scene {
  private gfx!: Phaser.GameObjects.Graphics;
  private labels!: Phaser.GameObjects.Container;
  private seen = -1;
  private keys: Record<string, Phaser.Input.Keyboard.Key> = {};

  constructor() {
    super('play');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#140e18');
    this.gfx = this.add.graphics();
    this.labels = this.add.container(0, 0);
    this.input.mouse?.disableContextMenu();
    const kb = this.input.keyboard;
    if (kb) {
      for (const code of INPUT_BINDINGS.keyboard.move) this.keys[code] = kb.addKey(code);
      for (const code of [...INPUT_BINDINGS.keyboard.confirm, ...INPUT_BINDINGS.keyboard.cancel, ...INPUT_BINDINGS.keyboard.menu, ...INPUT_BINDINGS.keyboard.save]) {
        this.keys[code] = kb.addKey(code);
      }
    }
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!session.state || session.state.mode === 'battle' || session.state.mode === 'ending') return;
      const tileX = Math.floor(pointer.worldX / TILE);
      const tileY = Math.floor(pointer.worldY / TILE);
      if (session.state.mapId === 'world') act({ type: 'travel-tile', x: tileX, y: tileY });
      else act({ type: 'move-to', x: tileX, y: tileY });
    });
    this.redraw();
  }

  update(): void {
    audio.tick();
    this.pollKeys();
    this.pollPad();
    if (this.seen !== session.revision) this.redraw();
  }

  private pollKeys(): void {
    if (!session.state || session.screen !== 'play') return;
    const down = (code: string) => this.keys[code] && Phaser.Input.Keyboard.JustDown(this.keys[code]);
    if (session.state.mode === 'field') {
      if (down('ArrowUp') || down('KeyW')) act({ type: 'step', dx: 0, dy: -1 });
      else if (down('ArrowDown') || down('KeyS')) act({ type: 'step', dx: 0, dy: 1 });
      else if (down('ArrowLeft') || down('KeyA')) act({ type: 'step', dx: -1, dy: 0 });
      else if (down('ArrowRight') || down('KeyD')) act({ type: 'step', dx: 1, dy: 0 });
      else if (down('Enter') || down('KeyZ')) window.dispatchEvent(new CustomEvent('oath-confirm'));
      else if (down('KeyC') || down('KeyM')) window.dispatchEvent(new CustomEvent('oath-menu'));
      else if (down('KeyP')) act({ type: 'save', store: window.localStorage });
    } else if (down('Escape') || down('KeyX')) window.dispatchEvent(new CustomEvent('oath-cancel'));
  }

  private pollPad(): void {
    const pad = this.input.gamepad?.getPad(0);
    if (!pad || !session.state || session.state.mode !== 'field') return;
    const axisX = pad.axes.length > 0 ? pad.axes[0].getValue() : 0;
    const axisY = pad.axes.length > 1 ? pad.axes[1].getValue() : 0;
    const now = this.time.now;
    const ready = now - ((this as unknown as { padAt?: number }).padAt ?? 0) > 180;
    if (!ready) return;
    let dx = 0;
    let dy = 0;
    if (pad.left || axisX < -0.5) dx = -1;
    else if (pad.right || axisX > 0.5) dx = 1;
    else if (pad.up || axisY < -0.5) dy = -1;
    else if (pad.down || axisY > 0.5) dy = 1;
    if (dx || dy) {
      (this as unknown as { padAt: number }).padAt = now;
      act({ type: 'step', dx, dy });
    }
    if (pad.A && Phaser.Input.Keyboard && ready) {
      /* confirm is also a DOM button; A mirrors it */
    }
    if (pad.buttons[INPUT_BINDINGS.gamepad.confirm]?.pressed && ready && !dx && !dy) {
      (this as unknown as { padAt: number }).padAt = now;
      window.dispatchEvent(new CustomEvent('oath-confirm'));
    }
    if (pad.buttons[INPUT_BINDINGS.gamepad.menu]?.pressed && ready) {
      (this as unknown as { padAt: number }).padAt = now;
      window.dispatchEvent(new CustomEvent('oath-menu'));
    }
  }

  private redraw(): void {
    this.seen = session.revision;
    this.gfx.clear();
    this.labels.removeAll(true);
    const state = session.state;
    if (!state) return;
    if (state.mode === 'battle' && state.battle) this.drawBattle();
    else if (state.mode === 'ending') this.drawEnding();
    else this.drawField();
    if (!session.reduced && state.mode === 'battle') this.cameras.main.shake(80, 0.002);
  }

  private drawField(): void {
    const state = session.state!;
    if (state.mapId === 'world') {
      const radiusX = 30;
      const radiusY = 17;
      for (let y = state.worldY - radiusY; y <= state.worldY + radiusY; y++) {
        for (let x = state.worldX - radiusX; x <= state.worldX + radiusX; x++) {
          const terrain = terrainAt(x, y);
          this.gfx.fillStyle(COLORS[terrain] ?? 0x140e18, 1);
          this.gfx.fillRect(x * TILE, y * TILE, TILE, TILE);
          if (terrain === 'g' || terrain === 'f') {
            this.gfx.fillStyle(0x2a2018, 0.25);
            this.gfx.fillRect(x * TILE, y * TILE + 12, TILE, 4);
          }
        }
      }
      this.person(state.worldX, state.worldY, WHO.firion, 'You');
      this.cameras.main.centerOn(state.worldX * TILE + 8, state.worldY * TILE + 8);
      return;
    }
    const map = MAPS[state.mapId];
    if (!map) return;
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const ch = map.rows[y][x];
        this.gfx.fillStyle(COLORS[ch] ?? COLORS['.'], 1);
        this.gfx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
    for (const npc of visibleNpcs(state).filter((entry) => entry.mapId === state.mapId)) {
      this.person(npc.x, npc.y, 0xe0b060, npc.name);
    }
    this.person(state.x, state.y, WHO.firion, 'You');
    const followers = state.party.filter((c) => c.id !== 'firion' && !c.dead);
    followers.forEach((member, index) => this.person(state.x - 1 - (index % 2), state.y + Math.floor(index / 2), WHO[member.id] ?? 0xf0d8b0, member.name));
    this.cameras.main.centerOn(state.x * TILE + 8, state.y * TILE + 8);
  }

  private person(x: number, y: number, color: number, name: string): void {
    this.gfx.fillStyle(0x140e18, 1);
    this.gfx.fillRect(x * TILE + 3, y * TILE + 2, 10, 13);
    this.gfx.fillStyle(color, 1);
    this.gfx.fillRect(x * TILE + 4, y * TILE + 3, 8, 8);
    this.gfx.fillRect(x * TILE + 5, y * TILE + 11, 6, 3);
    const label = this.add.text(x * TILE + 8, y * TILE - 8, name, {
      fontFamily: 'ui-monospace, monospace',
      fontSize: '10px',
      color: '#f0d8b0',
    }).setOrigin(0.5, 1);
    this.labels.add(label);
  }

  private drawBattle(): void {
    const state = session.state!;
    const battle = state.battle!;
    this.cameras.main.setScroll(0, 0);
    this.gfx.fillStyle(0x1a1424, 1);
    this.gfx.fillRect(0, 0, VIEW_W, VIEW_H);
    this.gfx.fillStyle(0x2a1e38, 1);
    this.gfx.fillRect(0, 300, VIEW_W, 240);
    this.gfx.fillStyle(0x3a2848, 1);
    this.gfx.fillRect(0, 286, VIEW_W, 16);
    const foes = battle.foes;
    foes.forEach((foe, index) => {
      const x = 80 + (index % 4) * 110;
      const y = foe.row === 'back' ? 90 : 160;
      this.gfx.fillStyle(foe.dead ? 0x3a3040 : 0x8c1c2c, 1);
      this.gfx.fillRect(x, y, 64, 48);
      this.gfx.fillStyle(0xf0d8b0, 1);
      this.gfx.fillRect(x + 8, y + 8, 20, 8);
      const label = this.add.text(x + 32, y - 8, foe.dead ? `${foe.name} down` : foe.name, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '14px',
        color: '#f0d8b0',
      }).setOrigin(0.5, 1);
      this.labels.add(label);
    });
    state.party.forEach((member, index) => {
      const x = 560 + (index % 2) * 160;
      const y = member.row === 'back' ? 150 : 230;
      this.gfx.fillStyle(member.dead ? 0x3a3040 : (WHO[member.id] ?? 0xc44868), 1);
      this.gfx.fillRect(x, y, 28, 40);
      const label = this.add.text(x + 14, y + 52, `${member.name} ${member.hp}/${member.maxHp}`, {
        fontFamily: 'ui-monospace, monospace',
        fontSize: '14px',
        color: '#f0d8b0',
      }).setOrigin(0.5, 0);
      this.labels.add(label);
    });
    const last = battle.log[battle.log.length - 1] ?? '';
    const msg = this.add.text(40, 40, last, {
      fontFamily: 'Georgia, serif',
      fontSize: '22px',
      color: '#f0d8b0',
      wordWrap: { width: 880 },
    });
    this.labels.add(msg);
  }

  private drawEnding(): void {
    this.cameras.main.setScroll(0, 0);
    this.gfx.fillStyle(0x140e18, 1);
    this.gfx.fillRect(0, 0, VIEW_W, VIEW_H);
    const text = this.add.text(80, 60, session.state?.endingText ?? '', {
      fontFamily: 'Georgia, serif',
      fontSize: '26px',
      color: '#f0d8b0',
      wordWrap: { width: 800 },
    });
    this.labels.add(text);
  }
}

export const GAME_WIDTH = VIEW_W;
export const GAME_HEIGHT = VIEW_H;
