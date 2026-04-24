---
name: akivot-code-executor
version: 1.0.0
description: >
  Standard code executor for the Akivot platform. Implements tasks from a user prompt,
  plan file, or DISPATCH.md. Runs pre-coding gates, verifies with tsc + build, cleans up
  temp artifacts, and outputs a structured final report. Use whenever a task needs to be
  executed end-to-end in the Akivot repo - including backend, UI, billing, or multi-step
  approved plans. Do not use for planning-only or research-only sessions.
---

# akivot-code-executor

Standard execution protocol for the Akivot (`f:/ak/avner-lite`) repository.
Covers task loading, worktree safety, implementation, verification, cleanup, and structured reporting.

---

## Step 0: Load Context

1. Run `git status --short --branch` first - orient before touching anything.
2. Load the task source: user prompt, referenced plan file, or DISPATCH.md if provided.
   Do not assume DISPATCH.md exists.
3. Load task-relevant project docs as needed:
   - `.avner/2_architecture/ARCHITECTURE.md` - system shape
   - `.avner/2_architecture/TECHSTACK.md` - build/test commands
   - `.avner/3_contracts/DB_SCHEMA.md` - if touching database
   - `.avner/3_contracts/API_CONTRACTS.md` - if touching API endpoints
   - `.avner/3_contracts/UI_SPEC.md` - if touching UI

---

## Canonical Billing Context

When billing context is needed, use only:
- `BILLING.MD`
- `plans/BATCH-BILLING-PRACTICAL-CONTRACT-LAYER.md`

Do not use these deprecated billing plans as authority:
- `plans/BATCH-BILLING-PRACTICAL-CONTRACT-V2.md`
- `plans/BATCH-BILLING-PRICING-ARCHITECTURE.md`

Current billing baseline:
- Phases 1A, 1B, 2, 3, and 4 are complete and verified.
- Drizzle migration ledger drift has been repaired.
- Walker Billing Read-Model Improvements are complete and verified.
- Do not reopen completed billing phases unless code evidence contradicts this baseline.

---

## Step 1: Worktree Check

If the worktree is dirty:
- Identify task-relevant vs unrelated changes.
- Do not touch, stage, revert, stash, delete, or commit unrelated files.
- If task files are already modified by someone else -> pause and ask how to proceed.

Branch: use the current branch unless the user explicitly requests a new one.
If branch creation is requested, do it non-destructively and report the branch name.

---

## Step 2: Short Implementation Plan

Before writing any code:
1. Read the task-relevant source files.
2. Write a short plan (3-7 lines: what to change, which files, in what order).
3. **If the plan requires schema changes, billing-core changes, auth changes, or DB mutation
   not explicitly in the approved scope -> call that out and stop before coding.**

---

## Step 3: Execute

If step 2 completed without a stop:
- Implement end-to-end within the declared scope.
- Keep scope tight. Do not do opportunistic cleanup.
- If an unrelated bug surfaces, report it separately - do not fix it inside this task.

---

## Step 4: Verify

Always run:
```bash
npx tsc --noEmit
npm run build          # skip only if task is explicitly docs-only or plan-only
```

Additional checks by task type:
- **UI work**: run a visual smoke test (start dev server, confirm the changed surface renders)
- **DB/repo work**: run a real DB or manual regression when feasible
- **If a verification step is blocked**: report it; do not mark it as passed

---

## Step 5: Cleanup

Before writing the final report:
- Delete all temporary scripts, screenshots, logs, and seeded DB rows
- Report cleanup status in the final report

---

## Step 6: Standard Final Report

Every execution ends with this exact block:

```
Status:           PASS | FAIL | BLOCKED | PARTIAL
Task:             [what was executed]
Aim achieved:     [yes/no - one sentence]
Files changed:    [paths]
Behavior changed: [what changed functionally]
Verification:     [commands run + observed outcomes]
Manual/visual/DB checks: [results or "n/a"]
Cleanup:          [temp artifacts deleted / none]
Remaining risks:  [known gaps or "none"]
Git status:       [output of git status --short for task-relevant files]
Ready for Codex review: yes / no
```

---

## High-Risk Gate

Applies when the task risk is **HIGH** (billing-core, auth, schema, production DB, deployment).

Treat a task as HIGH risk if it touches any trigger in the High-Risk Gate table, even if the user did not explicitly label it HIGH.

### Pre-coding Stop

Before writing any code, check whether the plan requires any of the following
**without explicit approval already given in this session**:

| Trigger | Examples |
|---------|---------|
| Schema migration or DDL | new column, new table, enum change |
| Billing-core logic | payment periods, adjustment_requests, wallet entries |
| Auth flow change | sessions, tokens, RBAC, permissions |
| Production DB write | migration applied to prod, seed data on prod |
| Deployment change | Vercel config, env vars on prod, CI/CD pipeline |

If any item is present and unapproved -> output and stop:

```
[HIGH-RISK GATE]: [item] requires explicit approval before coding.
Provide approval or reduce scope.
```

If all clear (or approval confirmed in this session) -> proceed.

### Per-subtask Checkpoints (HIGH risk only)

After each subtask: run the verify command and inspect `git diff --stat` for unintended side effects.
Do not commit unless the user explicitly asks.
If a commit is requested, stage only task-relevant files.

### HIGH-Risk Addendum (append to Standard Final Report)

```
## High-Risk Addendum
Tasks planned:   [N]
Tasks completed: [N] / [N]
Tasks deferred:  [list or "none"]
Acceptance:      [criteria -> PASS/FAIL per item]
Codex note:      [ambiguity or risk the reviewer should know]
```

---

## Drift Detection

During execution, pause and run a drift check if:
- Files outside declared scope are being touched.
- "While I'm here" cleanup appears.
- The task turns into architecture redesign.
- Success criteria become unclear.
- The fix requires unapproved schema, billing-core, auth, DB, deployment, or production-data changes.
- The approach reverses more than once.

When drift is detected, report:
- Original aim
- Current work
- Gap
- Recommendation: continue / refocus / ask approval / split task / stop

---

## Hard Rules

- Never touch, stage, revert, stash, or commit unrelated files.
- Never run destructive git commands.
- Do not commit unless explicitly asked.
- If a verification step is blocked, report it - do not call it passed.
- Scope expands during execution -> pause and confirm before proceeding.
- Report honestly. FAIL and BLOCKED are valid and useful outcomes.

---

## Test Prompts

Three realistic prompts for evaluating this skill.

### Prompt A - Backend: Billing Context (HIGH risk)
```
Add a void_payment action to the billing module:
- Mark an OPEN payment period as VOIDED (new status)
- Create a reversal entry in wallet_entries
- Require ADMIN role
Risk: HIGH (billing-core + schema change).
Use akivot-code-executor.
```
Expected behavior: High-Risk Gate fires (billing-core + schema) -> stops and waits for explicit approval before writing any code.

### Prompt B - UI: Visual Smoke (MEDIUM risk)
```
Add a "Payment History" tab to WalkerBillingSurface.
List the last 10 payment periods with status badges.
No new API endpoints. If the required repo method does not exist in billingRepo,
pause and report the missing function before writing any UI code.
Use akivot-code-executor.
```
Expected behavior: Executor checks billingRepo for the method before writing any UI code. If absent -> pauses and reports the gap. Does not invent the missing API. After implementation -> visual smoke test required (dev server, tab renders, badge colors).

### Prompt C - Long Plan: Dirty Worktree (HIGH risk)
```
I have an approved PLAN for REQ-0042 (Phase 5 walker hierarchy).
The plan has 6 tasks. My worktree has uncommitted changes in
src/app/walker/billing/. Proceed with execution.
Use akivot-code-executor.
```
Expected behavior: Step 1 worktree check fires - executor identifies task-relevant vs unrelated changes and does not auto-stash, revert, or branch. If billing/ files overlap with task files, pauses and asks how to proceed. Because this is marked HIGH risk, the High-Risk Gate runs before coding begins. After approval, HIGH-risk internal checkpoints run after each subtask.
