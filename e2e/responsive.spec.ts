import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/', '/registry', '/patterns', '/graph', '/data', '/analyze', '/methodology', '/mechanisms/M-001'];
const WIDTHS = [360, 768, 1280];

/** Anything wider than the viewport means a layout leak, not a design choice. */
async function overflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

test.describe('responsive layout', () => {
  for (const width of WIDTHS) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of PAGES) {
        await page.goto(path);
        expect(await overflow(page), `${path} @ ${width}`).toBeLessThanOrEqual(1);
      }
    });
  }

  test('every page sits in the same frame as the navbar and the footer', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const FRAMED = [
      '/', '/registry', '/patterns', '/graph', '/data', '/analyze',
      '/methodology', '/developers', '/contribute', '/about',
      '/mechanisms/M-001', '/barriers/B-001', '/artifacts/A-001',
      '/patterns/P-001', '/loops/L-001', '/interventions/I-001', '/404',
    ];
    let reference: Record<string, number> | null = null;

    for (const path of FRAMED) {
      await page.goto(path);
      const frame = await page.evaluate(() => {
        const edge = (el: Element | null) =>
          el ? Math.round(el.getBoundingClientRect().left + parseFloat(getComputedStyle(el).paddingLeft)) : -1;
        const main = document.querySelector('main');
        return {
          content: edge(main),
          width: main ? Math.round(main.getBoundingClientRect().width) : -1,
          navbar: Math.round(document.querySelector('header a')!.getBoundingClientRect().left),
          footer: edge(document.querySelector('footer > div')),
          h1: Math.round(document.querySelector('h1')!.getBoundingClientRect().left),
        };
      });
      // The content edge, the logo, the footer and the H1 all share one gutter.
      expect(frame.navbar, path).toBe(frame.content);
      expect(frame.footer, path).toBe(frame.content);
      expect(frame.h1, path).toBe(frame.content);
      reference ??= frame;
      expect(frame, path).toEqual(reference);
    }
  });

  test('wide tables scroll inside their own box', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 900 });
    await page.goto('/registry');
    const scroller = page.locator('div[data-view="table"]');
    await expect(scroller).toHaveCSS('overflow-x', 'auto');
    expect(await overflow(page)).toBeLessThanOrEqual(1);
  });

  test('every block of every page body spans the frame', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const PAGES = [
      '/', '/registry', '/patterns', '/graph', '/data', '/analyze',
      '/methodology', '/developers', '/contribute', '/about',
      '/mechanisms/M-001', '/barriers/B-001', '/artifacts/A-001',
      '/patterns/P-001', '/loops/L-001', '/interventions/I-001', '/404',
    ];
    for (const path of PAGES) {
      await page.goto(path);
      // Leaf elements may be any width — a search box, a capped paragraph. The
      // structural blocks may not: a narrow body is what reads as another template.
      const narrow = await page.evaluate(() => {
        const main = document.querySelector('main')!;
        const frame = Math.round(main.getBoundingClientRect().width - parseFloat(getComputedStyle(main).paddingLeft) * 2);
        const bodies = [main, ...Array.from(main.children).filter((el) => /^(ARTICLE|DIV)$/.test(el.tagName))];
        const offenders: string[] = [];
        for (const body of bodies) {
          for (const block of Array.from(body.children)) {
            if (!/^(ARTICLE|SECTION|HEADER)$/.test(block.tagName)) continue;
            const width = Math.round(block.getBoundingClientRect().width);
            if (width !== 0 && width !== frame) offenders.push(`${block.tagName}=${width}`);
          }
        }
        return { frame, offenders };
      });
      expect(narrow.offenders, `${path} (frame ${narrow.frame})`).toEqual([]);
    }
  });
});
