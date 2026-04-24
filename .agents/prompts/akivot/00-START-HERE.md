# Start Here: Akivot Prompt Workflow

Use this file first when you are not sure which prompt to copy.

## Default Daily Workflow

1. New Codex chat:
   Use `01-new-chat.md` only if you want an explicit orientation. The root
   `AGENTS.md` already carries the always-on baseline.

2. New feature idea:
   Use `03-build-executor-plan.md`. It invokes both product constitution and
   product enforcer, then asks for a narrow executor-ready plan.

3. Medium or large plan needs codebase validation before execution:
   Use `07-send-plan-to-claude-code-plan-mode.md` in Claude Code PLAN MODE.

4. Approved plan ready for execution:
   Use `04-send-to-claude-code-executor.md` in a fresh Claude Code execution
   session.

5. Claude Code returned a final report:
   Use `05-review-executor-report.md` here.

6. Review found fixes:
   Use `06-send-review-fixes-to-executor.md` in Claude Code.

## Rare Cases

Use `02-idea-guardrail.md` only when you want to evaluate an idea without asking
for an execution plan yet.

Use `07-send-plan-to-claude-code-plan-mode.md` for medium/large tasks where
Claude Code should inspect the real codebase and refine the plan before a clean
executor session.

## Mental Model

`AGENTS.md` = always-on compass.

`akivot-project-constitution` = deeper product memory.

`akivot-product-enforcer` = product gate.

`akivot-code-executor` = external Claude Code execution discipline.

Claude Code PLAN MODE = optional codebase-aware plan review before execution.

Prompt files = copy-paste wrappers for repeated workflows.
