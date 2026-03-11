# Architecture — Akivot

## Stack
- Framework:    Next.js 16 App Router
- Language:     TypeScript (strict)
- Styling:      Tailwind CSS + shadcn/ui
- Database:     Neon (Serverless Postgres) + Drizzle ORM
- Auth:         Better Auth (database sessions, drizzle adapter)
- Notifications: Firebase Cloud Messaging (FCM) — Admin SDK server-side, Web SDK client-side
- Storage:      Vercel Blob (walk media)
- Offline:      Dexie (IndexedDB wrapper) + Service Worker / PWA
- Hosting:      Vercel (Hobby plan — cron limited to ≥1h intervals)
- Jobs:         Vercel Cron (TASK-09)

## System Shape

```
Browser (PWA)
  ├── React Server Components (pages)
  ├── Server Actions (form submissions, mutations)
  ├── Service Worker
  │     ├── firebase-messaging-sw.js (FCM background push)
  │     └── service-worker.ts (offline/cache — TASK-08)
  └── Dexie IndexedDB (offline queue — TASK-08)

Next.js App Router (server)
  ├── /api/auth/[...all]   → Better Auth handler
  ├── /api/devices/register → FCM token registration
  ├── /api/uploads/walk-media → Vercel Blob upload (TASK-08)
  ├── /api/jobs/auto-close  → Vercel Cron handler (TASK-09)
  ├── Server Actions        → owner/walker dashboard mutations
  └── Middleware             → (none in V1)

Data Layer
  ├── Drizzle ORM → Neon Postgres (lazy getDb() factory)
  ├── Firebase Admin SDK → FCM dispatch (lazy getAdminApp())
  └── Vercel Blob SDK → media storage
```

## Module Boundaries

| Module | Path | Responsibility |
|--------|------|----------------|
| Schema | `src/db/schema/` | Drizzle table definitions, enums, relations |
| DB Client | `src/db/drizzle.ts` | Lazy `getDb()` factory — no eager env access |
| Repositories | `src/lib/repositories/` | Data access layer (one per entity) |
| Services | `src/lib/services/` | Business logic (walks, billing, notifications) |
| Validation | `src/lib/validation/` | Zod schemas for input validation |
| Auth | `src/lib/auth/` | Better Auth config + `getCurrentUser`/`assertAuthenticated` |
| Config | `src/lib/config.ts` | Centralized app constants |
| Offline | `src/lib/offline/` | Dexie DB + media queue (TASK-08) |
| Pages | `src/app/` | Routes, layouts, server components |
| Actions | `src/app/**/actions.ts` | Server Actions per feature |
| Components | `src/components/` | UI (owner/, walker/, shared/) |

## Data Flow

**Read path (page load):**
Server Component → repository function → `getDb()` → Neon query → render

**Write path (user action):**
Form submit → Server Action → Zod validation → service/repository → `getDb()` → Neon tx → audit log → `revalidatePath`

**Notification path (side effect):**
Walk mutation success → `notifyWalkEvent()` (fire-and-forget) → get active devices → Firebase Admin `send()` → log delivery → invalidate bad tokens

## Key Invariants
- Only ONE walk per walker can be `LIVE` at a time (enforced in `walksRepo`)
- Only ONE `OPEN` payment period per `(ownerUserId, walkerProfileId)` pair (partial unique index)
- `closePaymentPeriod` uses CAS with `lockVersion` — no concurrent overwrites
- All env access is lazy — build passes with zero env vars
