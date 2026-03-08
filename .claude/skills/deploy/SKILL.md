---
name: deploy
description: >
  Ship to production. verify-ops leads preflight. verify-security holds veto.
  Mandatory GO/NO-GO gate and Verification Artifact.
invocation: manual
model: sonnet
disable-model-invocation: true
---

# /deploy — Production Deployment

## Pre-flight (mandatory — do not skip)
1. Run verify-ops: env vars, build, migrations, smoke tests, integration points.
   **Fail-closed:** if verify-ops returns no verdict or times out → treat as NO-GO.
2. Run verify-security: GO / NO-GO authority.
   **Fail-closed:** if verify-security returns no verdict or times out → treat as NO-GO.
3. If verify-ops or verify-security returns NO-GO → do not deploy → open /fix or /sec.
4. verify-ops CONDITIONAL-GO: acceptable only with explicit human confirmation.
5. Context: load RUNBOOK.md + .env.example + STATE.md. Do not preload full codebase.

---

## Decisions
- What is being deployed? (feature / fix / hotfix)
- Rollback plan: documented in RUNBOOK.md before deploying.
- Any pending migrations? Are they non-destructive?

---

## Plan

  [ ] verify-ops:      GO / CONDITIONAL-GO / NO-GO
  [ ] verify-security: GO / NEEDS-MITIGATION / NO-GO
  [ ] Deploy to staging
  [ ] Smoke tests (staging) — PASS / FAIL
  [ ] Deploy to production
  [ ] Smoke tests (production) — PASS / FAIL
  [ ] Propose STATE.md + RUNBOOK.md updates to user

---

## Execute
- Deploy to staging first, always.
- Run smoke tests on staging.
- If staging fails → stop → open /fix.
- If staging passes and both Council members GO → deploy to production.

---

## Verify (mandatory — Verification Artifact)

  Commands run:    [exact deploy + smoke test commands]
  Expected result: [critical path smoke test criteria — list them]
  Observed result: [what actually happened in production]
  Remaining risk:  [known gaps, accepted risks post-deploy]
  Release checklist: [confirm deployment matched the planned release items — what shipped, what was held back]

---

## Done criteria
- Staging smoke tests: PASS.
- verify-security: GO.
- Production smoke tests: PASS.
- Propose STATE.md mini-handoff update to user: deploy timestamp + version + what shipped.
- Propose RUNBOOK.md update to user: rollback plan documented.
- Commit: `chore(deploy): v[version] — what shipped`

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
