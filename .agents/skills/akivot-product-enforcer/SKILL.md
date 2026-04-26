---
name: akivot-product-enforcer
description: Blocking guardrail. Use BEFORE any product-visible change — feature, UI, flow, or code that the user can perceive. Stricter than the constitution. Forces a Product Guardrail Check and demotes/rejects anything not clearly Core. Returns Proceed / Reduce scope / Demote / Reject.
---

# Akivot Product Enforcer

## 1. Purpose

Blocking gate. Run this before any product-visible change. Stricter and shorter than the constitution. Output is mandatory and structured.

## 2. Default Action

```
Demote or reject unless the proposal is clearly Core
and clearly reduces immediate uncertainty.
```

Justified Depth may pass only if it removes a real user question that the home surface cannot answer.

## 3. Required Output

Every invocation must produce this block, fully filled in. No skipping fields.

```
Product Guardrail Check

Goal:
Layer: Core / Depth / Support / Later
User emotion affected:
Immediate uncertainty reduced:
Next action clarified:
Visible UI complexity impact:
Explicitly not building:
Smallest implementation path:
Decision: Proceed / Reduce scope / Demote / Reject
Reason:
```

If any field cannot be filled, the decision is **Reject** until the proposer fills it.

## 4. Layer Test

- **Core** — visible immediately because it reduces current uncertainty for owner-relax or walker-act.
- **Depth** — useful only after intentional inspection. Not the home surface. Must not be a dumping ground.
- **Support** — backend/system work that stays quiet.
- **Later** — valid idea, wrong time.

If unclear between Core and Depth, classify as Depth and reduce scope.

## 5. Blocking Rules

These are hard blocks. Reject unless human authority explicitly overrides.

- No new top-level screens.
- No tabs added to organize complexity.
- No exposing backend concepts just because they exist.
- Owner UI must not be admin software.
- Walker UI must not require navigation before action.
- Billing must not expand into a finance dashboard.
- Weekly Summary must not become analytics (no charts, trends, comparisons, revenue).
- Scheduling must not become a calendar system.
- Confirmations must not become notification spam.
- No owner guilt nudges.
- No route planning unless explicitly approved.
- No workload dashboards unless explicitly approved.

Each role has one primary home surface. Do not split it.

## 6. Stop Conditions

Stop immediately and return Reject (or escalate to human) if the proposal:

- introduces a top-level screen
- introduces a dashboard for backend state
- expands billing into finance/analytics
- expands Weekly Summary into analytics
- expands scheduling into a calendar
- adds tabs purely to contain complexity
- requires owners to take action to feel safe (guilt nudge)
- requires walkers to navigate before they can act
- silently changes a baseline behavior (Effective Price Model, Reopen rules, Phone gating, Walk finalPrice lock)

## 7. Embedded Test Prompts

Sanity examples. Use to calibrate.

- "Add an analytics tab to the owner home" → **Reject.** New tab, dashboard, owner becomes admin.
- "Show owners walks that are completed but not yet billed" → **Reduce scope or Depth.** Only if it answers a real owner question without becoming a billing console; otherwise demote.
- "Show walkers their planned weekly workload on the home" → **Demote.** Akivot does not manage the week; "what is next" is the only home question.
