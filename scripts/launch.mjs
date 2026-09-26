import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { fileURLToPath } from 'node:url';

const scratch = process.env.SCRATCH || '/tmp/grok-goal-2517fac2b7a4/implementer';
mkdirSync(scratch, { recursive: true });
const file = pathToFileURL(fileURLToPath(new URL('../oath-of-the-rose-grok.html', import.meta.url))).href;
const lines = [];
const log = (line) => {
  lines.push(line);
  console.log(line);
};

const browser = await chromium.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: true,
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-webgl'],
});

async function launchOnce(index) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  await page.goto(file, { waitUntil: 'load' });
  await page.waitForSelector('h1', { timeout: 15000 });
  await page.waitForSelector('button:has-text("New Game")');
  const before = await page.evaluate(() => {
    const canvas = document.querySelector('#game-root canvas');
    if (!canvas) return null;
    const sample = (data) => {
      let painted = 0;
      let samples = 0;
      for (let i = 0; i < data.length; i += 16 * 4) {
        samples += 1;
        if (data[i] + data[i + 1] + data[i + 2] > 24) painted += 1;
      }
      return { painted, samples };
    };
    let pixels = null;
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (gl) {
      const buf = new Uint8Array(canvas.width * canvas.height * 4);
      gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
      pixels = sample(buf);
    } else {
      const ctx = canvas.getContext('2d');
      if (ctx) pixels = sample(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
    }
    return {
      width: canvas.width,
      height: canvas.height,
      painted: pixels?.painted ?? 0,
      samples: pixels?.samples ?? 0,
      title: document.title,
      heading: document.querySelector('h1')?.textContent ?? '',
    };
  });
  await page.screenshot({ path: `${scratch}/launch-${index}.png`, fullPage: true });
  log(`launch ${index} canvas ${before?.width}x${before?.height} painted ${before?.painted}/${before?.samples} errors ${errors.length}`);
  if (errors.length) log(errors.join('\n'));
  if (!before || before.width !== 960 || before.height !== 540) throw new Error(`canvas size ${before?.width}x${before?.height}`);
  if (!before.samples || before.painted / before.samples < 0.6) throw new Error(`canvas not filled ${before.painted}/${before.samples}`);
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.waitForTimeout(600);
  const after = await page.evaluate(() => {
    const canvas = document.querySelector('#game-root canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const buf = new Uint8Array(canvas.width * canvas.height * 4);
    if (gl) gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    let painted = 0;
    let samples = 0;
    const colors = new Set();
    for (let i = 0; i < buf.length; i += 24 * 4) {
      samples += 1;
      const r = buf[i];
      const g = buf[i + 1];
      const b = buf[i + 2];
      if (r + g + b > 24) painted += 1;
      colors.add(`${r >> 4},${g >> 4},${b >> 4}`);
    }
    return { painted, samples, colors: colors.size, fight: document.body.innerText.includes('Fight') };
  });
  await page.screenshot({ path: `${scratch}/launch-${index}-play.png` });
  log(`launch ${index} after New Game painted ${after.painted}/${after.samples} colors ${after.colors}`);
  if (after.painted / after.samples < 0.2) throw new Error('play view is blank');
  if (after.colors < 4) throw new Error('play view has no tile variation');
  if (errors.length) throw new Error(errors.join('\n'));
  await page.close();
}

try {
  await launchOnce(1);
  await launchOnce(2);
  log('LAUNCH OK');
} catch (error) {
  log(`LAUNCH FAIL ${error}`);
  process.exitCode = 1;
} finally {
  await browser.close();
  const { writeFileSync } = await import('node:fs');
  writeFileSync(`${scratch}/launch.log`, lines.join('\n'));
}
