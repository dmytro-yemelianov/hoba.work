import { ui } from '../site/src/i18n/ui';

/**
 * A dictionary string as a matcher.
 *
 * These specs test behaviour, not wording. Pinning prose meant every copy edit
 * broke eleven tests at once and taught the next editor to change the tests
 * instead of the copy. Matching the dictionary still catches the real failure —
 * the wrong string, or none — and survives the right kind of change.
 */
export const says = (lang: 'en' | 'uk', key: keyof typeof ui.en): RegExp =>
  new RegExp(
    String(ui[lang][key])
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\\\{\w+\\\}/g, '.+')
  );

import { findRegistryRoot, loadRegistryFromRoot } from '@hoba/registry';

/**
 * How many entries the registry actually holds.
 *
 * Pinning the number meant every entry added broke two tests that had nothing
 * to do with the registry's size. What those tests are for is that the page
 * shows all of them.
 */
export const entryCount = (): number => {
  const b = loadRegistryFromRoot(findRegistryRoot(process.cwd())!, 'en');
  return b.observations.length + b.barriers.length + b.mechanisms.length +
    b.patterns.length + b.loops.length + b.interventions.length;
};
