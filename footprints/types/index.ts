export interface User {
  id: string;
  email: string;
  name: string;
  role: 'walker' | 'owner';
  createdAt: Date;
}

export interface Dog {
  id: string;
  ownerId: string;
  name: string;
  breed: string | null;
  birthDate: Date | null;
  medicalNotes: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Walk {
  id: string;
  dogId: string;
  walkerId: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'AUTO_CLOSED' | 'CANCELLED';
  scheduledAt: Date | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationMinutes: number | null;
  notes: string | null;
  paymentPeriodId: string | null;
  autoClosedAt: Date | null;
  createdAt: Date;
}

export interface PaymentPeriod {
  id: string;
  ownerId: string;
  walkerId: string;
  status: 'OPEN' | 'CLOSED';
  totalAmountIls: string; // numeric stored as string from Postgres
  openedAt: Date;
  closedAt: Date | null;
  lockVersion: number; // optimistic concurrency
}

export interface PaymentEntry {
  id: string;
  periodId: string;
  walkId: string;
  amountIls: string;
  createdAt: Date;
}

export interface DogWalker {
  id: string;
  userId: string;
  currentPriceIls: string | null; // set by owner per dog-walker pair
  isActive: boolean;
}

export interface WalkMedia {
  id: string;
  walkId: string;
  uploaderUserId: string;
  blobUrl: string;
  uploadStatus: 'PENDING' | 'UPLOADED' | 'FAILED';
  createdAt: Date;
}
