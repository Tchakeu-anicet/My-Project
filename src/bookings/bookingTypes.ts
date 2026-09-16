export type BookingStatus =
  | "booked"
  | "in-progress"
  | "completed"
  | "approved"
  | "cancelled"
  | "disputed";

export interface Booking {
  id: string;

  gigId: string;

  homeownerId: string;
  homeownerName: string;

  workerId: string;
  workerName: string;

  amount: number;

  status: BookingStatus;

  createdAt: string;

  completedAt?: string;
  approvedAt?: string;
}