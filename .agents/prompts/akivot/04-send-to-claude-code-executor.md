# Prompt — Send to Claude Code Executor

Paste the plan into Claude Code with this wrapper.

Copy-paste:

---

Load `.agents/skills/akivot-code-executor/SKILL.md`.

State: WAITING_FOR_APPROVAL
Iteration: 1 of max 3

Execution may begin **only because the human/user approved the plan**. If you did not see explicit approval in this message, stop and ask.

Plan:

```
[paste the plan from 03 here]
```

Rules:

- Plan first. No execution until approved, unless tiny/trivial.
- Touch only the allowed files.
- No opportunistic cleanup. No unrelated files.
- No new top-level screens, tabs, or dashboards.
- No commits.
- If the worktree is dirty in unrelated files, leave them alone.
- Schema / billing core / auth / production DB / deploy → stop and ask.
- Blocked verification is PARTIAL, not PASS.

End with the Final Report Format block, then **stop**. Do not invoke the next prompt automatically:

```
State: EXECUTED
Iteration: 1 of max 3
Changed files:
Behavior changes:
Verification:
Manual checks still needed:
Scope not touched:
Blockers:
Next state: WAITING_FOR_REVIEW
```
