<!-- What changed and why. If it closes an issue, say "Closes #N". -->

## Checks

`pnpm task check` runs these in order and stops at the first failure.

- [ ] `registry` — validates strictly, both mirrors structurally identical
- [ ] `types` — `tsc` clean
- [ ] `unit` — vitest
- [ ] `build` — and `git diff --exit-code -- schemas site/public` stays clean
- [ ] `browser` — Playwright and axe

## If this touched content

- [ ] Both language mirrors updated
- [ ] Non-inferences stated on every new entry
- [ ] No company, product or person named — `pnpm task specimens` passes

## If this touched the layout

- [ ] Screenshots at 390 / 768 / 1440, both themes (`pnpm task shots <path>`)
- [ ] The page frame check still passes
