# Akivot GStack Operating Plan

## Purpose
Use the installed `gstack` workflow as the default execution system for Akivot work in Codex.

This file is not a new product spec. It is an execution wrapper around the existing source of truth.

## Product Authority
Always preserve this order:

1. `AKIVOT-CONTEXT-PACK/CONTEXT.MD`
2. The context-pack files it points to, in the stated order
3. `AKIVOT-PRODUCT-MASTER-ROADMAP.md`

Process files such as `CLAUDE.md`, local rules, and skill packs are execution-discipline tools only.

## GStack Role Mapping For This Repo

### Use `gstack-office-hours`
Only for:

- new product wedges
- scope reframing
- open PM ambiguity
- "is this worth building?"

Do not use it to reopen already-locked Akivot principles.

### Use `gstack-autoplan`
For non-trivial work that needs a reviewed implementation plan before code changes.

Default for:

- feature slices
- workflow changes
- multi-file refactors
- risky bugfixes that affect product behavior

### Use `gstack-review`
Before treating a change as done.

Required when:

- a diff touches auth, walk lifecycle, billing, notifications, QA infra, or shared state
- context docs appear out of sync with repo state
- a branch is being prepared for landing

### Use `gstack-investigate`
Before patching nondeterministic bugs, QA drift, race conditions, or contradictory seeded-state behavior.

### Use `gstack-qa`
After local implementation when browser validation matters.

Default for:

- walker dashboard
- walker live flow
- owner setup flow
- notification-sensitive changes

### Use `gstack-ship`
Only after:

- local validation
- targeted review
- QA evidence is trustworthy

## Current Locked Direction
Do not restart ideation from zero.

The current project direction is:

- owner home remains calm and reassurance-led
- walker home remains action-first
- setup completion requires dog + walker + price
- schedule, billing, history, and calendar stay as depth
- the immediate high-value lane is validation and hardening, not new surface expansion

## Current Reality Check
As of this plan:

- the context pack still warns about a local `OwnerDashboardClient.tsx` fix
- current worktree inspection shows no active diff for that file
- QA helper and scenario files still indicate the walker validation baseline is the most important execution lane

This means the next steps must be driven by repo reality, not only by the handoff text.

## Active Execution Lane
Current default lane:

1. verify QA seed/reset determinism
2. verify walker dashboard baseline
3. verify start-walk flow
4. verify live mode persistence
5. verify end-walk return
6. fix the smallest real defect if a real defect is exposed
7. stop at validated sign-off if no real defect appears

## Stop Rules
Stop and escalate before implementation if:

- the context pack conflicts with actual route behavior
- QA seed/reset mutates real data incorrectly
- walker lifecycle invariants are unclear
- a proposed fix would reopen already-accepted owner-home slices without clear evidence

## Session Cadence
For each substantial task:

1. Read only the minimum relevant context.
2. Confirm current worktree state.
3. Run the right `gstack` role, not a generic answer.
4. Implement only after the task is scoped.
5. Review and validate before calling the task complete.

## Immediate Next Task
Treat the next default task as:

`Make the Playwright/browser validation baseline trustworthy again, then validate the current walker flow end to end.`
