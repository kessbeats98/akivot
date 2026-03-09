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
