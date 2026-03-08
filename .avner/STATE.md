# Project State — Akivot

Updated: 2026-03-08
Phase: Architecture
Version: TASK-02-complete

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at: TASK-03 committed. DBSCHEMA.md updated with sessions/accounts/verifications.
- Next action: Start TASK-04 — Owner Features.
- Open questions:
  - Email service for verify/reset: Resend, Nodemailer, or keep console.log stub and add to backlog? (currently stubbed)
  - Password min length: Better Auth default is 8 chars — acceptable for V1?
  - DBSCHEMA.md needs updating to document `sessions`, `accounts`, `verifications` tables (flagged by verify-spec).
  - Accepted tradeoff (carry-forward): `walks.paymentPeriodId` and `paymentEntries.walkId` have no DB-level FK; integrity enforced in service layer.
- Last commands run: `npx drizzle-kit generate` (17 tables, migration 0002 generated); `npx tsc --noEmit` (0 errors); `verify-spec` (PASS)

---

## Active Work

_(none — TASK-04 not yet started)_

---

## Backlog

### TASK-04: Owner Features (PLANNED)
**Priority**: P1  
**Status**: PLANNED (2026-03-08)

Implement owner dashboard UI and server actions. Implement dogs repository and owner-facing dog management. Wire to DB schema from TASK-02 and auth from TASK-03.

### TASK-05: Walk Lifecycle (PLANNED)
**Priority**: P1  
**Status**: PLANNED (2026-03-08)

Implement walks repository, walk service types and validation, walker dashboard UI and server actions, audit repository. Walk lifecycle invariants (start/end/cancel state machine).

### TASK-06: Billing (PLANNED)
**Priority**: P1  
**Status**: PLANNED (2026-03-08)

Implement billing repository, billing service types, billing validation schemas. Billing locks and subscription state management.

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
