import * as Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH, PlayScene, TitleScene } from './game/scenes';
import { bindRuntime, session, subscribe } from './game/session';
import { audio } from './game/audio';
import { mountHud } from './game/ui';

bindRuntime();
audio.play('title');
mountHud();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game-root',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#140e18',
  pixelArt: true,
  banner: false,
  preserveDrawingBuffer: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  input: { keyboard: true, mouse: true, touch: true, gamepad: true },
  scene: [TitleScene, PlayScene],
});

subscribe(() => {
  if (session.screen === 'play' && game.scene.isActive('title')) {
    game.scene.start('play');
    game.scene.stop('title');
  }
  if (session.screen === 'title' && game.scene.isActive('play')) {
    game.scene.start('title');
    game.scene.stop('play');
  }
});

const canvas = () => document.querySelector('#game-root canvas');
const mark = () => {
  const node = canvas();
  if (!node) return;
  node.setAttribute('width', String(GAME_WIDTH));
  node.setAttribute('height', String(GAME_HEIGHT));
};
game.events.once('ready', mark);
setTimeout(mark, 300);
