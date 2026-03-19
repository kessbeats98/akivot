import { getWalkerDogsAction } from "./actions";
import { WalkerDogsClient } from "./WalkerDogsClient";

export default async function WalkerDogsPage() {
  const data = await getWalkerDogsAction();

  return <WalkerDogsClient data={data} />;
}
