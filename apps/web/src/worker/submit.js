/**
 * POST /submit — what a reader sends when the atlas does not contain what
 * happened to them.
 *
 * The gap this closes is specific: /contribute points at GitHub, which is fine
 * for a researcher and a wall for a candidate who has just been rejected and
 * has no account. That reader is the one whose absence from the registry the
 * registry most needs to hear about.
 *
 * A submission is testimony, not an entry. Nothing here is rendered on the
 * site, and turning one into the other is editorial work — which is why the
 * row lands with status 'new' and stays there until a person reads it.
 */
import { FORBIDDEN_PARTIES, namesForbiddenParty, stageIdSchema } from '@hoba/registry/edge';

const LIMITS = { body: 4000, contact: 200, stage: 40, reader: 20 };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

export function isSubmitRoute(pathname) {
  return pathname.replace(/\/$/, '') === '/submit';
}

export async function handleSubmit(request, env) {
  if (request.method !== 'POST') return json({ error: 'method not allowed', allow: 'POST' }, 405);
  if (!env?.SUBMISSIONS) return json({ error: 'submissions are not accepting right now' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'body must be JSON' }, 400);
  }

  // A field a person never sees and a script always fills.
  if (typeof body?.website === 'string' && body.website.length > 0) return json({ ok: true }, 202);

  const text = typeof body?.body === 'string' ? body.body.trim() : '';
  if (text.length < 40) return json({ error: 'too_short', field: 'body' }, 400);
  if (text.length > LIMITS.body) return json({ error: 'too_long', field: 'body', max: LIMITS.body }, 400);

  const contact = typeof body?.contact === 'string' ? body.contact.trim().slice(0, LIMITS.contact) : null;
  const reader = typeof body?.reader === 'string' ? body.reader.trim().slice(0, LIMITS.reader) : null;
  const lang = body?.lang === 'uk' ? 'uk' : 'en';

  let stage = typeof body?.stage === 'string' ? body.stage.trim().slice(0, LIMITS.stage) : null;
  if (stage && !stageIdSchema.options.includes(stage)) stage = null;

  // The registry may never name a real employer, and neither may the inbox:
  // storing those texts is keeping the blacklist the methodology exists not to
  // be. Refused with the name quoted back, so it can be removed and resent.
  const named = namesForbiddenParty(`${text}\n${contact ?? ''}`);
  if (named) {
    return json({ error: 'names_a_party', party: named, parties: FORBIDDEN_PARTIES.length }, 422);
  }

  const id = crypto.randomUUID();
  await env.SUBMISSIONS.prepare(
    'INSERT INTO submissions (id, created_at, lang, reader, stage, body, contact) VALUES (?, ?, ?, ?, ?, ?, ?)'
  )
    .bind(id, new Date().toISOString(), lang, reader, stage, text, contact || null)
    .run();

  return json({ ok: true, id }, 201);
}
