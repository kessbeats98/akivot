# Runbook — Akivot

## Deploy Checklist
1. verify-ops: GO
2. verify-security: GO
3. Deploy to staging (Vercel preview) → smoke tests PASS
4. Deploy to production (Vercel) → smoke tests PASS
5. Update STATE.md with deploy timestamp + version (with user approval)

## Rollback Procedure
1. Identify last stable version from STATE.md → Recent Deploys.
2. Revert in Vercel dashboard or `git revert` + push.
3. Verify: smoke tests on rolled-back version.
4. Open /fix to address the issue before re-deploying.
5. Document incident in LESSONS.md (with user approval).

## Smoke Tests (Critical Paths)
- [ ] Auth: sign up → sign in → sign out
- [ ] Multi-tenant: user sees only own org data
- [ ] Walk lifecycle: create → start → complete
- [ ] Billing: subscription status gates features correctly
- [ ] Offline: PWA loads and syncs after reconnect

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
