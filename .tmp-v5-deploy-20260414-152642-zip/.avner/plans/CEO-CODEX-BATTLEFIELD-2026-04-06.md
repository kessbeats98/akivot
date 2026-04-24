# CEO CODEX — AKIVOT BATTLEFIELD EXECUTION PACKET
Date: 2026-04-06

---

## EXECUTIVE REALITY SNAPSHOT

**What it is:**
A production-capable dog-walking PWA. The walk lifecycle (start → timer → end → record), billing period tracking, FCM push notifications, and auth are internally validated. 24 routes, 0 build errors, deployed on Vercel.

**What it is not:**
A business. No real user has completed a walk through the app. No real billing period has been closed by a real owner. No money has moved through the product. The internally validated core loop has never been tested under real field conditions.

**Why it is still not a business:**
- Zero field usage. Zero real walks. Zero real payments.
- Billing is a ledger — owner pays walker offline (cash/bank transfer). No payment processor.
- No walker has been onboarded to real dogs in production.
- No owner has trusted the app enough to rely on it for their dog's safety.
- The core loop has never been stress-tested by a real human under real conditions.

**The current illusion:**
Build completeness is being mistaken for market validation. A clean build and internal smoke tests do not prove a walker will use this app tomorrow. The risk is continued internal building instead of field exposure.

---

## FREEZE LIST (effective immediately)

**Stop all of the following:**

Code:
- Any new feature not on the 14-day plan
- Real-time GPS tracking
- Stripe / payment processor integration
- Offline walk queue for start/end operations
- Walker self-notifications
- Walk photo sharing with owners
- Calendar view improvements

Product:
- Adding new pages or routes
- Onboarding flows, tutorials, help screens
- Multi-tenant expansion
- Any V2 backlog item

Architecture:
- Rate limiting
- DB schema migrations
- New API endpoints
- FK additions

Polish:
- Dark mode, animation, transitions
- Marketing page changes
- Any UI change not tied to a field-observed blocker

**Hebrew notification strings: do not pre-schedule. Fix only if raised by real field use or cold walkthrough evidence.**

---

## BUG / FRICTION TRIAGE LAW

| Class | Definition | Response |
|-------|-----------|----------|
| A | Blocks first use (sign up, login, dashboard) | Fix today. Nothing else until fixed. |
| B | Blocks walk completion (can't start, can't end, timer broken) | Fix today. /fix protocol immediately. |
| C | Blocks owner trust (notification not sent, billing wrong, walk not recorded) | Fix within 24h. Document root cause. |
| D | Blocks billing close (can't close period, wrong amount, locked period) | Fix within 24h. CEO CODEX notified. |
| E | Cosmetic / friction / nice-to-have | Queue. Do not touch during 14-day plan. |

If unsure between A/B/C/D and E → classify up.
If fix touches auth, DB schema, or billing logic → verify-security before merge.
If 2+ Class B bugs in same session → escalate to /core.

**No code may be written before:**
- Order 1 (cold walkthrough) is completed
- Blocker list exists
- All blockers are classified A/B/C/D/E

---

## DELIVERABLE 1 — FOUNDER COMMAND SHEET

```
AKIVOT — 14-DAY BATTLEFIELD COMMANDS
=====================================

RULE: No one may confuse setup friction with core-loop friction. Record them separately.

WEEK 1: FIELD CONTACT

Day 1   DO a cold walkthrough — Part A then Part B (see Scorecard below)
        DO document every friction point with a timestamp
        DO NOT fix anything
        DONE when: written list of blockers exists, each classified A/B/C/D/E

Day 2   Share blocker list with Claude
        Fix Class A and B only (target: 2 hours max)
        DONE when: cold walkthrough completes end-to-end without dev help

Day 3   Identify 1 real dog walker (personal network first)
        Send WhatsApp: plain Hebrew, 5 sentences max, "try it and tell me what breaks"
        Set up their account manually if needed
        DONE when: walker has account, is assigned to a real dog

Day 4   Walker does first real walk (you watch as owner, do NOT help)
        Verify: walk in DB, notification received, billing shows it
        DONE when: walk record exists in DB with correct duration

Day 5   20-min debrief with walker (exact quotes only)
        Fix Class A/B/C blockers from debrief
        DONE when: walker is willing to do 3 more walks this week

Day 6-7 Walker does 3 more walks independently (no prompting)
        Real owner checks notifications and billing if available
        DONE when: 4 total walks recorded, owner can answer "how long was Tuesday's walk?"

WEEK 2: STRESS + BILLING

Day 8   CODEX CHECKPOINT #1 — review all walk records and debrief notes
        No new code until checkpoint returns ADVANCE

Day 9   Owner closes billing period using the app
        Verify total matches wallet reality
        (Founder may simulate owner ONLY if no real owner available — mark evidence as weaker)
        DONE when: period closes, both sides see same number

Day 10  Second walker onboarded using same WhatsApp brief (no changes)
        DONE when: second walker completes first walk within 24h of account creation

Day 11  Both walkers walk concurrently
        Monitor DB for cross-contamination
        DONE when: both walks recorded correctly, no wrong walker/dog

Day 12  Cron decision: keep manual trigger for now (default)
        If walk was left open overnight → trigger manually and confirm auto-close worked
        DONE when: no orphaned LIVE walks exist

Day 13  No pre-scheduled code work.
        Fix only field-observed blockers from Days 4-12.

Day 14  CODEX CHECKPOINT #2 — business birth certificate attempt
        Evidence required: 8+ walks, 1 billing close, unprompted walker usage
```

---

## DELIVERABLE 2 — COLD WALKTHROUGH SCORECARD

**Two separate parts. Do not mix findings.**

---

### PART A — Public signup / login flow
**Instructions:** Open https://akivot.vercel.app in a private/incognito window. Use a brand new email address. No prior setup. Log every friction point. Do not fix anything.

| Step | Action | Time to complete | Friction observed | Class |
|------|--------|-----------------|-------------------|-------|
| A1 | Open app, land on home page | | | |
| A2 | Click sign up, fill form | | | |
| A3 | Check inbox, click verify email | | | |
| A4 | Log in with new credentials | | | |
| A5 | Reach walker dashboard | | | |
| A6 | Understand what to do next (no dog assigned yet) | | | |

**Part A summary:**
- Class A issues found: ___
- Class B issues found: ___
- Would a non-technical person reach the dashboard alone? YES / NO

**CODEX gate:** Any Class A issue in Part A → fix before any real human test. Non-negotiable.

---

### PART B — Core loop flow (pre-assigned walker)
**What founder may pre-configure before Part B:**
- Create a second test account (walker role)
- Assign that account to at least one dog in the owner dashboard
- This setup is valid evidence. It represents a realistic real-world starting point (walker gets an invite or link from owner).
- Do not count any friction from this manual setup as core-loop friction. Log separately.

**Instructions:** Log in as the pre-assigned walker. Perform the walk flow.

| Step | Action | Time to complete | Friction observed | Class |
|------|--------|-----------------|-------------------|-------|
| B1 | Log in as pre-assigned walker | | | |
| B2 | See assigned dog on dashboard | | | |
| B3 | Start a walk | | | |
| B4 | See live timer screen running | | | |
| B5 | End walk (fill required fields) | | | |
| B6 | Return to dashboard, see walk recorded | | | |
| B7 | Open billing page, see walk in period | | | |

**Part B summary:**
- Class B issues found: ___
- Class C issues found: ___
- Time from login to walk started: ___
- Time from walk ended to billing confirmation: ___
- Would a real walker complete this alone? YES / NO

---

**Evidence rules:**
- Part A friction = setup / onboarding friction (valid field evidence)
- Part B friction = core-loop friction (higher priority — fix before field test)
- Pre-configured setup before Part B = valid but label it as founder-assisted setup
- Any walk recorded in the real production DB = valid evidence regardless of who started it

---

## DELIVERABLE 3 — REAL WALKER FIELD TEST SCRIPT (HEBREW)

**WhatsApp message — copy and paste as-is:**

---

היי [שם]

בניתי אפליקציה לסיידרים שמנהלת הליכות ותשלומים.

אני צריך שתנסה אותה ותגיד לי מה לא עובד. 5 דקות בלבד.

כנס לכאן: https://akivot.vercel.app
הירשם בתור סיידר
נסה להתחיל ולסיים הליכה אחת

ספר לי מה היה מבלבל. אין תשובות נכונות.

תודה
[שם]

---

**After the walk — 5 questions to ask (WhatsApp or in person):**

1. היה רגע שלא ידעת מה לעשות? איפה בדיוק?
2. היית סומך על האפליקציה הזו במקום לשלוח ווטסאפ לבעל הכלב שהתחלת ללכת?
3. מה הכי הפריע לך?
4. אם זה עלה 30 שקל בחודש, היית משלם?
5. חיכית למשהו שלא היה שם?

---

**Evidence threshold — record answers exactly:**
- Walker completed walk without help: YES / NO
- Walker would trust app over WhatsApp: YES / NO (quote their words)
- Walker willing to use again unprompted: YES / NO

---

## DELIVERABLE 4 — CEO CODEX CHECKPOINT TEMPLATE

```
═══════════════════════════════════════════════════
CEO CODEX CHECKPOINT [#1 / #2]
Date: ___________
═══════════════════════════════════════════════════

EVIDENCE SUBMITTED:
- Walks completed (real, non-developer): ___
- Walks recorded correctly in DB: ___
- Owner notifications received: ___
- Billing periods closed by real owner: ___
- Walker returned without prompting: YES / NO

WALKER FEEDBACK (exact quotes):
- [quote 1]
- [quote 2]

OWNER FEEDBACK (exact quotes):
- [quote 1]

BLOCKERS FOUND:
- [list with class A/B/C/D/E]

CODEX VERDICT:
[ ] ADVANCE — evidence sufficient, proceed to next phase
[ ] HOLD — evidence insufficient, repeat field week
[ ] CUT SCOPE — too much friction, strip UI
[ ] RETURN TO FIELD — loop works but no retention
[ ] STOP BUILDING — core loop broken or no product-market signal

CRITERIA FOR THIS VERDICT:
___________________________________________

IF ADVANCE — next unlock:
[ ] Checkpoint 2 prep
[ ] Stripe integration approved
[ ] Real-time tracking approved
[ ] (other)
═══════════════════════════════════════════════════
```

---

## METRICS THAT MATTER

**Primary scoreboard:**
> Walks completed by real non-developer walkers in the last 7 days

**Business birth certificate:**
> Owner closes a billing period and pays the walker the exact amount the app showed — without dispute, without calling the walker, without the founder present.

**Track these only:**
- Walks completed / walks started (completion rate, target >95%)
- Walker returns without prompting (binary, per walker per week)
- Billing match rate: app total vs actual payment (target: 100%)
- Time to first walk after account creation (target: <24h)

**Ignore:**
- Page views, session duration, sign-up counts, notification delivery rate, build metrics

---

## FIRST 3 IMMEDIATE ORDERS

**Order 1 (Tomorrow, Founder):**
Do a cold walkthrough of the production app as a brand new walker. Document every friction point with a timestamp and classify each A/B/C/D/E. Do not fix anything.

**Order 2 (After Order 1, Founder + Claude):**
Share the classified blocker list. Fix Class A and B only. Target: 2 hours max. No code touches Class C/D/E yet.

**Order 3 (Within 48 hours, Founder):**
Contact 1 real dog walker from personal network. Use the Hebrew WhatsApp script above. Get them to complete one walk. That is the only metric that matters this week.

---

**Waiting for founder to complete Cold Walkthrough Part A and Part B. No implementation approved yet.**
