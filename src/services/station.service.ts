import { store, type Station, type Slot, type User } from "@/lib/store";
import { nanoid } from "nanoid";

export interface CreateStationInput {
  ownerId: string;
  name: string;
  address: string;
  description?: string;
}

export interface CreateSlotInput {
  stationId: string;
  startTime: string;
  endTime: string;
  price?: string;
  chargerType?: "LEVEL1" | "LEVEL2" | "DC_FAST";
  powerOutput?: string;
}

// Station operations
export async function createStation(data: CreateStationInput): Promise<string> {
  const id = `station_${nanoid(8)}`;
  const station: Station = {
    id,
    ownerId: data.ownerId,
    name: data.name,
    address: data.address,
    description: data.description || "",
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };
  store.createStation(station);
  return id;
}

export async function getStations(options?: {
  ownerId?: string;
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Station[]> {
  let stations = store.getStations();

  if (options?.ownerId) {
    stations = stations.filter((s) => s.ownerId === options.ownerId);
  }

  if (options?.status) {
    stations = stations.filter((s) => s.status === options.status);
  }

  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    stations = stations.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.address.toLowerCase().includes(searchLower)
    );
  }

  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return stations.slice(offset, offset + limit);
}

export async function getStationById(id: string): Promise<Station | undefined> {
  return store.getStationById(id);
}

export async function updateStation(
  id: string,
  data: Partial<{
    name: string;
    address: string;
    description: string;
    status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  }>
): Promise<boolean> {
  try {
    const result = store.updateStation(id, data);
    return !!result;
  } catch {
    return false;
  }
}

export async function deleteStation(id: string): Promise<boolean> {
  try {
    return store.deleteStation(id);
  } catch {
    return false;
  }
}

// Slot operations
export async function createSlot(data: CreateSlotInput): Promise<string> {
  const id = `slot_${nanoid(8)}`;
  const slot: Slot = {
    id,
    stationId: data.stationId,
    startTime: data.startTime,
    endTime: data.endTime,
    price: data.price || "10.00",
    chargerType: data.chargerType || "LEVEL2",
    powerOutput: data.powerOutput || "7.2",
    isAvailable: true,
    createdAt: new Date().toISOString(),
  };
  store.updateSlot(id, slot);
  return id;
}

export async function getSlotsByStation(
  stationId: string,
  availableOnly = false
): Promise<Slot[]> {
  let slots = store.getSlotsByStation(stationId);

  if (availableOnly) {
    slots = slots.filter((s) => s.isAvailable);
  }

  return slots;
}

export async function getSlotById(id: string): Promise<Slot | undefined> {
  return store.getSlotById(id);
}

export async function updateSlot(
  id: string,
  data: Partial<{
    startTime: string;
    endTime: string;
    price: string;
    chargerType: "LEVEL1" | "LEVEL2" | "DC_FAST";
    powerOutput: string;
    isAvailable: boolean;
  }>
): Promise<boolean> {
  try {
    const result = store.updateSlot(id, data);
    return !!result;
  } catch {
    return false;
  }
}

export async function deleteSlot(id: string): Promise<boolean> {
  try {
    // In our store, we can just update it to unavailable
    store.updateSlot(id, { isAvailable: false });
    return true;
  } catch {
    return false;
  }
}

// Stats
export async function getStationStats(
  userId?: string,
  role?: string
): Promise<{ totalStations: number; activeStations: number; totalSlots: number }> {
  const stats = store.getStats();

  if (role === "OWNER" && userId) {
    const stations = store.getStationsByOwner(userId);
    const activeStations = stations.filter((s) => s.status === "ACTIVE");
    const stationIds = stations.map((s) => s.id);
    const allSlots = store.getSlots();
    const totalSlots = allSlots.filter((s) => stationIds.includes(s.stationId)).length;

    return {
      totalStations: stations.length,
      activeStations: activeStations.length,
      totalSlots,
    };
  }

  if (role === "ADMIN") {
    return {
      totalStations: stats.totalStations,
      activeStations: store.getStations().filter((s) => s.status === "ACTIVE").length,
      totalSlots: stats.totalSlots,
    };
  }

  return {
    totalStations: 0,
    activeStations: 0,
    totalSlots: 0,
  };
}

// User operations
export async function getUserByEmail(email: string): Promise<User | undefined> {
  return store.getUserByEmail(email);
}

export async function getUserById(id: string): Promise<User | undefined> {
  return store.getUserById(id);
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: "USER" | "OWNER" | "ADMIN";
}): Promise<void> {
  store.createUser({
    id: data.id,
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role || "USER",
    createdAt: new Date().toISOString(),
  });
}

export async function getUserStats(): Promise<{
  total: number;
  users: number;
  owners: number;
}> {
  const users = store.getUsers();
  return {
    total: users.length,
    users: users.filter((u) => u.role === "USER").length,
    owners: users.filter((u) => u.role === "OWNER").length,
  };
}

export async function getAllUsers(options?: {
  limit?: number;
  offset?: number;
}): Promise<Omit<User, "password">[]> {
  const users = store.getUsers();
  const offset = options?.offset || 0;
  const limit = options?.limit || 50;

  return users
    .slice(offset, offset + limit)
    .map(({ password: _, ...user }) => user);
}
