---
name: akivot-product-enforcer
description: >
  Akivot product guardrail and blocking decision check. Use before every Akivot
  feature, UI, UX, workflow, dashboard, billing, price, new-screen, tab,
  navigation, detail view, UX-affecting refactor, billing/pricing visibility
  change, data-model change surfaced in product behavior, or code change that
  could affect product behavior or complexity.
  This skill classifies the work, protects the owner-relax/walker-act product
  line, blocks feature expansion, and forces the smallest implementation path
  before planning or coding.
---

# Akivot Product Enforcer

Run this before any feature, UI, flow, dashboard, billing, price, navigation, or
code change that affects product behavior.

This skill blocks expansion. It is not advisory.

Default action: Demote or Reject unless the proposal is clearly Core and clearly
reduces immediate uncertainty.

## Required Output

Before implementing, answer exactly:

```text
Product Guardrail Check

Goal:
Layer: Core | Depth | Support | Later
User emotion affected:
Immediate uncertainty reduced:
Next action clarified:
Visible UI complexity impact:
Explicitly not building:
Smallest implementation path:
Decision: Proceed | Reduce scope | Demote | Reject
Reason:
```

## Layer Test

- Core: reduces immediate uncertainty on the main path.
- Depth: useful after the user chooses to inspect.
- Support: helps the system work but should stay quiet.
- Later: valid idea, wrong time.

Depth is not a dumping ground for features. If a feature does not support a clear
real user action or reduce uncertainty after intentional inspection, reject it.

## Blocking Rules

If it adds capability but not immediate clarity, reject it or demote it to Depth
or Later.

Strict rules:
- Avoid new top-level screens by default. Add one only with explicit approval and
  a clear reason tied to the core product promise.
- Do not use tabs or navigation as the default solution to complexity. First
  reduce complexity; add navigation only when clearly justified.
- Do not expose backend concepts just because they exist.
- Do not turn the product into a management system.
- Do not make owner UI feel like admin software.
- Do not make walker UI require navigation before action by default.
- Do not expand billing into a finance dashboard.
- Each role should have one primary home surface. Do not create multiple
  competing top-level views for the same role without explicit justification and
  approval.
- Prefer hiding features in depth rather than expanding the home experience.
- If unsure, choose the simpler solution.

## Role Test

Owner UI must help the owner relax.

Walker UI must help the walker act.

Billing and price UI must answer:
- what applies now
- what is waiting
- what is locked
- what action is needed

If the proposal does not make one of those answers clearer, reduce scope, demote,
or reject.

## Stop Conditions

Stop before planning or coding if the proposal:
- creates a new top-level world
- uses tabs or navigation as a shortcut for unresolved complexity
- makes owners manage the system
- makes walkers navigate before acting by default
- exposes billing internals as finance analytics
- is "nice to have" but does not reduce uncertainty

## Embedded Test Prompts

Prompt A:
"Add an analytics tab to the owner dashboard with billing trends and walker
performance."
Expected: Reject or demote. It expands capability but not calm.

Prompt B:
"Show completed-but-not-billed walks to walkers."
Expected: Proceed only if read-only, contextual, and not a new management surface.

Prompt C:
"Add planned weekly workload."
Expected: Demote or require a truthful planned-work model first. Do not fake it
with UI-only state.
