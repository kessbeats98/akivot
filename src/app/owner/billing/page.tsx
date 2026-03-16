import { getOwnerBillingAction, closePeriodAction } from "./actions";
import { OwnerBillingClient } from "./OwnerBillingClient";

export default async function OwnerBillingPage() {
  const { periods } = await getOwnerBillingAction();
  return <OwnerBillingClient periods={periods} closePeriodAction={closePeriodAction} />;
}
