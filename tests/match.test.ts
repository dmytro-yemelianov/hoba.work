import { describe, expect, it } from 'vitest';
import { loadRegistryFromRoot, resolveRegistryRoot } from '@hoba/registry';
import { matchObservations } from '../apps/web/src/lib/match';

const bundle = (lang: 'en' | 'uk') => loadRegistryFromRoot(resolveRegistryRoot(), lang);
const en = bundle('en').observations;
const uk = bundle('uk').observations;

const top = (text: string, observations = en) => matchObservations(text, observations)[0];

describe('reading a rejection back into the registry', () => {
  it('finds the trace a template rejection leaves', () => {
    const letter = `Thank you for your interest. After careful review we have decided to move forward
      with candidates whose experience more closely aligns with the requirements of the role.
      We will keep your details on file.`;
    const match = top(letter);
    expect(match?.id).toBe('obs.generic_closer_alignment_rejection_template');
    expect(match?.identified).toBe(true);
  });

  it('reads the same letter in Ukrainian into the same entry', () => {
    const letter = `Дякуємо за ваш інтерес. Після ретельного розгляду ми вирішили рухатися далі
      з кандидатами, чий досвід ближче відповідає вимогам ролі.`;
    expect(top(letter, uk)?.id).toBe('obs.generic_closer_alignment_rejection_template');
  });

  it('places a rejection that names the internal hire', () => {
    const letter = `We have filled the position internally — one of our own team members moved
      into the role, so we are closing the search and will not be proceeding with external candidates.`;
    const ids = matchObservations(letter, en)
      .slice(0, 3)
      .map((m) => m.id);
    expect(ids).toContain('obs.rejection_naming_an_internal_hire_as_the_outcome');
  });

  /**
   * A rejection that names no reason identifies nothing, and the honest answer
   * is to say so rather than to rank the ordinary hiring vocabulary it shares
   * with every entry. Ranking still happens — the reader may recognise one —
   * but nothing is presented as the answer.
   */
  it('finds no answer in a letter that names no reason', () => {
    const letter = `Thank you for your application to the backend engineer role. After careful
      review of your application we will not be moving forward.`;
    const matches = matchObservations(letter, en);
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.some((m) => m.identified)).toBe(false);
  });

  it('says a thin match is thin instead of rounding it up', () => {
    const match = top('They said no.');
    expect(match === undefined || match.identified === false).toBe(true);
  });

  it('returns nothing at all for text that is not about hiring', () => {
    expect(matchObservations('the quick brown fox jumps over the lazy dog', en)).toEqual([]);
    expect(matchObservations('', en)).toEqual([]);
  });

  it('shows the words that produced the match, so it can be argued with', () => {
    const match = top(`We are moving forward with candidates whose experience more closely aligns
      with the requirements of this role.`);
    expect(match?.hits.length).toBeGreaterThan(2);
    expect(match?.hits.every((h) => typeof h === 'string' && h.length > 0)).toBe(true);
  });

  it('carries the stages the entry is read at, so the wizard can continue from here', () => {
    const match = top(`The rejection arrived four minutes after I submitted the application,
      with no interview and no human involved.`);
    expect(match?.stages.length).toBeGreaterThan(0);
  });
});
