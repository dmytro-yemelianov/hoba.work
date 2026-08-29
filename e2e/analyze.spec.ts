import { says } from './says';
import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';

/** What A-001's one probe actually says, in a given language. */
const probe = (lang: 'en' | 'uk'): string => {
  const bundle = loadRegistryFromRoot(findRegistryRoot(process.cwd())!, lang);
  return bundle.artifacts.find((a) => a.id === 'obs.complete_silence_after_submission')!.probes[0]!.action;
};
import { expect, test } from '@playwright/test';

test.describe('analysis wizard', () => {
  test('runs the protocol end to end in English', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('input[name="artifacts_selected"][value="obs.materially_similar_role_reposted_shortly_after_rejection"]').check();
    await page.locator('input[name="stage_select"][value="technical"]').check();
    await page.locator('#step-h [data-goto="o"]').click();
    await expect(page.locator('#barriers-output')).toContainText('bar.technical_screen_live_assessment');
    await page.locator('#step-o [data-goto="b"]').click();
    await expect(page.locator('#mechanisms-output')).toContainText('mech.genuine_technical_skill_shortfall');
    await expect(page.locator('#patterns-output')).toContainText('pat.closed_then_reposted_requisition_motif');
    await page.locator('#step-b [data-goto="a"]').click();
    await expect(page.locator('#count-candidate')).toHaveText('2');
    await expect(page.locator('#probes-output')).toContainText('PROBE-A-004-1');
    await expect(page.locator('#verdict-banner')).toContainText(says('en', 'wiz.verdict'));
  });

  test.describe('in Ukrainian', () => {
    test.use({ locale: 'uk-UA' });

    test('renders Ukrainian verdicts and probe text', async ({ page }) => {
      await page.goto('/analyze');
      await page.locator('input[name="artifacts_selected"][value="obs.complete_silence_after_submission"]').check();
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

  test('scenario presets populate inputs and evaluate diagnostics', async ({ page }) => {
    await page.goto('/analyze');
    await page.locator('button[data-scenario-id="scenario.ghost_refresh"]').click();
    await expect(page.locator('input[name="stage_select"][value="sourcing"]')).toBeChecked();
    await expect(page.locator('input[name="artifacts_selected"][value="obs.complete_silence_after_submission"]')).toBeChecked();
    await expect(page.locator('input[name="artifacts_selected"][value="obs.materially_similar_role_reposted_shortly_after_rejection"]')).toBeChecked();
    await expect(page.locator('input[name="artifacts_selected"][value="obs.republished_job_posting_with_refreshed_date_and_identical_requirement_body"]')).toBeChecked();

    await page.locator('#tab-b').click();
    await expect(page.locator('#mechanisms-output')).toContainText('mech.stale_or_orphaned_job_requisition');
    await expect(page.locator('#patterns-output')).toContainText('pat.closed_then_reposted_requisition_motif');
  });
});
