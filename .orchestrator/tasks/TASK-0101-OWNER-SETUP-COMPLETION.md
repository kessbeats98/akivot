---
id: TASK-0101-OWNER-SETUP-COMPLETION
title: Phase 1 owner setup completion on owner home
created_by: codex
workflow: gstack-plan-eng-review
mode: direct_execute
requires_preflight: true
branch: main
base_commit: 65ea5a3
status: ready_for_executor
priority: high
allowed_gstack_skills: []
forbidden_actions:
  - Do not modify unrelated dirty files in the worktree
  - Do not modify walker surfaces or start-walk logic
  - Do not expand into billing, calendar, notifications, or history depth
  - Do not edit blocked files
result_contract_path: .orchestrator/results/TASK-0101-OWNER-SETUP-COMPLETION.json
success_criteria:
  - Owner home shows one clear next action for each incomplete setup state
  - Missing or 0.00 price is visible as incomplete setup on owner side
  - Setup complete feels calmer than setup incomplete
expected_risks:
  - Owner dashboard currently lacks assignment price data in its dog view model
  - Dog profile currently supports assign walker but not price setting
---

# Goal

Implement `Phase 1 - Owner Setup Completion` from `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md`. The owner home must clearly communicate setup progress for one selected dog and show one primary next action at every incomplete stage. The four required states are: no dog -> `Add dog`; dog with no active walker -> `Assign walker`; active walker with missing or `0.00` price -> `Set price`; dog + walker + valid non-zero price -> setup complete, with a calmer home state.

# Context

- `AKIVOT-CONTEXT-PACK/11-V11-EXECUTION-PLAN.md` is the execution source of truth for this slice.
- `AKIVOT-CONTEXT-PACK/09-OPEN-PRODUCT-QUESTIONS.md` locks:
  - `setup complete = Dog + Walker + Price`
  - `no price = no first walk`
  - routine remains optional
- Current repo reality:
  - `src/app/owner/dashboard/OwnerDashboardClient.tsx` already has a no-dog empty state.
  - Owner home already shows an `Assign walker` CTA when the selected dog has no active walker.
  - Owner dashboard data currently exposes walkers but not assignment price.
  - `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx` already supports assigning a walker, but not setting price.

# Scope

- Owner dashboard setup-state derivation and primary CTA behavior.
- Minimal owner-side setup entry points needed to complete assign walker and set price flows.
- Minimal data shaping needed to expose active assignment price and setup status to owner surfaces.

# Out Of Scope

- Walker dashboard, walker home, walker start logic, or live walk behavior.
- Price enforcement on walker start or blocked-start UX. That belongs to Phase 2.
- Billing, calendar, notifications, or history expansion.
- New secondary surfaces or broad visual redesign.
- Rewriting QA infrastructure.

# Allowed Files

- src/app/owner/dashboard
- src/app/owner/dog-profile/[dogId]
- src/lib/repositories/dogsRepo.ts
- src/lib/validation/billing.ts

# Blocked Files

- src/app/walker/
- src/lib/repositories/walksRepo.ts
- src/app/owner/billing/
- src/app/owner/calendar/
- AKIVOT-CONTEXT-PACK/
- plans/
- qa/
- CLAUDE.md

# Execution Instructions

1. During preflight, inspect the current owner home and dog profile flows and propose the smallest coherent slice that satisfies Phase 1 without leaking into Phase 2.
2. Preserve the existing no-dog behavior unless a small adjustment is required for clarity.
3. Add explicit setup-state derivation for the selected dog on owner home:
   - no dog
   - dog, no active walker
   - active walker, missing or `0.00` price
   - active walker, valid non-zero price
4. Keep one primary next action visible for incomplete setup. Prefer linking to existing owner setup entry points over inventing a new admin surface.
5. Add a clear owner-side way to set price once a walker is assigned. Keep it lightweight and setup-oriented, not billing-oriented.
6. If multiple dogs exist, lead the owner toward finishing one dog's setup first. Do not build multi-dog management logic beyond what is necessary for the selected-dog experience.
7. Keep the setup-complete home state calmer and more informational than the setup-incomplete states.
8. Do not touch walker-side logic even if you notice Phase 2 needs.
9. If the smallest valid implementation requires one additional owner-side file outside the allowlist, stop in preflight and report it rather than widening scope silently.

# Validation

- Propose and run a minimal validation plan in preflight.
- At minimum, validate touched files with targeted lint or type checks if available.
- If local owner-flow QA coverage is missing, state that explicitly in the result contract as residual risk instead of inventing a broad QA expansion.

# Expected Deliverables

- Code changes implementing the Phase 1 owner setup states.
- A reachable owner-side set-price entry point after walker assignment.
- A concise behavior summary covering the four setup states.
- Result JSON at the required path.

# Notes For Reviewer

- Review whether the new `Set price` path stays setup-oriented rather than turning into billing UX.
- Review whether home becomes calmer once setup is complete.
- Review whether any repo changes drift into walker logic or Phase 2 behavior.
