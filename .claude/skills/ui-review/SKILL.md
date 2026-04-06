---
name: ui-review
description: Review implemented UI against UI_SPEC and record pillar scores + top fixes.
invocation: manual
model: sonnet
---

# /ui-review — 6-Pillar UI Audit

Retroactive visual audit of implemented UI. Compares code to UI_SPEC.md,
scores 6 pillars, and records findings in UI_REVIEW.md.

## Preconditions
- `.avner/3_contracts/UI_SPEC.md` must exist. If missing, tell the user to run `/ui` first.

## When Invoked

### Step 1: Scope
Ask the user:
- Which screens/flows to audit?
- Provide one of:
  - Screenshots or URLs (if dev server running)
  - Detailed textual description of current UI
  - "Just audit the code" (code-only mode)

### Step 2: Load Spec
- Read `.avner/3_contracts/UI_SPEC.md` — load the design contract for in-scope screens.
- Read `.avner/1_vision/REQUIREMENTS.md` — understand which R-ids apply.

### Step 3: Audit Method

**If screenshots/URLs provided:**
- Compare visual output to spec definitions.
- Check each state (default, loading, error, empty, disabled) visually.

**If code-only mode:**
- Search codebase for UI components related to in-scope screens.
- Grep for patterns indicating issues:
  - Generic labels: `"Submit"`, `"Click here"`, `"OK"`, `"Cancel"` without context
  - Missing states: no loading/error/empty handling in data-fetching components
  - Hardcoded colors: hex values outside the design token system
  - Inconsistent spacing: arbitrary px values not matching the 4px grid
  - Typography violations: inline font-size/font-weight outside the type scale

### Step 4: Score 6 Pillars

Rate each pillar 1–4:
- **1** = Major issues, not shippable
- **2** = Several gaps, needs work
- **3** = Minor polish needed
- **4** = Production-ready

| # | Pillar | What to Check |
|---|--------|---------------|
| 1 | **Copywriting** | Generic labels? Empty/error copy present? CTAs use verb+object? Destructive confirms specific? |
| 2 | **Visuals** | Clear focal point? Visual hierarchy matches spec? Icons have accessible labels? |
| 3 | **Color** | 60/30/10 discipline? Accent used only where specified? No hardcoded colors outside tokens? |
| 4 | **Typography** | ≤4 font sizes? ≤2 weights? Consistent role usage (body/label/heading/display)? |
| 5 | **Spacing** | All values multiples of 4? Token scale used? No arbitrary px values? Grid alignment? |
| 6 | **Experience Design** | All 5 states present? Disabled states handled? Interactions feel intentional? Loading indicators? |

For each pillar, provide:
- Score (1–4)
- Brief rationale (what's good, what's missing)
- Specific file:line references where issues found

### Step 5: Top 3 Fixes
Identify the 3 highest-impact improvements:

| # | Pillar | Description | Related R-ids | Suggested Next Step |
|---|--------|-------------|---------------|---------------------|
| 1 | [pillar] | [what to fix] | [R-ids] | [concrete action] |
| 2 | [pillar] | [what to fix] | [R-ids] | [concrete action] |
| 3 | [pillar] | [what to fix] | [R-ids] | [concrete action] |

### Step 6: Record
Append a new entry to `.avner/4_operations/UI_REVIEW.md`:
- Date and reviewer
- Scope (screens/flows audited)
- 6-pillar scores table with rationale
- Top 3 fixes table
- Remaining risk and tradeoffs

**DNA Safety Rule**: This file is under `.avner/4_operations/`. Show the user the proposed
entry and get approval before writing.

### Step 7: Suggest Tasks
For each of the top 3 fixes, suggest whether to:
- Open as a new task (TASK-XX in STATE.md)
- Bundle into current work
- Defer to backlog with rationale

Map each fix to the relevant R-ids from REQUIREMENTS.md.
