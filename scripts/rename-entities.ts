/**
 * Renames every entity of one type from its short code to its dotted-namespace
 * ID, using migration/id-mapping.json (generated in Phase 1) as the source of
 * truth. Per entity: rewrites every quoted reference across content/,
 * content-uk/, and evidence/ (applyIdRename), computes the git-mv plan for
 * every language tree it exists in (planFileRename), performs the git mv,
 * then inserts an `aliases:` entry recording the old code (insertAlias).
 *
 *   pnpm rename-entities --type pattern --dir patterns
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { applyIdRename, insertAlias, planFileRename, resolveRegistryRoot } from '@hoba/registry';

const args = process.argv.slice(2);
const typeIdx = args.indexOf('--type');
const dirIdx = args.indexOf('--dir');
const typeArg = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
const dirArg = dirIdx !== -1 ? args[dirIdx + 1] : undefined;
if (!typeArg || !dirArg) {
  console.error('Usage: pnpm rename-entities --type <entity-type> --dir <content-directory-name>');
  process.exit(1);
}

const root = resolveRegistryRoot();
const mapping = JSON.parse(fs.readFileSync(path.join(root, 'migration', 'id-mapping.json'), 'utf8')) as {
  mappings: Array<{ oldId: string; newId: string; type: string }>;
};

const entries = mapping.mappings.filter((m) => m.type === typeArg);
if (entries.length === 0) {
  console.error(`No entries of type "${typeArg}" found in migration/id-mapping.json.`);
  process.exit(1);
}

console.log(`Renaming ${entries.length} ${typeArg} entit${entries.length === 1 ? 'y' : 'ies'}...`);

for (const { oldId, newId } of entries) {
  const { filesChanged } = applyIdRename(root, oldId, newId);
  console.log(`  ${oldId} -> ${newId}: rewrote ${filesChanged.length} file(s)`);

  const renames = planFileRename(root, dirArg, oldId, newId);
  for (const { oldPath, newPath } of renames) {
    execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: root, stdio: 'inherit' });
    insertAlias(newPath, oldId);
  }
}

console.log('Done. Review the diff, then run: pnpm validate && pnpm typecheck && pnpm test');
