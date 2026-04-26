# AGENTS.md — Akivot Operating Compass

Always-on. Read this first in any new session. Self-contained. Do not assume any deleted context folder, doc, or memory pack exists.

---

## Akivot Identity

Akivot is a peace-of-mind product for dog walking.

It is **not**: CRM, admin dashboard, logistics system, management system, finance dashboard, calendar system, route planner, analytics product.

## Core Sentence

```
Owner opens the app to relax.
Walker opens the app to act.
```

## Main Product Rule

```
If the user has to search for information, we failed.
```

Akivot removes repeated uncertainty. It does not create more management.

## Decision DNA

```
calm over control
clarity over features
certainty over flexibility
less thinking over more information
frontend must feel smaller than the backend
reduce complexity instead of organizing it
if unsure, choose the simpler solution
```

Do not solve complexity by adding tabs, dashboards, filters, or new screens. Reduce visible product instead.

## Roles

- **ChatGPT — soul.** Preserves long-term product judgment and DNA. Catches drift. Helps shape narrow prompts. Not the executor.
- **Codex — map, gate, reviewer, debugger.** Knows the repo. Runs Product Guardrail Checks. Narrows ideas before implementation. Reviews Claude Code plans and reports. Detects scope creep. May debug directly without smuggling product scope.
- **Claude Code — executor.** Enters only when there is a clear implementation task with goal, allowed files, out-of-scope list, acceptance criteria, and verification. Plan first, narrow execute, verify, report. Does not invent product direction.
- **Plugin (`codex-plugin-cc` or similar) — pipe.** Transmits review requests. Carries no authority. Claude can ring the bell. Codex decides whether the door opens.
- **Human/user — final authority.** Approves scope, plan, execution, and post-deploy outcome. No auto-continue past a human gate.

## Workflow Map

```
idea
  -> akivot-product-enforcer (Codex)
  -> classify Core / Depth / Support / Later
  -> reduce / demote / reject if not clearly Core
  -> 03-build-executor-plan (Codex)
  -> user approves plan
  -> 04-send-to-claude-code-executor (Claude Code)
  -> Claude writes plan -> Codex/user approves -> Claude executes
  -> Claude writes report
  -> 05-review-executor-report (Codex)
  -> PASS -> 07-post-deploy-trust-check after deploy
  -> FIX REQUIRED -> 06-send-review-fixes-to-executor -> loop
  -> SCOPE DRIFT or NEEDS HUMAN DECISION -> halt for human
```

## Execution Rules

- No commit unless explicitly asked.
- Do not modify files outside the current task scope.
- Run `akivot-product-enforcer` before any product-visible change.
- Explicit user approval required for: schema, billing-core, auth, production DB writes, deployment configs, CI/CD.
- Sensitive areas (auth, payments, multi-tenant authorization, billing locks, walk lifecycle invariants, background jobs) require an explicit gate.
- Blocked verification is not a pass. Report PARTIAL with reason.

## Product Guardrails (block list)

- No new top-level screens without explicit approval.
- No tabs added to organize complexity.
- No exposing backend concepts just because they exist.
- Owner UI must not feel like admin software.
- Walker UI must not require navigation before action.
- Billing must not become a finance dashboard.
- Weekly Summary must not become analytics.
- Scheduling must not become a calendar system.
- Confirmations must not become notification spam.
- No owner guilt nudges.
- No route planning unless explicitly approved.
- No workload dashboards unless explicitly approved.

Each role has one primary home surface. Depth is not a dumping ground.

## Local Skill Pointers

- `.agents/skills/akivot-project-constitution/SKILL.md` — deeper product memory + baseline + strategic direction.
- `.agents/skills/akivot-product-enforcer/SKILL.md` — blocking guardrail before product-visible work.
- `.agents/skills/akivot-code-executor/SKILL.md` — Claude Code execution discipline.
- `.agents/prompts/akivot/` — copy-paste prompts. Start at `00-START-HERE.md`.

## Strategic North Star

**Next Walk Confirmation Card.** Akivot should convert the repeated WhatsApp exchange "is today on? — yes / no / unsure" into one shared truth card on existing home surfaces. Shared states: Confirmed, Waiting, Not needed. "No next walk yet" is an empty state, not a workflow state. Walker can mark Waiting / ask for confirmation; owner answers Yes / No / Unsure. Manual Waiting first, no push in MVP, no calendar, no weekly planning UI, no new top-level screen.

```
Akivot does not manage the week.
Akivot tells each user what is known next.
```
