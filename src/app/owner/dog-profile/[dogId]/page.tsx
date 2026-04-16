import { getDogProfileAction, updateDogAction, lookupWalkerByInviteCodeAction, assignWalkerAction } from "./actions";
import { setPriceAction } from "@/app/owner/dashboard/actions";
import { DogProfileClient } from "./DogProfileClient";

interface Props {
  params: Promise<{ dogId: string }>;
}

export default async function DogProfilePage({ params }: Props) {
  const { dogId } = await params;
  const { dog, walkHistory, stats } = await getDogProfileAction(dogId);

  const setPriceActions = Object.fromEntries(
    dog.walkers.map((w) => [w.dogWalkerId, setPriceAction.bind(null, w.dogWalkerId)]),
  );

  return (
    <DogProfileClient
      dog={dog}
      walkHistory={walkHistory}
      stats={stats}
      lookupWalkerAction={lookupWalkerByInviteCodeAction}
      updateDogAction={updateDogAction.bind(null, dogId)}
      assignWalkerAction={assignWalkerAction.bind(null, dogId)}
      setPriceActions={setPriceActions}
    />
  );
}
