# API Contracts — Akivot

## Conventions
- Base URL: `/api/`
- Auth: Better Auth session cookies
- Content-Type: `application/json`
- Error shape: `{ error: string, code?: string }`

## Endpoints

### [GROUP] — [Description]

#### `METHOD /api/path`
- **Auth**: required / public
- **Request**: `{ field: type }`
- **Response 200**: `{ field: type }`
- **Response 4xx**: `{ error: string }`
- **Notes**: [any important behavior]

---

## Owner — Dog Management

All owner dog operations are Next.js Server Actions.
File: `src/app/owner/dashboard/actions.ts`

| Action | Auth | Input | Behavior |
|--------|------|-------|----------|
| `createDogAction(formData)` | assertAuthenticated | FormData: name*, breed?, birthDate?, notes? | Inserts dog + dogOwner(isPrimary=true) |
| `deactivateDogAction(dogId, formData)` | assertAuthenticated | dogId bound via `.bind(null, dogId)`; FormData unused | Sets isActive=false; validates ownership |
| `getOwnerDogsAction()` | assertAuthenticated | — | Returns active dogs for current user with walkers |
| `assignWalkerAction(dogId, formData)` | assertAuthenticated | dogId bound via `.bind(null, dogId)`; FormData: walkerProfileId* | assertDogOwnership; creates/reactivates dogWalkers row |

---

## Walker — Walk Lifecycle

All walker operations are Next.js Server Actions.
File: `src/app/walker/dashboard/actions.ts`

| Action | Auth | Input | Behavior |
|--------|------|-------|----------|
| `getWalkerDashboardAction()` | assertAuthenticated | — | Returns { assignedDogs, activeWalks } |
| `startWalkAction(dogId, _formData)` | assertAuthenticated | dogId bound via `.bind(null, dogId)` | Inserts LIVE walk + START_WALK audit in tx |
| `endWalkAction(walkId, _formData)` | assertAuthenticated | walkId bound via `.bind(null, walkId)` | Updates walk to COMPLETED + END_WALK audit in tx |

---

## Owner — Price-Setting (addition to owner dashboard)

File: `src/app/owner/dashboard/actions.ts`

| Action | Auth | Input | Behavior |
|--------|------|-------|----------|
| `setPriceAction(dogWalkerId, formData)` | assertAuthenticated | dogWalkerId bound; FormData: price* | assertDogWalkerOwnership; updates dogWalkers.currentPrice (ILS) |

---

## Owner — Billing

File: `src/app/owner/billing/actions.ts`

| Action | Auth | Input | Behavior |
|--------|------|-------|----------|
| `getOwnerBillingAction()` | assertAuthenticated | — | ensureOpenPeriods (one OPEN per active owner-walker pair); returns { periods } |
| `closePeriodAction(periodId, formData)` | assertAuthenticated | periodId bound; FormData: lockVersion* (hidden) | assertPeriodOwnership; closePaymentPeriod tx (same-owner walks only; lockVersion check + increment) |

---

## Walker — Billing

File: `src/app/walker/billing/actions.ts`

| Action | Auth | Input | Behavior |
|--------|------|-------|----------|
| `getWalkerBillingAction()` | assertAuthenticated | — | Returns { periods: PaymentPeriodWithEntries[] } |

---

## Devices — Token Registration

### `POST /api/devices/register`
- **Auth**: required (assertAuthenticated)
- **Request**: `{ fcmToken: string, platform: "WEB_DESKTOP" }`
- **Response 200**: `{ deviceId: string }`
- **Response 409**: token already registered (idempotent — returns existing deviceId)
- **Notes**: upsert `userDevices` row on `fcmToken` conflict; sets `notificationsEnabled=true`

---

## Notifications — Internal Action

### `notifyWalkEvent(walkId, type)`
- **Type**: internal server-side function (not exposed as HTTP endpoint)
- **Called by**: `walker/dashboard/actions.ts` after `startWalk`/`endWalk`
- **Signature**: `notifyWalkEvent(walkId: string, type: "WALK_STARTED" | "WALK_COMPLETED"): Promise<void>`
- **Behavior**: fetches walk → dogId → owner userId(s); fetches active devices per owner; sends via Admin SDK; logs delivery; invalidates bad tokens; never throws
