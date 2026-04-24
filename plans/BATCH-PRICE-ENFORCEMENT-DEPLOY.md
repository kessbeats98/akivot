# Execution Plan: Price Enforcement + Local Cleanup Deploy

**Date:** 2026-04-16  
**Executor:** Claude Code (Sonnet)  
**Supervisor:** PM session (separate chat)  
**Branch:** `main` (ahead 7 from origin, will be ahead 10 after commits)

---

## Context

The repo has 7 committed-but-unpushed commits (Phase 5 hierarchy + invite-code batch).  
The worktree also has ~17 dirty files. This plan commits the 3 meaningful local changes,  
validates, deploys, and production-verifies.

Everything else in the worktree is noise and must NOT be touched.

---

## PHASE 1 — Commit Phase 5 hierarchy diffs

**Goal:** Bundle all uncommitted Phase 5 hierarchy/demotion UI changes into one commit.

**Files to stage (exactly these, nothing else):**
```
src/components/layout/owner-nav.tsx
src/app/owner/billing/OwnerBillingClient.tsx
src/app/owner/calendar/OwnerCalendarClient.tsx
src/app/owner/dogs/OwnerDogsClient.tsx
src/app/owner/settings/page.tsx
src/app/walker/billing/page.tsx
src/app/walker/calendar/page.tsx
src/app/walker/dogs/WalkerDogsClient.tsx
```

**Commit message:**
```
style(hierarchy): demote owner+walker secondary surfaces — nav, billing, calendar, dogs, settings
```

**Verify before committing:**
- `git diff --staged` — confirm only the 8 files above, no surprises
- Changes are hierarchy/UI only — back-nav additions, label demotions, icon-only nav items

**After commit:**
- `git log --oneline -1` — confirm the commit hash and message
- Report: "Phase 1 done — commit {hash}"

**DO NOT:**
- Stage any other file
- Modify any code — just commit what's already in the worktree

---

## PHASE 2 — Commit price enforcement

**Goal:** Commit the server-side guard that blocks walk start when price is missing or zero.

**Files to stage (exactly these):**
```
src/lib/repositories/walksRepo.ts
src/lib/action-utils.ts
```

**Commit message:**
```
feat(walks): block walk start when price missing or zero + Hebrew error copy
```

**Verify before committing:**
- `git diff --staged` — confirm only 2 files
- `walksRepo.ts` changes:
  - `startWalk` now selects `currentPrice` in the assignment query
  - throws `"Price not set"` if `currentPrice` is null or `"0.00"`
  - `getAssignedDogsByWalker` now has explicit `orderBy` (asc startedAt, createdAt, name)
  - `desc` import removed (verify it's not used elsewhere in the file — grep for `desc(` in the file)
- `action-utils.ts` changes:
  - adds `"Price not set": "לא ניתן להתחיל טיול עד שיוגדר מחיר"` to ERROR_MAP

**After commit:**
- `git log --oneline -1` — confirm
- Report: "Phase 2 done — commit {hash}"

**DO NOT:**
- Touch any other file
- Add logic beyond what's already in the diff

---

## PHASE 3 — Commit owner dashboard fix

**Goal:** Commit the hydration-safe timestamp + smart initial dog selection fix.

**Files to stage (exactly this):**
```
src/app/owner/dashboard/OwnerDashboardClient.tsx
```

**Commit message:**
```
fix(owner-dashboard): hydration-safe timestamp + auto-select first incomplete-setup dog
```

**Verify before committing:**
- `git diff --staged` — confirm only 1 file
- Changes:
  - `selectedDogId` initial state now picks the first dog with incomplete setup (no active walker or price=0)
  - `lastRefreshed` starts as `null`, set via `useEffect` after mount (avoids SSR mismatch)
  - Render shows `\u00a0` (nbsp) until timestamp is set

**After commit:**
- `git log --oneline -1` — confirm
- Report: "Phase 3 done — commit {hash}"

---

## PHASE 4 — Validation

**Goal:** Confirm the full commit chain builds and type-checks cleanly.

**Run these commands in order:**

1. `git log --oneline origin/main..HEAD`
   - Expected: 10 commits (7 previous + 3 new from Phases 1-3)

2. `npx tsc --noEmit`
   - Expected: clean pass, no errors

3. `npm run build`
   - Expected: clean pass
   - If EPERM on `.next\trace` — this is a sandbox issue, not a real failure. Note it and move on.

4. `git status -s`
   - Confirm remaining dirty files are ONLY noise (STATE.md, .gitignore, playwright.config.ts, skills-lock.json, drizzle journal, DebugPanel.tsx, untracked .agents/ and .claude/ dirs)
   - None of the 3 committed file groups should appear dirty

**After validation:**
- Report: "Phase 4 done — tsc clean, build {pass/fail+reason}, 10 commits confirmed"

**If validation fails:**
- Do NOT proceed to Phase 5
- Report the exact error
- Wait for PM guidance

---

## PHASE 5 — Deploy

**Goal:** Push all 10 local commits to origin. Vercel auto-deploys.

**Command:**
```
git push origin main
```

**After push:**
- `git log --oneline origin/main..HEAD` — should show 0 commits (fully synced)
- Report: "Phase 5 done — pushed, Vercel deploying"

**DO NOT:**
- Force push
- Push any branch other than main

---

## PHASE 6 — Production Verification

**Goal:** Manually verify the deployed changes on `https://akivot.vercel.app`.

**Wait for Vercel deploy to complete first.** Check deploy status if needed.

**Verification checklist:**

| ID | Test | Expected |
|----|------|----------|
| V1 | Walker opens dashboard — secondary nav (Dogs/Billing) feels demoted, not primary | PASS |
| V2 | Owner opens dog-profile for a dog with price=0 or no price — walker cannot start walk | PASS (blocked with Hebrew error) |
| V3 | Owner sets price for that dog — walker can now start walk | PASS |
| V4 | Owner dashboard auto-selects the first incomplete-setup dog on load | PASS |
| V5 | Owner secondary surfaces (billing, calendar, dogs, settings) feel like depth, not primary | PASS |

**Note:** V2/V3 require a production dog-walker assignment with price=0. If no such state exists in production, this verification is manual/visual only — note it and move on.

**After verification:**
- Report each V-result as PASS/FAIL/SKIP(reason)
- Report: "Phase 6 done — {summary}"

---

## RULES FOR THE EXECUTOR

1. Execute phases in order. Do not skip.
2. After each phase, report results to the PM chat before proceeding.
3. Do not modify any code — only commit what already exists in the worktree.
4. Do not touch files outside the explicit file lists.
5. Do not clean up orphaned files (WalkerBillingClient, WalkerCalendarClient) — separate batch.
6. Do not clean up dead code (getAvailableWalkersAction) — separate batch.
7. Do not edit STATE.md, CLAUDE.md, MEMORY.md, or LESSONS.md.
8. If anything unexpected happens — stop, report, wait.

---

## POST-DEPLOY FOLLOW-UP (not part of this batch)

These items remain visible for future batches:
- Orphaned file cleanup: `WalkerBillingClient.tsx`, `WalkerCalendarClient.tsx`
- Dead code cleanup: `getAvailableWalkersAction()` in `owner/dashboard/actions.ts`
- Icon rendering: Material Symbols labels rendering as raw text on production
- Phase 2 QA gap: first-time price state on production data still unverified via automation
- Phase 3 QA gap: blocked price-unset runtime path still seed-limited
- Minor friction: completed walk not immediately visible in owner history after end-walk
