# Project State — Akivot

Updated: 2026-03-25 (TASK-14 closeout)
Phase: Production — V1 Live
Version: DEPLOY-01-done

> **Status values:** `PLANNED` / `IN PROGRESS` / `REVIEW` / `PAUSED` / `✅ DONE`
> **ID format:** `TASK-XXX` · `BUG-XXX` · `FEAT-XXX` (globally sequential)

---

## Session Continuity (Mini-Handoff)
- Stopped at: TASK-14 complete. qa:smoke 5/5 PASS against preview at commit `2be94f6` on branch `feat/fp-premium-ui`.
- Next action: Review remaining Commit C files (`walker/dashboard/page.tsx`, `useFcmToken.ts`) + `skills-lock.json`, then merge branch to main when ready. Deferred files are uncommitted working-tree debt — not blocking.
- Open questions:
  - Production cron schedule pending Vercel Pro upgrade (non-blocker)
- Last commands run:
  - `BASE_URL=https://akivot-git-feat-fp-premium-ui-kessbeats98s-projects.vercel.app npm run qa:smoke` — 5/5 PASS
  - Last commits: `be44cfb` (qa bypass+fixtures), `a57c1b3` (owner UI), `22369aa` (build fix), `1fb930d` (empty-state testid), `2be94f6` (walker profile error handling)
- Neon wiring discovery: Vercel `DATABASE_URL` → Neon project `quiet-math-53370251`, **staging branch** `br-wispy-hall-agzj0ep9` (`ep-shy-glade-agbknp45`), NOT the `production` branch.
- QA account `qa-smoke@akivot.test` created, `email_verified=true` on staging branch. Credentials in gitignored `qa/.env.qa`.

---

## Active Work

*(none)*

---

## Backlog

*(none)*

---

## Completed

### ~~TASK-14~~: Add API-based globalSetup seed for production-target smoke (✅ DONE)
**Priority**: P2
**Status**: ✅ DONE (2026-03-25)
**Commits**: `be44cfb` (qa bypass+fixtures), `a57c1b3` (owner UI), `22369aa` (build fix), `1fb930d` (empty-state testid), `2be94f6` (walker profile error handling)

`/api/qa/seed` + `/api/qa/reset` endpoints (guarded by `QA_SEED_SECRET` header + session auth). `globalSetup` calls seed after auth — no DebugPanel dependency. Vercel bypass token support added to `playwright.config.ts` and `qa/global-setup.ts`. `qa/compact-reporter.ts` and all `qa/scenarios/*.json` fixtures committed. Walker dashboard error-handling: missing walker profile returns empty state instead of throwing. Owner dashboard redesign synced with 3 new sub-components. qa:smoke **5/5 PASS** against preview `akivot-git-feat-fp-premium-ui-kessbeats98s-projects.vercel.app` at commit `2be94f6`.

---

### ~~TASK-13~~: Make qa:smoke target-configurable (✅ DONE)
**Priority**: P2
**Status**: ✅ DONE (2026-03-25)
**Commits**: `13d0ea8`

`BASE_URL` env support added to `qa/global-setup.ts` and `playwright.config.ts`. `isRemote` check: skips `webServer` block for non-localhost targets. `qa/.env.qa` gitignored credential file created. QA account `qa-smoke@akivot.test` created on the Vercel-backed Neon staging branch (`br-wispy-hall-agzj0ep9`). Auth against production confirmed working (401 resolved). Remaining smoke failure is seed/setup (TASK-14) — not target-config.

Discovery: Vercel `DATABASE_URL` points to the Neon **staging branch**, not the production branch. All future DB operations targeting production Vercel must use `br-wispy-hall-agzj0ep9`.

---

### ~~DEPLOY-01~~: Production Deploy — feat/fp-premium-ui (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-24) — deploy complete; smoke gap recorded

**Commits**: `6df3dd95` (merge PR #2), `48f1b1c5` (build fix: missing useDebugMode.ts)
**Deployment**: `dpl_46DQJyPH8vmmdgvJXTSfRoKQYB6f` → READY @ `akivot.vercel.app`

**DB**: Migration 0005 already applied to production before deploy. Verified: index `walks_live_unique_idx` exists, 0 duplicate LIVE walks.

**Build incident**: `useDebugMode.ts` was untracked — missing from merge commit. Fixed by committing file directly to main (`48f1b1c5`). Second build: READY.

**Manual sanity checks (post-deploy)**:

| # | Check | Method | Result |
|---|-------|--------|--------|
| 1 | App loads, correct title/lang | GET `/` | HTTP 200, `<html lang="he" dir="rtl">`, title "עקבות — Akivot" ✓ |
| 2 | Custom 404 (not framework default) | GET `/nonexistent-route-xyz` | Hebrew "404 — דף לא נמצא", `robots: noindex` ✓ |
| 3 | Auth endpoint live | GET `/api/auth/get-session` | HTTP 200, `null` (no session = correct unauthenticated response) ✓ |
| 4 | Cron endpoint fail-closed | GET `/api/jobs/auto-close` (no auth) | HTTP 401 `{"error":"Unauthorized"}` ✓ |
| 5 | Runtime errors (last 30min) | Vercel runtime logs, level=error/fatal | 0 errors ✓ |
| 6 | DB: no duplicate LIVE walks | Neon production query | 0 rows ✓ |
| 7 | DB: uniqueness index present | Neon production query | `walks_live_unique_idx` exists ✓ |

**Verification gap**: Closed by TASK-13. Auth-target smoke now runs against production. Remaining gap: seed/setup (TASK-14).

**Rollback**: not needed. Previous READY deployment `dpl_DF7QGocL1S8hU8SvodhxB1BFpPAx` available as rollback candidate if needed. DB index is rollback-compatible.

---

### ~~QA-02~~: QA Smoke Gate + Edge Test Layer (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-24)
**Commits**: `655601b` (qa:smoke script + formal gate definition in RUNBOOK), `5ce8c5d` (non-gate edge layer)

Formal QA gate: `npm run qa:smoke` (5 scenarios, serial, self-cleaning). Separate non-gate edge layer: 5 scenarios (refresh-live, end-start-again, offline-recovery, multi-tab, auto-close). Edge uses `[edge,*]` tags, excluded from `qa:smoke`. `655601b` added the qa:smoke script and gate definition. `5ce8c5d` added the edge layer — no product code changes in that commit. 2 consecutive runs green, 0 flakiness.

### ~~BUG-01~~: Break Mode — Edge Case Bugs (✅ DONE)
**Priority**: P1
**Status**: ✅ DONE (2026-03-23)
**Commits**: `52ae624`, `df23787`

6 bugs fixed (2 HIGH, 2 MED, 2 LOW). Migration 0005 partial unique index on walks. See session handoff above for details.

### ~~FEAT-01~~: Dev Test Mode (✅ DONE)
**Priority**: P2
**Status**: ✅ DONE (2026-03-23)
**Commits**: `322b728`

Dev-only test mode in DebugPanel. Granular actions: create dog, assign walker, set price, reset all data. FK-safe cascade delete scoped to current user.

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
| 2026-03-24 | Production | `48f1b1c5` | ✅ LIVE | DEPLOY-01 — feat/fp-premium-ui + build fix; manual checks 7/7 pass; smoke gap (TASK-13) |
| 2026-03-23 | Staging | `322b728` | ✅ Migration 0005 applied | BUG-01 + FEAT-01; index verified, 0 dupes |
| 2026-03-13 | Production | `ed2017c` | ✅ LIVE | TASK-10 — nullable actor/updated_by, fail-closed cron secret; post-rotation GO |
| 2026-03-10 | Staging | `8c78dee` | ✅ LIVE | Billing (TASK-06) — crons disabled for Hobby plan; smoke passed |
