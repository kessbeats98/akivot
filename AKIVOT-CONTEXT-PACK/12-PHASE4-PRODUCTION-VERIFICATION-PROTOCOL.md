# Phase 4 Production Verification Protocol

## Latest Override (2026-04-14, post-signoff)

This file still contains the older full Phase 4 runbook below. The runbook has now been executed successfully. For continuation work, use this override first.

- Mobile notification signoff must use the **installed PWA path** on phone
- Regular browser-tab testing on mobile is **not a valid signoff path**
- Final installed-PWA verification result is:
  - `V3` PASS -> exactly one notification appears
  - `V4` PASS -> no duplicate notification
  - `V5` PASS -> tapping the notification opens/focuses the installed PWA
- Therefore Phase 4 is **DONE**
- Production now reflects the intended unified-worker architecture:
  - `/sw.js` owns app scope + FCM behavior
  - `/firebase-messaging-sw.js` is shim-only compatibility glue
- Do not restart the seven-scenario runbook unless a new production regression appears

Phase 4 is shipped to production, executed against the installed PWA path, and recorded as DONE.

Production target: `https://akivot.vercel.app`

## Goal

Verify on production that:

- the 30-second grace window behaves correctly (fires after remaining grace, not on every mount)
- `WALK_STARTED` does not fire too early or more than once per walk
- notification copy is Hebrew
- Phase 4 did not introduce undo / cancel-start UI

## Prerequisites

- **Device A** — walker account logged in, browser notifications allowed
- **Device B** — owner account logged in, FCM token already registered, notifications allowed
- Neon SQL editor open against production DB
- A stopwatch or visible clock with second precision
- Use a **fresh walk** for each scenario — do not reuse walk IDs

To find walk IDs during or after a run:

```sql
SELECT id, status, start_time
FROM walks
ORDER BY start_time DESC
LIMIT 5;
```

---

## Scenario 1 — End within 15s

**Goal:** confirm grace suppresses the notification when walk ends quickly.

| Step | Action |
|------|--------|
| 1 | Device A: navigate to `/walker/dashboard` |
| 2 | Tap start walk for any assigned dog |
| 3 | Confirm redirect to `/walker/live` |
| 4 | **Within 15 seconds** of landing: tap "סיים הליכה" → confirm in slide-over |
| 5 | Wait 60 seconds after the walk ends |

**Expected UI:** redirected to `/walker/dashboard` after end  
**Expected notification on Device B:** no `WALK_STARTED` push at any point  
**Pass condition:** Device B receives zero pushes for this walk

---

## Scenario 2 — Stay live > 30s

**Goal:** confirm grace fires exactly once at ~30s.

Note the clock time when the walk starts — call it **T₀**.

| Step | Action |
|------|--------|
| 1 | Device A: start a walk, note T₀ |
| 2 | Remain on `/walker/live` without refreshing |
| 3 | Watch Device B — note time push arrives as **T₁** |
| 4 | After push received, end the walk |

**Expected timing:** T₁ − T₀ ≈ 30s (acceptable window: 25s–40s accounting for network)  
**Expected push on Device B:**
- Title: `הטיול התחיל`
- Body: `הטיול של הכלב שלך התחיל.`

**Pass condition:** exactly one push in the window; copy matches exactly; run Neon SQL check below

---

## Scenario 3 — Refresh at t=10s

**Goal:** confirm remaining-grace logic — push fires ~20s after refresh, not a fresh 30s.

Note T₀ at walk start.

| Step | Action |
|------|--------|
| 1 | Device A: start a walk, note T₀ |
| 2 | At T₀+10s: hard-refresh `/walker/live` (Ctrl+Shift+R / pull-to-refresh) |
| 3 | Confirm page reloads and elapsed timer shows ~10s (not reset to 0) |
| 4 | Remain on page, watch Device B — note push arrival as T₁ |
| 5 | End the walk after push |

**Expected timing:** T₁ − T₀ ≈ 30s total (push fires ~20s after refresh)  
Failure signal: T₁ − T₀ ≈ 40s means the timer restarted from mount rather than using actual `startTime`  
**Pass condition:** push fires at ~T₀+30s regardless of the refresh

---

## Scenario 4 — Refresh after t>30s, walk still LIVE

**Goal:** confirm delivery-log dedupe blocks a duplicate push on refresh.

Run after scenario 2 has already confirmed a SENT row, OR run fresh:

| Step | Action |
|------|--------|
| 1 | Device A: start a walk |
| 2 | Wait until first `WALK_STARTED` push arrives on Device B (~30s) |
| 3 | Wait 5 more seconds (now at ~35s total) |
| 4 | Hard-refresh `/walker/live` |
| 5 | Remain on page for 60 more seconds, watch Device B |
| 6 | End the walk |
| 7 | Run Neon SQL check below |

**Expected:** no second `WALK_STARTED` push received after refresh  
**Pass condition:** Device B receives exactly one `WALK_STARTED` total; SQL confirms single SENT row

---

## Scenario 5 — WALK_STARTED Hebrew copy

Verify during scenario 2 or 4 (whichever produces the first push).

**Expected push content — exact strings:**
- Title: `הטיול התחיל`
- Body: `הטיול של הכלב שלך התחיל.`

Screenshot or record the notification on Device B.  
**Pass condition:** exact string match on both fields

---

## Scenario 6 — WALK_COMPLETED Hebrew copy

| Step | Action |
|------|--------|
| 1 | Device A: start any walk |
| 2 | End the walk (timing irrelevant) |
| 3 | Observe push on Device B |

**Expected push content — exact strings:**
- Title: `הטיול הסתיים`
- Body: `הטיול של הכלב שלך הסתיים.`

**Pass condition:** exact string match on both fields

---

## Scenario 7 — No undo/cancel UI

| Step | Action |
|------|--------|
| 1 | Device A: start a walk, arrive at `/walker/live` |
| 2 | Inspect the full page: topbar, live card, action row |
| 3 | Open the "סיים הליכה" slide-over |
| 4 | Inspect slide-over for any undo / cancel-start / "חזור" / back affordance |
| 5 | Close the slide-over using the slide-over's own close control |

**Note:** the slide-over close control (✕ / swipe-down) is generic panel chrome present before Phase 4. It dismisses the finish confirmation UI — it is **not** a cancel-start affordance and does not undo the walk. Its presence is expected and is not a failure.

**Pass condition:** no new undo, cancel-start, or back-to-dashboard button introduced by Phase 4 anywhere on `/walker/live`

---

## Neon SQL Checks

**After scenario 2 — confirm exactly one SENT row:**

```sql
SELECT id, notification_type, entity_id, status, sent_at, created_at
FROM notification_deliveries
WHERE entity_type = 'WALK'
  AND notification_type = 'WALK_STARTED'
  AND entity_id = '<walk_id_from_scenario_2>'
ORDER BY created_at DESC;
```

Expected: exactly one row, `status = 'SENT'`, `sent_at` ≈ T₀+30s.

**After scenario 4 — confirm no duplicate row after refresh:**

```sql
SELECT id, notification_type, entity_id, status, sent_at, created_at
FROM notification_deliveries
WHERE entity_type = 'WALK'
  AND notification_type = 'WALK_STARTED'
  AND entity_id = '<walk_id_from_scenario_4>'
ORDER BY created_at DESC;
```

Expected: still exactly one row with `status = 'SENT'`. A second row means dedupe failed.

---

## Results Template

Fill in and send back for signoff.

```
Phase 4 — Production Verification Results
Date:
Tester:
Production URL: https://akivot.vercel.app

#: 1
Scenario: End within 15s
Result: PASS | FAIL | BLOCKED
Evidence:
-
-
Residual note:

---

#: 2
Scenario: Stay live > 30s
Result: PASS | FAIL | BLOCKED
Evidence:
- T0 (walk start):
- T1 (push received):
- Delta (T1 - T0):
- Push title observed:
- Push body observed:
- Neon SQL result (row count, status, sent_at):
Residual note:

---

#: 3
Scenario: Refresh at t=10s
Result: PASS | FAIL | BLOCKED
Evidence:
- T0 (walk start):
- Refresh at:
- T1 (push received):
- Delta (T1 - T0):
Residual note:

---

#: 4
Scenario: Refresh after t>30s, walk still LIVE
Result: PASS | FAIL | BLOCKED
Evidence:
- First push received at (T1):
- Refresh performed at:
- Second push received: yes | no
- Wait duration after refresh:
- Neon SQL result (row count after refresh):
Residual note:

---

#: 5
Scenario: WALK_STARTED Hebrew copy
Result: PASS | FAIL | BLOCKED
Evidence:
- Title observed:
- Body observed:
Residual note:

---

#: 6
Scenario: WALK_COMPLETED Hebrew copy
Result: PASS | FAIL | BLOCKED
Evidence:
- Title observed:
- Body observed:
Residual note:

---

#: 7
Scenario: No undo/cancel UI
Result: PASS | FAIL | BLOCKED
Evidence:
-
Residual note:

---

Final:
Production verification verdict: PASS | FAIL | PARTIAL
Blocking failures:
-
Non-blocking residuals:
-
Phase 4 marked DONE: yes | no
```
