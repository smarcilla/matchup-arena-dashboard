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

/**
 * Representa el archivo JSON de una competición/matchday específico
 */
export type CompetitionFile = {
  name: string;
  matchday: number;
  players: Player[];
};

/**
 * Representa el índice raíz que lista todas las competiciones activas
 */
export type RootIndex = {
  competitions: {
    name: string;
    matchday: number;
    file: string; // ruta JSON en blob
  }[];
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
  image: string; // URL temporal o final
  imageUploaded: boolean; // si la imagen ya está en Blob
  ranking: number;
};

/**
 * Estado completo del dashboard (almacenado en Blob como draft)
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

export type ValidationResult = {
  valid: boolean;
  errors: string[];
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
