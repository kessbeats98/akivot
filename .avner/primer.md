# Primer — Akivot

## Identity
- Project: Akivot (עקבות)
- Stack: Next.js 16, Neon (Drizzle), Better Auth, Vercel, Resend, Firebase FCM
- Goal: Dog-walking SaaS for Israeli market — owners manage dogs/billing, walkers track walks
- Non-goals: native app, multi-currency, real-time GPS tracking

## Last 3 Completed Tasks
- TASK-21: Empty states for owner + walker dashboards — inline add-dog form, informational walker state (2026-04-05)
- TASK-17: Role-based redirect after login — server action approach (2026-04-03)
- TASK-15: Auth UI — login + signup pages using Better Auth client (2026-04-03)

## Next 3 Steps
1. TASK-16: Landing page redesign — replace minimal placeholder with Akivot branding
2. TASK-19: Role guards on dashboard pages
3. Deploy TASK-15 + TASK-17 to production

## Open Blockers
[none]

## Active Decisions
[none pending]

## Current Constraint
category: "quality"
description: "Landing page is minimal placeholder — needs branding before marketing"

## CEO Decisions Log
- task_id: "TASK-21"
  verdict: "GO"
  reasoning: "surgical UX fix, reuses existing write-path, no risk surfaces changed"
  timestamp: "2026-04-05"
- task_id: "TASK-15"
  verdict: "GO"
  reasoning: "unblocks all user-facing features"
  timestamp: "2026-04-03"
