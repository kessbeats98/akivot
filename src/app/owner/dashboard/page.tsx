import { getOwnerDashboardAction } from "./actions";
import { OwnerDashboardClient } from "./OwnerDashboardClient";

export default async function OwnerDashboardPage() {
  const data = await getOwnerDashboardAction();

  return <OwnerDashboardClient data={data} />;
}
