import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ colorScheme: 'light' });
const p = await ctx.newPage();
await p.goto('http://localhost:8788/cats?lang=en', { waitUntil: 'networkidle' });
const r = await new AxeBuilder({ page: p }).withTags(['wcag2a','wcag2aa']).analyze();
for (const v of r.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')) {
  console.log(`${v.id} — ${v.nodes.length}`);
  const seen = new Set();
  for (const n of v.nodes) { const c = (n.html.match(/class="([^"]*)"/)?.[1] ?? '(без класу)').slice(0,70); if (!seen.has(c)) { seen.add(c); console.log('  ' + c); } }
}
