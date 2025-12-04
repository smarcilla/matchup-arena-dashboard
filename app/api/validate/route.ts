import { NextResponse } from "next/server";
import { validateCompetitionFile, validateRootIndex } from "@/lib/validators";

/**
 * POST /api/validate - Valida estructuras JSON
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: "Type and data are required" },
        { status: 400 }
      );
    }

    let validation;

    switch (type) {
      case "competition":
        validation = validateCompetitionFile(data);
        break;
      case "rootIndex":
        validation = validateRootIndex(data);
        break;
      default:
        return NextResponse.json(
          { success: false, error: `Unknown type: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error("Error validating:", error);
    return NextResponse.json(
      { success: false, error: "Failed to validate" },
      { status: 500 }
    );
  }
}
