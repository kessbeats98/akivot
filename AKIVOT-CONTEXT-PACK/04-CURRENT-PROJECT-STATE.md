# Current Project State

## How To Use This File
- Read the newest top override block first.
- Treat anything lower as historical context unless the top block still points to it.
- Use this file to answer: "What is true in the repo right now?"

## Latest Override (2026-04-16, post-BATCH-PRICE-ENFORCEMENT-DEPLOY production verification)

- BATCH-PRICE-ENFORCEMENT-DEPLOY: **ALL PHASES COMPLETE** — Phase 6 manual verification passed V1-V5 on production
- Commit 710d012 on `origin/main` and local `main` — fully synced
- Repo is clean (no ahead/behind)
- No worktree changes pending
- Production is verified and stable
- Ready to start next batch

---

## Previous Override (2026-04-16, post-invite-code assignment implementation stop point)
Use this block as the source of truth if anything lower in the file still reflects the older pre-implementation follow-up state.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work remains substantially complete locally.
- Owner -> walker assignment hardening is now also implemented locally:
  - owner dog-profile no longer exposes a global list of accepting walkers
  - owner assignment now uses invite-code lookup -> lookup result -> explicit confirm
  - walker invite code is surfaced through a minimal `/walker/settings` surface with copy action
  - walker settings is reached from a small gear in the walker dashboard topbar, not via bottom-nav expansion
- Repo reality:
  - branch is `main...origin/main [ahead 7]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` cold walkthrough reproducibility fix
    - `6246610` / `f6322f0` / `9abb2ab` / `f6e3e4e` / `5e553d0` invite-code assignment batch
  - the worktree is still not clean
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate local fix and must not be overwritten casually
  - dirty local `public/sw.js` must not be treated as deployed production truth
  - if `npm run build` fails in sandbox with `.next\\trace` `EPERM`, rerun outside the sandbox before concluding the build is broken
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it
- Local validation:
  - compatibility check reported `0` missing walker invite codes
  - `npx tsc --noEmit` passed after the invite-code batch
- Keep visible as follow-up items, not blockers:
  - no new production deploy happened for the invite-code batch yet
  - Phase 2 first-time price state on production data is still unverified
  - Phase 3 blocked price-unset runtime path is still seed-limited
  - production icon rendering still showed Material Symbols labels rendering as raw text on multiple screens
  - the completed walk not appearing immediately in owner history after end-walk remains a minor friction note
  - `src/app/owner/dashboard/actions.ts` still exports the older `getAvailableWalkersAction()` helper and this should be treated as deferred cleanup, not as a current blocker
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- The next chat should treat:
  - Phase 6 as closed
  - owner -> walker invite-code hardening as implemented locally
  - deploy + production verification of this batch as the next operational step

## Latest Override (2026-04-16, Phase 6 manual-validation signoff stop point)
Use this block as the source of truth if anything lower in the file still reflects the older partial-Phase-6 state.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work remains substantially complete locally.
- Phase 6 should now be treated as manually validated and closed:
  - Step A owner setup loop was manually validated end-to-end on fresh verified owner + walker accounts against `https://akivot.vercel.app`
  - validated path: owner onboarding -> create first dog -> assign walker -> set price -> walker dashboard ready with direct-start CTA
  - Step B price guardrail remains passed locally
  - Step C walker daily loop remains passed on production
- Repo reality:
  - branch is `main...origin/main [ahead 2]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix
  - the worktree is still not clean
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate local fix and must not be overwritten casually
  - dirty local `public/sw.js` must not be treated as deployed production truth
  - if `npm run build` fails in sandbox with `.next\\trace` `EPERM`, rerun outside the sandbox before concluding the build is broken
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- Keep visible as follow-up items, not blockers to keep Phase 6 open:
  - Phase 2 first-time price state on production data is still unverified
  - Phase 3 blocked price-unset runtime path is still seed-limited
  - production icon rendering showed Material Symbols labels rendering as raw text on multiple screens
  - owner -> walker assignment still feels like a global system dropdown rather than a guided product flow
  - the completed walk not appearing immediately in owner history after end-walk remains a minor friction note
- The next chat should treat Phase 6 as closed and decide the next intentional follow-up:
  - icon-rendering fix
  - owner -> walker assignment UX hardening
  - or a separate cleanup batch

## Latest Override (2026-04-15, Phase 6 partial-validation stop point)
Use this block as the source of truth if anything lower in the file still reflects the older post-Phase-5 state.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is now substantially complete locally.
- Phase 6 is active and partially complete:
  - Step B price guardrail passed locally (`qa/tests/price-enforcement.spec.ts`, `2/2`) after aligning the test with the direct-launch walker UX
  - Step C walker daily loop passed on production (`qa/tests/cold-walkthrough.spec.ts`, `B1-B7`)
  - Step A owner setup loop remains blocked on fixture/state coverage because the current owner fixture only expresses the complete setup state
- Repo reality:
  - branch is `main...origin/main [ahead 2]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix
  - the worktree is still not clean
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate local fix and must not be overwritten casually
  - dirty local `public/sw.js` must not be treated as deployed production truth
  - if `npm run build` fails in sandbox with `.next\\trace` `EPERM`, rerun outside the sandbox before concluding the build is broken
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- Non-blocking friction note from Step C:
  - the just-completed walk did not appear immediately in dashboard history after ending the walk
  - billing still reflected the walk and the test passed
- The next task is not another UI hierarchy slice.
- The next chat should unblock and execute Phase 6 Step A owner setup validation first.

## Latest Override (2026-04-15, post-calendar slice validation)
Use this block as the source of truth if anything lower in the file still reflects the older mid-Phase-5 state.

- Phase 4 remains **DONE** and production-verified.
- Installed-PWA notification signoff remains the authoritative mobile path:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is now substantially complete locally.
- Owner secondary surfaces have already been demoted locally through hierarchy-only slices in:
  - `src/components/layout/owner-nav.tsx`
  - `src/app/owner/billing/OwnerBillingClient.tsx`
  - `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - `src/app/owner/dogs/OwnerDogsClient.tsx`
  - `src/app/owner/settings/page.tsx`
- Walker secondary surfaces are now also demoted locally through hierarchy-only slices in:
  - `src/components/layout/bottom-nav.tsx` (`1cd8806`, committed)
  - `src/app/walker/dogs/WalkerDogsClient.tsx`
  - `src/app/walker/billing/page.tsx` -> `src/components/walker/WalkerBillingSurface.tsx`
  - `src/app/walker/calendar/page.tsx` -> `src/components/walker/WalkerCalendarSurface.tsx`
- These Phase 5 slices are hierarchy-only. They are not logic, schema, route-behavior, or notification-architecture changes.
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- Local validation for the latest walker hierarchy slices is complete:
  - `npx tsc --noEmit` -> pass
  - `npm run build` -> pass outside the sandbox
- Repo reality:
  - branch is `main...origin/main [ahead 1]`
  - the worktree is not clean
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate local fix and must not be overwritten casually
  - dirty local `public/sw.js` must not be treated as deployed production truth
  - if `npm run build` fails in sandbox with `.next\\trace` `EPERM`, rerun outside the sandbox before concluding the build is broken
- The next task is not another blind UI slice.
- The next chat should reassess whether Phase 5 is complete enough for signoff and define the next real product phase or cleanup batch intentionally.

## Latest Override (2026-04-15)
Use this block as the source of truth if anything lower in the file still reflects the older immediate post-Phase-4 state.

- Phase 5 is actively in progress in the local worktree.
- Owner secondary surfaces have already been demoted locally through hierarchy-only slices in:
  - `src/components/layout/owner-nav.tsx`
  - `src/app/owner/billing/OwnerBillingClient.tsx`
  - `src/app/owner/calendar/OwnerCalendarClient.tsx`
  - `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
  - `src/app/owner/dogs/OwnerDogsClient.tsx`
  - `src/app/owner/settings/page.tsx`
- Walker secondary-surface work is partially complete:
  - committed: `1cd8806` updates `src/components/layout/bottom-nav.tsx` so Home is primary and Dogs/Billing are secondary
  - local worktree: `src/app/walker/dogs/WalkerDogsClient.tsx` has a completed hierarchy demotion slice
- These Phase 5 slices are hierarchy-only. They are not logic, schema, route, or notification changes.
- The main remaining product gap inside Phase 5 is now walker secondary surfaces:
  - next intended slice: `walker/billing`
  - then `walker/calendar` only if it still reads as too primary
- Repo reality:
  - branch is `main...origin/main [ahead 1]`
  - the worktree is not clean
  - a new chat must review the current local UI diffs intentionally before making more changes

## Stack
- Next.js App Router
- TypeScript
- Tailwind
- Mobile-width app shell
- Hebrew RTL app (`lang="he"`, `dir="rtl"`)

## App Shell
Verified in:

- `src/app/layout.tsx`

Current shell characteristics:

- focused mobile-width container
- service worker registration present
- product already shaped like a mobile-first app

## Public/Auth Routes
- `/` -> `src/app/page.tsx`
- `/login` -> `src/app/login/page.tsx`
- `/signup` -> `src/app/signup/page.tsx`
- `/verify-email` -> `src/app/verify-email/page.tsx`
- `/onboarding` -> `src/app/onboarding/page.tsx`

Current issue:
- public language still sounds like dog-walking management software

## Owner Area
Guarded by:

- `src/app/owner/layout.tsx`

Primary owner files:

- `src/app/owner/dashboard/page.tsx`
- `src/app/owner/dashboard/OwnerDashboardClient.tsx`
- `src/app/owner/dashboard/components/OwnerCurrentStatusCard.tsx`
- `src/app/owner/dashboard/components/OwnerDogSelector.tsx`
- `src/app/owner/dashboard/components/OwnerHistorySection.tsx`
- `src/components/layout/owner-nav.tsx`

Secondary owner routes:

- `/owner/dogs`
- `/owner/dog-profile/[dogId]`
- `/owner/billing`
- `/owner/calendar`
- `/owner/settings`

Current product observation:
- `owner/dashboard` is now substantially reshaped toward the intended owner-home experience
- owner price-edit / price-enforcement flow is shipped to production
- no-dog state is calmer and more intentional
- owner zero-states now distinguish:
  - no walker assigned
  - walker assigned but no completed walks yet
- home-with-history state has calmer copy and lighter summary emphasis
- recent history no longer leads with the full browse interface by default
- `OwnerHistorySection` still exists, but owner home now surfaces recent completed walks first and only opens the full history browser on demand
- dog-switch history behavior in `OwnerDashboardClient.tsx` was hardened against:
  - stale expanded-state carryover
  - stale render windows
  - stale async response races
- there is also a local worktree-only fix in `OwnerDashboardClient.tsx` for the history error/retry path; inspect it before touching owner code
- secondary owner screens still expose too much structure, but they are not the current execution priority

## Walker Area
Guarded by:

- `src/app/walker/layout.tsx`

Primary walker files:

- `src/app/walker/dashboard/page.tsx`
- `src/app/walker/dashboard/WalkerDashboardClient.tsx`
- `src/app/walker/live/page.tsx`
- `src/app/walker/live/WalkerLiveClient.tsx`
- `src/components/layout/bottom-nav.tsx`

Secondary walker routes:

- `/walker/dogs`
- `/walker/billing`
- `/walker/calendar`

Current product observation:
- `walker/live` is the strongest aligned experience
- walker dashboard Phase 3 is now shipped to production:
  - primary dog starts directly
  - chooser appears only through the explicit `choose another dog` path
  - secondary dogs are passive/read-only
- the live finish SlideOver is now more operational and less ceremonial
- walker live now also has a shipped Phase 4 implementation:
  - client-side grace timer anchored to actual walk start time
  - ownership-checked `WALK_STARTED` trigger
  - delivery-log dedupe against refresh/remount duplicate sends
- the current gap is not first-pass walker redesign
- Phase 4 production/manual verification is complete and signed off on the installed PWA path
- secondary walker surfaces remain depth, not heart
- secondary walker surfaces remain depth, not heart
- local walker billing/calendar hierarchy surfaces now follow the same rule through page-wrapper handoff to presentational components
- `WalkerBillingClient.tsx` and `WalkerCalendarClient.tsx` are now orphaned locally and should be cleaned up in a separate follow-up, not during stop-point recording

## Complete App Target Clarification
This continuation clarified the intended end state beyond the currently polished screens.

### Owner setup loop
The complete owner product is not just:

- open dashboard
- read history

It must also support a calm setup loop:

- add first dog
- assign walker
- set price
- optionally define routine / schedule

After setup, the owner should mostly return to a reassuring home screen rather than manage the app through separate admin sections.

### Walker loop
The complete walker product remains:

- open app
- see what is next immediately
- start with minimal friction
- stay in work mode
- end cleanly

Rules already reinforced in current product direction:

- one dog -> direct start
- multiple dogs -> chooser only when needed
- live mode should support work, not ceremony

### Schedule and calendar
Schedule / calendar are part of the intended product, but not as the primary home-screen object.

They should behave like:

- depth
- planning context
- archive / review

They should not compete with:

- today's next action
- the current dog
- the current walk

### Price and billing
Price is real product data, not decorative metadata.

Important target-state rule:

- the owner should be able to set price naturally as part of the setup loop

Known product risk:

- if assignment defaults to `0.00` and price setup is easy to miss, the product can accidentally produce zero-value billing

Billing should stay real and trustworthy, but it should remain contextual rather than competing with the main home loop.

### Notifications and trust
Notifications exist to increase certainty, not noise.

Important current implementation note:
- the repo now contains a shipped Phase 4 implementation that moves grace timing out of unreachable server-side code and into `WalkerLiveClient`
- the intended semantics remain:
  - `WALK_STARTED` should fire 30 seconds after actual walk start
  - no visible undo / cancel-start affordance in V1.1
  - duplicate sends from refresh/remount are suppressed via notification delivery log checks

Current execution reality:

- Phase 4 code is shipped to production and should now be treated as DONE

### Product completion test
Akivot is not "complete" just because many screens exist.

It gets closer to complete when:

- owner can add dog, assign walker, and set price without friction
- walker can start and finish with almost no thinking
- schedule, billing, history, and notifications support trust without becoming the main thing
- the app keeps feeling smaller than the system behind it

## Legacy / Non-Active UI Files
There are additional component folders under:

- `src/components/walker/*`
- `src/components/walks/*`

Route inspection during this session suggested they are not currently shaping the active route flow.

Treat them as:

- legacy
- prototype
- optional reuse targets

Do not assume they define the current product direction.

## Current Repo Situation
At the time this context pack was created:

- there is now a committed chain covering:
  - accepted Phase 1 completion
  - multiple Phase 2 owner-home slices
  - follow-up owner-dashboard bug hardening
  - shipped Phase 3 walker dashboard/live refinements
  - shipped Phase 4 walker notification/grace commits with production signoff complete
- there is also an uncommitted local owner-dashboard fix in the worktree
- there are unrelated modified and untracked files in the worktree as well

This means a new chat must inspect `git status` before editing and avoid assuming a clean worktree.

## Most Relevant Existing Strategy File
- `F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md`

This file contains the larger phased product roadmap produced during this session.
