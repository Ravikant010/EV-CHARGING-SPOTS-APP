import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import {
  getUserStats,
  getStationStats,
  getAllUsers,
} from "@/services/station.service";
import { getBookingStats } from "@/services/booking.service";
import { getContactStats } from "@/services/contact.service";

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
    const type = searchParams.get("type") || "overview";

    const stats: any = {};

    if (decoded.role === "ADMIN") {
      if (type === "users") {
        stats.users = await getUserStats();
        stats.userList = await getAllUsers({ limit: 10 });
      } else {
        stats.userStats = await getUserStats();
        stats.stationStats = await getStationStats(decoded.id, decoded.role);
        stats.bookingStats = await getBookingStats(decoded.id, decoded.role);
        stats.contactStats = await getContactStats();
      }
    } else if (decoded.role === "OWNER") {
      stats.stationStats = await getStationStats(decoded.id, decoded.role);
      stats.bookingStats = await getBookingStats(decoded.id, decoded.role);
    } else {
      stats.bookingStats = await getBookingStats(decoded.id, decoded.role);
    }

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
