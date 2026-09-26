import { ENCOUNTER_BY_ID, GEAR_BY_ID, INNS, MYTHRIL_STOCK, SANCTUARIES, SANCTUARY_PRICE, SHOPS, WILD_TABLES, type GearDef } from '../data/content';
import { REQUIRED_LOCATIONS } from '../data/content';
import {
  type ActionResult,
  type GameState,
  type Ride,
  addItem,
  countItem,
  findMember,
  note,
  rngNext,
  takeItem,
} from './model';

export interface WorldLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  entry: string;
  kind: 'town' | 'dungeon' | 'castle' | 'special';
  chocoboOk?: boolean;
  snow?: boolean;
  dock?: boolean;
}

export interface ChestDef {
  id: string;
  x: number;
  y: number;
  item?: string;
  gil?: number;
}

export interface GameMap {
  id: string;
  name: string;
  locationId: string;
  w: number;
  h: number;
  rows: string[];
  path: { x: number; y: number }[];
  family: string;
  encounterRate: number;
  encounters: string[];
  spawn: { x: number; y: number };
  end: { x: number; y: number };
  exit: { x: number; y: number };
  stairs: { x: number; y: number; to: string; tx: number; ty: number }[];
  chests: ChestDef[];
  boss?: { x: number; y: number; encounterId: string };
  lock?: { x: number; y: number; flag: string };
}

export const WORLD_W = 42;
export const WORLD_H = 30;
export const SNOWCRAFT_AT = { x: 32, y: 7 };
export const CANOE_AT = { x: 32, y: 15 };

const TERRAIN = buildTerrain();

function buildTerrain(): string[] {
  const g = Array.from({ length: WORLD_H }, () => Array.from({ length: WORLD_W }, () => 'w'));
  const stamp = (x: number, y: number, w: number, h: number, t: string) => {
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (yy >= 0 && xx >= 0 && yy < WORLD_H && xx < WORLD_W) g[yy][xx] = t;
      }
    }
  };
  stamp(5, 13, 15, 12, 'g');
  stamp(8, 25, 5, 4, 'g');
  stamp(0, 10, 4, 4, 'g');
  stamp(0, 26, 5, 3, 'g');
  stamp(18, 26, 6, 3, 'g');
  stamp(26, 9, 14, 12, 'g');
  stamp(30, 12, 7, 5, 'd');
  stamp(21, 11, 2, 3, 'g');
  for (let y = 11; y <= 16; y++) g[y][24] = 'r';
  for (let x = 24; x <= 32; x++) g[15][x] = 'r';
  g[12][23] = 'r';
  stamp(16, 1, 18, 6, 's');
  stamp(26, 7, 10, 2, 'g');
  g[3][26] = 'g';
  g[4][18] = 's';
  const thicket = [
    [30, 7],
    [29, 7],
    [29, 6],
    [28, 6],
    [27, 6],
    [26, 6],
    [25, 6],
    [24, 6],
    [23, 6],
    [22, 6],
  ];
  for (const [x, y] of thicket) g[y][x] = 't';
  g[5][22] = 's';
  g[7][22] = 's';
  stamp(36, 1, 6, 7, 'm');
  g[3][38] = 'g';
  g[16][13] = 'p';
  g[16][14] = 'p';
  g[17][12] = 'p';
  g[11][3] = 'h';
  g[13][2] = 'h';
  g[27][4] = 'h';
  g[26][4] = 'h';
  g[28][4] = 'h';
  g[27][23] = 'h';
  return g.map((row) => row.join(''));
}

export function terrainAt(x: number, y: number): string {
  if (x < 0 || y < 0 || x >= WORLD_W || y >= WORLD_H) return 'v';
  return TERRAIN[y][x];
}

export function terrainFamily(terrain: string): string {
  if (terrain === 'p') return 'road';
  if (terrain === 'd') return 'desert';
  if (terrain === 's') return 'snow';
  if (terrain === 'f' || terrain === 't') return 'forest';
  if (terrain === 'w' || terrain === 'h') return 'ocean';
  if (terrain === 'r') return 'ocean';
  return 'grass';
}

export const LOCATIONS: WorldLocation[] = [
  { id: 'altair', name: 'Altair', x: 8, y: 22, entry: 'altair', kind: 'town' },
  { id: 'gatrea', name: 'Gatrea', x: 17, y: 18, entry: 'gatrea', kind: 'town' },
  { id: 'paloom', name: 'Paloom', x: 6, y: 24, entry: 'paloom', kind: 'town' },
  { id: 'poft', name: 'Poft', x: 27, y: 18, entry: 'poft', kind: 'town' },
  { id: 'salamand', name: 'Salamand', x: 33, y: 14, entry: 'salamand', kind: 'town' },
  { id: 'bafsk', name: 'Bafsk', x: 35, y: 10, entry: 'bafsk', kind: 'town' },
  { id: 'fynn', name: 'Fynn', x: 12, y: 16, entry: 'fynn', kind: 'town' },
  { id: 'mysidia', name: 'Mysidia', x: 4, y: 27, entry: 'mysidia', kind: 'town', dock: true },
  { id: 'chocobo-forest', name: 'Chocobo Forest', x: 30, y: 8, entry: 'chocobo-forest', kind: 'special', chocoboOk: true },
  { id: 'heron-glade', name: 'Heron Glade', x: 22, y: 6, entry: 'heron-glade', kind: 'special', chocoboOk: true },
  { id: 'castle-fynn', name: 'Castle Fynn', x: 12, y: 14, entry: 'castle-fynn-1', kind: 'castle' },
  { id: 'coliseum', name: 'Coliseum', x: 14, y: 15, entry: 'coliseum', kind: 'castle' },
  { id: 'semitt-falls', name: 'Semitt Falls', x: 21, y: 12, entry: 'semitt-1', kind: 'dungeon' },
  { id: 'bafsk-cave', name: 'Bafsk Cave', x: 36, y: 10, entry: 'bafsk-cave-1', kind: 'dungeon' },
  { id: 'snow-cavern', name: 'Snow Cavern', x: 18, y: 4, entry: 'snow-1', kind: 'dungeon', snow: true },
  { id: 'kashuan-keep', name: 'Kashuan Keep', x: 26, y: 3, entry: 'kashuan-1', kind: 'castle' },
  { id: 'dreadnought', name: 'Dreadnought', x: 37, y: 11, entry: 'dreadnought-1', kind: 'dungeon' },
  { id: 'castle-deist', name: 'Castle Deist', x: 3, y: 11, entry: 'castle-deist-1', kind: 'castle', dock: true },
  { id: 'deist-cavern', name: 'Deist Cavern', x: 2, y: 13, entry: 'deist-cave-1', kind: 'dungeon', dock: true },
  { id: 'tropical-island', name: 'Tropical Island', x: 23, y: 27, entry: 'tropical-1', kind: 'dungeon', dock: true },
  { id: 'leviathan', name: 'Leviathan', x: 4, y: 20, entry: 'leviathan-1', kind: 'dungeon' },
  { id: 'cave-of-mysidia', name: 'Cave of Mysidia', x: 4, y: 26, entry: 'mysidia-cave-1', kind: 'dungeon', dock: true },
  { id: 'mysidian-tower', name: 'Mysidian Tower', x: 4, y: 28, entry: 'tower-1', kind: 'dungeon', dock: true },
  { id: 'cyclone', name: 'Cyclone', x: 16, y: 12, entry: 'cyclone-1', kind: 'dungeon' },
  { id: 'castle-palamecia', name: 'Castle Palamecia', x: 38, y: 3, entry: 'palamecia-1', kind: 'castle' },
  { id: 'jade-passage', name: 'Jade Passage', x: 10, y: 27, entry: 'jade-1', kind: 'dungeon' },
  { id: 'pandaemonium', name: 'Pandaemonium', x: 11, y: 28, entry: 'pand-1', kind: 'dungeon' },
];

export const LOCATION_BY_ID = Object.fromEntries(LOCATIONS.map((l) => [l.id, l]));

function openArea(id: string, name: string, locationId: string, family: string, rate: number): GameMap {
  const w = 16;
  const h = 12;
  const rows: string[] = [];
  const path: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) {
      const wall = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      row += wall ? '#' : '.';
      if (!wall) path.push({ x, y });
    }
    rows.push(row);
  }
  const exit = { x: 1, y: h - 2 };
  rows[exit.y] = `#e${rows[exit.y].slice(2)}`;
  return {
    id,
    name,
    locationId,
    w,
    h,
    rows,
    path,
    family,
    encounterRate: rate,
    encounters: (WILD_TABLES[family] ?? []).map((e) => e.id),
    spawn: { x: 2, y: h - 3 },
    end: { x: w - 3, y: 2 },
    exit,
    stairs: [],
    chests: [],
  };
}

function serpent(id: string, name: string, locationId: string, family: string, rate: number, salt: number): GameMap {
  const w = 18;
  const h = 13;
  const grid = Array.from({ length: h }, () => Array.from({ length: w }, () => '#'));
  const path: { x: number; y: number }[] = [];
  let leftToRight = salt % 2 === 0;
  for (let row = 1; row < h - 1; row += 2) {
    const xs: number[] = [];
    for (let x = 1; x < w - 1; x++) xs.push(x);
    if (!leftToRight) xs.reverse();
    for (const x of xs) {
      grid[row][x] = '.';
      path.push({ x, y: row });
    }
    if (row + 2 < h - 1) {
      const elbow = xs[xs.length - 1];
      grid[row + 1][elbow] = '.';
      path.push({ x: elbow, y: row + 1 });
    }
    leftToRight = !leftToRight;
  }
  for (let i = 4; i < path.length; i += 9) {
    const p = path[i];
    const pocket = p.x < w / 2 ? { x: p.x, y: Math.min(h - 2, p.y + 1) } : { x: p.x, y: Math.max(1, p.y - 1) };
    if (grid[pocket.y][pocket.x] === '#') grid[pocket.y][pocket.x] = '.';
  }
  return {
    id,
    name,
    locationId,
    w,
    h,
    rows: grid.map((r) => r.join('')),
    path,
    family,
    encounterRate: rate,
    encounters: (WILD_TABLES[family] ?? WILD_TABLES.cave).map((e) => e.id),
    spawn: path[0],
    end: path[path.length - 1],
    exit: path[0],
    stairs: [],
    chests: [],
  };
}

function link(a: GameMap, b: GameMap): void {
  a.stairs.push({ x: a.end.x, y: a.end.y, to: b.id, tx: b.spawn.x, ty: b.spawn.y });
  b.stairs.push({ x: b.spawn.x, y: b.spawn.y, to: a.id, tx: a.end.x, ty: a.end.y });
}

function buildMaps(): Record<string, GameMap> {
  const maps: Record<string, GameMap> = {};
  const add = (map: GameMap) => {
    maps[map.id] = map;
  };
  const towns: [string, string, string][] = [
    ['altair', 'Altair', 'altair'],
    ['gatrea', 'Gatrea', 'gatrea'],
    ['paloom', 'Paloom', 'paloom'],
    ['poft', 'Poft', 'poft'],
    ['salamand', 'Salamand', 'salamand'],
    ['bafsk', 'Bafsk', 'bafsk'],
    ['fynn', 'Fynn', 'fynn'],
    ['mysidia', 'Mysidia', 'mysidia'],
    ['chocobo-forest', 'Chocobo Forest', 'chocobo-forest'],
    ['heron-glade', 'Heron Glade', 'heron-glade'],
    ['outskirts', 'Fynn Outskirts', 'fynn'],
  ];
  for (const [id, name, loc] of towns) add(openArea(id, name, loc, 'grass', 0));
  maps.outskirts.encounterRate = 0;
  maps.outskirts.locationId = 'outskirts';
  const shelf: [string, number, string][] = [
    ['altair-poison', 2, 'tome-poison'],
    ['altair-sleep', 3, 'tome-sleep'],
    ['altair-silence', 4, 'tome-silence'],
    ['altair-mini', 5, 'tome-mini'],
    ['altair-toad', 6, 'tome-toad'],
    ['altair-break', 7, 'tome-break'],
    ['altair-death', 8, 'tome-death'],
  ];
  for (const [id, y, item] of shelf) maps.altair.chests.push({ id, x: 13, y, item });

  const dungeon = (
    locationId: string,
    names: [string, string][],
    family: string,
    rate: number,
    chests: { floor: number; id: string; item?: string; gil?: number }[],
    boss?: { floor: number; encounterId: string },
  ) => {
    const built = names.map(([id, name], index) => serpent(id, name, locationId, family, rate, index + id.length));
    for (let i = 0; i < built.length - 1; i++) link(built[i], built[i + 1]);
    for (const chest of chests) {
      const map = built[chest.floor];
      if (!map) continue;
      const at = map.path[Math.min(map.path.length - 2, 6 + chest.floor * 3)];
      map.chests.push({ id: chest.id, x: at.x, y: at.y, item: chest.item, gil: chest.gil });
    }
    if (boss) {
      const map = built[boss.floor] ?? built[built.length - 1];
      map.boss = { x: map.end.x, y: map.end.y, encounterId: boss.encounterId };
    }
    for (const map of built) add(map);
    return built;
  };

  dungeon('castle-fynn', [['castle-fynn-1', 'Castle Fynn Gate'], ['castle-fynn-2', 'Castle Fynn Keep'], ['castle-fynn-b1', 'Castle Fynn Dungeons']], 'cave', 0.04, [
    { floor: 0, id: 'fynn-gold-1', gil: 200 },
    { floor: 1, id: 'fynn-potion', item: 'hi-potion' },
    { floor: 2, id: 'fynn-gold-needle', item: 'gold-needle' },
  ], { floor: 1, encounterId: 'gottos' });
  add(openArea('coliseum', 'Coliseum', 'coliseum', 'cave', 0));
  maps.coliseum.boss = { x: maps.coliseum.end.x, y: maps.coliseum.end.y, encounterId: 'lamia-queen' };

  const semitt = dungeon('semitt-falls', [['semitt-1', 'Semitt Falls B1'], ['semitt-2', 'Semitt Falls B2'], ['semitt-3', 'Semitt Falls Depths']], 'mine', 0.05, [
    { floor: 0, id: 'semitt-gil', gil: 200 },
    { floor: 1, id: 'semitt-potion', item: 'potion' },
    { floor: 1, id: 'semitt-fire-tome', item: 'tome-fire' },
  ], { floor: 2, encounterId: 'sergeant' });
  const depths = semitt[2];
  const lockAt = depths.path[Math.floor(depths.path.length * 0.72)];
  const sergeantAt = depths.path[Math.floor(depths.path.length * 0.5)];
  depths.lock = { x: lockAt.x, y: lockAt.y, flag: 'paulOpenedMythrilDoor' };
  depths.boss = { x: sergeantAt.x, y: sergeantAt.y, encounterId: 'sergeant' };
  depths.chests.push({ id: 'mythril-chest', x: depths.end.x, y: depths.end.y, item: 'mythril' });

  dungeon('bafsk-cave', [['bafsk-cave-1', 'Bafsk Cave'], ['bafsk-cave-2', 'Dreadnought Berth']], 'mine', 0.05, [
    { floor: 0, id: 'bafsk-longsword', item: 'longsword' },
    { floor: 1, id: 'bafsk-bow', item: 'longbow' },
  ]);
  dungeon('snow-cavern', [['snow-1', 'Snow Cavern'], ['snow-2', 'Snow Cavern Depths'], ['snow-3', 'Bell Chamber']], 'snow', 0.05, [
    { floor: 0, id: 'snow-gil', gil: 300 },
    { floor: 1, id: 'snow-axe', item: 'battle-axe' },
    { floor: 1, id: 'snow-blizzard', item: 'tome-ice' },
    { floor: 2, id: 'snow-antidote', item: 'antidote' },
  ], { floor: 2, encounterId: 'borghen' });
  maps['snow-3'].chests.push({ id: 'bell-chest', x: maps['snow-3'].path[4].x, y: maps['snow-3'].path[4].y, item: 'goddess-bell' });

  dungeon('kashuan-keep', [['kashuan-1', 'Kashuan Gate'], ['kashuan-2', 'Kashuan Hall'], ['kashuan-3', 'Kashuan Flame']], 'cave', 0.05, [
    { floor: 0, id: 'kashuan-cure', item: 'tome-cure' },
    { floor: 1, id: 'kashuan-gil', gil: 500 },
    { floor: 2, id: 'kashuan-sword', item: 'mythril-sword' },
  ], { floor: 2, encounterId: 'red-soul' });

  dungeon('dreadnought', [['dreadnought-1', 'Dreadnought Deck'], ['dreadnought-2', 'Dreadnought Engine']], 'mine', 0.05, [
    { floor: 0, id: 'dn-ether', item: 'ether' },
    { floor: 1, id: 'dn-gauntlet', item: 'giant-gloves' },
  ], { floor: 1, encounterId: 'dreadnought-guard' });

  dungeon('castle-deist', [['castle-deist-1', 'Castle Deist'], ['castle-deist-2', 'Deist Keep']], 'cave', 0.03, [
    { floor: 0, id: 'deist-cottage', item: 'cottage' },
    { floor: 1, id: 'deist-phoenix', item: 'phoenix-down' },
    { floor: 1, id: 'deist-stun', item: 'tome-stun' },
  ]);
  dungeon('deist-cavern', [['deist-cave-1', 'Deist Cavern'], ['deist-cave-2', 'Wyvern Nest']], 'cave', 0.05, [
    { floor: 0, id: 'deist-ether', item: 'ether' },
    { floor: 1, id: 'deist-helm', item: 'mythril-helm' },
  ], { floor: 1, encounterId: 'chimera' });

  dungeon('tropical-island', [['tropical-1', 'Tropical Shore'], ['tropical-2', 'Pirate Camp']], 'forest', 0.04, [
    { floor: 0, id: 'tropic-drops', item: 'eye-drops' },
    { floor: 1, id: 'tropic-mask', item: 'black-mask' },
  ], { floor: 1, encounterId: 'pirates' });

  dungeon('leviathan', [['leviathan-1', 'Leviathan Belly'], ['leviathan-2', 'Leviathan Heart']], 'ocean', 0.05, [
    { floor: 0, id: 'levi-ether', item: 'ether' },
    { floor: 1, id: 'levi-vest', item: 'power-vest' },
  ], { floor: 1, encounterId: 'roundworm' });

  dungeon('cave-of-mysidia', [['mysidia-cave-1', 'Cave of Mysidia'], ['mysidia-cave-2', 'Mask Sanctum']], 'cave', 0.05, [
    { floor: 0, id: 'mys-cave-ether', item: 'ether' },
    { floor: 1, id: 'white-mask-chest', item: 'white-mask' },
  ], { floor: 1, encounterId: 'big-horn' });

  dungeon('mysidian-tower', [['tower-1', 'Mysidian Tower'], ['tower-2', 'Tower of Fire'], ['tower-3', 'Tower of Ice'], ['tower-4', 'Ultima Seal']], 'cave', 0.05, [
    { floor: 0, id: 'tower-ether', item: 'ether' },
    { floor: 1, id: 'tower-flame', item: 'flame-sword' },
    { floor: 2, id: 'tower-ice', item: 'ice-brand' },
    { floor: 3, id: 'tower-robe', item: 'white-robe' },
  ], { floor: 3, encounterId: 'thunder-gigas' });

  dungeon('cyclone', [['cyclone-1', 'Cyclone'], ['cyclone-2', 'Eye of the Cyclone']], 'hell', 0.06, [
    { floor: 0, id: 'cyc-potion', item: 'hi-potion' },
    { floor: 1, id: 'blood-sword-chest', item: 'blood-sword' },
  ], { floor: 1, encounterId: 'green-dragon' });

  dungeon('castle-palamecia', [['palamecia-1', 'Castle Palamecia'], ['palamecia-2', 'Palamecia Hall'], ['palamecia-3', 'Throne of Palamecia']], 'hell', 0.05, [
    { floor: 0, id: 'pal-elixir', item: 'elixir' },
    { floor: 1, id: 'pal-diamond', item: 'diamond-cuirass' },
    { floor: 2, id: 'pal-ribbon', item: 'gold-hairpin' },
  ], { floor: 2, encounterId: 'emperor' });

  dungeon('jade-passage', [['jade-1', 'Jade Passage'], ['jade-2', 'Jade Depths'], ['jade-3', 'Jade Gate']], 'hell', 0.06, [
    { floor: 0, id: 'jade-gil', gil: 1000 },
    { floor: 1, id: 'jade-death', item: 'tome-death' },
    { floor: 2, id: 'excalibur-chest', item: 'excalibur' },
  ]);

  dungeon('pandaemonium', [['pand-1', 'Pandaemonium'], ['pand-2', 'Hell\'s Gallery'], ['pand-3', 'Dragon Ascent'], ['pand-4', 'Emperor\'s Rest']], 'hell', 0.06, [
    { floor: 0, id: 'pand-elixir', item: 'elixir' },
    { floor: 1, id: 'pand-masamune', item: 'masamune' },
    { floor: 3, id: 'pand-aegis', item: 'aegis-shield' },
  ], { floor: 3, encounterId: 'dark-emperor' });
  maps['pand-2'].boss = { x: maps['pand-2'].end.x, y: maps['pand-2'].end.y, encounterId: 'blue-dragon' };
  maps['pand-3'].boss = { x: maps['pand-3'].end.x, y: maps['pand-3'].end.y, encounterId: 'red-dragon' };

  maps['castle-fynn-b1'].boss = { x: maps['castle-fynn-b1'].path[8].x, y: maps['castle-fynn-b1'].path[8].y, encounterId: 'behemoth' };
  return maps;
}

export const MAPS: Record<string, GameMap> = buildMaps();

export const TOWN_SPOTS = {
  inn: { x: 3, y: 2 },
  shop: { x: 6, y: 2 },
  priest: { x: 9, y: 2 },
  hall: { x: 4, y: 6 },
  hall2: { x: 10, y: 6 },
  square: { x: 8, y: 4 },
  spawn: { x: 2, y: 9 },
  exit: { x: 1, y: 10 },
};

export function spot(mapId: string, ratio: number): { x: number; y: number } {
  const map = MAPS[mapId];
  if (!map || map.path.length === 0) return { x: 1, y: 1 };
  const index = Math.max(0, Math.min(map.path.length - 1, Math.floor(ratio * (map.path.length - 1))));
  return map.path[index];
}

export function tileBlocked(state: GameState, map: GameMap, x: number, y: number): boolean {
  const row = map.rows[y];
  if (!row || x < 0 || x >= map.w) return true;
  const ch = row[x];
  if (ch === '#') return true;
  if (map.lock && map.lock.x === x && map.lock.y === y && !state.flags[map.lock.flag]) return true;
  return false;
}

function passable(terrain: string, ride: Ride): boolean {
  if (terrain === 'v') return false;
  if (ride === 'foot') return 'gfdp'.includes(terrain);
  if (ride === 'chocobo') return 'gfdpt'.includes(terrain);
  if (ride === 'canoe') return terrain === 'r';
  if (ride === 'ship') return terrain === 'w' || terrain === 'h';
  if (ride === 'snowcraft') return 'sgfdp'.includes(terrain);
  if (ride === 'airship') return true;
  return false;
}

function canLand(terrain: string): boolean {
  return terrain === 'g' || terrain === 'd' || terrain === 'p' || terrain === 'f';
}

interface Node {
  x: number;
  y: number;
  ride: Ride;
}

function keyOf(n: Node): string {
  return `${n.x},${n.y},${n.ride}`;
}

function neighbors(state: GameState, node: Node): Node[] {
  if (state.chocoboMounted && node.ride !== 'chocobo') return [];
  const out: Node[] = [];
  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];
  for (const [dx, dy] of dirs) {
    const x = node.x + dx;
    const y = node.y + dy;
    const terr = terrainAt(x, y);
    if (passable(terr, node.ride)) out.push({ x, y, ride: node.ride });
    if (!state.chocoboMounted && node.ride === 'foot') {
      if (state.vehicles.canoe && terr === 'r') out.push({ x, y, ride: 'canoe' });
      if (state.vehicles.ship && (terr === 'w' || terr === 'h')) out.push({ x, y, ride: 'ship' });
      if (state.vehicles.snowcraft && terr === 's') out.push({ x, y, ride: 'snowcraft' });
    }
    if (node.ride === 'canoe' && passable(terr, 'foot')) out.push({ x, y, ride: 'foot' });
    if (node.ride === 'ship' && passable(terr, 'foot')) out.push({ x, y, ride: 'foot' });
    if (node.ride === 'snowcraft' && passable(terr, 'foot')) out.push({ x, y, ride: 'foot' });
  }
  if (!state.chocoboMounted && state.vehicles.airship && node.ride === 'foot' && canLand(terrainAt(node.x, node.y))) {
    out.push({ ...node, ride: 'airship' });
  }
  if (node.ride === 'airship' && canLand(terrainAt(node.x, node.y))) out.push({ ...node, ride: 'foot' });
  if (state.flags.ferryPass && node.ride === 'foot') {
    const paloom = LOCATION_BY_ID.paloom;
    const poft = LOCATION_BY_ID.poft;
    if (node.x === paloom.x && node.y === paloom.y) out.push({ x: poft.x, y: poft.y, ride: 'foot' });
    if (node.x === poft.x && node.y === poft.y) out.push({ x: paloom.x, y: paloom.y, ride: 'foot' });
  }
  return out;
}

function arriveOk(state: GameState, node: Node, loc: WorldLocation): boolean {
  if (node.x !== loc.x || node.y !== loc.y) return false;
  if (loc.chocoboOk) return node.ride === 'chocobo' || (!state.chocoboMounted && node.ride === 'foot');
  if (state.chocoboMounted) return false;
  if (loc.snow) return node.ride === 'snowcraft' || node.ride === 'foot';
  if (loc.dock) return node.ride === 'ship';
  if (node.ride === 'foot' || node.ride === 'snowcraft') return true;
  if (node.ride === 'airship' && canLand(terrainAt(node.x, node.y))) return true;
  return false;
}

export function canReach(state: GameState, locationId: string): boolean {
  if (locationId === 'cyclone') return state.phase === 'cyclone' || !!state.flags.cycloneOpen;
  if (locationId === 'leviathan') return state.phase === 'leviathan' || state.mapId.startsWith('leviathan');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc) return false;
  return !!search(state, (node) => arriveOk(state, node, loc));
}

function search(state: GameState, goal: (node: Node) => boolean): Node | null {
  const start: Node = {
    x: state.worldX,
    y: state.worldY,
    ride: state.chocoboMounted ? 'chocobo' : state.ride === 'chocobo' ? 'foot' : state.ride,
  };
  if (state.chocoboMounted) start.ride = 'chocobo';
  const queue: Node[] = [start];
  const seen = new Set<string>([keyOf(start)]);
  while (queue.length) {
    const node = queue.shift()!;
    if (goal(node)) return node;
    for (const next of neighbors(state, node)) {
      const key = keyOf(next);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return null;
}

function ok(messages: string[]): ActionResult {
  return { ok: true, messages };
}
function fail(error: string, message: string): ActionResult {
  return { ok: false, error, messages: [message] };
}

export function entryBlocked(state: GameState, locationId: string): string | null {
  const loc = LOCATION_BY_ID[locationId];
  if (!loc) return 'unknown';
  if (state.chocoboMounted && !loc.chocoboOk) return 'chocobo-refuses';
  if (locationId === 'kashuan-keep' && !state.flags.kashuanOpened && countItem(state, 'goddess-bell') <= 0) return 'sealed';
  if (locationId === 'jade-passage' && !state.keywords.includes('jade-passage')) return 'unknown-road';
  if (locationId === 'pandaemonium' && !state.flags.jadeOpened && state.phase !== 'pandaemonium' && state.phase !== 'ending') return 'shut';
  if (locationId === 'cyclone' && state.phase !== 'cyclone' && !state.flags.cycloneOpen) return 'no-wyvern';
  if (locationId === 'castle-palamecia' && !['after-cyclone', 'to-palamecia', 'after-emperor', 'to-jade', 'pandaemonium', 'ending'].includes(state.phase)) return 'shut';
  if (locationId === 'dreadnought' && state.phase !== 'to-dreadnought' && !state.flags.dreadnoughtBoarded) return 'not-yet';
  if (locationId === 'bafsk-cave' && countItem(state, 'pass') <= 0 && !state.flags.sawDreadnought) return 'sealed';
  if (locationId === 'coliseum' && !['after-leviathan', 'to-coliseum', 'after-lamia', 'to-castle-fynn', 'fynn-free', 'to-deist', 'deist-cavern', 'ricard-joined', 'to-mysidia', 'need-mask', 'to-tower', 'after-minwu', 'cyclone', 'after-cyclone', 'to-palamecia', 'after-emperor', 'to-jade', 'pandaemonium', 'ending'].includes(state.phase)) return 'shut';
  return null;
}

export function journeyTo(state: GameState, locationId: string): ActionResult {
  if (state.battle) return fail('in-battle', 'You cannot travel during a battle.');
  if (state.phase === 'intro') return fail('ambush', 'Imperial soldiers block the road.');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc) return fail('unknown', 'There is no such place.');
  if (locationId === 'cyclone') {
    if (state.phase !== 'cyclone') return fail('no-wyvern', 'Only a wyvern can enter the Cyclone.');
    state.mapId = 'world';
    state.worldX = loc.x;
    state.worldY = loc.y;
    state.ride = 'foot';
    note(state, 'The last wyvern climbs into the Cyclone.');
    return ok(state.log.slice(-1));
  }
  if (locationId === 'leviathan') {
    if (state.phase !== 'to-leila' && state.phase !== 'leviathan') return fail('not-yet', 'The sea is only water.');
    return ok(['The voyage itself will take you.']);
  }
  const node = search(state, (candidate) => arriveOk(state, candidate, loc));
  if (!node) return fail('unreachable', `${loc.name} cannot be reached with the travel you have.`);
  state.worldX = loc.x;
  state.worldY = loc.y;
  state.mapId = 'world';
  state.x = 0;
  state.y = 0;
  if (loc.chocoboOk && state.chocoboMounted) state.ride = 'chocobo';
  else {
    state.ride = 'foot';
    if (state.chocoboMounted) {
      state.chocoboMounted = false;
      note(state, 'The chocobo shies from the gate and bolts.');
    }
  }
  if (!state.visited.includes(locationId)) state.visited.push(locationId);
  note(state, `You reach ${loc.name}.`);
  return ok([`You reach ${loc.name}.`]);
}

export function enterLocation(state: GameState, locationId: string): ActionResult {
  if (state.battle) return fail('in-battle', 'Not now.');
  const loc = LOCATION_BY_ID[locationId];
  if (!loc) return fail('unknown', 'There is no such place.');
  if (locationId === 'leviathan' && state.phase === 'leviathan') {
    const map = MAPS[loc.entry];
    state.mapId = map.id;
    state.x = map.spawn.x;
    state.y = map.spawn.y;
    return ok(['The ship slides into a living dark.']);
  }
  if (locationId === 'cyclone' && (state.phase === 'cyclone' || state.flags.cycloneOpen)) {
    const map = MAPS[loc.entry];
    state.mapId = map.id;
    state.x = map.spawn.x;
    state.y = map.spawn.y;
    state.ride = 'foot';
    return ok(['Wind tears at the wyvern\'s wings.']);
  }
  if (state.mapId !== 'world' || state.worldX !== loc.x || state.worldY !== loc.y) {
    return fail('too-far', `You are not at the entrance to ${loc.name}.`);
  }
  const blocked = entryBlocked(state, locationId);
  if (blocked === 'sealed' && locationId === 'kashuan-keep') return fail('sealed', 'The gates of Kashuan are shut. A bell might open them.');
  if (blocked === 'sealed') return fail('sealed', 'The way is sealed.');
  if (blocked === 'chocobo-refuses') return fail('chocobo-refuses', 'The chocobo will not go inside.');
  if (blocked === 'unknown-road') return fail('unknown-road', 'You have not learned the way.');
  if (blocked === 'shut' || blocked === 'not-yet' || blocked === 'no-wyvern') return fail(blocked, 'The way is closed.');
  if (locationId === 'kashuan-keep' && !state.flags.kashuanOpened) {
    state.flags.kashuanOpened = true;
    note(state, 'You ring the Goddess\'s Bell. The doors of Kashuan open.');
  }
  const map = MAPS[loc.entry];
  state.mapId = map.id;
  state.x = map.spawn.x;
  state.y = map.spawn.y;
  if (!loc.chocoboOk) state.ride = 'foot';
  if (!state.visited.includes(locationId)) state.visited.push(locationId);
  note(state, `You enter ${loc.name}.`);
  return ok([`You enter ${loc.name}.`]);
}

export function leaveMap(state: GameState): ActionResult {
  const map = MAPS[state.mapId];
  if (!map) return fail('no-map', 'You are already outside.');
  if (state.mapId === 'world') return fail('no-map', 'You are on the world map.');
  const stair = map.stairs.find((s) => s.x === state.x && s.y === state.y);
  if (stair && state.mapId !== map.id) return fail('stairs', '');
  const loc = LOCATIONS.find((l) => l.id === map.locationId) ?? LOCATION_BY_ID[map.locationId];
  if (map.locationId === 'outskirts') return fail('ambush', 'There is nowhere to run.');
  const pad = loc ?? LOCATION_BY_ID.altair;
  state.mapId = 'world';
  state.worldX = pad.x;
  state.worldY = pad.y;
  if (!(state.chocoboMounted && pad.chocoboOk)) state.ride = 'foot';
  note(state, `You leave ${map.name}.`);
  return ok([`You leave ${map.name}.`]);
}

export function nearestStair(state: GameState): { x: number; y: number; to: string; tx: number; ty: number } | null {
  const map = MAPS[state.mapId];
  if (!map) return null;
  return map.stairs.find((s) => Math.max(Math.abs(s.x - state.x), Math.abs(s.y - state.y)) <= 1) ?? null;
}

export function useStairs(state: GameState): ActionResult {
  const stair = nearestStair(state);
  if (!stair) return fail('no-stairs', 'There are no stairs here.');
  state.mapId = stair.to;
  state.x = stair.tx;
  state.y = stair.ty;
  note(state, `You take the stairs to ${MAPS[stair.to]?.name ?? 'the next floor'}.`);
  return ok([`You climb to ${MAPS[stair.to]?.name ?? 'the next floor'}.`]);
}

function mapNeighbors(state: GameState, map: GameMap, x: number, y: number): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (const [dx, dy] of [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ]) {
    const nx = x + dx;
    const ny = y + dy;
    if (!tileBlocked(state, map, nx, ny)) out.push({ x: nx, y: ny });
  }
  return out;
}

export function moveTo(state: GameState, x: number, y: number): ActionResult {
  if (state.battle) return fail('in-battle', 'Not now.');
  if (state.mapId === 'world') return travelToTile(state, x, y);
  const map = MAPS[state.mapId];
  if (!map) return fail('no-map', 'Nowhere to walk.');
  if (tileBlocked(state, map, x, y)) return fail('blocked', 'That way is blocked.');
  const start = `${state.x},${state.y}`;
  const goal = `${x},${y}`;
  const queue = [{ x: state.x, y: state.y }];
  const seen = new Set([start]);
  let found = false;
  while (queue.length) {
    const n = queue.shift()!;
    if (`${n.x},${n.y}` === goal) {
      found = true;
      break;
    }
    for (const next of mapNeighbors(state, map, n.x, n.y)) {
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  if (!found) return fail('blocked', 'You cannot find a way there.');
  state.x = x;
  state.y = y;
  return ok(['You move.']);
}

export function travelToTile(state: GameState, x: number, y: number): ActionResult {
  if (state.phase === 'intro') return fail('ambush', 'Imperial soldiers block the road.');
  const node = search(state, (candidate) => candidate.x === x && candidate.y === y && (candidate.ride === 'foot' || candidate.ride === 'snowcraft' || candidate.ride === 'chocobo' || candidate.ride === 'ship' || candidate.ride === 'canoe' || candidate.ride === 'airship'));
  if (!node) return fail('unreachable', 'You cannot reach that ground.');
  state.mapId = 'world';
  state.worldX = x;
  state.worldY = y;
  state.ride = state.chocoboMounted ? 'chocobo' : node.ride === 'airship' ? 'foot' : node.ride;
  return ok(['You travel.']);
}

export function step(state: GameState, dx: number, dy: number): ActionResult {
  if (state.battle) return fail('in-battle', 'Not now.');
  if (state.phase === 'intro' && state.mapId === 'outskirts') {
    return fail('ambush', 'They are already on you. Fight.');
  }
  if (state.mapId === 'world') return stepWorld(state, dx, dy);
  const map = MAPS[state.mapId];
  if (!map) return fail('no-map', 'Nowhere to walk.');
  const nx = state.x + dx;
  const ny = state.y + dy;
  if (tileBlocked(state, map, nx, ny)) return fail('blocked', 'The way is blocked.');
  state.x = nx;
  state.y = ny;
  state.steps += 1;
  if (map.encounterRate > 0 && rngNext(state) < map.encounterRate) {
    const table = WILD_TABLES[map.family] ?? WILD_TABLES.cave;
    const id = rollTable(state, table);
    if (id) {
      note(state, 'Something stirs in the dark.');
      return { ok: true, messages: ['Something stirs in the dark.'], error: `encounter:${id}` };
    }
  }
  return ok(['']);
}

function rollTable(state: GameState, table: { id: string; weight: number }[]): string | null {
  const total = table.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return null;
  let roll = rngNext(state) * total;
  for (const entry of table) {
    roll -= entry.weight;
    if (roll <= 0) return entry.id;
  }
  return table[0]?.id ?? null;
}

function stepWorld(state: GameState, dx: number, dy: number): ActionResult {
  const speed = state.ride === 'airship' ? 4 : state.ride === 'chocobo' ? 2 : state.ride === 'ship' || state.ride === 'snowcraft' || state.ride === 'canoe' ? 2 : 1;
  let moved = 0;
  for (let i = 0; i < speed; i++) {
    const nx = state.worldX + dx;
    const ny = state.worldY + dy;
    const terr = terrainAt(nx, ny);
    let ride = state.ride;
    if (state.chocoboMounted) ride = 'chocobo';
    if (!passable(terr, ride)) {
      if (ride === 'foot' && state.vehicles.canoe && terr === 'r') ride = 'canoe';
      else if (ride === 'foot' && state.vehicles.ship && (terr === 'w' || terr === 'h')) ride = 'ship';
      else if (ride === 'foot' && state.vehicles.snowcraft && terr === 's') ride = 'snowcraft';
      else if ((ride === 'canoe' || ride === 'ship' || ride === 'snowcraft') && passable(terr, 'foot')) ride = 'foot';
      else if (moved === 0) return fail('blocked', 'You cannot cross that ground.');
      else break;
    }
    if (!passable(terr, ride)) {
      if (moved === 0) return fail('blocked', 'You cannot cross that ground.');
      break;
    }
    state.worldX = nx;
    state.worldY = ny;
    state.ride = ride;
    moved += 1;
  }
  state.steps += 1;
  if (state.chocoboMounted || state.ride === 'airship') return ok(['The wilds stay quiet.']);
  const family = terrainFamily(terrainAt(state.worldX, state.worldY));
  const rate = family === 'ocean' ? 0.04 : family === 'road' ? 0.08 : 0.06;
  if (rngNext(state) < rate) {
    const id = rollTable(state, WILD_TABLES[family] ?? WILD_TABLES.grass);
    if (id) return { ok: true, messages: ['An encounter!'], error: `encounter:${id}` };
  }
  return ok(['']);
}

export function board(state: GameState, ride: Ride): ActionResult {
  if (ride === 'snowcraft') {
    if (state.mapId !== 'world') return fail('too-far', 'The snowcraft is on the snowfield.');
    if (!state.vehicles.snowcraft) {
      if (state.worldX !== SNOWCRAFT_AT.x || state.worldY !== SNOWCRAFT_AT.y) {
        return fail('too-far', 'You see no snowcraft here.');
      }
      state.vehicles.snowcraft = true;
      state.ride = 'snowcraft';
      note(state, 'The snowcraft still runs. The snowfield opens.');
      return ok(['You board the snowcraft.']);
    }
    state.ride = 'snowcraft';
    return ok(['You board the snowcraft.']);
  }
  if (ride === 'canoe') {
    if (!state.vehicles.canoe) {
      if (state.mapId === 'world' && state.worldX === CANOE_AT.x && state.worldY === CANOE_AT.y) {
        state.vehicles.canoe = true;
        note(state, 'Josef\'s canoe is yours.');
      } else return fail('no-vehicle', 'You have no canoe.');
    }
    state.ride = 'canoe';
    return ok(['You take the canoe.']);
  }
  if (ride === 'ship') {
    if (!state.vehicles.ship) return fail('no-vehicle', 'You have no ship.');
    state.ride = 'ship';
    return ok(['You board the ship.']);
  }
  if (ride === 'airship') {
    if (!state.vehicles.airship) return fail('no-vehicle', 'Cid has not lent you the airship.');
    if (!canLand(terrainAt(state.worldX, state.worldY)) && state.mapId === 'world') {
      return fail('blocked', 'The airship needs open ground.');
    }
    state.mapId = 'world';
    state.ride = 'airship';
    note(state, 'The airship lifts.');
    return ok(['The airship lifts.']);
  }
  if (ride === 'chocobo') return fail('no-vehicle', 'Catch a chocobo in the forest.');
  state.ride = 'foot';
  return ok(['You go on foot.']);
}

export function mountChocobo(state: GameState): ActionResult {
  if (state.mapId !== 'chocobo-forest') return fail('too-far', 'The chocobos are in the forest south of Kashuan.');
  state.chocoboMounted = true;
  state.ride = 'chocobo';
  state.flags.chocoboCaught = true;
  note(state, 'A yellow chocobo lets you mount. The wilds will not trouble a rider.');
  return ok(['You mount the chocobo.']);
}

export function dismountChocobo(state: GameState): ActionResult {
  if (!state.chocoboMounted) return fail('no-vehicle', 'You are not riding.');
  state.chocoboMounted = false;
  state.ride = 'foot';
  if (state.mapId === 'world' && !passable(terrainAt(state.worldX, state.worldY), 'foot')) {
    const forest = LOCATION_BY_ID['chocobo-forest'];
    state.worldX = forest.x;
    state.worldY = forest.y;
    note(state, 'The chocobo carries you to the forest edge, then bolts.');
    return ok(['The chocobo carries you out, then runs off.']);
  }
  note(state, 'The chocobo bolts into the brush. It is gone.');
  return ok(['The chocobo runs off.']);
}

export function shopGoods(state: GameState, shopId: string): GearDef[] {
  const shop = SHOPS.find((s) => s.id === shopId);
  if (!shop) return [];
  const ids = [...shop.goods];
  if (state.flags.mythrilArmed && shop.town === 'salamand') {
    if (shop.kind === 'weapon') ids.push('mythril-sword', 'mythril-axe', 'mythril-spear', 'mythril-knife', 'mythril-mace', 'mythril-bow');
    if (shop.kind === 'armor') ids.push(...MYTHRIL_STOCK.filter((id) => GEAR_BY_ID[id]?.kind !== 'weapon'));
  }
  return ids.map((id) => GEAR_BY_ID[id]).filter((item): item is GearDef => !!item);
}

export function buy(state: GameState, shopId: string, itemId: string): ActionResult {
  const shop = SHOPS.find((entry) => entry.id === shopId);
  if (!shop || state.mapId !== shop.town) return fail('too-far', 'You are not at that shop.');
  const item = shopGoods(state, shopId).find((good) => good.id === itemId);
  if (!item) return fail('not-sold', 'That is not for sale.');
  if (state.gil < item.price) return fail('need-gil', 'You cannot afford it.');
  state.gil -= item.price;
  addItem(state, itemId, 1);
  note(state, `Bought ${item.name} for ${item.price} gil.`);
  return ok([`Bought ${item.name}.`]);
}

export function sell(state: GameState, shopId: string, itemId: string): ActionResult {
  const shop = SHOPS.find((s) => s.id === shopId);
  if (!shop || state.mapId !== shop.town) return fail('too-far', 'You are not at that shop.');
  const item = GEAR_BY_ID[itemId];
  if (!item || !item.sellable || item.key) return fail('not-sold', 'That cannot be sold.');
  if (!takeItem(state, itemId, 1)) return fail('no-item', 'You do not have that.');
  const price = Math.max(1, Math.floor(item.price / 2));
  state.gil += price;
  note(state, `Sold ${item.name} for ${price} gil.`);
  return ok([`Sold ${item.name}.`]);
}

export function rest(state: GameState, innId: string): ActionResult {
  const inn = INNS[innId];
  if (!inn) return fail('no-inn', 'There is no inn.');
  if (state.mapId !== innId) return fail('too-far', 'You are not at the inn.');
  if (state.gil < inn.price) return fail('need-gil', 'You cannot afford a room.');
  state.gil -= inn.price;
  for (const c of state.party) {
    if (c.dead) continue;
    c.hp = c.maxHp;
    c.mp = c.maxMp;
    c.statuses = [];
    c.buffs = [];
  }
  note(state, `You rest at the ${inn.name}. The living are restored.`);
  return ok(['You rest. HP and MP are restored. The dead still wait.']);
}

export function revive(state: GameState, townId: string, characterId: string): ActionResult {
  if (!SANCTUARIES.includes(townId)) return fail('no-sanctuary', 'No sanctuary here.');
  if (state.mapId !== townId) return fail('too-far', 'You are not at the sanctuary.');
  if (state.fallen.includes(characterId)) return fail('story-dead', 'No prayer will return them.');
  const member = findMember(state, characterId);
  if (!member || !state.party.includes(member) || !member.dead) return fail('not-dead', 'No one there needs raising.');
  if (state.gil < SANCTUARY_PRICE) return fail('need-gil', 'The sanctuary asks for gil.');
  state.gil -= SANCTUARY_PRICE;
  member.dead = false;
  member.hp = member.maxHp;
  member.statuses = member.statuses.filter((s) => s.id !== 'death');
  note(state, `${member.name} returns to the living.`);
  return ok([`${member.name} is revived.`]);
}

export function openChest(state: GameState, chestId: string): ActionResult {
  if (state.chests.includes(chestId)) return fail('empty', 'The chest is empty.');
  const map = MAPS[state.mapId];
  const chest = map?.chests.find((c) => c.id === chestId);
  if (!chest) return fail('no-chest', 'There is no such chest.');
  if (Math.max(Math.abs(chest.x - state.x), Math.abs(chest.y - state.y)) > 1) return fail('too-far', 'You are not at the chest.');
  state.chests.push(chestId);
  if (chest.item) addItem(state, chest.item, 1);
  if (chest.gil) state.gil += chest.gil;
  const name = chest.item ? (GEAR_BY_ID[chest.item]?.name ?? chest.item) : `${chest.gil} gil`;
  note(state, `Found ${name}.`);
  return ok([`Found ${name}.`]);
}

export function equipItem(state: GameState, characterId: string, slot: keyof GameState['party'][number]['equip'], itemId: string | null): ActionResult {
  const member = state.party.find((c) => c.id === characterId);
  if (!member) return fail('no-one', 'They are not in the party.');
  if (itemId === null) {
    const current = member.equip[slot];
    if (current) addItem(state, current, 1);
    member.equip[slot] = null;
    return ok(['Unequipped.']);
  }
  const item = GEAR_BY_ID[itemId];
  if (!item) return fail('no-item', 'Unknown item.');
  if (countItem(state, itemId) <= 0) return fail('no-item', 'You do not have that.');
  if (slot === 'main' && item.kind !== 'weapon') return fail('bad-slot', 'That is not a weapon.');
  if (slot === 'off' && item.kind !== 'weapon' && item.kind !== 'shield') return fail('bad-slot', 'The off hand takes a weapon or a shield.');
  if ((slot === 'head' || slot === 'body' || slot === 'hands') && item.slot !== slot) return fail('bad-slot', 'That does not fit.');
  if (slot === 'accessory' && item.kind !== 'accessory') return fail('bad-slot', 'That is not worn as a band.');
  takeItem(state, itemId, 1);
  const previous = member.equip[slot];
  if (previous) addItem(state, previous, 1);
  member.equip[slot] = itemId;
  note(state, `${member.name} equips ${item.name}.`);
  return ok([`${member.name} equips ${item.name}.`]);
}

export function setRow(state: GameState, characterId: string, row: 'front' | 'back'): ActionResult {
  if (state.battle) return fail('in-battle', 'Formation is set before battle.');
  const member = state.party.find((c) => c.id === characterId);
  if (!member) return fail('no-one', 'They are not here.');
  member.row = row;
  return ok([`${member.name} moves to the ${row} row.`]);
}

export function locationsPresent(): string[] {
  return [...REQUIRED_LOCATIONS];
}

export function canFight(state: GameState, encounterId: string): string | null {
  const enc = ENCOUNTER_BY_ID[encounterId];
  if (!enc) return 'unknown';
  if (enc.scriptedLoss) {
    if (state.phase !== 'intro' || state.mapId !== 'outskirts') return 'not-here';
    return null;
  }
  if (encounterId === 'practice-dummy') {
    if (state.mapId !== 'altair') return 'not-here';
    return null;
  }
  if (enc.boss || enc.scriptedWithdraw) {
    if (enc.map && state.mapId !== enc.map) return 'not-here';
    const map = MAPS[state.mapId];
    if (map?.boss && map.boss.encounterId === encounterId) {
      const dist = Math.max(Math.abs(state.x - map.boss.x), Math.abs(state.y - map.boss.y));
      if (dist > 1) return 'too-far';
    }
    return null;
  }
  if (state.mapId === 'world') {
    const family = terrainFamily(terrainAt(state.worldX, state.worldY));
    const table = WILD_TABLES[family] ?? [];
    if (!table.some((entry) => entry.id === encounterId)) return 'not-here';
    return null;
  }
  const map = MAPS[state.mapId];
  if (map?.encounters.includes(encounterId)) return null;
  return 'not-here';
}
