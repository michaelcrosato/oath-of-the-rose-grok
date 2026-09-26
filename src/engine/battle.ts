import { ENCOUNTER_BY_ID, ENEMY_BY_ID, SPELL_BY_ID, basunaAilments, cureAilmentsForRank, esunaAilments, type StatusId } from '../data/content';
import {
  type BattleCommand,
  type BattleState,
  type Buff,
  type Character,
  type Foe,
  type GameState,
  addItem,
  applyBattleGrowth,
  attackPower,
  clearStatus,
  countItem,
  defensePower,
  evasionOf,
  gear,
  hasStatus,
  inflict,
  itemCureList,
  magicDefense,
  note,
  rngNext,
  skillRank,
  spellCost,
  takeItem,
} from './model';

type Actor = Character | Foe;

function isParty(actor: Actor): actor is Character {
  return 'spells' in actor && 'equip' in actor && 'str' in actor;
}

function living<T extends { dead: boolean }>(list: T[]): T[] {
  return list.filter((a) => !a.dead);
}

export function pullRows(state: GameState, log: string[]): void {
  const up = state.party.filter((c) => !c.dead && !hasStatus(c, 'stone'));
  if (up.some((c) => c.row === 'front')) return;
  for (const c of up) {
    if (c.row === 'back') {
      c.row = 'front';
      log.push(`${c.name} is pulled into the front row.`);
    }
  }
}

function frontFoes(battle: BattleState): Foe[] {
  return living(battle.foes).filter((f) => f.row === 'front');
}

export function meleeCanReach(attackerRow: 'front' | 'back', targetRank: 'front' | 'back', weaponSkill: string, foes: Foe[]): boolean {
  if (weaponSkill === 'bow') return true;
  const anyFront = living(foes).some((f) => f.row === 'front');
  if (attackerRow === 'front') {
    if (targetRank === 'front') return true;
    return !anyFront;
  }
  return targetRank === 'back';
}

function recordUse(battle: BattleState, actorId: string, skill: string): void {
  const bag = (battle.skillUses[actorId] ??= {});
  bag[skill] = (bag[skill] ?? 0) + 1;
}

function agiOf(actor: Actor): number {
  let agi = actor.agi;
  const haste = actor.buffs.find((b) => b.id === 'haste');
  const slow = actor.buffs.find((b) => b.id === 'slow');
  if (haste) agi += haste.power;
  if (slow) agi -= slow.power;
  return Math.max(1, agi);
}

function canAct(actor: Actor): boolean {
  if (actor.dead) return false;
  if (hasStatus(actor, 'stone') || hasStatus(actor, 'sleep') || hasStatus(actor, 'stun') || hasStatus(actor, 'death')) return false;
  return true;
}

function partyById(state: GameState, id: string): Character | undefined {
  return state.party.find((c) => c.id === id);
}

function foeById(battle: BattleState, id: string): Foe | undefined {
  return battle.foes.find((f) => f.id === id);
}

function actorById(state: GameState, battle: BattleState, id: string): Actor | undefined {
  return partyById(state, id) ?? foeById(battle, id);
}

export function beginBattle(state: GameState, encounterId: string): BattleState {
  const enc = ENCOUNTER_BY_ID[encounterId];
  if (!enc) throw new Error(`unknown encounter ${encounterId}`);
  const foes: Foe[] = enc.enemies.map((slot, index) => {
    const def = ENEMY_BY_ID[slot.id];
    if (!def) throw new Error(`unknown enemy ${slot.id}`);
    return {
      id: `e${index}`,
      ref: def.id,
      name: def.name,
      hp: def.hp,
      maxHp: def.hp,
      mp: 40 + def.mdef,
      atk: def.atk,
      def: def.def,
      mdef: def.mdef,
      agi: def.agi,
      eva: def.eva,
      row: slot.rank ?? def.rank,
      ranged: !!def.ranged,
      strike: def.strike ?? 'one',
      spells: [...(def.spells ?? [])],
      tags: [...def.tags],
      weak: def.weak,
      resist: def.resist,
      element: def.element,
      statusImmune: [...(def.statusImmune ?? [])],
      statuses: [],
      buffs: [],
      dead: false,
    };
  });
  const battle: BattleState = {
    encounterId,
    foes,
    round: 1,
    commands: {},
    log: [`${enc.name} attacks.`],
    hpLost: {},
    mpSpent: {},
    hitsLanded: {},
    hitsTaken: {},
    whiteCasts: {},
    blackCasts: {},
    skillUses: {},
  };
  state.battle = battle;
  state.mode = 'battle';
  return battle;
}

export function commandError(state: GameState, actorId: string, command: BattleCommand): string | null {
  const battle = state.battle;
  if (!battle || battle.outcome) return 'no-battle';
  const actor = partyById(state, actorId);
  if (!actor || actor.dead) return 'not-ready';
  if (!canAct(actor) && command.kind !== 'flee') return 'incapacitated';
  if (command.kind === 'flee') {
    const enc = ENCOUNTER_BY_ID[battle.encounterId];
    if (enc?.noFlee) return 'no-flee';
    return null;
  }
  if (command.kind === 'attack') {
    const target = foeById(battle, command.targetId);
    if (!target || target.dead) return 'bad-target';
    const skill = gear(actor.equip.main)?.skill ?? 'unarmed';
    if (!meleeCanReach(actor.row, target.row, skill, battle.foes)) return 'row';
    return null;
  }
  if (command.kind === 'spell') {
    if (hasStatus(actor, 'silence') || hasStatus(actor, 'toad')) return 'silenced';
    if (!actor.spells.includes(command.spellId)) return 'unknown-spell';
    const spell = SPELL_BY_ID[command.spellId];
    if (!spell) return 'unknown-spell';
    const cost = spellCost(command.spellId, Math.max(1, skillRank(actor, command.spellId)));
    if (actor.mp < cost) return 'no-mp';
    const target = actorById(state, battle, command.targetId);
    if (!target) return 'bad-target';
    if (spell.kind !== 'status' && spell.kind !== 'life' && spell.target === 'enemy' && isParty(target)) return 'bad-target';
    if (spell.kind !== 'status' && (spell.target === 'ally' || spell.target === 'all-ally') && !isParty(target) && spell.kind !== 'life') return 'bad-target';
    return null;
  }
  if (command.kind === 'item') {
    if (countItem(state, command.itemId) <= 0) return 'no-item';
    const target = actorById(state, battle, command.targetId);
    if (!target) return 'bad-target';
    return null;
  }
  return 'bad-command';
}

function physicalHit(
  state: GameState,
  battle: BattleState,
  attacker: Actor,
  defender: Actor,
  weaponId: string | null,
  log: string[],
): void {
  const weapon = gear(weaponId);
  const skill = weapon?.skill ?? 'unarmed';
  if (isParty(attacker) && isParty(defender) === false) {
    const foe = defender as Foe;
    if (!meleeCanReach(attacker.row, foe.row, skill, battle.foes)) {
      log.push(`${attacker.name} cannot reach ${foe.name} from the back row.`);
      return;
    }
  }
  if (isParty(attacker)) recordUse(battle, attacker.id, weapon ? skill : 'unarmed');
  const blind = hasStatus(attacker, 'blind') ? 0.45 : 1;
  const acc = isParty(attacker) ? attacker.acc : 20;
  const eva = isParty(defender) ? evasionOf(defender) : defender.eva;
  const chance = Math.min(0.98, Math.max(0.2, (0.78 + (acc - eva) * 0.012) * blind));
  if (rngNext(state) > chance) {
    log.push(`${attacker.name} misses ${defender.name}.`);
    return;
  }
  let damage = 1;
  if (!isParty(attacker)) {
    damage = attacker.atk <= 0 ? 0 : Math.max(1, attacker.atk - (isParty(defender) ? defensePower(defender) : defender.def));
  } else {
    let atk = attackPower(attacker);
    if (weaponId && weaponId !== attacker.equip.main) {
      const off = gear(weaponId);
      const offRank = skillRank(attacker, off?.skill ?? 'unarmed');
      atk = attacker.str + (off?.attack ?? 2) + offRank * 3;
    }
    const berserk = attacker.buffs.find((b) => b.id === 'berserk');
    if (berserk) atk = Math.floor(atk * 1.35);
    if (hasStatus(attacker, 'mini')) atk = Math.max(1, Math.floor(atk * 0.25));
    const def = isParty(defender) ? defensePower(defender) : (defender as Foe).def;
    damage = Math.max(1, atk - def);
    if (hasStatus(attacker, 'toad')) damage = 1;
  }
  if (hasStatus(defender, 'mini')) damage = Math.floor(damage * 1.5);
  const element = weapon?.element;
  if (!isParty(defender) && element && defender.weak === element) damage = Math.floor(damage * 1.5);
  damage = Math.max(0, Math.floor(damage * (0.95 + rngNext(state) * 0.1)));
  defender.hp -= damage;
  log.push(`${attacker.name} hits ${defender.name} for ${damage}.`);
  if (hasStatus(defender, 'sleep') && damage > 0) clearStatus(defender, 'sleep');
  if (isParty(attacker) && !isParty(defender)) {
    battle.hitsLanded[attacker.id] = (battle.hitsLanded[attacker.id] ?? 0) + 1;
  }
  if (!isParty(attacker) && isParty(defender)) {
    battle.hpLost[defender.id] = (battle.hpLost[defender.id] ?? 0) + damage;
    battle.hitsTaken[defender.id] = (battle.hitsTaken[defender.id] ?? 0) + 1;
    if (gear(defender.equip.off)?.kind === 'shield') recordUse(battle, defender.id, 'shield');
  }
  if (defender.hp <= 0) {
    defender.hp = 0;
    defender.dead = true;
    log.push(`${defender.name} falls.`);
  }
}

function healActor(actor: Actor, amount: number, log: string[]): void {
  if (actor.dead) return;
  const before = actor.hp;
  const max = isParty(actor) ? actor.maxHp : actor.maxHp;
  actor.hp = Math.min(max, actor.hp + amount);
  log.push(`${actor.name} recovers ${actor.hp - before} HP.`);
}

function applyCleanse(actor: Actor, list: StatusId[], log: string[]): void {
  for (const id of list) {
    if (id === 'death') {
      if (actor.dead) {
        actor.dead = false;
        actor.statuses = actor.statuses.filter((s) => s.id !== 'death');
        actor.hp = Math.max(1, Math.floor((isParty(actor) ? actor.maxHp : actor.maxHp) * 0.25));
        log.push(`${actor.name} is revived.`);
      }
      continue;
    }
    if (clearStatus(actor, id)) log.push(`${actor.name} is cured of ${id}.`);
  }
}

function castSpell(state: GameState, battle: BattleState, caster: Character, spellId: string, target: Actor, log: string[]): void {
  const spell = SPELL_BY_ID[spellId];
  if (!spell) return;
  const rank = Math.max(1, skillRank(caster, spellId));
  const cost = spellCost(spellId, rank);
  if (caster.mp < cost) {
    log.push(`${caster.name} does not have enough MP.`);
    return;
  }
  caster.mp -= cost;
  battle.mpSpent[caster.id] = (battle.mpSpent[caster.id] ?? 0) + cost;
  recordUse(battle, caster.id, spellId);
  if (spell.school === 'white') battle.whiteCasts[caster.id] = (battle.whiteCasts[caster.id] ?? 0) + 1;
  if (spell.school === 'black') battle.blackCasts[caster.id] = (battle.blackCasts[caster.id] ?? 0) + 1;
  if (spell.school === 'ancient') {
    battle.whiteCasts[caster.id] = (battle.whiteCasts[caster.id] ?? 0) + 1;
    battle.blackCasts[caster.id] = (battle.blackCasts[caster.id] ?? 0) + 1;
  }
  const undead = !isParty(target) && target.tags.includes('undead');
  if (spell.kind === 'heal' || spellId === 'cure') {
    if (undead) {
      const dmg = 20 + rank * 15 + caster.spi * 2;
      target.hp -= dmg;
      log.push(`Cure sears ${target.name} for ${dmg}.`);
      if (target.hp <= 0) {
        target.hp = 0;
        target.dead = true;
      }
      return;
    }
    if (isParty(target)) {
      const amount = 20 + rank * 15 + caster.spi * 2 + caster.mag;
      healActor(target, amount, log);
      applyCleanse(target, cureAilmentsForRank(rank), log);
    }
    return;
  }
  if (spell.kind === 'life') {
    if (undead) {
      target.hp = 0;
      target.dead = true;
      log.push(`${target.name} is destroyed by Life.`);
      return;
    }
    if (isParty(target)) {
      const hp = Math.max(1, Math.floor(target.maxHp * Math.min(1, rank / 16)));
      target.dead = false;
      target.statuses = target.statuses.filter((s) => s.id !== 'death' && (rank < 4 || s.id !== 'stone'));
      target.hp = Math.min(target.maxHp, hp);
      log.push(`${target.name} is revived with ${target.hp} HP.`);
    }
    return;
  }
  if (spell.kind === 'cleanse' && isParty(target)) {
    const list = spellId === 'esuna' ? esunaAilments(rank) : basunaAilments(rank);
    applyCleanse(target, list, log);
    return;
  }
  if (spell.kind === 'buff') {
    const buffId = spellId === 'slow' ? 'slow' : spellId;
    const buff: Buff = { id: buffId, turns: 4, power: 6 + rank };
    target.buffs = target.buffs.filter((b) => b.id !== buff.id);
    target.buffs.push(buff);
    log.push(`${caster.name} casts ${spell.name} on ${target.name}.`);
    return;
  }
  if (spell.kind === 'dispel') {
    target.buffs = [];
    log.push(`${target.name}'s enchantments fade.`);
    return;
  }
  if (spell.kind === 'status' && spell.status) {
    const immune = isParty(target) ? [] : target.statusImmune;
    const boss = !isParty(target) && target.tags.includes('boss');
    if (spellId === 'fear') {
      if (boss || ENCOUNTER_BY_ID[battle.encounterId]?.boss) {
        log.push(`${target.name} resists fear.`);
        return;
      }
      target.hp = 0;
      target.dead = true;
      log.push(`${target.name} flees in fear.`);
      return;
    }
    if (inflict(target, spell.status, immune)) log.push(`${target.name} is afflicted with ${spell.status}.`);
    else log.push(`${target.name} resists ${spell.name}.`);
    return;
  }
  if (spell.kind === 'drain' || spell.kind === 'osmose' || spellId === 'sap') {
    if (spell.kind === 'osmose' || spellId === 'sap') {
      const drained = Math.min(isParty(target) ? target.mp : target.mp, 8 + rank * 3);
      if (!isParty(target)) target.mp -= drained;
      else target.mp = Math.max(0, target.mp - drained);
      caster.mp = Math.min(caster.maxMp, caster.mp + drained);
      log.push(`${caster.name} drains ${drained} MP.`);
      return;
    }
    const dmg = 10 + rank * 6 + caster.int;
    target.hp -= dmg;
    healActor(caster, Math.floor(dmg / 2), log);
    log.push(`${spell.name} hits ${target.name} for ${dmg}.`);
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
    }
    return;
  }
  if (spell.kind === 'special' && spellId === 'swap' && isParty(target)) {
    const hpRatio = target.hp / target.maxHp;
    const mpRatio = target.maxMp > 0 ? target.mp / target.maxMp : 0;
    target.hp = Math.max(1, Math.floor(target.maxHp * mpRatio));
    target.mp = Math.floor(target.maxMp * hpRatio);
    log.push(`${target.name}'s vitality twists.`);
    return;
  }
  if (spell.kind === 'field') {
    if (spellId === 'warp' && !isParty(target) && !target.tags.includes('boss')) {
      target.hp = 0;
      target.dead = true;
      log.push(`${target.name} is banished.`);
      return;
    }
    log.push(`${spell.name} has no effect here.`);
    return;
  }
  const targets: Actor[] = spell.target === 'all-enemy' ? living(battle.foes) : [target];
  for (const foe of targets) {
    if (foe.dead) continue;
    let power = spell.power + rank * 8 + (spell.school === 'white' ? caster.spi : caster.int) + Math.floor(caster.mag / 2);
    if (spellId === 'scourge') power = Math.max(8, Math.floor(foe.hp * (0.08 + rank * 0.012)));
    if (spellId === 'ultima') power = 50 + rank * 14 + caster.spi + caster.int + caster.mag;
    let resist = isParty(foe) ? magicDefense(foe) : (foe as Foe).mdef;
    if (foe.buffs.some((b) => b.id === 'wall')) power = Math.floor(power * 0.5);
    let dmg = Math.max(1, power - resist);
    if (!isParty(foe) && spell.element !== 'none' && foe.weak === spell.element) dmg = Math.floor(dmg * 1.5);
    if (!isParty(foe) && spell.element !== 'none' && (foe.resist === spell.element || foe.element === spell.element)) dmg = Math.floor(dmg * 0.5);
    if (!isParty(foe) && spell.element === 'holy' && foe.tags.includes('undead')) dmg = Math.floor(dmg * 1.5);
    foe.hp -= dmg;
    log.push(`${spell.name} hits ${foe.name} for ${dmg}.`);
    if (foe.hp <= 0) {
      foe.hp = 0;
      foe.dead = true;
      log.push(`${foe.name} falls.`);
    }
  }
}

function useItem(state: GameState, battle: BattleState, user: Character, itemId: string, target: Actor, log: string[]): void {
  if (!takeItem(state, itemId, 1)) {
    log.push(`${user.name} has no ${itemId}.`);
    return;
  }
  const item = gear(itemId);
  const effect = item?.effect ?? '';
  if (effect.startsWith('heal-')) {
    healActor(target, Number(effect.slice(5)), log);
    return;
  }
  if (effect === 'mp-40' && isParty(target)) {
    target.mp = Math.min(target.maxMp, target.mp + 40);
    log.push(`${target.name} recovers MP.`);
    return;
  }
  if (effect === 'full' && isParty(target)) {
    target.hp = target.maxHp;
    target.mp = target.maxMp;
    target.dead = false;
    target.statuses = [];
    log.push(`${target.name} is fully restored.`);
    return;
  }
  if (effect === 'field-full') {
    for (const c of state.party) if (!c.dead) {
      c.hp = c.maxHp;
      c.mp = c.maxMp;
    }
    log.push('The cottage restores the living.');
    return;
  }
  if (effect.startsWith('cure-') || itemCureList(itemId).length) {
    const list = effect === 'cure-many' ? itemCureList('unicorn-horn') : effect === 'cure-death' ? (['death'] as const) : itemCureList(itemId);
    if (isParty(target)) applyCleanse(target, [...list], log);
    return;
  }
  if (effect === 'smite-undead' && !isParty(target) && target.tags.includes('undead')) {
    target.hp -= 180;
    log.push(`The cross burns ${target.name}.`);
    if (target.hp <= 0) {
      target.hp = 0;
      target.dead = true;
    }
    return;
  }
  if (effect === 'buff-berserk' || effect === 'buff-haste') {
    const id = effect.endsWith('haste') ? 'haste' : 'berserk';
    target.buffs.push({ id, turns: 4, power: 10 });
    log.push(`${target.name} is strengthened.`);
    return;
  }
  if (effect === 'inflict-slow') {
    target.buffs.push({ id: 'slow', turns: 4, power: 10 });
    log.push(`${target.name} slows.`);
    return;
  }
  if (effect === 'inflict-stun') {
    inflict(target, 'stun', isParty(target) ? [] : target.statusImmune);
    log.push(`${target.name} is stunned.`);
    return;
  }
  if (effect.startsWith('teach-')) {
    addItem(state, itemId, 1);
    log.push('Tomes are studied outside of battle.');
    return;
  }
  log.push(`${item?.name ?? itemId} does nothing.`);
}

function enemyCommand(state: GameState, battle: BattleState, foe: Foe): BattleCommand {
  const enc = ENCOUNTER_BY_ID[battle.encounterId];
  const party = living(state.party);
  const front = party.filter((c) => c.row === 'front');
  const pool = foe.ranged || front.length === 0 ? party : front;
  const target = pool[Math.floor(rngNext(state) * pool.length)] ?? party[0];
  if (enc?.ai !== 'attack-only' && foe.spells.length && rngNext(state) < 0.45) {
    const spellId = foe.spells[Math.floor(rngNext(state) * foe.spells.length)];
    return { kind: 'spell', spellId, targetId: target?.id ?? 'firion' };
  }
  return { kind: 'attack', targetId: target?.id ?? 'firion' };
}

function execute(state: GameState, battle: BattleState, actor: Actor, command: BattleCommand, log: string[]): void {
  if (actor.dead) return;
  if (hasStatus(actor, 'amnesia') && rngNext(state) < 0.5) {
    log.push(`${actor.name} forgets what they meant to do.`);
    return;
  }
  if (!canAct(actor)) {
    log.push(`${actor.name} cannot move.`);
    return;
  }
  pullRows(state, log);
  if (command.kind === 'flee') {
    const enc = ENCOUNTER_BY_ID[battle.encounterId];
    if (enc?.noFlee || enc?.boss) {
      log.push('The enemy will not let you flee.');
      return;
    }
    battle.outcome = 'fled';
    log.push('The party escapes.');
    return;
  }
  if (!isParty(actor)) {
    if (command.kind === 'spell') {
      const spell = SPELL_BY_ID[command.spellId];
      const target = actorById(state, battle, command.targetId);
      if (!spell || !target) return;
      if (spell.kind === 'damage' || spell.kind === 'status') {
        if (spell.status) {
          if (inflict(target, spell.status, isParty(target) ? [] : (target as Foe).statusImmune)) {
            log.push(`${actor.name}'s ${spell.name} inflicts ${spell.status} on ${target.name}.`);
          } else log.push(`${target.name} resists.`);
        } else {
          const dmg = Math.max(1, spell.power + actor.atk / 4 - (isParty(target) ? magicDefense(target) : 0));
          target.hp -= dmg;
          log.push(`${actor.name}'s ${spell.name} hits ${target.name} for ${dmg}.`);
          if (isParty(target)) battle.hpLost[target.id] = (battle.hpLost[target.id] ?? 0) + dmg;
          if (target.hp <= 0) {
            target.hp = 0;
            target.dead = true;
            log.push(`${target.name} falls.`);
          }
        }
      }
      return;
    }
    const targets =
      actor.strike === 'all'
        ? living(state.party)
        : [partyById(state, command.kind === 'attack' ? command.targetId : '')].filter((c): c is Character => !!c && !c.dead);
    const chosen = targets.length ? targets : living(state.party).slice(0, 1);
    for (const target of chosen) {
      if (target.dead) continue;
      const frontAlive = state.party.some((c) => !c.dead && c.row === 'front' && !hasStatus(c, 'stone'));
      if (!actor.ranged && target.row === 'back' && frontAlive) {
        log.push(`${actor.name}'s blow cannot reach ${target.name} in the back row.`);
        continue;
      }
      physicalHit(state, battle, actor, target, null, log);
    }
    return;
  }
  if (command.kind === 'attack') {
    const target = foeById(battle, command.targetId);
    if (!target || target.dead) {
      log.push(`${actor.name} has no target.`);
      return;
    }
    physicalHit(state, battle, actor, target, actor.equip.main, log);
    const off = gear(actor.equip.off);
    if (off?.kind === 'weapon' && !target.dead) physicalHit(state, battle, actor, target, actor.equip.off, log);
    return;
  }
  if (command.kind === 'spell') {
    const target = actorById(state, battle, command.targetId);
    if (!target) return;
    castSpell(state, battle, actor, command.spellId, target, log);
    return;
  }
  if (command.kind === 'item') {
    const target = actorById(state, battle, command.targetId);
    if (!target) return;
    useItem(state, battle, actor, command.itemId, target, log);
  }
}

function endRound(state: GameState, battle: BattleState, log: string[]): void {
  const holders: Actor[] = [...state.party, ...battle.foes];
  for (const actor of holders) {
    if (actor.dead) continue;
    if (hasStatus(actor, 'poison')) {
      const max = isParty(actor) ? actor.maxHp : actor.maxHp;
      const tick = Math.max(1, Math.floor(max * 0.08));
      actor.hp -= tick;
      log.push(`${actor.name} suffers ${tick} from poison.`);
      if (isParty(actor)) battle.hpLost[actor.id] = (battle.hpLost[actor.id] ?? 0) + tick;
      if (actor.hp <= 0) {
        actor.hp = 0;
        actor.dead = true;
        log.push(`${actor.name} falls.`);
      }
    }
    actor.statuses = actor.statuses
      .map((s) => (s.turns ? { ...s, turns: s.turns - 1 } : s))
      .filter((s) => s.turns === undefined || s.turns > 0);
    actor.buffs = actor.buffs.map((b) => ({ ...b, turns: b.turns - 1 })).filter((b) => b.turns > 0);
  }
}

export function resolveRound(state: GameState): { ok: boolean; error?: string; messages: string[] } {
  const battle = state.battle;
  if (!battle || battle.outcome) return { ok: false, error: 'no-battle', messages: [] };
  const ready = state.party.filter((c) => canAct(c));
  for (const c of ready) {
    if (!battle.commands[c.id]) return { ok: false, error: 'need-commands', messages: [`${c.name} has not chosen a command.`] };
  }
  const log: string[] = [];
  pullRows(state, log);
  const actors: Actor[] = [...ready, ...living(battle.foes)];
  const commands = new Map<string, BattleCommand>();
  for (const c of ready) commands.set(c.id, battle.commands[c.id]);
  for (const foe of living(battle.foes)) commands.set(foe.id, enemyCommand(state, battle, foe));
  actors.sort((a, b) => agiOf(b) - agiOf(a) || rngNext(state) - 0.5);
  for (const actor of actors) {
    if (battle.outcome) break;
    const command = commands.get(actor.id);
    if (!command) continue;
    execute(state, battle, actor, command, log);
  }
  if (!battle.outcome) endRound(state, battle, log);
  const enc = ENCOUNTER_BY_ID[battle.encounterId];
  if (!battle.outcome && enc?.scriptedLoss) {
    for (const c of state.party) {
      c.hp = 0;
      c.dead = true;
    }
    battle.outcome = 'rescued';
    log.push('Reinforcements pour in. The road goes dark.');
  } else if (!battle.outcome && enc?.scriptedWithdraw) {
    battle.outcome = 'withdrew';
    log.push('The Dark Knight lowers his blade and steps back into the smoke.');
  } else if (!battle.outcome && living(battle.foes).length === 0) {
    battle.outcome = 'victory';
    log.push('Victory.');
  } else if (!battle.outcome && living(state.party).length === 0) {
    battle.outcome = 'wipe';
    log.push('The party has fallen.');
  }
  const outcome = battle.outcome as string | undefined;
  if (outcome === 'victory') {
    let gil = 0;
    for (const foe of battle.foes) gil += ENEMY_BY_ID[foe.ref]?.gil ?? 0;
    state.gil += gil;
    if (gil > 0) log.push(`Gained ${gil} gil.`);
    state.pendingVictory = battle.encounterId;
    const growth = applyBattleGrowth(state, battle);
    state.lastGrowth = growth;
    for (const line of growth) log.push(line);
    finishField(state, log);
  } else if (outcome === 'fled') {
    const growth = applyBattleGrowth(state, battle);
    state.lastGrowth = growth;
    for (const line of growth) log.push(line);
    finishField(state, log);
  } else if (outcome === 'rescued') {
    const growth = applyBattleGrowth(state, battle);
    state.lastGrowth = growth;
    for (const line of growth) log.push(line);
    for (const c of state.party) {
      if (c.id === 'leon') continue;
      c.dead = false;
      c.hp = c.maxHp;
      c.mp = c.maxMp;
      c.statuses = [];
      c.buffs = [];
    }
    state.party = state.party.filter((c) => c.id !== 'leon');
    state.flags.rescued = true;
    state.flags.leonMissing = true;
    state.mapId = 'altair';
    state.x = 2;
    state.y = 9;
    state.worldX = 8;
    state.worldY = 22;
    state.ride = 'foot';
    state.mode = 'field';
    state.battle = null;
    state.phase = 'altair-wake';
    state.objective = 'Learn the rebel password in Altair, then speak it to Princess Hilda.';
    log.push('You wake in Altair. Leon is not among you.');
    log.push(state.objective);
  } else if (outcome === 'withdrew') {
    state.flags.leonDarkKnight = true;
    state.flags.dreadnoughtDestroyed = true;
    const growth = applyBattleGrowth(state, battle);
    state.lastGrowth = growth;
    for (const line of growth) log.push(line);
    state.phase = 'after-dreadnought';
    state.objective = 'Leon lives, and he wears the empire\'s black. Find a ship.';
    state.mapId = 'bafsk';
    state.x = 2;
    state.y = 9;
    state.mode = 'field';
    state.battle = null;
    log.push('The Dreadnought breaks apart. Leon is the Dark Knight — and he lets you live.');
  } else if (outcome === 'wipe') {
    state.mode = 'gameover';
    state.lastGrowth = [];
    log.push('Game over. The rebellion still has your last save.');
  } else {
    battle.round += 1;
    battle.commands = {};
    for (const c of state.party) if (!canAct(c)) delete battle.commands[c.id];
  }
  battle.log.push(...log);
  state.log.push(...log);
  return { ok: true, messages: log };
}

function finishField(state: GameState, log: string[]): void {
  for (const c of [...state.party]) {
    c.buffs = [];
    c.statuses = c.statuses.filter((s) => !['sleep', 'stun'].includes(s.id));
  }
  state.mode = 'field';
  state.battle = null;
  void log;
}

export function terrainEncounter(state: GameState, table: { id: string; weight: number }[]): string | null {
  const total = table.reduce((s, e) => s + e.weight, 0);
  if (total <= 0) return null;
  let roll = rngNext(state) * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return table[table.length - 1]?.id ?? null;
}
