Do not implement code yet. Start by writing the first execution plan only.

Use this file as the canonical source of truth:
- `plans/BATCH-BILLING-PRACTICAL-CONTRACT-LAYER.md`

Your task now:
1. Read the canonical billing plan.
2. Write the execution plan for Phase 1A only.
3. Save it as a new file under `plans/`.
4. Do not implement product code yet.

Create this file:
- `plans/BATCH-BILLING-PHASE-1A-EXECUTION.md`

Scope for this execution plan:
- Phase 1A only = Billing Truth Bugfix (read-side only)
- Only `closePaymentPeriod()` in `src/lib/repositories/billingRepo.ts`
- Only this behavior change:
  - read `walks.finalPrice` first
  - fallback to `dogWalkers.currentPrice` only when `finalPrice` is null

Explicitly out of scope:
- no `startWalk` changes
- no `endWalk` changes
- no schema migration
- no new tables
- no UI work
- no notifications
- no Phase 1B work
- no standing agreement work
- no walk-offer work
- no adjustment flow work

The execution plan must be concrete and executor-ready.

Use this structure:

1. Context
2. Goal
3. Exact scope
4. Files to inspect
5. Files allowed to change
6. Exact code change required
7. Verification steps
8. Regression scenario
9. Risks / guardrails
10. Out of scope
11. Expected executor report format

Important requirements:
- The plan must state clearly that Phase 1A is a narrow read-side fix only.
- The plan must name the exact repo file:
  - `src/lib/repositories/billingRepo.ts`
- The plan must call out the exact intended code shape:
  - extend the untagged-walks select to include `walks.finalPrice`
  - resolve amount as `walk.finalPrice ?? dw?.currentPrice ?? "0.00"`
- The plan must include the mandatory regression scenario:
  1. complete a walk
  2. manually set `walks.final_price = X`
  3. change `dog_walkers.current_price = Y`
  4. close the billing period
  5. verify billing charges X, not Y
- The plan must explicitly forbid touching `walksRepo.ts` in this batch.

Constraints:
- plan only
- do not modify the canonical plan
- do not implement code
- do not start execution
- do not widen scope

When done, report back with:
1. the new execution-plan file path
2. the exact scope you locked
3. the guardrails you added to prevent scope creep
