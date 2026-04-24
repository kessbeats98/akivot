# Akivot Reusable Prompts

Copy these prompts for recurring Akivot workflows.

Start with `00-START-HERE.md` if you are unsure which file to use.

## Files

- `00-START-HERE.md` - decision guide for which prompt to use.
- `01-new-chat.md` - optional explicit orientation at the start of a new Codex chat.
- `02-idea-guardrail.md` - evaluate an idea before planning.
- `03-build-executor-plan.md` - build a narrow plan for Claude Code Executor.
- `04-send-to-claude-code-executor.md` - paste into Claude Code with an approved plan.
- `05-review-executor-report.md` - review Claude Code's final report here.
- `06-send-review-fixes-to-executor.md` - paste into Claude Code when fixes are needed.
- `07-send-plan-to-claude-code-plan-mode.md` - paste into Claude Code PLAN MODE
  to refine a medium/large plan against the real codebase before execution.

## Recommended Simple Workflow

Most of the time, use only three files:

1. `01-new-chat.md` - when starting a new chat and wanting explicit orientation.
2. `03-build-executor-plan.md` - when turning an idea into an approved plan.
3. `04-send-to-claude-code-executor.md` - when handing the approved plan to Claude Code.

Use the review/fix prompts only after execution.

For medium/large work, insert one extra step before execution:

`03-build-executor-plan.md` -> `07-send-plan-to-claude-code-plan-mode.md` ->
review the refined plan here -> `04-send-to-claude-code-executor.md` in a fresh
Claude Code session.
