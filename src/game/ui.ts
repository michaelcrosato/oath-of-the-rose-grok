import { KEYWORD_LABEL, type KeywordId } from '../data/content';
import { MAPS, attackPower, canSaveHere, cureAilments, defensePower, rateEncounter, skillRank, visibleNpcs } from '../engine';
import { GEAR_BY_ID } from '../data/content';
import { SHOPS } from '../data/content';
import { audio } from './audio';
import { act, continueGame, newGame, savedGameExists, session, subscribe, title } from './session';
import { applySettings, browserEnv } from './runtime';
import { loadSettings, SETTINGS_KEY } from '../engine/save';

type Panel = 'none' | 'menu' | 'ask' | 'options' | 'shop' | 'party';

let panel: Panel = 'none';
let ask: KeywordId | null = null;
let shopId = 'altair-items';
let actorId = 'firion';

function esc(text: string): string {
  return text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch] ?? ch);
}

function settingsOf() {
  return (
    session.state?.settings ??
    loadSettings(window.localStorage) ?? { mute: false, volume: 0.8, gameModeLock: false, reducedEffects: false }
  );
}

function patchSettings(patch: Partial<ReturnType<typeof settingsOf>>): void {
  const next = { ...settingsOf(), ...patch };
  if (session.state) act({ type: 'settings', patch: next });
  else {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    applySettings(next, browserEnv(audio, { setReducedEffects: (reduced) => audio.setReduced(reduced) }));
    draw();
  }
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function confirm(): void {
  const state = session.state;
  if (!state || state.mode !== 'field') return;
  if (state.phase === 'intro') {
    act({ type: 'start-battle', encounterId: 'opening' });
    return;
  }
  const here = state.mapId === 'world' ? { x: state.worldX, y: state.worldY } : { x: state.x, y: state.y };
  if (ask) {
    const npc = visibleNpcs(state).find((entry) => entry.mapId === state.mapId && dist(here.x, here.y, entry.x, entry.y) <= 1);
    if (npc) {
      const word = ask;
      ask = null;
      act({ type: 'talk', npcId: npc.id, keyword: word });
      return;
    }
  }
  const npc = visibleNpcs(state)
    .filter((entry) => entry.mapId === state.mapId && dist(here.x, here.y, entry.x, entry.y) <= 1)
    .sort((a, b) => dist(here.x, here.y, a.x, a.y) - dist(here.x, here.y, b.x, b.y))[0];
  if (npc && state.mapId !== 'world') {
    act({ type: 'talk', npcId: npc.id });
    return;
  }
  const map = MAPS[state.mapId];
  const chest = map?.chests.find((entry) => !state.chests.includes(entry.id) && dist(state.x, state.y, entry.x, entry.y) <= 1);
  if (chest) {
    act({ type: 'open-chest', chestId: chest.id });
    return;
  }
  const stair = map?.stairs.find((entry) => dist(state.x, state.y, entry.x, entry.y) <= 1);
  if (stair) {
    act({ type: 'stairs' });
    return;
  }
  if (map?.boss && dist(state.x, state.y, map.boss.x, map.boss.y) <= 1) {
    act({ type: 'start-battle', encounterId: map.boss.encounterId });
    return;
  }
  if (map && map.rows[state.y]?.[state.x] === 'e') {
    act({ type: 'leave' });
    return;
  }
  if (state.mapId === 'world' && state.worldX === 32 && state.worldY === 7) {
    act({ type: 'board', ride: 'snowcraft' });
    return;
  }
  session.notice = ask ? `Ask ${KEYWORD_LABEL[ask]} of someone beside you.` : 'Nobody is close enough to hear you.';
  draw();
}

function optionsBlock(): string {
  const settings = settingsOf();
  return `<section class="panel">
    <h2>Options</h2>
    <label class="row"><input data-set="mute" type="checkbox" ${settings.mute ? 'checked' : ''}/> Mute</label>
    <label class="row">Volume <input data-set="volume" type="range" min="0" max="1" step="0.05" value="${settings.volume}"/></label>
    <label class="row"><input data-set="gameModeLock" type="checkbox" ${settings.gameModeLock ? 'checked' : ''}/> Fullscreen game-mode lock</label>
    <label class="row"><input data-set="reducedEffects" type="checkbox" ${settings.reducedEffects ? 'checked' : ''}/> Reduced effects</label>
    <button type="button" data-act="close">Back</button>
  </section>`;
}

function battleBlock(): string {
  const state = session.state!;
  const battle = state.battle!;
  const ready = state.party.filter((c) => !c.dead && !c.statuses.some((s) => ['stone', 'sleep', 'stun', 'death'].includes(s.id)));
  const actor = ready.find((c) => !battle.commands[c.id]) ?? ready[0];
  if (!actor) return `<p>${esc(battle.log.at(-1) ?? '')}</p>`;
  const foes = battle.foes.filter((f) => !f.dead);
  const spells = actor.spells
    .map((id) => `<button type="button" data-act="cast" data-spell="${id}" data-who="${actor.id}">${esc(id)} ${skillRank(actor, id)}${id === 'cure' ? ` (${cureAilments(skillRank(actor, id)).join(', ') || 'HP'})` : ''}</button>`)
    .join('');
  const items = Object.keys(state.items)
    .filter((id) => (GEAR_BY_ID[id]?.kind === 'consumable'))
    .map((id) => `<button type="button" data-act="use" data-item="${id}" data-who="${actor.id}">${esc(GEAR_BY_ID[id]?.name ?? id)} ×${state.items[id]}</button>`)
    .join('');
  const targets = foes
    .map((f) => `<button type="button" data-act="target" data-id="${f.id}" data-who="${actor.id}">${esc(f.name)} ${f.row}</button>`)
    .concat(state.party.map((c) => `<button type="button" data-act="target-ally" data-id="${c.id}" data-who="${actor.id}">${esc(c.name)} ${c.hp}</button>`))
    .join('');
  return `<section class="battle-commands">
    <p class="who">${esc(actor.name)} — choose</p>
    <div class="grid">
      <button type="button" data-act="attack-mode" data-who="${actor.id}">Attack</button>
      <button type="button" data-act="magic-mode" data-who="${actor.id}">Magic</button>
      <button type="button" data-act="item-mode" data-who="${actor.id}">Item</button>
      <button type="button" data-act="flee" data-who="${actor.id}">Flee</button>
    </div>
    <div class="sub" id="battle-sub"></div>
    <p class="hint">Foes and allies appear once you choose Attack, Magic, or Item.</p>
  </section>
  <template id="spells">${spells}</template>
  <template id="items">${items}</template>
  <template id="targets">${targets}</template>`;
}

function fieldBlock(): string {
  const state = session.state!;
  const power = rateEncounter(state, 'sergeant');
  const rating = state.phase === 'altair-wake' || state.phase === 'to-fynn' ? (power === 'ready' ? 'Ready for the mines' : 'Not yet ready for the mines') : '';
  return `<p class="objective">${esc(state.objective)}</p>
    <p class="notice">${esc(session.notice)}</p>
    ${rating ? `<p class="rating">${rating}</p>` : ''}
    <div class="pad" aria-label="Movement">
      <button type="button" data-act="step" data-dx="0" data-dy="-1" aria-label="North">▲</button>
      <button type="button" data-act="step" data-dx="-1" data-dy="0" aria-label="West">◀</button>
      <button type="button" data-act="confirm">Talk</button>
      <button type="button" data-act="step" data-dx="1" data-dy="0" aria-label="East">▶</button>
      <button type="button" data-act="step" data-dx="0" data-dy="1" aria-label="South">▼</button>
    </div>
    <div class="grid">
      ${state.phase === 'intro' ? '<button type="button" data-act="fight">Fight</button>' : ''}
      <button type="button" data-act="menu">Menu</button>
      <button type="button" data-act="shop">Shop</button>
      <button type="button" data-act="ask">Ask</button>
      ${canSaveHere(state) ? '<button type="button" data-act="save">Save</button>' : ''}
      <button type="button" data-act="options">Options</button>
    </div>
    ${ask ? `<p class="hint">Asking about ${esc(KEYWORD_LABEL[ask])}. Talk to someone.</p>` : ''}`;
}

function menuBlock(): string {
  const state = session.state!;
  const rows = state.party
    .map((c) => {
      const cure = c.spells.includes('cure') ? ` Cure ${skillRank(c, 'cure')}` : '';
      return `<li><strong>${esc(c.name)}</strong> ${c.hp}/${c.maxHp} HP · ${c.mp}/${c.maxMp} MP · ${c.row} · ATK ${attackPower(c)} DEF ${defensePower(c)}${cure}
        <button type="button" data-act="row" data-who="${c.id}" data-row="${c.row === 'front' ? 'back' : 'front'}">Swap row</button></li>`;
    })
    .join('');
  const words = state.keywords.map((id) => KEYWORD_LABEL[id]).join(', ') || 'None yet';
  return `<section class="panel"><h2>Party</h2><ul>${rows}</ul><p>Keywords: ${esc(words)}</p>
    <p>Gil ${state.gil}</p>
    <button type="button" data-act="close">Close</button></section>`;
}

function askBlock(): string {
  const state = session.state!;
  const buttons = state.keywords
    .map((id) => `<button type="button" data-act="keyword" data-word="${id}">${esc(KEYWORD_LABEL[id])}</button>`)
    .join('');
  return `<section class="panel"><h2>Ask</h2><p>Only words you have learned.</p><div class="grid">${buttons || '<p>You have learned no words yet.</p>'}</div><button type="button" data-act="close">Close</button></section>`;
}

export function draw(): void {
  const hud = document.getElementById('hud');
  if (!hud) return;
  if (session.screen === 'title' || !session.state) {
    panel = 'none';
    hud.innerHTML = `<div class="title-actions">
      <h1>Oath of the Rose</h1>
      <button type="button" data-act="new">New Game</button>
      <button type="button" data-act="continue">Continue</button>
      <button type="button" data-act="options">Options</button>
      <p class="credits">2026-09-26 · Grok · Not affiliated with Square Enix.</p>
      <p class="notice">${esc(session.notice)}</p>
      ${document.body.dataset.options === '1' ? optionsBlock() : ''}
    </div>`;
    return;
  }
  const state = session.state;
  if (state.mode === 'gameover') {
    hud.innerHTML = `<section class="panel"><h2>The party has fallen</h2><p>The rebellion keeps your last save.</p>
      <button type="button" data-act="continue">Continue</button>
      <button type="button" data-act="title">Title</button></section>`;
    return;
  }
  if (state.mode === 'ending') {
    hud.innerHTML = `<section class="panel"><h2>Oath kept</h2><p>${esc(state.endingText)}</p>
      <p class="credits">2026-09-26 · Grok</p>
      <button type="button" data-act="title">Title</button></section>`;
    return;
  }
  if (state.mode === 'battle') {
    hud.innerHTML = battleBlock();
    wireBattleSub();
    return;
  }
  if (panel === 'options') hud.innerHTML = optionsBlock();
  else if (panel === 'menu') hud.innerHTML = menuBlock();
  else if (panel === 'ask') hud.innerHTML = askBlock();
  else if (panel === 'shop') hud.innerHTML = shopBlockHtml(state);
  else hud.innerHTML = fieldBlock();
}

function shopBlockHtml(state: NonNullable<typeof session.state>): string {
  const shops = SHOPS.filter((shop) => shop.town === state.mapId);
  if (!shops.length) return `<section class="panel"><p>No counter here. Town shops are marked by the shopkeeper.</p><button type="button" data-act="close">Close</button></section>`;
  if (!shops.some((shop) => shop.id === shopId)) shopId = shops[0].id;
  return `<section class="panel"><h2>Shop · ${state.gil} gil</h2><p>Open a counter, then buy. Talk is not required.</p>
    <div class="grid">${shops.map((shop) => `<button type="button" data-act="counter" data-shop="${shop.id}">${esc(shop.kind)}</button>`).join('')}</div>
    <div class="grid" id="stock"></div>
    <button type="button" data-act="close">Close</button></section>`;
}

function fillStock(): void {
  const state = session.state;
  const stock = document.getElementById('stock');
  if (!state || !stock) return;
  void import('../engine').then(({ shopGoods }) => {
    stock.innerHTML = shopGoods(state, shopId)
      .map((item) => `<button type="button" data-act="buy" data-shop="${shopId}" data-item="${item.id}">Buy ${esc(item.name)} · ${item.price}</button>`)
      .join('');
  });
}

function wireBattleSub(): void {
  /* subpanels are filled on click */
}

let battleMode: 'none' | 'attack' | 'magic' | 'item' = 'none';

function showSub(html: string): void {
  const sub = document.getElementById('battle-sub');
  if (sub) sub.innerHTML = html;
}

export function mountHud(): void {
  const hud = document.getElementById('hud');
  if (!hud) return;
  hud.addEventListener('click', (event) => {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;
    const kind = button.dataset.act;
    if (kind === 'new') {
      document.body.dataset.options = '0';
      newGame();
      return;
    }
    if (kind === 'continue') {
      continueGame();
      return;
    }
    if (kind === 'title') {
      title();
      return;
    }
    if (kind === 'options') {
      if (session.screen === 'title') {
        document.body.dataset.options = document.body.dataset.options === '1' ? '0' : '1';
        draw();
      } else panel = 'options';
      draw();
      return;
    }
    if (kind === 'close') {
      panel = 'none';
      document.body.dataset.options = '0';
      battleMode = 'none';
      draw();
      return;
    }
    if (kind === 'menu') {
      panel = 'menu';
      draw();
      return;
    }
    if (kind === 'ask') {
      panel = 'ask';
      draw();
      return;
    }
    if (kind === 'shop') {
      panel = 'shop';
      draw();
      fillStock();
      return;
    }
    if (kind === 'counter') {
      shopId = button.dataset.shop ?? shopId;
      fillStock();
      return;
    }
    if (kind === 'buy' && button.dataset.shop && button.dataset.item) {
      act({ type: 'buy', shopId: button.dataset.shop, itemId: button.dataset.item });
      return;
    }
    if (kind === 'save') {
      act({ type: 'save', store: window.localStorage });
      return;
    }
    if (kind === 'fight' || kind === 'confirm') {
      confirm();
      return;
    }
    if (kind === 'step') {
      act({ type: 'step', dx: Number(button.dataset.dx), dy: Number(button.dataset.dy) });
      return;
    }
    if (kind === 'row' && button.dataset.who && button.dataset.row) {
      act({ type: 'row', characterId: button.dataset.who, row: button.dataset.row as 'front' | 'back' });
      return;
    }
    if (kind === 'keyword' && button.dataset.word) {
      ask = button.dataset.word as KeywordId;
      panel = 'none';
      session.notice = `You will ask about ${KEYWORD_LABEL[ask]}.`;
      draw();
      return;
    }
    if (kind === 'flee' && button.dataset.who) {
      act({ type: 'command', actorId: button.dataset.who, command: { kind: 'flee' } });
      maybeResolve();
      return;
    }
    if (kind === 'attack-mode') {
      actorId = button.dataset.who ?? actorId;
      battleMode = 'attack';
      showSub(document.getElementById('targets')?.innerHTML ?? '');
      return;
    }
    if (kind === 'magic-mode') {
      actorId = button.dataset.who ?? actorId;
      battleMode = 'magic';
      showSub(document.getElementById('spells')?.innerHTML ?? '');
      return;
    }
    if (kind === 'item-mode') {
      actorId = button.dataset.who ?? actorId;
      battleMode = 'item';
      showSub(document.getElementById('items')?.innerHTML ?? '');
      return;
    }
    if (kind === 'cast' && button.dataset.spell && button.dataset.who) {
      actorId = button.dataset.who;
      battleMode = 'magic';
      (button as HTMLButtonElement).dataset.picked = button.dataset.spell;
      showSub(document.getElementById('targets')?.innerHTML ?? '');
      hud.dataset.spell = button.dataset.spell;
      return;
    }
    if (kind === 'use' && button.dataset.item && button.dataset.who) {
      actorId = button.dataset.who;
      battleMode = 'item';
      hud.dataset.item = button.dataset.item;
      showSub(document.getElementById('targets')?.innerHTML ?? '');
      return;
    }
    if ((kind === 'target' || kind === 'target-ally') && button.dataset.id && button.dataset.who) {
      const who = button.dataset.who;
      const targetId = button.dataset.id;
      if (battleMode === 'attack' || (!hud.dataset.spell && !hud.dataset.item && battleMode !== 'magic' && battleMode !== 'item')) {
        act({ type: 'command', actorId: who, command: { kind: 'attack', targetId } });
      } else if (hud.dataset.spell) {
        act({ type: 'command', actorId: who, command: { kind: 'spell', spellId: hud.dataset.spell, targetId } });
        delete hud.dataset.spell;
      } else if (hud.dataset.item) {
        act({ type: 'command', actorId: who, command: { kind: 'item', itemId: hud.dataset.item, targetId } });
        delete hud.dataset.item;
      }
      battleMode = 'none';
      maybeResolve();
    }
  });
  hud.addEventListener('change', (event) => {
    const input = event.target as HTMLInputElement;
    if (!input.dataset.set) return;
    if (input.dataset.set === 'volume') patchSettings({ volume: Number(input.value) });
    if (input.dataset.set === 'mute') patchSettings({ mute: input.checked });
    if (input.dataset.set === 'gameModeLock') patchSettings({ gameModeLock: input.checked });
    if (input.dataset.set === 'reducedEffects') patchSettings({ reducedEffects: input.checked });
  });
  window.addEventListener('oath-confirm', () => confirm());
  window.addEventListener('oath-menu', () => {
    panel = panel === 'menu' ? 'none' : 'menu';
    draw();
  });
  window.addEventListener('oath-cancel', () => {
    panel = 'none';
    battleMode = 'none';
    draw();
  });
  subscribe(draw);
  draw();
}

function maybeResolve(): void {
  const state = session.state;
  const battle = state?.battle;
  if (!state || !battle) return;
  const waiting = state.party.filter((c) => !c.dead && !c.statuses.some((s) => ['stone', 'sleep', 'stun'].includes(s.id)) && !battle.commands[c.id]);
  if (waiting.length === 0) act({ type: 'resolve-round' });
}

export function shopButton(): void {
  panel = 'shop';
  draw();
  fillStock();
}
