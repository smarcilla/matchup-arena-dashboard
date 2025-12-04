// =============================================================================
// MATCHUP ARENA DASHBOARD - TYPE DEFINITIONS
// =============================================================================

/**
 * Representa un jugador en una competición
 */
export type Player = {
  name: string;
  image: string; // URL Blob
  ranking: number;
};

// =============================================================================
// DRAFT TYPES - Para el modo borrador antes de publicar
// =============================================================================

/**
 * Estado de un borrador
 */
export type DraftStatus = "draft" | "ready" | "published";

/**
 * Competición en modo borrador (antes de publicar)
 */
export type DraftCompetition = {
  id: string;
  name: string;
  slug: string; // nombre normalizado para rutas (ej: "la-liga")
  createdAt: string;
  updatedAt: string;
};

/**
 * Matchday en modo borrador
 */
export type DraftMatchday = {
  id: string;
  competitionId: string;
  matchday: number;
  status: DraftStatus;
  players: DraftPlayer[];
  createdAt: string;
  updatedAt: string;
};

/**
 * Jugador en modo borrador
 */
export type DraftPlayer = {
  id: string;
  name: string;
  image: string; // URL de imagen en Blob
  imageUploaded: boolean; // si la imagen ya está en Blob
  ranking: number;
};

/**
 * Estado completo del dashboard
 */
export type DashboardState = {
  competitions: DraftCompetition[];
  matchdays: DraftMatchday[];
  lastUpdated: string;
};

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type BlobUploadResult = {
  url: string;
  pathname: string;
};

// =============================================================================
// FORM TYPES
// =============================================================================

export type CompetitionFormData = {
  name: string;
  slug: string;
};

export type MatchdayFormData = {
  competitionId: string;
  matchday: number;
};

export type PlayerFormData = {
  name: string;
  ranking: number;
  image?: File;
};

// =============================================================================
// BLOB FILE INFO
// =============================================================================

export type BlobFileInfo = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
};
