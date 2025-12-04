// =============================================================================
// MATCHUP ARENA DASHBOARD - BLOB UTILITIES
// =============================================================================

import { put, del, list, head } from "@vercel/blob";
import type {
  CompetitionFile,
  RootIndex,
  DashboardState,
  BlobUploadResult,
  BlobFileInfo,
} from "./types";

// =============================================================================
// PATH HELPERS
// =============================================================================

/**
 * Genera la ruta del archivo JSON de una competición/matchday
 */
export function getCompetitionJsonPath(
  competitionSlug: string,
  matchday: number
): string {
  return `competitions/${competitionSlug}/${matchday}.json`;
}

/**
 * Genera la ruta del índice raíz
 */
export function getRootIndexPath(): string {
  return "competitions/index.json";
}

/**
 * Genera la ruta para una imagen de jugador
 */
export function getPlayerImagePath(
  competitionSlug: string,
  matchday: number,
  playerName: string,
  extension: string = "webp"
): string {
  const safeName = playerName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `images/${competitionSlug}/${matchday}/${safeName}.${extension}`;
}

/**
 * Genera la ruta para el estado del dashboard (borrador)
 */
export function getDraftStatePath(): string {
  return "draft/dashboard-state.json";
}

// =============================================================================
// UPLOAD FUNCTIONS
// =============================================================================

/**
 * Sube un archivo JSON de competición al Blob
 */
export async function uploadCompetitionJson(
  competitionSlug: string,
  matchday: number,
  data: CompetitionFile
): Promise<BlobUploadResult> {
  const pathname = getCompetitionJsonPath(competitionSlug, matchday);
  const content = JSON.stringify(data, null, 2);

  const blob = await put(pathname, content, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

/**
 * Sube el índice raíz al Blob
 */
export async function uploadRootIndex(
  data: RootIndex
): Promise<BlobUploadResult> {
  const pathname = getRootIndexPath();
  const content = JSON.stringify(data, null, 2);

  const blob = await put(pathname, content, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

/**
 * Sube una imagen de jugador al Blob
 */
export async function uploadPlayerImage(
  competitionSlug: string,
  matchday: number,
  playerName: string,
  file: File | Blob | ArrayBuffer | Buffer
): Promise<BlobUploadResult> {
  // Determinar extensión
  let extension = "webp";
  if (file instanceof File) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext && ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
      extension = ext === "jpeg" ? "jpg" : ext;
    }
  }

  const pathname = getPlayerImagePath(
    competitionSlug,
    matchday,
    playerName,
    extension
  );

  const blob = await put(pathname, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

/**
 * Sube el estado del dashboard (borrador)
 */
export async function uploadDraftState(
  state: DashboardState
): Promise<BlobUploadResult> {
  const pathname = getDraftStatePath();
  const content = JSON.stringify(state, null, 2);

  const blob = await put(pathname, content, {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });

  return {
    url: blob.url,
    pathname: blob.pathname,
  };
}

// =============================================================================
// READ FUNCTIONS
// =============================================================================

/**
 * Obtiene el estado del dashboard desde el Blob
 */
export async function getDraftState(): Promise<DashboardState | null> {
  try {
    const pathname = getDraftStatePath();
    const blobUrl = process.env.BLOB_BUCKET_URL;

    if (!blobUrl) {
      throw new Error("BLOB_BUCKET_URL not configured");
    }

    const response = await fetch(`${blobUrl}/${pathname}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch draft state: ${response.status}`);
    }

    return (await response.json()) as DashboardState;
  } catch (error) {
    console.error("Error getting draft state:", error);
    return null;
  }
}

/**
 * Obtiene el índice raíz desde el Blob
 */
export async function getRootIndex(): Promise<RootIndex | null> {
  try {
    const pathname = getRootIndexPath();
    const blobUrl = process.env.BLOB_BUCKET_URL;

    if (!blobUrl) {
      throw new Error("BLOB_BUCKET_URL not configured");
    }

    const response = await fetch(`${blobUrl}/${pathname}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch root index: ${response.status}`);
    }

    return (await response.json()) as RootIndex;
  } catch (error) {
    console.error("Error getting root index:", error);
    return null;
  }
}

/**
 * Obtiene un archivo de competición desde el Blob
 */
export async function getCompetitionFile(
  competitionSlug: string,
  matchday: number
): Promise<CompetitionFile | null> {
  try {
    const pathname = getCompetitionJsonPath(competitionSlug, matchday);
    const blobUrl = process.env.BLOB_BUCKET_URL;

    if (!blobUrl) {
      throw new Error("BLOB_BUCKET_URL not configured");
    }

    const response = await fetch(`${blobUrl}/${pathname}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch competition file: ${response.status}`);
    }

    return (await response.json()) as CompetitionFile;
  } catch (error) {
    console.error("Error getting competition file:", error);
    return null;
  }
}

// =============================================================================
// LIST & DELETE FUNCTIONS
// =============================================================================

/**
 * Lista archivos en el Blob con un prefijo opcional
 */
export async function listBlobFiles(prefix?: string): Promise<BlobFileInfo[]> {
  try {
    const { blobs } = await list({
      prefix,
    });

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error) {
    console.error("Error listing blob files:", error);
    return [];
  }
}

/**
 * Elimina un archivo del Blob
 */
export async function deleteBlobFile(url: string): Promise<boolean> {
  try {
    await del(url);
    return true;
  } catch (error) {
    console.error("Error deleting blob file:", error);
    return false;
  }
}

/**
 * Verifica si un archivo existe en el Blob
 */
export async function blobFileExists(url: string): Promise<boolean> {
  try {
    await head(url);
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// INDEX GENERATION
// =============================================================================

/**
 * Genera y sube el índice raíz basado en el estado del dashboard
 */
export async function generateAndUploadRootIndex(
  state: DashboardState
): Promise<BlobUploadResult> {
  const publishedMatchdays = state.matchdays.filter(
    (m) => m.status === "published"
  );

  const competitions: RootIndex["competitions"] = [];

  for (const matchday of publishedMatchdays) {
    const competition = state.competitions.find(
      (c) => c.id === matchday.competitionId
    );

    if (competition) {
      // Encontrar el matchday más reciente publicado para esta competición
      const existingIndex = competitions.findIndex(
        (c) => c.name === competition.name
      );

      const filePath = getCompetitionJsonPath(
        competition.slug,
        matchday.matchday
      );

      if (existingIndex >= 0) {
        // Actualizar si este matchday es más reciente
        if (matchday.matchday > competitions[existingIndex].matchday) {
          competitions[existingIndex] = {
            name: competition.name,
            matchday: matchday.matchday,
            file: filePath,
          };
        }
      } else {
        competitions.push({
          name: competition.name,
          matchday: matchday.matchday,
          file: filePath,
        });
      }
    }
  }

  const rootIndex: RootIndex = { competitions };
  return await uploadRootIndex(rootIndex);
}

// =============================================================================
// HELPER: Create initial state
// =============================================================================

/**
 * Crea un estado inicial vacío para el dashboard
 */
export function createInitialDashboardState(): DashboardState {
  return {
    competitions: [],
    matchdays: [],
    lastUpdated: new Date().toISOString(),
  };
}
