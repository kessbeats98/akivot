import { getOwnerDogsAction, getActiveLiveWalksAction } from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const [dogs, liveWalks] = await Promise.all([
    getOwnerDogsAction(),
    getActiveLiveWalksAction(),
  ]);

  return (
    <OwnerDashboardClient
      dogs={dogs}
      liveWalks={liveWalks}
      notificationsButton={<EnableNotificationsButton />}
    />
  );
}
