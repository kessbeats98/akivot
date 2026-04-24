---
name: ui
description: Create or update .avner/3_contracts/UI_SPEC.md before UI work.
invocation: manual
model: sonnet
---

# /ui — UI Design Contract

Create or update the UI design contract before implementing UI changes.
This ensures all screens have defined states, copy, layout, and pillar compliance.

## Preconditions
- `.avner/1_vision/REQUIREMENTS.md` must exist. If missing, tell the user to run onboarding.
- Run this BEFORE `/new` or `/one-flow` executes UI changes.

## When Invoked

### Step 1: Scope
Ask the user:
- Which feature/task is in scope?
- Which UI surfaces are affected (screens, modals, flows)?

### Step 2: Load Context
- Read `.avner/1_vision/REQUIREMENTS.md` — extract relevant R-ids.
- Read `.avner/2_architecture/ARCHITECTURE.md` — understand component structure.
- Read `.avner/3_contracts/UI_SPEC.md` if it exists — check what's already defined.
- Read `.avner/2_architecture/TECHSTACK.md` — detect component library, design tokens.

### Step 3: Detect Design System State
Check what already exists:
- Component library installed? (shadcn, Radix, MUI, custom)
- Existing spacing/color/typography tokens?
- Tailwind config or CSS variables?

If no design system exists, ask the user about preferences for each:
- Component library choice
- Color palette direction (light/dark, brand colors)
- Typography (system font vs custom)

### Step 4: Build Spec Sections
For each in-scope screen, create or update a section in UI_SPEC.md following this structure:

**Per screen:**
1. **Screen name and description**
2. **Related R-ids** (from REQUIREMENTS.md)
3. **Layout** — zones, hierarchy, key components
4. **States** (all 5 are mandatory):
   - Default
   - Loading (skeleton / spinner / progressive)
   - Error (inline / toast / full-page)
   - Empty (illustration + CTA / minimal text)
   - Disabled (which elements, when)
5. **Copy**:
   - CTAs (verb + object, no generic "Submit")
   - Empty state message (what's missing + how to fix)
   - Error message (what went wrong + what to do)
   - Destructive confirmation (consequence + action)
6. **Components and variants**
7. **Accessibility** — keyboard nav, screen reader, contrast
8. **Responsive** — breakpoints, layout shifts

### Step 5: Validate (6-Pillar Checker)
Before finishing, check the spec against all 6 pillars:

| # | Pillar | Check |
|---|--------|-------|
| 1 | Copywriting | No generic labels ("Submit", "Click here"). All states have copy. |
| 2 | Visuals | Focal point declared. Visual hierarchy clear. Icons have labels. |
| 3 | Color | 60/30/10 split explicit. Accent usage specific and limited. |
| 4 | Typography | Max 4 font sizes. Max 2 font weights. Roles defined. |
| 5 | Spacing | All values multiples of 4. Token scale used consistently. |
| 6 | Experience Design | All 5 states (default/loading/error/empty/disabled) defined per screen. |

If any pillar has gaps, fix them before marking the spec complete.

### Step 6: Write
- Open or create `.avner/3_contracts/UI_SPEC.md`.
- Add or update sections for in-scope screens.
- Ensure clear mapping: R-ids → screens → states.
- Update the Checker Sign-Off section at the bottom.

### Output
Confirm to the user:
- Which screens were added/updated.
- Which R-ids are now covered.
- Any design decisions that need human input (flag as questions).
- Remind: "UI_SPEC is ready. Proceed with /new or /one-flow to implement."
