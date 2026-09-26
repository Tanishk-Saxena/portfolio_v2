// Visual check helper: full-page screenshots at phone and desktop widths, in both modes.
//
//   node scripts/screenshot.mjs <url> [outDir] [--widths=390,1440] [--modes=light,dark]
//
// Uses the locally installed Chrome (Playwright `channel: 'chrome'`), so no browser download.
// Reduced motion is forced so screenshots show settled layouts.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--'));
const outDir = args.filter((a) => !a.startsWith('--'))[1] ?? 'screenshots';
const opt = (name, fallback) =>
  (args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback).split(',');

if (!url) {
  console.error('usage: node scripts/screenshot.mjs <url> [outDir] [--widths=..] [--modes=..]');
  process.exit(1);
}

const widths = opt('widths', '390,1440').map(Number);
const modes = opt('modes', 'light,dark');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const width of widths) {
  for (const mode of modes) {
    const context = await browser.newContext({
      viewport: { width, height: width < 760 ? 844 : 900 },
      deviceScaleFactor: 1,
      colorScheme: mode,
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();
    await page.addInitScript((m) => {
      try {
        localStorage.setItem('theme', m);
      } catch {}
    }, mode);
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const file = join(outDir, `${width}-${mode}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await context.close();
  }
}
await browser.close();
