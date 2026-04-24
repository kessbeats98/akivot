---
id: TASK-SMOKE-DIRECT
title: Smoke test for run_claude direct execute wrapper
created_by: codex
workflow: gstack-review
mode: direct_execute
task_size: tiny
requires_preflight: false
branch: main
base_commit: 65ea5a3
status: ready_for_executor
priority: low
allowed_gstack_skills: []
forbidden_actions:
  - Do not edit application source files
  - Do not widen scope beyond the smoke test
result_contract_path: .orchestrator/results/TASK-SMOKE-DIRECT.json
---

# Goal

Prove that the structured execution wrapper can hand a bounded task to Claude Code and receive a valid result contract back without modifying application code.

# Context

This is a transport smoke test only. The wrapper is expected to invoke Claude Code, let it inspect the repo, and require a valid JSON result contract.

# Scope

- Read the repo as needed for a smoke test.
- Write only the required result contract.

# Out Of Scope

- Any code changes to the application.
- Any test, build, or package changes.
- Any workflow expansion.

# Allowed Files

- .orchestrator/results

# Blocked Files

- src/
- AKIVOT-CONTEXT-PACK/
- plans/
- CLAUDE.md

# Execution Instructions

1. Do not modify repository source files.
2. You may inspect files needed to understand the task.
3. Write a valid result contract to the required path.
4. Set files_changed to an empty list if no repo code changed.
5. Set status to success if the smoke test completed as asked.

# Validation

- Confirm that the result contract exists and is valid JSON.

# Expected Deliverables

- A valid result contract at the required path.
- A short stdout summary from Claude.

# Notes For Reviewer

This smoke test is only about transport and contract discipline, not application behavior.
