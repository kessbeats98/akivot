# Requirements — Akivot

## V1 (Must Ship for "Done")
| ID | Requirement | Acceptance Criteria | Priority | Owner | Evidence |
|----|-------------|---------------------|----------|-------|----------|
| R1 | [What]      | [How verified]      | P0       | @name | [Source] |
| R2 |             |                     | P0       |       |          |
| R-OWN-01 | Owner can register a dog | Dog appears in dashboard after submit; name required | P1 | — | TASK-04 |
| R-OWN-02 | Owner can deactivate a dog | isActive=false; dog excluded from list | P1 | — | TASK-04 |
| R-OWN-03 | Owner dashboard lists active dogs | Shows name, breed, assigned walker(s) read-only | P1 | — | TASK-04 |

## V2 (Next Phase)
| ID | Requirement | Notes |
|----|-------------|-------|
| R3 | [What] | Deferred to next sprint |

## Out-of-Scope (Explicit No)
- [What we're NOT doing and why]
- [Common requests we'll reject]
- Hard delete of dogs (preserves walk history)
- Dog edit/update (deferred post-TASK-04)
- Owner-initiated walker assignment (TASK-05)
- Owner billing view (TASK-06)

## Traceability Rule
Every /new and /core Decisions section must reference at least one R-id.
If a task doesn't map to an R-id → HALT (scope creep or missing requirement).
