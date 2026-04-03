# Primer — Akivot

## Identity
- Project: Akivot (עקבות)
- Stack: Next.js 16, Neon (Drizzle), Better Auth, Vercel, Resend, Firebase FCM
- Goal: Dog-walking SaaS for Israeli market — owners manage dogs/billing, walkers track walks
- Non-goals: native app, multi-currency, real-time GPS tracking

## Last 3 Completed Tasks
- TASK-17: Role-based redirect after login — server action approach (2026-04-03)
- TASK-15: Auth UI — login + signup pages using Better Auth client (2026-04-03)
- TASK-14: API-based globalSetup seed for production-target smoke (2026-03-25)

## Next 3 Steps
1. TASK-18: Real onboarding flow — replace placeholder with profile creation wizard
2. TASK-16: Landing page redesign — replace minimal placeholder with Akivot branding
3. TASK-19: Role guards on dashboard pages

## Open Blockers
- Fresh users land on /onboarding but can't create profiles — placeholder only

## Active Decisions
- TASK-18 chosen over TASK-16 — onboarding is a harder blocker than landing page

## Current Constraint
category: "throughput"
description: "Fresh users can sign up but can't onboard — no profile creation flow"

## CEO Decisions Log
- task_id: "TASK-18"
  verdict: "GO"
  reasoning: "unblocks fresh user onboarding, completes auth→dashboard pipeline"
  timestamp: "2026-04-03"
- task_id: "TASK-15"
  verdict: "GO"
  reasoning: "unblocks all user-facing features"
  timestamp: "2026-04-03"
