import {
  getOwnerDogsAction,
  getActiveLiveWalksAction,
  getOwnerConfirmationsAction,
} from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const [dogs, liveWalks, confirmations] = await Promise.all([
    getOwnerDogsAction(),
    getActiveLiveWalksAction(),
    getOwnerConfirmationsAction(),
  ]);

  return (
    <OwnerDashboardClient
      dogs={dogs}
      liveWalks={liveWalks}
      confirmations={confirmations}
      notificationsButton={<EnableNotificationsButton />}
    />
  );
}
