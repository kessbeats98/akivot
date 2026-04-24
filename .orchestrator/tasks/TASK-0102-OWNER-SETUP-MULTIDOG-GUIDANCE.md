---
id: TASK-0102-OWNER-SETUP-MULTIDOG-GUIDANCE
title: Phase 1 follow-up - owner home should guide the first incomplete dog
created_by: codex
workflow: gstack-plan-eng-review
mode: direct_execute
requires_preflight: true
branch: main
base_commit: faa853d
status: ready_for_executor
priority: high
allowed_gstack_skills: []
forbidden_actions:
  - Do not modify unrelated dirty files in the worktree
  - Do not modify walker surfaces or Phase 2 start-walk logic
  - Do not expand into billing, calendar, notifications, or history depth
  - Do not edit blocked files
result_contract_path: .orchestrator/results/TASK-0102-OWNER-SETUP-MULTIDOG-GUIDANCE.json
success_criteria:
  - Owner home no longer defaults blindly to the first dog when multiple dogs exist
  - If one or more dogs are incomplete, the selected dog should prefer the first incomplete dog
  - If all dogs are complete, existing selected-dog behavior remains calm and predictable
expected_risks:
  - Existing selectedDogId state currently initializes from dogs[0]
  - The chosen guidance logic should remain Phase 1 scoped and not become multi-dog management
---

# Goal

Finish the remaining Phase 1 gap on owner home: when multiple dogs exist, the dashboard should guide the owner toward finishing setup for the first incomplete dog instead of defaulting blindly to the first dog in the array.

# Context

- `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md` is the execution source of truth.
- `TASK-0101-OWNER-SETUP-COMPLETION` already implemented the four setup states.
- Codex review found one remaining gap:
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` still initializes `selectedDogId` from `dogs[0]?.id`
  - that can hide the real next incomplete setup target when multiple dogs exist
- This is still Phase 1 work, not Phase 2.

# Scope

- Owner dashboard selected-dog initialization and related guidance behavior only
- Any minimal owner dashboard subcomponent changes needed to keep the experience coherent

# Out Of Scope

- Walker dashboard, walker home, start-walk logic, or price enforcement
- Reworking multi-dog management UX broadly
- Billing, calendar, notifications, history, or new navigation
- Repo-wide refactors or QA expansion

# Allowed Files

- src/app/owner/dashboard

# Blocked Files

- src/app/walker/
- src/app/owner/dog-profile/
- src/lib/repositories/
- AKIVOT-CONTEXT-PACK/
- plans/
- qa/
- CLAUDE.md

# Execution Instructions

1. During preflight, inspect the current owner dashboard selected-dog logic and propose the smallest coherent change.
2. Prefer a deterministic rule:
   - if at least one dog is incomplete, default to the first incomplete dog
   - otherwise preserve the first-dog default
3. Keep this behavior bounded to owner home. Do not introduce new persistence, settings, or cross-page selection state.
4. If a tiny explanatory hint is needed for clarity on multi-dog owner home, keep it minimal and within Phase 1.
5. Do not widen into a broader multi-dog redesign.

# Validation

- Propose and run a minimal validation plan in preflight.
- At minimum, validate touched owner dashboard files with targeted lint or type checks if available.
- Report any residual risk plainly if local UX validation remains manual.

# Expected Deliverables

- Code changes that make owner home prefer the first incomplete dog when multiple dogs exist
- A concise result summary of the selection rule after the change
- Result JSON at the required path

# Notes For Reviewer

- Review whether the change truly stays inside Phase 1 guidance rather than becoming multi-dog admin logic.
- Review whether the owner home still feels calm when every dog is already complete.
