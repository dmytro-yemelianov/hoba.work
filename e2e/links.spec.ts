import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/** Every internal href/src in the built site must resolve to a built file. */
test('built site has no broken internal links', () => {
  const dist = path.resolve(__dirname, '../site/dist');
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) pages.push(full);
    }
  };
  walk(dist);
  expect(pages.length).toBeGreaterThan(100);

  const exists = (href: string) => {
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) return true;
    const rel = clean.replace(/^\//, '');
    const candidates = [rel, path.join(rel, 'index.html'), `${rel}.html`, rel.replace(/\/$/, '') + '/index.html'];
    return candidates.some((c) => fs.existsSync(path.join(dist, c)));
  };

  const broken: string[] = [];
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf-8');
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (!exists(m[1])) broken.push(`${path.relative(dist, file)} -> ${m[1]}`);
    }
  }
  expect([...new Set(broken)]).toEqual([]);
});
