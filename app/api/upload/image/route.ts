import { NextResponse } from "next/server";
import { uploadPlayerImage } from "@/lib/blob";

/**
 * POST /api/upload/image - Sube una imagen de jugador al Blob
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const competitionSlug = formData.get("competitionSlug") as string | null;
    const matchday = formData.get("matchday") as string | null;
    const playerName = formData.get("playerName") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    if (!competitionSlug || !matchday || !playerName) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: competitionSlug, matchday, playerName",
        },
        { status: 400 }
      );
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
        },
        { status: 400 }
      );
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size: 5MB" },
        { status: 400 }
      );
    }

    const result = await uploadPlayerImage(
      competitionSlug,
      parseInt(matchday, 10),
      playerName,
      file
    );

    return NextResponse.json({
      success: true,
      data: {
        url: result.url,
        pathname: result.pathname,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
