import { NextResponse } from "next/server";
import {
  getDraftState,
  uploadDraftState,
  uploadCompetitionJson,
  generateAndUploadRootIndex,
} from "@/lib/blob";
import {
  validateMatchdayForPublish,
  draftToCompetitionFile,
} from "@/lib/validators";

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

    // Obtener estado actual
    const state = await getDraftState();
    if (!state) {
      return NextResponse.json(
        { success: false, error: "Dashboard state not found" },
        { status: 404 }
      );
    }

    // Encontrar el matchday
    const matchdayIndex = state.matchdays.findIndex((m) => m.id === matchdayId);
    if (matchdayIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Matchday not found" },
        { status: 404 }
      );
    }

    const matchday = state.matchdays[matchdayIndex];

    // Encontrar la competición
    const competition = state.competitions.find(
      (c) => c.id === matchday.competitionId
    );
    if (!competition) {
      return NextResponse.json(
        { success: false, error: "Competition not found" },
        { status: 404 }
      );
    }

    // Validar que el matchday está listo para publicar
    const validation = validateMatchdayForPublish(matchday);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Matchday is not ready for publishing",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Convertir a formato de publicación
    const competitionFile = draftToCompetitionFile(matchday, competition);

    // Subir JSON de competición
    const jsonResult = await uploadCompetitionJson(
      competition.slug,
      matchday.matchday,
      competitionFile
    );

    // Actualizar estado del matchday a publicado
    state.matchdays[matchdayIndex] = {
      ...matchday,
      status: "published",
      updatedAt: new Date().toISOString(),
    };

    // Guardar estado actualizado
    await uploadDraftState(state);

    // Regenerar índice raíz
    const indexResult = await generateAndUploadRootIndex(state);

    return NextResponse.json({
      success: true,
      data: {
        competitionJson: {
          url: jsonResult.url,
          pathname: jsonResult.pathname,
        },
        rootIndex: {
          url: indexResult.url,
          pathname: indexResult.pathname,
        },
      },
    });
  } catch (error) {
    console.error("Error publishing matchday:", error);
    return NextResponse.json(
      { success: false, error: "Failed to publish matchday" },
      { status: 500 }
    );
  }
}
