import { getWalkerBillingAction } from "./actions";
import { WalkerBillingSurface } from "@/components/walker/WalkerBillingSurface";

export default async function WalkerBillingPage() {
  const { periods } = await getWalkerBillingAction();
  return <WalkerBillingSurface periods={periods} />;
}
