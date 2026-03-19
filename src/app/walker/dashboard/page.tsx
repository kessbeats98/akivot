import { getWalkerDashboardAction } from "./actions";
import { WalkerDashboardClient } from "./WalkerDashboardClient";

export default async function WalkerDashboardPage() {
  const data = await getWalkerDashboardAction();

  return <WalkerDashboardClient data={data} />;
}
