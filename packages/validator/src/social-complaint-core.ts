/**
 * Browser-safe social-complaint extraction.
 *
 * This module intentionally has no Zod or filesystem dependency. The browser
 * and the MCP/validator facade call the same conservative phrase rules; only
 * the latter adds schema validation and source/provenance policy.
 */

export type ComplaintLanguage = 'en' | 'uk' | 'other';
export type ComplaintMappingLanguage = ComplaintLanguage | 'auto';
export type ComplaintClaimKind =
  'observation' | 'interpretation' | 'emotion' | 'causal_claim' | 'request' | 'omission';
export type ComplaintClaimStatus =
  'reported' | 'corroborated' | 'inferred' | 'contested' | 'unverifiable' | 'contradicted';
export type ComplaintConfidence = 'high' | 'medium' | 'low';

export interface ComplaintSourceSpan {
  start: number;
  end: number;
}

export interface BrowserComplaintClaim {
  id: `claim.${string}`;
  text_span: string;
  span: ComplaintSourceSpan;
  kind: ComplaintClaimKind;
  status: ComplaintClaimStatus;
  confidence: ComplaintConfidence;
}

export interface BrowserComplaintObservationMapping {
  registry_ref: `obs.${string}`;
  rule_id: `social_complaint.${string}`;
  matched_text: string;
  source_span: ComplaintSourceSpan;
  status: 'reported';
}

export interface BrowserComplaintObservation {
  claim_id: `claim.${string}`;
  text: string;
  registry_refs: Array<`obs.${string}`>;
  registry_mappings: BrowserComplaintObservationMapping[];
  status: ComplaintClaimStatus;
}

export interface BrowserComplaintExtraction {
  text: string;
  pii_detected: Array<'contact' | 'username'>;
  request_mode:
    'explanation' | 'validation' | 'advice' | 'warning_others' | 'seeking_witnesses' | 'venting';
  claims: BrowserComplaintClaim[];
  observations: BrowserComplaintObservation[];
}

export interface RedactedComplaintText {
  text: string;
  piiDetected: Array<'contact' | 'username'>;
}

const causalPattern =
  /\b(ats|algorithm|discriminat|bias|because|retaliat|blacklist|алгоритм|дискрим|упереджен|через це|бо мене)\b/i;
const emotionPattern = /\b(angry|upset|frustrat|exhaust|hate|нию|злю|виснаж|обур|ненавид)\w*\b/i;
const requestPattern = /\?|\b(why|what should|how can|порад|чому|що робити|як так)\b/i;
const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const phonePattern = /(?:\+?\d{1,3}[\s-])?(?:\(?\d{2,3}\)?[\s-])\d{3}[\s-]\d{2}[\s-]\d{2}/g;
const usernamePattern = /(^|(?<![\w.]))@[a-zA-Z0-9_]{2,}/g;

export const SOCIAL_COMPLAINT_OBSERVATION_RULESET_VERSION = '2026-09-06.1';

interface ObservationMappingRule {
  id: `social_complaint.${string}`;
  observationId: `obs.${string}`;
  language: Exclude<ComplaintLanguage, 'other'>;
  pattern: RegExp;
}

/**
 * Deliberately small, explicit phrase rules. A rule establishes only that the
 * author reported the named observation; it never establishes why it happened.
 */
const observationMappingRules: readonly ObservationMappingRule[] = [
  {
    id: 'social_complaint.en.complete_silence_after_submission',
    observationId: 'obs.complete_silence_after_submission',
    language: 'en',
    pattern:
      /\b(?:never|did not|didn't) (?:hear|heard) (?:back|anything) (?:after|following) (?:I |we )?(?:applied|applying|submitted)\b/i,
  },
  {
    id: 'social_complaint.uk.complete_silence_after_submission',
    observationId: 'obs.complete_silence_after_submission',
    language: 'uk',
    pattern:
      /(?:не|так і не) (?:відповіли|написали|почув(?:ла|ли)?) (?:після|після того як) (?:я |ми )?(?:под(?:ав|ала|али)|відгукнув(?:ся|лась|лися))/i,
  },
  {
    id: 'social_complaint.en.generic_closer_alignment_rejection',
    observationId: 'obs.generic_closer_alignment_rejection_template',
    language: 'en',
    pattern:
      /\b(?:closer alignment|decided to move forward with (?:another|other) candidate|moving forward with (?:another|other) candidate)\b/i,
  },
  {
    id: 'social_complaint.uk.generic_closer_alignment_rejection',
    observationId: 'obs.generic_closer_alignment_rejection_template',
    language: 'uk',
    pattern:
      /(?:вирішили (?:рухатися|йти) далі|обрали іншого кандидата|більш(?:е)? відповідн(?:ого|ий) кандидата)/i,
  },
  {
    id: 'social_complaint.en.recruiter_outreach_followed_by_ghosting',
    observationId: 'obs.unsolicited_recruiter_outreach_followed_by_ghosting',
    language: 'en',
    pattern:
      /\brecruiter (?:reached out|contacted me|wrote to me).{0,160}\b(?:ghosted|stopped replying|never replied)\b/i,
  },
  {
    id: 'social_complaint.uk.recruiter_outreach_followed_by_ghosting',
    observationId: 'obs.unsolicited_recruiter_outreach_followed_by_ghosting',
    language: 'uk',
    pattern:
      /рекрутер (?:написав|написала|звернувся|звернулась).{0,160}(?:зник|зникла|перестав(?:ла)? відповідати|не відповів(?:ла)?)/i,
  },
  {
    id: 'social_complaint.en.similar_role_reposted_after_rejection',
    observationId: 'obs.materially_similar_role_reposted_shortly_after_rejection',
    language: 'en',
    pattern:
      /\b(?:same|identical|near-identical) (?:job|role|position).{0,120}\b(?:reposted|posted again|refreshed)\b/i,
  },
  {
    id: 'social_complaint.uk.similar_role_reposted_after_rejection',
    observationId: 'obs.materially_similar_role_reposted_shortly_after_rejection',
    language: 'uk',
    pattern:
      /(?:ту саму|ідентичну|майже ідентичну) (?:вакансію|роль|посаду).{0,120}(?:опублікували знову|переопублікували|оновили)/i,
  },
  {
    id: 'social_complaint.en.rejection_within_minutes',
    observationId: 'obs.rejection_within_minutes_of_application_submission',
    language: 'en',
    pattern:
      /\b(?:rejected|rejection) (?:within|in) (?:\d+|one|two|three|four|five|ten|fifteen|twenty|thirty) minutes? (?:of|after) (?:applying|submission)\b/i,
  },
  {
    id: 'social_complaint.uk.rejection_within_minutes',
    observationId: 'obs.rejection_within_minutes_of_application_submission',
    language: 'uk',
    pattern:
      /відмов(?:или|а) (?:за|через) (?:\d+|одну|дві|три|чотири|п'ять|десять|п'ятнадцять|двадцять|тридцять) хвилин(?:и)? (?:після|від) подачі/i,
  },
  {
    id: 'social_complaint.en.pending_for_months_then_rejection',
    observationId: 'obs.rejection_after_the_application_sat_pending_for_months',
    language: 'en',
    pattern:
      /\b(?:application|my application) (?:sat )?pending for (?:\d+|several|many) months?.{0,120}\b(?:rejected|rejection)\b/i,
  },
  {
    id: 'social_complaint.uk.pending_for_months_then_rejection',
    observationId: 'obs.rejection_after_the_application_sat_pending_for_months',
    language: 'uk',
    pattern:
      /(?:заявка|відгук) (?:висів|була в статусі очікування) (?:\d+|кілька) місяц(?:і|ів).{0,120}відмов(?:или|а)/i,
  },
  {
    id: 'social_complaint.en.internal_hire_named',
    observationId: 'obs.rejection_naming_an_internal_hire_as_the_outcome',
    language: 'en',
    pattern: /\b(?:they|the company) (?:hired|selected) an internal candidate\b/i,
  },
  {
    id: 'social_complaint.uk.internal_hire_named',
    observationId: 'obs.rejection_naming_an_internal_hire_as_the_outcome',
    language: 'uk',
    pattern: /(?:взяли|обрали) внутрішнього кандидата/i,
  },
  {
    id: 'social_complaint.en.interview_rescheduled_or_no_show',
    observationId: 'obs.multiple_interview_reschedulings_or_interviewer_no_show',
    language: 'en',
    pattern:
      /\b(?:interview (?:was )?(?:rescheduled|cancelled) (?:again|twice|multiple times)|interviewer (?:did not|didn't) show)\b/i,
  },
  {
    id: 'social_complaint.uk.interview_rescheduled_or_no_show',
    observationId: 'obs.multiple_interview_reschedulings_or_interviewer_no_show',
    language: 'uk',
    pattern:
      /(?:співбесіду (?:знову |двічі |кілька разів )?(?:перенесли|скасували)|інтерв'юер не з[’']явився)/i,
  },
];

/** Redact deterministic, high-confidence PII forms before producing output. */
export function redactComplaintText(text: string): RedactedComplaintText {
  const piiDetected = new Set<'contact' | 'username'>();
  let redacted = text.replace(emailPattern, () => {
    piiDetected.add('contact');
    return '[redacted contact]';
  });
  redacted = redacted.replace(phonePattern, () => {
    piiDetected.add('contact');
    return '[redacted contact]';
  });
  redacted = redacted.replace(usernamePattern, (_match, prefix: string) => {
    piiDetected.add('username');
    return `${prefix}[redacted username]`;
  });
  return { text: redacted, piiDetected: [...piiDetected] };
}

function classifyClaim(
  text: string
): Pick<BrowserComplaintClaim, 'kind' | 'status' | 'confidence'> {
  if (causalPattern.test(text)) {
    return { kind: 'causal_claim', status: 'unverifiable', confidence: 'low' };
  }
  if (emotionPattern.test(text)) {
    return { kind: 'emotion', status: 'reported', confidence: 'medium' };
  }
  if (requestPattern.test(text)) {
    return { kind: 'request', status: 'reported', confidence: 'medium' };
  }
  return { kind: 'observation', status: 'reported', confidence: 'medium' };
}

/** Segment already-redacted prose without inferring ontology coordinates or causes. */
export function extractComplaintClaims(input: { text: string }): BrowserComplaintClaim[] {
  const claims: BrowserComplaintClaim[] = [];
  const sentencePattern = /[^.!?]+(?:[.!?]+|$)/g;
  for (const match of input.text.matchAll(sentencePattern)) {
    const raw = match[0] ?? '';
    const leadingWhitespace = raw.match(/^\s*/)?.[0].length ?? 0;
    const text = raw.trim();
    if (!text) continue;
    const start = (match.index ?? 0) + leadingWhitespace;
    claims.push({
      id: `claim.${claims.length + 1}`,
      text_span: text,
      span: { start, end: start + text.length },
      ...classifyClaim(text),
    });
  }
  return claims;
}

function requestModeFor(
  claims: readonly BrowserComplaintClaim[]
): BrowserComplaintExtraction['request_mode'] {
  if (claims.some((claim) => claim.kind === 'request')) return 'explanation';
  if (claims.some((claim) => claim.kind === 'emotion')) return 'venting';
  return 'explanation';
}

function findRuleMatches(text: string, rule: ObservationMappingRule): RegExpMatchArray[] {
  const flags = rule.pattern.flags.includes('g') ? rule.pattern.flags : `${rule.pattern.flags}g`;
  return [...text.matchAll(new RegExp(rule.pattern.source, flags))];
}

/** Map only explicit reported phrases to existing observation IDs with provenance. */
export function mapComplaintObservations(
  claims: readonly BrowserComplaintClaim[],
  language: ComplaintMappingLanguage
): Map<string, BrowserComplaintObservationMapping[]> {
  const mappings = new Map<string, BrowserComplaintObservationMapping[]>();
  if (language !== 'en' && language !== 'uk' && language !== 'auto') return mappings;

  for (const claim of claims) {
    if (claim.kind !== 'observation' || claim.status !== 'reported') continue;
    const claimMappings: BrowserComplaintObservationMapping[] = [];
    for (const rule of observationMappingRules) {
      if (language !== 'auto' && rule.language !== language) continue;
      for (const match of findRuleMatches(claim.text_span, rule)) {
        const matchedText = match[0];
        const localStart = match.index ?? 0;
        claimMappings.push({
          registry_ref: rule.observationId,
          rule_id: rule.id,
          matched_text: matchedText,
          source_span: {
            start: claim.span.start + localStart,
            end: claim.span.start + localStart + matchedText.length,
          },
          status: 'reported',
        });
      }
    }
    if (claimMappings.length > 0) mappings.set(claim.id, claimMappings);
  }
  return mappings;
}

/**
 * Extract conservative, explainable complaint structure in any browser-safe
 * runtime. No cause or case-space coordinate is inferred from prose.
 */
export function extractSocialComplaint(input: {
  text: string;
  language: ComplaintMappingLanguage;
}): BrowserComplaintExtraction {
  const redaction = redactComplaintText(input.text);
  const claims = extractComplaintClaims({ text: redaction.text });
  const mappingsByClaim = mapComplaintObservations(claims, input.language);
  const observations = claims
    .filter((claim) => claim.kind === 'observation')
    .map((claim) => {
      const registryMappings = mappingsByClaim.get(claim.id) ?? [];
      return {
        claim_id: claim.id,
        text: claim.text_span,
        registry_refs: [...new Set(registryMappings.map((mapping) => mapping.registry_ref))],
        registry_mappings: registryMappings,
        status: claim.status,
      };
    });

  return {
    text: redaction.text,
    pii_detected: redaction.piiDetected,
    request_mode: requestModeFor(claims),
    claims,
    observations,
  };
}
