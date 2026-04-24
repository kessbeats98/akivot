---
name: one-flow
description: End-to-end feature delivery — REQ → PLAN → review → execute → review → ship.
invocation: manual
model: sonnet
---

# /one-flow — Master Lifecycle

Orchestrates the 3-role protocol: CEO CODEX → CLAUDE CODE → CODEX REVIEW.
Each step has hard caps. Flow over perfection.

---

## Step 0: Load Context

1. Read `.avner/primer.md` — identity, last tasks, next steps, blockers, CEO Decisions Log
2. Read `.avner/hindsight.md` — patterns to follow/avoid
3. Read `.avner/1_vision/REQUIREMENTS.md` — R-ids
4. Check primer.md for active task → if active, finish it first (exception: P0 bugs)
5. Git context: `git log --oneline -5 && git diff --stat && git status --short`

---

## Step 1: Requirements (CEO CODEX role)

> **First**: load /ceo-codex skill. Apply all 5 principles when writing REQ.

### 1a. Feature Input
Ask the user:
- What are you building? (one sentence)
- Which R-ids? (from REQUIREMENTS.md)

If unsure, run mini-brief:
1. **Demand Reality**: strongest evidence someone wants this?
2. **Narrowest Wedge**: smallest version someone would use this week?
3. **Future-Fit**: in 3 years, more essential or less?

### 1b. Scope Check
- Maps to at least one R-id? If not → HALT (scope creep)
- Conflicts with non-goals in primer.md? → HALT
- Solvable by removing something? → suggest /prune first

### 1c. Write REQ Artifact

```
## REQ-[ID]
What:       [one sentence]
Why:        [R-ids + business justification]
Scope:      [in-scope, explicit]
Not-scope:  [out-of-scope, explicit]
Risk:       [HIGH/MEDIUM/LOW + why]
Accept:     [numbered criteria, max 5]
Constraint: [budget, file limits, time]
```

No implementation hints. Pure product.

---

## Step 2: Plan (CLAUDE CODE role)

### 2a. Pre-Planning
- Read hindsight.md for relevant patterns
- Search obsidian/ for domain context: `Glob .avner/obsidian/**/*.md`
- Read ARCHITECTURE.md, TECHSTACK.md

### 2b. Write PLAN Artifact

```
## PLAN for REQ-[ID]
### Approach
[1-3 sentences]
### Tasks (max 7)
1. [Title] — Files: [paths] — Verify: [cmd] — Risk: [L/M/H]
### Risks & Mitigations
### Not Doing
```

No code. No pseudocode. Structure and intent only.

---

## Step 3: Plan Review (CEO CODEX role)

> **First**: load /ceo-codex skill. Run the Review Checklist against the PLAN.

### Planning Loop (max 3 rounds)

**Round 1**: Review PLAN v1 against REQ
- Does PLAN address every Scope item?
- Does PLAN respect every Not-scope item?
- Are REQ risks acknowledged and mitigated?
- Are acceptance criteria testable?
→ GO or REVISE (what's wrong, not how to fix)

**Round 2** (if REVISE): Review PLAN v2
→ GO or REVISE (one more chance)

**Round 3** (if REVISE): MUST choose
→ GO (good enough) or CANCEL. No round 4. Ever.

### GO Signal

```
Verdict: GO
REQ: REQ-[ID]
Plan-version: [1|2|3]
Conditions: [any, or "none"]
```

CLAUDE CODE cannot touch code without this signal.

### 3d. Paperclip Approval Gate (HIGH risk only)

If REQ risk is HIGH and verdict is GO:
1. CEO CODEX calls `paperclip_request_approval` with task ID, risk, summary, council status
2. Task is **gated** — Claude Code waits for approval confirmation
3. CEO polls `paperclip_check_approval` until approved or rejected
4. **Fallback**: if Paperclip unreachable, write to `.avner/4_operations/APPROVAL_PENDING.md` — human resolves manually

---

## Step 4: UI Contract (conditional)

**Skip if no UI files in the plan.**

1. Read `.avner/3_contracts/UI_SPEC.md`
2. If screens missing → run /ui workflow
3. If screens exist → confirm spec is current
4. Get user approval before proceeding

---

## Step 5: Execute (CLAUDE CODE role)

### 5.pre-a. Paperclip Budget Check (soft flag)
CEO CODEX calls `paperclip_check_budget`. If remaining budget < per_task_cap for this risk level, flag in DISPATCH.md Constraint field. Does not block — proceed with warning.
Skipped silently if Paperclip unreachable or dry_run.

### 5.pre-b. Constraint Alignment Check
Read `current_constraint` from primer.md. If the current task does NOT clearly address it:
→ Flag to CEO CODEX before investing significant effort.
→ CEO responds in 1 turn: "confirmed" or "redirect". No response after 1 turn → proceed (assume confirmed).
This is a soft flag, not a hard halt.

### 5a. Vision Evidence (for /new, /core)
- Invoke verify-vision via Agent() if HIGH risk or user requests
- For /fix: write `FIX-BYPASS <timestamp>` to last_vision_check.txt

### 5b. Create Branch
```bash
git checkout -b [branch-from-plan]
```

### 5c. Implement Each Task
For each task from the PLAN:
1. Read existing code first
2. Implement the change
3. Run verify command
4. Run lint/typecheck
5. Commit (one change = one commit):
   ```
   <type>(scope): description

   Co-Authored-By: Claude <noreply@anthropic.com>
   ```
6. On failure → 3-attempt debug loop, then document and move on

### 5d. Write EVIDENCE.md
After all tasks: `.avner/4_operations/EVIDENCE.md`
- Status: COMPLETE / PARTIAL / FAILED
- Subtasks, commands, observed results, files changed, acceptance criteria, remaining risk

---

## Step 6: Review (CODEX REVIEW role)

### Execution Loop (max 2 fix rounds)

**Review 1**: Run diff review per codex-review protocol
- Critical pass: injection, auth bypass, race conditions, secrets, data loss
- Spec pass (MEDIUM+): acceptance criteria, side effects
- Quality pass (HIGH): tests, error handling, perf, a11y

Write REVIEW.md → GO / NEEDS-REVISION / HARD-NO

**Fix 1** (if NEEDS-REVISION): CLAUDE CODE fixes file:line findings, resubmits
**Review 2**: Re-review → GO / NEEDS-REVISION / HARD-NO

**Fix 2** (if NEEDS-REVISION): CLAUDE CODE tries again, resubmits
**Review 3**: Final review
- If still issues → Surgical Fix Protocol (1 file, ≤20 lines) OR HARD-NO

### Surgical Fix
- Commit: `fix(review): [issue] — CODEX-REVIEW`
- REVIEW.md: `Status: GOOD-ENOUGH. Surgical fix applied. Moving on.`
- If fix exceeds constraints → HARD-NO → escalate

---

## Step 6b: CEO Post-Task Verdict (mandatory gate)

Fires after Step 6 Review, on ALL risk tiers. Fires even on HARD-NO.

1. **Invoke** CEO CODEX subagent in Mode C
   - Pass: TASK id, REQ, `.avner/4_operations/EVIDENCE.md`, `.avner/4_operations/REVIEW.md`, `.avner/primer.md`
2. **Render** verdict to user in framed block (see `agents/ceo-codex.md` § Mode C format)
3. **STOP** — wait for human response:
   - **proceed** → flow continues to Step 7 (Council) or Step 8 (Merge)
   - **revise** → CEO does partial primer update (current_constraint + blockers only), loop back to Step 5c for targeted fixes
   - **abort** → CEO updates primer with cancellation context, skip to Step 8b cleanup
4. On revise: CLAUDE CODE applies fixes, re-runs Step 6 review, then Step 6b fires again

---

## Step 7: Council Gate (optional, HIGH risk)

If HIGH risk or user requests:
1. Invoke required Council agents via Agent()
2. Parse verdicts per `docs/verdict-protocol.md`
3. Write COUNCIL_LOG.md entries
4. Any BLOCK → stop, present to human
5. All PASS → proceed to merge

---

## Step 8: Merge & Close

### 8a. Merge
- LOW/MEDIUM + review GO → merge
- HIGH + review GO + Council PASS → present to human for approval → merge

### 8b. Post-Task (CEO CODEX role)
1. Update primer.md: last 3 tasks, next 3 steps, blockers
2. Update `current_constraint` in primer.md — has the bottleneck shifted?
3. Update hindsight.md: synthesize EVIDENCE + REVIEW into pattern entries
4. **Paperclip cost event**: call `paperclip_cost_event` with model + token usage (if available). Silently skipped if unavailable or dry_run.
5. Clear artifacts: DISPATCH.md → `## No active assignment`, delete gate_pass.txt, last_vision_check.txt

> **Ownership**: CEO CODEX is the sole writer of primer.md, hindsight.md, and backlog.md.
> **Write guard**: Claude Executor MUST NOT write to `.avner/primer.md`, `.avner/backlog.md`, `.avner/hindsight.md`, `agents/ceo-codex.md`, or `skills/ceo-codex/SKILL.md`. These are CEO CODEX-owned files.

### 8c. Handoff
```
1. What changed: [files, features, commits]
2. What did NOT change: [deferred items]
3. Validation results: [commands + outcomes]
4. Remaining risks: [known gaps]
5. Next action: [exact first step for next session]
```

---

## Anti-Loop Summary

| Phase | Max Rounds | Escape |
|-------|-----------|--------|
| Planning (CEO ↔ Claude) | 3 plan versions | GO or CANCEL |
| Execution fixes (Claude ↔ Review) | 2 fix attempts | Surgical fix or HARD-NO |
| Surgical fix | 1 per task | HARD-NO if fix fails |
| CEO Post-Task Verdict (6b) | 1 per review cycle | Human decides: proceed/revise/abort |
| Debug per subtask | 3 attempts | Document failure, move on |

## Escalation

- HARD-NO → task BLOCKED → human decides (retry, split, abandon)
- CANCEL → task removed → CEO may split and re-issue
- GOOD-ENOUGH → ship, log imperfections in hindsight
