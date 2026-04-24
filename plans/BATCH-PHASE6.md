# BATCH: Validation and Hardening (Roadmap Phase 6)

## Context

Phases 1–5 are shipped and production-verified. The app has correct navigation hierarchy, demoted secondary surfaces, warm Hebrew copy, and a working owner→walker invite-code assignment flow. Phase 6 is the formal QA gate before declaring V1.1 complete.

One known code-level friction item surfaced during the Phase 6 Step C walker walkthrough: after a walk ends, the owner dashboard does not immediately reflect the completed walk in history — it waits up to 30 seconds for the auto-refresh cycle. Root cause: `endWalkFromLiveAction` in `src/app/walker/live/actions.ts` calls `revalidatePath("/walker/dashboard")` but not `/owner/dashboard`. Fix is one line.

---

## Decisions

1. Deploy the one-line fix first, then human QA walkthroughs run on production.
2. Manual cold walkthroughs only — QA seed/reset contamination still unresolved, manual is faster for role-based validation.
3. Per-screen product checklist is documentation only — cosmetic findings go to future items.
4. No new features. No scope expansion.
5. One commit for the code fix; walkthroughs produce no commits.

---

## Executor Tasks
*(Claude runs these)*

### Task 1: Technical smoke (0 files)

```bash
npx tsc --noEmit
npm run build
```

Expected: 0 type errors, build exits 0. Fix any failures before Task 2.

**Verify:** both commands pass cleanly.

---

### Task 2: Fix post-walk history refresh (1 file)

**File:** `src/app/walker/live/actions.ts`

**Change:** Add one line immediately after the existing `revalidatePath("/walker/dashboard")` call:
```ts
revalidatePath("/owner/dashboard");
```

**Verify:**
```bash
npx tsc --noEmit
```

**Commit:**
```
fix(owner-dashboard): revalidate owner path on walk end so history refreshes immediately
```

---

### Task 3: Deploy

```bash
git push origin main
```

After Vercel READY — hand off to Human QA Tasks.

---

## Human QA Tasks
*(Done by human on production after Task 3 deploy)*

### Task 4: Owner cold walkthrough

Open `https://akivot.vercel.app` in a fresh incognito session.

Steps:
1. Sign up as new owner.
2. Add first dog.
3. Assign walker via invite code.
4. Set price.
5. Return later — dashboard shows dog status correctly.
6. Billing entry visible in owner billing surface.

Pass criteria:
- Each screen describable in one sentence?
- Clear next action at each step without exploring?
- No page-hopping for routine setup?

---

### Task 5: Walker cold walkthrough

Steps:
1. Log in as walker on fresh session.
2. Dashboard understood in <2 seconds — assignment visible, start CTA prominent.
3. Start walk.
4. Live mode — timer dominant, no nav noise.
5. End walk.
6. Return to dashboard — ready state clear.
7. Switch to owner session: history shows completed walk immediately (no wait).

Pass criteria:
- Walker never navigates before acting.
- Live loop stable and professional.
- Post-walk history appears without manual refresh (V3 for Task 3 deploy).

---

### Task 6: Per-screen product checklist

For each screen changed in Phases 1–5, answer the 5 Phase 6 questions.
Raise any critical "NO" as a follow-up item.

| Screen | One sentence? | Next action clear? | Fewer choices? | No duplicates? | No page-hop? |
|--------|:---:|:---:|:---:|:---:|:---:|
| Owner dashboard | | | | | |
| Owner dog-profile | | | | | |
| Owner billing | | | | | |
| Owner calendar | | | | | |
| Walker dashboard | | | | | |
| Walker live | | | | | |
| Walker dogs | | | | | |
| Landing page | | | | | |
| Login / signup | | | | | |
| Onboarding | | | | | |

---

## Scope

- **Files changed:** 1 (`src/app/walker/live/actions.ts`)
- **Risk tier:** Low — `revalidatePath` is cache invalidation only, no business logic change
- **Council:** not required
- **Split:** not needed — 6 tasks within one batch
