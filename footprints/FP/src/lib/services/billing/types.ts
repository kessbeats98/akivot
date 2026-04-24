export type PaymentPeriodWithEntries = {
  id: string;
  startDate: Date;
  endDate: Date;
  status: 'OPEN' | 'PAID';
  totalAmount: string;
  lockVersion: number;
  ownerUserId: string;
  entries: {
    id: string;
    date: Date;
    amount: string;
    description: string;
  }[];
};
