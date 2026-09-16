export type PaymentStatus =
  | "pending"
  | "authorized"
  | "held"
  | "released"
  | "refunded"
  | "disputed";

export interface EscrowPayment {
  id: string;

  gigId: string;

  homeownerId: string;
  workerId: string;

  amount: number;

  currency: "XAF";

  status: PaymentStatus;

  createdAt: string;

  releasedAt?: string;
}