# Akivot — PM Execution Spec (V1.1 Focus)

## Product Intent
Akivot should feel like a calm, trustworthy, home-led product, not an administrative system.

Two core principles:

- Owner opens the app to feel reassured
- Walker opens the app to take the next action immediately

Everything else must support those two loops without competing with them.

## 1. Core Product Loops

### 1.1 Owner Setup Loop
Goal:

- take a new owner from "I signed up" to "the system is working for me"

Required flow:

1. sign up / verify
2. add dog
3. assign walker
4. set price
5. optional: set routine
6. return to calm owner home

Product decision:

Setup is not complete until:

- a dog exists
- a walker is assigned
- a price is set

Routine is optional and should not block activation.

UX outcome:

The owner should feel:

- "This is set up"
- "I know who is walking my dog"
- "I know what I'm paying"
- "I can now just check the app when needed"

### 1.2 Walker Daily Loop
Goal:

- let the walker open the app and immediately know what to do next

Required flow:

1. open walker home
2. see the next relevant dog / walk
3. start walk with minimal friction
4. enter live walk mode
5. end walk cleanly
6. return to ready state

Product decision:

Walker home is action-first, not management-first.

Rules:

- if one dog is ready -> direct start
- if several are available -> chooser only when needed
- if a walk is active -> live state becomes primary

UX outcome:

The walker should feel:

- "I know what to do now"
- "I don't need to browse"
- "The app stays out of my way"

## 2. Surface Hierarchy

### 2.1 Home Surfaces
Owner Home should answer:

- Is my dog okay?
- Is there an active walk?
- Do I need to do anything now?

Walker Home should answer:

- What is my next action?
- Is a walk active right now?
- What do I do next?

### 2.2 Depth Surfaces
These exist, but must not compete with Home:

- Dogs
- Calendar / Schedule
- Billing
- Settings
- History

Product decision:

- these are secondary surfaces, not the main product experience

## 3. Notifications Policy

### Default owner notifications
Allowed by default:

- Walk started
- Walk completed

Not default in V1:

- delay notifications
- auto-close push notifications
- extra operational alerts

Product decision:

- notifications must increase certainty, not noise

UX outcome:

The owner should feel:

- "I know what happened"

not:

- "why is the app messaging me so much?"

## 4. Schedule / Routine
Product decision:

- schedule is real, but it is not the center of the product

It should:

- support setup
- support planning
- support deeper management

It should not dominate Home.

V1.1 behavior:

- routine may be set during setup
- calendar exists as depth
- home remains present-tense and state-driven

## 5. Price / Billing
Product decision:

- price is a required setup input
- billing is not a daily core loop

Rules:

- owner must set price after walker assignment
- price should be visible where relevant
- billing remains a secondary surface

UX outcome:

- the product should feel financially clear, without becoming an accounting tool

## 6. Accidental Start / 30s Grace Window
Product decision:

- the first 30 seconds are treated as a quiet correction window

Meaning:

- owner is not notified immediately
- walker is not shown a dramatic error state
- short accidental starts are absorbed silently where possible

UX outcome:

- trust is protected without introducing extra complexity

## 7. Feature Scope Rules

### What belongs in V1.1 core

- owner setup completion
- walker action-first home
- clear state-driven home screens
- started/completed notifications
- price required in setup

### What stays secondary

- calendar depth
- billing depth
- dog management depth
- history browsing
- advanced notification settings

### What should not be expanded right now

- CRM-like dashboarding
- management-heavy navigation
- operational noise on home
- extra alerts by default

## 8. Immediate Implementation Priorities

### Priority A — Owner Setup Completion
Implement a guided owner setup sequence:

1. add dog
2. assign walker
3. set price
4. optional routine
5. return home

### Priority B — Walker Home Discipline
Refine walker home to ensure:

- one clear next action
- no unnecessary browsing
- active walk state always wins

### Priority C — Notification Default Policy
Lock V1 defaults to:

- started
- completed
- nothing extra

## 9. Success Criteria
Owner side is successful when:

- a new owner can finish setup without confusion
- home feels calm and informative
- the app answers "is my dog okay?" quickly

Walker side is successful when:

- the walker can act immediately from home
- live walk flow is stable and obvious
- ending a walk returns them to a clear ready state

Product is successful when:

- Home feels like certainty
- Depth feels optional
- The app does not feel like admin software

## 10. PM Guardrail
When evaluating any new change, ask:

- Does this strengthen the owner reassurance loop?
- Does this strengthen the walker action loop?
- Does this belong on Home, or should it stay in depth?
- Does this reduce trust or increase noise?
- Are we making the product calmer, or more administrative?

If the answer trends toward "more administrative," it should not enter the core loop.

## 18. V1.1 Locked Decisions - Final

This section overrides earlier open-question framing. These are the currently locked V1.1 product decisions.

### Owner Setup

- owner setup does not fully hard-block the app
- owner home must clearly show when setup is incomplete
- setup complete = Dog + Walker + Price
- routine is optional
- if dog exists but no walker -> the next action is `Assign walker`
- if walker exists but no price -> setup is still incomplete in a visible way
- multiple incomplete dogs are allowed, but the product should lead the owner to finish one dog's setup before moving to the next

### Price Rules

- price is mandatory before the first real walk
- no price = no first walk
- if price is `0.00`, start walk is blocked quietly and clearly
- missing price should be visible in both places:
  - owner home as next action
  - walker home as blocked pre-start state
- walker sees price before start, but it stays low emphasis
- owner may change price during an active assignment
- changed price applies only to future walks
- changed price does not alter the current live walk

### Walker Home

- walker home remains action-first, not management-first
- if one dog is ready -> direct start
- if several are available -> chooser only when needed
- if a walk is active -> live state becomes primary
- walker home should always present one primary dog
- `Next up` may be explicit when several dogs exist
- queue awareness should stay light and not feel like a dispatch board
- the primary object may show:
  - dog
  - owner
  - scheduled time, if it exists
  - price as low-emphasis context

### Walker Start / Live

- V1.1 supports only:
  - start
  - end
- there is no formal cancel-after-start flow in V1.1
- the first 30 seconds are a quiet correction window
- during that window:
  - owner is not notified
  - walker is not shown dramatic error UX
  - short accidental starts are absorbed silently
- do not add a visible undo / cancel-start affordance in V1.1
- do not show explicit "owner was not notified" messaging to the walker
- sub-30-second starts are treated internally as accidental, not as a separate user-facing mode

### Multi-Dog Order

- chooser order should follow:
  - schedule order if schedule exists
  - otherwise assigned order
- do not use last-used order

### Notifications

- default owner notifications in V1.1:
  - walk started
  - walk completed
- not default in V1.1:
  - auto-close push
  - delayed / missed push
  - extra operational alerts
- auto-close should appear as state in the app, not push, in V1.1
- delayed / missed logic stays out of V1.1
- walker should not receive operational notifications in V1.1
- do not expose notification delivery confidence to users unless something clearly breaks

### Schedule / Calendar

- schedule is real, but it does not define the product
- schedule may support the walker's `what's next` ordering if it exists
- calendar remains depth
- the product can still be complete in V1.1 even with no schedule at all
- minimum schedule-related states needed in V1.1:
  - scheduled, if schedule exists
  - active
  - completed
  - cancelled
- not required in V1.1:
  - delayed
  - paused
- if delayed appears, it should be gentle, not loud

### Owner Home

- owner home = reassurance + next action
- owner must be able to understand:
  - whether a walk is active now
  - who the walker is
  - what the next action is if setup is incomplete
  - one central dog state
- keep off home:
  - billing detail
  - full history browsing
  - calendar depth
  - advanced management
- history is depth, not core reassurance
- billing hint appears on home only when there is a real action
- with multiple dogs, owner home should default to one central subject, not a wide heavy overview

### Dog / Assignment Model

- V1.1 assumes one active walker per dog
- assignment is persistent by default
- owner should see distinct states for:
  - no walker
  - no price
  - routine optional only
- walker invite code is a setup mechanism, not a permanent product object
- owner may replace a walker without rebuilding the full setup
- if walker changes, price must be set again

### Billing / Money Language

- V1.1 money model should be understood mainly as price per walk
- do not center V1.1 around:
  - adjustments
  - overrides
  - final-price complexity
- walker earnings summary remains depth
- billing period is mostly internal structure
- money language should stay calm and clear, not harsh or accounting-heavy

### V1.1 Core

- owner setup completion
- walker action-first home
- clear state-driven home screens
- started / completed notifications
- price required in setup

### What Stays Secondary

- calendar depth
- billing depth
- dog management depth
- history browsing
- advanced notification settings

### What Should Not Expand Now

- CRM-like dashboarding
- management-heavy navigation
- operational noise on home
- extra alerts by default
- multi-walker active model
- advanced billing language

### Real Launch Blockers

- no real owner setup completion path
- walker cannot start / end reliably
- owner home does not produce calm reassurance

### What Can Be Deferred

- routine-first scheduling
- advanced billing language
- delayed / missed notification logic
- multi-walker model
- rich history on home

### Non-Negotiable Loyalty Test

Akivot is not loyal to itself unless:

- owner setup does not close before Dog + Walker + Price
- walker home leads to one clear action
- owner home gives calm reassurance

If you want to go deeper after this spec, the next useful layer is a screen-by-screen PM spec for:

- owner home
- owner setup
- walker home
- walker live
- schedule / calendar depth
- billing depth
