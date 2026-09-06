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

/**
 * Phase-1 normalized analysis. It intentionally stops before case-space
 * projection: only explicit registry mappings may enter Phase 2.
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
  const observations = claims
    .filter((claim) => claim.kind === 'observation')
    .map((claim) => ({
      claim_id: claim.id,
      text: claim.text_span,
      registry_refs: [],
      status: claim.status,
    }));

  return complaintAnalysisSchema.parse({
    source,
    request_mode: requestModeFor(claims),
    claims,
    observations,
    projection: [],
    nearby_cases: [],
    uncertainty: [
      'Phase 1 does not map free text to registry observations or case-space coordinates.',
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
