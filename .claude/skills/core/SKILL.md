---
name: core
description: >
  Deep schema, API, architecture, or global state changes.
  Requires verify-spec before AND after. Full lifecycle with elevated scrutiny.
invocation: manual
model: sonnet
disable-model-invocation: true
---

# /core — Architecture & Contract Changes

## When to use
- DB schema changes (migrations, new tables, column modifications)
- Public API signature changes (new endpoints, changed request/response shapes)
- Global state or shared contract changes (env contracts, auth primitives)
- Escalation target when /fix discovers a design-level root cause

Not for:
- Features that don't touch schema/API/state → /new
- Pure bugfixes within existing contracts → /fix
- Security hardening → /sec

---

## Pre-flight
1. Delete First: can this requirement be dropped or simplified by removing existing complexity?
2. Run verify-spec: validate current contracts are documented. If stale → update them first.
3. If auth/payment/secrets in scope → also run verify-security.
4. Verify Architecture Boundary Contract (.claude/rules/01-protocol.md):
   - Does the change respect dependency direction (inward to contracts)?
   - Does it keep module responsibilities single-purpose?
   - Is any shared abstraction being introduced prematurely (rule-of-three)?
5. Context: load only contract files + files this change touches. Fetch others on demand.

---

## Decisions (mandatory output section)
- Change restated in one sentence:
- Requirement(s): [R-id(s) from REQUIREMENTS.md this delivers]
- What contracts will change? (DB schema / API signatures / global state / env vars)
- Backward compatibility: is this additive or breaking?
- Migration plan: is it non-destructive? Can it be rolled back?
- Is there a simpler / more boring path to the same result?

---

## Plan (mandatory output section)
Atomic task list. Each task must:
- Touch ≤ 5 files.
- Have one runnable verify step (command + expected output).
- Be committable alone.
- Max 7 tasks. If more needed → split into Plan A + Plan B.

Contract updates come FIRST in the plan:
  [ ] Task 1: Update APICONTRACTS.md / DBSCHEMA.md — Verify: diff shows new spec
  [ ] Task 2: Implement migration — Verify: npx drizzle-kit generate → success
  [ ] Task 3: Update code to match — Verify: npm test → all pass
  ...

Save this plan as `plans/TASK-XX-plan.md`. Execute from a fresh session that loads
the plan + contract files. Document any deviations from the plan explicitly.

---

## Execute (mandatory output section)
One task at a time:
1. Update contracts/schema docs BEFORE implementing.
2. Implement the task.
3. Run its verify step.
4. Review: `git diff --staged` — verify no unintended changes.
5. Commit: `feat(scope): description` or `refactor(scope): description`
6. Check it off. Then start the next.

After all tasks complete:
→ Run verify-spec AGAIN → confirm code matches updated contracts.
→ If FAIL → fix before considering this done.

---

## Verify (mandatory output section — Verification Artifact)

  Commands run:    [exact commands executed]
  Expected result: [what success looks like]
  Observed result: [what actually happened]
  verify-spec:     [PASS / FAIL — before and after]
  Remaining risk:  [migration rollback plan, edge cases]
  Plan reconciliation: [what completed as planned, what deviated (with reason), what deferred]

---

## Done criteria
- All tasks checked off.
- All atomic commits made with correct format.
- verify-spec PASS (post-execution).
- ARCHITECTURE.md updated if system shape changed.
- APICONTRACTS.md / DBSCHEMA.md updated to match implementation.
- Propose STATE.md mini-handoff update to user.

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
