import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();

// 1. Evidence Records
const evidenceRecords = [
  {
    id: 'EVD-001',
    type: 'evidence',
    title: 'Labor Market Screening & ATS Extraction Dynamics',
    kind: 'research',
    summary: 'Empirical studies on automated resume parsing failure rates, keyword filtering thresholds, and recruiter scanning latency.',
    citation: 'Benchmark Report on Technical Recruitment Funnels & Parsing Variance (2024–2026)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2024-2026'
  },
  {
    id: 'EVD-002',
    type: 'evidence',
    title: 'Career Mobility and Seniority Tier Boundary Studies',
    kind: 'reporting',
    summary: 'Analysis of leveling mismatches, overqualification penalties, and leveling bands in engineering hiring.',
    citation: 'Engineering Leveling & Compensation Transparency Field Analysis (2025)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2025-2026'
  },
  {
    id: 'EVD-003',
    type: 'evidence',
    title: 'Unemployment Duration & Automated Downranking Research',
    kind: 'research',
    summary: 'Quantitative investigation into automated ranking penalties associated with employment resume gaps.',
    citation: 'Algorithmic Hiring Discrimination and Employment Gap Signals (2024)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2024-2025'
  },
  {
    id: 'EVD-004',
    type: 'evidence',
    title: 'Requisition Lifecycle & Headcount Volatility Industry Data',
    kind: 'survey',
    summary: 'Survey on orphan requisitions, post-interview budget freezes, and compliance-driven public job postings.',
    citation: 'Talent Acquisition Operations and Requisition Shelf-Life Survey (2025)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2025'
  },
  {
    id: 'EVD-005',
    type: 'evidence',
    title: 'Compensation Transparency & Pipeline Quality Studies',
    kind: 'primary',
    summary: 'Measurement of offer acceptance rates and late-stage dropouts following early salary band disclosures.',
    citation: 'Pay Transparency Impact on Technical Hiring Retention (2025)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2025-2026'
  },
  {
    id: 'EVD-006',
    type: 'evidence',
    title: 'Technical Evaluation Rubrics & Interviewer Variance Benchmarks',
    kind: 'research',
    summary: 'Statistical evaluation of inter-rater reliability among technical interviewers and take-home reviewers.',
    citation: 'Structured Rubric Calibration vs Unstructured Technical Assessment (2024)',
    url: 'https://hoba.work/methodology#evidence',
    period: '2024-2026'
  }
];

// Write Evidence files
fs.mkdirSync(path.join(rootDir, 'evidence'), { recursive: true });
for (const ev of evidenceRecords) {
  const yamlContent = `---
id: ${ev.id}
type: ${ev.type}
title: "${ev.title}"
kind: ${ev.kind}
summary: >-
  ${ev.summary}
citation: "${ev.citation}"
url: "${ev.url}"
period: "${ev.period}"
---

# ${ev.title}

${ev.summary}

- **Kind:** \`${ev.kind}\`
- **Citation:** ${ev.citation}
- **Reference:** [Methodology](${ev.url})
`;
  fs.writeFileSync(path.join(rootDir, 'evidence', `${ev.id}.md`), yamlContent, 'utf-8');
}

console.log(`Generated ${evidenceRecords.length} evidence records.`);
