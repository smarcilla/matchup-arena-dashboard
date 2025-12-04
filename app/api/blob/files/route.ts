import { NextResponse } from "next/server";
import { list, del } from "@vercel/blob";

/**
 * GET /api/blob/files - Lista archivos de imágenes en el Blob
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "images/";

    const { blobs } = await list({ prefix });

    const files = blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));

    return NextResponse.json({
      success: true,
      data: files,
    });
  } catch (error) {
    console.error("Error listing blob files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to list blob files" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/blob/files - Elimina un archivo del Blob
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL is required" },
        { status: 400 }
      );
    }

    await del(url);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blob file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blob file" },
      { status: 500 }
    );
  }
}

