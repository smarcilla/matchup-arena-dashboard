import { NextResponse } from "next/server";
import { getDashboardState } from "@/lib/actions";

/**
 * GET /api/state - Obtiene el estado actual del dashboard desde la BD
 */
export async function GET() {
  try {
    const state = await getDashboardState();
    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error("Error getting state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dashboard state" },
      { status: 500 }
    );
  }
}

