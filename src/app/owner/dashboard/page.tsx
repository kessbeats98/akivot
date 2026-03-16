import {
  getOwnerDogsAction,
  createDogAction,
  deactivateDogAction,
  assignWalkerAction,
  setPriceAction,
  getAvailableWalkersAction,
} from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const [dogs, availableWalkers] = await Promise.all([
    getOwnerDogsAction(),
    getAvailableWalkersAction(),
  ]);

  return (
    <OwnerDashboardClient
      dogs={dogs}
      availableWalkers={availableWalkers}
      createDogAction={createDogAction}
      deactivateDogAction={deactivateDogAction}
      assignWalkerAction={assignWalkerAction}
      setPriceAction={setPriceAction}
      notificationsButton={<EnableNotificationsButton />}
    />
  );
}
