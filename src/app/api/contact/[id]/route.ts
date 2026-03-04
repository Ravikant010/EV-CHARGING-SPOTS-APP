import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import { updateContactStatus } from "@/services/contact.service";

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
    if (!decoded || decoded.role === "USER") {
      return NextResponse.json(
        { error: "Only admins can update contact requests" },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await req.json();
    const { status, response } = body;

    const success = await updateContactStatus(id, status, response);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to update contact" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update contact error:", error);
    return NextResponse.json(
      { error: "Update failed" },
      { status: 500 }
    );
  }
}
