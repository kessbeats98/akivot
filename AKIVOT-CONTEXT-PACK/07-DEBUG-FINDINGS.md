# Debug Findings

## Latest Override (2026-04-16, post-invite-code assignment implementation note)

### Finding K
Severity: Medium

Area:
- `src/app/owner/dog-profile/[dogId]/actions.ts`
- `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
- `src/app/walker/settings/page.tsx`
- `src/app/walker/dashboard/WalkerDashboardClient.tsx`

Issue:
The owner -> walker assignment flow previously exposed a global list of all accepting walkers through a bare dropdown on dog profile.

Why this mattered:
- it felt like an internal admin control instead of a trust-based owner/walker relationship action
- it exposed a system-wide walker list in owner UI
- it weakened confidence in the safety model of the product

Resolution:
- local implementation now replaces the dropdown with invite-code lookup + explicit confirmation
- walker invite code is surfaced in a minimal `/walker/settings` utility surface with copy action
- the settings surface is linked from a small gear in the walker dashboard topbar, not from bottom-nav

Validation:
- compatibility check found `0` walker profiles missing invite codes
- `npx tsc --noEmit` passed after the batch

Status:
- resolved locally
- not yet production-verified because no new deploy happened yet

## Latest Override (2026-04-14)

### Finding J
Severity: High

Area:
- mobile installed PWA notification click/open path
- `public/firebase-messaging-sw.js`
- `src/lib/services/notifications/fcmService.ts`

Current verified state:
- installed-PWA verification reached:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA

What this means:
- delivery is working on the supported installed-PWA path
- duplicate-delivery is not the blocker
- tap/open behavior is now verified on the supported installed-PWA path
- the old V5 defect is resolved

Important investigation guardrails:
- do not reopen timing, grace-window, or token-registration work unless a new defect is proven
- do not treat regular mobile browser-tab behavior as the signoff path
- do not use the dirty local `public/sw.js` artifact as evidence of what production is running

Status:
- resolved in production
- verified through installed-PWA manual signoff
- keep the unified-worker architecture stable unless a new production defect appears

This file tracks the meaningful debug findings that mattered from late Phase 1 through owner-home execution, walker Phase 3 work, and the final Phase 4 production-verification result.

## Resolved Phase 1 Findings
These earlier findings are closed:

1. owner zero-state copy now respects whether an active walker exists
2. owner assign-walker CTA copy was cleaned up
3. walker bottom-nav active-state now handles nested non-home routes more safely

Primary resolving commit:

- `bec97d5` `fix(ui): conditional zero-state copy, CTA copy polish, walker nav startsWith`

## Resolved Phase 2 Owner-History Findings
These findings were discovered after the owner-home history work became more interactive.

### Finding A
Severity: Medium

Area:
- `src/app/owner/dashboard/components/OwnerWalkListView.tsx`

Issue:
Conditional hiding of the filter bar could leave a hidden non-`all` filter state active after switching dogs.

Why this mattered:
- the owner could see a silently filtered list with no visible controls

Resolution:
- effective filtering now derives from whether the controls are actually visible

Commits:
- `9ee4ccd`
- `3a0b550`

### Finding B
Severity: Medium

Area:
- `src/app/owner/dashboard/OwnerDashboardClient.tsx`

Issue:
Switching dogs could briefly render stale history UI or keep the new dog in the wrong expanded/collapsed state.

Why this mattered:
- the owner could see another dog's history surface under the newly selected dog's header

Resolution:
- full-history expansion now resets on dog switch
- history rendering is guarded so stale dog history does not render during transition

Commits:
- `e57d642`
- `5755223`

### Finding C
Severity: Medium

Area:
- `src/app/owner/dashboard/OwnerDashboardClient.tsx`

Issue:
Out-of-order async history responses could still overwrite state after a dog switch, even if stale render windows were guarded.

Why this mattered:
- the correct current-dog history block could disappear or become stale after a slower previous request resolved late

Resolution:
- stale async dog-history requests are now ignored via effect cleanup guarding

Commit:
- `7d4e8d9`

## Resolved Phase 3 Walker Findings

### Finding D
Severity: Medium

Area:
- `src/app/walker/dashboard/WalkerDashboardClient.tsx`

Issue:
The chooser UI behaved like multi-select, but the action only started `selectedDogs[0]`.

Why this mattered:
- the walker could see multiple selected dogs even though only one dog would actually start
- this contradicted the product rule that the next action must be obvious and truthful

Resolution:
- chooser selection was reduced to true single-select behavior
- checkbox-like selection affordance was removed

Commit:
- `7a9ee89`

### Finding E
Severity: Low

Area:
- `src/app/walker/live/WalkerLiveClient.tsx`

Issue:
The finish SlideOver used a celebration card and checkmark before confirmation.

Why this mattered:
- it added reading time and ceremony in the middle of a working walk loop
- it weakened the calm operational tone the walker flow should keep

Resolution:
- the celebration framing was removed
- the finish SlideOver now uses minimal timer + dog-name confirmation before note + confirm

Commit:
- `6921714`

## Local Worktree Finding

### Finding F
Severity: Medium

Area:
- `src/app/owner/dashboard/OwnerDashboardClient.tsx`

Issue:
If the initial history load failed before completed history existed, the history block could disappear entirely and the retry UI became unreachable.

Why this matters:
- the owner loses the only visible recovery path for history loading
- this was the last meaningful owner-history contradiction left from the earlier stop point

Status:
- fixed locally in the worktree
- not committed yet

Local resolution shape:
- shared loader for initial load and retry
- request-id guard instead of the older stale-flag pattern
- history section can render on error, not only on success

Verification already run:
- `npm exec tsc -- --noEmit`
- `npm run build`

## Previous Accepted Residual
The earlier owner residual about hidden first-load history errors should no longer be treated as stable truth.

A local worktree fix now exists for that path. Review it intentionally before making more owner changes.

## Resolved Phase 4 Findings

### Finding G
Severity: High

Area:
- `src/app/walker/dashboard/actions.ts`

Issue:
The original 30-second grace block sat after `redirect("/walker/live")`, so it never executed.

Why this mattered:
- owner received `WALK_STARTED` immediately on every start
- accidental starts were no longer protected by grace

Resolution:
- server-side delayed block removed
- grace timing moved to `WalkerLiveClient` and anchored to actual walk `startTime`

Commit:
- `1e57772`

### Finding H
Severity: Medium

Area:
- `src/lib/services/notifications/fcmService.ts`

Issue:
Notification copy for walk start/complete remained English inside a Hebrew-first app.

Resolution:
- `WALK_STARTED` / `WALK_COMPLETED` FCM title/body strings localized to Hebrew

Commit:
- `4304e2f`

### Finding I
Severity: Medium

Area:
- `src/app/walker/live/actions.ts`
- `src/lib/repositories/notificationsRepo.ts`

Issue:
After moving grace to the client, refresh/remount after the 30-second threshold could re-fire `WALK_STARTED`.

Resolution:
- delivery-log dedupe added via `hasSuccessfulDelivery(walkId, "WALK_STARTED")`
- refresh/remount no longer blindly re-sends when a successful delivery already exists

Commit:
- `d3174cd`

## Current Visible Residuals
- Phase 2 first-time price state (`currentPrice = 0.00`) still has not been exercised on production data.
- Phase 3 blocked price-unset runtime path still cannot be exercised end-to-end because the QA seed API cannot produce `currentPrice = 0.00`.
- Phase 4 installed-PWA verification is complete:
  - `V3` PASS
  - `V4` PASS
  - `V5` PASS
  - signoff complete on the supported installed-PWA path.
- Phase 4 retains one accepted low-probability residual:
  two nearly simultaneous grace triggers could both pass dedupe before a `SENT` row exists.

## How To Use This File
Before reopening owner-home or walker-flow work:

1. ask whether you found a real defect or only possible additional polish
2. if it is a real defect, verify it against the current committed slice chain and the findings above
3. if the issue is in Phase 4 notification/grace behavior, distinguish:
   - implemented code review findings
   - production/manual verification findings
4. if no real defect exists, move forward from the current Phase 4 verification/signoff stop point instead of reopening resolved slices
