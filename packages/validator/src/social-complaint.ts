import { z } from 'zod';

const sourceKindSchema = z.enum([
  'social_post',
  'first_person_report',
  'second_hand_report',
  'advice_request',
  'rant',
  'question',
  'workplace_document',
  'news_report',
  'conversation',
  'other',
]);

export const complaintInputSchema = z.object({
  text: z.string().trim().min(1),
  source: z
    .object({
      kind: sourceKindSchema.default('social_post'),
      platform: z.enum(['reddit', 'linkedin', 'x', 'forum', 'email', 'other']).optional(),
      url: z.string().url().optional(),
      published_at: z.string().datetime().optional(),
      author_consent: z.enum(['not_requested', 'granted', 'denied']).default('not_requested'),
    })
    .default({ kind: 'social_post', author_consent: 'not_requested' }),
  language: z.enum(['en', 'uk', 'other']).default('other'),
  attachments: z
    .array(z.object({ kind: z.enum(['document', 'image', 'link']), label: z.string().optional() }))
    .default([]),
});

export const claimStatusSchema = z.enum([
  'reported',
  'corroborated',
  'inferred',
  'contested',
  'unverifiable',
  'contradicted',
]);

const sourceSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().positive(),
});

export const complaintClaimSchema = z.object({
  id: z.string().regex(/^claim\.[a-z0-9_]+$/),
  text_span: z.string().min(1),
  span: sourceSpanSchema,
  kind: z.enum(['observation', 'interpretation', 'emotion', 'causal_claim', 'request', 'omission']),
  status: claimStatusSchema,
  confidence: z.enum(['high', 'medium', 'low']),
  supports_observations: z.array(z.string()).optional(),
});

export const complaintPrivacySchema = z.object({
  pii_detected: z.array(z.enum(['name', 'contact', 'address', 'username', 'identifier'])),
  redaction_applied: z.boolean(),
  /** Phase 1 cannot reliably identify names or addresses from free text. */
  manual_review_required: z.boolean(),
  undetected_pii_risks: z.array(z.enum(['name', 'address', 'identifier'])),
  /** Source URLs are deliberately omitted from analysis output. */
  source_url_withheld: z.boolean(),
  corpus_contribution: z.enum(['not_requested', 'consented', 'declined']),
});

export const complaintAnalysisSchema = z.object({
  /** Redacted input only; callers retain raw input, never this analysis object. */
  source: complaintInputSchema,
  request_mode: z.enum([
    'explanation',
    'validation',
    'advice',
    'warning_others',
    'seeking_witnesses',
    'venting',
  ]),
  claims: z.array(complaintClaimSchema),
  observations: z.array(
    z.object({
      claim_id: z.string().regex(/^claim\.[a-z0-9_]+$/),
      text: z.string().min(1),
      registry_refs: z.array(z.string().regex(/^obs\.[a-z0-9_]+$/)),
      /**
       * Direct phrase matches only. These are provenance records, not model
       * inferences: each mapping points back to a reported claim/span/rule.
       */
      registry_mappings: z.array(
        z.object({
          registry_ref: z.string().regex(/^obs\.[a-z0-9_]+$/),
          rule_id: z.string().regex(/^social_complaint\.[a-z0-9_.-]+$/),
          matched_text: z.string().min(1),
          source_span: sourceSpanSchema,
          status: z.literal('reported'),
        })
      ),
      status: claimStatusSchema,
    })
  ),
  projection: z.array(
    z.object({
      coordinate: z.string().min(1),
      value: z.union([z.string(), z.array(z.string())]),
      claim_id: z.string().regex(/^claim\.[a-z0-9_]+$/),
      status: z.enum(['reported', 'corroborated', 'inferred', 'unknown']),
    })
  ),
  nearby_cases: z.array(z.string()),
  uncertainty: z.array(z.string()),
  next_tests: z.array(z.string()),
  prohibited_conclusions: z.array(z.string()),
  privacy: complaintPrivacySchema,
});

export type ComplaintInput = z.infer<typeof complaintInputSchema>;
export type ComplaintClaim = z.infer<typeof complaintClaimSchema>;
export type ComplaintAnalysis = z.infer<typeof complaintAnalysisSchema>;
export type ComplaintObservationMapping =
  ComplaintAnalysis['observations'][number]['registry_mappings'][number];

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
  language: 'en' | 'uk';
  pattern: RegExp;
}

/**
 * Deliberately small, explicit phrase rules. A phrase rule establishes only
 * that the author reported the named observation; it never establishes why it
 * happened. Rules run only against claims already classified as observations.
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

function classifyClaim(text: string): Pick<ComplaintClaim, 'kind' | 'status' | 'confidence'> {
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

/**
 * Conservative Phase-1 extraction. It deliberately does not infer ontology
 * coordinates or causes. Source spans refer to the redacted text returned in
 * ComplaintAnalysis.source.text.
 */
export function extractComplaintClaims(input: ComplaintInput): ComplaintClaim[] {
  const claims: ComplaintClaim[] = [];
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

function requestModeFor(claims: readonly ComplaintClaim[]): ComplaintAnalysis['request_mode'] {
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
  claims: readonly ComplaintClaim[],
  language: ComplaintInput['language']
): Map<string, ComplaintObservationMapping[]> {
  const mappings = new Map<string, ComplaintObservationMapping[]>();
  if (language !== 'en' && language !== 'uk') return mappings;

  for (const claim of claims) {
    if (claim.kind !== 'observation' || claim.status !== 'reported') continue;
    const claimMappings: ComplaintObservationMapping[] = [];
    for (const rule of observationMappingRules) {
      if (rule.language !== language) continue;
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
 * Phase-2a normalized analysis. It maps only explicit reported phrases to
 * observations. Case-space coordinates remain empty until explicit coordinate
 * rules can be validated against Γ.
 */
export function analyzeSocialComplaint(rawInput: unknown): ComplaintAnalysis {
  const input = complaintInputSchema.parse(rawInput);
  const redaction = redactComplaintText(input.text);
  const source = {
    ...input,
    text: redaction.text,
    source: { ...input.source, url: undefined },
  };
  const claims = extractComplaintClaims(source);
  const mappingsByClaim = mapComplaintObservations(claims, source.language);
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

  return complaintAnalysisSchema.parse({
    source,
    request_mode: requestModeFor(claims),
    claims,
    observations,
    projection: [],
    nearby_cases: [],
    uncertainty: [
      `Phase 2a maps only explicit phrases using ruleset ${SOCIAL_COMPLAINT_OBSERVATION_RULESET_VERSION}; unmatched text remains unmapped.`,
      'Case-space coordinates remain unknown until an explicit, Γ-validated coordinate rule exists.',
      'Causal claims remain unverifiable unless independently corroborated.',
    ],
    next_tests:
      observations.length === 0
        ? ['Add a concrete timeline, funnel stage, and exact wording of any response.']
        : [
            'Add the hiring stage, timeline, and exact response wording before comparing scenarios.',
          ],
    prohibited_conclusions: [
      'Do not infer a hidden cause, protected-trait discrimination, or author intent from this complaint alone.',
      'Do not treat one social post as prevalence evidence.',
    ],
    privacy: {
      pii_detected: redaction.piiDetected,
      redaction_applied: redaction.piiDetected.length > 0,
      manual_review_required: true,
      undetected_pii_risks: ['name', 'address', 'identifier'],
      source_url_withheld: Boolean(input.source.url),
      corpus_contribution:
        input.source.author_consent === 'granted'
          ? 'consented'
          : input.source.author_consent === 'denied'
            ? 'declined'
            : 'not_requested',
    },
  });
}

export function validateComplaintAnalysis(input: unknown): ComplaintAnalysis {
  return complaintAnalysisSchema.parse(input);
}
