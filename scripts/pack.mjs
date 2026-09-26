import { copyFileSync, mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
copyFileSync('dist/index.html', 'dist/oath-of-the-rose-grok.html');
copyFileSync('dist/index.html', 'oath-of-the-rose-grok.html');
console.log('packed oath-of-the-rose-grok.html');
