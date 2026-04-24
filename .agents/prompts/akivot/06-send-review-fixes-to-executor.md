# Prompt: Send Review Fixes To Claude Code Executor

```text
Use akivot-code-executor.

Apply only the review fixes below.

Rules:
- Do not rewrite the feature.
- Do not expand scope.
- Do not touch unrelated files.
- No commits.
- Run npx tsc --noEmit.
- Run npm run build if product code changed.
- If visual smoke is still required but blocked, report PARTIAL, not PASS.

Required fixes:
[PASTE REQUIRED FIXES HERE]
```
