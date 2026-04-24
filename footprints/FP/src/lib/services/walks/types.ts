export type AssignedDog = {
  dogWalkerId: string;
  dogId: string;
  dogName: string;
  dogBreed: string | null;
  currentPrice: string | null;
  currency: string;
};

export type WalkWithDog = {
  id: string;
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  durationMinutes: number | null;
  finalPrice: string | null;
  note: string | null;
  dogId: string;
  dogName: string;
  dogBreed: string | null;
  walkerProfileId: string;
  dogWalkerId: string;
};

export type WalkerDashboardData = {
  assignedDogs: AssignedDog[];
  activeWalks: WalkWithDog[];
};
