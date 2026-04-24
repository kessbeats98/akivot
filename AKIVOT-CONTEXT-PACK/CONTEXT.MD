# Akivot Context Pack

## Purpose
This folder is the handoff package for continuing Akivot in a new chat without losing product, UX, and execution context.

The new chat should start here.

## Mission
Continue Akivot as a calm, low-friction dog-walking product that:

- reduces stress
- gives immediate clarity
- does not feel like a CRM or management system
- leads the user instead of making them navigate structure

## Source Of Truth Order
Read in this order:

1. `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
2. `AKIVOT-CONTEXT-PACK/01-MISSION-AND-ROLE.md`
3. `AKIVOT-CONTEXT-PACK/02-PRODUCT-PRINCIPLES.md`
4. `AKIVOT-CONTEXT-PACK/03-HISTORICAL-CHAT-SOURCES.md`
5. `AKIVOT-CONTEXT-PACK/04-CURRENT-PROJECT-STATE.md`
6. `AKIVOT-CONTEXT-PACK/05-ROADMAP-PHASES.md`
7. `AKIVOT-CONTEXT-PACK/06-RECENT-EXECUTION-STATUS.md`
8. `AKIVOT-CONTEXT-PACK/07-DEBUG-FINDINGS.md`
9. `AKIVOT-CONTEXT-PACK/09-OPEN-PRODUCT-QUESTIONS.md`
10. `AKIVOT-CONTEXT-PACK/10-TARGET-WORKFLOWS.md`
11. `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md`
12. `AKIVOT-CONTEXT-PACK/12-PHASE4-PRODUCTION-VERIFICATION-PROTOCOL.md`
13. `AKIVOT-CONTEXT-PACK/08-NEXT-CHAT-BOOTSTRAP.md`

## Quick Context Map
Use this map to avoid re-reading the whole pack when you only need one kind of answer.

- `CONTEXT.MD`
  - one-page continuation summary
  - current authoritative stop point
  - what the next chat should assume
- `04-CURRENT-PROJECT-STATE.md`
  - what exists in the app and repo right now
  - branch/worktree reality
  - what is local-only vs production-verified
- `06-RECENT-EXECUTION-STATUS.md`
  - what was executed recently
  - what passed
  - what still needs deploy or verification
- `07-DEBUG-FINDINGS.md`
  - real findings and accepted residuals
  - what is resolved vs still visible
- `11-V11-EXECUTION-PLAN.md`
  - the operating plan
  - current stop point
  - next operational step vs later follow-up
- `08-NEXT-CHAT-BOOTSTRAP.md`
  - copy-paste startup brief for a fresh chat
- `.avner/STATE.md`
  - secondary continuity memo only
  - useful as a backup reference, not the primary source of truth

## How To Read This Pack
To keep signal high:

- always prefer the newest top override block in each file
- treat lower sections as historical record unless the newest override explicitly points you there
- use `04`, `06`, and `11` as the primary triad for current-state decisions
- use `.avner/STATE.md` only as a secondary continuity file if something is unclear

## Important External Historical Sources
These are the historical chat-source files used during this conversation:

- `F:\ak\AKIVOTE CONTEXT DETER\LAST CHAT MESSAGES .txt`
- `F:\ak\AKIVOTE CONTEXT DETER\New Text Document (9).txt`

They should be treated as historical source material, not as clean specs.

## Important Repo File
This roadmap should still be used:

- `F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md`

`05-ROADMAP-PHASES.md` summarizes it for quick continuation.

## Authority Model
For Akivot continuation work:

- `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
- every file mapped by this folder, in order
- `F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md`

are the product-direction source of truth.

Files such as:

- `F:\ak\avner-lite\CLAUDE.md`
- `F:\ak\avner-lite\.claude\rules\01-protocol.md`
- other auto-loaded memory / rule / skill files

should be treated as process and execution-discipline guidance only.

If there is any tension, preserve the Akivot product direction from this context pack + roadmap, and use the process files only for safety, task isolation, and verification discipline.

## Latest Continuation Override (2026-04-16, post-BATCH-PHASE6)

- **BATCH-PHASE6: CLOSED** — 1 code fix + full manual QA
  - Fixed `endWalkFromLiveAction` missing `revalidatePath("/owner/dashboard")` — owner history now refreshes immediately after walk end
  - Owner cold walkthrough: ALL PASS
  - Walker cold walkthrough: ALL PASS (incl. V3 history refresh gate)
  - Per-screen checklist: ALL PASS
- **V1.1 COMPLETE** — all 6 roadmap phases shipped and production-verified
- Production: fully synced (`origin/main == HEAD`)
- **Next:** Roadmap Phase 7 or new feature batch — to be decided

---

## Previous Override (2026-04-16, post-BATCH-PRICE-ENFORCEMENT-DEPLOY production verification COMPLETE)

- **BATCH-PRICE-ENFORCEMENT-DEPLOY: FULLY SIGNED OFF** (all 6 phases complete)
  - Phase 6 manual production verification: **ALL PASS**
    - V1: walker secondary nav demoted (icon-only) ✓
    - V2: walk blocked with Hebrew error at price=0 ✓
    - V3: walk succeeds after price set ✓
    - V4: owner dashboard auto-selects first incomplete-setup dog ✓
    - V5: owner secondary surfaces demoted (icon-only) ✓
- Production: commit `710d012` live on Vercel, no issues discovered
- Repo: fully synced (`origin/main == HEAD`)
- **Next batch candidates (pick one):**
  1. Icon Rendering Fix — Material Symbols labels as raw text on production
  2. Orphaned File Cleanup — WalkerBillingClient.tsx, WalkerCalendarClient.tsx
  3. Dead Code Cleanup — getAvailableWalkersAction() in owner/dashboard/actions.ts
  4. Language Rewrite (Roadmap V5) — landing, onboarding, auth copy

---

## Previous Override (2026-04-16, BATCH-PRICE-ENFORCEMENT-DEPLOY stop point)
Use this block as the current source of truth. Everything below is historical.

- Production is live on commit `710d012` — Vercel state: READY.
- Repo is fully synced: `origin/main == HEAD` (0 commits ahead).
- The following commits are now on production (in order):
  - `ff100e6` style(hierarchy): demote owner+walker secondary surfaces — nav, billing, calendar, dogs, settings
  - `06489b8` feat(walks): block walk start when price missing or zero + Hebrew error copy
  - `b58bd50` fix(owner-dashboard): hydration-safe timestamp + auto-select first incomplete-setup dog
  - `710d012` fix(walker): commit missing WalkerBillingSurface + WalkerCalendarSurface components (hotfix)
- Phase 6 manual production verification (V1-V5) is PENDING — not yet performed by user.
  - V1: walker secondary nav demoted — PENDING
  - V2: walk blocked without price — PENDING
  - V3: walk unblocked after price set — PENDING
  - V4: owner dashboard auto-selects incomplete-setup dog — PENDING
  - V5: owner secondary surfaces feel like depth — PENDING
- Worktree dirty files remaining (noise — DO NOT commit):
  - `.avner/STATE.md`, `.gitignore`, `drizzle/meta/_journal.json`, `playwright.config.ts`, `skills-lock.json`, `src/components/DebugPanel.tsx`
  - untracked `.agents/`, `.claude/` dirs
- Hotfix lesson: Phase 1 hierarchy commit missed two new component files (`WalkerBillingSurface.tsx`, `WalkerCalendarSurface.tsx`). Local `tsc --noEmit` passed because files existed locally; Vercel Turbopack caught the missing commit. Future hierarchy commits must check for new untracked files.
- Deferred cleanup items (still open, not blockers):
  - `src/app/walker/billing/WalkerBillingClient.tsx` — orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` — orphaned
  - `src/app/owner/dashboard/actions.ts` — `getAvailableWalkersAction()` dead code
  - Icon rendering: Material Symbols labels still rendering as raw text on production
- The next chat (PM session) should:
  - open `plans/PM-SESSION.md` to resume PM role
  - ask user to complete Phase 6 V1-V5 manual checklist if not done
  - after Phase 6 sign-off, choose next batch from PM-SESSION.md "After This Batch Completes" list
  - recommended next: Icon rendering fix (Material Symbols labels as raw text)

## Latest Continuation Override (2026-04-16, post-invite-code assignment implementation stop point)
Use this block as the current source of truth if anything lower in this file still reflects the older pre-implementation follow-up state.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification verification remains the authoritative mobile signoff path:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns the app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work remains substantially complete in the local worktree.
- Current branch/worktree reality:
  - `main...origin/main [ahead 7]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix for `B2` hydration race + `B3` single-dog direct-start path
    - `6246610` invite-code lookup action replaces the dog-profile system-wide walker list
    - `f6322f0` dog-profile page drops the old walker-list fetch and passes lookup action
    - `9abb2ab` dog-profile client now uses invite-code input -> lookup -> confirm flow
    - `f6e3e4e` walker settings exposes the existing invite code with copy action
    - `5e553d0` walker dashboard topbar adds a lightweight gear link to `/walker/settings`
  - the worktree is still dirty with local UI diffs, validation assets, and unrelated local files
- Local owner -> walker assignment hardening is now implemented:
  - the old global walker dropdown on owner dog-profile was replaced with invite-code lookup + confirmation
  - the owner no longer sees a system-wide list of walkers
  - already-assigned state is handled explicitly in the dog-profile flow
  - walker invite code is surfaced in a minimal non-primary settings surface, not in bottom nav
- Local validation for the invite-code batch:
  - compatibility check reported `0` walker profiles missing invite codes
  - `npx tsc --noEmit` passed after the 5-task batch
- Phase 6 should still be treated as manually validated and closed:
  - Step A owner setup loop was manually validated end-to-end on fresh verified owner + walker accounts against `https://akivot.vercel.app`
  - Step B price guardrail remains passed locally
  - Step C walker daily loop remains passed on production
- Keep visible as follow-up items, not blockers:
  - no new production deploy happened for the invite-code batch yet
  - production icon rendering still showed Material Symbols labels rendering as raw text on multiple screens
  - Phase 2 first-time price state on production data is still unverified
  - Phase 3 blocked price-unset runtime path is still seed-limited
  - after ending a walk, the dashboard did not immediately show the recent completed walk in history; billing data still appeared
  - `src/app/owner/dashboard/actions.ts` still contains the older `getAvailableWalkersAction()` helper and should be treated as deferred dead-code cleanup, not as an active product defect
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up, not inside this stop point
- Separate local fix still exists in `src/app/owner/dashboard/OwnerDashboardClient.tsx`; do not overwrite it casually.
- Operational notes:
  - local `npm run build` may throw `EPERM` on `.next\\trace` inside the sandbox
  - if that happens, rerun the build outside the sandbox before concluding the build is broken
  - do not rely on the older "production uses Neon staging branch `br-wispy-hall-agzj0ep9`" assumption as authoritative; recent live validation contradicted it
- The next chat should:
  - confirm current worktree state
  - treat Phase 4 as closed
  - treat the Phase 5 hierarchy slices and local invite-code assignment hardening as completed locally
  - treat Phase 6 as validated and closed
  - keep the remaining QA gaps visible
  - treat deploy + production verification of the invite-code batch as the next operational step
  - then decide whether the next intentional follow-up is icon rendering, cleanup, or another small production-facing fix

## Latest Continuation Override (2026-04-16, Phase 6 manual-validation signoff stop point)
Use this block as the current source of truth if anything lower in this file still reflects the older partial-Phase-6 stop point.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification verification remains the authoritative mobile signoff path:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns the app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work remains substantially complete in the local worktree.
- Current branch/worktree reality:
  - `main...origin/main [ahead 2]`
  - committed in this continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix for `B2` hydration race + `B3` single-dog direct-start path
  - the worktree is still dirty with local Phase 5 UI diffs, validation assets, and unrelated local files
- Local Phase 5 hierarchy slices completed and kept visible:
  - owner secondary-surface hierarchy: `src/components/layout/owner-nav.tsx`
  - owner billing demotion / back-nav: `src/app/owner/billing/OwnerBillingClient.tsx`
  - owner calendar demotion / back-nav: `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - owner dog-profile coherence: `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - owner dogs demotion: `src/app/owner/dogs/OwnerDogsClient.tsx`
  - owner settings demotion: `src/app/owner/settings/page.tsx`
  - walker nav hierarchy: `src/components/layout/bottom-nav.tsx`
  - walker dogs demotion: `src/app/walker/dogs/WalkerDogsClient.tsx`
  - walker billing demotion via `src/app/walker/billing/page.tsx` -> `src/components/walker/WalkerBillingSurface.tsx`
  - walker calendar demotion via `src/app/walker/calendar/page.tsx` -> `src/components/walker/WalkerCalendarSurface.tsx`
- Phase 6 should now be treated as manually validated and closed:
  - Step A owner setup loop was manually validated end-to-end on fresh verified owner + walker accounts against `https://akivot.vercel.app`
  - validated path: owner onboarding -> create first dog -> assign walker -> set price -> walker dashboard ready with direct-start CTA
  - Step B price guardrail remains passed locally
  - Step C walker daily loop remains passed on production
- Manual validation clarified that the earlier Step A blocker was fixture/state coverage in automation, not a proven product-code defect.
- Keep visible as follow-up items, not as blockers to keep Phase 6 open:
  - Phase 2 first-time price state on production data is still unverified
  - Phase 3 blocked price-unset runtime path is still seed-limited
  - production icon rendering showed Material Symbols labels rendering as raw text on multiple screens
  - owner -> walker assignment still feels like a global system dropdown rather than a guided product flow
  - after ending a walk, the dashboard did not immediately show the recent completed walk in history; billing data still appeared
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up, not inside this stop point
- Separate local fix still exists in `src/app/owner/dashboard/OwnerDashboardClient.tsx`; do not overwrite it casually.
- Operational notes:
  - local `npm run build` may throw `EPERM` on `.next\\trace` inside the sandbox
  - if that happens, rerun the build outside the sandbox before concluding the build is broken
  - do not rely on the older "production uses Neon staging branch `br-wispy-hall-agzj0ep9`" assumption as authoritative; recent live validation contradicted it
- The next chat should:
  - confirm current worktree state
  - treat Phase 4 as closed
  - treat the Phase 5 hierarchy slices above as completed locally
  - treat Phase 6 as validated and closed
  - keep the remaining QA gaps visible
  - decide intentionally whether the next follow-up is icon rendering, owner -> walker assignment UX hardening, or separate cleanup
  - not reopen Step A / Phase 6 unless a new defect appears

## Latest Continuation Override (2026-04-15, Phase 6 partial-validation stop point)
Use this block as the current source of truth if anything lower in this file still reflects the older post-Phase-5 stop point.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification verification remains the authoritative mobile signoff path:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns the app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work remains substantially complete in the local worktree.
- Current branch/worktree reality:
  - `main...origin/main [ahead 2]`
  - committed in this continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix for `B2` hydration race + `B3` single-dog direct-start path
  - the worktree is still dirty with local Phase 5 UI diffs, validation assets, and unrelated local files
- Local Phase 5 hierarchy slices completed and kept visible:
  - owner secondary-surface hierarchy: `src/components/layout/owner-nav.tsx`
  - owner billing demotion / back-nav: `src/app/owner/billing/OwnerBillingClient.tsx`
  - owner calendar demotion / back-nav: `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - owner dog-profile coherence: `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - owner dogs demotion: `src/app/owner/dogs/OwnerDogsClient.tsx`
  - owner settings demotion: `src/app/owner/settings/page.tsx`
  - walker nav hierarchy: `src/components/layout/bottom-nav.tsx`
  - walker dogs demotion: `src/app/walker/dogs/WalkerDogsClient.tsx`
  - walker billing demotion via `src/app/walker/billing/page.tsx` -> `src/components/walker/WalkerBillingSurface.tsx`
  - walker calendar demotion via `src/app/walker/calendar/page.tsx` -> `src/components/walker/WalkerCalendarSurface.tsx`
- Phase 6 has now started and is only partially complete:
  - Step B price guardrail: local `qa/tests/price-enforcement.spec.ts` was corrected for the Phase 5 direct-launch walker UX and passed `2/2` against a local dev server
  - Step C walker daily loop: `qa/tests/cold-walkthrough.spec.ts` Part B passed `B1-B7` against `https://akivot.vercel.app`
  - Step A owner setup loop remains unvalidated end-to-end
- The active blocker is no longer missing credentials.
  - `qa/.env.qa` now has owner/walker credentials populated locally
  - the real blocker is fixture/state coverage: the current owner fixture only expresses the complete setup state, not states 1-3 of the owner setup loop
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up, not inside this stop point
- Separate local fix still exists in `src/app/owner/dashboard/OwnerDashboardClient.tsx`; do not overwrite it casually.
- Operational notes:
  - local `npm run build` may throw `EPERM` on `.next\\trace` inside the sandbox
  - if that happens, rerun the build outside the sandbox before concluding the build is broken
  - do not rely on the older "production uses Neon staging branch `br-wispy-hall-agzj0ep9`" assumption as authoritative; recent live validation contradicted it
- Non-blocking friction note from Step C:
  - after ending a walk, the dashboard did not immediately show the recent completed walk in history
  - billing data still appeared and the test passed
  - keep this visible as a minor product friction note, not as a blocker
- The next chat should:
  - confirm current worktree state
  - treat Phase 4 as closed
  - treat the Phase 5 hierarchy slices above as completed locally
  - treat Phase 6 Step B and Step C as already completed
  - focus next on unblocking and executing Step A owner setup validation with the smallest fixture/state path
  - not start a cleanup batch or another UI slice first

## Latest Continuation Override (2026-04-15, validated post-Phase-5 hierarchy stop point)
Use this block as the current source of truth if anything lower in this file still reflects the older mid-Phase-5 stop point.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification verification remains the authoritative mobile signoff path:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns the app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- The active phase is still `Phase 5 - Secondary Surface Alignment`, but the hierarchy/demotion slice set is now substantially complete in the local worktree.
- Current branch/worktree reality:
  - `main...origin/main [ahead 1]`
  - committed in this continuation: `1cd8806` walker nav hierarchy
  - the worktree is still dirty with multiple local UI-only hierarchy slices plus unrelated local files
- Local Phase 5 hierarchy slices completed and validated in the worktree:
  - owner secondary-surface hierarchy: `src/components/layout/owner-nav.tsx`
  - owner billing demotion / back-nav: `src/app/owner/billing/OwnerBillingClient.tsx`
  - owner calendar demotion / back-nav: `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - owner dog-profile coherence: `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - owner dogs demotion: `src/app/owner/dogs/OwnerDogsClient.tsx`
  - owner settings demotion: `src/app/owner/settings/page.tsx`
  - walker nav hierarchy: `src/components/layout/bottom-nav.tsx` (`1cd8806`, committed)
  - walker dogs demotion: `src/app/walker/dogs/WalkerDogsClient.tsx`
  - walker billing demotion via `src/app/walker/billing/page.tsx` -> `src/components/walker/WalkerBillingSurface.tsx`
  - walker calendar demotion via `src/app/walker/calendar/page.tsx` -> `src/components/walker/WalkerCalendarSurface.tsx`
- Local validation for the latest walker hierarchy slices is complete:
  - `npx tsc --noEmit` -> pass
  - `npm run build` -> pass outside the sandbox
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up, not inside this stop point
- Separate local fix still exists in `src/app/owner/dashboard/OwnerDashboardClient.tsx`; do not overwrite it casually.
- No new production deploy happened in this continuation. Do not assume the local Phase 5 slices are deployed.
- Operational note:
  - local `npm run build` may throw `EPERM` on `.next\\trace` inside the sandbox
  - if that happens, rerun the build outside the sandbox before concluding the build is broken
- The next step is no longer another blind UI slice.
- The next chat should:
  - confirm current worktree state
  - treat Phase 4 as closed
  - treat the Phase 5 hierarchy slices above as completed locally
  - reassess whether Phase 5 is complete enough for signoff
  - define the next real product phase or cleanup batch intentionally

## Latest Continuation Override (2026-04-15)
Use this block as the current source of truth if anything lower in this file still reflects the older immediate post-Phase-4 stop point.

- Phase 4 remains DONE and production-verified.
- The active phase is now `Phase 5 - Secondary Surface Alignment`.
- Current branch/worktree reality:
  - `main...origin/main [ahead 1]`
  - committed in this session: `1cd8806` `style(walker-nav): two-tier nav hierarchy — Home primary, Dogs/Billing secondary icon-only`
  - the worktree is still dirty with multiple local UI-only hierarchy slices and unrelated local files
- Local Phase 5 hierarchy slices completed and validated in the worktree:
  - owner secondary-surface hierarchy: `src/components/layout/owner-nav.tsx`
  - owner billing demotion: `src/app/owner/billing/OwnerBillingClient.tsx`
  - owner calendar demotion: `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - owner dog-profile coherence: `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - owner dogs demotion: `src/app/owner/dogs/OwnerDogsClient.tsx`
  - owner settings demotion: `src/app/owner/settings/page.tsx`
  - walker dogs demotion: `src/app/walker/dogs/WalkerDogsClient.tsx`
- Separate local fix still exists in `src/app/owner/dashboard/OwnerDashboardClient.tsx`; do not overwrite it casually.
- No new production deploy happened in this session. Do not assume the local Phase 5 slices are deployed.
- The next intended slice is:
  - `Phase 5 / Slice 7: Walker billing demotion / coherence`
  - then `walker/calendar` only if it still feels too primary
  - then stop and assess readiness for `Phase 6 - End-to-End Validation`
- Operational note:
  - local `npm run build` may throw `EPERM` on `.next\\trace` inside the sandbox
  - if that happens, rerun the build outside the sandbox before concluding the build is broken

## What The Next Chat Must Understand
- Product principles came from historical chat material, then were sharpened in this session.
- Phase 1 structural cleanup is complete and accepted.
- Owner-home Phase 2 is shipped to production and should stay closed by default.
- There is an uncommitted local fix in `src/app/owner/dashboard/OwnerDashboardClient.tsx` that closes the hidden history-error/retry path. Review it before making unrelated owner edits.
- Walker Phase 3 is shipped to production and production-verified.
- Phase 4 is shipped to production and now fully signed off:
  - `1e57772` client-side grace window anchored to actual walk start time
  - `4304e2f` Hebrew FCM notification copy
  - `d3174cd` delivery-log dedupe for `WALK_STARTED`
  - unified-worker production fix deployed and verified on installed PWA
- Mobile notification signoff is now defined on the **installed PWA path** only.
- Latest verified installed-PWA result:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Therefore Phase 4 should be treated as **DONE**.
- The current Phase 5 hierarchy/demotion work is now substantially complete locally.
- Phase 6 has already started and is partially complete:
  - Step B price guardrail passed locally after aligning the test contract with the direct-launch walker UX
  - Step C walker daily loop passed in production (`B1-B7`)
  - Step A owner setup-loop validation is still blocked on fixture/state coverage
- `c43535b` is a test-only commit that keeps Phase 6 Step C reproducible.
- `qa/tests/price-enforcement.spec.ts` exists locally and passed `2/2`, but it is not part of `c43535b`; do not assume it is committed.
- Recent notification-path commits to review carefully:
  - `d4b9c27` revert of merged root-SW experiment
  - `c455744` add `webpush.fcmOptions.link`
  - `1a1f814` remove manual `onBackgroundMessage` override + add `webpush.notification.icon`
- The broader complete-app target was clarified further:
  - owner setup loop must feel complete: add dog -> assign walker -> set price -> optional routine/schedule
  - walker loop must stay decisive: open -> see next dog -> start -> finish
  - schedule/calendar are intended capabilities but should remain depth, not the main home object
  - the grace rule remains: owner `WALK_STARTED` should fire 30 seconds after actual walk start, without a visible cancel-start affordance in V1.1
- The current next step is no longer Phase 4 verification or Phase 5 slice expansion.
- The next chat should confirm current repo state, preserve the verified notification architecture, keep Step B/C as completed, and then finish the blocked Phase 6 Step A owner-setup validation path.
- Remaining follow-up validation gaps that should stay visible:
  - Phase 2 first-time price state (`currentPrice = 0.00`) still not exercised on production data
  - Phase 3 blocked price-unset runtime path still cannot be exercised end-to-end because the QA seed API cannot produce `currentPrice = 0.00`
- Local workspace caveat:
  - `public/sw.js` is dirty/stale locally and must not be treated as deployed production truth
- Deferred cleanup caveat:
  - `WalkerBillingClient.tsx` and `WalkerCalendarClient.tsx` are now orphaned after the page-wrapper handoff to presentational surfaces
  - leave their cleanup for a separate follow-up
- The next chat should continue from current repo state, not restart ideation from zero.
- The next high-value step is to preserve the verified Phase 4 architecture, keep the follow-up QA gaps visible, and then reassess whether Phase 5 is done enough to close intentionally.

## First Investigation Checklist For A New Chat
1. Read this folder in order.
2. Inspect current git status before editing.
3. Review the local `src/app/owner/dashboard/OwnerDashboardClient.tsx` diff before deciding whether it should be kept or committed.
4. Confirm the current stop point against `06-RECENT-EXECUTION-STATUS.md` and `11-V11-EXECUTION-PLAN.md`.
5. Check `07-DEBUG-FINDINGS.md` for the current residual QA gaps and Phase 4 findings.
6. Read the latest override blocks in `06-RECENT-EXECUTION-STATUS.md`, `07-DEBUG-FINDINGS.md`, and `12-PHASE4-PRODUCTION-VERIFICATION-PROTOCOL.md`.
7. Treat Phase 4 as shipped, production-verified, and DONE.
8. Do not reopen Phase 4 unless a real regression appears in production.
9. Treat the current Phase 5 hierarchy slices as completed locally unless a real defect is found.
10. Treat Phase 6 Step B and Step C as already completed unless a new defect proves otherwise.
11. Resolve the Phase 6 Step A owner-fixture/state path before starting another UI slice or cleanup batch.

## Do Not Do
- Do not invent new product principles.
- Do not treat every existing screen as sacred.
- Do not expand features before the core owner/walker homes are correct.
- Do not confuse historical source files with final product spec language.
- Do not let generic platform/process framing override the Akivot product direction from this pack + roadmap.
- Do not reopen already-resolved owner slices unless you found a real defect.
- Do not trust passing Playwright results blindly while QA seed/reset state may still be contaminated.

## Folder Map
- `01-MISSION-AND-ROLE.md`
  Defines what the next chat is supposed to do.
- `02-PRODUCT-PRINCIPLES.md`
  The distilled product principles from the historical chat sources and this session.
- `03-HISTORICAL-CHAT-SOURCES.md`
  Explains the two external historical files and how to use them safely.
- `04-CURRENT-PROJECT-STATE.md`
  Captures the real app structure, key routes, and current repo situation.
- `05-ROADMAP-PHASES.md`
  The execution roadmap in phased form.
- `06-RECENT-EXECUTION-STATUS.md`
  What was executed recently, what was accepted, and where the project now stops.
- `07-DEBUG-FINDINGS.md`
  Resolved findings, accepted residuals, and any still-open real defects.
- `09-OPEN-PRODUCT-QUESTIONS.md`
  The meaningful unresolved product questions that should guide future decisions.
- `10-TARGET-WORKFLOWS.md`
  The intended owner/walker/product workflows for the complete app.
- `12-PHASE4-PRODUCTION-VERIFICATION-PROTOCOL.md`
  The exact human-run Phase 4 verification checklist and results template.
- `08-NEXT-CHAT-BOOTSTRAP.md`
  Copy-paste prompt for starting the next chat cleanly.
