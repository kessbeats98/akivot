# Primer — Akivot

## Identity
- Project: Akivot (עקבות)
- Stack: Next.js 16, Neon (Drizzle), Better Auth, Vercel, Resend, Firebase FCM
- Goal: Dog-walking SaaS for Israeli market — owners manage dogs/billing, walkers track walks
- Non-goals: native app, multi-currency, real-time GPS tracking

## Last 3 Completed Tasks
- TASK-19: Role guards on walker/owner dashboard layouts (feat/task-19-role-guards, 2026-04-05)
- BUG-02: Start-walk confirm disabled until dog selected (fix/bug-02, 2026-04-05)
- TASK-18: Real onboarding flow — profile creation wizard (2026-04-03)

## Next 3 Steps
1. TASK-21: Empty states for owner + walker dashboards
2. TASK-20: Owner — add second dog flow
3. Deploy to production

## Open Blockers
[none]

## Active Decisions
[none pending]

## Current Constraint
category: ux
description: "Owner + walker dashboards are empty — no CTA for first action"

## CEO Decisions Log
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
