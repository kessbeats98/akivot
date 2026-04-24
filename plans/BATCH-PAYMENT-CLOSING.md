# BATCH: Payment Period Closing (V1.2 — Feature Batch 1)

## Context

V1.1 is complete (6 phases shipped). This is the first V1.2 feature batch.

The billing backend is **100% implemented**: `closePaymentPeriod()` in `billingRepo.ts` runs a CAS transaction with audit, `closePeriodAction` in `src/app/owner/billing/actions.ts` is wired, the form + close button exist in `OwnerCurrentPaymentCard`. The button is already conditioned on `pendingWalkCount > 0` and submits correctly.

**What is actually missing — the three real gaps:**

1. **No confirmation dialog** — close submits immediately on tap. One mis-tap closes a period irreversibly.
2. **No pending/error state** — the button gives no feedback while the action runs, and errors (conflict, network) are silently swallowed.
3. **No reopen flow** — `paymentPeriods.reopenedAt`, `reopenedByUserId`, and `REOPEN_PAYMENT_PERIOD` audit action are all in the schema, but repo + action + UI are absent.

Walker billing already reflects PAID status correctly (`WalkerBillingSurface` lines 21–45). Owner history already shows past periods (`OwnerPaymentHistorySection`). No changes needed to those surfaces beyond reopen.

---

## Decisions

1. Replace the direct `<form action={...}>` in `OwnerCurrentPaymentCard` with a two-step UX: tap → inline confirm section → `useTransition` call → done.
2. Use `useTransition` (not `useActionState`) — the action is called programmatically after confirmation, so we build a `FormData` manually and call the action directly. This avoids changing the server action signature.
3. Error mapping: catch known error messages (`"Conflict"`, `"Period not open"`) and surface Hebrew strings; unknown errors → generic fallback.
4. Reopen flow: implement fully — `REOPENED → PAID` closure must also be supported, so `closePaymentPeriod` gets a one-line guard change to allow REOPENED status as well as OPEN.
5. Reopen is NOT a soft close: walker's already-tagged entries stay; the period re-enters the owner's "current" section (`OwnerBillingClient` already filters on `OPEN | REOPENED`). A new OPEN period still gets created by `ensureOpenPeriods` for future walks — these are separate periods.
6. All user-facing strings in Hebrew.
7. No schema migration — all DB columns exist. No new tables.

---

## Plan

### Task 1: Pre-flight validation (0 files changed)

```bash
npx tsc --noEmit
npm run build
```

Expected: 0 type errors, build exits 0. Fix any failures before proceeding.

**Verify:** both commands pass cleanly.

---

### Task 2: Confirmation dialog + pending state on close (1 file)

**File:** `src/app/owner/billing/components/OwnerCurrentPaymentCard.tsx`

**Changes:**

1. Add imports:
   ```tsx
   import { useTransition } from "react";
   ```

2. Add state and handler inside the component:
   ```tsx
   const [showConfirm, setShowConfirm] = useState(false);
   const [isPending, startTransition] = useTransition();
   const [closeError, setCloseError] = useState<string | null>(null);

   function handleClose() {
     startTransition(async () => {
       setCloseError(null);
       try {
         const fd = new FormData();
         fd.append("lockVersion", String(period.lockVersion));
         await closePeriodAction(period.id, fd);
         setShowConfirm(false);
       } catch (e) {
         const msg = e instanceof Error ? e.message : "";
         if (msg === "Conflict") {
           setCloseError("התקופה עודכנה בינתיים — רענן את הדף ונסה שוב.");
         } else if (msg === "Period not open") {
           setCloseError("התקופה כבר נסגרה.");
         } else {
           setCloseError("שגיאה בסגירת התקופה. נסה שוב.");
         }
       }
     });
   }
   ```

3. Replace the `<form>` block (currently inside `{period.pendingWalkCount > 0 && ...}`) with:
   ```tsx
   {period.pendingWalkCount > 0 && !showConfirm && (
     <button
       type="button"
       onClick={() => setShowConfirm(true)}
       className="mt-4 w-full bg-brand text-white py-4 rounded-2xl font-bold text-base shadow-glow-brand transition-transform active:scale-95"
     >
       סגור תקופה ({period.pendingWalkCount} טיולים)
     </button>
   )}

   {period.pendingWalkCount > 0 && showConfirm && (
     <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/5 p-4 space-y-3">
       <p className="text-sm font-semibold text-dark text-center">
         לסגור תקופה עם {period.pendingWalkCount} טיולים?
       </p>
       <p className="text-xs text-gray-400 text-center">
         הסכום יחושב לפי המחיר הנוכחי של כל טיול. לא ניתן לבטל.
       </p>
       {closeError && (
         <p className="text-xs text-red-500 text-center">{closeError}</p>
       )}
       <div className="flex gap-2">
         <button
           type="button"
           onClick={() => { setShowConfirm(false); setCloseError(null); }}
           disabled={isPending}
           className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 disabled:opacity-50"
         >
           ביטול
         </button>
         <button
           type="button"
           onClick={handleClose}
           disabled={isPending}
           className="flex-1 py-3 rounded-xl bg-brand text-white text-sm font-bold shadow-glow-brand disabled:opacity-60"
         >
           {isPending ? "סוגר..." : "אשר סגירה"}
         </button>
       </div>
     </div>
   )}
   ```

**Verify:**
```bash
npx tsc --noEmit
```
Manual: tap "סגור תקופה" → confirm section appears. Tap "ביטול" → returns to initial state. Tap "אשר סגירה" → button shows "סוגר..." → period moves to history.

**Commit:**
```
feat(billing): add confirmation dialog and pending state to close-period action
```

---

### Task 3: Allow REOPENED periods to be closed (1 file)

**File:** `src/lib/repositories/billingRepo.ts`

**Change:** In `closePaymentPeriod`, line 95, change the status guard:
```ts
// Before:
if (period.status !== "OPEN") throw new Error("Period not open");

// After:
if (period.status !== "OPEN" && period.status !== "REOPENED") throw new Error("Period not open");
```

And in the CAS update (line 145–150), change the WHERE clause:
```ts
// Before:
.where(and(
  eq(paymentPeriods.id, input.periodId),
  eq(paymentPeriods.status, "OPEN"),
  eq(paymentPeriods.lockVersion, input.lockVersion),
))

// After:
.where(and(
  eq(paymentPeriods.id, input.periodId),
  inArray(paymentPeriods.status, ["OPEN", "REOPENED"]),
  eq(paymentPeriods.lockVersion, input.lockVersion),
))
```

> Note: `inArray` is already imported. No new imports needed.

**Verify:**
```bash
npx tsc --noEmit
```

**Commit:**
```
fix(billing): allow REOPENED periods to be closed via closePaymentPeriod
```

---

### Task 4: Reopen — validation schema + repo function (2 files)

**File 1:** `src/lib/validation/billing.ts`

Add at the bottom:
```ts
export const reopenPeriodSchema = z.object({
  periodId: uuidSchema,
  lockVersion: z.coerce.number().int().nonnegative(),
});

export type ReopenPeriodInput = z.infer<typeof reopenPeriodSchema>;
```

**File 2:** `src/lib/repositories/billingRepo.ts`

Add import at top:
```ts
import type { ClosePeriodInput, ReopenPeriodInput } from "@/lib/validation/billing";
```
(replace existing `ClosePeriodInput` import)

Add new export function at the bottom:
```ts
export async function reopenPaymentPeriod(input: ReopenPeriodInput, actorUserId: string): Promise<void> {
  const db = getDb();
  const now = new Date();

  await db.transaction(async (tx) => {
    const [period] = await tx
      .select({ id: paymentPeriods.id, status: paymentPeriods.status, lockVersion: paymentPeriods.lockVersion })
      .from(paymentPeriods)
      .where(eq(paymentPeriods.id, input.periodId))
      .limit(1);
    if (!period) throw new Error("Period not found");
    if (period.status !== "PAID") throw new Error("Period not paid");
    if (period.lockVersion !== input.lockVersion) throw new Error("Conflict");

    const updated = await tx
      .update(paymentPeriods)
      .set({ status: "REOPENED", reopenedAt: now, reopenedByUserId: actorUserId, updatedAt: now, lockVersion: period.lockVersion + 1 })
      .where(and(
        eq(paymentPeriods.id, input.periodId),
        eq(paymentPeriods.status, "PAID"),
        eq(paymentPeriods.lockVersion, input.lockVersion),
      ))
      .returning({ id: paymentPeriods.id });
    if (updated.length === 0) throw new Error("Conflict");

    await logAudit({
      tx,
      actorUserId,
      entityType: "PAYMENT_PERIOD",
      entityId: input.periodId,
      action: "REOPEN_PAYMENT_PERIOD",
      afterJson: { status: "REOPENED" },
    });
  });
}
```

**Verify:**
```bash
npx tsc --noEmit
```

**Commit:**
```
feat(billing): add reopenPaymentPeriod repo function and reopenPeriodSchema
```

---

### Task 5: Reopen — server action (1 file)

**File:** `src/app/owner/billing/actions.ts`

Add imports:
```ts
import { reopenPeriodSchema } from "@/lib/validation/billing";
import { reopenPaymentPeriod } from "@/lib/repositories/billingRepo";
```

Add new export at the bottom:
```ts
// periodId bound via .bind(null, periodId); FormData: lockVersion (hidden input)
export async function reopenPeriodAction(periodId: string, formData: FormData): Promise<void> {
  const user = await assertAuthenticated();
  await assertPeriodOwnership(periodId, user.id);
  const input = reopenPeriodSchema.parse({ periodId, lockVersion: formData.get("lockVersion") });
  await reopenPaymentPeriod(input, user.id);
  revalidatePath("/owner/billing");
}
```

**Verify:**
```bash
npx tsc --noEmit
```

**Commit:**
```
feat(billing): add reopenPeriodAction server action
```

---

### Task 6: Reopen — UI button in history section (1 file)

**File:** `src/app/owner/billing/components/OwnerPaymentHistorySection.tsx`

The `HistoryItem` component is a client component. Make the following changes:

1. Add imports:
   ```tsx
   import { useTransition, useState } from "react";
   import { reopenPeriodAction } from "../actions";
   ```

2. Add `"use client"` directive is already present — no change needed.

3. Add reopen state + handler inside `HistoryItem`:
   ```tsx
   const [showReopen, setShowReopen] = useState(false);
   const [isReopening, startReopen] = useTransition();
   const [reopenError, setReopenError] = useState<string | null>(null);

   function handleReopen() {
     startReopen(async () => {
       setReopenError(null);
       try {
         const fd = new FormData();
         fd.append("lockVersion", String(period.lockVersion));
         await reopenPeriodAction(period.id, fd);
         setShowReopen(false);
       } catch (e) {
         const msg = e instanceof Error ? e.message : "";
         if (msg === "Conflict") {
           setReopenError("הנתונים השתנו — רענן את הדף ונסה שוב.");
         } else {
           setReopenError("שגיאה בפתיחת התקופה. נסה שוב.");
         }
       }
     });
   }
   ```

4. Inside the expanded section (after `<OwnerPaymentEntriesList entries={period.entries} />`), add the reopen UI — only for `PAID` periods:
   ```tsx
   {isPaid && !showReopen && (
     <button
       type="button"
       onClick={() => setShowReopen(true)}
       className="mt-3 w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-300 transition-colors"
     >
       פתח מחדש
     </button>
   )}

   {isPaid && showReopen && (
     <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 space-y-2">
       <p className="text-xs font-semibold text-amber-800 text-center">לפתוח את התקופה מחדש?</p>
       <p className="text-xs text-amber-600 text-center">התקופה תחזור לסטטוס "עודכן" ותוכל לסגור אותה מחדש.</p>
       {reopenError && (
         <p className="text-xs text-red-500 text-center">{reopenError}</p>
       )}
       <div className="flex gap-2">
         <button
           type="button"
           onClick={() => { setShowReopen(false); setReopenError(null); }}
           disabled={isReopening}
           className="flex-1 py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 disabled:opacity-50"
         >
           ביטול
         </button>
         <button
           type="button"
           onClick={handleReopen}
           disabled={isReopening}
           className="flex-1 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold disabled:opacity-60"
         >
           {isReopening ? "פותח..." : "פתח מחדש"}
         </button>
       </div>
     </div>
   )}
   ```

**Verify:**
```bash
npx tsc --noEmit
npm run build
```
Manual: expand a PAID history item → "פתח מחדש" button visible. Tap → confirm section appears. Confirm → period moves to current section with REOPENED status. From current section: expand → "סגור תקופה" button visible (0 pending walks, so it will NOT show unless there are new untagged walks — this is correct behavior).

**Commit:**
```
feat(billing): add reopen-period confirmation UI to owner billing history
```

---

## Scope

| | |
|---|---|
| **Files changed** | 4 (`OwnerCurrentPaymentCard.tsx`, `billingRepo.ts`, `validation/billing.ts`, `actions.ts`, `OwnerPaymentHistorySection.tsx`) — 5 files |
| **New files** | 0 |
| **Schema migration** | None — all columns exist (`reopenedAt`, `reopenedByUserId`, `REOPEN_PAYMENT_PERIOD` enum value) |
| **Risk tier** | Medium — billing state machine changes + CAS in repo, but no schema migration, no payment processor |
| **Council** | verify-spec recommended (billing state machine: OPEN→PAID, PAID→REOPENED, REOPENED→PAID all touched) |
| **Split** | Not needed — 6 tasks, all in one batch |

---

## Verification Checklist (end-to-end)

Run after Task 6 before shipping:

| Check | Command / Step | Pass Condition |
|---|---|---|
| Type safety | `npx tsc --noEmit` | 0 errors |
| Build | `npm run build` | Exits 0 |
| Close flow | Owner billing → pending walks exist → tap "סגור תקופה" → confirm section → "אשר סגירה" | Period moves to history, walker billing shows "שולם" |
| Pending state | Same as above, observe button | Shows "סוגר..." during submit, disabled |
| Cancel | Tap "סגור תקופה" → tap "ביטול" | Returns to initial button, no state change |
| Conflict error | Manually force double-submit | Shows Hebrew conflict message |
| Reopen flow | Expand PAID history item → "פתח מחדש" → confirm | Period appears in current section as REOPENED |
| Re-close after reopen | Expand REOPENED current period | No pending walks → no close button (correct) |
| Walker sees settled | After close, check walker billing page | Period shows "שולם" badge |
| Audit trail | Check `audit_logs` in DB | `CLOSE_PAYMENT_PERIOD` + `REOPEN_PAYMENT_PERIOD` rows present |

---

## Open Questions

1. After reopen with 0 new pending walks, the owner sees a REOPENED card with no close button — is that acceptable UX, or should we always allow closing even empty periods?
2. If there IS a new OPEN period already (created after the original close), and the owner reopens the old one, they'll see two "current" cards for the same walker. Do we need to prevent `ensureOpenPeriods` from creating a second OPEN period when a REOPENED one already exists?
3. Should `closePaymentPeriod` be limited to tagging only walks created AFTER `reopenedAt` when closing a REOPENED period (to avoid re-tagging edge cases)?
