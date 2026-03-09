# Project State — Akivot

Updated: 2026-03-09
Phase: Feature Build
Version: TASK-06-code-complete

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at: TASK-06 implementation complete (9 commits, T1a–T9). Code verified; migration 0003 not yet applied to a live DB.
- Next action: Apply migration 0003 (`npx drizzle-kit migrate`) once DATABASE_URL is available, then run billing smoke flow. After smoke passes, open TASK-06a (deploy-prep).
- Open questions:
  - DATABASE_URL / .env.local availability — blocks migration apply and all runtime smoke.
  - Email service (Resend vs Nodemailer vs stub) — carry-forward, not a TASK-06 blocker.
  - Password min length (8 chars V1) — carry-forward, not a TASK-06 blocker.
  - Duplicate OPEN-period invariant (`payment_periods_open_unique_idx`) not yet verified in a real DB.
- Last commands run:
  - `npx tsc --noEmit` (0 errors, all tasks)
  - `npx eslint src/lib/repositories/billingRepo.ts ... src/app/walker/billing/` (0 new errors; 1 pre-existing warning in pre-existing code)
  - `git commit` ×9 for T1a–T9

### Completed in this session (TASK-06)
| # | Commit message |
|---|----------------|
| 1 | `feat(billing): partial unique index for OPEN payment periods + contracts` |
| 2 | `fix(audit): tighten tx type from any to Drizzle alias` |
| 3 | `feat(billing): add Zod schemas` |
| 4 | `feat(billing): add billing service types` |
| 5 | `feat(billing): implement billingRepo` |
| 6 | `feat(owner): price-setting on dog-walker pairs` |
| 7 | `feat(owner): owner billing server actions` |
| 8 | `feat(owner): owner billing page` |
| 9 | `feat(walker): walker billing server action` |
| 10 | `feat(walker): walker billing page` |

### Deployment prep prerequisites (before any deploy)
1. `DATABASE_URL` + `.env.local` available
2. `npx drizzle-kit migrate` — apply migration 0003 (`payment_periods_open_unique_idx`)
3. Manual billing smoke (12-step flow from TASK-06 plan)
4. verify-ops preflight
5. verify-security on billing paths
6. RUNBOOK.md migration apply procedure confirmed
7. Staging deploy checklist prepared

---

## Active Work

### TASK-06a: Deploy Prep / Release Readiness (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-09) — blocked on DATABASE_URL / .env.local

Atomic steps before first production deploy:
1. Confirm migration apply procedure in RUNBOOK.md
2. Apply pending migration 0003 in non-production environment (`npx drizzle-kit migrate`)
3. Run 12-step billing manual smoke (owner price-set → walks → close & pay → walker read-only)
4. verify-ops preflight
5. verify-security on billing paths (`billingRepo`, `owner/billing/actions`, `walker/billing/actions`)
6. Prepare staging deploy checklist
7. Propose production deploy (TASK-07 or TASK-06a close)

---

## Backlog

### TASK-07: Notifications / FCM (PLANNED)
**Priority**: P1  
**Status**: PLANNED (2026-03-08)

Implement FCM server-side dispatch (`firebase-admin`), notifications repository, device/FCM token validation, FCM messaging service worker background handler (`fcm-messaging-sw.js`), and notification service types.

### TASK-08: Offline / PWA (PLANNED)
**Priority**: P2  
**Status**: PLANNED (2026-03-08)

Implement Dexie offline DB (`AkivotOfflineDB`), media queue for pending uploads, service worker (`install`/`activate`/`fetch`/`sync`), and walk media upload route to Vercel Blob.

### TASK-09: Background Jobs (PLANNED)
**Priority**: P2  
**Status**: PLANNED (2026-03-08)

Implement Vercel Cron auto-close handler (`/api/jobs/auto-close`), idempotent elapsed-time check, and `CRON_SECRET` protection. Runs every 5 minutes per `vercel.json`.

---

## Completed

### ~~TASK-06~~: Billing (CODE COMPLETE — awaiting env verification)
**Priority**: P1
**Status**: CODE COMPLETE (2026-03-09) — migration 0003 not yet applied; runtime smoke pending .env.local

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
_(none yet)_
