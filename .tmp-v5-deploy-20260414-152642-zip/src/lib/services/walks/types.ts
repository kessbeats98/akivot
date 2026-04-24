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
  ownerName: string | null;
  ownerPhone: string | null;
};

export type CalendarWalk = {
  id: string;
  dogName: string;
  dogBreed: string | null;
  status: WalkStatus;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
};

export type WalkerCalendarData = { walks: CalendarWalk[] };

export type OwnerCalendarWalk = CalendarWalk & { walkerName: string };
export type OwnerCalendarData = { walks: OwnerCalendarWalk[] };

export type DogWalkHistoryItem = {
  id: string;
  status: WalkStatus;
  startTime: Date;
  endTime: Date | null;
  durationMinutes: number | null;
  finalPrice: string | null;
  walkerName: string;
  note: string | null;
  mediaPhotos: { id: string; storageKey: string; capturedAt: Date }[];
};

export type WalkerDashboardData = {
  assignedDogs: AssignedDog[];
  activeWalks: WalkWithDog[];
};
