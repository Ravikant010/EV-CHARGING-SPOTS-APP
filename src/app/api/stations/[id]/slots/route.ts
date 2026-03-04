import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import {
  getSlotsByStation,
  createSlot,
  getStationById,
} from "@/services/station.service";
import { createSlotSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const availableOnly = searchParams.get("available") === "true";

    const slots = await getSlotsByStation(id, availableOnly);

    return NextResponse.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error("Get slots error:", error);
    return NextResponse.json(
      { error: "Failed to fetch slots" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role === "USER") {
      return NextResponse.json(
        { error: "Only owners and admins can create slots" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const station = await getStationById(id);

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Only station owner or admin can create slots
    if (decoded.role !== "ADMIN" && station.ownerId !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = createSlotSchema.safeParse({
      ...body,
      stationId: id,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const slotId = await createSlot(validation.data);

    return NextResponse.json({
      success: true,
      data: { id: slotId },
    });
  } catch (error) {
    console.error("Create slot error:", error);
    return NextResponse.json(
      { error: "Failed to create slot" },
      { status: 500 }
    );
  }
}
