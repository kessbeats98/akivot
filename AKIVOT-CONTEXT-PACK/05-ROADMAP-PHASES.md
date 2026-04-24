# Roadmap Phases

This is the concise execution summary of the larger roadmap in:

- `F:\ak\avner-lite\AKIVOT-PRODUCT-MASTER-ROADMAP.md`

## Phase 1
Structural cleanup.

Status:
- complete
- accepted

Goals:
- one clear owner home
- one clear walker home
- one navigation language per role
- reduce pointless flow friction

Examples:
- owner nav should point clearly to dashboard/home
- duplicate walker nav should be removed
- start-walk should be more direct

## Phase 2
Owner home redesign.

Goal:
- make owner dashboard the true emotional and operational center

Owner home should answer:
- Is my dog okay?
- What happened recently?
- Do I need to do anything now?

Current status:
- substantial multi-slice execution completed in `owner/dashboard`
- owner home now has calmer setup states, clearer everyday status, and demoted history depth
- there is one additional local owner-history error-path fix in the worktree that should be reviewed intentionally
- remaining work here should be:
  - real defect fixes if found
  - walkthrough / sign-off
  - not default reopening of more micro-polish

## Phase 3
Walker home and core loop redesign.

Goal:
- make walker dashboard and live loop feel like an operational instrument

Walker flow should be:
- open
- understand
- act
- complete

Current status:
- entered and materially executed
- walker dashboard slice 1 and slice 2 are committed
- chooser single-select contradiction is fixed
- walker live finish SlideOver refinement is committed
- the next step here is not blind polish; it is trustworthy validation of the current flow

## Phase 4
Demote, merge, or remove secondary screens.

Targets:
- owner dogs
- owner dog-profile
- owner calendar
- owner billing
- walker dogs
- walker billing
- walker calendar

Rule:
- if it is not daily-core, it should not compete as primary structure

## Phase 5
Language rewrite.

Targets:
- landing
- onboarding
- auth copy
- key section labels

Goal:
- product should sound human and trust-oriented, not software-oriented

## Phase 6
Validation and hardening.

Need:
- technical checks
- walkthrough checks
- "does this reduce thinking?" checks

Current status:
- now immediately relevant for the walker flow
- deterministic QA seed/reset behavior and truthful Playwright coverage are the current gating need before more refinement

## Strategic Rule
Do not jump ahead to Phase 4 or 5 while the current walker flow still lacks trustworthy validation.

Do not reopen resolved owner Phase 2 slices unless:

- a walkthrough reveals a real bug
- or a new contradiction appears against the roadmap / context-pack product direction

Do not keep inventing new walker slices while the QA/browser baseline is still nondeterministic.

## Completion Clarification
Beyond the current phase execution, the intended complete product shape was clarified further:

- owner setup loop must feel complete:
  - add dog
  - assign walker
  - set price
  - optionally set routine / schedule
- walker loop must stay decisive:
  - open
  - see next dog
  - start
  - finish
- schedule / calendar are intended capabilities, but should remain depth rather than the main home-screen object
- price / billing are real product commitments, not optional secondary data
- notification behavior should preserve trust:
  - current code already has a 30-second start-notification grace period
  - future product decisions may still need an explicit visible undo / cancel-start affordance
