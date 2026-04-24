import { eq } from "drizzle-orm";
import { getOwnerBillingPageAction } from "./actions";
import { OwnerBillingClient } from "./OwnerBillingClient";
import { assertAuthenticated } from "@/lib/auth/session";
import { getDb } from "@/db/drizzle";
import { users } from "@/db/schema";
import { isUsablePhone } from "@/lib/phone";

export default async function OwnerBillingPage() {
  const sessionUser = await assertAuthenticated();
  const [periods, phoneRow] = await Promise.all([
    getOwnerBillingPageAction(),
    getDb()
      .select({ phone: users.phone })
      .from(users)
      .where(eq(users.id, sessionUser.id))
      .limit(1)
      .then((rows) => rows[0]),
  ]);
  const hasOwnerPhone = isUsablePhone(phoneRow?.phone);
  return <OwnerBillingClient periods={periods} hasOwnerPhone={hasOwnerPhone} />;
}
