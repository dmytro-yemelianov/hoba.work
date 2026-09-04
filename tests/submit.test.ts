import { describe, expect, it } from 'vitest';
// @ts-expect-error plain JS worker without type declarations
import { handleSubmit, isSubmitRoute } from '../apps/web/src/worker/submit.js';

/** A D1 stand-in that records what it was asked to write. */
const db = () => {
  const rows: unknown[][] = [];
  return {
    rows,
    prepare: (sql: string) => ({
      bind: (...args: unknown[]) => ({
        run: async () => {
          rows.push([sql, ...args]);
          return { success: true };
        },
      }),
    }),
  };
};

const post = (body: unknown) =>
  new Request('https://hoba.work/submit', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });

const account =
  'A rejection arrived four minutes after I applied, with no interview and no named reason.';

describe('POST /submit', () => {
  it('answers on its own path and leaves every other alone', () => {
    expect(isSubmitRoute('/submit')).toBe(true);
    expect(isSubmitRoute('/submit/')).toBe(true);
    expect(isSubmitRoute('/submitted')).toBe(false);
    expect(isSubmitRoute('/validate/claim')).toBe(false);
  });

  it('stores an account, with the stage when it is one the registry knows', async () => {
    const store = db();
    const res = await handleSubmit(post({ body: account, stage: 'ingestion', lang: 'uk' }), {
      SUBMISSIONS: store,
    });
    expect(res.status).toBe(201);
    const [sql, , , lang, , stage, text] = store.rows[0]!;
    expect(String(sql)).toContain('INSERT INTO submissions');
    expect(lang).toBe('uk');
    expect(stage).toBe('ingestion');
    expect(text).toBe(account);
  });

  it('drops a stage the registry does not have rather than storing it', async () => {
    const store = db();
    await handleSubmit(post({ body: account, stage: 'vibes' }), { SUBMISSIONS: store });
    expect(store.rows[0]![5]).toBeNull();
  });

  /**
   * The registry may never name a real employer, and the inbox is the registry's
   * doorstep: keeping those texts is keeping the blacklist the methodology
   * exists not to be. Refused with the name quoted back so it can be removed.
   */
  it('refuses an account that names a real employer, and stores nothing', async () => {
    const store = db();
    const res = await handleSubmit(post({ body: `${account} It was Google.` }), {
      SUBMISSIONS: store,
    });
    expect(res.status).toBe(422);
    await expect(res.json()).resolves.toMatchObject({ error: 'names_a_party', party: 'Google' });
    expect(store.rows).toEqual([]);
  });

  it('checks the contact field for a name too', async () => {
    const store = db();
    const res = await handleSubmit(post({ body: account, contact: 'me@revolut.com' }), {
      SUBMISSIONS: store,
    });
    expect(res.status).toBe(422);
    expect(store.rows).toEqual([]);
  });

  it('takes a bot silently rather than telling it what failed', async () => {
    const store = db();
    const res = await handleSubmit(post({ body: account, website: 'http://spam' }), {
      SUBMISSIONS: store,
    });
    expect(res.status).toBe(202);
    expect(store.rows).toEqual([]);
  });

  it('asks for more than a fragment, and less than an essay', async () => {
    const store = db();
    expect((await handleSubmit(post({ body: 'rejected' }), { SUBMISSIONS: store })).status).toBe(
      400
    );
    expect(
      (await handleSubmit(post({ body: 'x'.repeat(4001) }), { SUBMISSIONS: store })).status
    ).toBe(400);
    expect(store.rows).toEqual([]);
  });

  it('refuses a GET, and says what it takes', async () => {
    const res = await handleSubmit(new Request('https://hoba.work/submit'), { SUBMISSIONS: db() });
    expect(res.status).toBe(405);
    await expect(res.json()).resolves.toMatchObject({ allow: 'POST' });
  });

  /** Better than a 500 that reads as "your account was lost". */
  it('says it is not taking submissions when the binding is absent', async () => {
    const res = await handleSubmit(post({ body: account }), {});
    expect(res.status).toBe(503);
  });
});
