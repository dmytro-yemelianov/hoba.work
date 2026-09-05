/** Filesystem loader for the authored coverage boundary. */
import fs from 'node:fs';
import path from 'node:path';
import { COVERAGE_MODEL_PATH } from '@hoba/registry-core/paths';
import { coverageModelSchema, type CoverageModel } from './coverage.js';

export function loadCoverageModel(root: string): CoverageModel {
  const file = path.join(root, COVERAGE_MODEL_PATH);
  const parsedJson: unknown = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const parsed = coverageModelSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(
      `${file}: ${parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ')}`
    );
  }
  return parsed.data;
}
