---
id: TASK-SMOKE-PREFLIGHT
title: Smoke test for run_claude preflight approval wrapper
created_by: codex
workflow: gstack-review
mode: direct_execute
requires_preflight: true
branch: main
base_commit: 65ea5a3
status: ready_for_executor
priority: low
allowed_gstack_skills: []
forbidden_actions:
  - Do not edit application source files
  - Do not widen scope beyond the smoke test
result_contract_path: .orchestrator/results/TASK-SMOKE-PREFLIGHT.json
---

# Goal

Prove that the structured execution wrapper can run a preflight-only planning pass, require explicit approval, and then complete a bounded execution without modifying application code.

# Context

This is a protocol smoke test only. The wrapper is expected to invoke Claude Code twice: first for planning, then for execution after approval.

# Scope

- Read the repo as needed for a smoke test.
- Write only the preflight contract and final result contract.

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

1. During preflight, propose the smallest valid no-code execution plan.
2. During approved execution, do not modify repository source files.
3. Write the final result contract to the required path.
4. Set files_changed to an empty list if no repo code changed.
5. Set status to success if the smoke test completed as asked.

# Validation

- Confirm that the preflight contract exists and is valid JSON.
- Confirm that the final result contract exists and is valid JSON.

# Expected Deliverables

- A valid preflight contract in `.orchestrator/results`.
- A valid result contract at the required path.
- A short stdout summary from Claude for each phase.

# Notes For Reviewer

This smoke test is only about approval gating and contract discipline, not application behavior.
