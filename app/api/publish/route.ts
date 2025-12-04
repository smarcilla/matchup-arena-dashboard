import { NextResponse } from "next/server";
import { publishMatchday } from "@/lib/actions";

/**
 * POST /api/publish - Publica un matchday
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { matchdayId } = body;

    if (!matchdayId) {
      return NextResponse.json(
        { success: false, error: "Matchday ID is required" },
        { status: 400 }
      );
    }

    const result = await publishMatchday(matchdayId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error publishing matchday:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish matchday" },
      { status: 500 }
    );
  }
}
