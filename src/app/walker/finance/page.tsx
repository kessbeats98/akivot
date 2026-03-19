import { getWalkerFinanceAction } from "./actions";
import { WalkerFinanceClient } from "./WalkerFinanceClient";

export default async function WalkerFinancePage() {
  const data = await getWalkerFinanceAction();

  return <WalkerFinanceClient data={data} />;
}
