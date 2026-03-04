"use server";

import { store, User } from "@/lib/store";
import { hashPassword, comparePassword, signToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!name || !email || !password) {
    return { error: "All fields are required" };
  }

  // Check if user exists
  const existingUser = store.getUserByEmail(email);
  if (existingUser) {
    return { error: "Email already registered" };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user: User = {
    id: nanoid(),
    name,
    email,
    password: hashedPassword,
    role: role as "USER" | "OWNER" | "ADMIN",
    createdAt: new Date().toISOString(),
  };

  store.createUser(user);

  // Generate token
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return {
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  // Find user
  const user = store.getUserByEmail(email);
  if (!user) {
    return { error: "Invalid credentials" };
  }

  // Verify password
  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    return { error: "Invalid credentials" };
  }

  // Generate token
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return {
    success: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth-token");
  return { success: true };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) {
    return null;
  }

  const { verifyToken } = await import("@/lib/auth");
  const decoded = verifyToken(token);

  if (!decoded) {
    return null;
  }

  const user = store.getUserById(decoded.id);
  if (!user) {
    return null;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
