import { expect, test, type Page } from '@playwright/test';

const PAGES = ['/uk/', '/uk/registry', '/uk/patterns', '/uk/graph', '/uk/data', '/uk/analyze', '/uk/methodology', '/uk/mechanisms/M-001'];
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
      '/uk/', '/uk/registry', '/uk/patterns', '/uk/graph', '/uk/data', '/uk/analyze',
      '/uk/methodology', '/uk/developers', '/uk/contribute', '/uk/about',
      '/uk/mechanisms/M-001', '/uk/barriers/B-001', '/uk/artifacts/A-001',
      '/uk/patterns/P-001', '/uk/loops/L-001', '/uk/interventions/I-001', '/404',
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
    await page.goto('/uk/registry');
    const scroller = page.locator('div[data-view="table"]');
    await expect(scroller).toHaveCSS('overflow-x', 'auto');
    expect(await overflow(page)).toBeLessThanOrEqual(1);
  });

  test('structural elements span the frame on every page, articles included', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const PAGES = [
      '/uk/methodology', '/uk/developers', '/uk/contribute', '/uk/about',
      '/uk/registry', '/uk/data', '/uk/analyze', '/uk/mechanisms/M-001', '/uk/loops/L-001',
    ];
    for (const path of PAGES) {
      await page.goto(path);
      const widths = await page.evaluate(() => {
        const visible = (sel: string) => {
          const el = document.querySelector(`main ${sel}`);
          if (!el) return null;
          const rect = el.getBoundingClientRect();
          return rect.width === 0 ? null : Math.round(rect.width);
        };
        return { rule: visible('header'), h2: visible('h2'), rowList: visible('.row-list'), pre: visible('pre'), section: visible('section') };
      });
      // A narrow body is what made the project pages look like another template.
      for (const [name, width] of Object.entries(widths)) {
        if (width !== null) expect(width, `${path} ${name}`).toBe(1216);
      }
    }
  });
});
