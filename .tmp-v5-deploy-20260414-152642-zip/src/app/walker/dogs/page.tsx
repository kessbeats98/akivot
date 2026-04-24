import { getWalkerDashboardAction } from "@/app/walker/dashboard/actions";
import { WalkerDogsClient } from "./WalkerDogsClient";

export default async function WalkerDogsPage() {
  const { assignedDogs } = await getWalkerDashboardAction();
  return <WalkerDogsClient assignedDogs={assignedDogs} />;
}
