import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import { createBooking, getUserBookings, getBookingStats } from "@/services/booking.service";
import { createBookingSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const bookingStats = await getBookingStats(decoded.id, decoded.role);
      return NextResponse.json({
        success: true,
        data: bookingStats,
      });
    }

    const bookings = await getUserBookings(decoded.id);

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await createBooking(
      decoded.id,
      validation.data.slotId,
      validation.data.stationId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Booking failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { bookingId: result.bookingId },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { error: "Booking failed" },
      { status: 500 }
    );
  }
}
