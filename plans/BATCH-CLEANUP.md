# BATCH: Cleanup (Orphaned Files + Dead Code)

Two independent cleanup items bundled into one batch.

---

## Decisions

1. `WalkerBillingClient.tsx` and `WalkerCalendarClient.tsx` are orphaned — their pages now import from `@/components/walker/`. Delete them.
2. `getAvailableWalkersAction()` in `owner/dashboard/actions.ts` is dead — no caller anywhere in the codebase. The invite-code flow replaced it. Delete the function + any imports it was the sole consumer of.
3. Two separate commits — one per cleanup item — for clean git history.

---

## Plan

### Task 1: Delete orphaned files (2 files)

Delete these files entirely:
- `src/app/walker/billing/WalkerBillingClient.tsx`
- `src/app/walker/calendar/WalkerCalendarClient.tsx`

**Why safe:** Both pages (`src/app/walker/billing/page.tsx`, `src/app/walker/calendar/page.tsx`) import from `@/components/walker/WalkerBillingSurface` and `@/components/walker/WalkerCalendarSurface` respectively. No file in `src/` imports the old clients.

**Verify:**
```bash
grep -r "WalkerBillingClient\|WalkerCalendarClient" src/
# Expected: no matches
tsc --noEmit
# Expected: clean
```

**Commit:**
```
chore(walker): remove orphaned WalkerBillingClient + WalkerCalendarClient
```

### Task 2: Remove dead getAvailableWalkersAction (1 file)

**File:** `src/app/owner/dashboard/actions.ts`

Delete lines 39–46 (the `getAvailableWalkersAction` function):
```typescript
export async function getAvailableWalkersAction(): Promise<{ id: string; displayName: string }[]> {
  await assertAuthenticated();
  const db = getDb();
  return db
    .select({ id: walkerProfiles.id, displayName: walkerProfiles.displayName })
    .from(walkerProfiles)
    .where(eq(walkerProfiles.isAcceptingClients, true));
}
```

Then check if removing it leaves any imports unused. Currently the function is the only consumer of:
- `eq` from `drizzle-orm` — also used by other code? **Check before removing.**
- `getDb` from `@/db/drizzle` — also used? **Check before removing.**
- `walkerProfiles` from `@/db/schema` — also used? **Check before removing.**

If any import becomes unused after deleting the function, remove that import line too.

**Verify:**
```bash
grep -r "getAvailableWalkersAction" src/
# Expected: no matches
tsc --noEmit
# Expected: clean
```

**Commit:**
```
chore(owner): remove dead getAvailableWalkersAction (replaced by invite-code flow)
```

### Task 3: Final build check

```bash
npm run build
```
Expected: clean build, no regressions.

Then push:
```bash
git push origin main
```

---

## Scope

- **Files touched:** 3 (2 deleted, 1 edited)
- **Risk tier:** Low (dead code removal only)
- **Council:** not required
