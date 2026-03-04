"use server";

import { store, Booking } from "@/lib/store";
import { getCurrentUser } from "./auth";
import { nanoid } from "nanoid";

export async function getBookings() {
  const user = await getCurrentUser();
  if (!user) return [];

  if (user.role === "ADMIN") {
    const bookings = store.getBookings();
    return enrichBookings(bookings);
  }

  if (user.role === "OWNER") {
    const stations = store.getStationsByOwner(user.id);
    const stationIds = stations.map((s) => s.id);
    const bookings = store.getBookings().filter((b) => stationIds.includes(b.stationId));
    return enrichBookings(bookings);
  }

  const bookings = store.getBookingsByUser(user.id);
  return enrichBookings(bookings);
}

function enrichBookings(bookings: Booking[]) {
  return bookings.map((booking) => {
    const station = store.getStationById(booking.stationId);
    const slot = store.getSlotById(booking.slotId);
    return {
      ...booking,
      station: station ? { name: station.name, address: station.address } : null,
      slot: slot
        ? {
            startTime: slot.startTime,
            endTime: slot.endTime,
            chargerType: slot.chargerType,
            powerOutput: slot.powerOutput,
          }
        : null,
    };
  });
}

export async function createBooking(slotId: string, stationId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Please login to book" };
  }

  const slot = store.getSlotById(slotId);
  if (!slot || !slot.isAvailable) {
    return { error: "Slot not available" };
  }

  // Check for existing booking
  const existingBookings = store.getBookings().filter(
    (b) => b.slotId === slotId && b.status === "CONFIRMED"
  );
  if (existingBookings.length > 0) {
    return { error: "Slot already booked" };
  }

  const booking: Booking = {
    id: `booking_${nanoid(8)}`,
    userId: user.id,
    slotId,
    stationId,
    status: "CONFIRMED",
    totalPrice: slot.price,
    createdAt: new Date().toISOString(),
  };

  store.createBooking(booking);
  return { success: true, booking };
}

export async function cancelBooking(bookingId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const booking = store.getBookingById(bookingId);
  if (!booking) {
    return { error: "Booking not found" };
  }

  if (booking.userId !== user.id && user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  store.updateBooking(bookingId, { status: "CANCELLED" });
  return { success: true };
}

export async function getBookingStats() {
  const user = await getCurrentUser();
  if (!user) {
    return { totalBookings: 0, activeBookings: 0 };
  }

  const stats = store.getStats();

  if (user.role === "ADMIN") {
    return {
      totalBookings: stats.totalBookings,
      activeBookings: stats.activeBookings,
    };
  }

  const userBookings = store.getBookingsByUser(user.id);
  return {
    totalBookings: userBookings.length,
    activeBookings: userBookings.filter((b) => b.status === "CONFIRMED").length,
  };
}
