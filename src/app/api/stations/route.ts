import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import {
  getStations,
  createStation,
} from "@/services/station.service";
import { createStationSchema } from "@/lib/validation";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    // Check for auth to determine if filtering by owner
    const token = extractToken(req.headers.get("authorization"));
    let ownerId: string | undefined;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.role === "OWNER") {
        ownerId = searchParams.get("mine") === "true" ? decoded.id : undefined;
      }
    }

    const stations = await getStations({
      ownerId,
      status,
      search,
    });

    return NextResponse.json({
      success: true,
      data: stations,
    });
  } catch (error) {
    console.error("Get stations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stations" },
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
    if (!decoded || decoded.role !== "OWNER") {
      return NextResponse.json(
        { error: "Only station owners can create stations" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validation = createStationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const stationId = await createStation({
      ownerId: decoded.id,
      ...validation.data,
    });

    return NextResponse.json({
      success: true,
      data: { id: stationId },
    });
  } catch (error) {
    console.error("Create station error:", error);
    return NextResponse.json(
      { error: "Failed to create station" },
      { status: 500 }
    );
  }
}
