# Phase 1A Execution Plan — Billing Truth Bugfix (Read-Side Only)

**Canonical source:** `plans/BATCH-BILLING-PRACTICAL-CONTRACT-LAYER.md` (Phase 1A section)
**Status:** READY TO EXECUTE — no PM approvals needed

---

## 1. Context

`closePaymentPeriod` in `billingRepo.ts` currently fetches each walk's price from
`dogWalkers.currentPrice` unconditionally (line 121). This means a price change after a walk
completes silently revalues that walk at close time.

`walks.final_price` already exists as a nullable `decimal(10,2)` column in the schema. The
billing read path simply ignores it. This fix makes the read path honor it when present.

This is a pure read-side bugfix. It does not decide when or how `finalPrice` gets written —
that is Phase 1B. Separating the two keeps this phase independently shippable at near-zero
risk: all existing production rows have `final_price = null`, so the fallback fires for every
existing walk and behavior is unchanged in production until Phase 1B ships.

---

## 2. Goal

Make `closePaymentPeriod` resolve the per-walk billing amount as:

```
walk.finalPrice ?? dw?.currentPrice ?? "0.00"
```

instead of the current:

```
dw?.currentPrice ?? "0.00"
```

---

## 3. Exact Scope

**In scope:**
- Two targeted edits inside `closePaymentPeriod` in `src/lib/repositories/billingRepo.ts`:
  1. Extend the `untagged` select to include `walks.finalPrice`.
  2. Change the amount resolution line to prefer `walk.finalPrice`.

**Hard out of scope (executor must not touch):**
- `src/lib/repositories/walksRepo.ts` — any line, any function. **Forbidden in this batch.**
- Any schema file (`src/db/schema/`)
- Any migration file (`drizzle/`)
- Any server action (`src/app/`)
- Any UI file
- Any notification code
- Any other function in `billingRepo.ts` (including `reopenPaymentPeriod`, `getPeriodsByOwner`, etc.)

---

## 4. Files to Inspect Before Editing

| File | Why |
|---|---|
| `src/lib/repositories/billingRepo.ts` | The only file being changed. Read the full `closePaymentPeriod` function (lines 77–163) before touching anything. |
| `src/db/schema/billing.ts` or `src/db/schema/walks.ts` | Confirm the Drizzle column name for `final_price` (expected: `walks.finalPrice`). |

---

## 5. Files Allowed to Change

**Only one file:**

```
src/lib/repositories/billingRepo.ts
```

No other file may be modified in this execution batch.

---

## 6. Exact Code Change Required

### Location
`closePaymentPeriod` — the `untagged` select query (currently line 99–111) and the
amount resolution line (currently line 121).

### Change A — Extend the select to include `finalPrice`

**Before (line 99–101):**
```ts
const untagged = await tx
  .select({ id: walks.id, dogWalkerId: walks.dogWalkerId })
  .from(walks)
```

**After:**
```ts
const untagged = await tx
  .select({ id: walks.id, dogWalkerId: walks.dogWalkerId, finalPrice: walks.finalPrice })
  .from(walks)
```

### Change B — Resolve amount using `finalPrice` first

**Before (line 121):**
```ts
const amount = dw?.currentPrice ?? "0.00";
```

**After:**
```ts
const amount = walk.finalPrice ?? dw?.currentPrice ?? "0.00";
```

### No other lines change.

The `dogWalkers` join and fallback stay exactly as-is — they remain the permanent legacy-row
safety net. The `walks` import is already present at the top of the file.

---

## 7. Verification Steps

Run after the edit, before committing:

```bash
npx tsc --noEmit
npm run build
```

Both must pass with zero errors.

Then run the regression scenario below.

---

## 8. Regression Scenario (Mandatory)

This directly exercises the new code path. Must be run manually against a dev/staging DB.

**Setup:**
1. Complete a walk normally via the app (walker starts, owner ends, status = COMPLETED).
   At this point `walks.final_price` is still null — no Phase 1B yet.

**Exercise the new path:**
2. Directly in DB: `UPDATE walks SET final_price = 90.00 WHERE id = '<that walk id>';`
3. Directly in DB: `UPDATE dog_walkers SET current_price = 120.00 WHERE id = '<dogWalkerId for that walk>';`
4. Close the billing period via the app UI.

**Assert correct behavior:**
5. `SELECT amount FROM payment_entries WHERE walk_id = '<that walk id>';`
   → Expected: `90.00` (reads `finalPrice`, not `currentPrice`).

**Assert fallback still works:**
6. Complete a second walk and leave `final_price = NULL` on it.
7. Close another billing period.
8. `SELECT amount FROM payment_entries WHERE walk_id = '<second walk id>';`
   → Expected: matches `dog_walkers.current_price` for that pair (fallback path).

Failure on step 5 = Phase 1A is broken. Do not commit.

---

## 9. Risks / Guardrails

| Risk | Severity | Guardrail |
|---|---|---|
| Wrong fallback chain (e.g., `dw?.currentPrice ?? walk.finalPrice`) | High | Verify step 5 above catches this |
| Accidentally touching `walksRepo.ts` | High | Executor must `git diff --staged` before commit and abort if walksRepo appears |
| TypeScript error if `finalPrice` column name differs | Low | `tsc --noEmit` catches it immediately |
| Behavior change in production | None | All existing rows have `final_price = null`; fallback fires for all |

**Scope creep trip-wire:** If the executor finds themselves editing anything other than the
two lines described in §6, they must stop and re-read this plan. Phase 1A is exactly two
line-range edits in one file.

---

## 10. Out of Scope (Explicit Deferral List)

The following belong to later phases. Do not touch in this batch:

| Item | Phase |
|---|---|
| Write `finalPrice` in `startWalk` | Phase 1B |
| Fix `endWalk` null-overwrite | Phase 1B |
| `price_agreements` table and repo | Phase 2 |
| `walk_price_offers` table and repo | Phase 3 |
| `adjustment_requests` table and repo | Phase 4 |
| FCM notifications for pricing events | Phase 5 |
| Backfill of historical `final_price = null` rows | Non-blocking, future |
| UI changes of any kind | Phase 2+ |
| Schema migration files | Phase 2+ |

---

## 11. Expected Executor Report Format

When done, report back with exactly:

```
Phase 1A execution complete.

File changed: src/lib/repositories/billingRepo.ts

Changes made:
- untagged select: added `finalPrice: walks.finalPrice`
- amount resolution: `walk.finalPrice ?? dw?.currentPrice ?? "0.00"`

Verification:
  Commands run:    npx tsc --noEmit && npm run build
  Expected result: zero errors
  Observed result: [actual output]

Regression scenario:
  Step 5 result: payment_entries.amount = [value] for walk with finalPrice = 90.00
  Step 8 result: fallback path correct for walk with finalPrice = null

Files not touched: walksRepo.ts (confirmed via git diff --staged)

Remaining risk: [anything unexpected]
```
