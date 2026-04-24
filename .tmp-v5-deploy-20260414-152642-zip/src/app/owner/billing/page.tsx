import { getOwnerBillingPageAction } from "./actions";
import { OwnerBillingClient } from "./OwnerBillingClient";

export default async function OwnerBillingPage() {
  const periods = await getOwnerBillingPageAction();
  return <OwnerBillingClient periods={periods} />;
}
