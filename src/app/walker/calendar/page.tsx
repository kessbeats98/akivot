import { getWalkerCalendarAction } from "./actions";
import { WalkerCalendarClient } from "./WalkerCalendarClient";

type Props = {
  searchParams: Promise<{ month?: string }>;
};

export default async function WalkerCalendarPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await getWalkerCalendarAction(params.month);

  return <WalkerCalendarClient data={data} />;
}
