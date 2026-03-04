import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import { cancelBooking } from "@/services/booking.service";

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
    const result = await cancelBooking(id, decoded.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Cancellation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Cancellation failed" },
      { status: 500 }
    );
  }
}
