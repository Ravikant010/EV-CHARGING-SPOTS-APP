import {
  store,
  type Booking,
  type Slot,
  type Station,
} from "@/lib/store";
import { nanoid } from "nanoid";

export interface BookingWithDetails {
  id: string;
  userId: string;
  slotId: string;
  stationId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: string;
  createdAt: string;
  station?: {
    name: string;
    address: string;
  };
  slot?: {
    startTime: string;
    endTime: string;
    chargerType: string;
    powerOutput: string;
  };
}

export async function createBooking(
  userId: string,
  slotId: string,
  stationId: string
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    // Check if slot exists and is available
    const slot = store.getSlotById(slotId);

    if (!slot || !slot.isAvailable) {
      return { success: false, error: "Slot unavailable or not found" };
    }

    // Double-check for existing booking (prevent race condition)
    const existingBookings = store.getBookings();
    const existingBooking = existingBookings.find(
      (b) => b.slotId === slotId && b.status === "CONFIRMED"
    );

    if (existingBooking) {
      return { success: false, error: "Slot already booked" };
    }

    // Create booking
    const bookingId = `booking_${nanoid(8)}`;
    const booking: Booking = {
      id: bookingId,
      userId,
      slotId,
      stationId,
      status: "CONFIRMED",
      totalPrice: slot.price,
      createdAt: new Date().toISOString(),
    };

    store.createBooking(booking);

    return { success: true, bookingId };
  } catch (error) {
    console.error("Booking error:", error);
    return { success: false, error: "Booking failed due to server error" };
  }
}

export async function cancelBooking(
  bookingId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const booking = store.getBookingById(bookingId);

    if (!booking || booking.userId !== userId) {
      return { success: false, error: "Booking not found" };
    }

    if (booking.status === "CANCELLED") {
      return { success: false, error: "Booking already cancelled" };
    }

    // Update booking status
    store.updateBooking(bookingId, { status: "CANCELLED" });

    return { success: true };
  } catch (error) {
    console.error("Cancel booking error:", error);
    return { success: false, error: "Cancellation failed" };
  }
}

export async function getUserBookings(userId: string): Promise<BookingWithDetails[]> {
  const bookings = store.getBookingsByUser(userId);
  const stations = store.getStations();
  const slots = store.getSlots();

  return bookings.map((booking) => {
    const station = stations.find((s) => s.id === booking.stationId);
    const slot = slots.find((s) => s.id === booking.slotId);

    return {
      id: booking.id,
      userId: booking.userId,
      slotId: booking.slotId,
      stationId: booking.stationId,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      station: station
        ? { name: station.name, address: station.address }
        : undefined,
      slot: slot
        ? {
            startTime: slot.startTime,
            endTime: slot.endTime,
            chargerType: slot.chargerType,
            powerOutput: slot.powerOutput,
          }
        : undefined,
    };
  });
}

export async function getStationBookings(
  stationId: string
): Promise<BookingWithDetails[]> {
  const bookings = store.getBookingsByStation(stationId);
  const slots = store.getSlots();

  return bookings.map((booking) => {
    const slot = slots.find((s) => s.id === booking.slotId);

    return {
      id: booking.id,
      userId: booking.userId,
      slotId: booking.slotId,
      stationId: booking.stationId,
      status: booking.status,
      totalPrice: booking.totalPrice,
      createdAt: booking.createdAt,
      slot: slot
        ? {
            startTime: slot.startTime,
            endTime: slot.endTime,
            chargerType: slot.chargerType,
            powerOutput: slot.powerOutput,
          }
        : undefined,
    };
  });
}

export async function getBookingStats(
  userId: string,
  role: string
): Promise<{ totalBookings: number; activeBookings: number; cancelledBookings: number }> {
  if (role === "USER") {
    const bookings = store.getBookingsByUser(userId);
    return {
      totalBookings: bookings.length,
      activeBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
      cancelledBookings: bookings.filter((b) => b.status === "CANCELLED").length,
    };
  }

  if (role === "OWNER") {
    const ownerStations = store.getStationsByOwner(userId);
    const stationIds = ownerStations.map((s) => s.id);

    if (stationIds.length === 0) {
      return { totalBookings: 0, activeBookings: 0, cancelledBookings: 0 };
    }

    const allBookings = store.getBookings();
    const stationBookings = allBookings.filter((b) =>
      stationIds.includes(b.stationId)
    );

    return {
      totalBookings: stationBookings.length,
      activeBookings: stationBookings.filter((b) => b.status === "CONFIRMED").length,
      cancelledBookings: stationBookings.filter((b) => b.status === "CANCELLED").length,
    };
  }

  // Admin stats
  const bookings = store.getBookings();
  return {
    totalBookings: bookings.length,
    activeBookings: bookings.filter((b) => b.status === "CONFIRMED").length,
    cancelledBookings: bookings.filter((b) => b.status === "CANCELLED").length,
  };
}
