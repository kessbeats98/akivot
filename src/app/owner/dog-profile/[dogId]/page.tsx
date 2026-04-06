import { getDogProfileAction, updateDogAction, getAvailableWalkersAction, assignWalkerAction } from "./actions";
import { DogProfileClient } from "./DogProfileClient";

interface Props {
  params: Promise<{ dogId: string }>;
}

export default async function DogProfilePage({ params }: Props) {
  const { dogId } = await params;
  const [{ dog, walkHistory, stats }, availableWalkers] = await Promise.all([
    getDogProfileAction(dogId),
    getAvailableWalkersAction(),
  ]);

  return (
    <DogProfileClient
      dog={dog}
      walkHistory={walkHistory}
      stats={stats}
      availableWalkers={availableWalkers}
      updateDogAction={updateDogAction.bind(null, dogId)}
      assignWalkerAction={assignWalkerAction.bind(null, dogId)}
    />
  );
}
