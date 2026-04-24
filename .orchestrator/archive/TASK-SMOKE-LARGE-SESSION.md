---
id: TASK-SMOKE-LARGE-SESSION
title: Smoke test for automatic session channel selection
created_by: codex
workflow: gstack-review
mode: direct_execute
task_size: large
claude_execution_mode: auto
requires_preflight: false
branch: main
base_commit: 65ea5a3
status: ready_for_executor
priority: low
allowed_gstack_skills: []
forbidden_actions:
  - Do not edit repository source files
  - Do not widen scope beyond this smoke test
result_contract_path: .orchestrator/results/TASK-SMOKE-LARGE-SESSION.json
---

# Goal

Prove that large tasks default to persisted Claude session mode while still using the structured orchestrator contract.

# Context

This is a runner policy smoke test only. It exists to validate command selection and transport mode, not product behavior.

# Scope

- Read the repo as needed for a smoke test.
- Write only the required preflight or result artifacts if execution is requested.

# Out Of Scope

- Any application code changes.
- Any build, install, or feature work.
- Any workflow expansion.

# Allowed Files

- .orchestrator/results

# Blocked Files

- src/
- AKIVOT-CONTEXT-PACK/
- plans/
- CLAUDE.md

# Execution Instructions

1. This task exists only to validate the automatic session-channel policy.
2. Do not modify repository source files.
3. Follow the wrapper-selected transport mode.

# Validation

- Confirm the runner chooses `session` channel automatically for `task_size: large`.

# Expected Deliverables

- A dry-run or preflight command that clearly shows persisted session mode.

# Notes For Reviewer

This task should choose session mode even without an explicit `claude_execution_mode: session` override.
