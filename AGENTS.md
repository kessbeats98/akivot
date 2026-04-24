# AGENTS.md

## Akivot Always-On Context

Akivot is a peace-of-mind product.

It is not a CRM, admin dashboard, logistics system, management tool, or finance
dashboard.

Owner opens the app to relax.

Walker opens the app to act.

Main product rule:
If the user has to search for information, we failed.

Decision DNA:
- calm over control
- clarity over features
- certainty over flexibility
- less thinking over more information

Akivot should remove the need to ask questions, not answer more questions.

## Product Guardrails

Before proposing or implementing any feature, UI, flow, dashboard, billing/price
visibility change, new screen, tab, detail view, UX-affecting refactor, or
data-model change surfaced in product behavior:

- Prefer using `akivot-product-enforcer`.
- Classify the work as Core, Depth, Support, or Later.
- Explain what uncertainty is reduced immediately.
- Explain what next action becomes clearer.
- State what is explicitly not being built.

Default action:
Demote or reject unless the proposal is clearly Core and clearly reduces
immediate uncertainty.

Do not:
- add new top-level screens by default; add one only with explicit approval and
  a clear reason tied to the core product promise
- use tabs or navigation as the default solution to complexity; first reduce
  complexity, and add navigation only when clearly justified
- expose backend concepts just because they exist
- make owner UI feel like admin software
- make walker UI require navigation before action by default
- expand billing into a finance dashboard

If unsure, choose the simpler solution.

## Execution Rules

Do not commit unless explicitly asked.

Do not touch unrelated files.

If the worktree is dirty, identify task-relevant vs unrelated changes before
editing.

Schema, billing-core, auth, production DB writes, and deployment changes require
explicit approval.

For implementation tasks, prefer preparing an approved plan first.

Claude Code Executor is external to this chat:
- Here, prepare or review the plan.
- Send execution prompts to Claude Code using `akivot-code-executor`.
- Use `.agents/prompts/akivot/04-send-to-claude-code-executor.md` when handing off.

## Local Skill Usage

Use `akivot-project-constitution` for new-chat orientation or product baseline.

Use `akivot-product-enforcer` before planning product, UI, or flow changes.

Use prompt files in `.agents/prompts/akivot/` for repeatable workflows.
