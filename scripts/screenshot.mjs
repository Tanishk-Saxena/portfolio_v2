// Visual check helper: screenshots at phone and desktop widths, in both modes.
//
//   node scripts/screenshot.mjs <url> [outDir] [options]
//
//   --widths=390,1440      viewport widths (default 390,1440)
//   --modes=light,dark     colour modes (default both)
//   --selector=#quotes     capture only this element (default: full page)
//   --scroll=<selector>    scroll this element to the top first, then capture the viewport
//   --click=<selector>     click this first (after any scroll), then capture the viewport
//   --scale=2              device scale factor for close-ups (default 1)
//
// Uses the locally installed Chrome (Playwright `channel: 'chrome'`), so no browser download.
// Reduced motion is forced so screenshots show settled layouts.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const positional = args.filter((a) => !a.startsWith('--'));
const [url, outDir = 'screenshots'] = positional;
const opt = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;

if (!url) {
  console.error(
    'usage: node scripts/screenshot.mjs <url> [outDir] [--widths=..] [--modes=..] [--selector=..] [--click=..] [--scale=..]',
  );
  process.exit(1);
}

const widths = opt('widths', '390,1440').split(',').map(Number);
const modes = opt('modes', 'light,dark').split(',');
const selector = opt('selector');
const click = opt('click');
const scroll = opt('scroll');
const scale = Number(opt('scale', '1'));
const tag = [scroll, selector ?? click ?? (scroll ? '' : 'page')]
  .filter(Boolean)
  .join(' ')
  .replace(/[^a-z0-9]+/gi, '-')
  .replace(/^-|-$/g, '');
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
for (const width of widths) {
  for (const mode of modes) {
    const context = await browser.newContext({
      viewport: { width, height: width < 760 ? 844 : 900 },
      deviceScaleFactor: scale,
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
    const file = join(outDir, `${tag}-${width}-${mode}.png`);
    if (scroll) {
      await page
        .locator(scroll)
        .first()
        .evaluate((el) => el.scrollIntoView());
      await page.waitForTimeout(400); // let observers settle
    }
    if (click) {
      await page.locator(click).first().click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: file });
    } else if (selector) {
      await page.locator(selector).first().screenshot({ path: file });
    } else if (scroll) {
      await page.screenshot({ path: file });
    } else {
      await page.screenshot({ path: file, fullPage: true });
    }
    console.log(file);
    await context.close();
  }
}
await browser.close();
