import { NextResponse } from "next/server";
import { verifyToken, extractToken } from "@/lib/auth";
import {
  createContact,
  getContactRequests,
  getContactStats,
} from "@/services/contact.service";
import { contactSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(req: Request) {
  try {
    const token = extractToken(req.headers.get("authorization"));
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role === "USER") {
      return NextResponse.json(
        { error: "Only admins can view contact requests" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const stats = searchParams.get("stats") === "true";

    if (stats) {
      const contactStats = await getContactStats();
      return NextResponse.json({
        success: true,
        data: contactStats,
      });
    }

    const contacts = await getContactRequests({ status });

    return NextResponse.json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateResult = rateLimit(ip, { maxRequests: 5 });
    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Too many requests", resetTime: rateResult.resetTime },
        { status: 429 }
      );
    }

    const token = extractToken(req.headers.get("authorization"));
    let userId: string | undefined;

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        userId = decoded.id;
      }
    }

    const body = await req.json();
    const validation = contactSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    await createContact({
      userId,
      ...validation.data,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Create contact error:", error);
    return NextResponse.json(
      { error: "Submission failed" },
      { status: 500 }
    );
  }
}
