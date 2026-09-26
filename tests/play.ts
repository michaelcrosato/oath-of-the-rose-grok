import type { KeywordId } from '../src/data/content';
import { MAPS, dispatch, visibleNpcs, type Action, type GameState } from '../src/engine';
import { gear } from '../src/engine/model';

export function must(state: GameState, action: Action) {
  const result = dispatch(state, action);
  if (!result.ok) {
    throw new Error(
      `${action.type} failed (${result.error}): ${result.messages.join(' ')} | phase=${state.phase} map=${state.mapId} @${state.x},${state.y} log=${state.log.slice(-5).join(' / ')}`,
    );
  }
  return result;
}

export function goNpc(state: GameState, npcId: string) {
  const npc = visibleNpcs(state).find((entry) => entry.id === npcId);
  if (!npc) throw new Error(`missing npc ${npcId} phase ${state.phase} map ${state.mapId}`);
  if (state.mapId !== npc.mapId) throw new Error(`npc ${npcId} is on ${npc.mapId}, player on ${state.mapId}`);
  must(state, { type: 'move-to', x: npc.x, y: npc.y });
  return npc;
}

export function speak(state: GameState, npcId: string, keyword?: KeywordId) {
  goNpc(state, npcId);
  return must(state, keyword ? { type: 'talk', npcId, keyword } : { type: 'talk', npcId });
}

export function descend(state: GameState) {
  const map = MAPS[state.mapId];
  const stair = map.stairs.find((entry) => entry.x === map.end.x && entry.y === map.end.y);
  if (!stair) throw new Error(`no down stair on ${state.mapId}`);
  must(state, { type: 'move-to', x: stair.x, y: stair.y });
  must(state, { type: 'stairs' });
}

export function fight(state: GameState, encounterId?: string) {
  if (encounterId) must(state, { type: 'start-battle', encounterId });
  if (!state.battle) throw new Error('fight without a battle');
  let guard = 0;
  while (state.battle && !state.battle.outcome && guard++ < 60) {
    for (const member of state.party) {
      if (member.dead || member.statuses.some((s) => s.id === 'stone' || s.id === 'sleep' || s.id === 'stun')) continue;
      const command = choose(state, member.id);
      const result = dispatch(state, { type: 'command', actorId: member.id, command });
      if (!result.ok) throw new Error(`command ${member.name} ${result.error} ${JSON.stringify(command)} log ${state.battle?.log.slice(-3).join(' / ')}`);
    }
    const resolved = dispatch(state, { type: 'resolve-round' });
    if (!resolved.ok) throw new Error(`resolve ${resolved.error} ${resolved.messages.join(' ')}`);
  }
  if (state.mode === 'gameover') {
    throw new Error(`wiped on ${encounterId ?? 'battle'}: ${state.log.slice(-8).join(' | ')}`);
  }
}

function choose(state: GameState, actorId: string) {
  const battle = state.battle!;
  const member = state.party.find((c) => c.id === actorId)!;
  const foes = battle.foes.filter((f) => !f.dead);
  const front = foes.filter((f) => f.row === 'front');
  const back = foes.filter((f) => f.row === 'back');
  const skill = gear(member.equip.main)?.skill ?? 'unarmed';
  const cleansers: [string, string][] = [
    ['toad', 'maidens-kiss'],
    ['stone', 'gold-needle'],
    ['mini', 'mallet'],
    ['silence', 'echo-screen'],
    ['poison', 'antidote'],
    ['sleep', 'alarm-clock'],
    ['blind', 'eye-drops'],
  ];
  const medic = state.party.find((c) => c.id === actorId && !c.dead && !c.statuses.some((s) => ['toad', 'stone', 'sleep', 'stun'].includes(s.id)));
  if (medic) {
    for (const ally of state.party) {
      for (const [status, itemId] of cleansers) {
        if (ally.statuses.some((s) => s.id === status) && (state.items[itemId] ?? 0) > 0) {
          return { kind: 'item' as const, itemId, targetId: ally.id };
        }
      }
    }
  }
  const silenced = member.statuses.some((s) => s.id === 'silence' || s.id === 'toad');
  const hurt = state.party.filter((c) => !c.dead && c.hp < c.maxHp * 0.55).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp);
  if ((state.items.potion ?? 0) > 0 && member.hp < member.maxHp * 0.4) {
    return { kind: 'item' as const, itemId: 'potion', targetId: member.id };
  }
  if (!silenced && member.spells.includes('cure') && member.mp >= 4 && hurt[0] && (hurt[0].id === member.id || member.spells.includes('cure'))) {
    if (hurt[0].hp < hurt[0].maxHp * 0.5) return { kind: 'spell' as const, spellId: 'cure', targetId: hurt[0].id };
  }
  let target = front[0] ?? foes[0];
  if (member.row === 'back' && skill !== 'bow') {
    if (back[0]) target = back[0];
    else {
      const nuke = ['ultima', 'flare', 'holy', 'fire', 'bolt', 'ice', 'aero'].find((id) => member.spells.includes(id) && member.mp >= 8);
      if (!silenced && nuke && foes[0]) return { kind: 'spell' as const, spellId: nuke, targetId: foes[0].id };
      if (!silenced && member.spells.includes('cure') && member.mp >= 4) return { kind: 'spell' as const, spellId: 'cure', targetId: member.id };
      if ((state.items.potion ?? 0) > 0) return { kind: 'item' as const, itemId: 'potion', targetId: member.id };
    }
  }
  if (!target) throw new Error('no target');
  return { kind: 'attack' as const, targetId: target.id };
}

export function reachBoss(state: GameState, encounterId: string) {
  const map = MAPS[state.mapId];
  if (!map.boss || map.boss.encounterId !== encounterId) {
    throw new Error(`boss ${encounterId} not on ${state.mapId} (has ${map.boss?.encounterId})`);
  }
  must(state, { type: 'move-to', x: map.boss.x, y: map.boss.y });
}
