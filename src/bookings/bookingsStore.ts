import type {
  Booking,
  BookingStatus,
} from '../gigs/gigTypes';

const BOOKINGS_KEY = "jf_bookings";

function readBookings(): Booking[] {
  const raw =
    localStorage.getItem(BOOKINGS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as Booking[];
  } catch {
    return [];
  }
}

function writeBookings(
  bookings: Booking[]
): void {
  localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify(bookings)
  );
}

function createBookingId(): string {
  return `booking-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function notifyBookingsUpdated(): void {
  window.dispatchEvent(
    new Event("jf-bookings-updated")
  );
}

export function getBookings(): Booking[] {
  return readBookings();
}

export function getBooking(
  id: string
): Booking | null {
  return (
    readBookings().find(
      (booking) =>
        booking.id === id
    ) ?? null
  );
}

export function createBooking(
  booking: Omit<
    Booking,
    "id" | "createdAt" | "updatedAt" | "status"
  >
): Booking {
  const timestamp =
    new Date().toISOString();

  const newBooking: Booking = {
    ...booking,
    id: createBookingId(),
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const bookings = readBookings();

  writeBookings([
    newBooking,
    ...bookings,
  ]);

  notifyBookingsUpdated();

  return newBooking;
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus
): Booking | null {
  const bookings = readBookings();

  const index =
    bookings.findIndex(
      (booking) =>
        booking.id === id
    );

  if (index === -1) {
    return null;
  }

  const updatedBooking: Booking = {
    ...bookings[index],
    status,
    updatedAt:
      new Date().toISOString(),
  };

  bookings[index] = updatedBooking;

  writeBookings(bookings);

  notifyBookingsUpdated();

  return updatedBooking;
}

export function deleteBooking(
  id: string
): void {
  const bookings =
    readBookings().filter(
      (booking) =>
        booking.id !== id
    );

  writeBookings(bookings);

  notifyBookingsUpdated();
}