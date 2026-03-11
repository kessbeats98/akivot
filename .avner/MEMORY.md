# AVNER Memory — Akivot
# Auto-loaded at session start. Keep under 200 lines.

## Identity
- Project:       Akivot
- Stack:         Next.js 16 App Router · TypeScript · Tailwind + shadcn/ui · Neon + Drizzle · Better Auth · Firebase Cloud Messaging · Vercel Blob · Dexie/IndexedDB · Service Worker/PWA
- Soul Purpose:  Production-ready multi-tenant walking platform with auth, billing, lifecycle, notifications, offline, jobs, and deploy.
- Current Focus: TASK-07 FCM Notifications

## Non-goals (explicit — what we will NOT do)
- No iOS native app — PWA only, Web Push only
- No real-time chat/messaging between owner and walker
- No payment gateway integration — manual ILS tracking only
- No multi-language support in V1 — Hebrew UI only
- No hard-delete of any entity — soft-delete/deactivate only
- No walker self-notifications in V1 — owner-only push
- No multi-currency — ILS only

## Sensitive Areas
- Auth / session / token / JWT logic (Better Auth)
- Multi-tenant authorization (org/team boundaries, data isolation)
- Billing locks / payment webhooks / subscription state
- Walk lifecycle invariants (data integrity across lifecycle transitions)
- Background jobs / retries (idempotency, failure handling)
- Notifications (FCM tokens, push permissions, payload privacy)
- Uploads / privacy (Vercel Blob, file access controls)
- Service worker scope (cache strategies, offline data, scope boundaries)
- Secrets and environment contracts
- DB schema / migrations (Neon + Drizzle)

## Key Decisions (permanent record)
- [2026-03-08] Next.js 16 over 15: user chose to stay on v16 after create-next-app installed it. All docs aligned.
- [2026-03-08] Database sessions (not JWT): Better Auth configured with drizzle adapter, session stored in DB.
- [2026-03-08] Lazy getDb() factory: no process.env at import time. Build must pass with zero env vars.
- [2026-03-09] ILS-only billing: no multi-currency. currentPrice stored as numeric in dogWalkers.
- [2026-03-09] CAS + optimistic locking for billing: closePaymentPeriod uses lockVersion to prevent concurrent overwrites.
- [2026-03-10] Fire-and-forget notifications: notifyWalkEvent never blocks or rolls back the walk transaction.
- [2026-03-10] User-initiated permission request: "Enable Notifications" button in dashboard, not auto-prompt in layout.

## Lessons (top 3 from last sprint)
- Scaffold task must not implement business logic from later tasks — stubs only
- Never auto-prompt for browser permissions on page load — user-initiated only
- Persist full backlog in STATE.md — never collapse or overwrite other tasks
