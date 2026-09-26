/** Source-faithful content tables for Oath of the Rose. */

export const KEYWORDS = [
  'wild-rose',
  'mythril',
  'dreadnought',
  'airship',
  'sunfire',
  'goddess-bell',
  'dragoons',
  'wyverns',
  'mysidia',
  'mask',
  'ekmet-teloess',
  'cyclone',
  'palamecia',
  'ultima-tome',
  'jade-passage',
] as const;

export type KeywordId = (typeof KEYWORDS)[number];

export const KEYWORD_LABEL: Record<KeywordId, string> = {
  'wild-rose': 'Wild Rose',
  mythril: 'Mythril',
  dreadnought: 'Dreadnought',
  airship: 'Airship',
  sunfire: 'Sunfire',
  'goddess-bell': "Goddess's Bell",
  dragoons: 'Dragoons',
  wyverns: 'Wyverns',
  mysidia: 'Mysidia',
  mask: 'Mask',
  'ekmet-teloess': 'Ekmet Teloess',
  cyclone: 'Cyclone',
  palamecia: 'Palamecia',
  'ultima-tome': 'Ultima Tome',
  'jade-passage': 'Jade Passage',
};

export type StatusId =
  | 'poison'
  | 'sleep'
  | 'silence'
  | 'mini'
  | 'toad'
  | 'stone'
  | 'death'
  | 'blind'
  | 'stun'
  | 'amnesia';

export type School = 'white' | 'black' | 'ancient';
export type Element = 'fire' | 'ice' | 'bolt' | 'holy' | 'water' | 'none';

export interface SpellDef {
  id: string;
  name: string;
  school: School;
  kind: 'heal' | 'life' | 'cleanse' | 'buff' | 'damage' | 'status' | 'drain' | 'osmose' | 'dispel' | 'field' | 'special';
  element: Element;
  power: number;
  baseCost: number;
  status?: StatusId;
  target: 'ally' | 'enemy' | 'any' | 'all-ally' | 'all-enemy' | 'self';
  price: number;
  shops: string[];
}

function spell(partial: SpellDef): SpellDef {
  return partial;
}

export const SPELLS: SpellDef[] = [
  spell({ id: 'cure', name: 'Cure', school: 'white', kind: 'heal', element: 'none', power: 20, baseCost: 3, target: 'ally', price: 100, shops: ['altair', 'paloom', 'poft', 'mysidia'] }),
  spell({ id: 'life', name: 'Life', school: 'white', kind: 'life', element: 'holy', power: 10, baseCost: 8, target: 'any', price: 800, shops: ['salamand', 'mysidia'] }),
  spell({ id: 'basuna', name: 'Basuna', school: 'white', kind: 'cleanse', element: 'none', power: 0, baseCost: 4, target: 'ally', price: 400, shops: ['bafsk', 'mysidia'] }),
  spell({ id: 'esuna', name: 'Esuna', school: 'white', kind: 'cleanse', element: 'none', power: 0, baseCost: 6, target: 'ally', price: 600, shops: ['fynn', 'mysidia'] }),
  spell({ id: 'blink', name: 'Blink', school: 'white', kind: 'buff', element: 'none', power: 8, baseCost: 3, target: 'ally', price: 300, shops: ['paloom', 'poft'] }),
  spell({ id: 'protect', name: 'Protect', school: 'white', kind: 'buff', element: 'none', power: 8, baseCost: 3, target: 'ally', price: 300, shops: ['paloom', 'poft'] }),
  spell({ id: 'shell', name: 'Shell', school: 'white', kind: 'buff', element: 'none', power: 8, baseCost: 3, target: 'ally', price: 300, shops: ['paloom', 'poft'] }),
  spell({ id: 'barrier', name: 'Barrier', school: 'white', kind: 'buff', element: 'none', power: 6, baseCost: 6, target: 'ally', price: 1500, shops: ['mysidia'] }),
  spell({ id: 'wall', name: 'Wall', school: 'white', kind: 'buff', element: 'none', power: 6, baseCost: 6, target: 'self', price: 1500, shops: ['mysidia'] }),
  spell({ id: 'silence', name: 'Silence', school: 'white', kind: 'status', element: 'none', power: 0, baseCost: 4, status: 'silence', target: 'enemy', price: 400, shops: ['bafsk'] }),
  spell({ id: 'mini', name: 'Mini', school: 'white', kind: 'status', element: 'none', power: 0, baseCost: 6, status: 'mini', target: 'enemy', price: 800, shops: ['fynn'] }),
  spell({ id: 'fog', name: 'Fog', school: 'white', kind: 'status', element: 'none', power: 0, baseCost: 5, status: 'amnesia', target: 'enemy', price: 700, shops: ['fynn'] }),
  spell({ id: 'dispel', name: 'Dispel', school: 'white', kind: 'dispel', element: 'none', power: 0, baseCost: 4, target: 'any', price: 700, shops: ['fynn'] }),
  spell({ id: 'slow', name: 'Slow', school: 'white', kind: 'buff', element: 'none', power: 0, baseCost: 5, target: 'enemy', price: 700, shops: ['fynn'] }),
  spell({ id: 'sap', name: 'Sap', school: 'white', kind: 'osmose', element: 'none', power: 8, baseCost: 4, target: 'enemy', price: 500, shops: ['salamand'] }),
  spell({ id: 'fear', name: 'Fear', school: 'white', kind: 'status', element: 'none', power: 0, baseCost: 4, target: 'enemy', price: 400, shops: ['bafsk'] }),
  spell({ id: 'teleport', name: 'Teleport', school: 'white', kind: 'field', element: 'none', power: 0, baseCost: 6, target: 'self', price: 800, shops: ['salamand', 'mysidia'] }),
  spell({ id: 'holy', name: 'Holy', school: 'white', kind: 'damage', element: 'holy', power: 40, baseCost: 12, target: 'enemy', price: 4000, shops: ['mysidia'] }),
  spell({ id: 'swap', name: 'Swap', school: 'white', kind: 'special', element: 'none', power: 0, baseCost: 8, target: 'enemy', price: 2000, shops: ['mysidia'] }),
  spell({ id: 'ultima', name: 'Ultima', school: 'ancient', kind: 'damage', element: 'none', power: 70, baseCost: 20, target: 'all-enemy', price: 0, shops: [] }),
  spell({ id: 'fire', name: 'Fire', school: 'black', kind: 'damage', element: 'fire', power: 18, baseCost: 3, target: 'enemy', price: 150, shops: ['altair', 'mysidia'] }),
  spell({ id: 'ice', name: 'Ice', school: 'black', kind: 'damage', element: 'ice', power: 18, baseCost: 3, target: 'enemy', price: 150, shops: ['altair', 'mysidia'] }),
  spell({ id: 'bolt', name: 'Bolt', school: 'black', kind: 'damage', element: 'bolt', power: 18, baseCost: 3, target: 'enemy', price: 150, shops: ['altair', 'mysidia'] }),
  spell({ id: 'poison', name: 'Poison', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 3, status: 'poison', target: 'any', price: 300, shops: ['bafsk'] }),
  spell({ id: 'sleep', name: 'Sleep', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 4, status: 'sleep', target: 'any', price: 400, shops: ['mysidia'] }),
  spell({ id: 'blind', name: 'Blind', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 3, status: 'blind', target: 'enemy', price: 300, shops: ['mysidia'] }),
  spell({ id: 'stun', name: 'Stun', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 5, status: 'stun', target: 'enemy', price: 600, shops: ['deist'] }),
  spell({ id: 'toad', name: 'Toad', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 8, status: 'toad', target: 'any', price: 1200, shops: ['deist'] }),
  spell({ id: 'break', name: 'Break', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 8, status: 'stone', target: 'any', price: 1200, shops: ['deist', 'fynn'] }),
  spell({ id: 'death', name: 'Death', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 10, status: 'death', target: 'any', price: 2000, shops: ['jade'] }),
  spell({ id: 'drain', name: 'Drain', school: 'black', kind: 'drain', element: 'none', power: 14, baseCost: 5, target: 'enemy', price: 1500, shops: ['mysidia'] }),
  spell({ id: 'osmose', name: 'Osmose', school: 'black', kind: 'osmose', element: 'none', power: 10, baseCost: 1, target: 'enemy', price: 1500, shops: ['mysidia'] }),
  spell({ id: 'flare', name: 'Flare', school: 'black', kind: 'damage', element: 'none', power: 55, baseCost: 16, target: 'enemy', price: 5000, shops: ['jade'] }),
  spell({ id: 'warp', name: 'Warp', school: 'black', kind: 'field', element: 'none', power: 0, baseCost: 6, target: 'self', price: 800, shops: ['salamand'] }),
  spell({ id: 'aero', name: 'Aero', school: 'black', kind: 'damage', element: 'none', power: 16, baseCost: 3, target: 'all-enemy', price: 700, shops: ['fynn'] }),
  spell({ id: 'berserk', name: 'Berserk', school: 'black', kind: 'buff', element: 'none', power: 10, baseCost: 6, target: 'ally', price: 1500, shops: ['jade'] }),
  spell({ id: 'haste', name: 'Haste', school: 'black', kind: 'buff', element: 'none', power: 12, baseCost: 6, target: 'ally', price: 2000, shops: ['jade'] }),
  spell({ id: 'curse', name: 'Curse', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 5, status: 'blind', target: 'enemy', price: 800, shops: ['deist'] }),
  spell({ id: 'scourge', name: 'Scourge', school: 'black', kind: 'damage', element: 'none', power: 12, baseCost: 8, target: 'enemy', price: 2000, shops: ['jade'] }),
  spell({ id: 'aura', name: 'Aura', school: 'black', kind: 'buff', element: 'none', power: 8, baseCost: 5, target: 'ally', price: 2000, shops: ['fynn'] }),
  spell({ id: 'charm', name: 'Charm', school: 'black', kind: 'status', element: 'none', power: 0, baseCost: 6, status: 'stun', target: 'enemy', price: 2000, shops: ['mysidia'] }),
];

export const SPELL_BY_ID = Object.fromEntries(SPELLS.map((s) => [s.id, s]));

export type WeaponSkill = 'sword' | 'axe' | 'spear' | 'bow' | 'knife' | 'staff' | 'unarmed' | 'shield';

export interface GearDef {
  id: string;
  name: string;
  kind: 'weapon' | 'shield' | 'armor' | 'accessory' | 'consumable' | 'key' | 'tome';
  skill?: WeaponSkill;
  slot?: 'main' | 'off' | 'head' | 'body' | 'hands' | 'accessory';
  attack?: number;
  defense?: number;
  eva?: number;
  mag?: number;
  element?: Element;
  price: number;
  shops: string[];
  sellable: boolean;
  key?: boolean;
  effect?: string;
  origin: 'source' | 'addition';
}

function g(partial: GearDef): GearDef {
  return partial;
}

const W = (
  id: string,
  name: string,
  skill: WeaponSkill,
  attack: number,
  price: number,
  shops: string[],
  extra: Partial<GearDef> = {},
): GearDef =>
  g({ id, name, kind: 'weapon', skill, slot: 'main', attack, price, shops, sellable: true, origin: 'source', ...extra });

const A = (
  id: string,
  name: string,
  slot: 'head' | 'body' | 'hands',
  defense: number,
  price: number,
  shops: string[],
  extra: Partial<GearDef> = {},
): GearDef =>
  g({ id, name, kind: 'armor', slot, defense, price, shops, sellable: true, origin: 'source', ...extra });

export const GEAR: GearDef[] = [
  W('broadsword', 'Broadsword', 'sword', 8, 100, ['altair', 'gatrea']),
  W('longsword', 'Longsword', 'sword', 14, 400, ['salamand', 'bafsk']),
  W('mythril-sword', 'Mythril Sword', 'sword', 24, 1600, ['salamand'], { }),
  W('ancient-sword', 'Ancient Sword', 'sword', 28, 0, []),
  W('sleep-blade', 'Sleep Blade', 'sword', 22, 0, []),
  W('wing-sword', 'Wing Sword', 'sword', 32, 4000, ['fynn']),
  W('flame-sword', 'Flame Sword', 'sword', 36, 0, [], { element: 'fire' }),
  W('ice-brand', 'Ice Brand', 'sword', 36, 0, [], { element: 'ice' }),
  W('blood-sword', 'Blood Sword', 'sword', 40, 0, []),
  W('defender', 'Defender', 'sword', 30, 0, [], { defense: 4 }),
  W('sun-blade', 'Sun Blade', 'sword', 42, 0, [], { element: 'fire' }),
  W('excalibur', 'Excalibur', 'sword', 55, 0, [], { element: 'holy' }),
  W('masamune', 'Masamune', 'sword', 62, 0, []),
  W('hand-axe', 'Hand Axe', 'axe', 10, 200, ['gatrea', 'salamand']),
  W('battle-axe', 'Battle Axe', 'axe', 18, 700, ['salamand']),
  W('mythril-axe', 'Mythril Axe', 'axe', 26, 1800, ['salamand']),
  W('demon-axe', 'Demon Axe', 'axe', 34, 0, []),
  W('ogrekiller', 'Ogrekiller', 'axe', 38, 0, []),
  W('rune-axe', 'Rune Axe', 'axe', 44, 0, [], { mag: 4 }),
  W('javelin', 'Javelin', 'spear', 8, 150, ['altair', 'paloom']),
  W('spear', 'Spear', 'spear', 16, 600, ['bafsk']),
  W('mythril-spear', 'Mythril Spear', 'spear', 26, 1700, ['salamand']),
  W('trident', 'Trident', 'spear', 34, 3500, ['fynn']),
  W('flame-lance', 'Flame Lance', 'spear', 38, 0, [], { element: 'fire' }),
  W('ice-lance', 'Ice Lance', 'spear', 38, 0, [], { element: 'ice' }),
  W('holy-lance', 'Holy Lance', 'spear', 48, 0, [], { element: 'holy' }),
  W('shortbow', 'Shortbow', 'bow', 6, 80, ['altair', 'gatrea']),
  W('longbow', 'Longbow', 'bow', 12, 300, ['bafsk', 'salamand']),
  W('mythril-bow', 'Mythril Bow', 'bow', 22, 1400, ['paloom', 'poft']),
  W('dark-bow', 'Dark Bow', 'bow', 28, 0, []),
  W('flame-bow', 'Flame Bow', 'bow', 34, 4000, ['fynn'], { element: 'fire' }),
  W('ice-bow', 'Ice Bow', 'bow', 34, 0, [], { element: 'ice' }),
  W('knife', 'Knife', 'knife', 6, 80, ['altair', 'gatrea']),
  W('dagger', 'Dagger', 'knife', 12, 350, ['paloom', 'poft']),
  W('mythril-knife', 'Mythril Knife', 'knife', 20, 900, ['salamand']),
  W('main-gauche', 'Main Gauche', 'knife', 18, 0, [], { eva: 4 }),
  W('orichalcum', 'Orichalcum', 'knife', 30, 0, []),
  W('cat-claws', 'Cat Claws', 'knife', 26, 0, []),
  W('staff', 'Staff', 'staff', 4, 80, ['altair'], { mag: 2 }),
  W('mace', 'Mace', 'staff', 10, 400, ['salamand'], { mag: 2 }),
  W('mythril-mace', 'Mythril Mace', 'staff', 16, 1200, ['salamand'], { mag: 4 }),
  W('werebuster', 'Werebuster', 'staff', 22, 2500, ['fynn'], { mag: 4 }),
  W('mage-staff', 'Mage Staff', 'staff', 12, 0, [], { mag: 8 }),
  W('healing-staff', 'Healing Staff', 'staff', 8, 0, [], { mag: 6 }),
  W('power-staff', 'Power Staff', 'staff', 20, 0, [], { mag: 6 }),
  W('wizard-staff', 'Wizard Staff', 'staff', 18, 0, [], { mag: 12 }),
  W('diamond-mace', 'Diamond Mace', 'staff', 28, 0, [], { mag: 8 }),
  g({ id: 'buckler', name: 'Buckler', kind: 'shield', skill: 'shield', slot: 'off', defense: 2, eva: 2, price: 50, shops: ['altair', 'gatrea'], sellable: true, origin: 'source' }),
  g({ id: 'bronze-shield', name: 'Bronze Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 4, eva: 2, price: 200, shops: ['paloom', 'poft', 'salamand'], sellable: true, origin: 'source' }),
  g({ id: 'mythril-shield', name: 'Mythril Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 8, eva: 3, price: 800, shops: ['salamand'], sellable: true, origin: 'source' }),
  g({ id: 'golden-shield', name: 'Golden Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 10, eva: 3, price: 1500, shops: ['fynn'], sellable: true, origin: 'source' }),
  g({ id: 'ice-shield', name: 'Ice Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 12, eva: 3, price: 4000, shops: ['mysidia'], sellable: true, element: 'ice', origin: 'source' }),
  g({ id: 'flame-shield', name: 'Flame Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 12, eva: 3, price: 4000, shops: ['mysidia'], sellable: true, element: 'fire', origin: 'source' }),
  g({ id: 'diamond-shield', name: 'Diamond Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 16, eva: 4, price: 8000, shops: ['mysidia'], sellable: true, origin: 'source' }),
  g({ id: 'aegis-shield', name: 'Aegis Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 18, eva: 6, price: 0, shops: [], sellable: true, origin: 'source' }),
  g({ id: 'dragon-shield', name: 'Dragon Shield', kind: 'shield', skill: 'shield', slot: 'off', defense: 20, eva: 4, price: 0, shops: [], sellable: true, origin: 'source' }),
  A('clothes', 'Clothes', 'body', 1, 10, ['altair']),
  A('leather-armor', 'Leather Armor', 'body', 4, 100, ['gatrea', 'altair']),
  A('copper-cuirass', 'Copper Cuirass', 'body', 8, 300, ['paloom', 'poft']),
  A('silver-cuirass', 'Silver Cuirass', 'body', 14, 800, ['bafsk']),
  A('mythril-armor', 'Mythril Armor', 'body', 20, 1500, ['salamand']),
  A('golden-armor', 'Golden Armor', 'body', 24, 3000, ['fynn']),
  A('knight-armor', 'Knight Armor', 'body', 30, 0, []),
  A('flame-armor', 'Flame Armor', 'body', 28, 0, [], { element: 'fire' }),
  A('ice-armor', 'Ice Armor', 'body', 28, 0, [], { element: 'ice' }),
  A('diamond-cuirass', 'Diamond Cuirass', 'body', 36, 0, []),
  A('dragon-armor', 'Dragon Armor', 'body', 40, 0, []),
  A('black-garb', 'Black Garb', 'body', 22, 2500, ['mysidia'], { eva: 6 }),
  A('power-vest', 'Power Vest', 'body', 16, 0, []),
  A('white-robe', 'White Robe', 'body', 12, 2000, ['mysidia'], { mag: 6 }),
  A('leather-cap', 'Leather Cap', 'head', 2, 40, ['altair', 'gatrea']),
  A('bronze-helm', 'Bronze Helm', 'head', 5, 200, ['paloom', 'salamand']),
  A('mythril-helm', 'Mythril Helm', 'head', 10, 700, ['salamand']),
  A('golden-helm', 'Golden Helm', 'head', 12, 1200, ['fynn']),
  A('giant-helm', "Giant's Helm", 'head', 16, 0, []),
  A('flame-helm', 'Flame Helm', 'head', 14, 0, [], { element: 'fire' }),
  A('ice-helm', 'Ice Helm', 'head', 14, 0, [], { element: 'ice' }),
  A('diamond-helm', 'Diamond Helm', 'head', 20, 0, []),
  A('gold-hairpin', 'Gold Hairpin', 'head', 4, 600, ['mysidia'], { eva: 8, element: 'bolt' }),
  A('leather-gloves', 'Leather Gloves', 'hands', 1, 30, ['altair', 'gatrea']),
  A('bronze-gauntlets', 'Bronze Gauntlets', 'hands', 4, 200, ['paloom', 'salamand']),
  A('mythril-gloves', 'Mythril Gloves', 'hands', 8, 600, ['salamand']),
  A('giant-gloves', "Giant's Gloves", 'hands', 12, 0, []),
  A('flame-gloves', 'Flame Gloves', 'hands', 10, 0, [], { element: 'fire' }),
  A('ice-gloves', 'Ice Gloves', 'hands', 10, 0, [], { element: 'ice' }),
  A('diamond-gloves', 'Diamond Gloves', 'hands', 14, 0, []),
  A('thief-gloves', "Thief's Gloves", 'hands', 6, 1000, ['mysidia'], { eva: 8 }),
  g({ id: 'rebel-armband', name: 'Rebel Armband', kind: 'accessory', slot: 'accessory', defense: 0, eva: 8, price: 0, shops: [], sellable: true, origin: 'addition' }),
  g({ id: 'potion', name: 'Potion', kind: 'consumable', price: 30, shops: ['altair', 'gatrea', 'paloom', 'poft', 'salamand', 'bafsk', 'fynn', 'mysidia'], sellable: true, effect: 'heal-50', origin: 'source' }),
  g({ id: 'hi-potion', name: 'Hi-Potion', kind: 'consumable', price: 150, shops: ['paloom', 'poft', 'salamand', 'bafsk', 'fynn', 'mysidia'], sellable: true, effect: 'heal-200', origin: 'source' }),
  g({ id: 'ether', name: 'Ether', kind: 'consumable', price: 200, shops: ['poft', 'fynn', 'mysidia'], sellable: true, effect: 'mp-40', origin: 'source' }),
  g({ id: 'elixir', name: 'Elixir', kind: 'consumable', price: 2000, shops: ['mysidia'], sellable: true, effect: 'full', origin: 'source' }),
  g({ id: 'phoenix-down', name: 'Phoenix Down', kind: 'consumable', price: 400, shops: ['altair', 'paloom', 'fynn', 'mysidia'], sellable: true, effect: 'cure-death', origin: 'source' }),
  g({ id: 'antidote', name: 'Antidote', kind: 'consumable', price: 20, shops: ['altair', 'paloom', 'salamand', 'fynn', 'mysidia'], sellable: true, effect: 'cure-poison', origin: 'source' }),
  g({ id: 'eye-drops', name: 'Eye Drops', kind: 'consumable', price: 20, shops: ['altair', 'fynn', 'mysidia'], sellable: true, effect: 'cure-blind', origin: 'source' }),
  g({ id: 'echo-screen', name: 'Echo Screen', kind: 'consumable', price: 80, shops: ['bafsk', 'fynn', 'mysidia'], sellable: true, effect: 'cure-silence', origin: 'source' }),
  g({ id: 'mallet', name: 'Mallet', kind: 'consumable', price: 100, shops: ['fynn', 'mysidia'], sellable: true, effect: 'cure-mini', origin: 'source' }),
  g({ id: 'maidens-kiss', name: "Maiden's Kiss", kind: 'consumable', price: 100, shops: ['fynn', 'mysidia'], sellable: true, effect: 'cure-toad', origin: 'source' }),
  g({ id: 'gold-needle', name: 'Gold Needle', kind: 'consumable', price: 120, shops: ['fynn', 'mysidia'], sellable: true, effect: 'cure-stone', origin: 'source' }),
  g({ id: 'alarm-clock', name: 'Alarm Clock', kind: 'consumable', price: 40, shops: ['altair', 'paloom', 'fynn'], sellable: true, effect: 'cure-sleep', origin: 'addition' }),
  g({ id: 'unicorn-horn', name: 'Unicorn Horn', kind: 'consumable', price: 400, shops: ['mysidia'], sellable: true, effect: 'cure-many', origin: 'source' }),
  g({ id: 'cottage', name: 'Cottage', kind: 'consumable', price: 250, shops: ['poft', 'fynn', 'mysidia'], sellable: true, effect: 'field-full', origin: 'source' }),
  g({ id: 'cross', name: 'Cross', kind: 'consumable', price: 100, shops: ['fynn'], sellable: true, effect: 'smite-undead', origin: 'source' }),
  g({ id: 'bacchus-wine', name: "Bacchus' Wine", kind: 'consumable', price: 200, shops: ['bafsk'], sellable: true, effect: 'buff-berserk', origin: 'source' }),
  g({ id: 'hermes-shoes', name: "Hermes' Shoes", kind: 'consumable', price: 300, shops: ['fynn'], sellable: true, effect: 'buff-haste', origin: 'source' }),
  g({ id: 'spider-silk', name: "Spider's Silk", kind: 'consumable', price: 200, shops: ['mysidia'], sellable: true, effect: 'inflict-slow', origin: 'source' }),
  g({ id: 'hourglass', name: 'Hourglass', kind: 'consumable', price: 250, shops: ['mysidia'], sellable: true, effect: 'inflict-stun', origin: 'source' }),
  g({ id: 'mythril', name: 'Mythril', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'goddess-bell', name: "Goddess's Bell", kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'egils-torch', name: "Egil's Torch", kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'sunfire', name: 'Sunfire', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'pass', name: 'Imperial Pass', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'ring', name: "Scott's Ring", kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'white-mask', name: 'White Mask', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'black-mask', name: 'Black Mask', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'pendant', name: 'Dragoon Pendant', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'wyvern-egg', name: 'Wyvern Egg', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'ultima-tome', name: 'Ultima Tome', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'source' }),
  g({ id: 'sealed-dispatch', name: 'Sealed Dispatch', kind: 'key', price: 0, shops: [], sellable: false, key: true, origin: 'addition' }),
  ...SPELLS.filter((s) => s.id !== 'ultima').map((s) =>
    g({
      id: `tome-${s.id}`,
      name: `${s.name} Tome`,
      kind: 'tome',
      price: s.price,
      shops: s.shops,
      sellable: true,
      effect: `teach-${s.id}`,
      origin: 'source' as const,
    }),
  ),
];

export const GEAR_BY_ID = Object.fromEntries(GEAR.map((item) => [item.id, item]));

export const WEAPONS = GEAR.filter((item) => item.kind === 'weapon');
export const ARMOR = GEAR.filter((item) => item.kind === 'armor' || item.kind === 'shield' || item.kind === 'accessory');
export const CONSUMABLES = GEAR.filter((item) => item.kind === 'consumable' || item.kind === 'tome');
export const KEY_ITEMS = GEAR.filter((item) => item.kind === 'key');

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  atk: number;
  def: number;
  mdef: number;
  agi: number;
  eva: number;
  gil: number;
  element?: Element;
  weak?: Element;
  resist?: Element;
  tags: string[];
  ranged?: boolean;
  strike?: 'one' | 'all';
  spells?: string[];
  statusImmune?: StatusId[];
  rank: 'front' | 'back';
}

function enemy(partial: EnemyDef): EnemyDef {
  return partial;
}

export const ENEMIES: EnemyDef[] = [
  enemy({ id: 'leg-eater', name: 'Leg Eater', hp: 22, atk: 7, def: 2, mdef: 2, agi: 6, eva: 2, gil: 12, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'hornet', name: 'Hornet', hp: 16, atk: 6, def: 1, mdef: 1, agi: 12, eva: 4, gil: 8, tags: ['flying'], rank: 'front', ranged: true }),
  enemy({ id: 'queen-bee', name: 'Queen Bee', hp: 48, atk: 12, def: 4, mdef: 4, agi: 10, eva: 4, gil: 40, tags: ['flying'], rank: 'back', ranged: true }),
  enemy({ id: 'snowman', name: 'Snowman', hp: 70, atk: 16, def: 6, mdef: 4, agi: 4, eva: 0, gil: 45, tags: ['beast'], element: 'ice', weak: 'fire', rank: 'front' }),
  enemy({ id: 'sasquatch', name: 'Sasquatch', hp: 110, atk: 22, def: 8, mdef: 4, agi: 6, eva: 0, gil: 80, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'icicle', name: 'Icicle', hp: 40, atk: 14, def: 10, mdef: 6, agi: 4, eva: 0, gil: 30, tags: ['elemental'], element: 'ice', weak: 'fire', rank: 'front' }),
  enemy({ id: 'sprinter', name: 'Sprinter', hp: 36, atk: 11, def: 3, mdef: 2, agi: 16, eva: 6, gil: 22, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'goblin', name: 'Goblin', hp: 28, atk: 9, def: 3, mdef: 2, agi: 7, eva: 2, gil: 15, tags: ['humanoid'], rank: 'front' }),
  enemy({ id: 'goblin-guard', name: 'Goblin Guard', hp: 46, atk: 13, def: 6, mdef: 3, agi: 6, eva: 2, gil: 28, tags: ['humanoid'], rank: 'front' }),
  enemy({ id: 'goblin-prince', name: 'Goblin Prince', hp: 90, atk: 18, def: 8, mdef: 6, agi: 10, eva: 4, gil: 70, tags: ['humanoid'], rank: 'front' }),
  enemy({ id: 'green-slime', name: 'Green Slime', hp: 30, atk: 8, def: 2, mdef: 8, agi: 3, eva: 0, gil: 10, tags: ['slime'], weak: 'fire', rank: 'front' }),
  enemy({ id: 'yellow-jelly', name: 'Yellow Jelly', hp: 55, atk: 12, def: 4, mdef: 10, agi: 3, eva: 0, gil: 35, tags: ['slime'], weak: 'fire', rank: 'front' }),
  enemy({ id: 'red-mousse', name: 'Red Mousse', hp: 80, atk: 16, def: 6, mdef: 12, agi: 4, eva: 0, gil: 55, tags: ['slime'], element: 'fire', weak: 'ice', rank: 'front' }),
  enemy({ id: 'skeleton', name: 'Skeleton', hp: 40, atk: 12, def: 4, mdef: 2, agi: 6, eva: 2, gil: 20, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'ghoul', name: 'Ghoul', hp: 55, atk: 14, def: 4, mdef: 3, agi: 5, eva: 1, gil: 24, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'shadow', name: 'Shadow', hp: 48, atk: 15, def: 2, mdef: 8, agi: 14, eva: 8, gil: 30, tags: ['undead'], weak: 'holy', rank: 'back', ranged: true }),
  enemy({ id: 'wraith', name: 'Wraith', hp: 90, atk: 20, def: 6, mdef: 12, agi: 12, eva: 6, gil: 70, tags: ['undead'], weak: 'holy', rank: 'back', spells: ['poison'] }),
  enemy({ id: 'specter', name: 'Specter', hp: 70, atk: 16, def: 4, mdef: 14, agi: 13, eva: 8, gil: 48, tags: ['undead'], weak: 'holy', rank: 'back', ranged: true }),
  enemy({ id: 'revenant', name: 'Revenant', hp: 130, atk: 26, def: 10, mdef: 8, agi: 8, eva: 2, gil: 90, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'zombie', name: 'Zombie', hp: 60, atk: 13, def: 5, mdef: 2, agi: 3, eva: 0, gil: 18, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'ghast', name: 'Ghast', hp: 75, atk: 18, def: 5, mdef: 6, agi: 9, eva: 3, gil: 40, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'ogre', name: 'Ogre', hp: 120, atk: 24, def: 8, mdef: 3, agi: 4, eva: 0, gil: 60, tags: ['giant'], rank: 'front' }),
  enemy({ id: 'ogre-mage', name: 'Ogre Mage', hp: 100, atk: 18, def: 6, mdef: 12, agi: 8, eva: 2, gil: 80, tags: ['giant'], rank: 'back', spells: ['fire', 'ice'] }),
  enemy({ id: 'hill-gigas', name: 'Hill Gigas', hp: 220, atk: 32, def: 12, mdef: 6, agi: 5, eva: 0, gil: 150, tags: ['giant'], rank: 'front' }),
  enemy({ id: 'ice-gigas', name: 'Ice Gigas', hp: 260, atk: 34, def: 14, mdef: 8, agi: 5, eva: 0, gil: 180, tags: ['giant'], element: 'ice', weak: 'fire', rank: 'front' }),
  enemy({ id: 'fire-gigas', name: 'Fire Gigas', hp: 260, atk: 36, def: 12, mdef: 8, agi: 6, eva: 0, gil: 180, tags: ['giant'], element: 'fire', weak: 'ice', rank: 'front' }),
  enemy({ id: 'thunder-gigas', name: 'Thunder Gigas', hp: 280, atk: 38, def: 14, mdef: 10, agi: 7, eva: 0, gil: 200, tags: ['giant'], element: 'bolt', weak: 'water', rank: 'front' }),
  enemy({ id: 'bomb', name: 'Bomb', hp: 50, atk: 20, def: 4, mdef: 6, agi: 8, eva: 2, gil: 35, tags: ['elemental'], element: 'fire', weak: 'ice', rank: 'front' }),
  enemy({ id: 'grenade', name: 'Grenade', hp: 80, atk: 28, def: 6, mdef: 6, agi: 7, eva: 2, gil: 55, tags: ['elemental'], element: 'fire', weak: 'ice', rank: 'front' }),
  enemy({ id: 'mine', name: 'Mine', hp: 40, atk: 30, def: 2, mdef: 2, agi: 4, eva: 0, gil: 25, tags: ['elemental'], element: 'fire', rank: 'front' }),
  enemy({ id: 'soldier', name: 'Soldier', hp: 36, atk: 11, def: 6, mdef: 3, agi: 7, eva: 2, gil: 18, tags: ['imperial'], rank: 'front' }),
  enemy({ id: 'captain', name: 'Captain', hp: 90, atk: 18, def: 10, mdef: 6, agi: 8, eva: 3, gil: 60, tags: ['imperial'], rank: 'front' }),
  enemy({ id: 'sergeant', name: 'Sergeant', hp: 140, atk: 20, def: 10, mdef: 6, agi: 8, eva: 2, gil: 180, tags: ['imperial', 'boss'], rank: 'front' }),
  enemy({ id: 'black-knight', name: 'Black Knight', hp: 160, atk: 26, def: 14, mdef: 8, agi: 9, eva: 3, gil: 100, tags: ['imperial'], rank: 'front' }),
  enemy({ id: 'general', name: 'General', hp: 240, atk: 30, def: 16, mdef: 10, agi: 8, eva: 3, gil: 200, tags: ['imperial'], rank: 'front' }),
  enemy({ id: 'royal-guard', name: 'Royal Guard', hp: 300, atk: 34, def: 20, mdef: 12, agi: 10, eva: 4, gil: 220, tags: ['imperial'], rank: 'front' }),
  enemy({ id: 'sorcerer', name: 'Sorcerer', hp: 80, atk: 10, def: 4, mdef: 14, agi: 12, eva: 4, gil: 70, tags: ['mage'], rank: 'back', spells: ['fire', 'bolt', 'sleep'], ranged: true }),
  enemy({ id: 'wizard', name: 'Wizard', hp: 90, atk: 8, def: 4, mdef: 16, agi: 10, eva: 3, gil: 75, tags: ['mage'], rank: 'back', spells: ['ice', 'poison'], ranged: true }),
  enemy({ id: 'magician', name: 'Magician', hp: 70, atk: 8, def: 3, mdef: 12, agi: 11, eva: 4, gil: 50, tags: ['mage'], rank: 'back', spells: ['fire'], ranged: true }),
  enemy({ id: 'dark-mage', name: 'Dark Mage', hp: 140, atk: 12, def: 6, mdef: 18, agi: 12, eva: 4, gil: 120, tags: ['mage'], rank: 'back', spells: ['death', 'break', 'flare'], ranged: true }),
  enemy({ id: 'werepanther', name: 'Werepanther', hp: 85, atk: 20, def: 6, mdef: 4, agi: 16, eva: 8, gil: 55, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'wild-horn', name: 'Wild Horn', hp: 100, atk: 22, def: 8, mdef: 3, agi: 8, eva: 2, gil: 48, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'big-horn', name: 'Big Horn', hp: 210, atk: 30, def: 12, mdef: 6, agi: 7, eva: 2, gil: 140, tags: ['beast', 'boss'], rank: 'front' }),
  enemy({ id: 'land-turtle', name: 'Land Turtle', hp: 180, atk: 16, def: 22, mdef: 8, agi: 2, eva: 0, gil: 90, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'adamantoise', name: 'Adamantoise', hp: 320, atk: 28, def: 24, mdef: 10, agi: 2, eva: 0, gil: 200, tags: ['beast', 'boss'], rank: 'front' }),
  enemy({ id: 'basilisk', name: 'Basilisk', hp: 130, atk: 22, def: 10, mdef: 8, agi: 7, eva: 2, gil: 80, tags: ['beast'], rank: 'front', spells: ['break'] }),
  enemy({ id: 'cockatrice', name: 'Cockatrice', hp: 110, atk: 20, def: 8, mdef: 8, agi: 12, eva: 4, gil: 75, tags: ['beast', 'flying'], rank: 'front', spells: ['break'] }),
  enemy({ id: 'chimera', name: 'Chimera', hp: 280, atk: 32, def: 12, mdef: 10, agi: 10, eva: 3, gil: 220, tags: ['beast', 'boss'], rank: 'front', spells: ['fire'] }),
  enemy({ id: 'lamia', name: 'Lamia', hp: 140, atk: 22, def: 8, mdef: 10, agi: 12, eva: 6, gil: 90, tags: ['humanoid'], rank: 'front', spells: ['sleep', 'charm'] }),
  enemy({ id: 'lamia-queen', name: 'Lamia Queen', hp: 420, atk: 34, def: 14, mdef: 16, agi: 14, eva: 8, gil: 500, tags: ['humanoid', 'boss'], rank: 'front', spells: ['sleep', 'charm', 'toad'] }),
  enemy({ id: 'behemoth', name: 'Behemoth', hp: 480, atk: 40, def: 16, mdef: 8, agi: 6, eva: 0, gil: 400, tags: ['beast', 'boss'], rank: 'front' }),
  enemy({ id: 'roundworm', name: 'Roundworm', hp: 360, atk: 30, def: 12, mdef: 8, agi: 6, eva: 0, gil: 300, tags: ['beast', 'boss'], rank: 'front' }),
  enemy({ id: 'sand-worm', name: 'Sand Worm', hp: 200, atk: 28, def: 10, mdef: 6, agi: 6, eva: 0, gil: 100, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'dual-heads', name: 'Dual Heads', hp: 160, atk: 26, def: 10, mdef: 8, agi: 8, eva: 2, gil: 95, tags: ['beast'], rank: 'front', strike: 'all' }),
  enemy({ id: 'parasite', name: 'Parasite', hp: 70, atk: 16, def: 4, mdef: 6, agi: 10, eva: 4, gil: 40, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'red-soul', name: 'Red Soul', hp: 240, atk: 28, def: 8, mdef: 16, agi: 12, eva: 6, gil: 250, tags: ['undead', 'boss'], weak: 'holy', rank: 'back', spells: ['fire', 'drain'], ranged: true }),
  enemy({ id: 'splinter', name: 'Splinter', hp: 64, atk: 14, def: 6, mdef: 4, agi: 8, eva: 2, gil: 28, tags: ['plant'], weak: 'fire', rank: 'front' }),
  enemy({ id: 'wood-golem', name: 'Wood Golem', hp: 150, atk: 22, def: 12, mdef: 4, agi: 3, eva: 0, gil: 70, tags: ['construct'], weak: 'fire', rank: 'front' }),
  enemy({ id: 'stone-golem', name: 'Stone Golem', hp: 220, atk: 26, def: 20, mdef: 8, agi: 2, eva: 0, gil: 110, tags: ['construct'], rank: 'front' }),
  enemy({ id: 'mythril-golem', name: 'Mythril Golem', hp: 340, atk: 36, def: 24, mdef: 12, agi: 4, eva: 0, gil: 240, tags: ['construct'], rank: 'front' }),
  enemy({ id: 'borghen', name: 'Borghen', hp: 260, atk: 26, def: 12, mdef: 8, agi: 9, eva: 3, gil: 400, tags: ['imperial', 'boss'], rank: 'front' }),
  enemy({ id: 'zombie-borghen', name: 'Zombie Borghen', hp: 480, atk: 38, def: 14, mdef: 10, agi: 8, eva: 2, gil: 10, tags: ['undead', 'boss'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'gottos', name: 'Gottos', hp: 520, atk: 40, def: 18, mdef: 12, agi: 10, eva: 4, gil: 600, tags: ['imperial', 'boss'], rank: 'front' }),
  enemy({ id: 'emperor', name: 'Emperor of Palamecia', hp: 520, atk: 36, def: 14, mdef: 14, agi: 12, eva: 4, gil: 0, tags: ['imperial', 'boss'], rank: 'front', spells: ['flare', 'bolt'] }),
  enemy({ id: 'dark-emperor', name: 'Dark Emperor', hp: 760, atk: 44, def: 16, mdef: 16, agi: 14, eva: 4, gil: 0, tags: ['boss'], rank: 'front', spells: ['flare', 'bolt'], element: 'holy' }),
  enemy({ id: 'white-dragon', name: 'White Dragon', hp: 540, atk: 40, def: 18, mdef: 16, agi: 10, eva: 4, gil: 400, tags: ['dragon', 'boss'], element: 'ice', weak: 'fire', rank: 'front', ranged: true }),
  enemy({ id: 'green-dragon', name: 'Green Dragon', hp: 620, atk: 44, def: 18, mdef: 16, agi: 11, eva: 4, gil: 450, tags: ['dragon', 'boss'], weak: 'ice', rank: 'front', ranged: true }),
  enemy({ id: 'blue-dragon', name: 'Blue Dragon', hp: 640, atk: 44, def: 18, mdef: 18, agi: 12, eva: 4, gil: 480, tags: ['dragon', 'boss'], element: 'bolt', rank: 'front', ranged: true }),
  enemy({ id: 'red-dragon', name: 'Red Dragon', hp: 700, atk: 48, def: 20, mdef: 16, agi: 11, eva: 4, gil: 520, tags: ['dragon', 'boss'], element: 'fire', weak: 'ice', rank: 'front', ranged: true }),
  enemy({ id: 'iron-giant', name: 'Iron Giant', hp: 800, atk: 50, def: 26, mdef: 12, agi: 6, eva: 0, gil: 600, tags: ['giant', 'boss'], rank: 'front' }),
  enemy({ id: 'imperial-shadow', name: 'Imperial Shadow', hp: 360, atk: 34, def: 12, mdef: 16, agi: 14, eva: 8, gil: 300, tags: ['imperial', 'undead'], weak: 'holy', rank: 'back', ranged: true }),
  enemy({ id: 'blood-fiend', name: 'Blood Fiend', hp: 180, atk: 28, def: 8, mdef: 10, agi: 12, eva: 4, gil: 100, tags: ['demon'], rank: 'front', spells: ['drain'] }),
  enemy({ id: 'death-rider', name: 'Death Rider', hp: 260, atk: 34, def: 14, mdef: 10, agi: 14, eva: 4, gil: 160, tags: ['undead'], weak: 'holy', rank: 'front' }),
  enemy({ id: 'sea-serpent', name: 'Sea Serpent', hp: 150, atk: 24, def: 8, mdef: 6, agi: 8, eva: 2, gil: 70, tags: ['beast'], element: 'water', weak: 'bolt', rank: 'front' }),
  enemy({ id: 'killer-fish', name: 'Killer Fish', hp: 60, atk: 16, def: 4, mdef: 4, agi: 12, eva: 4, gil: 30, tags: ['beast'], element: 'water', weak: 'bolt', rank: 'front' }),
  enemy({ id: 'antlion', name: 'Antlion', hp: 140, atk: 24, def: 10, mdef: 4, agi: 6, eva: 1, gil: 65, tags: ['beast'], rank: 'front' }),
  enemy({ id: 'gargoyle', name: 'Gargoyle', hp: 120, atk: 22, def: 14, mdef: 8, agi: 9, eva: 3, gil: 70, tags: ['construct', 'flying'], rank: 'front', ranged: true }),
  enemy({ id: 'imp', name: 'Imp', hp: 44, atk: 12, def: 3, mdef: 8, agi: 14, eva: 6, gil: 25, tags: ['demon'], rank: 'back', spells: ['fire'], ranged: true }),
  enemy({ id: 'pirate', name: 'Pirate', hp: 70, atk: 16, def: 6, mdef: 3, agi: 9, eva: 3, gil: 35, tags: ['humanoid'], rank: 'front' }),
  enemy({ id: 'dark-knight', name: 'Dark Knight', hp: 400, atk: 36, def: 16, mdef: 12, agi: 18, eva: 6, gil: 0, tags: ['imperial', 'boss'], rank: 'front' }),
  enemy({ id: 'executioner', name: 'Executioner', hp: 9999, atk: 400, def: 40, mdef: 20, agi: 30, eva: 0, gil: 1, tags: ['imperial'], rank: 'front', strike: 'all' }),
  enemy({ id: 'practice-dummy', name: 'Practice Post', hp: 9999, atk: 0, def: 0, mdef: 0, agi: 1, eva: 0, gil: 0, tags: ['practice'], rank: 'front' }),
  enemy({ id: 'drill-imp', name: 'Drill Imp', hp: 260, atk: 22, def: 2, mdef: 2, agi: 6, eva: 0, gil: 15, tags: ['beast'], rank: 'front' }),
];

export const ENEMY_BY_ID = Object.fromEntries(ENEMIES.map((e) => [e.id, e]));

export interface EncounterDef {
  id: string;
  name: string;
  enemies: { id: string; rank?: 'front' | 'back' }[];
  threat: number;
  boss?: boolean;
  noFlee?: boolean;
  scriptedLoss?: boolean;
  scriptedWithdraw?: boolean;
  phase?: string;
  map?: string;
  ai?: 'attack-only' | 'normal';
}

function enc(partial: EncounterDef): EncounterDef {
  return partial;
}

export const ENCOUNTERS: EncounterDef[] = [
  enc({ id: 'opening', name: 'Imperial Ambush', enemies: [{ id: 'captain' }, { id: 'soldier' }, { id: 'soldier' }, { id: 'black-knight', rank: 'back' }], threat: 1, boss: true, noFlee: true, scriptedLoss: true, ai: 'attack-only', phase: 'intro', map: 'outskirts' }),
  enc({ id: 'hornet', name: 'Hornets', enemies: [{ id: 'hornet' }, { id: 'hornet' }], threat: 40, ai: 'attack-only' }),
  enc({ id: 'leg-eater', name: 'Leg Eaters', enemies: [{ id: 'leg-eater' }, { id: 'leg-eater' }], threat: 50, ai: 'attack-only' }),
  enc({ id: 'goblin', name: 'Goblins', enemies: [{ id: 'goblin' }, { id: 'goblin-guard', rank: 'back' }], threat: 70, ai: 'attack-only' }),
  enc({ id: 'soldier-patrol', name: 'Imperial Patrol', enemies: [{ id: 'soldier' }, { id: 'soldier' }, { id: 'captain', rank: 'back' }], threat: 90, ai: 'attack-only' }),
  enc({ id: 'practice-dummy', name: 'Practice', enemies: [{ id: 'practice-dummy' }], threat: 1, ai: 'attack-only', map: 'altair' }),
  enc({ id: 'drill-imp', name: 'Drill Imp', enemies: [{ id: 'drill-imp' }], threat: 80, ai: 'attack-only' }),
  enc({ id: 'executioner', name: 'Executioner', enemies: [{ id: 'executioner' }], threat: 999, noFlee: true, ai: 'attack-only' }),
  enc({ id: 'sergeant', name: 'Sergeant', enemies: [{ id: 'sergeant' }, { id: 'soldier' }, { id: 'soldier', rank: 'back' }], threat: 175, boss: true, noFlee: true, ai: 'attack-only', phase: 'to-semitt', map: 'semitt-3' }),
  enc({ id: 'land-turtle', name: 'Land Turtle', enemies: [{ id: 'land-turtle' }], threat: 160, ai: 'attack-only' }),
  enc({ id: 'borghen', name: 'Borghen', enemies: [{ id: 'borghen' }, { id: 'black-knight' }], threat: 240, boss: true, noFlee: true, ai: 'attack-only', phase: 'to-snow', map: 'snow-3' }),
  enc({ id: 'adamantoise', name: 'Adamantoise', enemies: [{ id: 'adamantoise' }], threat: 280, boss: true, noFlee: true, ai: 'attack-only' }),
  enc({ id: 'red-soul', name: 'Red Soul', enemies: [{ id: 'red-soul' }, { id: 'specter', rank: 'back' }], threat: 260, boss: true, noFlee: true, ai: 'normal', phase: 'kashuan-open', map: 'kashuan-3' }),
  enc({ id: 'dreadnought-guard', name: 'Engine Guard', enemies: [{ id: 'captain' }, { id: 'black-knight' }, { id: 'sorcerer', rank: 'back' }], threat: 250, boss: true, noFlee: true, ai: 'attack-only', map: 'dreadnought-2' }),
  enc({ id: 'dark-knight', name: 'The Dark Knight', enemies: [{ id: 'dark-knight' }], threat: 300, boss: true, noFlee: true, scriptedWithdraw: true, ai: 'attack-only', map: 'dreadnought-2' }),
  enc({ id: 'pirates', name: "Leila's Crew", enemies: [{ id: 'pirate' }, { id: 'pirate' }, { id: 'pirate', rank: 'back' }], threat: 200, boss: true, noFlee: true, ai: 'attack-only', map: 'tropical-2' }),
  enc({ id: 'roundworm', name: 'Roundworm', enemies: [{ id: 'roundworm' }], threat: 320, boss: true, noFlee: true, ai: 'attack-only', phase: 'leviathan', map: 'leviathan-2' }),
  enc({ id: 'lamia-queen', name: 'Lamia Queen', enemies: [{ id: 'lamia-queen' }, { id: 'lamia', rank: 'back' }], threat: 360, boss: true, noFlee: true, ai: 'normal', phase: 'to-coliseum', map: 'coliseum' }),
  enc({ id: 'behemoth', name: 'Behemoth', enemies: [{ id: 'behemoth' }], threat: 400, boss: true, noFlee: true, ai: 'attack-only', map: 'castle-fynn-b1' }),
  enc({ id: 'gottos', name: 'Gottos', enemies: [{ id: 'gottos' }, { id: 'royal-guard' }], threat: 420, boss: true, noFlee: true, ai: 'attack-only', phase: 'to-castle-fynn', map: 'castle-fynn-2' }),
  enc({ id: 'chimera', name: 'Chimera', enemies: [{ id: 'chimera' }], threat: 340, boss: true, noFlee: true, ai: 'normal', map: 'deist-cave-2' }),
  enc({ id: 'big-horn', name: 'Big Horn', enemies: [{ id: 'big-horn' }], threat: 300, boss: true, noFlee: true, ai: 'attack-only', map: 'mysidia-cave-2' }),
  enc({ id: 'fire-gigas', name: 'Fire Gigas', enemies: [{ id: 'fire-gigas' }], threat: 460, boss: true, noFlee: true, ai: 'attack-only', map: 'tower-2' }),
  enc({ id: 'ice-gigas', name: 'Ice Gigas', enemies: [{ id: 'ice-gigas' }], threat: 460, boss: true, noFlee: true, ai: 'attack-only', map: 'tower-3' }),
  enc({ id: 'thunder-gigas', name: 'Thunder Gigas', enemies: [{ id: 'thunder-gigas' }], threat: 480, boss: true, noFlee: true, ai: 'attack-only', phase: 'to-tower', map: 'tower-4' }),
  enc({ id: 'white-dragon', name: 'White Dragon', enemies: [{ id: 'white-dragon' }], threat: 500, boss: true, noFlee: true, ai: 'attack-only', map: 'tower-4' }),
  enc({ id: 'green-dragon', name: 'Green Dragon', enemies: [{ id: 'green-dragon' }], threat: 540, boss: true, noFlee: true, ai: 'attack-only', phase: 'cyclone', map: 'cyclone-2' }),
  enc({ id: 'emperor', name: 'Emperor of Palamecia', enemies: [{ id: 'emperor' }, { id: 'royal-guard' }, { id: 'royal-guard', rank: 'back' }], threat: 640, boss: true, noFlee: true, ai: 'attack-only', phase: 'to-palamecia', map: 'palamecia-3' }),
  enc({ id: 'imperial-shadow', name: 'Imperial Shadow', enemies: [{ id: 'imperial-shadow' }, { id: 'death-rider' }], threat: 520, ai: 'attack-only' }),
  enc({ id: 'blue-dragon', name: 'Blue Dragon', enemies: [{ id: 'blue-dragon' }], threat: 600, boss: true, noFlee: true, ai: 'attack-only', map: 'pand-2' }),
  enc({ id: 'zombie-borghen', name: 'Zombie Borghen', enemies: [{ id: 'zombie-borghen' }], threat: 620, boss: true, noFlee: true, ai: 'attack-only', map: 'pand-2' }),
  enc({ id: 'red-dragon', name: 'Red Dragon', enemies: [{ id: 'red-dragon' }], threat: 660, boss: true, noFlee: true, ai: 'attack-only', map: 'pand-3' }),
  enc({ id: 'iron-giant', name: 'Iron Giant', enemies: [{ id: 'iron-giant' }], threat: 700, boss: true, noFlee: true, ai: 'attack-only', map: 'pand-4' }),
  enc({ id: 'dark-emperor', name: 'Dark Emperor', enemies: [{ id: 'dark-emperor' }], threat: 860, boss: true, noFlee: true, ai: 'attack-only', phase: 'pandaemonium', map: 'pand-4' }),
];

export const ENCOUNTER_BY_ID = Object.fromEntries(ENCOUNTERS.map((e) => [e.id, e]));

/** Weighted wild tables by terrain or dungeon family. */
export const WILD_TABLES: Record<string, { id: string; weight: number }[]> = {
  grass: [
    { id: 'hornet', weight: 8 },
    { id: 'leg-eater', weight: 6 },
    { id: 'goblin', weight: 4 },
    { id: 'drill-imp', weight: 3 },
  ],
  forest: [
    { id: 'hornet', weight: 4 },
    { id: 'goblin', weight: 6 },
    { id: 'leg-eater', weight: 4 },
  ],
  desert: [
    { id: 'goblin', weight: 4 },
    { id: 'drill-imp', weight: 3 },
    { id: 'land-turtle', weight: 2 },
  ],
  snow: [
    { id: 'drill-imp', weight: 2 },
    { id: 'leg-eater', weight: 2 },
  ],
  ocean: [
    { id: 'drill-imp', weight: 2 },
    { id: 'hornet', weight: 1 },
  ],
  road: [
    { id: 'soldier-patrol', weight: 8 },
    { id: 'executioner', weight: 1 },
    { id: 'hornet', weight: 2 },
  ],
  mine: [
    { id: 'goblin', weight: 6 },
    { id: 'soldier-patrol', weight: 4 },
    { id: 'hornet', weight: 2 },
  ],
  cave: [
    { id: 'goblin', weight: 4 },
    { id: 'leg-eater', weight: 3 },
    { id: 'drill-imp', weight: 2 },
  ],
  hell: [
    { id: 'executioner', weight: 2 },
    { id: 'soldier-patrol', weight: 3 },
    { id: 'goblin', weight: 2 },
  ],
};

export interface ShopDef {
  id: string;
  town: string;
  kind: 'weapon' | 'armor' | 'item' | 'magic';
  /** Gear ids always sold. Mythril stock is added by the sim when armed. */
  goods: string[];
}

export const SHOPS: ShopDef[] = [
  { id: 'altair-weapons', town: 'altair', kind: 'weapon', goods: ['broadsword', 'shortbow', 'knife', 'staff', 'javelin'] },
  { id: 'altair-armor', town: 'altair', kind: 'armor', goods: ['buckler', 'leather-armor', 'leather-cap', 'leather-gloves', 'clothes'] },
  { id: 'altair-items', town: 'altair', kind: 'item', goods: ['potion', 'antidote', 'eye-drops', 'phoenix-down', 'alarm-clock'] },
  { id: 'altair-magic', town: 'altair', kind: 'magic', goods: ['tome-cure', 'tome-fire', 'tome-ice', 'tome-bolt'] },
  { id: 'gatrea-weapons', town: 'gatrea', kind: 'weapon', goods: ['broadsword', 'hand-axe', 'shortbow', 'knife'] },
  { id: 'gatrea-armor', town: 'gatrea', kind: 'armor', goods: ['leather-armor', 'leather-cap', 'buckler'] },
  { id: 'paloom-weapons', town: 'paloom', kind: 'weapon', goods: ['dagger', 'javelin', 'mythril-bow'] },
  { id: 'paloom-armor', town: 'paloom', kind: 'armor', goods: ['bronze-shield', 'copper-cuirass', 'bronze-helm'] },
  { id: 'paloom-items', town: 'paloom', kind: 'item', goods: ['potion', 'hi-potion', 'antidote', 'phoenix-down', 'alarm-clock'] },
  { id: 'paloom-magic', town: 'paloom', kind: 'magic', goods: ['tome-cure', 'tome-blink', 'tome-protect', 'tome-shell'] },
  { id: 'poft-items', town: 'poft', kind: 'item', goods: ['potion', 'hi-potion', 'ether', 'cottage'] },
  { id: 'poft-magic', town: 'poft', kind: 'magic', goods: ['tome-cure', 'tome-blink', 'tome-protect', 'tome-shell'] },
  { id: 'salamand-weapons', town: 'salamand', kind: 'weapon', goods: ['longsword', 'battle-axe', 'longbow', 'mace'] },
  { id: 'salamand-armor', town: 'salamand', kind: 'armor', goods: ['bronze-shield', 'copper-cuirass', 'bronze-helm', 'bronze-gauntlets'] },
  { id: 'salamand-magic', town: 'salamand', kind: 'magic', goods: ['tome-life', 'tome-sap', 'tome-teleport', 'tome-warp'] },
  { id: 'salamand-items', town: 'salamand', kind: 'item', goods: ['potion', 'hi-potion', 'antidote'] },
  { id: 'bafsk-weapons', town: 'bafsk', kind: 'weapon', goods: ['longsword', 'spear', 'longbow'] },
  { id: 'bafsk-armor', town: 'bafsk', kind: 'armor', goods: ['silver-cuirass', 'bronze-shield'] },
  { id: 'bafsk-magic', town: 'bafsk', kind: 'magic', goods: ['tome-basuna', 'tome-silence', 'tome-fear', 'tome-poison'] },
  { id: 'bafsk-items', town: 'bafsk', kind: 'item', goods: ['potion', 'hi-potion', 'echo-screen', 'bacchus-wine'] },
  { id: 'fynn-weapons', town: 'fynn', kind: 'weapon', goods: ['wing-sword', 'trident', 'werebuster', 'flame-bow'] },
  { id: 'fynn-armor', town: 'fynn', kind: 'armor', goods: ['golden-shield', 'golden-armor', 'golden-helm'] },
  { id: 'fynn-magic', town: 'fynn', kind: 'magic', goods: ['tome-esuna', 'tome-mini', 'tome-fog', 'tome-dispel', 'tome-slow', 'tome-aero', 'tome-aura', 'tome-break'] },
  { id: 'fynn-items', town: 'fynn', kind: 'item', goods: ['potion', 'hi-potion', 'ether', 'phoenix-down', 'echo-screen', 'mallet', 'maidens-kiss', 'gold-needle', 'cross', 'hermes-shoes', 'cottage', 'alarm-clock'] },
  { id: 'mysidia-weapons', town: 'mysidia', kind: 'weapon', goods: ['mythril-bow'] },
  { id: 'mysidia-armor', town: 'mysidia', kind: 'armor', goods: ['ice-shield', 'flame-shield', 'diamond-shield', 'black-garb', 'white-robe', 'gold-hairpin', 'thief-gloves'] },
  { id: 'mysidia-magic', town: 'mysidia', kind: 'magic', goods: ['tome-cure', 'tome-life', 'tome-holy', 'tome-barrier', 'tome-wall', 'tome-swap', 'tome-fire', 'tome-ice', 'tome-bolt', 'tome-sleep', 'tome-blind', 'tome-drain', 'tome-osmose', 'tome-flare', 'tome-charm'] },
  { id: 'mysidia-items', town: 'mysidia', kind: 'item', goods: ['hi-potion', 'ether', 'elixir', 'phoenix-down', 'unicorn-horn', 'cottage', 'spider-silk', 'hourglass', 'antidote', 'echo-screen', 'mallet', 'maidens-kiss', 'gold-needle'] },
  { id: 'deist-magic', town: 'deist', kind: 'magic', goods: ['tome-stun', 'tome-toad', 'tome-break', 'tome-curse'] },
  { id: 'jade-magic', town: 'jade', kind: 'magic', goods: ['tome-death', 'tome-flare', 'tome-berserk', 'tome-haste', 'tome-scourge'] },
];

export const MYTHRIL_STOCK = ['mythril-sword', 'mythril-axe', 'mythril-spear', 'mythril-knife', 'mythril-mace', 'mythril-shield', 'mythril-armor', 'mythril-helm', 'mythril-gloves'];

export const INNS: Record<string, { name: string; price: number }> = {
  altair: { name: 'Altair Inn', price: 20 },
  gatrea: { name: 'Gatrea Inn', price: 20 },
  paloom: { name: 'Paloom Inn', price: 30 },
  poft: { name: 'Poft Inn', price: 30 },
  salamand: { name: 'Salamand Inn', price: 40 },
  bafsk: { name: 'Bafsk Inn', price: 40 },
  fynn: { name: 'Fynn Inn', price: 60 },
  mysidia: { name: 'Mysidia Inn', price: 80 },
};

export const SANCTUARIES = ['altair', 'gatrea', 'paloom', 'poft', 'salamand', 'fynn', 'mysidia'];
export const SANCTUARY_PRICE = 200;

export function cureAilmentsForRank(rank: number): StatusId[] {
  const out: StatusId[] = [];
  if (rank >= 2) out.push('poison');
  if (rank >= 4) out.push('sleep');
  if (rank >= 6) out.push('silence');
  if (rank >= 8) out.push('mini');
  if (rank >= 10) out.push('toad');
  if (rank >= 12) out.push('stone');
  if (rank >= 16) out.push('death');
  return out;
}

export function basunaAilments(rank: number): StatusId[] {
  const out: StatusId[] = ['poison', 'sleep', 'stun', 'blind'];
  if (rank >= 6) out.push('silence');
  return out;
}

export function esunaAilments(rank: number): StatusId[] {
  const out: StatusId[] = ['silence', 'amnesia', 'blind'];
  if (rank >= 4) out.push('mini');
  if (rank >= 8) out.push('toad');
  if (rank >= 12) out.push('stone');
  return out;
}

export const ITEM_CURE: Record<string, StatusId[]> = {
  antidote: ['poison'],
  'eye-drops': ['blind'],
  'echo-screen': ['silence'],
  mallet: ['mini'],
  'maidens-kiss': ['toad'],
  'gold-needle': ['stone'],
  'alarm-clock': ['sleep'],
  'phoenix-down': ['death'],
  'unicorn-horn': ['poison', 'sleep', 'silence', 'mini', 'toad', 'stone', 'blind', 'amnesia', 'stun'],
};

export const STORY_BEAT_IDS = [
  'opening-rescue',
  'wild-rose',
  'scott-dies',
  'minwu-joins',
  'nelly-freed',
  'mythril-arms',
  'paul-mythril',
  'josef-joins',
  'josef-dies',
  'borghen',
  'goddess-bell',
  'kashuan-open',
  'sunfire',
  'dreadnought',
  'dark-knight',
  'leila',
  'leviathan',
  'gordon',
  'lamia-queen',
  'hilda-rescued',
  'fynn-liberated',
  'deist-wyvern',
  'ricard-joins',
  'ricard-dies',
  'minwu-dies',
  'ultima',
  'cyclone',
  'emperor-palamecia',
  'jade',
  'emperor-pandaemonium',
  'ending-leon',
  'paul-infiltration',
  'chocobo',
  'gatrea-courier',
] as const;

export const REQUIRED_LOCATIONS = [
  'altair',
  'gatrea',
  'paloom',
  'poft',
  'salamand',
  'bafsk',
  'fynn',
  'mysidia',
  'chocobo-forest',
  'castle-fynn',
  'semitt-falls',
  'bafsk-cave',
  'snow-cavern',
  'kashuan-keep',
  'dreadnought',
  'castle-deist',
  'deist-cavern',
  'coliseum',
  'tropical-island',
  'leviathan',
  'cave-of-mysidia',
  'mysidian-tower',
  'cyclone',
  'castle-palamecia',
  'jade-passage',
  'pandaemonium',
] as const;
