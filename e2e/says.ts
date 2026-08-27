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
