# Runbook — Akivot

## Migration Apply Procedure

Run after every new migration file is added (e.g. migration 0003).

**Prerequisites:** `DATABASE_URL` set in `.env.local` or shell env.

```bash
# From avner-lite/
npx drizzle-kit migrate
```

Expected output: `[✓] Applying migration 0003_open_period_unique` (or similar).

**Verify migration 0003 applied (partial unique index):**
```sql
-- Run in Neon SQL editor or psql:
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'payment_periods'
  AND indexname = 'payment_periods_open_unique_idx';
```
Expected: one row with `WHERE (status = 'OPEN')` in `indexdef`.

**Rollback migration 0003:**
```sql
DROP INDEX IF EXISTS "payment_periods_open_unique_idx";
```

---

## Staging Deploy Checklist (TASK-06a)

### Environment prerequisites (must confirm before deploy)
- [ ] Vercel staging env has `DATABASE_URL` pointing to a dedicated Neon branch (not prod/shared DB)
- [ ] `CRON_SECRET` set in Vercel staging + prod env vars (required — `/api/jobs/auto-close` is now live as of TASK-09)
  - Production cron schedule: `*/5 * * * *` (requires Vercel Pro plan — Hobby rejects sub-hourly intervals)
  - `vercel.json` keeps `"crons": []` until plan upgrade; trigger manually via:
    `curl -H "Authorization: Bearer $CRON_SECRET" https://<host>/api/jobs/auto-close`
- [ ] `BETTER_AUTH_SECRET` set in Vercel staging env
- [ ] `NEXT_PUBLIC_APP_URL` set in Vercel staging env

### Pre-deploy gates
1. Migration apply: all pending migrations applied in staging DB (`npx drizzle-kit migrate`)
2. `npx tsc --noEmit` → 0 errors ✓ (re-confirmed 2026-03-12, TASK-09)
3. `npx eslint src/` → 0 errors ✓ (confirmed 2026-03-10, 3 pre-existing warnings accepted)
4. verify-ops: CONDITIONAL-GO → conditions resolved ✓
5. verify-security: GO ✓
6. 12-step billing smoke: PASSED ✓ (2026-03-10)
7. **Cron constraint:** `vercel.json` keeps `"crons": []` — production cron `*/5 * * * *` requires Vercel Pro plan. Enable when plan upgraded. Until then trigger manually (see env prereqs above).

### Deploy steps
7. Deploy to staging (Vercel preview) → smoke tests PASS
8. Deploy to production (Vercel) → smoke tests PASS
9. Update STATE.md with deploy timestamp + version (with user approval)

---

## Deploy Checklist (generic)
1. Migration apply: all pending migrations applied in staging DB
2. verify-ops: GO
3. verify-security: GO
4. Deploy to staging (Vercel preview) → smoke tests PASS
5. Deploy to production (Vercel) → smoke tests PASS
6. Update STATE.md with deploy timestamp + version (with user approval)

## Rollback Procedure
1. Identify last stable version from STATE.md → Recent Deploys.
2. Revert in Vercel dashboard or `git revert` + push.
3. Verify: smoke tests on rolled-back version.
4. Open /fix to address the issue before re-deploying.
5. Document incident in LESSONS.md (with user approval).

## Smoke Tests (Critical Paths)

### Auth
- [ ] Sign up → sign in → sign out

### Walk lifecycle
- [ ] Walker assigned to dog → starts walk → ends walk → status=COMPLETED

### Billing (12-step, TASK-06)
- [ ] 1. Owner assigns walker; sets price → `dogWalkers.currentPrice` updated in DB
- [ ] 2. Walker starts + ends walk → `walks.status=COMPLETED`, `paymentPeriodId IS NULL`
- [ ] 3. Owner visits `/owner/billing` → OPEN period auto-created; "No walks yet" shown
- [ ] 4. Owner clicks "Close & Pay" → entries inserted, `walks.paymentPeriodId` set, `status=PAID`, `totalAmount` correct
- [ ] 5. Walker visits `/walker/billing` → sees same period read-only
- [ ] 6. Owner visits `/owner/billing` again → new OPEN period auto-created for next cycle
- [ ] 7. Non-owner calls closePeriodAction for another owner's period → "Forbidden"
- [ ] 8. Owner closes already-PAID period → "Period not open"
- [ ] 9. Concurrent close (stale lockVersion) → "Conflict"
- [ ] 10. `auditLogs` row for `CLOSE_PAYMENT_PERIOD` exists after step 4
- [ ] 11. Walker with no walkerProfile hits `/walker/billing` → "Walker profile not found"
- [ ] 12. Attempt to INSERT two OPEN periods for same `(ownerUserId, walkerProfileId)` → DB unique constraint violation on `payment_periods_open_unique_idx`

### Offline / PWA
- [ ] PWA loads and syncs after reconnect

### Auto-close cron (TASK-09)
- [ ] `curl -X GET https://<staging-host>/api/jobs/auto-close` → `401 {"error":"Unauthorized"}` (no auth)
- [ ] `curl -X GET -H "Authorization: Bearer $CRON_SECRET" https://<staging-host>/api/jobs/auto-close` → `200 {"closed":0}`
- [ ] (optional) Seed stale LIVE walk (`start_time = NOW() - INTERVAL '3 hours'`) via Neon MCP → route returns `{"closed":1}` → re-run returns `{"closed":0}` (idempotency)

## CI/CD
- Platform: Vercel
- Preview deploys: automatic on PR
- Production deploy: main branch or manual promote
- Environment: [staging URL] / [production URL]

## Backup & Recovery
- Database: Neon point-in-time recovery
- Blob storage: Vercel Blob (check retention policy)
- Restore procedure: [steps to restore from backup]

## Emergency Access
- [Who to call and how to access prod logs, DB, infra]

---

## V2 / Carry-Forward Backlog (non-blocking)

From verify-security (TASK-06a, 2026-03-10):
- **LOW** — Validation order in `closePeriodAction`: `assertPeriodOwnership` fires before Zod parse. Malformed `periodId` wastes a DB round-trip. Fix: swap order (parse → ownership check).
- **MEDIUM** — No rate limiting on billing server actions. Not exploitable due to CAS + ownership checks, but should be addressed before V2 high-volume scenarios.
- **LOW** — `getOrCreateOpenPeriod` catch block matches error by index name string (`"payment_periods_open_unique_idx"`). Fragile if index renamed. Fix: match on Postgres error code `23505` instead.

From verify-ops (TASK-06a, 2026-03-10):
- `getDb()` creates a new Pool on every call — no connection reuse across requests. Acceptable for Neon serverless; revisit before high-traffic scale.
- `/api/jobs/auto-close` was a 501 stub — resolved by TASK-09 (commit `9b73ead`).
