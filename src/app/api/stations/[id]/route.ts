import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import {
  getStationById,
  updateStation,
  deleteStation,
  getSlotsByStation,
} from "@/services/station.service";
import { updateStationSchema } from "@/lib/validation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const station = await getStationById(id);

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Get slots for this station
    const slots = await getSlotsByStation(id);

    return NextResponse.json({
      success: true,
      data: { ...station, slots },
    });
  } catch (error) {
    console.error("Get station error:", error);
    return NextResponse.json(
      { error: "Failed to fetch station" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const station = await getStationById(id);

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Only owner or admin can update
    if (decoded.role !== "ADMIN" && station.ownerId !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = updateStationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    await updateStation(id, validation.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update station error:", error);
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id } = await params;
    const station = await getStationById(id);

    if (!station) {
      return NextResponse.json({ error: "Station not found" }, { status: 404 });
    }

    // Only owner or admin can delete
    if (decoded.role !== "ADMIN" && station.ownerId !== decoded.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteStation(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete station error:", error);
    return NextResponse.json(
      { error: "Failed to delete station" },
      { status: 500 }
    );
  }
}
