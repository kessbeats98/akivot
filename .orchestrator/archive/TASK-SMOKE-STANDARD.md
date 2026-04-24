---
id: TASK-SMOKE-STANDARD
title: Smoke test for default preflight enforcement
created_by: codex
workflow: gstack-review
mode: direct_execute
task_size: standard
requires_preflight: false
branch: main
base_commit: 65ea5a3
status: ready_for_executor
priority: low
allowed_gstack_skills: []
forbidden_actions:
  - Do not edit repository source files
  - Do not widen scope beyond this smoke test
result_contract_path: .orchestrator/results/TASK-SMOKE-STANDARD.json
---

# Goal

Prove that non-tiny tasks are forced through preflight even when `requires_preflight` is false.

# Context

This is a wrapper behavior smoke test only. The task should be routed into preflight and must not execute code changes directly.

# Scope

- Read the repo as needed for a smoke test.
- Write only the required preflight artifact if execution is requested in preflight mode.

# Out Of Scope

- Any application code changes.
- Any build, install, or test work.
- Any workflow expansion.

# Allowed Files

- .orchestrator/results

# Blocked Files

- src/
- AKIVOT-CONTEXT-PACK/
- plans/
- CLAUDE.md

# Execution Instructions

1. This task exists only to validate wrapper routing behavior.
2. Do not modify repository source files.
3. If the wrapper asks for preflight, only write the preflight contract.

# Validation

- Confirm that the wrapper enters preflight mode before execution.

# Expected Deliverables

- A valid preflight contract when the wrapper runs this task without approval.
- No source code changes.

# Notes For Reviewer

This task should never direct-execute on the first run because `task_size` is `standard`.
