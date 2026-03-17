import {
  getOwnerDogsAction,
  createDogAction,
  deactivateDogAction,
  assignWalkerAction,
  setPriceAction,
  getAvailableWalkersAction,
  getActiveLiveWalksAction,
} from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const [dogs, availableWalkers, liveWalks] = await Promise.all([
    getOwnerDogsAction(),
    getAvailableWalkersAction(),
    getActiveLiveWalksAction(),
  ]);

  return (
    <OwnerDashboardClient
      dogs={dogs}
      availableWalkers={availableWalkers}
      liveWalks={liveWalks}
      createDogAction={createDogAction}
      deactivateDogAction={deactivateDogAction}
      assignWalkerAction={assignWalkerAction}
      setPriceAction={setPriceAction}
      notificationsButton={<EnableNotificationsButton />}
    />
  );
}
