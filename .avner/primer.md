# Primer — Akivot

## Identity
- Project: Akivot (עקבות)
- Stack: Next.js 16, Neon (Drizzle), Better Auth, Vercel, Resend, Firebase FCM
- Goal: Dog-walking SaaS for Israeli market — owners manage dogs/billing, walkers track walks
- Non-goals: native app, multi-currency, real-time GPS tracking

## Last 3 Completed Tasks
- TASK-21: Empty states for owner + walker dashboards — inline add-dog form, informational walker state (2026-04-05)
- TASK-19: Role guards on walker/owner dashboard layouts (2026-04-05)
- BUG-02: Start-walk confirm disabled until dog selected (2026-04-05)

## Next 3 Steps
1. TASK-16: Landing page redesign — replace placeholder with Akivot branding
2. TASK-20: Owner — add second dog flow
3. Deploy to production

## Open Blockers
[none]

## Active Decisions
[none pending]

## Current Constraint
FREEZE: No code. Founder must complete Cold Walkthrough Part A + Part B.
Document every friction point. Classify A/B/C/D/E. Do not fix anything.
NEXT ACTION: Order 1 — Cold Walkthrough on https://akivot.vercel.app

## CEO Decisions Log
- task_id: "TASK-21"
  verdict: "GO"
  reasoning: "surgical UX fix, reuses existing write-path, no risk surfaces changed"
  timestamp: "2026-04-05"
- task_id: "TASK-18"
  verdict: "GO"
  reasoning: "completes signup→onboarding→dashboard pipeline"
  timestamp: "2026-04-03"
- task_id: "TASK-17"
  verdict: "GO"
  reasoning: "role-based redirect removes hardcoded walker path"
  timestamp: "2026-04-03"
- task_id: "TASK-15"
  verdict: "GO"
  reasoning: "unblocks all user-facing features"
  timestamp: "2026-04-03"
