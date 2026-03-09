export type WalkStatus = "PLANNED" | "LIVE" | "COMPLETED" | "AUTO_CLOSED" | "CANCELLED";

export type WalkWithDog = {
  id: string;
  status: WalkStatus;
  startTime: Date;
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

export type AssignedDog = {
  dogWalkerId: string;
  dogId: string;
  dogName: string;
  dogBreed: string | null;
  currentPrice: string;
  currency: string;
};

export type WalkerDashboardData = {
  assignedDogs: AssignedDog[];
  activeWalks: WalkWithDog[];
};
