# Project State — Akivot

Updated: 2026-03-08
Phase:   Architecture
Version: 81516cb

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at:        TASK-01-G complete — initial commit done, dashboard routes fixed
- Next action:       Start TASK-02 (DB schema V1) — implement pgTable definitions in src/db/schema/
- Open questions:    None
- Last commands run: npm run build, git init, git commit (x2)

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
