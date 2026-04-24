# Prompt: Send Plan To Claude Code Plan Mode

```text
Use plan mode only.

You are NOT executing code.
Do not edit files.
Do not run migrations.
Do not commit.

Review and refine this Akivot execution plan against the actual codebase.

Important:
- Preserve Akivot product guardrails.
- Do not expand scope.
- Do not add new top-level screens unless explicitly approved.
- Do not introduce schema, billing-core, auth, production DB, or deployment
  changes unless the plan explicitly requires them.
- Identify missing files, missing dependencies, edge cases, and verification gaps.
- If the plan is too broad, reduce it.
- If the plan is unsafe, mark it BLOCKED.
- Output a revised executor-ready plan.

Plan to review:
[PASTE CODEX PLAN HERE]
```
