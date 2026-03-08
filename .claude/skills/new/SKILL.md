---
name: new
description: >
  Create a new feature, component, or file.
  Full lifecycle: Decisions / Plan / Execute / Verify.
invocation: manual
model: sonnet
disable-model-invocation: true
---

# /new — New Feature (Full Lifecycle)

## When to use
Adding a new feature, screen, endpoint, component, or file.

Not for:
- Bugfixes → /fix
- Schema / API redesign → /core
- Security hardening → /sec

---

## Pre-flight
1. Delete First: can this outcome be met by removing an existing obstacle instead of adding code?
2. Check REQUIREMENTS.md: does this map to a V1 R-id? If not → HALT (scope creep or missing requirement).
3. Run meta-priority gates (CLAUDE.md). First match wins.
4. Context: load only the files relevant to this feature. If the session is confused, start fresh.

---

## Decisions (mandatory output section)
- Request restated in one sentence:
- Requirement(s): [R-id(s) from REQUIREMENTS.md this delivers]
- What does it touch? (files, APIs, DB, shared state)
- Is there a simpler / more boring path to the same result?
- Any contracts that must be updated before starting?
- UX gray areas resolved? (loading states, errors, edge cases) If unclear → HALT and ask.

---

## Plan (mandatory output section)
Atomic task list. Each task must:
- Touch ≤ 5 files.
- Have one runnable verify step (command + expected output).
- Be committable alone.
- Max 7 tasks. If more needed → split into Plan A + Plan B.

Format:
  [ ] Task 1: <title> — Verify: <command → expected output>
  [ ] Task 2: ...

For non-trivial features: save this plan as `plans/TASK-XX-plan.md` in the project,
then execute from a fresh session that loads the plan + referenced files.

---

## Execute (mandatory output section)
One task at a time:
1. Implement the task.
2. Run its verify step.
3. Review: `git diff --staged` — verify no unintended changes.
4. Commit: `feat(scope): description`
5. Check it off. Then start the next.

If DB schema / public API / global state touched mid-execution:
→ HALT → run verify-spec before continuing.

---

## Verify (mandatory output section — Verification Artifact)
SHOULD include when non-trivial:

  Commands run:    [exact commands executed]
  Expected result: [what success looks like]
  Observed result: [what actually happened]
  Remaining risk:  [open gaps, edge cases not yet tested]
  Plan reconciliation: [if plan file exists — what completed as planned, what changed, what deferred]

---

## Done criteria
- All tasks checked off.
- All atomic commits made with correct format.
- Propose STATE.md mini-handoff update to user.
- If new API endpoint or DB schema → APICONTRACTS.md or DBSCHEMA.md updated (with user approval).

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
