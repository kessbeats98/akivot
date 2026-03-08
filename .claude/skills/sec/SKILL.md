---
name: sec
description: >
  Security review or hardening. Use Opus model.
  verify-security leads with adversarial mindset.
invocation: manual
model: opus
disable-model-invocation: true
---

# /sec — Security Review

## When to use
- Auth, session, token, cookie, payment, secret, env, CORS, RBAC changes.
- Multi-tenant authorization changes.
- Billing locks or payment webhook logic.
- Walk lifecycle invariants that touch user data.
- Background jobs handling sensitive data.
- Notifications (FCM) and service worker scope.
- Upload handling and privacy-sensitive operations.
- Pre-deploy for sensitive code paths.
- Proactive hardening sprint.

---

## Decisions
- Scope: which surfaces are being examined?
- Threat model summary: who is the adversary, what do they want?
- Delete First: can this attack surface be removed entirely instead of hardened?
- Context: load only the files within the identified threat scope.

---

## Plan
- Run verify-security subagent.
- Act on NEEDS-MITIGATION findings: Critical first, then Medium.
- Do not touch code outside the identified threat scope.

---

## Execute
- Apply mitigations one at a time.
- Each mitigation: one atomic commit.
- Commit: `sec(scope): mitigation description`

---

## Verify (mandatory — Verification Artifact)

  Commands run:    [exact security tests / scan commands]
  Expected result: [no Critical or High findings]
  Observed result: [actual scan or subagent output]
  Remaining risk:  [accepted Low findings + justification]

---

## Done criteria
- verify-security returns GO.
- No Critical or High findings open.
- All mitigations committed.
- Propose STATE.md mini-handoff update to user.

## Parsing Rules
See `.claude/rules/01-protocol.md` → Parsing Rules (STATE.md).
