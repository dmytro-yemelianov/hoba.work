# Invariants

1. **`pnpm task check` is green after every commit.**
   Every cycle must pass all 6 checks:
   - `validate:strict` (schema & specimen checks)
   - `typecheck`
   - `test` (unit & equivalence tests)
   - `build` + `build:cards` (Astro static build + Satori/Resvg cards)
   - `lean` (Lake formal proofs)
   - `e2e` (Playwright browser & a11y)

2. **The Equivalence Gate holds at all times.**
   - `lift(bundle) → Substrate` and `project(substrate) → bundle` must deep-equal the loader's output for both `en` and `uk` mirrors.
   - The substrate is authoritative for structure; no stripped structural field (`title`, `pass_condition`, `operates_at`, `emissions`) may survive in the sidecar.

3. **Bilingual Parity.**
   - Every authored addition in `content/` must land in `content-uk/` in the same commit.
   - Ukrainian and English content are judged on their own, never as unedited machine translations.
