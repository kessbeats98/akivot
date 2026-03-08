# DB Schema — Akivot V1

## ORM
Drizzle ORM with Neon Serverless Postgres.

## Migration Policy
- All migrations via `npx drizzle-kit generate` + `npx drizzle-kit push`.
- Destructive migrations (column drop, table drop, data truncation) require /core + verify-ops approval.
- Every migration must be non-destructive by default. Document rollback path.

---

## Enums

| Enum | Values |
|------|--------|
| `platformEnum` | `IOS`, `ANDROID`, `WEB_DESKTOP` |
| `walkStatusEnum` | `PLANNED`, `LIVE`, `COMPLETED`, `AUTO_CLOSED`, `CANCELLED` |
| `walkBatchStatusEnum` | `LIVE`, `COMPLETED`, `AUTO_CLOSED`, `CANCELLED` |
| `closureReasonEnum` | `MANUAL`, `AUTO_TIMEOUT`, `CANCELLED`, `SYSTEM_FIX` |
| `walkMediaTypeEnum` | `PHOTO` |
| `mediaProviderEnum` | `VERCEL_BLOB` |
| `mediaUploadStatusEnum` | `PENDING`, `UPLOADING`, `UPLOADED`, `FAILED` |
| `paymentPeriodStatusEnum` | `OPEN`, `PAID`, `REOPENED`, `ARCHIVED` |
| `paymentEntryTypeEnum` | `WALK`, `ADJUSTMENT` |
| `notificationTypeEnum` | `WALK_STARTED`, `WALK_COMPLETED`, `AUTO_TIMEOUT_WARNING`, `AUTO_CLOSED`, `ONBOARDING_REMINDER` |
| `notificationDeliveryStatusEnum` | `PENDING`, `SENT`, `FAILED`, `TOKEN_INVALID` |
| `entityTypeEnum` | `USER`, `WALKER_PROFILE`, `DOG`, `DOG_OWNER`, `DOG_WALKER`, `WALK_BATCH`, `WALK`, `WALK_MEDIA`, `PAYMENT_PERIOD`, `PAYMENT_ENTRY`, `USER_DEVICE`, `INVITE`, `NOTIFICATION_DELIVERY` |
| `auditActionEnum` | `CREATE`, `UPDATE`, `DELETE`, `START_WALK`, `END_WALK`, `AUTO_CLOSE_WALK`, `CANCEL_WALK`, `CLOSE_PAYMENT_PERIOD`, `MARK_PAYMENT_PAID`, `REOPEN_PAYMENT_PERIOD`, `REGISTER_DEVICE`, `INVALIDATE_DEVICE`, `SEND_NOTIFICATION`, `UPLOAD_MEDIA` |
| `inviteStatusEnum` | `ACTIVE`, `EXPIRED`, `DISABLED` |

---

## Tables

### `users`
Better Auth-compatible shape.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `text` | PK | Better Auth generates string IDs |
| `name` | `text` | NOT NULL | |
| `email` | `text` | UNIQUE NOT NULL | |
| `emailVerified` | `boolean` | NOT NULL DEFAULT false | |
| `image` | `text` | nullable | Better Auth expects `image` (not `imageUrl`) |
| `phone` | `text` | nullable | App-level extension |
| `isActive` | `boolean` | NOT NULL DEFAULT true | |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() | |
| `updatedAt` | `timestamp with tz` | NOT NULL | |

### `walkerProfiles`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `userId` | `text` | FK→users.id UNIQUE NOT NULL |
| `displayName` | `text` | NOT NULL |
| `publicSlug` | `text` | UNIQUE nullable |
| `inviteCode` | `text` | UNIQUE NOT NULL |
| `isAcceptingClients` | `boolean` | NOT NULL DEFAULT true |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `userDevices`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `userId` | `text` | FK→users.id NOT NULL |
| `platform` | `platformEnum` | NOT NULL |
| `deviceLabel` | `text` | nullable |
| `fcmToken` | `text` | UNIQUE NOT NULL |
| `appInstalled` | `boolean` | NOT NULL DEFAULT false |
| `notificationsEnabled` | `boolean` | NOT NULL DEFAULT false |
| `lastSeenAt` | `timestamp with tz` | nullable |
| `invalidatedAt` | `timestamp with tz` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `invites`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `walkerProfileId` | `uuid` | FK→walkerProfiles.id NOT NULL |
| `inviteCode` | `text` | UNIQUE NOT NULL |
| `phone` | `text` | nullable |
| `email` | `text` | nullable |
| `maxUses` | `integer` | NOT NULL DEFAULT 1 |
| `usedCount` | `integer` | NOT NULL DEFAULT 0 |
| `expiresAt` | `timestamp with tz` | nullable |
| `status` | `inviteStatusEnum` | NOT NULL |
| `createdByUserId` | `text` | FK→users.id NOT NULL |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |

### `dogs`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `name` | `text` | NOT NULL |
| `breed` | `text` | nullable |
| `birthDate` | `date` | nullable |
| `imageUrl` | `text` | nullable |
| `notes` | `text` | nullable |
| `isActive` | `boolean` | NOT NULL DEFAULT true |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `dogOwners`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `dogId` | `uuid` | FK→dogs.id NOT NULL |
| `ownerUserId` | `text` | FK→users.id NOT NULL |
| `isPrimary` | `boolean` | NOT NULL DEFAULT false |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |

**Unique constraint:** `(dogId, ownerUserId)`

### `dogWalkers`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `dogId` | `uuid` | FK→dogs.id NOT NULL |
| `walkerProfileId` | `uuid` | FK→walkerProfiles.id NOT NULL |
| `currentPrice` | `decimal(10,2)` | NOT NULL |
| `currency` | `char(3)` | NOT NULL DEFAULT 'ILS' |
| `isActive` | `boolean` | NOT NULL DEFAULT true |
| `startedAt` | `timestamp with tz` | NOT NULL |
| `endedAt` | `timestamp with tz` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

**Unique constraint:** `(dogId, walkerProfileId)`

### `walkBatches`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `walkerProfileId` | `uuid` | FK→walkerProfiles.id NOT NULL |
| `status` | `walkBatchStatusEnum` | NOT NULL |
| `startedAt` | `timestamp with tz` | NOT NULL |
| `endedAt` | `timestamp with tz` | nullable |
| `startedByUserId` | `text` | FK→users.id NOT NULL |
| `endedByUserId` | `text` | FK→users.id nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `walks`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() | |
| `dogId` | `uuid` | FK→dogs.id NOT NULL | |
| `walkerProfileId` | `uuid` | FK→walkerProfiles.id NOT NULL | |
| `dogWalkerId` | `uuid` | FK→dogWalkers.id NOT NULL | |
| `walkBatchId` | `uuid` | FK→walkBatches.id nullable | Real DB FK — both tables in walks.ts |
| `status` | `walkStatusEnum` | NOT NULL | |
| `startTime` | `timestamp with tz` | NOT NULL | |
| `endTime` | `timestamp with tz` | nullable | |
| `durationMinutes` | `integer` | nullable | |
| `finalPrice` | `decimal(10,2)` | nullable | |
| `closureReason` | `closureReasonEnum` | nullable | |
| `note` | `text` | nullable | |
| `paymentPeriodId` | `uuid` | nullable — **NO DB FK** | Circular import walks.ts↔billing.ts; integrity via service layer |
| `completedAt` | `timestamp with tz` | nullable | |
| `autoClosedAt` | `timestamp with tz` | nullable | |
| `cancelledAt` | `timestamp with tz` | nullable | |
| `statusUpdatedAt` | `timestamp with tz` | NOT NULL | |
| `createdByUserId` | `text` | FK→users.id NOT NULL | |
| `updatedByUserId` | `text` | FK→users.id NOT NULL | |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() | |
| `updatedAt` | `timestamp with tz` | NOT NULL | |
| `deletedAt` | `timestamp with tz` | nullable | Soft delete |

### `walkMedia`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `walkId` | `uuid` | FK→walks.id NOT NULL |
| `mediaType` | `walkMediaTypeEnum` | NOT NULL |
| `storageProvider` | `mediaProviderEnum` | NOT NULL |
| `storageKey` | `text` | nullable |
| `publicUrl` | `text` | nullable |
| `uploadedByUserId` | `text` | FK→users.id NOT NULL |
| `uploadStatus` | `mediaUploadStatusEnum` | NOT NULL |
| `capturedAt` | `timestamp with tz` | NOT NULL |
| `uploadedAt` | `timestamp with tz` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |

### `paymentPeriods`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `walkerProfileId` | `uuid` | FK→walkerProfiles.id NOT NULL |
| `ownerUserId` | `text` | FK→users.id NOT NULL |
| `status` | `paymentPeriodStatusEnum` | NOT NULL |
| `totalAmount` | `decimal(10,2)` | NOT NULL DEFAULT '0' |
| `paidAt` | `timestamp with tz` | nullable |
| `paidByUserId` | `text` | FK→users.id nullable |
| `reopenedAt` | `timestamp with tz` | nullable |
| `reopenedByUserId` | `text` | FK→users.id nullable |
| `lockVersion` | `integer` | NOT NULL DEFAULT 0 |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `paymentEntries`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() | |
| `paymentPeriodId` | `uuid` | FK→paymentPeriods.id NOT NULL | |
| `walkId` | `uuid` | nullable — **NO DB FK** | Circular import billing.ts↔walks.ts; integrity via service layer |
| `ownerUserId` | `text` | FK→users.id NOT NULL | |
| `amount` | `decimal(10,2)` | NOT NULL | |
| `entryType` | `paymentEntryTypeEnum` | NOT NULL | |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() | |

**Unique constraint:** `(paymentPeriodId, walkId)`

### `notificationDeliveries`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `userDeviceId` | `uuid` | FK→userDevices.id NOT NULL |
| `notificationType` | `notificationTypeEnum` | NOT NULL |
| `entityType` | `entityTypeEnum` | NOT NULL |
| `entityId` | `text` | NOT NULL |
| `status` | `notificationDeliveryStatusEnum` | NOT NULL |
| `errorMessage` | `text` | nullable |
| `sentAt` | `timestamp with tz` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |

### `auditLogs`
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `uuid` | PK DEFAULT gen_random_uuid() |
| `actorUserId` | `text` | FK→users.id NOT NULL |
| `entityType` | `entityTypeEnum` | NOT NULL |
| `entityId` | `text` | NOT NULL |
| `action` | `auditActionEnum` | NOT NULL |
| `beforeJson` | `jsonb` | nullable |
| `afterJson` | `jsonb` | nullable |
| `metadataJson` | `jsonb` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL DEFAULT now() |

### `sessions` (Better Auth)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `expiresAt` | `timestamp with tz` | NOT NULL |
| `token` | `text` | UNIQUE NOT NULL |
| `createdAt` | `timestamp with tz` | NOT NULL |
| `updatedAt` | `timestamp with tz` | NOT NULL |
| `ipAddress` | `text` | nullable |
| `userAgent` | `text` | nullable |
| `userId` | `text` | FK→users.id ON DELETE CASCADE NOT NULL |

### `accounts` (Better Auth)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `accountId` | `text` | NOT NULL |
| `providerId` | `text` | NOT NULL |
| `userId` | `text` | FK→users.id ON DELETE CASCADE NOT NULL |
| `accessToken` | `text` | nullable |
| `refreshToken` | `text` | nullable |
| `idToken` | `text` | nullable |
| `accessTokenExpiresAt` | `timestamp with tz` | nullable |
| `refreshTokenExpiresAt` | `timestamp with tz` | nullable |
| `scope` | `text` | nullable |
| `password` | `text` | nullable |
| `createdAt` | `timestamp with tz` | NOT NULL |
| `updatedAt` | `timestamp with tz` | NOT NULL |

### `verifications` (Better Auth)
| Column | Type | Constraints |
|--------|------|-------------|
| `id` | `text` | PK |
| `identifier` | `text` | NOT NULL — indexed (`verifications_identifier_idx`) |
| `value` | `text` | NOT NULL |
| `expiresAt` | `timestamp with tz` | NOT NULL |
| `createdAt` | `timestamp with tz` | nullable |
| `updatedAt` | `timestamp with tz` | nullable |

---

## FK Relationships

### Real DB FKs
- `walkerProfiles.userId` → `users.id`
- `userDevices.userId` → `users.id`
- `invites.walkerProfileId` → `walkerProfiles.id`
- `invites.createdByUserId` → `users.id`
- `dogOwners.dogId` → `dogs.id`
- `dogOwners.ownerUserId` → `users.id`
- `dogWalkers.dogId` → `dogs.id`
- `dogWalkers.walkerProfileId` → `walkerProfiles.id`
- `walkBatches.walkerProfileId` → `walkerProfiles.id`
- `walkBatches.startedByUserId` → `users.id`
- `walkBatches.endedByUserId` → `users.id`
- `walks.dogId` → `dogs.id`
- `walks.walkerProfileId` → `walkerProfiles.id`
- `walks.dogWalkerId` → `dogWalkers.id`
- `walks.walkBatchId` → `walkBatches.id` (both in walks.ts, no circular import)
- `walks.createdByUserId` → `users.id`
- `walks.updatedByUserId` → `users.id`
- `walkMedia.walkId` → `walks.id`
- `walkMedia.uploadedByUserId` → `users.id`
- `paymentPeriods.walkerProfileId` → `walkerProfiles.id`
- `paymentPeriods.ownerUserId` → `users.id`
- `paymentPeriods.paidByUserId` → `users.id`
- `paymentPeriods.reopenedByUserId` → `users.id`
- `paymentEntries.paymentPeriodId` → `paymentPeriods.id`
- `paymentEntries.ownerUserId` → `users.id`
- `notificationDeliveries.userDeviceId` → `userDevices.id`
- `auditLogs.actorUserId` → `users.id`
- `sessions.userId` → `users.id` (ON DELETE CASCADE)
- `accounts.userId` → `users.id` (ON DELETE CASCADE)

### Intentionally Omitted DB FKs (circular import prevention)
| Column | Reason |
|--------|--------|
| `walks.paymentPeriodId` | walks.ts ↔ billing.ts circular import. Integrity enforced by `closePaymentPeriodService` transaction. |
| `paymentEntries.walkId` | billing.ts ↔ walks.ts circular import. Same integrity guarantee. |

Application-level relations defined in `relations.ts` cover these columns for `db.query.*` composition.

---

## Application-Level Relations (relations.ts)
Drizzle `relations()` — no DB FK constraints generated.

- `users` ↔ `walkerProfiles` (one-to-one)
- `users` → `userDevices` (one-to-many)
- `users` → `invites` via `createdByUserId` (one-to-many)
- `walkerProfiles` → `invites` (one-to-many)
- `walkerProfiles` → `dogWalkers` (one-to-many)
- `walkerProfiles` → `walkBatches` (one-to-many)
- `walkerProfiles` → `paymentPeriods` (one-to-many)
- `dogs` → `dogOwners` (one-to-many)
- `dogs` → `dogWalkers` (one-to-many)
- `dogs` → `walks` (one-to-many)
- `dogWalkers` → `walks` (one-to-many)
- `walkBatches` → `walks` (one-to-many)
- `walks` → `walkMedia` (one-to-many)
- `walks` → `paymentEntries` via `walkId` (application-level, no DB FK)
- `paymentPeriods` → `paymentEntries` (one-to-many)
- `paymentPeriods` → `walks` via `paymentPeriodId` (application-level, no DB FK)
- `userDevices` → `notificationDeliveries` (one-to-many)
