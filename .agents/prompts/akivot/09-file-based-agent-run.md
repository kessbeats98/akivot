# Prompt - File-Based Agent Run

Use this as the preferred safer path for real implementation tasks.

Chat is for thinking. Files are the source of truth for execution.

## Files

Current run folder:

```text
.agent-runs/current/
```

Plan:

```text
.agent-runs/current/PLAN.md
```

Claude execution report:

```text
.agent-runs/current/CLAUDE_EXECUTION_REPORT.md
```

Codex review:

```text
.agent-runs/current/CODEX_REVIEW.md
```

`.agent-runs/` is operational workspace and should stay ignored by git.

## Workflow

1. Codex loads:
   - `AGENTS.md`
   - `.agents/skills/akivot-product-enforcer/SKILL.md`
   - `.agents/skills/akivot-project-constitution/SKILL.md` when product context is relevant
   - `.agents/skills/akivot-implementation-planner/SKILL.md`
2. Codex runs the Product Guardrail Check.
3. If the decision is `Proceed` or `Reduce scope`, Codex writes:
   - `.agent-runs/current/PLAN.md`
4. Codex stops at `WAITING_FOR_APPROVAL`.
5. Human reviews the plan.
6. Human approval is recorded in `PLAN.md`:

```text
Approved: yes
Approved by: human
```

7. Claude Code loads `.agents/skills/akivot-code-executor/SKILL.md`.
8. Claude reads `.agent-runs/current/PLAN.md`.
9. Claude executes only if `Approved: yes`.
10. Claude writes `.agent-runs/current/CLAUDE_EXECUTION_REPORT.md`.
11. Codex reviews:
    - `AGENTS.md`
    - `.agents/skills/akivot-product-enforcer/SKILL.md`
    - `.agents/skills/akivot-project-constitution/SKILL.md` when product context is relevant
    - `.agent-runs/current/PLAN.md`
    - `.agent-runs/current/CLAUDE_EXECUTION_REPORT.md`
    - current diff / changed files
12. Codex writes `.agent-runs/current/CODEX_REVIEW.md`.

## PLAN.md Template

```text
State: PLAN_READY
Approved: no
Goal:
Layer:
User emotion affected:
Allowed files:
Out of scope:
Acceptance criteria:
Verification commands:
Risks:
Order of work:
Next state: WAITING_FOR_APPROVAL
```

Allowed files must be exact file paths, not broad directories.

Out of scope must explicitly list what is refused.

Schema, billing-core, auth, production DB, and deploy changes require explicit human approval.

If planning reveals missing product clarity, return:

```text
State: NEEDS HUMAN DECISION
Reason:
Next state: STOPPED_FOR_HUMAN
```

## Claude Execution Gate

Claude Code cannot execute unless `PLAN.md` contains:

```text
Approved: yes
Approved by: human
```

If approval is missing, Claude must stop:

```text
State: WAITING_FOR_APPROVAL
Reason: PLAN.md is not approved
Next state: WAITING_FOR_APPROVAL
```

## Claude Report

Claude writes:

```text
.agent-runs/current/CLAUDE_EXECUTION_REPORT.md
```

Required report shape:

```text
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

## Codex Review

Codex review is valid only after loading:

- `AGENTS.md`
- `.agents/skills/akivot-product-enforcer/SKILL.md`
- `.agents/skills/akivot-project-constitution/SKILL.md` when product context is relevant
- `.agent-runs/current/PLAN.md`
- `.agent-runs/current/CLAUDE_EXECUTION_REPORT.md`
- current diff / changed files

If any required context is missing:

```text
NEEDS HUMAN DECISION
Reason: missing Akivot operating context
Next state: STOPPED_FOR_HUMAN
```

Codex writes:

```text
.agent-runs/current/CODEX_REVIEW.md
```

## Loop Control

- Max fix passes: 2.
- Max total executions: 3.
- If iteration 3 still needs fixes, return `STOPPED_FOR_HUMAN`.
- If the same fix repeats, return `STOPPED_FOR_HUMAN`.
- No auto-continuation.
- The plugin is a pipe, not authority.
- Human/user remains final authority.
