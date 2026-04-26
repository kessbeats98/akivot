# Prompt — Build Executor Plan (Codex)

Use after the idea passed the guardrail. Output is a narrow plan for Claude Code.

Copy-paste:

---

Load:

- `.agents/skills/akivot-project-constitution/SKILL.md`
- `.agents/skills/akivot-product-enforcer/SKILL.md`

State: PLAN_READY

Run the Product Guardrail Check first. Only continue if Proceed or Reduce.

Then produce a narrow plan in this exact shape:

```
State: PLAN_READY
Goal:
Allowed files:
Out of scope:
Acceptance criteria:
Verification commands:
Risks:
Order of work:
Next state: WAITING_FOR_APPROVAL
```

Constraints:

- Plan only. No code. Do not write or edit any files.
- Do not hand off automatically. Do not invoke `04-send-to-claude-code-executor.md`.
- Smallest path that satisfies the goal.
- Allowed files must be specific paths, not directories.
- Out of scope must list at least one thing to refuse.
- Verification = exact commands and expected results.

After emitting the plan, **stop**. The human/user must explicitly approve before anything moves to `04-send-to-claude-code-executor.md`.

Output must be copy-paste-ready into `04-send-to-claude-code-executor.md`.
