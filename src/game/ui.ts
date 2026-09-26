import { GEAR_BY_ID, KEYWORD_LABEL, SHOPS, type KeywordId } from '../data/content';
import { INNS, SANCTUARIES } from '../data/content';
import { attackPower, canSaveHere, cureAilments, defensePower, rateEncounter, skillRank } from '../engine';
import { loadSettings, SETTINGS_KEY } from '../engine/save';
import { audio } from './audio';
import {
  boardAction,
  confirmAction,
  confirmLabel,
  enterAction,
  equipAction,
  equipChoices,
  fieldUseAction,
  fieldUseChoices,
  journeyAction,
  journeyChoices,
  locationAt,
  restAction,
  reviveAction,
  reviveTargets,
  rideChoices,
  sailAction,
  sellAction,
  sellChoices,
  type EquipSlot,
} from './field-actions';
import { applySettings, browserEnv } from './runtime';
import { act, continueGame, newGame, session, subscribe, title } from './session';

type Panel = 'none' | 'menu' | 'ask' | 'options' | 'shop' | 'party' | 'travel' | 'ride' | 'revive' | 'equip' | 'use';

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

function confirm(): void {
  const state = session.state;
  if (!state || state.mode !== 'field') return;
  const action = confirmAction(state, ask);
  if (!action) {
    session.notice = ask ? `Ask ${KEYWORD_LABEL[ask]} of someone beside you.` : 'Nobody is close enough to hear you.';
    draw();
    return;
  }
  ask = null;
  act(action);
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
  const place = locationAt(state);
  const label = confirmLabel(state, ask);
  const sail = state.phase !== 'intro' && rideChoices(state).some((action) => action.type === 'sail');
  const inn = INNS[state.mapId];
  const sanctuary = SANCTUARIES.includes(state.mapId);
  return `<p class="objective">${esc(state.objective)}</p>
    <p class="notice">${esc(session.notice)}</p>
    ${place ? `<p class="hint">At ${esc(place.name)}. Enter goes inside.</p>` : ''}
    ${rating ? `<p class="rating">${rating}</p>` : ''}
    <div class="pad" aria-label="Movement">
      <button type="button" data-act="step" data-dx="0" data-dy="-1" aria-label="North">▲</button>
      <button type="button" data-act="step" data-dx="-1" data-dy="0" aria-label="West">◀</button>
      <button type="button" data-act="confirm">${esc(label)}</button>
      <button type="button" data-act="step" data-dx="1" data-dy="0" aria-label="East">▶</button>
      <button type="button" data-act="step" data-dx="0" data-dy="1" aria-label="South">▼</button>
    </div>
    <div class="grid">
      ${state.phase === 'intro' ? '<button type="button" data-act="fight">Fight</button>' : ''}
      ${place ? `<button type="button" data-act="enter" data-location="${esc(place.id)}">Enter ${esc(place.name)}</button>` : ''}
      ${state.phase !== 'intro' ? '<button type="button" data-act="travel">Travel</button>' : ''}
      ${state.phase !== 'intro' ? '<button type="button" data-act="ride">Ride</button>' : ''}
      ${sail ? '<button type="button" data-act="sail">Sail</button>' : ''}
      ${inn ? `<button type="button" data-act="rest">Rest · ${inn.price} gil</button>` : ''}
      ${sanctuary ? '<button type="button" data-act="revive-open">Revive</button>' : ''}
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
    <div class="grid">
      <button type="button" data-act="equip-open">Equip</button>
      <button type="button" data-act="use-open">Use</button>
    </div>
    <button type="button" data-act="close">Close</button></section>`;
}

function travelBlock(): string {
  const state = session.state!;
  const buttons = journeyChoices(state)
    .map((place) => `<button type="button" data-act="journey" data-location="${esc(place.locationId)}">${esc(place.name)}</button>`)
    .join('');
  return `<section class="panel"><h2>Travel</h2><p>The road you can walk, sail, or fly from here.</p><div class="grid">${buttons || '<p>No road is open from here.</p>'}</div><button type="button" data-act="close">Close</button></section>`;
}

function rideBlock(): string {
  const state = session.state!;
  const buttons = rideChoices(state)
    .map((action) => {
      if (action.type === 'sail') return `<button type="button" data-act="sail">Sail with Leila</button>`;
      if (action.type === 'board') return `<button type="button" data-act="board" data-ride="${action.ride}">Board ${esc(action.ride)}</button>`;
      if (action.type === 'mount-chocobo') return `<button type="button" data-act="mount">Mount chocobo</button>`;
      if (action.type === 'dismount-chocobo') return `<button type="button" data-act="dismount">Dismount</button>`;
      return '';
    })
    .join('');
  return `<section class="panel"><h2>Ride</h2><div class="grid">${buttons || '<p>You are on foot. Vehicles appear here when you have them.</p>'}</div><button type="button" data-act="close">Close</button></section>`;
}

function reviveBlock(): string {
  const state = session.state!;
  const buttons = reviveTargets(state)
    .map((id) => {
      const member = state.party.find((entry) => entry.id === id);
      return `<button type="button" data-act="revive" data-who="${esc(id)}">Raise ${esc(member?.name ?? id)} · 200 gil</button>`;
    })
    .join('');
  return `<section class="panel"><h2>Sanctuary</h2><div class="grid">${buttons || '<p>No one here can be called back.</p>'}</div><button type="button" data-act="close">Close</button></section>`;
}

const SLOTS: EquipSlot[] = ['main', 'off', 'head', 'body', 'hands', 'accessory'];

function equipBlock(): string {
  const state = session.state!;
  const rows = state.party
    .map((member) => {
      const lines = SLOTS.map((slot) => {
        const worn = member.equip[slot];
        const wornName = worn ? (GEAR_BY_ID[worn]?.name ?? worn) : 'empty';
        const choices = equipChoices(state, member.id, slot)
          .map((item) => `<button type="button" data-act="equip" data-who="${member.id}" data-slot="${slot}" data-item="${item.itemId}">${esc(member.name)} · ${slot} · ${esc(item.name)}</button>`)
          .join('');
        const clear = worn ? `<button type="button" data-act="equip" data-who="${member.id}" data-slot="${slot}" data-item="">Clear ${esc(member.name)} ${slot}</button>` : '';
        return `<p>${esc(member.name)} ${slot}: ${esc(wornName)}</p><div class="grid">${choices}${clear}</div>`;
      }).join('');
      return lines;
    })
    .join('');
  return `<section class="panel"><h2>Equip</h2>${rows}<button type="button" data-act="close">Close</button></section>`;
}

function useBlock(): string {
  const state = session.state!;
  const items = fieldUseChoices(state);
  const buttons = items
    .flatMap((item) =>
      state.party.map(
        (member) =>
          `<button type="button" data-act="field-use" data-item="${item.itemId}" data-who="${member.id}">${esc(item.name)} ×${item.count} on ${esc(member.name)}</button>`,
      ),
    )
    .join('');
  return `<section class="panel"><h2>Use</h2><p>Tomes, medicine, Sunfire, and the Ultima Tome.</p><div class="grid">${buttons || '<p>Nothing in the pack works in the field.</p>'}</div><button type="button" data-act="close">Close</button></section>`;
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
  else if (panel === 'shop') {
    hud.innerHTML = shopBlockHtml(state);
    fillStock();
  } else if (panel === 'travel') hud.innerHTML = travelBlock();
  else if (panel === 'ride') hud.innerHTML = rideBlock();
  else if (panel === 'revive') hud.innerHTML = reviveBlock();
  else if (panel === 'equip') hud.innerHTML = equipBlock();
  else if (panel === 'use') hud.innerHTML = useBlock();
  else hud.innerHTML = fieldBlock();
}

function shopBlockHtml(state: NonNullable<typeof session.state>): string {
  const shops = SHOPS.filter((shop) => shop.town === state.mapId);
  if (!shops.length) return `<section class="panel"><p>No counter here. Town shops are marked by the shopkeeper.</p><button type="button" data-act="close">Close</button></section>`;
  if (!shops.some((shop) => shop.id === shopId)) shopId = shops[0].id;
  const selling = sellChoices(state, shopId)
    .map((item) => `<button type="button" data-act="sell" data-shop="${shopId}" data-item="${item.itemId}">Sell ${esc(item.name)} · ${item.price}</button>`)
    .join('');
  return `<section class="panel"><h2>Shop · ${state.gil} gil</h2><p>Open a counter, then buy or sell. Talk is not required.</p>
    <div class="grid">${shops.map((shop) => `<button type="button" data-act="counter" data-shop="${shop.id}">${esc(shop.kind)}</button>`).join('')}</div>
    <div class="grid" id="stock"></div>
    <h3>Sell</h3>
    <div class="grid">${selling || '<p>Nothing you carry can be sold here.</p>'}</div>
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
    if (kind === 'sell' && button.dataset.shop && button.dataset.item) {
      act(sellAction(button.dataset.shop, button.dataset.item));
      return;
    }
    if (kind === 'travel') {
      panel = 'travel';
      draw();
      return;
    }
    if (kind === 'ride') {
      panel = 'ride';
      draw();
      return;
    }
    if (kind === 'journey' && button.dataset.location) {
      panel = 'none';
      act(journeyAction(button.dataset.location));
      return;
    }
    if (kind === 'enter' && button.dataset.location) {
      panel = 'none';
      act(enterAction(button.dataset.location));
      return;
    }
    if (kind === 'board' && button.dataset.ride) {
      panel = 'none';
      act(boardAction(button.dataset.ride));
      return;
    }
    if (kind === 'sail') {
      panel = 'none';
      act(sailAction());
      return;
    }
    if (kind === 'mount') {
      panel = 'none';
      act({ type: 'mount-chocobo' });
      return;
    }
    if (kind === 'dismount') {
      panel = 'none';
      act({ type: 'dismount-chocobo' });
      return;
    }
    if (kind === 'rest') {
      const action = session.state ? restAction(session.state) : null;
      if (action) act(action);
      return;
    }
    if (kind === 'revive-open') {
      panel = 'revive';
      draw();
      return;
    }
    if (kind === 'revive' && button.dataset.who && session.state) {
      act(reviveAction(session.state.mapId, button.dataset.who));
      return;
    }
    if (kind === 'equip-open') {
      panel = 'equip';
      draw();
      return;
    }
    if (kind === 'use-open') {
      panel = 'use';
      draw();
      return;
    }
    if (kind === 'equip' && button.dataset.who && button.dataset.slot) {
      const itemId = button.dataset.item ? button.dataset.item : null;
      act(equipAction(button.dataset.who, button.dataset.slot as EquipSlot, itemId));
      return;
    }
    if (kind === 'field-use' && button.dataset.item) {
      act(fieldUseAction(button.dataset.item, button.dataset.who));
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
