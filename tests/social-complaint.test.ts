import { describe, expect, it } from 'vitest';
import {
  analyzeSocialComplaint,
  complaintAnalysisSchema,
  complaintInputSchema,
  extractComplaintClaims,
  redactComplaintText,
} from '@hoba/validator';

describe('social complaint intake contract', () => {
  it('keeps causal language separate from reported observations', () => {
    const input = complaintInputSchema.parse({
      text: 'I applied to 30 jobs. The ATS rejected me. I am exhausted.',
      language: 'en',
    });
    const claims = extractComplaintClaims(input);
    expect(claims.map((claim) => claim.kind)).toEqual(['observation', 'causal_claim', 'emotion']);
    expect(claims[1]?.status).toBe('unverifiable');
    expect(claims[0]?.span).toEqual({ start: 0, end: 21 });
  });

  it('preserves a venting request without treating it as invalid', () => {
    const parsed = complaintAnalysisSchema.safeParse({
      source: { text: 'Why does this keep happening?', language: 'en' },
      request_mode: 'venting',
      claims: [
        {
          id: 'claim.1',
          text_span: 'Why does this keep happening?',
          span: { start: 0, end: 28 },
          kind: 'request',
          status: 'unverifiable',
          confidence: 'low',
        },
      ],
      observations: [],
      projection: [],
      nearby_cases: [],
      uncertainty: ['No concrete timeline supplied.'],
      next_tests: [],
      prohibited_conclusions: ['The author is irrational.'],
      privacy: {
        pii_detected: [],
        redaction_applied: false,
        manual_review_required: true,
        undetected_pii_risks: ['name', 'address', 'identifier'],
        source_url_withheld: false,
        corpus_contribution: 'not_requested',
      },
    });
    expect(parsed.success).toBe(true);
  });

  it('redacts deterministic contact details and withholds source URLs from output', () => {
    const analysis = analyzeSocialComplaint({
      text: 'I applied to 30 jobs. Contact me at me@example.com or +380 50 123 45 67.',
      source: { url: 'https://example.com/post', author_consent: 'not_requested' },
      language: 'en',
    });
    expect(analysis.source.text).not.toContain('me@example.com');
    expect(analysis.source.text).not.toContain('+380 50 123 45 67');
    expect(analysis.source.source.url).toBeUndefined();
    expect(analysis.privacy).toMatchObject({
      pii_detected: ['contact'],
      redaction_applied: true,
      manual_review_required: true,
      undetected_pii_risks: ['name', 'address', 'identifier'],
      source_url_withheld: true,
    });
    expect(analysis.claims[0]?.kind).toBe('observation');
    expect(analysis.projection).toEqual([]);
    expect(analysis.nearby_cases).toEqual([]);
  });

  it('does not classify a generic Ukrainian reference to someone as a causal claim', () => {
    const redacted = redactComplaintText('Хтось із рекрутерів не відповів після дзвінка.');
    const claims = extractComplaintClaims(
      complaintInputSchema.parse({ text: redacted.text, language: 'uk' })
    );
    expect(claims[0]).toMatchObject({ kind: 'observation', status: 'reported' });
  });

  it('maps direct English observations with rule provenance but never causal claims', () => {
    const analysis = analyzeSocialComplaint({
      text: 'I never heard back after applying. The same job was reposted. The ATS rejected me.',
      language: 'en',
    });

    expect(analysis.observations.map((observation) => observation.registry_refs)).toEqual([
      ['obs.complete_silence_after_submission'],
      ['obs.materially_similar_role_reposted_shortly_after_rejection'],
    ]);
    expect(analysis.observations[0]?.registry_mappings[0]).toMatchObject({
      rule_id: 'social_complaint.en.complete_silence_after_submission',
      matched_text: 'never heard back after applying',
      status: 'reported',
    });
    expect(analysis.claims[2]).toMatchObject({ kind: 'causal_claim', status: 'unverifiable' });
    expect(analysis.projection).toEqual([]);
  });

  it('maps direct Ukrainian observations with their own phrase rule', () => {
    const analysis = analyzeSocialComplaint({
      text: 'Я подав заявку, але не відповіли після того як я подав. Згодом ту саму вакансію переопублікували.',
      language: 'uk',
    });

    expect(analysis.observations.flatMap((observation) => observation.registry_refs)).toEqual([
      'obs.complete_silence_after_submission',
      'obs.materially_similar_role_reposted_shortly_after_rejection',
    ]);
    expect(analysis.observations[1]?.registry_mappings[0]?.rule_id).toBe(
      'social_complaint.uk.similar_role_reposted_after_rejection'
    );
  });
});
