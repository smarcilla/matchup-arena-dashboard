import { NextResponse } from "next/server";
import {
  getDraftState,
  uploadDraftState,
  createInitialDashboardState,
} from "@/lib/blob";
import { validateDashboardState } from "@/lib/validators";
import type { DashboardState } from "@/lib/types";

/**
 * GET /api/state - Obtiene el estado actual del dashboard
 */
export async function GET() {
  try {
    let state = await getDraftState();

    if (!state) {
      // Crear estado inicial si no existe
      state = createInitialDashboardState();
      await uploadDraftState(state);
    }

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error("Error getting state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get dashboard state" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/state - Actualiza el estado completo del dashboard
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const state = body as DashboardState;

    // Validar el estado
    const validation = validateDashboardState(state);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: "Invalid state", errors: validation.errors },
        { status: 400 }
      );
    }

    // Actualizar timestamp
    state.lastUpdated = new Date().toISOString();

    // Guardar en Blob
    await uploadDraftState(state);

    return NextResponse.json({ success: true, data: state });
  } catch (error) {
    console.error("Error updating state:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update dashboard state" },
      { status: 500 }
    );
  }
}
