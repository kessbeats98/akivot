import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getWalkerDashboardAction, startWalkAction } from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { WalkerDashboardClient } from "./WalkerDashboardClient";

export default async function WalkerDashboardPage() {
  const [user, { assignedDogs, activeWalks }] = await Promise.all([
    getCurrentUser(),
    getWalkerDashboardAction(),
  ]);

  if (activeWalks[0]) redirect("/walker/live");

  return (
    <WalkerDashboardClient
      userName={user?.name ?? "דני"}
      assignedDogs={assignedDogs}
      startWalkAction={startWalkAction}
      notificationsButton={<EnableNotificationsButton />}
    />
  );
}
