import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Every internal href/src in the built site must resolve to a built file.
 *
 * Public URLs carry no language, so a link like `/registry` is looked up inside
 * the language tree the page itself was built into — that is where the worker
 * will find it at request time.
 */
test('built site has no broken internal links', () => {
  const dist = path.resolve(__dirname, '../apps/web/dist');
  const pages: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.html')) pages.push(full);
    }
  };
  walk(dist);
  // Two internal trees plus the shared 404.
  expect(pages.length).toBeGreaterThan(100);

  /** Which internal tree a built page belongs to, so its links resolve there. */
  const treeOf = (file: string) => {
    const m = path.relative(dist, file).match(/^_i\/(en|uk)\//);
    // A page built outside a tree is served to a signal-free request, which the
    // worker answers in English.
    return m ? `_i/${m[1]}` : '_i/en';
  };

  const exists = (href: string, tree: string) => {
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) return true;
    const rel = clean.replace(/^\//, '');
    const roots = tree ? [path.join(dist, tree), dist] : [dist];
    const candidates = [rel, path.join(rel, 'index.html'), `${rel}.html`, rel.replace(/\/$/, '') + '/index.html'];
    return roots.some((root) => candidates.some((c) => fs.existsSync(path.join(root, c))));
  };

  const broken: string[] = [];
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf-8');
    const tree = treeOf(file);
    for (const m of html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) {
      if (!exists(m[1], tree)) broken.push(`${path.relative(dist, file)} -> ${m[1]}`);
    }
  }
  expect([...new Set(broken)]).toEqual([]);
});
