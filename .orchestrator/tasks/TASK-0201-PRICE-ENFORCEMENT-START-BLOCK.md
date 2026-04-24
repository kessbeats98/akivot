---
id: TASK-0201-PRICE-ENFORCEMENT-START-BLOCK
title: Phase 2 price enforcement - block first walk start without valid price
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
  - Do not expand into billing, calendar, notifications, or history depth
  - Do not redesign owner or walker home broadly
  - Do not edit blocked files
result_contract_path: .orchestrator/results/TASK-0201-PRICE-ENFORCEMENT-START-BLOCK.json
success_criteria:
  - First walk cannot start when the active assignment price is missing or 0.00
  - Owner already sees no-price as incomplete setup and walker now sees a quiet blocked state
  - The implementation stays calm and setup-oriented, not accounting-oriented
expected_risks:
  - Start-walk logic may be split between dashboard action wiring and repository/service checks
  - A minimal blocked-state UI may require touching both action logic and walker dashboard rendering
---

# Goal

Implement the first concrete Phase 2 guardrail from `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md`: a walker must not be able to start the first walk when the active assignment price is missing or `0.00`.

# Context

- `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md` is the execution source of truth.
- `AKIVOT-CONTEXT-PACK/09-OPEN-PRODUCT-QUESTIONS.md` locks:
  - `no price = no first walk`
  - owner can still change price during active assignment
  - changed price affects future walks only
- Phase 1 owner setup work is already in place:
  - owner home marks no-price as incomplete setup
  - owner has a lightweight set-price path
- This task is the first Phase 2 slice only:
  - block starting the walk when price is invalid
  - show a quiet, obvious blocked state for the walker

# Scope

- Walker start-walk eligibility logic
- Minimal walker-side blocked-state UX if needed
- Minimal supporting data access or validation needed to determine active assignment price at start time

# Out Of Scope

- Billing UX, invoices, or accounting language
- Owner-side redesign or broader setup changes
- Notifications, grace-window changes, or live-walk redesign
- Secondary surface cleanup
- End-to-end QA expansion beyond focused validation

# Allowed Files

- src/app/walker/dashboard
- src/lib/repositories/walksRepo.ts
- src/lib/repositories/dogsRepo.ts
- src/lib/services/walks
- src/lib/validation/billing.ts

# Blocked Files

- src/app/owner/billing/
- src/app/owner/calendar/
- AKIVOT-CONTEXT-PACK/
- plans/
- qa/
- CLAUDE.md

# Execution Instructions

1. During preflight, inspect the current walker start flow and identify the smallest reliable place to enforce the no-price block.
2. The blocking rule should apply to starting the walk, not to viewing the dashboard.
3. Keep the walker blocked state calm and low-drama:
   - obvious that start cannot proceed
   - clear that price is missing
   - no heavy admin or billing language
4. Do not widen into a larger walker-home redesign in this slice.
5. If enforcement requires both UI and server-side/start-action checks, keep the patch minimal and explicit.
6. If the smallest safe implementation needs one additional file outside the allowlist, stop in preflight and report it instead of widening scope silently.

# Validation

- Propose and run a minimal validation plan in preflight.
- At minimum, validate touched files with targeted type/lint checks if available.
- If a focused manual verification path is needed, state it clearly in the result contract.

# Expected Deliverables

- Code changes that prevent start when active price is missing or `0.00`
- A quiet walker blocked state or equivalent blocked feedback
- A concise result summary of the enforced rule
- Result JSON at the required path

# Notes For Reviewer

- Review whether the enforcement is tied to the real start action rather than cosmetic UI only.
- Review whether the walker message stays calm and non-accounting.
- Review whether this patch stays Phase 2 scoped.
