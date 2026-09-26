import {
  ARMOR,
  CONSUMABLES,
  ENCOUNTER_BY_ID,
  GEAR_BY_ID,
  ITEM_CURE,
  KEY_ITEMS,
  SPELLS,
  SPELL_BY_ID,
  WEAPONS,
  type Element,
  type GearDef,
  type KeywordId,
  type StatusId,
  type WeaponSkill,
} from '../data/content';

export const USES_PER_RANK = 2;
export const RANK_CAP = 16;
export const SUBSTANTIAL = 0.25;
export const STAT_STEP = 2;

export interface SkillState {
  rank: number;
  progress: number;
}

export interface StatusInstance {
  id: StatusId;
  turns?: number;
}

export interface Buff {
  id: string;
  turns: number;
  power: number;
}

export interface Character {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  str: number;
  sta: number;
  agi: number;
  int: number;
  spi: number;
  acc: number;
  eva: number;
  mag: number;
  row: 'front' | 'back';
  equip: {
    main: string | null;
    off: string | null;
    head: string | null;
    body: string | null;
    hands: string | null;
    accessory: string | null;
  };
  skills: Record<string, SkillState>;
  spells: string[];
  statuses: StatusInstance[];
  buffs: Buff[];
  dead: boolean;
  guest: boolean;
  attackProg: number;
  hitTakenProg: number;
  whiteProg: number;
  blackProg: number;
}

export type Ride = 'foot' | 'canoe' | 'ship' | 'snowcraft' | 'airship' | 'chocobo';

export type Phase =
  | 'intro'
  | 'altair-wake'
  | 'to-fynn'
  | 'report-scott'
  | 'to-salamand'
  | 'to-semitt'
  | 'semitt-clear'
  | 'to-bafsk'
  | 'need-pass'
  | 'saw-dreadnought'
  | 'to-snow'
  | 'after-josef'
  | 'to-kashuan'
  | 'kashuan-open'
  | 'need-sunfire'
  | 'have-sunfire'
  | 'to-dreadnought'
  | 'after-dreadnought'
  | 'to-leila'
  | 'leviathan'
  | 'after-leviathan'
  | 'to-coliseum'
  | 'after-lamia'
  | 'to-castle-fynn'
  | 'fynn-free'
  | 'to-deist'
  | 'deist-cavern'
  | 'ricard-joined'
  | 'to-mysidia'
  | 'need-mask'
  | 'to-tower'
  | 'after-minwu'
  | 'cyclone'
  | 'after-cyclone'
  | 'to-palamecia'
  | 'after-emperor'
  | 'to-jade'
  | 'pandaemonium'
  | 'ending';

export interface Settings {
  mute: boolean;
  volume: number;
  gameModeLock: boolean;
  reducedEffects: boolean;
}

export interface GameState {
  phase: Phase;
  objective: string;
  party: Character[];
  reserve: Character[];
  fallen: string[];
  gil: number;
  items: Record<string, number>;
  keywords: KeywordId[];
  flags: Record<string, boolean>;
  mapId: string;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  ride: Ride;
  vehicles: { canoe: boolean; ship: boolean; snowcraft: boolean; airship: boolean };
  chocoboMounted: boolean;
  settings: Settings;
  mode: 'title' | 'field' | 'battle' | 'gameover' | 'ending';
  log: string[];
  rng: number;
  steps: number;
  chests: string[];
  visited: string[];
  battle: BattleState | null;
  endingText: string;
  lastGrowth: string[];
  pendingVictory: string | null;
}

export interface Foe {
  id: string;
  ref: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  atk: number;
  def: number;
  mdef: number;
  agi: number;
  eva: number;
  row: 'front' | 'back';
  ranged: boolean;
  strike: 'one' | 'all';
  spells: string[];
  tags: string[];
  weak?: Element;
  resist?: Element;
  element?: Element;
  statusImmune: StatusId[];
  statuses: StatusInstance[];
  buffs: Buff[];
  dead: boolean;
}

export type BattleCommand =
  | { kind: 'attack'; targetId: string }
  | { kind: 'spell'; spellId: string; targetId: string }
  | { kind: 'item'; itemId: string; targetId: string }
  | { kind: 'flee' };

export interface BattleState {
  encounterId: string;
  foes: Foe[];
  round: number;
  commands: Record<string, BattleCommand>;
  log: string[];
  hpLost: Record<string, number>;
  mpSpent: Record<string, number>;
  hitsLanded: Record<string, number>;
  hitsTaken: Record<string, number>;
  whiteCasts: Record<string, number>;
  blackCasts: Record<string, number>;
  skillUses: Record<string, Record<string, number>>;
  outcome?: 'victory' | 'fled' | 'wipe' | 'rescued' | 'withdrew';
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  messages: string[];
}

export function rngNext(state: GameState): number {
  state.rng = (Math.imul(state.rng, 1664525) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}

export function note(state: GameState, ...lines: string[]): void {
  for (const line of lines) state.log.push(line);
  if (state.log.length > 100) state.log.splice(0, state.log.length - 100);
}

export function gear(id: string | null | undefined): GearDef | undefined {
  if (!id) return undefined;
  return GEAR_BY_ID[id];
}

export function skillRank(c: Character, skill: string): number {
  return c.skills[skill]?.rank ?? 0;
}

export function skillLabel(skill: string): string {
  if (SPELL_BY_ID[skill]) return `${SPELL_BY_ID[skill].name} rank`;
  if (skill === 'unarmed') return 'unarmed skill';
  if (skill === 'shield') return 'shield skill';
  return `${skill} skill`;
}

export function hasStatus(holder: { statuses: StatusInstance[]; dead?: boolean }, id: StatusId): boolean {
  if (id === 'death') return !!holder.dead || holder.statuses.some((s) => s.id === 'death');
  return holder.statuses.some((s) => s.id === id);
}

export function clearStatus(holder: { statuses: StatusInstance[]; dead: boolean; hp: number; maxHp: number }, id: StatusId): boolean {
  if (id === 'death') {
    if (!holder.dead && !holder.statuses.some((s) => s.id === 'death')) return false;
    holder.dead = false;
    holder.statuses = holder.statuses.filter((s) => s.id !== 'death');
    if (holder.hp <= 0) holder.hp = Math.max(1, Math.floor(holder.maxHp * 0.1));
    return true;
  }
  const before = holder.statuses.length;
  holder.statuses = holder.statuses.filter((s) => s.id !== id);
  return holder.statuses.length !== before;
}

export function inflict(
  holder: { statuses: StatusInstance[]; dead: boolean; name: string; hp: number },
  id: StatusId,
  immune: StatusId[] = [],
): boolean {
  if (immune.includes(id)) return false;
  if (id === 'death') {
    holder.dead = true;
    holder.hp = 0;
    if (!holder.statuses.some((s) => s.id === 'death')) holder.statuses.push({ id: 'death' });
    return true;
  }
  if (holder.statuses.some((s) => s.id === id)) return false;
  const turns = id === 'sleep' ? 3 : id === 'stun' ? 2 : undefined;
  holder.statuses.push({ id, turns });
  return true;
}

export function attackPower(c: Character): number {
  const w = gear(c.equip.main);
  const skill = w?.skill ?? 'unarmed';
  const rank = Math.max(w ? skillRank(c, skill) : skillRank(c, 'unarmed'), 0);
  return c.str + (w?.attack ?? 2) + rank * 3 + (w?.skill === 'staff' ? c.mag : 0);
}

export function defensePower(c: Character): number {
  let def = Math.floor(c.sta / 4);
  for (const slot of ['head', 'body', 'hands'] as const) {
    const item = gear(c.equip[slot]);
    if (item?.defense) def += item.defense;
  }
  const off = gear(c.equip.off);
  if (off?.kind === 'shield') def += (off.defense ?? 0) + skillRank(c, 'shield');
  const protect = c.buffs.find((b) => b.id === 'protect');
  if (protect) def += protect.power;
  return def;
}

export function evasionOf(c: Character): number {
  let eva = c.eva;
  const off = gear(c.equip.off);
  if (off?.eva) eva += off.eva;
  const acc = gear(c.equip.accessory);
  if (acc?.eva) eva += acc.eva;
  for (const slot of ['head', 'body', 'hands'] as const) {
    const item = gear(c.equip[slot]);
    if (item?.eva) eva += item.eva;
  }
  const blink = c.buffs.find((b) => b.id === 'blink');
  if (blink) eva += blink.power;
  return eva;
}

export function magicDefense(c: Character): number {
  let m = Math.floor(c.spi / 3) + Math.floor(c.mag / 4);
  const shell = c.buffs.find((b) => b.id === 'shell');
  if (shell) m += shell.power;
  return m;
}

export function partyPower(state: GameState): number {
  let power = 0;
  for (const c of state.party) {
    if (c.dead) continue;
    const w = gear(c.equip.main);
    const skill = w?.skill ?? 'unarmed';
    const rank = Math.max(1, skillRank(c, skill));
    const spellRanks = c.spells.reduce((sum, id) => sum + (c.skills[id]?.rank ?? 0), 0);
    power += c.maxHp / 6 + c.str + c.sta / 2 + c.mag + rank * 5 + (w?.attack ?? 1) + spellRanks * 2;
  }
  return Math.floor(power);
}

export function rateEncounter(state: GameState, encounterId: string): 'ready' | 'not-ready' {
  const enc = ENCOUNTER_BY_ID[encounterId];
  if (!enc) return 'not-ready';
  return partyPower(state) >= enc.threat ? 'ready' : 'not-ready';
}

export function countItem(state: GameState, id: string): number {
  return state.items[id] ?? 0;
}

export function addItem(state: GameState, id: string, n = 1): void {
  state.items[id] = (state.items[id] ?? 0) + n;
}

export function takeItem(state: GameState, id: string, n = 1): boolean {
  const have = state.items[id] ?? 0;
  if (have < n) return false;
  const left = have - n;
  if (left <= 0) delete state.items[id];
  else state.items[id] = left;
  return true;
}

function skills(pairs: [string, number][]): Record<string, SkillState> {
  const out: Record<string, SkillState> = {};
  for (const [id, rank] of pairs) out[id] = { rank, progress: 0 };
  return out;
}

function blankEquip(): Character['equip'] {
  return { main: null, off: null, head: null, body: null, hands: null, accessory: null };
}

export function makeCharacter(partial: {
  id: string;
  name: string;
  hp: number;
  mp: number;
  str: number;
  sta: number;
  agi: number;
  int: number;
  spi: number;
  acc: number;
  eva: number;
  mag: number;
  row: 'front' | 'back';
  guest?: boolean;
  equip?: Partial<Character['equip']>;
  skills?: [string, number][];
  spells?: string[];
}): Character {
  return {
    id: partial.id,
    name: partial.name,
    hp: partial.hp,
    maxHp: partial.hp,
    mp: partial.mp,
    maxMp: partial.mp,
    str: partial.str,
    sta: partial.sta,
    agi: partial.agi,
    int: partial.int,
    spi: partial.spi,
    acc: partial.acc,
    eva: partial.eva,
    mag: partial.mag,
    row: partial.row,
    equip: { ...blankEquip(), ...partial.equip },
    skills: skills(partial.skills ?? []),
    spells: [...(partial.spells ?? [])],
    statuses: [],
    buffs: [],
    dead: false,
    guest: !!partial.guest,
    attackProg: 0,
    hitTakenProg: 0,
    whiteProg: 0,
    blackProg: 0,
  };
}

export function makeMinwu(): Character {
  return makeCharacter({
    id: 'minwu',
    name: 'Minwu',
    hp: 80,
    mp: 70,
    str: 8,
    sta: 10,
    agi: 9,
    int: 18,
    spi: 24,
    acc: 11,
    eva: 8,
    mag: 18,
    row: 'front',
    guest: true,
    equip: { main: 'staff', body: 'white-robe', head: 'leather-cap' },
    skills: [
      ['staff', 4],
      ['cure', 4],
      ['life', 3],
      ['basuna', 3],
      ['esuna', 2],
      ['blink', 2],
      ['protect', 2],
      ['shell', 2],
      ['teleport', 1],
    ],
    spells: ['cure', 'life', 'basuna', 'esuna', 'blink', 'protect', 'shell', 'teleport'],
  });
}

export function makeJosef(): Character {
  return makeCharacter({
    id: 'josef',
    name: 'Josef',
    hp: 180,
    mp: 8,
    str: 30,
    sta: 22,
    agi: 14,
    int: 6,
    spi: 8,
    acc: 16,
    eva: 12,
    mag: 2,
    row: 'front',
    guest: true,
    skills: [
      ['unarmed', 8],
      ['axe', 3],
    ],
  });
}

export function makeGordon(): Character {
  return makeCharacter({
    id: 'gordon',
    name: 'Gordon',
    hp: 140,
    mp: 36,
    str: 18,
    sta: 14,
    agi: 12,
    int: 14,
    spi: 16,
    acc: 13,
    eva: 9,
    mag: 10,
    row: 'front',
    guest: true,
    equip: { main: 'spear', off: 'bronze-shield', body: 'copper-cuirass', head: 'bronze-helm' },
    skills: [
      ['spear', 6],
      ['shield', 3],
      ['cure', 2],
    ],
    spells: ['cure'],
  });
}

export function makeLeila(): Character {
  return makeCharacter({
    id: 'leila',
    name: 'Leila',
    hp: 150,
    mp: 28,
    str: 22,
    sta: 15,
    agi: 20,
    int: 11,
    spi: 9,
    acc: 18,
    eva: 16,
    mag: 5,
    row: 'front',
    guest: true,
    equip: { main: 'dagger', off: 'knife', body: 'leather-armor' },
    skills: [
      ['knife', 7],
      ['sword', 3],
    ],
  });
}

export function makeRicard(): Character {
  return makeCharacter({
    id: 'ricard',
    name: 'Ricard',
    hp: 260,
    mp: 24,
    str: 32,
    sta: 24,
    agi: 13,
    int: 9,
    spi: 12,
    acc: 16,
    eva: 8,
    mag: 4,
    row: 'front',
    guest: true,
    equip: { main: 'mythril-spear', off: 'mythril-shield', body: 'mythril-armor', head: 'mythril-helm' },
    skills: [
      ['spear', 9],
      ['shield', 5],
    ],
  });
}

export function makeLeonEndgame(): Character {
  return makeCharacter({
    id: 'leon',
    name: 'Leon',
    hp: 300,
    mp: 90,
    str: 34,
    sta: 22,
    agi: 22,
    int: 26,
    spi: 16,
    acc: 22,
    eva: 14,
    mag: 20,
    row: 'front',
    guest: true,
    equip: { main: 'blood-sword', off: 'mythril-axe', body: 'black-garb' },
    skills: [
      ['sword', 10],
      ['axe', 6],
      ['fire', 6],
      ['bolt', 6],
      ['flare', 3],
    ],
    spells: ['fire', 'bolt', 'flare'],
  });
}

export function makeLeonIntro(): Character {
  return makeCharacter({
    id: 'leon',
    name: 'Leon',
    hp: 54,
    mp: 18,
    str: 14,
    sta: 11,
    agi: 13,
    int: 12,
    spi: 8,
    acc: 12,
    eva: 10,
    mag: 5,
    row: 'front',
    guest: true,
    equip: { main: 'broadsword', body: 'leather-armor' },
    skills: [
      ['sword', 3],
      ['bolt', 2],
    ],
    spells: ['bolt'],
  });
}

export const OBJECTIVES: Record<Phase, string> = {
  intro: 'Imperial soldiers have found you outside Fynn. Stand and fight.',
  'altair-wake': 'Learn the rebel password in Altair, then speak it to Princess Hilda.',
  'to-fynn': 'Occupied Fynn hides Prince Scott. Find him and hear what he knows.',
  'report-scott': 'Scott is gone. Bring his ring and his warning back to Hilda.',
  'to-salamand': 'Cross to Poft, then find Josef in Salamand. Ask him about Mythril.',
  'to-semitt': 'Take Josef\'s canoe to Semitt Falls. Free Nelly and take the mythril.',
  'semitt-clear': 'Bring the mythril to the Salamand smith so the rebellion can be armed.',
  'to-bafsk': 'The Dreadnought is being finished under Bafsk. Investigate the cave.',
  'need-pass': 'The cave is sealed. Find Paul — he can steal a way in.',
  'saw-dreadnought': 'The warship has launched. Seek the Goddess\'s Bell in the snow.',
  'to-snow': 'Cross the snowfield with the snowcraft. Borghen holds the bell.',
  'after-josef': 'Josef is gone. The Goddess\'s Bell will open Kashuan Keep.',
  'to-kashuan': 'Ring the bell at Kashuan and find the words that make Sunfire.',
  'kashuan-open': 'Gordon is with you. Learn Ekmet Teloess and take Egil\'s Torch to the flame.',
  'need-sunfire': 'Speak Ekmet Teloess at the sacred flame.',
  'have-sunfire': 'Board the Dreadnought and use Sunfire on its engine.',
  'to-dreadnought': 'Use Sunfire inside the Dreadnought.',
  'after-dreadnought': 'Leon lives, and he wears the empire\'s black. Find a ship.',
  'to-leila': 'Leila will sail with you. Put to sea.',
  leviathan: 'The Leviathan has swallowed the ship. Find a way out.',
  'after-leviathan': 'The false princess waits in the Coliseum. Gordon knows the way.',
  'to-coliseum': 'Face the princess in the Coliseum.',
  'after-lamia': 'That was not Hilda. Search Castle Fynn for the real princess.',
  'to-castle-fynn': 'Free Hilda and drive Gottos from Castle Fynn. Paul can open the drainage gate.',
  'fynn-free': 'Fynn is free. Ask after the Dragoons of Deist.',
  'to-deist': 'Search Castle Deist, then the cavern where the last wyvern waits.',
  'deist-cavern': 'Ask Ricard about the Dragoons.',
  'ricard-joined': 'The mages of Mysidia know the Ultima Tome. Learn the Mask.',
  'to-mysidia': 'Speak with Mysidia. The Mask opens their trust.',
  'need-mask': 'Claim the White Mask and the Black Mask, then climb Mysidian Tower.',
  'to-tower': 'Reach the seal. Minwu intends to break it.',
  'after-minwu': 'Minwu is gone. The Ultima Tome can still be read. The Cyclone is rising.',
  cyclone: 'Ricard and the wyvern will carry you into the Cyclone.',
  'after-cyclone': 'Ricard has fallen. Take the airship to Castle Palamecia.',
  'to-palamecia': 'The Emperor waits in Castle Palamecia.',
  'after-emperor': 'He will not stay dead. Leon knows the Jade Passage.',
  'to-jade': 'Cross the Jade Passage into Pandaemonium.',
  pandaemonium: 'End the Dark Emperor.',
  ending: 'The oath holds. Leon is no longer the Dark Knight.',
};

export function createNewGame(seed = 1): GameState {
  const firion = makeCharacter({
    id: 'firion',
    name: 'Firion',
    hp: 48,
    mp: 14,
    str: 12,
    sta: 10,
    agi: 10,
    int: 6,
    spi: 6,
    acc: 10,
    eva: 8,
    mag: 2,
    row: 'front',
    equip: { main: 'broadsword', off: 'buckler', head: 'leather-cap', body: 'leather-armor', hands: 'leather-gloves' },
    skills: [
      ['sword', 2],
      ['shield', 1],
    ],
  });
  const maria = makeCharacter({
    id: 'maria',
    name: 'Maria',
    hp: 36,
    mp: 30,
    str: 7,
    sta: 8,
    agi: 12,
    int: 14,
    spi: 12,
    acc: 12,
    eva: 10,
    mag: 8,
    row: 'back',
    equip: { main: 'shortbow', head: 'leather-cap', body: 'clothes' },
    skills: [
      ['bow', 2],
      ['cure', 1],
      ['fire', 1],
    ],
    spells: ['cure', 'fire'],
  });
  const guy = makeCharacter({
    id: 'guy',
    name: 'Guy',
    hp: 60,
    mp: 8,
    str: 16,
    sta: 14,
    agi: 8,
    int: 4,
    spi: 5,
    acc: 8,
    eva: 6,
    mag: 1,
    row: 'front',
    equip: { main: 'hand-axe', head: 'leather-cap', body: 'leather-armor', hands: 'leather-gloves' },
    skills: [
      ['axe', 2],
      ['unarmed', 2],
    ],
  });
  return {
    phase: 'intro',
    objective: OBJECTIVES.intro,
    party: [firion, maria, guy, makeLeonIntro()],
    reserve: [],
    fallen: [],
    gil: 600,
    items: {
      potion: 8,
      antidote: 3,
      'echo-screen': 2,
      mallet: 2,
      'maidens-kiss': 2,
      'gold-needle': 2,
      'alarm-clock': 2,
      'phoenix-down': 2,
      ether: 2,
      'eye-drops': 2,
    },
    keywords: [],
    flags: {},
    mapId: 'outskirts',
    x: 2,
    y: 3,
    worldX: 12,
    worldY: 17,
    ride: 'foot',
    vehicles: { canoe: false, ship: false, snowcraft: false, airship: false },
    chocoboMounted: false,
    settings: { mute: false, volume: 0.8, gameModeLock: false, reducedEffects: false },
    mode: 'field',
    log: ['Four youths run the Fynn road. The empire is already there.'],
    rng: seed >>> 0 || 1,
    steps: 0,
    chests: [],
    visited: [],
    battle: null,
    endingText: '',
    lastGrowth: [],
    pendingVictory: null,
  };
}

export function setPhase(state: GameState, phase: Phase): void {
  state.phase = phase;
  state.objective = OBJECTIVES[phase];
}

export function learnKeyword(state: GameState, id: KeywordId): boolean {
  if (state.keywords.includes(id)) return false;
  state.keywords.push(id);
  return true;
}

export function knows(state: GameState, id: KeywordId): boolean {
  return state.keywords.includes(id);
}

export function findMember(state: GameState, id: string): Character | undefined {
  return state.party.find((c) => c.id === id) ?? state.reserve.find((c) => c.id === id);
}

export function livingParty(state: GameState): Character[] {
  return state.party.filter((c) => !c.dead);
}

export function moveGuestToReserve(state: GameState, id: string): void {
  const index = state.party.findIndex((c) => c.id === id);
  if (index < 0) return;
  const [c] = state.party.splice(index, 1);
  c.guest = true;
  state.reserve.push(c);
}

export function takeGuest(state: GameState, id: string, factory: () => Character): Character {
  const existing = state.reserve.findIndex((c) => c.id === id);
  const guest = existing >= 0 ? state.reserve.splice(existing, 1)[0] : factory();
  guest.dead = false;
  if (guest.hp <= 0) guest.hp = guest.maxHp;
  guest.mp = guest.maxMp;
  guest.statuses = [];
  guest.buffs = [];
  if (!state.party.some((c) => c.id === id)) state.party.push(guest);
  return guest;
}

export function removeFromPlay(state: GameState, id: string, fallen: boolean): void {
  state.party = state.party.filter((c) => c.id !== id);
  state.reserve = state.reserve.filter((c) => c.id !== id);
  if (fallen && !state.fallen.includes(id)) state.fallen.push(id);
}

export function bumpSkill(c: Character, skill: string, uses: number, reports: string[]): void {
  if (uses <= 0) return;
  if (!c.skills[skill]) c.skills[skill] = { rank: 0, progress: 0 };
  const rec = c.skills[skill];
  rec.progress += uses;
  while (rec.progress >= USES_PER_RANK && rec.rank < RANK_CAP) {
    rec.progress -= USES_PER_RANK;
    rec.rank += 1;
    reports.push(`${c.name}'s ${skillLabel(skill)} rose to ${rec.rank}.`);
  }
  if (rec.rank >= RANK_CAP) rec.progress = 0;
}

function bumpPair(
  c: Character,
  progressKey: 'attackProg' | 'hitTakenProg' | 'whiteProg' | 'blackProg',
  amount: number,
  apply: () => void,
): void {
  if (amount <= 0) return;
  c[progressKey] += amount;
  while (c[progressKey] >= STAT_STEP) {
    c[progressKey] -= STAT_STEP;
    apply();
  }
}

export function applyBattleGrowth(state: GameState, battle: BattleState): string[] {
  const reports: string[] = [];
  for (const c of state.party) {
    const uses = battle.skillUses[c.id] ?? {};
    for (const [skill, n] of Object.entries(uses)) bumpSkill(c, skill, n, reports);
    bumpPair(c, 'attackProg', battle.hitsLanded[c.id] ?? 0, () => {
      c.str += 1;
      c.acc += 1;
      reports.push(`${c.name}'s strength rose to ${c.str}.`);
      reports.push(`${c.name}'s accuracy rose to ${c.acc}.`);
    });
    bumpPair(c, 'hitTakenProg', battle.hitsTaken[c.id] ?? 0, () => {
      c.sta += 1;
      c.eva += 1;
      reports.push(`${c.name}'s stamina rose to ${c.sta}.`);
      reports.push(`${c.name}'s evasion rose to ${c.eva}.`);
    });
    bumpPair(c, 'whiteProg', battle.whiteCasts[c.id] ?? 0, () => {
      c.spi += 1;
      reports.push(`${c.name}'s spirit rose to ${c.spi}.`);
    });
    bumpPair(c, 'blackProg', battle.blackCasts[c.id] ?? 0, () => {
      c.int += 1;
      reports.push(`${c.name}'s intelligence rose to ${c.int}.`);
    });
    const lost = battle.hpLost[c.id] ?? 0;
    if (c.maxHp > 0 && lost / c.maxHp >= SUBSTANTIAL) {
      const gain = Math.min(25, Math.max(4, Math.floor(lost * 0.2)));
      c.maxHp += gain;
      c.hp = Math.min(c.maxHp, c.hp + gain);
      reports.push(`${c.name}'s Max HP rose to ${c.maxHp}.`);
    }
    const spent = battle.mpSpent[c.id] ?? 0;
    if (c.maxMp > 0 && spent / c.maxMp >= SUBSTANTIAL) {
      const gain = Math.min(15, Math.max(2, Math.floor(spent * 0.25)));
      c.maxMp += gain;
      c.mag += 1;
      reports.push(`${c.name}'s Max MP rose to ${c.maxMp}.`);
      reports.push(`${c.name}'s magic power rose to ${c.mag}.`);
    }
  }
  return reports;
}

export function healLiving(state: GameState, fullMp = true): void {
  for (const c of state.party) {
    if (c.dead) continue;
    c.hp = c.maxHp;
    if (fullMp) c.mp = c.maxMp;
    c.statuses = c.statuses.filter((s) => s.id === 'stone' || s.id === 'toad');
    c.buffs = [];
  }
}

export function contentCounts() {
  return {
    spells: SPELLS.length,
    weapons: WEAPONS.length,
    armor: ARMOR.length,
    consumables: CONSUMABLES.length,
    keyItems: KEY_ITEMS.length,
  };
}

export function itemCureList(itemId: string): StatusId[] {
  return ITEM_CURE[itemId] ?? [];
}

export function spellCost(spellId: string, rank: number): number {
  const spell = SPELL_BY_ID[spellId];
  if (!spell) return 99;
  return spell.baseCost + Math.max(0, rank - 1);
}

export function weaponSkillOf(itemId: string | null): WeaponSkill | 'unarmed' {
  const item = gear(itemId);
  if (!item || item.kind !== 'weapon' || !item.skill) return 'unarmed';
  return item.skill;
}
