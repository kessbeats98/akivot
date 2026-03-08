---
name: fix
description: >
  Scientific bugfix with evidence-based iterations (3-Attempt Debug).
  Minimal change, maximum signal. Mandatory Verification Artifact.
invocation: manual
model: sonnet
disable-model-invocation: true
---

# /fix — Scientific Debugging (3-Attempt Debug)

## When to use
- A specific bug exists: failing test, error log, regression, or broken behavior.
- Scope is limited to existing product surface area.

Not for:
- New features → /new
- Schema / API / global-state redesign → /core
- Security hardening as primary goal → /sec

---

## Pre-flight (must do before touching code)
1. Restate the bug in one sentence.
2. Define minimal reproduction: file + function + input + exact command.
3. Run meta-priority gates (CLAUDE.md).
   - Sensitive area touched? → run verify-security before finalizing.
   - DB / API / global state touched? → HALT → escalate to /core.
4. Delete First: is this bug a symptom of code/complexity that shouldn't exist?
5. Context: load only the reproduction path + relevant test file. Do not preload the full codebase.

---

## Decisions (mandatory output section)
- Bug restated:
- Minimal reproduction (command or steps):
- Expected behavior:
- Observed behavior:
- Hypotheses (1–2, boring-first):
- Blast radius (what else could break?):

---

## Plan (mandatory output section)
Prefer 1 task. If multiple required, max 3 tasks, each:
- Touches ≤ 3 files (escape hatch requires justification in Decisions).
- Has a runnable verify step (command + expected output).
- Is independently revertable.

  [ ] Task 1: <title> — Verify: <command → expected output>
  [ ] Task 2 (optional): ...
  [ ] Task 3 (optional): ...

---

## Execute (mandatory output section)

### Iteration loop (max 3)

Iteration 1:
1. Localize the fault line (smallest responsible function/module).
2. Apply the smallest possible change.
3. Run: reproduce command → then targeted regression tests.

If FAIL:
- Record: what failed / what changed / what new evidence emerged.
- Update hypothesis. Do not expand scope.

Iteration 2 (if needed):
- Apply next smallest change implied by iteration 1 evidence.
- Re-run the same verification.

If FAIL:
- Record: what failed / what changed / what new evidence emerged.
- Update hypothesis.

Iteration 3 (if needed):
- Final attempt, still minimal.
- If still failing → HALT → recommend /core redesign.
- Document: evidence summary + why /core is required.

### Scope discipline (hard)
- Do not rewrite working code outside the fault path.
- Do not refactor for style unless required to fix the bug.
- If the real issue is a missing feature → HALT → /new.

### Debugging Carry-Forward
Before escalating to /core or resetting the session, record this block in STATE.md:
- **Tried already:**           [what was attempted in each iteration]
- **Evidence collected:**      [logs, stack traces, test results]
- **Current hypothesis:**      [best-guess root cause based on evidence]
- **Why escalating/resetting:** [why the current approach is insufficient]

---

## Commit policy
Default: ONE fix = ONE commit, after verification passes.
Review `git diff --staged` before committing.
Message: `fix(scope): <root cause or user-visible symptom>`

---

## Verify (mandatory — Verification Artifact)

  Commands run:    [exact commands executed]
  Expected result: [what passing looks like]
  Observed result: [what actually happened]
  Remaining risk:  [edge cases still open + why accepted]

---

## Done criteria
- Minimal reproduction now passes.
- Relevant tests pass (targeted + regression).
- Lint/typecheck status: PASS / FAIL / N/A.
- Commit created per policy.
- Propose STATE.md mini-handoff update to user.
- If sensitive area touched: verify-security run, verdict recorded.

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
