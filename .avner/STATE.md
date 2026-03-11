# Project State — Akivot

Updated: 2026-03-11
Phase: Feature Build
Version: TASK-07-done

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at: TASK-07 ✅ DONE — full FCM smoke passed. Ready for TASK-08.
- Next action: Push 9 local TASK-07 commits to origin/main, then open fresh session → `/new` TASK-08 (Offline / PWA).
- Open questions:
  - Email service (Resend vs Nodemailer vs stub) — carry-forward, not a blocker.
  - Password min length (8 chars V1) — carry-forward, not a blocker.
- Last commands run:
  - `npm run dev` → token register 200, walk start/end 200 ✓ (2026-03-11)
  - Neon MCP query: notification_deliveries WALK_STARTED=SENT, WALK_COMPLETED=SENT ✓ (2026-03-11)
  - Token invalidation: stale token auto-invalidated, removed from active pool ✓ (2026-03-11)

---

## Active Work

### TASK-08: Offline / PWA (PLANNED)
**Priority**: P2
**Status**: PLANNED (2026-03-08)

Implement Dexie offline DB (`AkivotOfflineDB`), media queue for pending uploads, service worker (`install`/`activate`/`fetch`/`sync`), and walk media upload route to Vercel Blob.

---

## Backlog

### TASK-09: Background Jobs (PLANNED)
**Priority**: P2
**Status**: PLANNED (2026-03-08)

Implement Vercel Cron auto-close handler (`/api/jobs/auto-close`), idempotent elapsed-time check, and `CRON_SECRET` protection. Runs every 5 minutes per `vercel.json`.

---

## Completed

### ~~TASK-07~~: Notifications / FCM (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-11)

R-NOT-01, R-NOT-02. Contracts updated (REQUIREMENTS.md, APICONTRACTS.md). Device Zod schemas, notification service types, notificationsRepo (upsertDevice, invalidateDevice, getActiveDevicesForUser, logDelivery). Firebase Admin lazy singleton (getAdminApp), fcmService (sendToDevice, notifyWalkEvent). `/api/devices/register` route. FCM service worker at `public/firebase-messaging-sw.js` (compat SDK, hardcoded public config). `useFcmToken` hook (permissionState, requestPermission). `EnableNotificationsButton` component (owner + walker dashboards). `walksRepo.startWalk` returns walkId. `notifyWalkEvent` wired fire-and-forget in walker actions. Firebase project: akivot (projectId). tsc 0 errors. Build clean. Smoke: token register SENT ✓, WALK_STARTED SENT ✓, WALK_COMPLETED SENT ✓, stale token TOKEN_INVALID + auto-invalidated ✓.

### ~~TASK-06a~~: Deploy Prep / Release Readiness (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-10)

Atomic steps before first production deploy:
1. Confirm migration apply procedure in RUNBOOK.md
2. Apply pending migration 0003 in non-production environment (`npx drizzle-kit migrate`)
3. Run 12-step billing manual smoke (owner price-set → walks → close & pay → walker read-only)
4. verify-ops preflight
5. verify-security on billing paths (`billingRepo`, `owner/billing/actions`, `walker/billing/actions`)
6. Prepare staging deploy checklist
7. Propose production deploy (TASK-07 or TASK-06a close)

### ~~TASK-06~~: Billing (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-09)

Billing contracts (REQUIREMENTS.md R-BIL-01–04, APICONTRACTS.md), partial unique index migration 0003 (`payment_periods_open_unique_idx`), billing Zod schemas, billing service types, billingRepo (ensureOpenPeriods, getOrCreateOpenPeriod, closePaymentPeriod with CAS + optimistic lock, getPeriodsByOwner, getPeriodsByWalker), owner price-setting (assertDogWalkerOwnership, setDogWalkerPrice, setPriceAction, dashboard set-price form), owner billing actions/page (`/owner/billing`), walker billing actions/page (`/walker/billing`). ILS-only. auditRepo tx type tightened. tsc 0 errors. ESLint 0 new errors.

### ~~TASK-05~~: Walk Lifecycle (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-09)

walksRepo (assignWalker, startWalk, endWalk, queries), auditRepo (logAudit), walk validation, walker dashboard UI + server actions. Walk lifecycle invariants (LIVE uniqueness, state machine, durationMinutes). R-WLK-01–04. tsc 0 errors. Runtime smoke pending .env.local.

### ~~TASK-04~~: Owner Features (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-09) — commit `1711167`

Dogs repo (getDogsByOwner, createDog, deactivateDog, assertDogOwnership), Zod schemas (createDogSchema, deactivateDogSchema), server actions (getOwnerDogsAction, createDogAction, deactivateDogAction), skeleton owner dashboard (list + add form + deactivate). R-OWN-01–03. verify-spec PASS. tsc 0 errors. Runtime smoke pending .env.local.

### ~~TASK-03~~: Auth Implementation (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-08)

Better Auth wired with `drizzleAdapter` (sessions/accounts/verifications tables added). `toNextJsHandler(auth)` replaces 501 stub. `getCurrentUser` + `assertAuthenticated` in `session.ts`. Migration 0002 generated. Email send is console.log stub (wired later). Runtime smoke pending `.env.local`.

### ~~TASK-02~~: DB Schema V1 (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-08)

14 enums, 14 tables, relations. `verify-spec` PASS. `tsc` 0 errors. `drizzle-kit generate` OK.
Tradeoff: `walks.paymentPeriodId` + `paymentEntries.walkId` have no DB FK; integrity enforced in service layer.

### ~~TASK-01~~: Bootstrap Scaffold (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-08)
**Commits**: `0ae8e4b–81516cb`

Next.js 16 + TS + Tailwind + shadcn config, dependencies, lazy DB factory, schema stubs, auth stubs, lib skeleton, App Router scaffold (501 stubs), PWA manifest, git init.

---

## Recent Deploys

| Date | Env | Commit | Status | Notes |
|------|-----|--------|--------|-------|
| 2026-03-10 | Staging | `8c78dee` | ✅ LIVE | Billing (TASK-06) — crons disabled for Hobby plan; smoke passed |
