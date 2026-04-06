export type PaymentPeriodStatus = "OPEN" | "PAID" | "REOPENED" | "ARCHIVED";
export type PaymentEntryType = "WALK" | "ADJUSTMENT";

export type PaymentEntry = {
  id: string;
  walkId: string | null;
  amount: string;         // decimal string, ILS
  entryType: PaymentEntryType;
  createdAt: Date;
};

export type PaymentPeriodWithEntries = {
  id: string;
  walkerProfileId: string;
  ownerUserId: string;
  status: PaymentPeriodStatus;
  totalAmount: string;    // decimal string, ILS
  lockVersion: number;
  paidAt: Date | null;
  createdAt: Date;
  entries: PaymentEntry[];
};

export type OwnerBillingData = {
  periods: PaymentPeriodWithEntries[];
};

export type WalkerBillingData = {
  periods: PaymentPeriodWithEntries[];
};

export type OwnerPaymentEntry = {
  id: string;
  entryType: PaymentEntryType;
  amount: string;         // decimal string, ILS
  createdAt: Date;
  walkId: string | null;
  dogName: string | null;
  walkDate: Date | null;
  walkStatus: string | null;
};

export type OwnerPaymentPeriod = {
  id: string;
  status: PaymentPeriodStatus;
  totalAmount: string;    // decimal string, ILS
  lockVersion: number;
  paidAt: Date | null;
  createdAt: Date;
  walkerDisplayName: string;
  pendingWalkCount: number; // walks completed but not yet tagged to this period
  entries: OwnerPaymentEntry[];
};
