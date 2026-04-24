---
name: akivot-project-constitution
description: >
  Akivot project constitution and startup orientation. Use at the start of a new
  chat, when resuming Akivot work, onboarding an agent into the repo, reviewing
  product direction, or when the user asks for context, baseline, roadmap,
  product principles, Decision DNA, or what Akivot should and should not become.
---

# Akivot Project Constitution

Use this skill to orient a new Akivot session before product, UI, or code decisions.
This is not generic product guidance. It preserves Akivot's decision system.

## Core Identity

Akivot is a peace-of-mind product for dog owners and dog walkers.

Akivot is not:
- a CRM
- an admin dashboard
- a logistics system
- a management tool
- a finance dashboard

The app may have complex backend truth, but the user must experience clarity.

## Main Principle

If the user has to search for information, we failed.

The product should answer the user's immediate uncertainty before asking them to
navigate, compare, filter, or inspect system state.

## Role Truths

Owner opens the app to relax.

The owner wants calm, trust, certainty, and the feeling: "my dog is okay."

Walker opens the app to act.

The walker wants clarity, flow, immediate action, and the feeling: "I know what to
do now."

## Decision DNA

When choosing between:
- more control vs more calm -> choose calm
- more features vs more clarity -> choose clarity
- more flexibility vs more certainty -> choose certainty
- more information vs less thinking -> choose less thinking

Owner opens the app to relax.

Walker opens the app to act.

The product should feel like:
- nothing is missing
- nothing is overwhelming

Akivot should remove the need to ask questions, not answer more questions.

This section must influence all future decisions. If a proposed change violates
this DNA, reduce scope, move it deeper, or reject it.

## Frontend Philosophy

Frontend must feel smaller and simpler than the backend.

Backend can contain periods, entries, offers, agreements, locks, statuses,
adjustments, and ledgers. The UI should translate those into a small number of
clear answers:
- Is my dog okay?
- What do I need to do now?
- What is waiting?
- What is locked and final?
- What changed?

Do not expose backend concepts just because they exist.

## Information Hierarchy

Classify every surface before adding it:
- Core: must be visible immediately because it reduces current uncertainty.
- Depth: useful detail after the user chooses to inspect.
- Support: operational/help content that should not dominate the product.
- Later: real idea, wrong time.

Not everything belongs on the home screen.

Prefer hiding depth behind a focused surface over expanding the home experience.

## Current Product Baseline

Billing truth is established:
- walks.finalPrice is the source of truth once a walk starts
- payment periods, entries, adjustments, and reopen flows are implemented
- Drizzle migration ledger drift was repaired
- Walker billing read-model improvements were completed and verified
- Price UX effective price model was implemented and visually verified

Do not reopen billing truth casually. Most billing/price work should be read-model,
copy, visibility, or UI clarity unless explicit approval expands scope.

Execution guardrails exist in:
- `.claude/skills/akivot-code-executor/SKILL.md`

Use that skill for implementation discipline. Use this constitution for product
judgment.

## Non-Goals

Do not let Akivot drift into:
- owner admin software
- walker route-management software
- billing analytics software
- configurable enterprise workflows
- dashboards full of backend state
- top-level screens for every data type

Depth is allowed. Visible complexity is not.

## Session Startup Use

At the start of a new Akivot chat:
1. Load this constitution.
2. Identify the active task and its layer: Core, Depth, Support, or Later.
3. State which role emotion is being protected.
4. State what must not be expanded.
5. If implementation is requested, continue with `akivot-code-executor`.

## Embedded Test Prompts

Prompt A:
"Start a new Akivot session. Orient yourself before planning the next feature."
Expected: summarize peace-of-mind product line, role truths, Decision DNA, current
billing/price baseline, and what not to reopen.

Prompt B:
"Should we add a detailed owner operations dashboard?"
Expected: reject or demote. It increases control and information, but harms calm
and turns owner UI into admin software.

Prompt C:
"We need to show walkers completed-but-not-billed walks."
Expected: allow as Depth/Core-adjacent visibility if it reduces uncertainty without
changing billing truth or adding top-level complexity.
