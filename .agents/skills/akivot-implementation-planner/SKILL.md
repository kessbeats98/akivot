---
name: akivot-implementation-planner
description: Plan-only Akivot execution planning. Use after akivot-product-enforcer allows a task and before akivot-code-executor executes. Writes narrow PLAN.md contracts, never implementation.
---

# Akivot Implementation Planner

## 1. Purpose

Plan-only skill. It writes the execution contract for Claude Code or Codex-assisted implementation.

It sits between:

1. `akivot-product-enforcer` - decides whether the idea may proceed.
2. `akivot-implementation-planner` - writes a narrow executable `PLAN.md`.
3. `akivot-code-executor` - executes only after the plan is approved.

This skill never executes the plan.

## 2. Required Context

Before planning, load and align with:

- `AGENTS.md`
- `.agents/skills/akivot-product-enforcer/SKILL.md`
- `.agents/skills/akivot-project-constitution/SKILL.md` when product context is relevant
- the specific files needed to understand the implementation surface

If required operating context is missing or unreadable, return:

```text
State: NEEDS HUMAN DECISION
Reason: missing Akivot operating context
Next state: STOPPED_FOR_HUMAN
```

## 3. Product Gate

Run or respect the Product Guardrail Check before writing an implementation plan.

Continue only when the product-enforcer decision is:

- `Proceed`
- `Reduce scope`

If the decision is `Demote` or `Reject`, stop. Do not write an implementation plan.

## 4. Planning Rules

- Inspect relevant files before planning.
- Write a narrow plan only.
- Allowed files must be exact file paths, not broad directories.
- Out of scope must explicitly list what is refused.
- Keep the smallest implementation path that satisfies the goal.
- Do not invent missing product direction.
- If product clarity is missing, return `NEEDS HUMAN DECISION`.
- If the smallest valid implementation requires files outside the requested boundaries, say so clearly and stop for human approval.
- Do not edit product code.
- Do not run implementation.
- Do not commit.

## 5. High-Risk Approval Gate

The plan must state that these require explicit human approval before execution:

- schema / DDL / migrations
- billing core
- auth / authorization
- production DB writes
- deployment or CI/CD changes

If any of these are needed but not explicitly approved, return:

```text
State: NEEDS HUMAN DECISION
Reason: high-risk boundary requires explicit approval
Next state: STOPPED_FOR_HUMAN
```

## 6. File-Based Plan

Preferred path for real implementation tasks:

```text
.agent-runs/current/PLAN.md
```

The initial plan must contain:

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

The planner stops after writing the plan. Human approval is required before execution.

Approval is represented in `PLAN.md`:

```text
Approved: yes
Approved by: human
```

## 7. Stop State

After planning, always stop at:

```text
Next state: WAITING_FOR_APPROVAL
```

Do not invoke `akivot-code-executor`.
Do not continue automatically.
Chat is for thinking; files are the source of truth for execution.
