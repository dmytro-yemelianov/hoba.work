/**
 * Named parties the registry must never contain.
 *
 * This is not a lint preference. ROADMAP lists it under a heading that says
 * "Not scheduled yet" and means never: *"Anything that would put a real
 * company or person into the registry. The methodology forbids it and the
 * tests enforce it."* An atlas that names an employer becomes the blacklist
 * its own methodology exists to not be.
 *
 * One list, because there were two — an identical copy in `tests/` and another
 * in `scripts/task.mjs`, held in step by nothing. Adding a name to one and not
 * the other would leave the chore and the gate disagreeing about a rule that is
 * supposed to be absolute.
 */
export const FORBIDDEN_PARTIES = [
  'Google',
  'Meta',
  'Amazon',
  'Microsoft',
  'Apple',
  'Netflix',
  'Uber',
  'Stripe',
  'Revolut',
  'Monobank',
  'PrivatBank',
  'EPAM',
  'SoftServe',
  'Luxoft',
] as const;

/**
 * Matches a named party as a word.
 *
 * Built fresh on each call: a shared literal with the `g` flag carries
 * `lastIndex` between calls and would skip every other match. Without `g` here,
 * but a fresh object is still the honest default for a shared export.
 */
export const forbiddenPartyPattern = (): RegExp =>
  new RegExp(String.raw`\b(${FORBIDDEN_PARTIES.join('|')})\b`, 'i');

/** The named party in `text`, or null. Scoped by the caller — see the note in `tests/content.test.ts`. */
export function namesForbiddenParty(text: string): string | null {
  return text.match(forbiddenPartyPattern())?.[0] ?? null;
}
