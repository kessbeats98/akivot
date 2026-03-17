import { getDogProfileAction, updateDogAction } from "./actions";
import { DogProfileClient } from "./DogProfileClient";

interface Props {
  params: Promise<{ dogId: string }>;
}

export default async function DogProfilePage({ params }: Props) {
  const { dogId } = await params;
  const { dog, walkHistory } = await getDogProfileAction(dogId);

  return (
    <DogProfileClient
      dog={dog}
      walkHistory={walkHistory}
      updateDogAction={updateDogAction.bind(null, dogId)}
    />
  );
}
