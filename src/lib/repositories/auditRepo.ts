import { auditLogs } from "@/db/schema";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tx = any; // Drizzle neon-http tx type; tighten in TASK-06 if needed

type EntityType =
  | "USER" | "WALKER_PROFILE" | "DOG" | "DOG_OWNER" | "DOG_WALKER"
  | "WALK_BATCH" | "WALK" | "WALK_MEDIA" | "PAYMENT_PERIOD"
  | "PAYMENT_ENTRY" | "USER_DEVICE" | "INVITE" | "NOTIFICATION_DELIVERY";

type AuditAction =
  | "CREATE" | "UPDATE" | "DELETE" | "START_WALK" | "END_WALK"
  | "AUTO_CLOSE_WALK" | "CANCEL_WALK" | "CLOSE_PAYMENT_PERIOD"
  | "MARK_PAYMENT_PAID" | "REOPEN_PAYMENT_PERIOD" | "REGISTER_DEVICE"
  | "INVALIDATE_DEVICE" | "SEND_NOTIFICATION" | "UPLOAD_MEDIA";

export type LogAuditParams = {
  tx: Tx;
  actorUserId: string;
  entityType: EntityType;
  entityId: string;
  action: AuditAction;
  beforeJson?: Record<string, unknown> | null;
  afterJson?: Record<string, unknown> | null;
  metadataJson?: Record<string, unknown> | null;
};

// logAudit only accepts a tx — never creates its own DB connection. Enforces atomicity.
export async function logAudit({
  tx,
  actorUserId,
  entityType,
  entityId,
  action,
  beforeJson = null,
  afterJson = null,
  metadataJson = null,
}: LogAuditParams): Promise<void> {
  await tx.insert(auditLogs).values({
    actorUserId,
    entityType,
    entityId,
    action,
    beforeJson,
    afterJson,
    metadataJson,
  });
}
