export type ConfirmationState = "WAITING" | "CONFIRMED" | "NOT_NEEDED";

export type OwnerAnswer = "CONFIRMED" | "NOT_NEEDED" | "UNSURE";

export type ConfirmationCardView = {
  dogId: string;
  state: ConfirmationState;
  updatedAt: Date;
  lastUnsureAt: Date | null;
};
