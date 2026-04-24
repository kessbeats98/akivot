---
name: executor-run
description: Task execution protocol for Claude Executor. Read dispatch, implement, write evidence, commit.
invocation: manual
model: sonnet
---

# /execute — Task Implementation Protocol

Used by Claude Executor inside a worktree. Reads DISPATCH.md and implements the assigned task.

---

## Step 0: Load Context

1. Parse DISPATCH.md from the prompt (Manager passes it as Agent prompt).
   Extract fields by line prefix/header:

   | Field | Pattern | Required |
   |-------|---------|----------|
   | Task ID | `^Task:\s*(\S+)\s*—` | YES |
   | Risk | `^Risk:\s*(HIGH\|MEDIUM\|LOW)` | YES |
   | Mode | `^Mode:\s*(/\w+)` | YES |
   | Branch | `^Branch:\s*(.+)` | YES |
   | Budget-cap | `^Budget-cap:\s*(.+)` | NO |
   | Vision-evidence | `^Vision-evidence:\s*(.+)` | YES |
   | Subtasks | Numbered list under `### Subtasks` | YES |
   | Acceptance criteria | Checkbox list under `### Acceptance Criteria` | YES |
   | Spec | Text block under `### Spec` | YES |
   | Required Council | List under `### Required Council` | NO |

   **If any required field is missing:** return immediately:
   ```
   Status: FAILED
   Task: UNKNOWN
   Commits: none
   Files changed: 0
   Tests: SKIPPED
   Evidence: not written
   Summary: DISPATCH.md missing required field: [field name]
   ```

2. Read relevant .avner/ docs:
   - `.avner/2_architecture/TECHSTACK.md` — build/test commands, stack info
   - `.avner/2_architecture/ARCHITECTURE.md` — system design, boundaries
   - `.avner/3_contracts/API_CONTRACTS.md` — if touching API endpoints
   - `.avner/3_contracts/DB_SCHEMA.md` — if touching database
   - `.avner/3_contracts/UI_SPEC.md` — if touching UI (and mode is /ui or /ui-review)

3. Verify vision evidence token is present (APPROVE or FIX-BYPASS). If missing and not caught by field check above, treat as missing required field.

---

## Step 1: Create Branch

```bash
git checkout -b [branch-name-from-dispatch]
```

Branch naming from dispatch: `feat/task-XX-slug`, `fix/task-XX-slug`, `refactor/task-XX-slug`

---

## Step 2: Implement Subtasks

For each subtask in the dispatch:

### 2a. Code the Change
- Read existing code before modifying
- Respect file-touch limits: /new,/core ≤ 5 files; /fix ≤ 3 files
- Follow existing patterns in the codebase
- If mode is /ui or /ui-review: apply GSD 6-pillar patterns
- If mode is anything else: do NOT apply GSD velocity shortcuts

### 2b. Verify
Run the verify command specified in the subtask. If no command specified, use the build/test commands from TECHSTACK.md:
```bash
# Typical verify sequence
npm run lint 2>/dev/null || true
tsc --noEmit 2>/dev/null || true
npm test 2>/dev/null || true
```

### 2c. Commit
If verify passes:
```bash
git add [specific files]
git commit -m "<type>(scope): description

Co-Authored-By: Claude <noreply@anthropic.com>"
```

Commit type by mode:
- /new → `feat`
- /fix → `fix`
- /core → `refactor`
- /sec → `sec`
- /pol → `style`
- /ui → `feat(ui)`

### 2d. Handle Failure (3-attempt loop)
If verify fails:
1. **Attempt 1**: Collect error output. Form hypothesis. Apply smallest possible fix. Re-verify.
2. **Attempt 2**: Different approach. Collect new evidence. Apply fix. Re-verify.
3. **Attempt 3**: Final attempt. If still failing, document the failure thoroughly and stop.

After 3 failures on same subtask: mark it as FAILED in evidence, continue to next subtask if independent, or stop if blocking.

---

## Step 3: Check Acceptance Criteria

After all subtasks, verify each acceptance criterion from the dispatch:
- Run the associated test/command
- Mark each criterion as met or unmet
- If any criterion is unmet and subtasks are exhausted, mark status as PARTIAL

---

## Step 4: Write EVIDENCE.md

Write `.avner/4_operations/EVIDENCE.md`:

```markdown
# EVIDENCE — [TASK-ID]

## Status
[COMPLETE | PARTIAL | FAILED]

## Task Reference
[TASK-ID] — [Title]
Mode: [/new, /fix, etc.]
Risk: [LOW / MEDIUM / HIGH]
Branch: [branch name]

## Subtasks Completed
- [x] [Subtask 1 title] — [what was done]
- [x] [Subtask 2 title] — [what was done]
- [ ] [Subtask 3 title] — FAILED: [reason]

## Commands Run
[exact commands, in order]

## Expected Result
[what passing looks like, per acceptance criteria]

## Observed Result
[what actually happened — paste output excerpts]

## Files Changed
[file path] — [brief description of change]
[file path] — [brief description of change]

## Acceptance Criteria
- [x] [criterion 1] — met
- [ ] [criterion 2] — NOT met: [reason]

## Surprises / Delays
[unexpected findings that took extra time or revealed something non-obvious]
[edge cases discovered, dependency issues, documentation gaps]

## Remaining Risk
[known gaps, untested paths, things that could break in production]
[accepted trade-offs and why]
```

---

## Step 5: Return Verdict

Final output to Manager (structured, parseable):

```
Status: COMPLETE | PARTIAL | FAILED
Task: [TASK-ID]
Commits: [comma-separated hashes]
Files changed: [count]
Tests: PASS | FAIL | SKIPPED
Evidence: written to .avner/4_operations/EVIDENCE.md
Summary: [1-2 sentences]
```

---

## Hard Rules

- One change = one commit. Each commit independently verifiable.
- Never commit without running lint + typecheck first.
- Never touch STATE.md, DISPATCH.md, COUNCIL_LOG.md, or gate_pass.txt.
- Never invoke Council agents.
- Never merge to main.
- If you hit maxTurns: write partial EVIDENCE.md, return PARTIAL status.
- Report honestly. FAILED is a valid and useful outcome.
