# Project State — Akivot

Updated: 2026-03-08
Phase:   Architecture
Version: ba053c4

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at:        TASK-01 complete; TASK-02 planning pending.
- Next action:       Draft and/or finalize .avner/REQUIREMENTS.md and .avner/DBSCHEMA.md, then start TASK-02 /core implementation.
- Open questions:
  - Exact columns and nullability for each entity (users, dogs, walks, billing, notifications, audit)
  - Enum values for walk status, billing status, notification type, audit action
  - Multi-tenancy model: does a walker belong to one owner or many? (affects FK shape)
  - Billing: per-walk pricing or monthly subscription? (affects billing table shape)
  - Soft-delete vs. hard-delete policy (deletedAt column or not)
- Last commands run: npm run build; git add .avner/STATE.md; git commit (docs: restore full V1 backlog)

---

## Active Work

_(none)_

---

## Backlog

### TASK-02: DB Schema V1 (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Implement pgTable definitions in src/db/schema/ (_enums, users, dogs, walks, billing, notifications, audit, relations). Activate getDb() factory.

---

### TASK-03: Auth Implementation (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Wire Better Auth with drizzleAdapter, emailAndPassword plugin, email verification, password reset. Replace 501 stub in src/app/api/auth/[...all]/route.ts with live toNextJsHandler(auth). Implement getCurrentUser and assertAuthenticated in session.ts.

---

### TASK-04: Owner Features (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Implement owner dashboard UI and server actions. Implement dogs repository and owner-facing dog management. Wire to DB schema from TASK-02 and auth from TASK-03.

---

### TASK-05: Walk Lifecycle (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Implement walks repository, walk service types and validation, walker dashboard UI and server actions, audit repository. Walk lifecycle invariants (start/end/cancel state machine).

---

### TASK-06: Billing (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Implement billing repository, billing service types, billing validation schemas. Billing locks and subscription state management.

---

### TASK-07: Notifications / FCM (PLANNED)
**Priority**: P1
**Status**: PLANNED (2026-03-08)

Implement FCM server-side dispatch (firebase-admin), notifications repository, device/FCM token validation. FCM messaging service worker background handler (fcm-messaging-sw.js). Notification service types.

---

### TASK-08: Offline / PWA (PLANNED)
**Priority**: P2
**Status**: PLANNED (2026-03-08)

Implement Dexie offline DB (AkivotOfflineDB), media queue (sync pending uploads), service worker (install/activate/fetch/sync). Walk media upload route to Vercel Blob.

---

### TASK-09: Background Jobs (PLANNED)
**Priority**: P2
**Status**: PLANNED (2026-03-08)

Implement Vercel Cron auto-close handler (/api/jobs/auto-close). Idempotent elapsed-time check, CRON_SECRET protection. Fires every 5 min per vercel.json.

---

## Completed

### ~~TASK-01~~: Bootstrap Scaffold (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-08)
**Commits**: 0ae8e4b–81516cb

Next.js 16 + TS + Tailwind + shadcn config, all deps, lazy DB factory, schema stubs, auth stubs, lib skeleton, App Router scaffold (501 stubs), PWA manifest, git init.

---

## Recent Deploys
_(none yet)_
