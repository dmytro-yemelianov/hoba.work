import { says } from './says';
import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';

/** What A-001's one probe actually says, in a given language. */
const probe = (lang: 'en' | 'uk'): string => {
  const bundle = loadRegistryFromRoot(findRegistryRoot(process.cwd())!, lang);
  return bundle.artifacts.find((a) => a.id === 'A-001')!.probes[0]!.action;
};
import { expect, test } from '@playwright/test';

test.describe('analysis wizard', () => {
  test('runs the protocol end to end in English', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('input[name="artifacts_selected"][value="A-004"]').check();
    await page.locator('input[name="stage_select"][value="technical"]').check();
    await page.locator('#step-h [data-goto="o"]').click();
    await expect(page.locator('#barriers-output')).toContainText('B-005');
    await page.locator('#step-o [data-goto="b"]').click();
    await expect(page.locator('#mechanisms-output')).toContainText('M-001');
    await expect(page.locator('#patterns-output')).toContainText('P-002');
    await page.locator('#step-b [data-goto="a"]').click();
    await expect(page.locator('#count-candidate')).toHaveText('2');
    await expect(page.locator('#probes-output')).toContainText('PROBE-A-004-1');
    await expect(page.locator('#verdict-banner')).toContainText(says('en', 'wiz.verdict'));
  });

  test.describe('in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test('renders Ukrainian verdicts and probe text', async ({ page }) => {
      await page.goto('/analyze');
      await page.locator('input[name="artifacts_selected"][value="A-001"]').check();
      await page.locator('#tab-a').click();
      await expect(page.locator('#verdict-banner')).toContainText(says('uk', 'wiz.verdict'));
      // The probe text comes from the registry, so assert against the registry:
      // pinning the sentence here only breaks when someone improves it.
      const probes = page.locator('#probes-output');
      await expect(probes).toContainText(probe('uk'));
      await expect(probes).not.toContainText(probe('en'));
    });
  });

  test('stop condition when nothing is selected', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('#tab-a').click();
    await expect(page.locator('#verdict-banner')).toContainText(says('en', 'wiz.stop'));
    await expect(page.locator('#count-candidate')).toHaveText('0');
  });
});
