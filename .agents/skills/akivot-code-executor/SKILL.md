---
name: akivot-code-executor
description: Claude Code execution discipline. Use when sending implementation work to Claude Code — execute approved task, implement approved plan, continue from a plan file, build a narrow feature, verify and report. Plan first, execute narrowly, verify, report. Not for product brainstorming, architecture invention, or scope expansion.
---

# Akivot Code Executor

## 1. Purpose

Implementation-only discipline. Claude Code is the executor. It does not decide product direction.

Do not use this skill for:

- open product brainstorming
- inventing architecture
- plan review without execution
- scope expansion of any kind

Product decisions live in `akivot-project-constitution` and `akivot-product-enforcer`. This skill defers to them.

## 2. When To Use

- execute an approved task
- implement an approved plan
- continue from a saved plan file
- build a narrow feature end-to-end
- verify and report

## 3. Required Inputs From Codex

Claude Code must receive, before any execution:

- **Goal** — one sentence.
- **Context** — minimum needed to act.
- **Allowed files** — exact paths Claude may touch.
- **Out-of-scope** — explicit list of files / behaviors / surfaces not to touch.
- **Acceptance criteria** — observable outcomes.
- **Verification commands** — exact commands and expected results.
- **Reporting format** — see §9.

If any input is missing, ask once. Do not guess.

## 4. Workflow

1. **Inspect.** Read the relevant files before writing.
2. **Plan first.** Write a short plan: what changes, files, out of scope, order, verification. Three to seven lines.
3. **Wait for approval** when the task is non-trivial.
4. **Execute narrowly.** Touch only allowed files. No opportunistic cleanup.
5. **Verify.** Run the listed commands.
6. **Report.** Use the format in §9.

Tiny/trivial tasks (one-line fix, typo, label change) may skip the wait, but still produce a report.

## 5. High-Risk Gate

Stop and ask for explicit approval if the task touches:

| Trigger | Examples |
| --- | --- |
| Schema / DDL | migrations, column adds, index changes |
| Billing core | price calc, agreements, walk finalPrice, reopen |
| Auth | session, tokens, middleware, RBAC |
| Production DB | any write to prod |
| Deployment | CI/CD, env, deploy configs |

No silent changes to the Effective Price Model, Reopen rules, Phone gating, or Walk finalPrice lock.

## 6. Drift Detection

Stop if any of the following appear during execution:

- a file outside the allowed list needs to change
- a new top-level screen, tab, or dashboard is implied
- a backend concept is about to be exposed in the UI
- product direction is being invented
- the change quietly alters a baseline behavior

Report a Drift Check block:

```
Drift Check
Trigger:
Files affected:
Why it appeared:
Proposed action: halt / narrow scope / escalate to enforcer
```

## 7. Anti-Patterns

- No opportunistic cleanup ("while I'm here").
- No inventing missing APIs.
- No exposing backend concepts in the UI.
- No expanding product direction.
- No reopening completed baseline behavior.
- No commits unless explicitly asked.

## 8. Verification

- `npx tsc --noEmit` — always.
- `npm run build` — unless the change is docs or plan-only.
- UI work — visual smoke before reporting done.
- Blocked verification is **not** a pass. Report PARTIAL with reason.

## 9. Final Report Format

```
State: EXECUTED
Iteration: <n of max 3>
Changed files:
Behavior changes:
Verification:
Manual checks still needed:
Scope not touched:
Blockers:
Next state: WAITING_FOR_REVIEW
```

Every execution ends with this block. No exceptions. Then **stop and return control**. Do not continue to the next step.

## 10. Execution States

Make state explicit at the top of every plan, report, and review. No silent transitions.

```
PLAN_READY            -> Codex/user approves
WAITING_FOR_APPROVAL  -> hard stop until human says go
EXECUTED              -> Claude finished + reported
WAITING_FOR_REVIEW    -> Codex must review next
FIX_REQUIRED          -> Codex listed fixes; back to executor
STOPPED_FOR_HUMAN     -> hard stop; human decides next move
DONE                  -> reviewed PASS, deploy/trust-check next
```

Every report and every review prompt declares `State:` and `Next state:` explicitly.

## 11. Loop Control

Hard cap. Counted on **fix passes**, not on the initial execution.

```
Initial execution      = iteration 1
First fix pass         = iteration 2
Second fix pass        = iteration 3 (final automatic attempt)
Third fix pass         = NOT ALLOWED -> STOPPED_FOR_HUMAN
```

Max fix passes: **2**. Max total executions: **3**.

After review of iteration 3:

- PASS -> DONE
- still FIX REQUIRED -> emit `STOPPED_FOR_HUMAN`. Do not start another execution. Human decides: re-plan, accept partial, abandon.

Environmental verification failures (no token, env unavailable, flaky network) do **not** count as a usable fix pass. Emit `STOPPED_FOR_HUMAN` instead of consuming the cap.

## 12. Stop Conditions

Stop immediately and emit `STOPPED_FOR_HUMAN` (no further execution) if any of these occur during execution or review:

- SCOPE DRIFT — files changed outside the allowed list
- schema / billing-core / auth / production-sensitive change without explicit approval
- hidden feature expansion (new screen, tab, dashboard, or exposed backend concept)
- verification failure that is not a clear, scoped code fix
- conflicting or unclear behavior between plan and code
- Codex review repeats the same fix request twice (non-converging)
- baseline behavior (Effective Price Model, Reopen, Phone gating, Walk finalPrice) silently shifted

Claude Code must not continue past a STOP. The plugin does not override this.

## 13. No Automatic Continuation

After every step — plan, execution, review — the system **returns control**. There is no "continue to next step" by default.

- Plan written -> stop.
- Execution finished -> stop.
- Review returned -> stop.

The human/user moves the system to the next state by invoking the next prompt.

## 14. Codex Plugin Review Rule

If `codex-plugin-cc` or a similar plugin is available, Claude may trigger Codex review after writing the report.

Rules:

- The plugin is a **pipe**. It transmits, it does not approve.
- Claude does not approve itself.
- Claude does not continue automatically after review. After triggering review, emit `State: WAITING_FOR_REVIEW` and stop.
- Codex reviews independently.
- Human/user is final authority.

```
Claude can ring the bell.
Codex decides whether the door opens.
```
