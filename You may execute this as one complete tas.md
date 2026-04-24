## Standard Task Operating Preamble

Repo:
- `F:\ak\avner-lite`

Start every task by checking:
- `git status --short --branch`

Repo reality:
- The worktree is dirty.
- There are many unrelated tracked/untracked files.
- Do not treat general worktree noise as part of this task.
- Do not stage, edit, revert, delete, or commit unrelated files.
- Never run destructive git commands.
- Do not commit unless explicitly asked.

Canonical project context:
- Use `BILLING.MD` and `plans/BATCH-BILLING-PRACTICAL-CONTRACT-LAYER.md` only when billing context is needed.
- Do not use deprecated billing plan files as authority:
  - `plans/BATCH-BILLING-PRACTICAL-CONTRACT-V2.md`
  - `plans/BATCH-BILLING-PRICING-ARCHITECTURE.md`

Current billing baseline:
- Phases 1A, 1B, 2, 3, and 4 are logically complete and verified.
- Drizzle migration ledger drift has been repaired.
- Walker Billing Read-Model Improvements are complete and verified.
- Do not reopen completed billing phases unless a real contradiction appears in code.

Planning / execution rules:
- For a new task, first read the task-relevant files and write a short implementation plan.
- If the plan requires schema changes, billing-core changes, auth changes, or DB mutation, call that out before coding.
- If the task is already approved for execution, implement end-to-end within the declared scope.
- Keep scope tight. Do not do opportunistic cleanup.
- If you find an unrelated bug, report it separately instead of fixing it inside this task.

Verification rules:
- Always run `npx tsc --noEmit`.
- Run `npm run build` unless the task is explicitly docs-only or plan-only.
- For UI work, run a visual smoke test.
- For DB/repo behavior, run a real DB/manual regression when feasible.
- Report if a verification step was blocked rather than calling it passed.

Temporary artifacts:
- Temporary scripts are allowed only when needed for verification.
- Put them in an obvious temp location or name them clearly.
- Delete all temp scripts, screenshots, logs, and seeded DB rows before finishing.
- Final report must state cleanup status.

Final report must include:
- Task status: PASS / FAIL / BLOCKED / PARTIAL
- Files changed
- Behavior changed
- Commands run and observed results
- Visual/DB/manual verification results, if applicable
- Temporary artifact cleanup status
- Remaining risks or blockers
- `git status --short` focused on task-relevant files

Commit rule:
- Do not commit unless explicitly asked.
- If asked to commit, stage only task-relevant files.


## Large Task Gate

You may execute this as one complete task, but with internal gates.

Rules:
1. Start with a short implementation plan.
2. If the plan requires schema changes or billing-core changes not explicitly requested, stop and report before coding.
3. Otherwise, implement the full task end-to-end.
4. Verify after implementation.
5. Clean up all temporary artifacts.
6. Final report must be precise enough for Codex review.
