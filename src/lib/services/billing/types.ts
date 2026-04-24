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

export type WalkerPaymentEntry = {
  id: string;
  walkId: string | null;
  amount: string;          // decimal string, ILS
  entryType: PaymentEntryType;
  createdAt: Date;
  // enriched (WALK entries only — ADJUSTMENT entries have walkId=null)
  dogName: string | null;
  walkDate: Date | null;   // walks.startTime
  walkStatus: string | null;
};

export type WalkerPaymentPeriod = {
  id: string;
  ownerUserId: string;
  status: PaymentPeriodStatus;
  totalAmount: string;
  lockVersion: number;
  paidAt: Date | null;
  createdAt: Date;
  ownerDisplayName: string | null;
  ownerPhone: string | null;
  entries: WalkerPaymentEntry[];
};

export type UnbilledWalk = {
  walkId: string;
  dogName: string;
  walkDate: Date | null;
  finalPrice: string;
  ownerUserId: string;
  ownerDisplayName: string | null;
};

export type WalkerBillingData = {
  periods: WalkerPaymentPeriod[];
  unbilledWalks: UnbilledWalk[];
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
