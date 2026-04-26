# Prompt — Send to Claude Code Executor

Paste the plan into Claude Code with this wrapper.

Preferred safer path: Claude reads `.agent-runs/current/PLAN.md` from the file-based workflow. Claude may execute only when the file says `Approved: yes`.

Copy-paste:

---

Load `.agents/skills/akivot-code-executor/SKILL.md`.

State: WAITING_FOR_APPROVAL
Iteration: 1 of max 3

Execution may begin **only because the human/user approved the plan**. If you did not see explicit approval in this message, stop and ask.

If using `.agent-runs/current/PLAN.md`, verify it contains:

```
Approved: yes
Approved by: human
```

If approval is missing, stop with:

```
State: WAITING_FOR_APPROVAL
Reason: PLAN.md is not approved
Next state: WAITING_FOR_APPROVAL
```

Plan:

```
[paste the plan from 03 here]
```

Rules:

- Plan first. No execution until approved, unless tiny/trivial.
- File-based workflow has no tiny/trivial exception; `Approved: yes` is required.
- Touch only the allowed files.
- No opportunistic cleanup. No unrelated files.
- No new top-level screens, tabs, or dashboards.
- No commits.
- If the worktree is dirty in unrelated files, leave them alone.
- Schema / billing core / auth / production DB / deploy → stop and ask.
- Blocked verification is PARTIAL, not PASS.
- If using file-based workflow, write the final report to `.agent-runs/current/CLAUDE_EXECUTION_REPORT.md`.

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
