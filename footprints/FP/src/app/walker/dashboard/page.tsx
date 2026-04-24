import { getWalkerDashboardAction, startWalkAction } from './actions';
import { WalkerDashboardClient } from './WalkerDashboardClient';

export default async function WalkerDashboardPage() {
  const data = await getWalkerDashboardAction();

  return (
    <WalkerDashboardClient 
      assignedDogs={data.assignedDogs} 
      activeWalks={data.activeWalks} 
      onStartWalk={startWalkAction}
    />
  );
}

