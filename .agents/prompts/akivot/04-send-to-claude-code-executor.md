# Prompt: Send Approved Plan To Claude Code Executor

```text
Use akivot-code-executor.

Execute the approved Akivot plan below.

Important:
- This plan already passed product guardrail review.
- Do not expand scope.
- Do not add new top-level screens unless explicitly stated.
- Do not touch unrelated files.
- Do not commit.
- If the worktree is dirty, identify task-relevant vs unrelated changes and do
  not touch unrelated files.
- If schema, billing-core, auth, production DB write, or deployment changes
  appear necessary but are not explicitly in scope, stop and ask.
- Run verification exactly as specified.
- If visual/manual smoke is required but blocked, report PARTIAL, not PASS.
- Final report required.

Approved plan:
[PASTE APPROVED PLAN HERE]
```
