// Static data store - acts as our in-memory database
// Data persists during server runtime

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "USER" | "OWNER" | "ADMIN";
  createdAt: string;
}

export interface Station {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  createdAt: string;
}

export interface Slot {
  id: string;
  stationId: string;
  startTime: string;
  endTime: string;
  price: string;
  chargerType: "LEVEL1" | "LEVEL2" | "DC_FAST";
  powerOutput: string;
  isAvailable: boolean;
  createdAt: string;
}

export type ChargerType = "LEVEL1" | "LEVEL2" | "DC_FAST";

export interface Booking {
  id: string;
  userId: string;
  slotId: string;
  stationId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  totalPrice: string;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
}

// Helper to generate dates
const getDate = (daysFromNow: number, hour: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const now = new Date().toISOString();

// Pre-hashed password for "demo123" - generated with bcrypt
const DEMO_PASSWORD = "$2b$10$fDuyeX2fuUYmyqkBQudzYOIqfxsFVCOQrOHkL0Z0OCn766xVPGToS";

// In-memory data store
class DataStore {
  private users: User[] = [];
  private stations: Station[] = [];
  private slots: Slot[] = [];
  private bookings: Booking[] = [];
  private contacts: ContactRequest[] = [];
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    if (this.initialized) return;
    this.initialized = true;

    // Create demo users
    this.users = [
      {
        id: "admin_001",
        name: "Admin User",
        email: "admin@evbooking.com",
        password: DEMO_PASSWORD,
        role: "ADMIN",
        createdAt: now,
      },
      {
        id: "owner_001",
        name: "Station Owner",
        email: "owner@evbooking.com",
        password: DEMO_PASSWORD,
        role: "OWNER",
        createdAt: now,
      },
      {
        id: "user_001",
        name: "Demo User",
        email: "user@evbooking.com",
        password: DEMO_PASSWORD,
        role: "USER",
        createdAt: now,
      },
    ];

    // Create demo stations
    this.stations = [
      {
        id: "station_001",
        ownerId: "owner_001",
        name: "Downtown EV Hub",
        address: "123 Main Street, Downtown",
        description: "Central charging station with fast chargers and 24/7 availability",
        status: "ACTIVE",
        createdAt: now,
      },
      {
        id: "station_002",
        ownerId: "owner_001",
        name: "Mall Charging Center",
        address: "456 Shopping Ave, Westside Mall",
        description: "Convenient charging while you shop - Level 2 and DC Fast available",
        status: "ACTIVE",
        createdAt: now,
      },
      {
        id: "station_003",
        ownerId: "owner_001",
        name: "Airport Express Charge",
        address: "789 Airport Blvd, Terminal 2",
        description: "Quick charge before your flight with premium DC Fast chargers",
        status: "ACTIVE",
        createdAt: now,
      },
    ];

    // Create demo slots for next 3 days
    const slots: Slot[] = [];
    let slotId = 1;

    for (let stationIdx = 1; stationIdx <= 3; stationIdx++) {
      for (let day = 0; day < 3; day++) {
        for (let hour = 8; hour < 20; hour += 2) {
          slots.push({
            id: `slot_${String(slotId).padStart(3, "0")}`,
            stationId: `station_00${stationIdx}`,
            startTime: getDate(day, hour),
            endTime: getDate(day, hour + 2),
            price: stationIdx === 3 ? "15.00" : "10.00",
            chargerType: stationIdx === 3 ? "DC_FAST" : "LEVEL2",
            powerOutput: stationIdx === 3 ? "50" : "7.2",
            isAvailable: true,
            createdAt: now,
          });
          slotId++;
        }
      }
    }
    this.slots = slots;

    // Empty bookings and contacts
    this.bookings = [];
    this.contacts = [];
  }

  // Users
  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  createUser(user: User): User {
    this.users.push(user);
    return user;
  }

  updateUser(id: string, data: Partial<User>): User | undefined {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;
    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  // Stations
  getStations(): Station[] {
    return this.stations;
  }

  getStationById(id: string): Station | undefined {
    return this.stations.find((s) => s.id === id);
  }

  getStationsByOwner(ownerId: string): Station[] {
    return this.stations.filter((s) => s.ownerId === ownerId);
  }

  createStation(station: Station): Station {
    this.stations.push(station);
    return station;
  }

  updateStation(id: string, data: Partial<Station>): Station | undefined {
    const index = this.stations.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.stations[index] = { ...this.stations[index], ...data };
    return this.stations[index];
  }

  deleteStation(id: string): boolean {
    const index = this.stations.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.stations.splice(index, 1);
    // Also delete related slots
    this.slots = this.slots.filter((s) => s.stationId !== id);
    return true;
  }

  // Slots
  getSlots(): Slot[] {
    return this.slots;
  }

  getSlotsByStation(stationId: string): Slot[] {
    return this.slots.filter((s) => s.stationId === stationId);
  }

  getSlotById(id: string): Slot | undefined {
    return this.slots.find((s) => s.id === id);
  }

  updateSlot(id: string, data: Partial<Slot>): Slot | undefined {
    const index = this.slots.findIndex((s) => s.id === id);
    if (index === -1) return undefined;
    this.slots[index] = { ...this.slots[index], ...data };
    return this.slots[index];
  }

  // Bookings
  getBookings(): Booking[] {
    return this.bookings;
  }

  getBookingsByUser(userId: string): Booking[] {
    return this.bookings.filter((b) => b.userId === userId);
  }

  getBookingsByStation(stationId: string): Booking[] {
    return this.bookings.filter((b) => b.stationId === stationId);
  }

  getBookingById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  createBooking(booking: Booking): Booking {
    this.bookings.push(booking);
    // Mark slot as unavailable
    this.updateSlot(booking.slotId, { isAvailable: false });
    return booking;
  }

  updateBooking(id: string, data: Partial<Booking>): Booking | undefined {
    const index = this.bookings.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    this.bookings[index] = { ...this.bookings[index], ...data };
    
    // If cancelled, mark slot as available again
    if (data.status === "CANCELLED") {
      const booking = this.bookings[index];
      this.updateSlot(booking.slotId, { isAvailable: true });
    }
    
    return this.bookings[index];
  }

  // Contact Requests
  getContactRequests(): ContactRequest[] {
    return this.contacts;
  }

  getContactRequestById(id: string): ContactRequest | undefined {
    return this.contacts.find((c) => c.id === id);
  }

  createContactRequest(contact: ContactRequest): ContactRequest {
    this.contacts.push(contact);
    return contact;
  }

  updateContactRequest(id: string, data: Partial<ContactRequest>): ContactRequest | undefined {
    const index = this.contacts.findIndex((c) => c.id === id);
    if (index === -1) return undefined;
    this.contacts[index] = { ...this.contacts[index], ...data };
    return this.contacts[index];
  }

  // Stats
  getStats() {
    return {
      totalUsers: this.users.length,
      totalStations: this.stations.length,
      totalSlots: this.slots.length,
      availableSlots: this.slots.filter((s) => s.isAvailable).length,
      totalBookings: this.bookings.length,
      activeBookings: this.bookings.filter((b) => b.status === "CONFIRMED").length,
      pendingContacts: this.contacts.filter((c) => c.status === "PENDING").length,
    };
  }
}

// Export singleton instance
export const store = new DataStore();
