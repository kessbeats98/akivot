---
name: research
description: >
  Pre-build investigation and read-only exploration. Preferred path for grep,
  log reading, docs lookup, and codebase exploration to keep the main execution
  context small and clean.
invocation: manual
model: sonnet
disable-model-invocation: true
---

# /research — Pre-Build Investigation & Read-Only Exploration

## When to use
- Unfamiliar tech stack or API integration
- Uncertain about best approach (multiple viable options)
- Need to validate feasibility before committing to a plan
- Escalated from /new or /core Decisions when gray areas are too large
- **Read-only exploration**: grep, log reading, docs lookup, codebase scanning —
  use /research to keep the main execution session's context small and clean

Not for:
- Known patterns with clear path → skip to /new
- Bugfixes → /fix
- Architecture decisions already made → /core

---

## Protocol
1. Define what to research (max 3 questions):
   - Stack options (what tech to use?)
   - Architecture patterns (how to structure?)
   - Pitfalls (what breaks? what did others get wrong?)

2. Research each area (web search, docs, code examples, existing codebase).
   Use read-only tools: grep, file search, log reading, documentation lookup.
   Do not modify code during /research.

3. Document findings inline in the chat output:
   - Findings per question
   - Recommendation with justification
   - Risks identified

## Context Discipline
Load only the files needed to answer the research questions.
This mode is intentionally read-only — it should not accumulate edit-related context.

---

## Done criteria
- Clear recommendation with justification for each question.
- Risks and trade-offs documented.
- Ready to proceed to /new or /core with informed Decisions.

## Transition
After /research completes → proceed directly to /new or /core (preferably in a fresh session).
Research findings feed into the Decisions section of the next mode.

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
