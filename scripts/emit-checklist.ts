import { writeFileSync } from 'node:fs';
import {
  ARMOR,
  CONSUMABLES,
  ENEMIES,
  KEY_ITEMS,
  KEYWORDS,
  REQUIRED_LOCATIONS,
  SPELLS,
  STORY_BEAT_IDS,
  WEAPONS,
} from '../src/data/content.ts';

type Row = {
  id: string;
  kind: string;
  name: string;
  origin: 'source' | 'addition';
  implementationId: string;
};

const rows: Row[] = [];

for (const id of REQUIRED_LOCATIONS) {
  rows.push({ id: `loc-${id}`, kind: 'area', name: id, origin: 'source', implementationId: id });
}
rows.push({ id: 'loc-heron-glade', kind: 'area', name: 'Heron Glade', origin: 'addition', implementationId: 'heron-glade' });

for (const id of STORY_BEAT_IDS) {
  rows.push({
    id: `beat-${id}`,
    kind: 'story',
    name: id,
    origin: id === 'gatrea-courier' ? 'addition' : 'source',
    implementationId: id,
  });
}
for (const id of KEYWORDS) {
  rows.push({ id: `term-${id}`, kind: 'keyword', name: id, origin: 'source', implementationId: id });
}
for (const spell of SPELLS) {
  rows.push({ id: `spell-${spell.id}`, kind: 'spell', name: spell.name, origin: 'source', implementationId: spell.id });
}
for (const item of WEAPONS) {
  rows.push({ id: `weapon-${item.id}`, kind: 'weapon', name: item.name, origin: item.origin, implementationId: item.id });
}
for (const item of ARMOR) {
  rows.push({ id: `armor-${item.id}`, kind: 'armor', name: item.name, origin: item.origin, implementationId: item.id });
}
for (const item of CONSUMABLES) {
  rows.push({ id: `item-${item.id}`, kind: 'consumable', name: item.name, origin: item.origin, implementationId: item.id });
}
for (const item of KEY_ITEMS) {
  rows.push({ id: `key-${item.id}`, kind: 'key', name: item.name, origin: item.origin, implementationId: item.id });
}
for (const enemy of ENEMIES) {
  const addition = enemy.id === 'practice-dummy' || enemy.id === 'drill-imp' || enemy.id === 'executioner';
  rows.push({
    id: `enemy-${enemy.id}`,
    kind: 'enemy',
    name: enemy.name,
    origin: addition ? 'addition' : 'source',
    implementationId: enemy.id,
  });
}

const systems = [
  ['system-growth', 'Use-based growth'],
  ['system-rows', 'Front and back rows'],
  ['system-battle-commands', 'Attack, Magic, Item, Flee'],
  ['system-status', 'Status ailments and cures'],
  ['system-vehicles', 'Foot, canoe, ship, snowcraft, airship, chocobo'],
  ['system-keywords', 'Keyword ask gate'],
  ['system-save', 'Local save and continue'],
  ['system-inn-shop-sanctuary', 'Inn, shop, and sanctuary'],
  ['system-dual-wield', 'Dual wield or weapon and shield'],
];
for (const [id, name] of systems) {
  rows.push({ id, kind: 'system', name, origin: 'source', implementationId: id });
}

writeFileSync('docs/coverage-checklist.json', JSON.stringify({ title: 'Oath of the Rose', rows }, null, 2));
console.log(`wrote ${rows.length} rows`);
