import { NextResponse } from "next/server";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";
import { createUser, getUserByEmail } from "@/services/station.service";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateResult = rateLimit(ip, { maxRequests: 10 });
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Too many requests", resetTime: rateResult.resetTime },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password, role } = validation.data;

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const userId = nanoid();
    await createUser({
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Generate token
    const token = signToken({ id: userId, email, role });

    return NextResponse.json({
      success: true,
      data: {
        user: { id: userId, name, email, role },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
