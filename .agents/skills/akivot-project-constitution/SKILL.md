---
name: akivot-project-constitution
description: Self-contained Akivot product memory. Use at session startup, before product reasoning, when product context is needed, or when re-orienting after a long gap. Holds identity, Decision DNA, role truths, product layers, current baseline, and strategic direction. Does not contain execution mechanics.
---

# Akivot Project Constitution

## 1. Purpose

Startup orientation and deep product memory. Self-contained: every fact needed to reason about Akivot is embedded here. Do not depend on any deleted context pack or external memory.

Use when:

- starting a session and product context is needed
- evaluating a change against product DNA
- re-orienting after switching tasks
- preparing input for the product enforcer or code executor

Do not use for: implementation steps, code conventions, or build commands.

## 2. Core Identity

Akivot is a peace-of-mind product for dog walking.

It is **not**:

- CRM
- admin dashboard
- logistics system
- management system
- finance dashboard
- calendar system
- route planner
- analytics product

Owners need to relax. Walkers need to act. Everything else is noise.

## 3. Main Principle

```
If the user has to search for information, we failed.
```

Akivot removes repeated uncertainty and answers the human question before the user asks it. It does not become more management.

## 4. Role Truths

Owner question:

```
Is my dog okay, and do I need to do anything now?
```

Walker question:

```
What is next, and what do I do now?
```

Owner UI = quiet glass. Calm, minimal, only what is needed to feel safe.

Walker UI = calm command surface. One clear next action visible without navigation.

## 5. Decision DNA

```
calm over control
clarity over features
certainty over flexibility
less thinking over more information
frontend must feel smaller than the backend
reduce complexity instead of organizing it
if unsure, choose the simpler solution
```

Interpretation:

- Do not solve complexity by adding tabs, dashboards, filters, or new screens.
- Reduce visible product instead.
- When two paths exist, choose the one that asks the user to think less.

## 6. Frontend Philosophy

Frontend must feel smaller than the backend.

The UI translates backend truth into roughly five questions per role. A screen that tries to answer more is doing the backend's job and pushing complexity onto the user.

Backend may be rich. Frontend stays narrow.

## 7. Information Hierarchy / Product Layers

Every product-visible change must be classified.

- **Core** — visible immediately because it reduces current uncertainty.
- **Depth** — useful only after intentional inspection. Not the home surface.
- **Support** — backend/system work that stays quiet.
- **Later** — valid idea, wrong time.

Default posture:

```
Demote or reject unless clearly Core
and clearly reduces immediate uncertainty.
```

Depth is not a dumping ground.

## 8. Current Product Baseline

Do not assume schema details unless verified in code. The following are confirmed product behaviors.

### Effective Price Model

UI must not treat fallback/current price as the real price. Hierarchy:

```
1. accepted pre-start offer
2. active agreement
3. fallback currentPrice
```

### Walk final price

Walk `finalPrice` is locked at walk start. Do not reprice completed walks casually.

### Billing

A billing read model exists. Billing must clarify truth, not become finance software. No revenue analytics, no finance dashboard.

### Phone gating

Phone is not a generic profile field. It is an operational prerequisite for trust and loop closure. Do not expand into "profile completion".

### Weekly Summary

A memory feature, not a finance feature. Reduces reconstruction and disagreement; does not expand billing into analytics.

Rules:

- source of truth = completed walks only
- window = calendar week, Monday to Sunday
- grouped-by-day human-readable list
- no charts, trends, comparisons, revenue analytics, or finance dashboard

### Reopen behavior

A safety valve, not an editing workflow.

Rules:

- `PAID` is final by default
- Reopen is an exception
- only walker can reopen
- owner only sees status
- strict transition: `PAID -> REOPENED -> PAID`
- no direct edit of `PAID`
- no disputes, bidirectional approvals, or version-history UI
- exact REOPENED copy: `חשבון נפתח לתיקון`

The Hebrew copy above is canonical and appears as UTF-8 where needed.

## 9. Strategic Next Direction — Next Walk Confirmation Card

Thesis:

```
Convert the repeated WhatsApp exchange:
"is today on?" -> "yes / no / unsure"
into one shared truth card on existing home surfaces.
```

Constraints:

- no calendar, weekly planning UI, workload dashboard, route planning, or new top-level screen
- existing surfaces only
- walker can mark Waiting / ask for confirmation
- owner can answer Yes / No / Unsure

Shared visible states: Confirmed, Waiting, Not needed.

"No next walk yet" is an empty state, not a workflow state.

MVP constraints:

- manual Waiting first, not automatic
- no push in MVP unless explicitly approved
- no guilt-inducing owner nudges

Boundary:

```
Akivot does not manage the week.
Akivot tells each user what is known next.
```

## 10. Non-Goals

- admin systems
- route management
- billing analytics
- configurable enterprise surfaces
- dashboards of backend state for the user
- top-level screens for every data type
- calendar/scheduling expansion
- analytics dressed as product

## 11. Session Startup Use

When invoked at session start:

1. Load constitution into working context.
2. Identify the layer of the requested task (Core / Depth / Support / Later).
3. State the role emotion in scope (owner relax / walker act).
4. State explicitly what must not be expanded.
5. If implementation is requested, hand off to `akivot-code-executor` with a narrow plan, after `akivot-product-enforcer` has returned Proceed or Reduce.
