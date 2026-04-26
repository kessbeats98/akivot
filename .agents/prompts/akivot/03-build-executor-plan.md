# Prompt — Build Executor Plan (Codex)

Use after the idea passed the guardrail. Output is a narrow plan for Claude Code.

For real implementation work, prefer the file-based run workflow in `09-file-based-agent-run.md` and write the plan to `.agent-runs/current/PLAN.md`.

Copy-paste:

---

Load:

- `.agents/skills/akivot-project-constitution/SKILL.md`
- `.agents/skills/akivot-product-enforcer/SKILL.md`
- `.agents/skills/akivot-implementation-planner/SKILL.md` when using file-based planning

State: PLAN_READY

Run the Product Guardrail Check first. Only continue if Proceed or Reduce.

Then produce a narrow plan in this exact shape:

```
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

Constraints:

- Plan only. No implementation code.
- In chat-copy mode, do not write or edit files.
- In file-based mode, only write `.agent-runs/current/PLAN.md`.
- Do not hand off automatically. Do not invoke `04-send-to-claude-code-executor.md`.
- Smallest path that satisfies the goal.
- Allowed files must be specific paths, not directories.
- Out of scope must list at least one thing to refuse.
- Verification = exact commands and expected results.
- Schema / billing-core / auth / production DB / deploy changes require explicit approval.
- If product clarity is missing, return `NEEDS HUMAN DECISION` instead of inventing scope.

After emitting the plan, **stop**. The human/user must explicitly approve before anything moves to `04-send-to-claude-code-executor.md`.

Output must be copy-paste-ready into `04-send-to-claude-code-executor.md`.

If using the file-based workflow, save the same plan as `.agent-runs/current/PLAN.md` with `Approved: no`, then stop at `WAITING_FOR_APPROVAL`.
