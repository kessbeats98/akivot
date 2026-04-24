# Akivot — Product Insights from a Real Owner-Walker Conversation

## Executive Product Verdict

This conversation validates Akivot's core direction.

Owner and walker are not trying to manage a system. They are trying to keep
trust, memory, coordination, and payment clear with as little friction as
possible.

The strongest product lesson:

> Akivot should not manage the week. Akivot should hold what is already known,
> so neither side has to keep asking, remembering, or reconstructing.

Core product sentence:

> Akivot should convert the repeated WhatsApp exchange "is today on?" → "yes / no / unsure" into one shared truth card.

This points to a narrow next product direction:

> **Next Walk Confirmation Card** — one shared card per dog, with three owner-side answers (yes / no / unsure), visible to both owner and walker, on existing home surfaces.

It should not become scheduling, calendar, capacity planning, route planning, workload, or weekly dashboard.

---

## 1. What This Conversation Reveals

The owner-walker relationship is a trust relationship, not a task-management
relationship.

The conversation is made of repeated small moments:

- soft near-future coordination ("tomorrow as usual at 10")
- real-time uncertainty ("is today on?", "are you home?")
- post-fact memory reconstruction ("how many times this week?")
- weekly payment closure (Bit transfer after a manual summary)
- apology and recovery after forgotten updates ("sorry, I forgot to update")
- occasional coordination through a family member (the sister)

Akivot should reduce repeated uncertainty. It should not force a hard planning
model onto a soft human workflow.

### The walker is the active uncertainty-seeker

The walker pings more often than the owner updates. Over 40 days he repeatedly asks:

- "is there a walk this week?"
- "what is the plan tomorrow?"
- "is today covered?"
- "are you home?"

This is the largest-volume pain in the chat. Product implication: the walker
must be able to **create / expose a "waiting for owner answer" state** directly
in the product, instead of sending another WhatsApp ping.

---

## 2. Evidence Map from the Conversation

| Conversation pattern | Product meaning | Product direction |
|---|---|---|
| "Is there a walk this week?" / "What is the plan tomorrow?" | Walker lacks near-future truth. | Show the next known walk; let walker request confirmation. |
| "Does Harley have an arrangement today?" | Walker does not know if the dog is covered. | Confirmed / Waiting / Not needed on a shared card. |
| "Tomorrow as usual at 10" | The real unit is a nearby known walk. | Capture next known time only. |
| "I am not sure if I need you tomorrow, I will update later" | Uncertainty itself is important state. | "Waiting" is first-class. |
| "My sister will update you" | Owner may not be the only coordinator. | Household visibility = Later, not MVP. |
| "Sorry, I forgot to update" | Forgetting is normal. | Absorb forgotten updates. Never shame. |
| "How many times did you take her this week?" | Past truth is manually reconstructed. | Walk history + billing read-model already cover this. |
| "Was Wednesday twice? Was there more?" | Manual summaries cause count disputes. | Generate summaries from actual walks. |
| "Can you send payment by Bit?" | Payment closure is manual. | Billing clarifies what is owed, without finance UI. |

---

## 3. Two Truth Layers

### A. Past Truth — largely solved

Past truth answers: what happened, how many walks, what is owed, was a day
counted once or twice.

Akivot already supports this via:

- walk start/end tracking
- completed walk history
- `finalPrice` locked at walk start
- payment periods and entries (billing read-model)
- adjustment requests for count disputes
- walker and owner billing surfaces

Value: reduces memory disputes, reduces awkward payment wording, gives both
sides confidence the numbers match reality.

### B. Near-Future Truth — the main remaining gap

Near-future truth answers:

- What is the next known walk?
- Is today / tomorrow on?
- Is the walker waiting for an answer?
- Who last confirmed the plan?

The product should not answer "what does the whole week look like?"

It should answer: **what is the next known thing, and is it confirmed?**

---

## 4. Where Akivot Already Fits

- **Walk history** replaces memory-driven reconstruction of the week.
- **Billing read-model** removes the manual weekly summary + Bit-request loop.
- **Effective price model** keeps settlement trust clear.
- **Product philosophy** (less asking, less remembering, more calm / more action clarity) is directly supported by the conversation.

---

## 5. Design Rules (binding)

1. **No guilt-inducing owner nudges.** The conversation shows repeated owner
   apology around forgotten updates ("מחילה שכחתי לעדכן"). Akivot must absorb
   forgotten updates. No reminders, nags, or escalations pointed at the owner.
2. **Walker nudges are acceptable; owner nudges are not.** The walker is the
   active uncertainty-seeker. Let him signal "I am waiting." Do not translate
   that into pressure on the owner.
3. **Owner opens the app to relax. Walker opens the app to act.** If a surface
   makes the owner feel like an admin, it is wrong.
4. **If a feature adds capability but not clarity, demote or reject it.**
5. **Read-model / shared truth / confirmation first.** Heavy workflow last.

---

## 6. Product Opportunities

## Opportunity 1 — Next Walk Confirmation Card

Priority: **Now**

The strongest product opportunity. Replaces the repeated WhatsApp exchange:

> Walker: "is today on?"
> Owner: "yes / no / unsure"

One shared card per dog, visible on existing owner home and walker home. It
shows the nearest known walk and its confirmation state.

### MVP states (minimal)

- **Confirmed** — a nearest walk exists and the owner has answered yes.
- **Waiting** — the walker has asked; the owner has not yet answered.
- **Not needed** — the owner has answered no for the nearest slot.

Empty state (no data yet) is just an empty card, not a fourth workflow state.

### User-facing answers

Owner:

- "Harley's next walk is tomorrow at 10 — confirmed."
- "Daniel is waiting for your answer."
- "Not needed today."

Walker:

- "Next: Harley, tomorrow at 10."
- "Waiting for owner answer."
- "Not needed today."

### Owner action surface

One-tap answers on the card:

- Yes
- No
- Unsure / update later

No forms. No time pickers unless the walker proposed a time. No free text.

### Walker action surface

One tap: "ask for confirmation." This moves the card to **Waiting** and
replaces the WhatsApp ping.

### Smallest data truth

Nearest known future commitment only. Fields to consider during planning:

- dog
- walker
- proposed / agreed time (optional)
- confirmation state (Confirmed / Waiting / Not needed)
- last updated by
- updated at

No recurrence, calendar ranges, route fields, capacity fields, or weekly
planning structures.

### Soft commitments

Soft commitments like "tomorrow at 10" or "as usual at 10" are handled as the
next confirmed-or-waiting item on this card. They are not stored as a recurring
rule, a schedule memory, or a pattern. "Usual" does not become a system concept.

### Smallest UI impact

Reuse existing surfaces:

- owner home
- walker home
- dog card / dog profile only if needed

Do not add a new top-level screen, calendar tab, weekly dashboard, or workload view.

### Product rule

If the solution starts to look like a calendar, it is wrong.

---

## Opportunity 2 — Weekly Summary Generation

Priority: **Next** (below Next Walk Confirmation Card)

The walker repeatedly writes summaries manually:

> "סיכום השבוע: ראשון, שני, שישי"

Akivot can generate a clean summary from completed walks. The billing
read-model already covers part of the past-truth problem; this opportunity is
the surfacing / sharing layer on top of it.

Value: reduces counting mistakes, reduces awkward payment wording, makes
payment closure easier.

Guardrail: memory + settlement feature. Not finance analytics.

Why below Opportunity 1: near-future truth is the bigger current pain. Past
truth is already mostly solved by existing billing work.

---

## Opportunity 3 — Lightweight Household Visibility

Priority: **Later**

A sibling occasionally coordinates ("my sister will update you"). This is real
coordination evidence, but not enough evidence for a full multi-user or
permissions model.

Minimal later direction (when evidence demands it):

- secondary viewer of the confirmation card
- "last confirmed by" context on the card
- optional secondary contact note

Avoid:

- household permissions system
- multi-user admin workflows
- family coordination dashboards
- role hierarchies

The sister works today by using the owner's phone or voice. A full secondary
user model is speculative until real usage demands it.

---

## 7. Now / Next / Later Summary

| Priority | Product move | Why |
|---|---|---|
| Now | Next Walk Confirmation Card | Replaces the most repeated WhatsApp exchange with shared truth. |
| Now | Keep improving completed-walk and billing clarity | Already reducing memory / payment friction. |
| Next | Auto weekly summary from completed walks | Helps settlement; sits on top of billing read-model. |
| Later | Household visibility | Real but low-frequency; defer until evidence demands it. |
| Reject | Calendar / weekly planning UI / workload dashboard / route planner / recurring schedule engine / chat replacement | Different product problem. Contradicts DNA. |

---

## 8. What Akivot Must Not Become

This conversation argues against:

- a weekly calendar system
- a weekly planning UI
- a scheduling / recurring-schedule engine
- a workload or capacity dashboard
- a route planner
- a chat / messaging replacement
- a CRM or admin tool
- a finance dashboard
- a rigid task-management product
- a family permissions / household admin system

The real relationship is flexible, human, and often updated late. A heavy
system would force structure where reality is soft.

---

## 9. Key Product Risks

### Risk 1 — Calendar drift
"Planned walk" language can pull the product toward calendar logic.
Mitigation: use "next walk" and "confirmation," never "schedule."

### Risk 2 — Scope creep from future opportunities
Weekly summary, household visibility, soft-commitment memory are valid but
should not enter the MVP.
Mitigation: hold the Now / Next / Later split; ship Opportunity 1 alone first.

### Risk 3 — Billing becoming finance software
Mitigation: billing stays focused on what happened, what is owed, what is waiting.

### Risk 4 — Owner UI becoming admin software
Mitigation: owner surfaces answer and calm. They never ask the owner to configure.

### Risk 5 — Owner guilt
Mitigation: **no guilt-inducing owner nudges.** Absorb forgotten updates
silently. Waiting state is visible, but never escalates into pressure.

---

## 10. Final Product Thesis

Akivot should not organize the owner's or walker's life.

Akivot should quietly hold the truth they keep reconstructing:

- what is the next known walk, and is it confirmed
- what happened already
- what is owed
- what is waiting for an answer

Akivot should convert the repeated WhatsApp exchange "is today on?" → "yes / no / unsure"
into one shared truth card, and keep everything else out.
