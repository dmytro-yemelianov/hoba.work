import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Every address the README hands a reader, requested against the built site.
 *
 * README described the API as `GET /api/v1/artifacts` — the name the kind
 * carried two renames ago, and without the `index.json` that these paths
 * actually need, since they are excluded from the worker and served as static
 * files where a directory does not resolve to its index. Both halves were wrong
 * and nothing was checking, because a URL in prose has no import to break.
 */
const README = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
const urls = [
  ...new Set([...README.matchAll(/https:\/\/hoba\.work(\/[A-Za-z0-9/._-]*)/g)].map((m) => m[1])),
]
  // A trailing slash marks a prefix the prose points at ("flat files under
  // …/api/v1/"), not an address it hands out.
  .filter((u) => u !== '/' && !u.endsWith('/'))
  .sort();

test.describe('the addresses the README gives out', () => {
  test('there are some, and they are read from the file', () => {
    expect(urls.length).toBeGreaterThan(3);
  });

  for (const url of urls) {
    test(`${url} answers`, async ({ request }) => {
      const response = await request.get(url);
      // Answering, not necessarily with a body: `/validate/claim` is a POST
      // endpoint and refuses a GET with 405, which still proves the route is
      // there. What must not happen is 404 — an address the README gives a
      // reader that resolves to nothing.
      expect(response.status(), `${url} is documented in README.md`).not.toBe(404);
      expect(response.status(), `${url} is documented in README.md`).toBeLessThan(500);
    });
  }
});
