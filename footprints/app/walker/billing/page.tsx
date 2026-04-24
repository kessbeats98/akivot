import { getWalkerBillingAction } from './actions';
import { WalkerBillingClient } from './WalkerBillingClient';

export default async function WalkerBillingPage() {
  const { periods } = await getWalkerBillingAction();

  return <WalkerBillingClient initialPeriods={periods} />;
}

