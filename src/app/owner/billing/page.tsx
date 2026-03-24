import { getOwnerPaymentsAction } from "./actions";
import { OwnerBillingClient } from "./OwnerBillingClient";

export default async function OwnerBillingPage() {
  const periods = await getOwnerPaymentsAction();
  return <OwnerBillingClient periods={periods} />;
}
