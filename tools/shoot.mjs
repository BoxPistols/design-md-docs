// 各バリアントのスクリーンショットを撮る。judge への入力を作るだけの道具。
//
//   node tools/shoot.mjs
//
// playwright は PLAYWRIGHT_PKG で場所を指定する（未指定なら解決可能な 'playwright'）。
// バージョンとブラウザキャッシュのリビジョンが一致しているものを選ぶこと
// （不一致だと `npx playwright install` を促されて失敗する）。
//   node -p "require('<pkg>/package.json').version"
//   node -p "require('<pkg>-core/browsers.json').browsers.find(b=>b.name=='chromium').revision"

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, mkdirSync } from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_PKG || 'playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'sandbox');
const OUT = join(ROOT, 'shots');
mkdirSync(OUT, { recursive: true });

const variants = readdirSync(join(ROOT, 'variants'))
  .filter((f) => f.endsWith('.html'))
  .sort();

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 640, height: 760 },
  deviceScaleFactor: 2, // judge に渡すので細部が潰れない解像度で
});

for (const file of variants) {
  const name = file.replace(/\.html$/, '');
  await page.goto('file://' + join(ROOT, 'variants', file));
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: join(OUT, name + '.png'), fullPage: true });
  console.log('  ' + name + ' -> shots/' + name + '.png');
}

await browser.close();
