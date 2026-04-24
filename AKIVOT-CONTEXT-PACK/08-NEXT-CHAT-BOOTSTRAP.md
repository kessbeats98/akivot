# Next Chat Bootstrap

Use the text below at the start of a new chat.

## Fastest Valid Read Path
If the next chat needs the shortest high-signal path before acting, read these first:

1. `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
2. `AKIVOT-CONTEXT-PACK/04-CURRENT-PROJECT-STATE.md`
3. `AKIVOT-CONTEXT-PACK/06-RECENT-EXECUTION-STATUS.md`
4. `AKIVOT-CONTEXT-PACK/07-DEBUG-FINDINGS.md`
5. `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md`

Then use the full ordered list below if more background is needed.

```text
Continue Akivot from the existing context pack.

Read these files first, in order:
1. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\CONTEXT.MD
2. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\01-MISSION-AND-ROLE.md
3. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\02-PRODUCT-PRINCIPLES.md
4. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\03-HISTORICAL-CHAT-SOURCES.md
5. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\04-CURRENT-PROJECT-STATE.md
6. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\05-ROADMAP-PHASES.md
7. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\06-RECENT-EXECUTION-STATUS.md
8. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\07-DEBUG-FINDINGS.md
9. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\09-OPEN-PRODUCT-QUESTIONS.md
10. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\10-TARGET-WORKFLOWS.md
11. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\11-V11-EXECUTION-PLAN.md
12. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\12-PHASE4-PRODUCTION-VERIFICATION-PROTOCOL.md
13. F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\08-NEXT-CHAT-BOOTSTRAP.md

Also read:
- F:\ak\avner-lite\.avner\STATE.md

Also keep this roadmap in view:
F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md

Historical chat-source files used to derive the product principles:
- F:\ak\AKIVOTE CONTEXT DETER\LAST CHAT MESSAGES .txt
- F:\ak\AKIVOTE CONTEXT DETER\New Text Document (9).txt

Authority model for this task:
- The Akivot context-pack files above, plus
  F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md
  are the product source of truth.
- Files such as:
  - F:\ak\avner-lite\CLAUDE.md
  - F:\ak\avner-lite\.claude\rules\01-protocol.md
  - other auto-loaded memory/rules/skills files
  are execution-discipline guidance only, not product-direction authority.
- If there is any tension, preserve the product direction from the context pack + roadmap and use the CLAUDE/rules files only for process and safety discipline.

Rules:
- Do not invent new product principles.
- Continue from current repo state.
- Inspect git status before editing.
- Treat Phase 1 as complete unless you find a real contradiction in the current code.
- Treat owner-home Phase 2 as shipped and closed by default.
- Treat walker Phase 3 as shipped and production-verified.
- Treat Phase 4 as shipped, production-verified, and DONE.
- Treat Phase 5 hierarchy/demotion work as substantially complete locally.
- Treat Phase 6 as validated and closed:
  - Step A owner setup-loop validation was manually proven end-to-end on fresh verified owner + walker accounts
  - Step B price guardrail already passed locally
  - Step C walker daily loop already passed on production
- Treat the installed PWA path on phone as the only valid mobile notification signoff path.
- Keep the broader complete-app target in view:
  - owner setup loop
  - owner daily reassurance loop
  - walker onboarding loop
  - walker daily action loop
  - schedule / billing / notification depth
- Do not reopen resolved owner slices unless you find a real defect.
- Keep these follow-up QA gaps visible:
  - Phase 2 first-time price state on production data
  - Phase 3 blocked price-unset runtime path
- Keep these follow-up product issues visible:
  - production icon rendering shows Material Symbols labels as raw text on multiple screens
- Keep this new local implementation visible:
  - owner -> walker assignment hardening is implemented locally through invite-code lookup + explicit confirmation
  - walker invite code is surfaced in a minimal `/walker/settings` surface with copy action
  - this batch is not production-verified yet because no deploy happened after implementation
- Keep these non-blocking cleanup items visible:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
- Keep these continuation cautions visible:
  - `c43535b` is a test-only commit that keeps Phase 6 Step C reproducible
  - local `qa/tests/price-enforcement.spec.ts` passed `2/2` but is currently local-only / untracked
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it

Immediate objective:
- confirm current worktree state
- review the current stop point in 06-RECENT-EXECUTION-STATUS.md, 07-DEBUG-FINDINGS.md, and 11-V11-EXECUTION-PLAN.md
- read 12-PHASE4-PRODUCTION-VERIFICATION-PROTOCOL.md as the completed signoff record, not as an active gate
- prefer the newest override blocks in 06 / 07 / 12 over older lower sections if they conflict
- inspect `qa/.env.qa` only as needed to confirm fixture presence; do not print secrets back out
- inspect the local diff in:
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx`
- inspect the local Phase 5 hierarchy slices in:
  - `src/components/layout/owner-nav.tsx`
  - `src/app/owner/billing/OwnerBillingClient.tsx`
  - `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - `src/app/owner/dogs/OwnerDogsClient.tsx`
  - `src/app/owner/settings/page.tsx`
  - `src/components/layout/bottom-nav.tsx`
  - `src/app/walker/dogs/WalkerDogsClient.tsx`
  - `src/app/walker/billing/page.tsx`
  - `src/components/walker/WalkerBillingSurface.tsx`
  - `src/app/walker/calendar/page.tsx`
  - `src/components/walker/WalkerCalendarSurface.tsx`
- inspect the Phase 6 validation assets in:
  - `qa/tests/cold-walkthrough.spec.ts`
  - `qa/tests/price-enforcement.spec.ts`
- inspect local workspace hygiene separately:
  - dirty `public/sw.js` is not deployed production truth
- continue from the current post-Phase-6-validation stop point:
  - owner secondary-surface slices are already done locally
  - walker nav hierarchy is committed in `1cd8806`
  - `c43535b` is already committed as a test-only fix for cold walkthrough Part B
  - `6246610` / `f6322f0` / `9abb2ab` / `f6e3e4e` / `5e553d0` implement local invite-code assignment hardening
  - walker dogs / billing / calendar hierarchy slices are already done locally
  - Phase 6 Step A is now manually validated end-to-end
  - Phase 6 Step B is already passed locally
  - Phase 6 Step C is already passed on production
  - billing/calendar orphaned client cleanup is deferred and non-blocking
- preserve the unified-worker notification architecture unless a new regression appears
- do not reopen the full Phase 4 scenario matrix unless a new defect proves it is necessary
- if local `npm run build` fails on `.next\trace` with `EPERM`, rerun outside the sandbox before concluding the build is broken
- after that, do not reopen Step A / Phase 6 unless a new defect proves it is necessary
- instead, take the next operational step first:
  - deploy the local invite-code assignment batch
  - production-verify owner assignment via invite code and walker invite-code copy flow
- after that, decide the next intentional follow-up:
  - icon-rendering fix
  - or a separate cleanup batch
```

## Short Version

```text
Use F:\ak\avner-lite\AKIVOT-CONTEXT-PACK\CONTEXT.MD as entry point and continue Akivot from the Phase 6 manual-validation signoff stop point: Step A was manually validated end-to-end, Step B passed locally, Step C passed on production, and the next work should be an intentional follow-up rather than reopening Phase 6.
```
