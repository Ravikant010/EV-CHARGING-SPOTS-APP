import { z } from "zod";

// Auth schemas
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "OWNER", "ADMIN"]).default("USER"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Station schemas
export const createStationSchema = z.object({
  name: z.string().min(2, "Station name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
});

export const updateStationSchema = z.object({
  name: z.string().min(2).optional(),
  address: z.string().min(5).optional(),
  description: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "MAINTENANCE"]).optional(),
});

// Slot schemas
export const createSlotSchema = z.object({
  stationId: z.string().min(1, "Station ID is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  price: z.string().default("0"),
  chargerType: z.enum(["LEVEL1", "LEVEL2", "DC_FAST"]).default("LEVEL2"),
  powerOutput: z.string().default("7.2"),
});

// Booking schemas
export const createBookingSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  stationId: z.string().min(1, "Station ID is required"),
});

// Contact schemas
export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

// Types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateStationInput = z.infer<typeof createStationSchema>;
export type UpdateStationInput = z.infer<typeof updateStationSchema>;
export type CreateSlotInput = z.infer<typeof createSlotSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
