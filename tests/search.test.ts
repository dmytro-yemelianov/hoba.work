import { describe, expect, it } from 'vitest';
import { searchBundle } from '@hoba/registry';
import { makeBundle } from './helpers';

describe('searchBundle', () => {
  const bundle = makeBundle();

  it('ranks exact ID matches first, then title, then prose', () => {
    const hits = searchBundle(bundle, 'm-001');
    expect(hits[0].id).toBe('M-001');
    expect(hits[0].rank).toBe(0);
  });

  it('matches case-insensitively across summaries and descriptions', () => {
    expect(searchBundle(bundle, 'SUFFICIENTLY').length).toBeGreaterThan(3);
    expect(searchBundle(bundle, 'long description').map((h) => h.type)).toContain('barrier');
  });

  it('respects type filters and limits, and ignores blank queries', () => {
    expect(searchBundle(bundle, 'a', { types: ['artifact'] }).every((h) => h.type === 'artifact')).toBe(true);
    expect(searchBundle(bundle, 'a', { limit: 2 })).toHaveLength(2);
    expect(searchBundle(bundle, '   ')).toEqual([]);
  });
});
