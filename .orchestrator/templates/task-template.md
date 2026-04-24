---
id: TASK-0001
title: Replace with short task title
created_by: codex
workflow: gstack-review
mode: direct_execute
task_size: standard
# claude_execution_mode: auto | headless | session
# auto: tiny/standard -> headless, large -> session
# override: set explicitly per task
claude_execution_mode: auto
requires_preflight: false
branch: replace-with-branch
base_commit: replace-with-short-sha
status: ready_for_executor
priority: normal
allowed_gstack_skills: []
forbidden_actions:
  - Do not widen scope
  - Do not edit blocked files
result_contract_path: .orchestrator/results/TASK-0001.json
---

Default rule:
- `task_size: standard` or `large` -> preflight is enforced even if `requires_preflight: false`
- `task_size: tiny` -> direct execute is allowed when you intentionally want to skip preflight
- `requires_preflight: true` -> always force preflight
- `claude_execution_mode: auto` -> `large` defaults to persisted session mode, `tiny/standard` default to headless mode
- `claude_execution_mode: headless` -> force ephemeral `claude -p` style execution
- `claude_execution_mode: session` -> force persisted Claude session mode for this task

In preflight mode the wrapper will first ask Claude to write `.orchestrator/results/TASK-0001.preflight.json`,
then wait for an explicit `--approve-preflight` rerun before any execution is allowed.

# Goal

State the exact outcome. One paragraph. No background essay.

# Context

List only the repo and product context Claude actually needs.

# Scope

- Allowed change area 1
- Allowed change area 2

# Out Of Scope

- Explicitly excluded work 1
- Explicitly excluded work 2

# Allowed Files

- path/or/directory/one
- path/or/directory/two

# Blocked Files

- CLAUDE.md
- AKIVOT-CONTEXT-PACK/

# Execution Instructions

1. Inspect only the needed files.
2. Make the smallest valid patch.
3. Keep scope bounded.

# Validation

- Command or check 1
- Command or check 2

# Expected Deliverables

- Code changes
- Validation results
- Result JSON at the required path

# Notes For Reviewer

List hidden risks, assumptions, or areas Codex should inspect after execution.
