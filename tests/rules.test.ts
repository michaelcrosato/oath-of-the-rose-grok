import { describe, expect, it } from 'vitest';
import { ENCOUNTER_BY_ID, ENEMY_BY_ID } from '../src/data/content';
import {
  attackPower,
  createNewGame,
  defensePower,
  dispatch,
  rateEncounter,
  skillRank,
  type GameState,
} from '../src/engine';
import { must } from './play';

function wake(): GameState {
  const state = createNewGame(7);
  must(state, { type: 'start-battle', encounterId: 'opening' });
  for (const member of state.party) {
    if (!member.dead) must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: 'e0' } });
  }
  must(state, { type: 'resolve-round' });
  return state;
}

function study(state: GameState, chestId: string, y: number, tome: string) {
  must(state, { type: 'move-to', x: 13, y });
  must(state, { type: 'open-chest', chestId });
  must(state, { type: 'use-item', itemId: tome, targetId: 'maria' });
}

function round(state: GameState, commands: { id: string; command: Parameters<typeof dispatch>[1] extends { command: infer C } ? C : never }[]) {
  for (const entry of commands) {
    must(state, { type: 'command', actorId: entry.id, command: entry.command as never });
  }
  return must(state, { type: 'resolve-round' });
}

describe('use-based growth and battle rules', () => {
  it('opens with a loss that rescues the party in Altair', () => {
    const state = wake();
    expect(state.flags.rescued).toBe(true);
    expect(state.flags.leonMissing).toBe(true);
    expect(state.mapId).toBe('altair');
    expect(state.mode).toBe('field');
    expect(state.party.some((c) => c.id === 'leon')).toBe(false);
    expect(state.party.every((c) => c.hp > 0)).toBe(true);
  });

  it('raises the used weapon skill, leaves another skill unchanged, and caps at 16', () => {
    const state = wake();
    expect(state.mapId).toBe('altair');
    const firion = () => state.party.find((c) => c.id === 'firion')!;
    const swordBefore = skillRank(firion(), 'sword');
    const unarmedBefore = skillRank(firion(), 'unarmed');
    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    for (let round = 0; round < 2; round++) {
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'attack', targetId: 'e0' } });
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
      must(state, { type: 'resolve-round' });
    }
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });
    expect(state.battle).toBeNull();
    expect(skillRank(firion(), 'sword')).toBeGreaterThan(swordBefore);
    expect(skillRank(firion(), 'unarmed')).toBe(unarmedBefore);

    const maria = () => state.party.find((c) => c.id === 'maria')!;
    const beforeCure = skillRank(maria(), 'cure');
    let safety = 0;
    while (skillRank(maria(), 'cure') < 16 && safety++ < 30) {
      must(state, { type: 'rest', innId: 'altair' });
      must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
      for (let round = 0; round < 8 && state.battle; round++) {
        const cureCost = 3 + Math.max(0, skillRank(maria(), 'cure') - 1);
        if (maria().mp < cureCost) break;
        must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'maria' } });
        must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
        must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
        must(state, { type: 'resolve-round' });
      }
      if (state.battle) {
        for (const member of state.party.filter((c) => !c.dead)) {
          must(state, { type: 'command', actorId: member.id, command: { kind: 'flee' } });
        }
        must(state, { type: 'resolve-round' });
      }
    }
    expect(skillRank(maria(), 'cure')).toBe(16);
    expect(skillRank(maria(), 'cure')).toBeGreaterThan(beforeCure);
    const other = skillRank(maria(), 'fire');
    must(state, { type: 'rest', innId: 'altair' });
    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'maria' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });
    expect(skillRank(maria(), 'cure')).toBe(16);
    expect(skillRank(maria(), 'fire')).toBe(other);
  });

  it('grows hp from heavy damage, mp and magic from spending mp, and the matching mental stats', () => {
    const state = wake();
    const maria = () => state.party.find((c) => c.id === 'maria')!;
    const firion = () => state.party.find((c) => c.id === 'firion')!;
    const hpBefore = firion().maxHp;
    const intBefore = maria().int;
    const mpBefore = maria().maxMp;
    const magBefore = maria().mag;
    const spiBefore = maria().spi;
    must(state, { type: 'leave' });
    must(state, { type: 'start-battle', encounterId: 'drill-imp' });
    for (let i = 0; i < 6 && state.battle; i++) {
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'maria' } });
      must(state, { type: 'resolve-round' });
    }
    expect(firion().maxHp).toBeGreaterThan(hpBefore);
    expect(maria().maxMp).toBeGreaterThan(mpBefore);
    expect(maria().mag).toBeGreaterThan(magBefore);
    expect(maria().spi).toBeGreaterThanOrEqual(spiBefore);
    expect(maria().int).toBe(intBefore);
    const guy = state.party.find((c) => c.id === 'guy')!;
    expect(guy.str).toBeGreaterThanOrEqual(16);
  });

  it('does not lower base stats across fighting, fleeing, or gear changes', () => {
    const state = wake();
    const snap = () =>
      state.party.map((c) => ({
        id: c.id,
        maxHp: c.maxHp,
        maxMp: c.maxMp,
        str: c.str,
        sta: c.sta,
        agi: c.agi,
        int: c.int,
        spi: c.spi,
        acc: c.acc,
        eva: c.eva,
        mag: c.mag,
      }));
    const before = snap();
    must(state, { type: 'leave' });
    must(state, { type: 'start-battle', encounterId: 'hornet' });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'fire', targetId: 'e1' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'item', itemId: 'potion', targetId: 'guy' } });
    must(state, { type: 'resolve-round' });
    if (state.battle) {
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
      must(state, { type: 'resolve-round' });
    }
    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: null });
    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: 'buckler' });
    const after = snap();
    for (const row of after) {
      const prev = before.find((entry) => entry.id === row.id)!;
      for (const key of Object.keys(row) as (keyof typeof row)[]) {
        if (key === 'id') continue;
        expect(row[key]).toBeGreaterThanOrEqual(prev[key]);
      }
    }
  });

  it('lets a higher Cure rank remove an ailment a lower rank cannot, and items cure the rest', () => {
    const state = wake();
    study(state, 'altair-poison', 2, 'tome-poison');
    study(state, 'altair-sleep', 3, 'tome-sleep');
    study(state, 'altair-silence', 4, 'tome-silence');
    study(state, 'altair-mini', 5, 'tome-mini');
    study(state, 'altair-toad', 6, 'tome-toad');
    study(state, 'altair-break', 7, 'tome-break');
    study(state, 'altair-death', 8, 'tome-death');
    const maria = () => state.party.find((c) => c.id === 'maria')!;
    const firion = () => state.party.find((c) => c.id === 'firion')!;
    expect(skillRank(maria(), 'cure')).toBe(1);

    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'poison', targetId: 'firion' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'firion' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    expect(skillRank(maria(), 'cure')).toBe(1);
    expect(firion().statuses.some((s) => s.id === 'poison')).toBe(true);
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });

    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'firion' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });
    expect(skillRank(maria(), 'cure')).toBeGreaterThanOrEqual(2);

    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'poison', targetId: 'firion' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId: 'cure', targetId: 'firion' } });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    expect(firion().statuses.some((s) => s.id === 'poison')).toBe(false);
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });

    const cases: [string, string, string][] = [
      ['sleep', 'alarm-clock', 'sleep'],
      ['silence', 'echo-screen', 'silence'],
      ['mini', 'mallet', 'mini'],
      ['toad', 'maidens-kiss', 'toad'],
      ['break', 'gold-needle', 'stone'],
      ['death', 'phoenix-down', 'death'],
    ];
    for (const [spellId, itemId, status] of cases) {
      must(state, { type: 'rest', innId: 'altair' });
      must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'spell', spellId, targetId: 'guy' } });
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'item', itemId, targetId: 'guy' } });
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
      const result = dispatch(state, { type: 'resolve-round' });
      expect(result.ok).toBe(true);
      const guy = state.party.find((c) => c.id === 'guy')!;
      if (status === 'death') expect(guy.dead).toBe(false);
      else expect(guy.statuses.some((s) => s.id === status)).toBe(false);
      if (state.battle) {
        must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
        must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
        if (!guy.dead) must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
        must(state, { type: 'resolve-round' });
      }
    }
  });

  it('enforces rows, bows, front collapse, agility, dual wield, and shield', () => {
    const state = wake();
    must(state, { type: 'row', characterId: 'firion', row: 'back' });
    must(state, { type: 'row', characterId: 'guy', row: 'front' });
    must(state, { type: 'leave' });
    must(state, { type: 'travel-tile', x: 13, y: 16 });
    must(state, { type: 'start-battle', encounterId: 'soldier-patrol' });
    const mariaHp = state.party.find((c) => c.id === 'maria')!.hp;
    const bow = dispatch(state, { type: 'command', actorId: 'maria', command: { kind: 'attack', targetId: 'e0' } });
    expect(bow.ok).toBe(true);
    const backMelee = dispatch(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    expect(backMelee.ok).toBe(false);
    expect(backMelee.error).toBe('row');
    const backRank = dispatch(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e2' } });
    expect(backRank.ok).toBe(true);
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    const maria = state.party.find((c) => c.id === 'maria')!;
    expect(maria.hp).toBe(mariaHp);
    if (state.battle) {
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
      must(state, { type: 'resolve-round' });
    }

    must(state, { type: 'journey', locationId: 'altair' });
    must(state, { type: 'enter', locationId: 'altair' });
    must(state, { type: 'row', characterId: 'firion', row: 'front' });
    must(state, { type: 'buy', shopId: 'altair-weapons', itemId: 'knife' });
    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: 'knife' });
    const shielded = defensePower(state.party.find((c) => c.id === 'guy')!);
    must(state, { type: 'start-battle', encounterId: 'practice-dummy' });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    const resolved = must(state, { type: 'resolve-round' });
    const hits = resolved.messages.filter((line) => line.startsWith('Firion hits')).length;
    expect(hits).toBe(2);
    expect(resolved.messages.join('\n')).toMatch(/Maria/);
    void shielded;

    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: 'buckler' });
    const withShield = defensePower(state.party.find((c) => c.id === 'firion')!);
    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: null });
    const bare = defensePower(state.party.find((c) => c.id === 'firion')!);
    expect(withShield).toBeGreaterThan(bare);
    must(state, { type: 'equip', characterId: 'firion', slot: 'off', itemId: 'buckler' });
    expect(attackPower(state.party.find((c) => c.id === 'firion')!)).toBeGreaterThan(0);
  });

  it('pays gil for a win, pays nothing for a flee, and wipes into a continue state', () => {
    const state = wake();
    must(state, { type: 'leave' });
    const gil = state.gil;
    must(state, { type: 'start-battle', encounterId: 'hornet' });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'flee' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'flee' } });
    must(state, { type: 'resolve-round' });
    expect(state.gil).toBe(gil);
    expect(state.mode).toBe('field');

    const hornet = ENCOUNTER_BY_ID.hornet;
    const expected = hornet.enemies.reduce((sum, slot) => sum + (ENEMY_BY_ID[slot.id]?.gil ?? 0), 0);
    const before = state.gil;
    must(state, { type: 'start-battle', encounterId: 'hornet' });
    must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'command', actorId: 'maria', command: { kind: 'attack', targetId: 'e1' } });
    must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: 'e0' } });
    must(state, { type: 'resolve-round' });
    if (state.battle) {
      must(state, { type: 'command', actorId: 'firion', command: { kind: 'attack', targetId: state.battle.foes.find((f) => !f.dead)?.id ?? 'e0' } });
      must(state, { type: 'command', actorId: 'maria', command: { kind: 'attack', targetId: state.battle.foes.find((f) => !f.dead)?.id ?? 'e0' } });
      must(state, { type: 'command', actorId: 'guy', command: { kind: 'attack', targetId: state.battle.foes.find((f) => !f.dead)?.id ?? 'e0' } });
      must(state, { type: 'resolve-round' });
    }
    expect(state.battle).toBeNull();
    expect(state.gil - before).toBe(expected);

    must(state, { type: 'travel-tile', x: 13, y: 16 });
    must(state, { type: 'row', characterId: 'maria', row: 'front' });
    must(state, { type: 'row', characterId: 'firion', row: 'front' });
    must(state, { type: 'row', characterId: 'guy', row: 'front' });
    must(state, { type: 'start-battle', encounterId: 'executioner' });
    for (const member of state.party.filter((c) => !c.dead)) {
      must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: 'e0' } });
    }
    const wiped = dispatch(state, { type: 'resolve-round' });
    expect(wiped.ok).toBe(true);
    expect(state.mode).toBe('gameover');
    expect(state.party.every((c) => c.dead || c.hp <= 0)).toBe(true);
  });

  it('trains a fresh party until the sergeant is rated ready', () => {
    const state = wake();
    expect(rateEncounter(state, 'sergeant')).toBe('not-ready');
    must(state, { type: 'leave' });
    for (let n = 0; n < 8; n++) {
      must(state, { type: 'start-battle', encounterId: n % 2 === 0 ? 'hornet' : 'drill-imp' });
      let rounds = 0;
      while (state.battle && rounds++ < 8) {
        const firion = state.party.find((c) => c.id === 'firion')!;
        const low = firion.hp < firion.maxHp * 0.35;
        for (const member of state.party) {
          if (member.dead) continue;
          if (low && n === 7) {
            must(state, { type: 'command', actorId: member.id, command: { kind: 'flee' } });
          } else if (member.id === 'maria' && member.mp >= 8) {
            must(state, { type: 'command', actorId: member.id, command: { kind: 'spell', spellId: 'cure', targetId: 'firion' } });
          } else if (member.id === 'maria' && member.mp >= 4) {
            const foe = state.battle.foes.find((f) => !f.dead)?.id ?? 'e0';
            must(state, { type: 'command', actorId: member.id, command: { kind: 'spell', spellId: 'fire', targetId: foe } });
          } else if ((state.items.potion ?? 0) > 0 && member.hp < member.maxHp * 0.3) {
            must(state, { type: 'command', actorId: member.id, command: { kind: 'item', itemId: 'potion', targetId: member.id } });
          } else {
            const target = state.battle.foes.find((f) => !f.dead)?.id ?? 'e0';
            must(state, { type: 'command', actorId: member.id, command: { kind: 'attack', targetId: target } });
          }
        }
        must(state, { type: 'resolve-round' });
        if (state.mode === 'gameover') break;
      }
      if (state.mode === 'gameover') break;
    }
    expect(state.mode).not.toBe('gameover');
    expect(rateEncounter(state, 'sergeant')).toBe('ready');
  });
});
