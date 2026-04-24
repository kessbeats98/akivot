# Akivot Product Master Roadmap

## Purpose
This roadmap takes over from the current UI cleanup plan and turns it into a full product-direction document grounded in the codebase as it exists now.

It is based on direct inspection of the current application structure, routes, layouts, and core role flows in:

- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/onboarding/OnboardingWizard.tsx`
- `src/app/owner/**`
- `src/app/walker/**`
- `src/components/layout/owner-nav.tsx`
- `src/components/layout/bottom-nav.tsx`

The goal is not incremental UI polish.

The goal is to turn Akivot into the product we are actually aiming for:

- quiet
- immediate
- human
- obvious
- low-friction
- trust-building
- impossible to get lost in

## Product Truth
Akivot should not feel like:

- a dashboard system
- a CRM
- a management interface
- a records tool the user has to understand

Akivot should feel like:

- "I know what is happening"
- "I know what to do now"
- "I do not need to think about the structure"
- "the app is working for me, not asking me to manage it"

That applies differently to each role:

- Owner: "Is my dog okay, and do I need to do anything now?"
- Walker: "What is next, and what do I do right now?"

Everything in this roadmap serves that standard.

## Verified Current Build
### App Shell
- `src/app/layout.tsx` wraps the whole app in a mobile-width shell: `max-w-md mx-auto`.
- App language and direction are already correct for the target experience: `lang="he"` and `dir="rtl"`.
- The visual shell already assumes a focused mobile product, which is the right foundation.

### Auth and Entry Routes
- Public landing page: `src/app/page.tsx`
- Login: `src/app/login/page.tsx`
- Signup: `src/app/signup/page.tsx`
- Verify email: `src/app/verify-email/page.tsx`
- Onboarding: `src/app/onboarding/page.tsx` and `src/app/onboarding/OnboardingWizard.tsx`

Current issue:
- the public layer still introduces Akivot as a dog-walking management platform rather than a certainty/trust product.

### Owner Area
- Guarded by `src/app/owner/layout.tsx`
- Global owner nav comes from `src/components/layout/owner-nav.tsx`

Current owner routes:
- `/owner/dashboard`
- `/owner/dogs`
- `/owner/dog-profile/[dogId]`
- `/owner/billing`
- `/owner/calendar`
- `/owner/settings`

Current owner reality:
- `owner/dashboard` already contains the best product bones:
  - selected dog
  - live status
  - last completed walk
  - history preview
  - empty-state add-dog flow
- `owner/dogs` duplicates management that the dashboard could absorb
- `owner/dog-profile/[dogId]` is overloaded with editing, assignment, stats, media, diary, and history
- `owner/billing` and `owner/calendar` are more archival/secondary than primary-loop destinations

### Walker Area
- Guarded by `src/app/walker/layout.tsx`
- Global walker nav comes from `src/components/layout/bottom-nav.tsx`

Current walker routes:
- `/walker/dashboard`
- `/walker/live`
- `/walker/dogs`
- `/walker/billing`
- `/walker/calendar`

Current walker reality:
- `walker/dashboard` contains the real operational start of the product
- `walker/live` is the strongest aligned screen in the app
- `walker/dashboard` also renders its own local bottom nav
- `walker/live` also renders its own local bottom nav
- this creates duplicated navigation language and breaks confidence
- start-walk flow is still more indirect than it should be

### Important Structural Observation
There are additional walker UI components under `src/components/walker/*` and `src/components/walks/*`, but route inspection shows the current active route tree does not import them. They should be treated as legacy/prototype assets until deliberately reused or removed.

## Leadership Rules
If I were leading the project from this point, I would run it with these rules:

1. No feature gets added unless it reduces thinking.
2. No page stays top-level unless it belongs to the daily core loop.
3. No user should need to understand the information architecture.
4. The home screen for each role must answer the role's main question in under two seconds.
5. Any screen that exists only because "we already built it" is a candidate for merge, demotion, or deletion.
6. We do not solve structural confusion with more copy, more decoration, or more components.

## Phase 1: Structural Cleanup
### Objective
Stop the product from exposing unnecessary internal structure.

### Outcome
One clear home per role. One navigation language per role. Fewer competing destinations.

### Scope
This phase builds directly on the existing UI cleanup plan and should happen first.

### Owner
- Make `/owner/dashboard` the clear primary owner home.
- Add `Home` to `src/components/layout/owner-nav.tsx`.
- Remove `Dogs` from owner top-level navigation.
- Keep `/owner/dogs` reachable as a depth screen, not a peer to Home.
- Add clear in-dashboard entry points for:
  - manage dogs
  - assign walker when missing

### Walker
- Remove duplicated local bottom nav blocks from:
  - `src/app/walker/dashboard/WalkerDashboardClient.tsx`
  - `src/app/walker/live/WalkerLiveClient.tsx`
- Keep one global nav model from `src/components/layout/bottom-nav.tsx`.
- Demote `Calendar` from walker top-level nav.
- Make start-walk more decisive:
  - one dog -> direct start
  - multi-dog -> chooser only when needed

### Deliverables
- owner nav simplified
- walker nav unified
- start-walk friction reduced
- `/owner` root redirect added

### Exit Criteria
- owner always has a visible "Home" mental model
- walker never sees double nav
- walker can start a single-dog walk without a pointless chooser
- no primary nav item points to a weak or non-daily destination unless explicitly justified

## Phase 2: Owner Home Redesign
### Objective
Turn the owner dashboard into the true emotional and operational center of the owner experience.

### Main Owner Question
Is my dog okay, and do I need to do anything now?

### Current Base
The right foundation already exists in:

- `src/app/owner/dashboard/OwnerDashboardClient.tsx`
- `src/app/owner/dashboard/components/OwnerCurrentStatusCard.tsx`
- `src/app/owner/dashboard/components/OwnerDogSelector.tsx`
- `src/app/owner/dashboard/components/OwnerHistorySection.tsx`

### What the owner home must contain
In priority order:

1. dog identity
2. current state
3. next required action
4. last walk summary
5. recent meaningful history
6. deeper links only when necessary

### What to add or refine
- Strong "setup incomplete" states:
  - no dog
  - no active walker
  - no walk history yet
- Contextual action cards:
  - assign walker
  - close payment period only when relevant
  - enable notifications only when valuable
- Reduce dashboard language that feels mechanical
- Make multi-dog switching feel like changing the current subject, not switching tabs in a system

### What to stop doing on the owner home
- do not make it a section hub
- do not push users toward browsing pages
- do not over-emphasize stats over certainty

### Files likely touched in this phase
- `src/app/owner/dashboard/OwnerDashboardClient.tsx`
- `src/app/owner/dashboard/components/OwnerCurrentStatusCard.tsx`
- `src/app/owner/dashboard/components/OwnerDogSelector.tsx`
- `src/app/owner/dashboard/components/OwnerHistorySection.tsx`
- possibly new small owner-home components created under `src/app/owner/dashboard/components/`

### Exit Criteria
- the owner can open the app and understand the situation immediately
- the owner sees one obvious next action when something is missing
- the owner does not need to visit another page for routine reassurance

## Phase 3: Walker Home and Core Loop Redesign
### Objective
Make the walker flow feel like an operational instrument, not a system.

### Main Walker Question
What is next, and what do I do right now?

### Current Base
The current core loop already lives in:

- `src/app/walker/dashboard/WalkerDashboardClient.tsx`
- `src/app/walker/live/WalkerLiveClient.tsx`

### Desired Walker Loop
1. open app
2. see next dog immediately
3. start with one tap
4. remain in live mode during work
5. end walk cleanly
6. return to ready state

### Dashboard redesign goals
- the "next dog" card becomes the primary object in the interface
- the state of the day is obvious without scrolling
- "no dog assigned yet" remains calm and clear
- exceptions are prominent:
  - offline
  - auto-close
  - action failure

### Start-walk behavior rules
- if there is one dog, the system should behave decisively
- if there are many dogs, choice should be secondary, not default
- if there is a known order model later, the app should respect it and reduce choice further

### Live mode goals
`src/app/walker/live/WalkerLiveClient.tsx` is already the cleanest embodiment of the product. This phase should preserve and harden it.

Keep:
- timer dominance
- state-based warnings
- strong end-walk CTA
- low visual noise

Refine:
- photo and note actions remain secondary
- error handling stays clear but non-chaotic
- no navigation language leaks into live mode

### Files likely touched in this phase
- `src/app/walker/dashboard/WalkerDashboardClient.tsx`
- `src/app/walker/live/WalkerLiveClient.tsx`
- `src/components/layout/bottom-nav.tsx`

### Exit Criteria
- walker home can be understood in under two seconds
- the walker no longer navigates before acting
- the live loop feels stable, direct, and professional

## Phase 4: Demote, Merge, or Remove Secondary Screens
### Objective
Reduce surface area so the product feels smaller and more obvious than the codebase behind it.

### Owner screens to review
- `src/app/owner/dogs/OwnerDogsClient.tsx`
- `src/app/owner/dog-profile/[dogId]/DogProfileClient.tsx`
- `src/app/owner/calendar/OwnerCalendarClient.tsx`
- `src/app/owner/billing/OwnerBillingClient.tsx`
- `src/app/owner/settings/page.tsx`

### Owner target state
- Home remains primary
- Dog management becomes depth
- Dog profile becomes lighter, calmer, and more secondary
- Calendar becomes archive depth
- Billing becomes contextual when possible

### Dog profile strategy
Current dog profile does too much:
- identity
- avatar management
- edit form
- stats
- assigned walkers
- assignment action
- walk diary
- media browsing

That page should be restructured into:
- identity and current setup
- key actions
- deeper history lower down

It should stop feeling like a record system.

### Billing strategy
Owner billing is currently well-built technically, but it still behaves like a section the owner must consciously visit.

Long-term target:
- billing is entered because a payment action exists
- not because billing is always competing for attention in the main loop

### Walker screens to review
- `src/app/walker/dogs/WalkerDogsClient.tsx`
- `src/app/walker/calendar/WalkerCalendarClient.tsx`
- `src/app/walker/billing/WalkerBillingClient.tsx`

### Walker target state
- these screens remain available
- but they stop competing with the dashboard/live loop
- they become "depth when needed"

### Legacy component cleanup
Review `src/components/walker/*` and `src/components/walks/*`.

For each file:
- reuse intentionally
- archive mentally as prototype
- or delete if confirmed dead

No orphan component set should quietly define product direction.

### Exit Criteria
- fewer top-level destinations
- no route remains first-class without a strong daily-use reason
- the active product surface feels much smaller than today

## Phase 5: Language and Positioning Rewrite
### Objective
Make the product sound like the thing it is supposed to be.

### Current mismatch
The current public and auth layer still speaks in software terms:
- management
- tracking
- billing
- notifications

That is mechanically accurate but strategically weak.

### Files to rewrite
- `src/app/page.tsx`
- `src/app/login/page.tsx`
- `src/app/signup/page.tsx`
- `src/app/verify-email/page.tsx`
- `src/app/onboarding/OnboardingWizard.tsx`

### Language goals
Landing page:
- certainty
- calm visibility
- trust between owner and walker

Onboarding:
- role framing should feel situational, not administrative

Owner copy:
- reassurance first

Walker copy:
- readiness first

### Exit Criteria
- product no longer introduces itself like software
- role flows feel human before they feel technical

## Phase 6: Validation and Hardening
### Objective
Make sure the improved product is not just cleaner in code review, but measurably calmer in use.

### Technical validation
- `tsc --noEmit`
- `npm run build`
- smoke coverage on changed routes

### Product validation
For every changed screen, ask:
- Can a new user explain what this screen is for in one sentence?
- Can they tell what to do next without exploring?
- Did we reduce top-level choices?
- Did we reduce duplicated destinations?
- Did we reduce page-hopping for routine tasks?

### Human walkthroughs
Run role-based cold walkthroughs:

Owner:
1. sign up
2. add first dog
3. assign walker
4. return later and check status
5. review payment when one exists

Walker:
1. log in
2. understand dashboard immediately
3. start walk
4. use live mode
5. end walk
6. return to ready state

The walkthrough target is not "could they eventually complete it?"
It is "did the app lead them without explanation?"

## Things I Would Explicitly Not Build Yet
Until Phases 1 to 4 are done, I would not approve:

- expanding calendar depth
- adding more owner management tools
- adding more walker admin surfaces
- exposing more backend capabilities just because they exist
- polishing secondary screens before the homes are right
- adding extra nav items
- building features that make the app feel more like a control panel

## Success Definition
We are done when:

- Owner Home feels like a certainty screen
- Walker Home feels like an action screen
- Live Walk feels like work mode
- depth exists, but only when needed
- navigation is sparse and trustworthy
- users do not need to understand the product structure

Perfect here does not mean "feature rich."

Perfect means:

- the owner opens the app and relaxes
- the walker opens the app and moves
- the product feels smaller than it is
- the system disappears behind clarity

## Recommended Execution Order
1. Phase 1 structural cleanup
2. Phase 2 owner home redesign
3. Phase 3 walker home/core loop redesign
4. Phase 4 demote or absorb secondary surfaces
5. Phase 5 copy and language rewrite
6. Phase 6 validation and hardening

## Final Note
The current app does not need a wider system.
It needs a narrower truth.

The codebase already contains the right raw material.
The project now needs discipline more than invention.
