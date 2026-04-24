# Requirements — Akivot

## V1 (Must Ship for "Done")
| ID | Requirement | Acceptance Criteria | Priority | Owner | Evidence |
|----|-------------|---------------------|----------|-------|----------|
| R-OWN-01 | Owner can register a dog | Dog appears in dashboard after submit; name required | P1 | — | TASK-04 |
| R-OWN-02 | Owner can deactivate a dog | isActive=false; dog excluded from list | P1 | — | TASK-04 |
| R-OWN-03 | Owner dashboard lists active dogs | Shows name, breed, assigned walker(s) read-only | P1 | — | TASK-04 |
| R-WLK-01 | Owner can assign a walker to their dog | dogWalkers row created by owner; UNIQUE respected; owner must own the dog | P1 | — | TASK-05 |
| R-WLK-02 | Walker can start a walk for an assigned dog | Walk inserted with status=LIVE; LIVE uniqueness guard; START_WALK audit in same tx | P1 | — | TASK-05 |
| R-WLK-03 | Walker can end a LIVE walk | Walk updated to COMPLETED; durationMinutes computed; END_WALK audit in same tx | P1 | — | TASK-05 |
| R-WLK-04 | Walker dashboard lists assigned dogs and active walks | Active dogWalkers + LIVE walks shown; start/end buttons; no self-assign | P1 | — | TASK-05 |
| R-BIL-01 | Owner can set price on a dog-walker pair | dogWalkers.currentPrice updated; owner must own the dog | P1 | — | TASK-06 |
| R-BIL-02 | Owner can close an open payment period | Walks tagged (same owner-walker pair only), entries inserted, total computed, status=PAID in one tx | P1 | — | TASK-06 |
| R-BIL-03 | Owner billing page lists periods and entries | OPEN period auto-created per active owner-walker pair; entries per period; Close & Pay button | P1 | — | TASK-06 |
| R-BIL-04 | Walker billing page lists periods and totals | Read-only; periods with totalAmount | P1 | — | TASK-06 |
| R-NOT-01 | Owner can receive push notifications | Token registered after permission grant; notification delivered on walk start/complete for dog's owner(s) | P1 | — | TASK-07 |
| R-NOT-02 | Token lifecycle managed | Invalid/expired tokens invalidated in DB; no duplicate tokens per device | P1 | — | TASK-07 |
| R-EML-01 | Verification email sent on sign-up | HTML email delivered via Resend; link expires per Better Auth default (~24h); V1: log-only on send failure | P1 | — | TASK-11 |
| R-EML-02 | Password reset email sent on request | HTML email delivered via Resend; Better Auth built-in rate limiting; V1: log-only on send failure | P1 | — | TASK-11 |

## V2 (Next Phase)
| ID | Requirement | Notes |
|----|-------------|-------|
| — | (no items yet) | — |

## Out-of-Scope (Explicit No)
- Hard delete of any entity — soft-delete/deactivate only (preserves walk/billing history)
- Dog edit/update — deferred to V2
- iOS native app — PWA only, Web Push only
- Real-time chat/messaging between owner and walker
- Payment gateway integration — manual ILS tracking only
- Multi-language support in V1 — Hebrew UI only
- Multi-currency — ILS only
- Walker self-notifications in V1 — owner-only push

## Traceability Rule
Every /new and /core Decisions section must reference at least one R-id.
If a task doesn't map to an R-id → HALT (scope creep or missing requirement).
