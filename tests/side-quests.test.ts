import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCATIONS } from '../src/engine';

const ROOT = join(import.meta.dirname, '..');
const PORTFOLIO = join(ROOT, 'docs', 'side-quests');

export const QUEST_LABELS = [
  'Quest title',
  'Existing-world touchpoint',
  'Premise',
  'Why the player becomes involved',
  'Key NPCs',
  'New locations or spaces',
  'Quest progression / major beats',
  'Important player choices',
  'Possible resolutions',
  'Gameplay opportunities',
  'Worldbuilding revealed',
  'Rewards',
  'Canon dependencies',
  'Collision risks',
  'Why the quest remains self-contained',
] as const;

export function shippedTouchpointNames(): string[] {
  const names = new Set(LOCATIONS.map((location) => location.name));
  const model = readFileSync(join(ROOT, 'src/engine/model.ts'), 'utf8');
  const story = readFileSync(join(ROOT, 'src/engine/story.ts'), 'utf8');
  for (const source of [model, story]) {
    for (const match of source.matchAll(/name: '([^']+)'/g)) names.add(match[1]);
    for (const match of source.matchAll(/pushed\('[^']*', '([^']+)'/g)) names.add(match[1]);
  }
  return [...names];
}

export function parseQuest(markdown: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const parts = markdown.split(/^## /m).slice(1);
  for (const part of parts) {
    const newline = part.indexOf('\n');
    const heading = (newline === -1 ? part : part.slice(0, newline)).trim();
    const body = newline === -1 ? '' : part.slice(newline + 1).trim();
    sections[heading] = body;
  }
  return sections;
}

export function loadPortfolio(): { file: string; sections: Record<string, string> }[] {
  const files = readdirSync(PORTFOLIO)
    .filter((name) => name.endsWith('.md') && name !== 'README.md')
    .sort();
  return files.map((file) => ({
    file,
    sections: parseQuest(readFileSync(join(PORTFOLIO, file), 'utf8')),
  }));
}

describe('side-quest portfolio', () => {
  const quests = loadPortfolio();
  const touchpoints = shippedTouchpointNames();

  it('holds at least eight complete packages with the fifteen labels and a real touchpoint', () => {
    expect(quests.length).toBeGreaterThanOrEqual(8);
    const titles = quests.map((quest) => quest.sections['Quest title']);
    expect(new Set(titles).size).toBe(titles.length);
    for (const quest of quests) {
      for (const label of QUEST_LABELS) {
        const minimum = label === 'Quest title' ? 8 : 40;
        expect(quest.sections[label]?.length ?? 0, `${quest.file} missing ${label}`).toBeGreaterThan(minimum);
      }
      expect(titles).toContain(quest.sections['Quest title']);
      const touch = quest.sections['Existing-world touchpoint'];
      expect(touchpoints.some((name) => touch.includes(name)), `${quest.file} touchpoint not in the shipped world`).toBe(true);
      const beats = quest.sections['Quest progression / major beats'];
      for (const beat of ['Beginning', 'Escalation', 'Climax', 'Resolution']) {
        expect(beats, `${quest.file} missing ${beat}`).toContain(beat);
      }
      const outcomes = quest.sections['Possible resolutions']
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => /^[-*] /.test(line) || /^### /.test(line) || /^\*\*[^*]{3,80}\*\*/.test(line));
      expect(outcomes.length, `${quest.file} needs two resolutions`).toBeGreaterThanOrEqual(2);
    }
  });
});
