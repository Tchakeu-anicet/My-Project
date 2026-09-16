export type GigStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "cancelled";

export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export interface Gig {
  id: string;

  title: string;
  description: string;

  category: string;
  location: string;

  budget: number;

  homeownerId: string;
  homeownerName: string;

  workerId?: string;
  workerName?: string;

  status: GigStatus;

  createdAt: string;
}

export interface Booking {
  id: string;

  gigId: string;

  homeownerId: string;
  homeownerName: string;

  workerId: string;
  workerName: string;

  message?: string;

  status: BookingStatus;

  createdAt: string;
  updatedAt: string;
}