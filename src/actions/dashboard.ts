"use server";

import { store } from "@/lib/store";
import { getCurrentUser } from "./auth";

export async function getDashboardStats() {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const stats = store.getStats();

  if (user.role === "ADMIN") {
    return {
      users: {
        total: store.getUsers().length,
      },
      stations: {
        total: stats.totalStations,
        active: store.getStations().filter((s) => s.status === "ACTIVE").length,
      },
      bookings: {
        total: stats.totalBookings,
        active: stats.activeBookings,
      },
      contacts: {
        pending: stats.pendingContacts,
      },
    };
  }

  if (user.role === "OWNER") {
    const stations = store.getStationsByOwner(user.id);
    const stationIds = stations.map((s) => s.id);
    const bookings = store.getBookings().filter((b) => stationIds.includes(b.stationId));
    const slots = store.getSlots().filter((s) => stationIds.includes(s.stationId));

    return {
      stations: {
        total: stations.length,
        active: stations.filter((s) => s.status === "ACTIVE").length,
      },
      slots: {
        total: slots.length,
      },
      bookings: {
        total: bookings.length,
      },
    };
  }

  // Regular user
  const userBookings = store.getBookingsByUser(user.id);
  return {
    bookings: {
      total: userBookings.length,
      active: userBookings.filter((b) => b.status === "CONFIRMED").length,
    },
  };
}

export async function getUsers() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return [];
  }

  return store.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
  }));
}
