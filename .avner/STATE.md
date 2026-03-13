# Project State — Akivot

Updated: 2026-03-13
Phase: Feature Build
Version: TASK-12-done

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at: TASK-12 ✅ DONE — all 5 V1 blockers resolved, commit `1f86d27`
- Next action: TASK-13 Production Release (`/deploy`)
- Open questions:
  - Production cron schedule pending Vercel Pro upgrade (non-blocker)
- Last commands run:
  - `npx tsc --noEmit` → 0 errors ✓
  - verify-security: GO ✓

---

## Active Work

*(none — TASK-12 complete)*

---

## Backlog

*(no planned tasks — project feature-complete for V1)*

---

## Completed

### ~~TASK-12~~: Polish & V1 Hardening (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-13)
**Commits**: `1f86d27`

All 5 V1 blockers fixed. T1: `minPasswordLength: 8` explicit in Better Auth config. T2: `crypto.timingSafeEqual` replaces plain `!==` for cron secret (SEC-1). T3: `src/app/not-found.tsx` — custom 404, hides framework version (SEC-2). T4/T5: RUNBOOK smoke tests expanded (email verify, password reset, notifications) + staging env checklist expanded to all 18 vars. T6: stub rows deleted from REQUIREMENTS.md + APICONTRACTS.md. tsc 0 errors. verify-security: GO.

### ~~TASK-11~~: Resend Email Integration (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-13)
**Commits**: `3979d35`

`src/lib/email/resend.ts`: lazy `getResend()` factory, `sendVerificationEmail` + `sendPasswordResetEmail` with inline HTML templates, 10s AbortController timeout, log-only on failure (V1). Better Auth stubs in `better-auth.ts` replaced. `RESEND_API_KEY` + `EMAIL_FROM_ADDRESS` added to `.env.example` and Vercel env. R-EML-01, R-EML-02. tsc 0 errors. Build clean. Smoke: verify email received ✓, password reset email received ✓.

### ~~TASK-10~~: Deploy Prep / Post-Secret-Rotation Verification (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-13)
**Commits**: `ed2017c` (F1+F2 fixes)

Migration 0004 applied (nullable `actor_user_id` + `updated_by_user_id`). `drizzle.__drizzle_migrations` row 5 placeholder hash corrected to real SHA-256 (`48870e09…`). Post-rotation smoke: T3-b no-auth → 401 ✓, T3-c correct-auth → 200 `{"closed":0}` ✓. Runtime logs zero errors. Deployment `dpl_9CUuxcJy` READY on commit `ed2017c`. Final GO issued.

### ~~TASK-09~~: Background Jobs (✅ DONE)
**Priority**: P2
**Status**: ✅ DONE (2026-03-12)
**Commits**: `9b73ead`

`autoCloseWalks()` in `walksRepo`: queries LIVE walks past 120-min cutoff (`config.cron.autoCloseMinutes`), closes each in an atomic tx — sets `AUTO_CLOSED` / `AUTO_TIMEOUT` / timestamps, logs `AUTO_CLOSE_WALK` audit with `actorUserId: "system"`. Idempotent via `autoClosedAt IS NULL` guard. `/api/jobs/auto-close` route: `nodejs` runtime, `Authorization: Bearer $CRON_SECRET` guard, returns `{ closed: N }`. `vercel.json` stays `"crons": []` (Hobby plan); production schedule `*/5 * * * *` documented in RUNBOOK.md. tsc 0 errors. Build clean.

### ~~TASK-08~~: Offline / PWA (✅ DONE)
**Priority**: P2
**Status**: ✅ DONE (2026-03-11)
**Commits**: `8b9e987` (T1/T2) · `c2ca2cf` (T3) · `a739b9c` (T4) · `fd5a3d0` (T5) · `e933362` (T6) · `ee4dbc3` (blob fix)

Dexie `AkivotOfflineDB` with `pendingMedia` store + exported constants (`OFFLINE_DB_NAME`, `PENDING_MEDIA_STORE`). `mediaQueue` helpers (enqueue/get/dequeue). Service worker (`src/workers/service-worker.ts`): Cache-First static, Network-First dynamic, background sync tag `"media-upload"` flushes pending items to upload route. `tsconfig.sw.json` with `WebWorker` lib; `src/workers` excluded from root tsc. `scripts/build-sw.mjs` (esbuild, type-check first); `postbuild` wires into `npm run build`. `/api/uploads/walk-media` route (Node.js runtime): auth → walkerProfile → walk LIVE check → Vercel Blob `put` → `walkMedia` row `UPLOADED`. `ServiceWorkerRegistration` client component registered in root layout; `online` event triggers `retryPendingUploads`. Build clean, tsc 0 errors. Runtime smoke: HTTP 200, blob URL returned, Neon `walk_media` row confirmed `upload_status = UPLOADED`. Fix: Blob store requires `access: "private"` — corrected in final commit `ee4dbc3`.

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
| 2026-03-13 | Production | `ed2017c` | ✅ LIVE | TASK-10 — nullable actor/updated_by, fail-closed cron secret; post-rotation GO |
| 2026-03-10 | Staging | `8c78dee` | ✅ LIVE | Billing (TASK-06) — crons disabled for Hobby plan; smoke passed |
