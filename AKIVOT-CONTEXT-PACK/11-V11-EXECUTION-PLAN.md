# Akivot — V1.1 Execution Plan

This is the single execution plan that translates the locked product decisions into phased delivery.

It is the bridge between:

- PM direction
- implementation order
- validation order
- execution discipline

Use this file as the operating plan for V1.1 execution.

## How To Use This File
- Read only the newest top "Current Stop Point" block for live continuation.
- Treat lower stop-point blocks as historical execution records.
- Use this file to answer: "What is the next operational step?" not "What already happened?"

## Current Stop Point (2026-04-16, post-invite-code assignment implementation stop point)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production, production-verified, and DONE
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is substantially complete in the local worktree
- Current branch/worktree reality:
  - `main...origin/main [ahead 7]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix
    - `6246610` / `f6322f0` / `9abb2ab` / `f6e3e4e` / `5e553d0` local invite-code assignment hardening batch
- Phase 6 should still be treated as manually validated and closed:
  - Step A owner setup-loop validation was manually proven end-to-end on fresh verified owner + walker accounts against production
  - Step B price guardrail passed locally after aligning `qa/tests/price-enforcement.spec.ts` with the Phase 5 direct-launch walker UX
  - Step C walker daily loop passed on production (`qa/tests/cold-walkthrough.spec.ts`, `B1-B7`)
- Additional local implementation completed after Phase 6 closure:
  - owner dog-profile assignment no longer exposes a global accepting-walker dropdown
  - assignment now uses invite-code lookup + explicit confirmation
  - walker invite code is surfaced in a minimal `/walker/settings` utility surface with copy action
  - walker settings is reached from a small gear in `WalkerDashboardClient`, not via bottom-nav expansion
- Validation completed for this batch:
  - compatibility check reported `0` missing walker invite codes
  - `npx tsc --noEmit` passed
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- The next operational step is:
  - do not reopen Step A / Phase 6 unless a new defect is proven
  - deploy the local invite-code assignment batch
  - production-verify the new owner assignment flow and walker settings copy flow
  - keep the remaining QA gaps visible:
    - Phase 2 first-time price state on production data
    - Phase 3 blocked price-unset runtime path via seed support
  - after that, choose the next intentional follow-up:
    - icon-rendering fix
    - cleanup batch
    - or another small production-facing fix if a new defect is proven
- Additional findings that should stay visible:
  - production icon rendering showed Material Symbols labels rendering as raw text on multiple screens
  - Step C exposed a minor friction note: the completed walk did not appear immediately in dashboard history after end-walk, while billing did reflect it
  - `src/app/owner/dashboard/actions.ts` still contains the older `getAvailableWalkersAction()` helper and this should be treated as deferred dead-code cleanup
- Operational notes:
  - local `npm run build` can fail in the sandbox with `EPERM` on `.next\\trace`
  - rerun outside the sandbox before treating that as a real build failure
  - dirty local `public/sw.js` is not deployed production truth
  - local `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate fix and should not be overwritten casually
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it

Latest operational truth overrides older post-Phase-5 notes lower in this file if they conflict.

## Current Stop Point (2026-04-16, Phase 6 manual-validation signoff stop point)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production, production-verified, and DONE
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is now substantially complete in the local worktree
- Current branch/worktree reality:
  - `main...origin/main [ahead 2]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix
- Phase 6 should now be treated as manually validated and closed:
  - Step A owner setup-loop validation was manually proven end-to-end on fresh verified owner + walker accounts against production
  - validated path: owner onboarding -> create first dog -> assign walker -> set price -> walker dashboard ready with direct-start CTA
  - Step B price guardrail passed locally after aligning `qa/tests/price-enforcement.spec.ts` with the Phase 5 direct-launch walker UX
  - Step C walker daily loop passed on production (`qa/tests/cold-walkthrough.spec.ts`, `B1-B7`)
- The earlier Step A blocker was fixture/state coverage in automation, not a proven product-code defect
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- The next operational step is:
  - do not reopen Step A / Phase 6 unless a new defect is proven
  - keep the remaining QA gaps visible:
    - Phase 2 first-time price state on production data
    - Phase 3 blocked price-unset runtime path via seed support
  - choose the next intentional follow-up:
    - icon-rendering fix
    - owner -> walker assignment UX hardening
    - or a separate cleanup batch
- Additional follow-up findings that should stay visible:
  - production icon rendering showed Material Symbols labels rendering as raw text on multiple screens
  - owner -> walker assignment still feels like a global system dropdown rather than a guided product flow
  - Step C exposed a minor friction note: the completed walk did not appear immediately in dashboard history after end-walk, while billing did reflect it
- Operational notes:
  - local `npm run build` can fail in the sandbox with `EPERM` on `.next\\trace`
  - rerun outside the sandbox before treating that as a real build failure
  - dirty local `public/sw.js` is not deployed production truth
  - local `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate fix and should not be overwritten casually
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it

Latest operational truth overrides older post-Phase-5 notes lower in this file if they conflict.

## Current Stop Point (2026-04-15, Phase 6 partial-validation stop point)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production, production-verified, and DONE
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is now substantially complete in the local worktree
- Current branch/worktree reality:
  - `main...origin/main [ahead 2]`
  - committed in the current continuation chain:
    - `1cd8806` walker nav hierarchy
    - `c43535b` test-only cold walkthrough fix
- Phase 6 is now active and partially complete:
  - Step B price guardrail passed locally after aligning `qa/tests/price-enforcement.spec.ts` with the Phase 5 direct-launch walker UX
  - Step C walker daily loop passed on production (`qa/tests/cold-walkthrough.spec.ts`, `B1-B7`)
  - Step A owner setup-loop validation is still blocked because the current owner fixture only expresses the complete setup state
- The active blocker is fixture/state coverage, not a proven product-code defect
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- The next operational step is:
  - do not start another blind UI slice
  - do not start a cleanup batch
  - do not reopen Phase 4 unless a new defect is proven
  - unblock the smallest valid owner fixture/state path
  - then run/report Phase 6 Step A owner setup validation
- Known follow-up validation gaps that remain visible:
  - Phase 2 first-time price state on production data
  - Phase 3 blocked price-unset runtime path via seed support
- Operational notes:
  - local `npm run build` can fail in the sandbox with `EPERM` on `.next\\trace`
  - rerun outside the sandbox before treating that as a real build failure
  - dirty local `public/sw.js` is not deployed production truth
  - local `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate fix and should not be overwritten casually
  - do not rely on the older Neon staging-branch assumption as authoritative; recent live validation contradicted it
  - Step C exposed a minor friction note: the completed walk did not appear immediately in dashboard history after end-walk, while billing did reflect it

Latest operational truth overrides older post-Phase-5 notes lower in this file if they conflict.

## Current Stop Point (2026-04-15, validated post-Phase-5 hierarchy stop point)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production, production-verified, and DONE
- Installed-PWA notification signoff remains authoritative:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification appears
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Production notification architecture remains:
  - `/sw.js` owns app scope and FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Phase 5 hierarchy/demotion work is now substantially complete in the local worktree
- Local/committed Phase 5 progress completed so far:
  - owner nav hierarchy
  - owner billing demotion / back-nav
  - owner calendar demotion / back-nav
  - owner dog-profile coherence
  - owner dogs demotion
  - owner settings demotion
  - walker nav hierarchy (`1cd8806`, committed)
  - walker dogs demotion
  - walker billing demotion via `src/app/walker/billing/page.tsx` -> `src/components/walker/WalkerBillingSurface.tsx`
  - walker calendar demotion via `src/app/walker/calendar/page.tsx` -> `src/components/walker/WalkerCalendarSurface.tsx`
- Validation status for the latest walker hierarchy slices:
  - `npx tsc --noEmit` -> pass
  - `npm run build` -> pass outside the sandbox
- Deferred non-blocking cleanup items:
  - `src/app/walker/billing/WalkerBillingClient.tsx` is now orphaned
  - `src/app/walker/calendar/WalkerCalendarClient.tsx` is now orphaned
  - cleanup should happen in a separate follow-up
- The next operational step is:
  - do not start another blind UI slice
  - reassess whether Phase 5 is complete enough for signoff
  - define the next real product phase or cleanup batch intentionally
- Known follow-up validation gaps that remain outside the current Phase 5 slice work:
  - Phase 2 first-time price state on production data
  - Phase 3 blocked price-unset runtime path via seed support
- Operational note:
  - local `npm run build` can fail in the sandbox with `EPERM` on `.next\\trace`
  - rerun outside the sandbox before treating that as a real build failure
  - dirty local `public/sw.js` is not deployed production truth
  - local `src/app/owner/dashboard/OwnerDashboardClient.tsx` still contains a separate fix and should not be overwritten casually

Latest operational truth overrides older Phase 5 / post-Phase-4 notes lower in this file if they conflict.

## Current Stop Point (2026-04-15, Phase 5 in progress)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production and production-verified
- Phase 5 is now actively in progress in the local worktree
- Local/committed Phase 5 progress completed so far:
  - owner nav hierarchy
  - owner billing demotion
  - owner calendar demotion
  - owner dog-profile coherence
  - owner dogs demotion
  - owner settings demotion
  - walker nav hierarchy (`1cd8806`, committed)
  - walker dogs demotion
- The next operational step is:
  - continue Phase 5 with `walker billing demotion / coherence`
  - then inspect `walker/calendar` only if it still reads as too primary
  - then stop and reassess readiness for `Phase 6 - End-to-End Validation`
- Known follow-up validation gaps that remain outside the current Phase 5 slice work:
  - Phase 2 first-time price state on production data
  - Phase 3 blocked price-unset runtime path via seed support
- Operational note:
  - local `npm run build` can fail in the sandbox with `EPERM` on `.next\\trace`
  - rerun outside the sandbox before treating that as a real build failure

Latest operational truth overrides older Phase 5 / post-Phase-4 notes lower in this file if they conflict.

## Current Stop Point (2026-04-14, post-signoff)

Use this block as the source of truth for continuation:

- Phase 2 is shipped and production-healthy
- Phase 3 is shipped and production-healthy
- Phase 4 is shipped to production and production-verified
- The next operational step is:
  - preserve the verified unified-worker notification architecture
  - keep the installed-PWA signoff result as the authoritative mobile notification path
  - decide the next product slice intentionally instead of reopening Phase 4 by default
- Known follow-up validation gaps that remain outside the immediate Phase 4 signoff gate:
  - Phase 2 first-time price state on production data
  - Phase 3 blocked price-unset runtime path via seed support

Latest operational truth overrides older Phase 3 / pre-ship Phase 4 notes lower in this file if they conflict.

## Production Update (2026-04-14 - latest override)

- Phase 4 is now shipped to production at `akivot.vercel.app`.
- Shipped commits:
  - `1e57772`
  - `4304e2f`
  - `d3174cd`
- Shipped scope:
  - `src/app/walker/dashboard/actions.ts`
  - `src/app/walker/live/actions.ts`
  - `src/app/walker/live/WalkerLiveClient.tsx`
  - `src/lib/repositories/notificationsRepo.ts`
  - `src/lib/services/notifications/fcmService.ts`
- Ship-time validation passed:
  - `npx tsc --noEmit`
  - `npm run build`
  - verify-spec
  - verify-security
- Manual production verification passed on the installed PWA path:
  - end walk within 15s => no `WALK_STARTED`
  - stay live >30s => one `WALK_STARTED`
  - refresh at t=10s => remaining-grace semantics hold
  - refresh after t>30s while still `LIVE` => no duplicate `WALK_STARTED`
  - Hebrew `WALK_STARTED` copy verified
  - Hebrew `WALK_COMPLETED` copy verified
  - no visible undo / cancel-start UI introduced
- Installed-PWA tap/open behavior now passes:
  - `V3` PASS
  - `V4` PASS
  - `V5` PASS
- Phase 4 is DONE

## Production Update (2026-04-12)

Historical note only. The latest override above is the current source of truth.

- Phase 3 â€” Walker Home Discipline is now shipped and production-verified.
- Production URL: `akivot.vercel.app`
- Shipped commits:
  - `6041c50`
  - `6f9cab5`
- Production verification passed for:
  - 1-dog direct start
  - multi-dog direct start of the primary dog
  - explicit chooser path via `choose another dog`
  - passive read-only secondary dog list
  - updated smoke chooser flow
- Remaining follow-up validation only:
  - Phase 2 first-time price state (`currentPrice = 0.00`) still not exercised on production data
  - Phase 3 blocked price-unset runtime path still cannot be exercised end-to-end because the QA seed API cannot produce `currentPrice = 0.00`
- Execution consequence:
  - Phase 3 should now be treated as production-healthy
  - the next implementation slice is **Phase 4 â€” Grace Window And Notification Defaults**

## Execution Status Update (2026-04-12)

Historical note only. The latest override above is the current source of truth.

Current execution truth:

- Phase 2 price-edit slice has been implemented and shipped to production in `54bd5b7`
- production verification passed for:
  - existing-price edit state
  - decimal price rendering
  - mobile RTL layout
- no rollback is needed
- one verification gap remains:
  - first-time price state (`currentPrice = 0.00`) was validated locally, but not yet exercised on live production data
- Phase 3 walker-home-discipline slice has been implemented locally in `6041c50`
- Phase 3 runtime QA passed locally in `6f9cab5` for:
  - 1-dog direct start
  - multi-dog direct start of the primary dog
  - explicit chooser path via `choose another dog`
  - passive read-only secondary dog list
  - updated smoke chooser flow
- one Phase 3 QA gap remains:
  - blocked price-unset runtime path is still not exercised end-to-end because the QA seed API cannot produce `currentPrice = 0.00`

Execution implication:

- Phase 2 should be treated as **implemented and production-healthy**
- the next implementation slice is **Phase 3 — Walker Home Discipline**
- the remaining first-time-price production check should be tracked as follow-up validation, not as a blocker to continue

Operational override (2026-04-12):

- Phase 3 should now be treated as **implemented and locally verified**
- the next operational step is to **review, ship, and production-verify Phase 3**
- the remaining Phase 3 blocked-price runtime check should be tracked as follow-up validation unless seed support is added first

## 1. Execution Authority
Product authority for this plan comes from:

- `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
- `AKIVOT-CONTEXT-PACK/09-OPEN-PRODUCT-QUESTIONS.md`
- `AKIVOT-PRODUCT-MASTER-ROADMAP.md`

This plan assumes the V1.1 decisions are already locked.

It is not a brainstorming document.

## 2. Role Split

### Product / PM
Responsible for:

- locking product decisions
- approving changes in behavior and hierarchy
- deciding what belongs in core vs depth

### Codex
Responsible for:

- CEO / architecture oversight
- execution ordering
- debugging direction
- review of plans before execution
- identifying contradictions, regressions, and scope drift
- deciding whether a task is truly next

### Claude Code
Responsible for:

- implementation
- local patching
- focused validation
- reporting results precisely

Rule:

- Claude executes
- Codex directs, critiques, and validates direction

## 3. Core V1.1 Outcome
V1.1 is successful when:

- owner setup completes through:
  - dog
  - walker
  - price
- walker home leads to one clear next action
- first walk cannot begin with missing / `0.00` price
- live walk remains simple and trustworthy
- owner home feels like reassurance, not management
- depth surfaces remain depth

## 4. Execution Rules

1. Do not implement phases out of order unless a real blocker forces it.
2. Do not reopen resolved work unless a real bug is found.
3. Do not expand secondary surfaces before the owner setup loop is complete.
4. Every phase must end with:
   - local validation
   - behavior summary
   - residual risk
5. If a product contradiction appears, stop and escalate before widening scope.

## 5. Phase Overview

### Phase 0 — Freeze The Baseline
Goal:

- ensure the team is building from one locked V1.1 direction

Deliverables:

- PM execution spec accepted
- V1.1 execution plan accepted
- current repo stop point understood
- no active ambiguity about:
  - owner setup completion
  - no-price block
  - walker home action-first rule

Exit criteria:

- team agrees the next work starts with owner setup completion

---

### Phase 1 — Owner Setup Completion
Goal:

- make owner setup feel complete and guided

Scope:

- owner home and owner setup entry states
- incomplete setup states
- clear next action logic

Target behavior:

1. no dog
   - primary next action: add dog
2. dog exists, no walker
   - primary next action: assign walker
3. walker exists, no price
   - primary next action: set price
4. dog + walker + price
   - setup complete
   - home becomes calm and informational

Must preserve:

- routine remains optional
- owner is not forced into heavy admin flow
- home stays the center

Likely files:

- `src/app/owner/dashboard/OwnerDashboardClient.tsx`
- `src/app/owner/dashboard/page.tsx`
- owner dashboard subcomponents as needed
- owner setup entry points only if needed

Exit criteria:

- owner can understand setup state immediately
- one next action is visible at every incomplete stage
- setup completion state is clearly different from setup incomplete state

---

### Phase 2 — Price Enforcement
Goal:

- make price a real required setup input, not optional metadata

Scope:

- owner setup state
- walker blocked-start state
- price visibility where relevant

Target behavior:

- if price is missing or `0.00`, first walk cannot start
- owner sees this as incomplete setup
- walker sees a quiet blocked state
- owner can still change price during active assignment
- changed price affects future walks only

Must preserve:

- no heavy accounting UX
- no complex confirmation branch
- price remains clear but not loud

Likely files:

- owner assignment / price-setting surfaces
- walker dashboard start logic and blocked UI
- any actions validating start eligibility

Exit criteria:

- no-price state is impossible to ignore
- first walk cannot start without valid price
- blocked behavior is calm and obvious

---

### Phase 3 — Walker Home Discipline
Goal:

- refine walker home around one primary dog and one next action

Scope:

- walker dashboard only

Target behavior:

- one dog ready -> direct start
- several dogs -> chooser only when needed
- one primary dog card
- queue remains light
- price stays low emphasis
- scheduled time appears only when meaningful

Must preserve:

- action-first design
- no dispatch-board feel
- no admin-style density

Likely files:

- `src/app/walker/dashboard/WalkerDashboardClient.tsx`

Exit criteria:

- walker understands home in under two seconds
- next action is obvious
- no secondary surface competes with the primary action

---

### Phase 4 — Grace Window And Notification Defaults
Goal:

- align behavior around accidental start and owner trust

Scope:

- start walk behavior
- started/completed notification defaults
- no extra V1.1 alert logic

Target behavior:

- `WALK_STARTED` still waits for the 30-second grace period
- no visible undo / cancel-start path is added in V1.1
- no owner-notified explainer is added to the walker UI
- default owner notifications remain:
  - started
  - completed
- auto-close remains app-state only in V1.1

Must preserve:

- calm UX
- no notification noise
- no extra branches

Likely files:

- `src/app/walker/dashboard/actions.ts`
- notification-related UI only if needed

Exit criteria:

- accidental starts remain quietly absorbed
- default notification policy matches PM decisions exactly

---

### Phase 5 — Secondary Surface Alignment
Goal:

- demote secondary surfaces without expanding them

Scope:

- owner dogs / billing / calendar / settings
- walker dogs / billing / calendar

Important rule:

- this phase is for hierarchy alignment, not feature growth

Target behavior:

- home stays primary
- depth stays available
- nothing secondary competes with the daily loop

What this phase should not do:

- add new heavy management features
- expand billing language
- expand scheduling logic

Exit criteria:

- navigation and hierarchy feel cleaner
- depth remains reachable but not dominant

---

### Phase 6 — End-to-End Validation
Goal:

- confirm the product behaves like the locked V1.1 plan

Validation layers:

1. local validation
2. preview validation
3. production validation
4. real walkthroughs

Critical paths to validate:

#### Owner

- sign up / verify
- add dog
- assign walker
- set price
- return to calm home

#### Walker

- open home
- start walk
- live mode
- end walk
- return ready state

#### Guardrails

- no first walk without price
- owner notifications only:
  - started
  - completed
- no admin-heavy home regression

Exit criteria:

- the owner setup loop works end to end
- the walker loop works end to end
- no contradiction remains against the V1.1 PM spec

## 6. Recommended Build Order
The recommended execution order is:

1. Phase 0 — Freeze baseline
2. Phase 1 — Owner setup completion
3. Phase 2 — Price enforcement
4. Phase 3 — Walker home discipline
5. Phase 4 — Grace window + notifications
6. Phase 5 — Secondary surface alignment
7. Phase 6 — End-to-end validation

This order is intentional:

- owner setup and price are the biggest product truth gaps
- walker home is already materially improved and should be refined after setup truth is fixed
- validation comes after behavior is aligned, not before

## 7. Claude Execution Protocol
For each phase, Claude Code should work like this:

1. restate the active phase only
2. inspect `git status`
3. inspect only the files needed for that phase
4. propose the smallest valid patch plan
5. implement
6. validate
7. report:
   - what changed
   - what passed
   - what remains risky

Claude should not:

- jump to the next phase automatically if the current one is not signed off
- widen scope without saying so
- reopen already-closed slices casually

## 8. Codex Review Protocol
Before Claude executes a phase, Codex should confirm:

1. is this truly the next phase?
2. is the plan phase-bounded?
3. is there hidden scope expansion?
4. does it match the PM decisions?
5. what are the likely failure modes?

After Claude executes, Codex should review:

1. correctness
2. scope discipline
3. regressions
4. whether the next phase is truly unlocked

## 9. Definition Of "Ready To Build"
This plan is build-ready when:

- Phase 0 is accepted
- the PM execution spec is treated as locked
- implementation begins from Phase 1, not from random secondary screens

## 10. One-Sentence Direction
Build Akivot V1.1 by completing the owner setup loop first, enforcing price truth before first walk, preserving the walker as an action-first experience, and keeping everything secondary out of the home loop.
