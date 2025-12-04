import { NextResponse } from "next/server";
import { listBlobFiles, deleteBlobFile } from "@/lib/blob";

/**
 * GET /api/blob/files - Lista archivos en el Blob
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || undefined;

    const files = await listBlobFiles(prefix);

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

    const success = await deleteBlobFile(url);

    if (!success) {
      return NextResponse.json(
        { success: false, error: "Failed to delete file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blob file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blob file" },
      { status: 500 }
    );
  }
}
