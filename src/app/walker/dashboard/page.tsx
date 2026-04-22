import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import {
  getWalkerDashboardAction,
  startWalkAction,
  getWalkerConfirmationsAction,
  requestConfirmationAction,
} from "./actions";
import { EnableNotificationsButton } from "@/components/EnableNotificationsButton";
import { WalkerDashboardClient } from "./WalkerDashboardClient";

interface Props {
  searchParams: Promise<{ reason?: string }>;
}

export default async function WalkerDashboardPage({ searchParams }: Props) {
  const [user, { assignedDogs, activeWalks }, confirmations, params] = await Promise.all([
    getCurrentUser(),
    getWalkerDashboardAction(),
    getWalkerConfirmationsAction(),
    searchParams,
  ]);

  if (activeWalks[0]) redirect("/walker/live");

  return (
    <WalkerDashboardClient
      userName={user?.name ?? "דני"}
      assignedDogs={assignedDogs}
      confirmations={confirmations}
      startWalkAction={startWalkAction}
      requestConfirmationAction={requestConfirmationAction}
      notificationsButton={<EnableNotificationsButton />}
      autoClosedReason={params.reason === "auto_closed"}
    />
  );
}
