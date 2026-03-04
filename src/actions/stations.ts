"use server";

import { store, Booking } from "@/lib/store";
import { getCurrentUser } from "./auth";
import { nanoid } from "nanoid";

export async function getStations() {
  const stations = store.getStations();

  // Add slot counts to each station
  return stations.map((station) => {
    const slots = store.getSlotsByStation(station.id);
    return {
      ...station,
      slotsCount: slots.length,
      availableSlots: slots.filter((s) => s.isAvailable).length,
    };
  });
}

export async function getStationById(id: string) {
  const station = store.getStationById(id);
  if (!station) return null;

  const slots = store.getSlotsByStation(id);
  return {
    ...station,
    slots,
  };
}

export async function createStation(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const description = formData.get("description") as string;

  if (!name || !address) {
    return { error: "Name and address are required" };
  }

  const station = {
    id: `station_${nanoid(8)}`,
    ownerId: user.id,
    name,
    address,
    description: description || "",
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString(),
  };

  store.createStation(station);
  return { success: true, station };
}

export async function deleteStation(id: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return { error: "Unauthorized" };
  }

  const station = store.getStationById(id);
  if (!station) {
    return { error: "Station not found" };
  }

  if (user.role !== "ADMIN" && station.ownerId !== user.id) {
    return { error: "Forbidden" };
  }

  store.deleteStation(id);
  return { success: true };
}

export async function getSlots(stationId: string) {
  return store.getSlotsByStation(stationId);
}
