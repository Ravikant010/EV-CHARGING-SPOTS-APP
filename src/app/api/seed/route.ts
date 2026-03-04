import { NextResponse } from "next/server";
import { store } from "@/lib/store";

export async function POST() {
  try {
    // Static data is automatically initialized in the store
    const stats = store.getStats();
    return NextResponse.json({
      success: true,
      message: "Static data initialized",
      stats,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to initialize data" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Static data is automatically initialized in the store
    const stats = store.getStats();
    return NextResponse.json({
      success: true,
      message: "Static data initialized",
      stats,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to initialize data" },
      { status: 500 }
    );
  }
}
