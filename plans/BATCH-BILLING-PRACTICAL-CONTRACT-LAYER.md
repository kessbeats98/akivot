# BATCH: Billing Practical Contract Layer — V2 (Revised)
## Six-Phase Engineering Plan for Akivot V1.2

**Source doc:** `BILLING.MD`
**Build order:**
1A. Billing truth bugfix (read-side only)
1B. Price-lock policy and write-side
2.  Standing price agreement
3.  Single-walk price override
4.  Adjustment flow (REOPENED periods only, dual approval always)
5.  Notifications

**Rule:** Each phase = one plan+execute session. No phase starts until the prior is deployed and verified.

---

## Phase 1A — Billing Truth Bugfix (Read-side only)

### Goal
Make `closePaymentPeriod` read `walks.finalPrice` first and fall back to `dogWalkers.currentPrice`
only when `finalPrice` is null. This is a narrow, read-only bugfix that prepares the billing
path to honor a locked per-walk price as soon as one exists.

### Why this phase exists
Today, `closePaymentPeriod` reads `dogWalkers.currentPrice` unconditionally. This allows silent
retroactive revaluation of any completed walk. The `walks.finalPrice` column already exists in
the schema; the billing read path simply does not use it.

This phase changes **only** the billing read path. It does not decide when or how `finalPrice`
gets written — that belongs to Phase 1B. Separating the two keeps this phase low risk and
independently shippable.

### Schema impact
**None.** `walks.final_price` already exists as a nullable decimal column.
No migration required.

### Repo / files touched

**`src/lib/repositories/billingRepo.ts` — `closePaymentPeriod` (lines 99-130)**

Step A — extend the untagged-walks select to include `finalPrice`:
```ts
.select({ id: walks.id, dogWalkerId: walks.dogWalkerId, finalPrice: walks.finalPrice })
```

Step B — change the per-walk amount resolution inside the loop:
```ts
// Before (line 121):
const amount = dw?.currentPrice ?? "0.00";

// After:
const amount = walk.finalPrice ?? dw?.currentPrice ?? "0.00";
```

Nothing else changes. `startWalk` is untouched. `endWalk` is untouched. No new freeze-point
behavior. No schema changes.

### Key design decisions
- Read-side fix only. Phase 1A is pure preparation — after deploy, behavior is unchanged
  for all existing walks (their `finalPrice` is still null, so the fallback path is used).
- The `dogWalkers` join and fallback stay in place permanently as the legacy-row safety net.
  Phase 1B decides when `finalPrice` gets populated going forward.

### Verification
```bash
npx tsc --noEmit
npm run build
```

**Mandatory regression scenario (directly exercises the read path):**
1. Start and complete a walk in the normal flow. At this point `walks.final_price` is still null.
2. Directly in DB, set `walks.final_price = 90.00` on that walk row.
3. Mutate `dog_walkers.current_price` to `120.00` for that dog-walker pair.
4. Close the billing period.
5. Verify: `payment_entries.amount = 90.00` for that walk (reading from finalPrice, not currentPrice).
6. Separately: for a walk where `walks.final_price IS NULL`, verify the fallback path still uses
   `dog_walkers.current_price`.

Failure on step 5 means Phase 1A is broken.

### Risks
- Nearly zero. This is a pure read-side change with a documented fallback for all existing data.
- `walks.finalPrice` is currently null for every row in production. Phase 1A alone produces no
  behavior change in production traffic. The regression test above uses manual DB manipulation
  to exercise the new code path.

### Open PM approvals needed
- None. Phase 1A is a correctness fix and requires no product decision.

---

## Phase 1B — Price-Lock Policy and Write-Side

### Goal
Decide when a walk's price becomes locked, and implement that lock point so every new walk
populates `walks.finalPrice` automatically.

### Why this phase exists
Phase 1A made billing ready to honor `walks.finalPrice` when present. Phase 1B is where that
field actually gets written. The question of *when* a price becomes immutable is a product
decision, not a correctness fix — it is intentionally separated from Phase 1A.

### Lock-point options and decision

Three candidate lock points (BILLING.MD framing):

| Candidate | Pros | Cons |
|---|---|---|
| **At walk start** (`startWalk`) | Price reflects standing rate at the moment of service. Simple: single write. No PLANNED-walk state required. | If owner changes the standing rate after the walker already agreed but before starting, the new price applies. |
| At walk booking | Earliest possible lock. Matches "reservation" mental model. | Requires a PLANNED walk lifecycle which Akivot does not currently implement. |
| At walk completion | Reflects actual service delivered. | Vulnerable to mid-walk price mutation by either party. Defeats the purpose of a lock. |

**Recommended default for V1.2: lock at `startWalk`.**

Rationale:
- No new walk lifecycle state required (`startWalk` already creates the walk row).
- Matches the moment when both parties have implicitly agreed (walker has arrived, owner has
  handed over the dog).
- Safest balance: late enough to reflect last-minute price agreements, early enough to
  prevent post-service mutation.

PM must confirm or override this choice before Phase 1B executes. If the PM chooses a different
lock point, the implementation below must be adjusted accordingly.

### Schema impact
**None.** `walks.final_price` already exists.

### Repo / files touched (assuming `startWalk` lock point)

**`src/lib/repositories/walksRepo.ts` — `startWalk` (line 88-100)**

The insert `.values({...})` currently omits `finalPrice`. Add:
```ts
finalPrice: dw.currentPrice,
```
`dw.currentPrice` is already fetched on line 60 and already guarded on line 69
(`if (dw.currentPrice === "0.00") throw`). No new error paths.

**`src/lib/repositories/walksRepo.ts` — `endWalk` (line 157)**

Current code writes `finalPrice: input.finalPrice ?? null` unconditionally. This would silently
clear the Phase 1B lock on every normal walk ending, because most callers do not pass
`input.finalPrice`. Fix:
```ts
...(input.finalPrice != null && { finalPrice: input.finalPrice }),
```
`endWalk` now only writes `finalPrice` when an explicit override is supplied. Phase 3 accepted
offers will supply this. Normal walk endings leave the `startWalk`-locked price intact.

This is strictly necessary to make the chosen lock point actually work. Without this fix,
Phase 1B is defeated by its own `endWalk` code path.

### Key design decisions
- Lock at walk start (subject to PM confirmation).
- `endWalk` override path is preserved as a narrow escape hatch for Phase 3 accepted offers
  and any future manual-correction flow.
- No backfill of historical walks in this phase. Old walks keep `finalPrice = null` and rely
  on the Phase 1A fallback to `dogWalkers.currentPrice`. Backfill is a separate decision.

### Verification
```bash
npx tsc --noEmit
npm run build
```

**Mandatory end-to-end regression scenario:**
1. Ensure `dogWalkers.currentPrice = 90.00` for a test owner-walker-dog trio.
2. Start a walk via `startWalk` normally.
3. Verify: `walks.final_price = 90.00` immediately after the insert.
4. End the walk with no explicit `finalPrice` in the request body.
5. Verify: `walks.final_price` is still `90.00` (not null, not overwritten).
6. Mutate `dog_walkers.current_price` to `120.00` directly in DB.
7. Close the billing period.
8. Verify: `payment_entries.amount = 90.00`. **Not 120.00.**
9. Verify: `payment_periods.total_amount` reflects 90.00 in aggregate.

Failure on any step means Phase 1B is broken.

### Risks
- **`endWalk` callers:** grep all callsites to confirm none intentionally passes
  `input.finalPrice = null` to clear a price. If one does, document the justification and
  decide whether to keep that behavior or migrate it to a dedicated clear-price repo function.
- **Pre-Phase-1B walks:** still have `finalPrice = null` in production. They use the Phase 1A
  fallback. This is acceptable for the grace period during which old open periods close out.
- **Lock-point choice:** if PM overrides the recommendation to a different lock point, the
  write-site moves (e.g., to endWalk or a new booking flow) and the verification scenario
  must be rewritten.

### Open PM approvals needed
1. **Confirm lock point: walk start (recommended) or override?**
2. **Backfill decision:** should existing `final_price = null` walks receive a one-time
   backfill from their `dog_walkers.current_price`? Requires a migration script. Without
   this, the Phase 1A fallback permanently governs those legacy rows.

---

## Phase 2 — Standing Price Agreement

### Goal
Replace mutable `dogWalkers.currentPrice` writes with a versioned, dual-party-approved
agreement record. Neither owner nor walker can unilaterally change the recurring rate.

### Why this phase exists
After Phases 1A and 1B, the billing path respects a per-walk locked price. But
`dogWalkers.currentPrice` still drives that lock, and any unilateral change to
`currentPrice` silently alters every future walk's price. BILLING.MD requires dual approval
for any rate change binding the counterpart.

### Schema impact
**New enum: `priceAgreementStatus`**
Values: `pending | active | superseded | rejected`
Add to `src/db/schema/_enums.ts`.

**New table: `price_agreements`** (add to `src/db/schema/billing.ts`)
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
owner_user_id         text NOT NULL REFERENCES users(id)
walker_profile_id     uuid NOT NULL REFERENCES walker_profiles(id)
dog_id                uuid NOT NULL REFERENCES dogs(id)
proposed_by           text NOT NULL CHECK (proposed_by IN ('owner', 'walker'))
proposed_price        decimal(10, 2) NOT NULL
currency              char(3) NOT NULL DEFAULT 'ILS'
effective_from        text NOT NULL DEFAULT 'next_walk'
status                price_agreement_status NOT NULL DEFAULT 'pending'
proposed_at           timestamp with time zone NOT NULL DEFAULT now()
owner_approved_at     timestamp with time zone
walker_approved_at    timestamp with time zone
superseded_by_id      uuid REFERENCES price_agreements(id)
created_at            timestamp with time zone NOT NULL DEFAULT now()
```

**New audit action values** (`auditActionEnum`):
`PROPOSE_PRICE_AGREEMENT`, `APPROVE_PRICE_AGREEMENT`, `REJECT_PRICE_AGREEMENT`

**`dogWalkers.currentPrice`:** retained as the initial seed and the fallback layer.
Not removed in this phase.

**Migration:** `CREATE TYPE price_agreement_status`, `CREATE TABLE price_agreements`,
`ALTER TYPE audit_action ADD VALUE ...` (three values).

### Repo / files touched

**`src/lib/repositories/priceAgreementsRepo.ts` (new file)**
```
proposePriceAgreement(input, actorUserId)
  - Guard: actorUserId is either owner_user_id or walker's user (resolve via walkerProfileId).
  - Supersede any existing `pending` row for same (owner, walkerProfile, dog) trio.
  - Insert new `pending` row.
  - Set proposer's own approval timestamp immediately.
  - Audit: PROPOSE_PRICE_AGREEMENT.

approvePriceAgreement(agreementId, actorUserId)
  - Guard: actorUserId is the non-proposing party.
  - Guard: agreement.status = 'pending'.
  - Set own approval timestamp.
  - If both timestamps non-null:
      Transition this row to `active`.
      Atomically mark any prior `active` row for same trio as `superseded`.
  - Audit: APPROVE_PRICE_AGREEMENT.

rejectPriceAgreement(agreementId, actorUserId)
  - Guard: actorUserId is part of the (owner, walker) pair.
  - Guard: agreement.status = 'pending'.
  - Set status = 'rejected'.
  - Audit: REJECT_PRICE_AGREEMENT.

getActivePriceAgreement(ownerUserId, walkerProfileId, dogId) → Agreement | null
  - Single `active` row or null. Called by walksRepo.startWalk.
```

**`src/lib/repositories/walksRepo.ts` — `startWalk`**
Resolve `ownerUserId` from `dogOwners` by `dogId` inside the transaction.
Price resolution order at walk start (extends Phase 1B):
1. `getActivePriceAgreement(ownerUserId, walkerProfileId, dogId)` → use `proposed_price`.
2. Fallback → `dw.currentPrice` (Phase 1B behavior).
Write the resolved value to `walks.finalPrice`.

**`src/lib/validation/billing.ts`**
Add: `proposePriceAgreementSchema`, `approvePriceAgreementSchema`, `rejectPriceAgreementSchema`.

**`src/app/owner/dog-profile/[dogId]/actions.ts`**
`setPriceAction` is gated: allowed only when no `active` price agreement exists for the trio
(first-time assignment setup). Subsequent rate changes must route through `proposePriceAgreement`.

**UI surfaces** (exact routes confirmed by PM before execution):
- Owner dog-profile: active rate with "proposed" badge if pending, propose form, incoming
  proposal card with Accept / Reject / Counter.
- Walker-side: symmetric surface (route TBD).

### Key design decisions
- **Scope: per-dog** (owner × walker × dog trio). Rationale: different dog sizes/needs may
  justify different rates with the same walker for the same owner.
- Counter = a new `proposePriceAgreement` call superseding the previous pending row.
  No dedicated `countered` status.
- Proposer's own timestamp set at proposal time; only one approval then pending.
- `effective_from = "next_walk"` only in V1.2. Calendar-date scheduling is deferred.
- Partial unique index enforces at most one `active` row per trio (DB-level race protection).

### Verification
```bash
npx drizzle-kit generate
npx tsc --noEmit
npm run build
```
Manual:
1. Walker proposes 95₪ → DB: `pending`, walker_approved_at set.
2. Owner rejects → `rejected`.
3. Walker re-proposes → owner approves → both timestamps non-null → `active`.
4. Start a new walk → `walks.final_price = 95.00`.
5. Close period → `payment_entries.amount = 95.00`.
6. Direct `setPriceAction` call while active agreement exists → error returned.

### Risks
- `startWalk` adds a `dogOwners` lookup query. Must not conflict with the existing TOCTOU
  comment or the live-walk uniqueness guard (they address different concerns).
- `approvePriceAgreement` must atomically supersede the prior active row inside a transaction.
- Partial unique index at DB level is mandatory to prevent races.

### Open PM approvals needed
1. Walker-side UI route for price agreements.
2. Counter UI: does it show the original proposal values for reference?
3. Should the first-time `setPriceAction` path itself require both parties' approval, or is
   the bypass for brand-new assignments acceptable?

---

## Phase 3 — Single-Walk Price Override

### Goal
Either party can propose a one-time price for a specific upcoming walk. Flow: propose →
optional counter → accept/reject. Accepted offer locks `walks.finalPrice` to the agreed amount.
Standing agreement unchanged.

### Why this phase exists
BILLING.MD case: "walker offers 90₪/60min, owner counters 80₪/50min, walker accepts →
this walk charges 80₪, the next walk uses the standing rate." Requires a scoped offer object
separate from the standing agreement.

### Schema impact
**New enum: `walkPriceOfferStatus`**
Values: `pending | accepted | rejected | expired | superseded`

**New table: `walk_price_offers`**
```sql
id                    uuid PRIMARY KEY DEFAULT gen_random_uuid()
walk_id               uuid REFERENCES walks(id)        -- nullable: offer may precede walk start
owner_user_id         text NOT NULL REFERENCES users(id)
walker_profile_id     uuid NOT NULL REFERENCES walker_profiles(id)
dog_id                uuid NOT NULL REFERENCES dogs(id)
proposed_by           text NOT NULL CHECK (proposed_by IN ('owner', 'walker'))
proposed_price        decimal(10, 2) NOT NULL
proposed_duration_min integer                           -- informational only
status                walk_price_offer_status NOT NULL DEFAULT 'pending'
supersedes_offer_id   uuid REFERENCES walk_price_offers(id)
proposed_at           timestamp with time zone NOT NULL DEFAULT now()
responded_at          timestamp with time zone
created_at            timestamp with time zone NOT NULL DEFAULT now()
```

**New audit action values:** `PROPOSE_WALK_OFFER`, `ACCEPT_WALK_OFFER`, `REJECT_WALK_OFFER`

**No changes to `walks` or `paymentEntries` schemas.**

### Repo / files touched

**`src/lib/repositories/walkPriceOffersRepo.ts` (new file)**
```
proposeWalkOffer(input, actorUserId)
  - Guard: if walk_id provided, walk.status NOT IN (LIVE, COMPLETED, AUTO_CLOSED).
  - If walk_id null (pre-start): supersede existing pending offer for trio with null walk_id.
  - Insert `pending` row.
  - Audit: PROPOSE_WALK_OFFER.

counterWalkOffer(existingOfferId, counterInput, actorUserId)
  - Guard: actorUserId is non-proposing party. existing.status = 'pending'.
  - Mark existing as `superseded`.
  - Insert new `pending` row with supersedes_offer_id link.
  - Audit: PROPOSE_WALK_OFFER.

acceptWalkOffer(offerId, actorUserId)
  - Guard: actorUserId is non-proposing party. offer.status = 'pending'.
  - status = 'accepted', responded_at = now.
  - If walk_id not null: update walks.finalPrice = proposed_price in same tx.
  - If walk_id null: leave for startWalk to link.
  - Expire all other pending offers for the trio.
  - Audit: ACCEPT_WALK_OFFER.

rejectWalkOffer(offerId, actorUserId)
  - Guard: actorUserId is non-proposing party. offer.status = 'pending'.
  - status = 'rejected', responded_at = now.
  - Audit: REJECT_WALK_OFFER.

linkAndApplyAcceptedOffer(ownerUserId, walkerProfileId, dogId, walkId, tx)
  - Called inside startWalk transaction.
  - Find any `accepted` offer for the trio where walk_id is null.
  - If found: set offer.walk_id = walkId, update walks.finalPrice = proposed_price.
  - Expire all `pending` offers for the trio.
```

**`src/lib/repositories/walksRepo.ts` — `startWalk`**
Inside the transaction, after walk insert, before audit log:
```ts
await linkAndApplyAcceptedOffer(ownerUserId, walkerProfileId, input.dogId, insertedId, tx);
```

Price resolution order at walk start (final form):
1. Accepted pre-start walk offer (highest priority).
2. Active standing price agreement.
3. Fallback: `dogWalkers.currentPrice`.

**`src/lib/repositories/walksRepo.ts` — `endWalk`**
No change. Phase 1B fix is sufficient.

**UI entry points** (confirmed by PM before execution):
- "Special price for this walk" proposal button before walk start.
- Notification badge for incoming offers.
- Active walk view: read-only display of agreed/standing price.

### Key design decisions
- **No PLANNED walk state.** Pre-start offers use `walk_id = null` and link on `startWalk`.
  This is the only clean path that avoids inventing a new walk lifecycle stage.
- At most one pending pre-start offer per (owner, walkerProfile, dog) trio. Counter supersedes.
- `proposed_duration_min` is informational; billing uses only `finalPrice`.
- `linkAndApplyAcceptedOffer` is atomic with the walk insert inside one transaction.

### Verification
Manual:
1. Walker proposes 90₪/60min pre-start → `walk_price_offers` row with walk_id=null.
2. Owner counters 80₪/50min → old superseded, new pending.
3. Walker accepts → status=accepted.
4. Walker starts walk → `linkAndApplyAcceptedOffer` sets walk_id, writes finalPrice=80.00.
5. Standing agreement and `dogWalkers.currentPrice` unchanged.
6. Close period → `payment_entries.amount = 80.00`.

### Risks
- Transaction failure in `linkAndApplyAcceptedOffer` rolls back the walk insert. Must be a
  graceful no-op when no accepted offer exists.
- Accepted pre-start offer with walk_id=null persists if the walk never starts.
  TTL/cleanup policy required (see open PM approvals).
- Multi-tenant authorization is mandatory: offers must not leak across (owner, walker) pairs.

### Open PM approvals needed
1. Pre-start offer TTL if the walk never starts.
2. Exact UI entry point in the walker flow.
3. Whether `proposed_duration_min` is shown to the counterpart.

---

## Phase 4 — Adjustment Flow (REOPENED-only, dual approval always)

### Goal
After a walk is completed and its billing period was closed and subsequently reopened,
either party can request a price adjustment with a stated reason. **All** adjustments require
**both** parties to approve. Approved adjustments are recorded as a `paymentEntries` row of
type `ADJUSTMENT` with `walkId = null`, representing a period-level delta.

### Why this phase exists
BILLING.MD case: "a walk ran long, or there was a surcharge. After the period closed, both
agree to a correction. The period total reflects the delta without rewriting the original
locked `walks.finalPrice`."

### Chosen architecture (V1.2 baseline, no options)

- **Timing:** Adjustments are allowed **only when `payment_period.status = 'REOPENED'`.**
  Not on OPEN periods. Not on PAID periods.
- **Approval rule:** Dual approval always. Both `owner_approved_at` and `walker_approved_at`
  must be non-null before the entry is written. Same rule for credits and charges.
  No single-party shortcut for price reductions in V1.2.

### Why this architecture

**Why REOPENED-only:**
- Keeps `closePaymentPeriod` simple for the initial close: no mid-period entries to merge.
- ADJUSTMENT entries are explicit ledger deltas, always post-original-close. Semantically clean.
- WALK entries remain the locked original charge. ADJUSTMENT entries only ever represent
  explicit, post-hoc corrections.
- Fits the `paymentEntries.unique(paymentPeriodId, walkId)` constraint cleanly —
  ADJUSTMENT entries always carry `walkId = null`, so they cannot collide with WALK entries.
- The owner-reopen flow already exists; it now has a productive purpose beyond retries.

**Why dual approval always:**
- Symmetric rule. Easier to reason about, easier to test, easier to audit.
- Eliminates the abuse vector where one party self-approves a credit to pressure the other.
- A lighter-weight credits rule can be added in a later version as a future optimization —
  it is not required to deliver Phase 4 value.

If a PM wants pre-close adjustments or single-party credits, that is a separate future batch.
For V1.2 execution these doors are closed.

### Schema impact

**New enum: `adjustmentRequestStatus`**
Values: `pending | approved | rejected`

**New table: `adjustment_requests`** (add to `src/db/schema/billing.ts`)
```sql
id                      uuid PRIMARY KEY DEFAULT gen_random_uuid()
payment_period_id       uuid NOT NULL REFERENCES payment_periods(id)
walk_id                 uuid NOT NULL                -- no DB FK; integrity enforced in repo
owner_user_id           text NOT NULL REFERENCES users(id)
walker_profile_id       uuid NOT NULL REFERENCES walker_profiles(id)
requested_by            text NOT NULL CHECK (requested_by IN ('owner', 'walker'))
old_price               decimal(10, 2) NOT NULL       -- walks.finalPrice at time of request
new_price               decimal(10, 2) NOT NULL       -- proposed corrected price
reason                  text NOT NULL
status                  adjustment_request_status NOT NULL DEFAULT 'pending'
owner_approved_at       timestamp with time zone
walker_approved_at      timestamp with time zone
created_at              timestamp with time zone NOT NULL DEFAULT now()
```

**No changes to `paymentEntries` schema.** The existing `entryType = "ADJUSTMENT"` value and
the nullable `walkId` column support the output rows directly.

**New audit action values:** `REQUEST_ADJUSTMENT`, `APPROVE_ADJUSTMENT`, `REJECT_ADJUSTMENT`

**Migration:** new enum + new table + `ALTER TYPE audit_action ADD VALUE ...` (three values).

### Repo / files touched

**`src/lib/repositories/adjustmentRequestsRepo.ts` (new file)**
```
requestAdjustment(input, actorUserId)
  - Guard: period.status = 'REOPENED'.
  - Guard: walk.status = 'COMPLETED' and walk.paymentPeriodId = input.paymentPeriodId.
  - Capture walks.finalPrice as old_price.
  - Supersede (set to rejected) any prior `pending` request for the same walk — only one active
    at a time per walk.
  - Insert `pending` adjustment_request row.
  - Requester's own approval timestamp set immediately.
  - Audit: REQUEST_ADJUSTMENT.

approveAdjustment(adjustmentId, actorUserId)
  - Guard: actorUserId is the non-requesting party.
  - Guard: adjustment.status = 'pending'.
  - Guard: period.status = 'REOPENED' at approval time.
  - Set own approval timestamp.
  - Dual-approval check: both timestamps must now be non-null (they are, after this call).
  - Inside a transaction:
      Set status = 'approved'.
      Insert paymentEntries row: entryType=ADJUSTMENT, walkId=null, amount=delta, ownerUserId, paymentPeriodId.
      Update paymentPeriods.totalAmount += delta using CAS (increment lockVersion).
  - Audit: APPROVE_ADJUSTMENT.

rejectAdjustment(adjustmentId, actorUserId)
  - Guard: actorUserId is part of the (owner, walker) pair.
  - Guard: adjustment.status = 'pending'.
  - Set status = 'rejected'.
  - Audit: REJECT_ADJUSTMENT.
```

Delta computation: `delta = new_price - old_price`. Negative deltas are valid (credits).
`paymentEntries.amount` is decimal(10,2) — Postgres allows negative values natively. Confirm
no application-layer validation blocks negative amounts before Phase 4 ships.

**`src/lib/repositories/billingRepo.ts` — `closePaymentPeriod`**

Required change for REOPENED-period close: recalculate `totalAmount` from the full sum of
existing `paymentEntries` plus any newly inserted WALK entries.

After the loop that inserts new WALK entries, add:
```ts
const allEntries = await tx
  .select({ amount: paymentEntries.amount })
  .from(paymentEntries)
  .where(eq(paymentEntries.paymentPeriodId, input.periodId));
const fullTotalAgorot = allEntries.reduce(
  (sum, e) => sum + Math.round(parseFloat(e.amount) * 100),
  0,
);
const totalAmount = (fullTotalAgorot / 100).toFixed(2);
```
Then use this `totalAmount` in the CAS update.

This ensures ADJUSTMENT entries recorded during the REOPENED window are included when the
period closes again.

**UI surfaces** (routes confirmed by PM before execution):
- Owner/walker billing views for REOPENED periods expose: "Request adjustment" on individual walks.
- Incoming adjustment card shows old_price, new_price, reason, approve/reject.

### Key design decisions
- Adjustments are strictly post-reopen, strictly dual-approval.
- `adjustment_requests` is the permanent audit record; approved requests are never deleted.
- `paymentEntries` ADJUSTMENT rows always have `walkId = null` — the link to the adjusted walk
  lives in `adjustment_requests.walk_id`. This intentionally keeps the `paymentEntries`
  unique constraint satisfied without schema changes.
- `walks.finalPrice` is **never modified** by an adjustment. The original lock stands.
  All corrections flow through delta entries.

### Verification
```bash
npx drizzle-kit generate
npx tsc --noEmit
npm run build
```

Manual:
1. Complete a walk at 90₪ (`walks.finalPrice = 90.00`).
2. Close the billing period → `payment_entries` WALK row: amount=90.00; period PAID at 90.00.
3. Reopen the period → status=REOPENED.
4. Request adjustment: old=90.00, new=110.00, reason="walk ran 90 minutes".
5. Attempt to request a second adjustment on an OPEN period → rejected (guard).
6. Attempt single-party approval → still pending (both signatures required).
7. Other party approves → `payment_entries` ADJUSTMENT row: amount=20.00, walkId=null.
   `paymentPeriods.totalAmount` = 110.00.
8. Close period again → full-sum recalculation includes ADJUSTMENT → totalAmount stays 110.00.
9. `walks.finalPrice` = 90.00 unchanged (original snapshot preserved).

### Risks
- `closePaymentPeriod` full-sum change is a billing write-path change. verify-spec required.
- Multiple close/reopen cycles each run the full-sum recalculation — idempotency required.
- `adjustment_requests.walk_id` has no DB FK (same pattern as `paymentEntries.walkId`).
  The repo must verify walk ownership and period linkage before accepting a request.
- Negative-delta ADJUSTMENT entries must not drive `paymentPeriods.totalAmount` below zero
  without an explicit business rule. Guard: reject adjustment if it would produce a negative
  `totalAmount` (treat as business-logic invariant).

### Open PM approvals needed
1. UI routes for adjustment request and approval surfaces.
2. Hebrew copy for request/approval/rejection states.
3. Whether `totalAmount < 0` should be allowed after a credit (recommend no).

---

## Phase 5 — Notifications for Pricing Events

### Goal
FCM push notifications for every pricing action so neither party must poll the app.

### Why this phase exists
Phases 2, 3, and 4 introduce negotiation/correction flows. Without push, discovery is manual.

### Schema impact
**`notificationTypeEnum` additions** — `ALTER TYPE ... ADD VALUE` per value. Non-destructive.

Values:
- `PRICE_AGREEMENT_PROPOSED`, `PRICE_AGREEMENT_APPROVED`, `PRICE_AGREEMENT_REJECTED`
- `WALK_OFFER_PROPOSED`, `WALK_OFFER_ACCEPTED`, `WALK_OFFER_REJECTED`
- `ADJUSTMENT_REQUESTED`, `ADJUSTMENT_APPROVED`

**Migration:** one file with eight idempotent `ALTER TYPE notification_type ADD VALUE IF NOT EXISTS`
statements (Postgres ≥ 14).

### Repo / files touched

**`src/lib/services/notifications/types.ts` (or inline in `fcmService.ts`)**
Confirm `NotificationPayload.link?: string` exists. Add if missing.

**`src/lib/services/notifications/fcmService.ts`**
Add `notifyPricingEvent(type, targetUserId, entityId, entityType, link?)`. Pattern identical to
`notifyBillingClose`: fire-and-forget, lookup active devices, sendToDevice, logDelivery,
top-level catch that never re-throws.

**`src/lib/repositories/priceAgreementsRepo.ts`**, **`src/lib/repositories/walkPriceOffersRepo.ts`**,
**`src/lib/repositories/adjustmentRequestsRepo.ts`**
Add `void notifyPricingEvent(...)` at the end of each mutating function. Target = the
non-acting party's userId (see routing table below).

**Routing:**
| Action | Notified party |
|---|---|
| Any proposal | Other party |
| Approval | Other party |
| Rejection | Proposing/requesting party |
| Counter | Original proposer |

**Hebrew strings (drafts):**
- Proposal: `"קיבלת הצעת מחיר חדשה — פתח לאישור"`
- Approval: `"המחיר אושר — נכנס לתוקף מהטיול הבא"`
- Rejection: `"ההצעה שלך נדחתה"`
- Adjustment request: `"התקבלה בקשת תיקון מחיר — פתח לאישור"`
- Adjustment approved: `"תיקון המחיר אושר"`

### Key design decisions
- Purely additive. Zero business-logic changes to Phases 2–4.
- Dependency: Phase 5 requires Phases 2, 3, and 4 all to be in production (import graph).

### Verification
```bash
npx drizzle-kit generate
npx tsc --noEmit
npm run build
```
Manual: each of the eight events fires the expected push to the correct party.

### Risks
- `NotificationPayload.link` may or may not already be present from the `notifyBillingClose`
  batch. Verify before executing Phase 5.
- `ALTER TYPE ADD VALUE` is not transactional in Postgres < 14. Use `IF NOT EXISTS` for
  idempotency. Run migration with a single DB branch.

### Open PM approvals needed
1. Deep-link targets per notification type.
2. Hebrew copy final approval.

---

## Cross-Phase Dependency Map

```
Phase 1A (read-side fix, no migration)
   └─► Phase 1B (write-side lock at startWalk, no migration)
         └─► Phase 2 (price_agreements migration)
               └─► Phase 3 (walk_price_offers migration)
                     └─► Phase 4 (adjustment_requests migration, close-path change)
                           └─► Phase 5 (notification type values migration)
```

Each arrow is a hard deploy-before-next dependency.

---

## File Change Summary

| File | Phase(s) | Change |
|---|---|---|
| `src/lib/repositories/billingRepo.ts` | 1A, 4 | Read finalPrice first; full-sum recalc at close |
| `src/lib/repositories/walksRepo.ts` | 1B, 2, 3 | startWalk writes finalPrice; endWalk null-overwrite fix; price resolution chain; offer linking |
| `src/db/schema/_enums.ts` | 2, 3, 4, 5 | New enums and enum value additions |
| `src/db/schema/billing.ts` | 2, 3, 4 | New tables |
| `src/lib/repositories/priceAgreementsRepo.ts` | 2 | New file |
| `src/lib/repositories/walkPriceOffersRepo.ts` | 3 | New file |
| `src/lib/repositories/adjustmentRequestsRepo.ts` | 4 | New file |
| `src/lib/validation/billing.ts` | 2, 3, 4 | New Zod schemas |
| `src/lib/services/notifications/fcmService.ts` | 5 | notifyPricingEvent |
| `src/app/owner/dog-profile/[dogId]/actions.ts` | 2 | Gate setPriceAction |
| Owner + walker UI routes (TBD) | 2, 3, 4 | Agreement, offer, adjustment surfaces |

---

## PM Decisions — Blocking vs Non-Blocking

**Blocking (must resolve before the relevant phase executes):**

| # | Decision | Blocks |
|---|---|---|
| 1 | Confirm Phase 1B lock point: walk start (recommended) or override | Phase 1B |
| 2 | Walker-side UI route for price agreements | Phase 2 UI |
| 3 | First-time `setPriceAction` bypass acceptable, or require dual approval even for first rate? | Phase 2 |
| 4 | Pre-start walk-offer TTL policy | Phase 3 |
| 5 | Walk-offer UI entry point in walker flow | Phase 3 UI |
| 6 | UI routes for adjustment request/approval surfaces | Phase 4 UI |
| 7 | Allow `totalAmount < 0` after a credit, or reject such adjustments? | Phase 4 |
| 8 | Deep-link targets per notification type | Phase 5 |
| 9 | Hebrew copy final approval (all phases) | Phases 2–5 |

**Non-blocking (can defer or decide at execution time):**

| # | Decision | Notes |
|---|---|---|
| A | Backfill existing `final_price = null` walks | Phase 1A fallback already handles legacy rows safely. Backfill is a future-optimization, not a correctness gate. |
| B | Counter UI: show original proposal values | UX polish. Default: show them. Can be changed without schema impact. |
| C | Display `proposed_duration_min` to counterpart in walk-offer UI | UX polish. Default: show. |
| D | Future single-party-approval rule for credits | Explicitly out of V1.2 scope. Revisit post-launch. |
| E | Future pre-close adjustment support | Explicitly out of V1.2 scope. Revisit post-launch. |
| F | `dogWalkers.currentPrice` long-term removal | Deferred. Safely kept as fallback. Not blocking any phase. |
