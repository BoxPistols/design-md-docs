// 決定的チェッカ: computed style を走査し、DESIGN.md の Don't のうち
// 「CSS から機械的に判定できるもの」を誤検出ゼロで取る。
//
//   node tools/probe.mjs
//
// 視覚 judge との役割分担:
//   ここで取れるもの      → 決定的に取る（LLM に渡さない）
//   ピクセルにしか無いもの → 視覚 judge に回す（余白の印象、全体の調和など）

import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readdirSync, writeFileSync } from 'node:fs';

const { chromium } = await import(process.env.PLAYWRIGHT_PKG || 'playwright');

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'sandbox');

// DESIGN.md の Do's and Don'ts のうち、computed style で判定できるもの
const ACCENT = '#9c3b26';
const MAX_RADIUS_PX = 3;
const MAX_WEIGHT = 600;

function hexOf(rgb) {
  const m = rgb.match(/\d+/g);
  if (!m) return rgb;
  return '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('');
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 760 } });
const report = {};

for (const file of readdirSync(join(ROOT, 'variants')).filter((f) => f.endsWith('.html')).sort()) {
  const name = file.replace(/\.html$/, '');
  await page.goto('file://' + join(ROOT, 'variants', file));

  const findings = await page.evaluate(({ ACCENT, MAX_RADIUS_PX, MAX_WEIGHT }) => {
    const out = [];
    const hex = (rgb) => {
      const m = rgb.match(/\d+/g);
      return m ? '#' + m.slice(0, 3).map((n) => (+n).toString(16).padStart(2, '0')).join('') : rgb;
    };
    const label = (el) => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '');
    const hasText = (el) =>
      [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());

    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el);

      // V1: アクセント色を文字に使わない（背景としてのみ許可）
      if (hasText(el) && hex(s.color) === ACCENT) {
        out.push({ rule: 'V1-accent-on-text', el: label(el), value: s.color });
      }
      // V2: font-weight 700 以上を使わない
      if (hasText(el) && parseInt(s.fontWeight, 10) > MAX_WEIGHT) {
        out.push({ rule: 'V2-bold', el: label(el), value: s.fontWeight });
      }
      // V3: 角丸は 3px 以下
      for (const corner of ['borderTopLeftRadius', 'borderTopRightRadius',
                            'borderBottomLeftRadius', 'borderBottomRightRadius']) {
        const px = parseFloat(s[corner]);
        if (px > MAX_RADIUS_PX) {
          out.push({ rule: 'V3-radius', el: label(el), value: s[corner] });
          break;
        }
      }
      // V4: ドロップシャドウを使わない
      if (s.boxShadow && s.boxShadow !== 'none') {
        out.push({ rule: 'V4-shadow', el: label(el), value: s.boxShadow });
      }
      // V5: グラデーションを使わない
      if (/gradient/i.test(s.backgroundImage)) {
        out.push({ rule: 'V5-gradient', el: label(el), value: s.backgroundImage.slice(0, 60) });
      }
    }
    return out;
  }, { ACCENT, MAX_RADIUS_PX, MAX_WEIGHT });

  report[name] = findings;
  const rules = [...new Set(findings.map((f) => f.rule))].sort();
  console.log(`\n${name}: ${findings.length} findings / rules: ${rules.join(', ') || '(none)'}`);
  for (const f of findings) console.log(`   ${f.rule.padEnd(20)} ${f.el.padEnd(14)} ${f.value}`);
}

writeFileSync(join(ROOT, 'shots', 'probe.json'), JSON.stringify(report, null, 2));
await browser.close();
