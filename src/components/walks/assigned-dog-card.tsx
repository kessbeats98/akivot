import { PawPrint } from "lucide-react";
import type { AssignedDog } from "@/lib/services/walks/types";
import { ActionButton } from "@/components/ui/action-button";

type AssignedDogCardProps = {
  dog: AssignedDog;
  startWalkAction: (dogId: string, formData: FormData) => Promise<void>;
};

export function AssignedDogCard({ dog, startWalkAction }: AssignedDogCardProps) {
  return (
    <div className="rounded-2xl shadow-sm p-5 bg-white space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-lg font-semibold">{dog.dogName}</p>
          {dog.dogBreed && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-[#E5E7EB] text-[#374151]">
              {dog.dogBreed}
            </span>
          )}
        </div>
        <p className="text-base font-medium text-[#2A9D8F]">
          {dog.currentPrice} ₪
        </p>
      </div>
      <form action={startWalkAction.bind(null, dog.dogId)}>
        <ActionButton label="יוצאים לסיבוב?" icon={PawPrint} variant="primary" type="submit" />
      </form>
    </div>
  );
}
