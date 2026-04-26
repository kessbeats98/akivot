# Prompt — Send Review Fixes to Executor

Use to send Codex's fix list back to Claude Code.

Copy-paste:

---

Load `.agents/skills/akivot-code-executor/SKILL.md`.

State: FIX_REQUIRED
Iteration: <n of max 3>  (this counts as a fix pass)

Apply only these fixes:

```
[paste the fix list from 05 here]
```

Rules:

- Apply only the listed fixes. Nothing else.
- No unrelated cleanup.
- Stay within the original allowed files.
- Rerun the verification commands from the original plan.
- Blocked smoke = PARTIAL, not PASS.
- No commits.
- If you cannot fix without touching files outside the allowed list, or without expanding scope → stop and emit `State: STOPPED_FOR_HUMAN` with reason. Do not improvise.

End with the Final Report Format block, then **stop**:

```
State: EXECUTED
Iteration: <n>
Changed files:
Behavior changes:
Verification:
Manual checks still needed:
Scope not touched:
Blockers:
Next state: WAITING_FOR_REVIEW
```

Loop reminder: max 2 fix passes. If this is iteration 3, the next review is the last automatic one.
