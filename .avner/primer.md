# Primer — Akivot

## Identity
- Project: Akivot (עקבות)
- Stack: Next.js 16, Neon (Drizzle), Better Auth, Vercel, Resend, Firebase FCM
- Goal: Dog-walking SaaS for Israeli market — owners manage dogs/billing, walkers track walks
- Non-goals: native app, multi-currency, real-time GPS tracking

## Last 3 Completed Tasks
- TASK-14: API-based globalSetup seed for production-target smoke (2026-03-25)
- TASK-13: Make qa:smoke target-configurable (2026-03-25)
- DEPLOY-01: Production deploy feat/fp-premium-ui (2026-03-24)

## Next 3 Steps
1. TASK-15: Auth UI (login + signup pages) — unblock real users
2. TASK-16: Landing page redesign — replace Next.js boilerplate
3. TASK-17: Role-based redirect after login

## Open Blockers
- No auth UI — users can't sign up or log in. /login 404s.

## Active Decisions
- TASK-15 chosen as highest priority — smallest change that unblocks real users

## Current Constraint
category: "throughput"
description: "No front door — app has full backend but no auth UI"

## CEO Decisions Log
- task_id: "TASK-15"
  verdict: "GO"
  reasoning: "unblocks all user-facing features"
  timestamp: "2026-04-03"
