// =============================================================================
// MATCHUP ARENA DASHBOARD - VALIDATORS
// =============================================================================

import type {
  Player,
  CompetitionFile,
  RootIndex,
  DashboardState,
  ValidationResult,
  DraftCompetition,
  DraftMatchday,
  DraftPlayer,
} from "./types";

// =============================================================================
// PLAYER VALIDATION
// =============================================================================

/**
 * Valida un objeto Player
 */
export function validatePlayer(player: unknown): ValidationResult {
  const errors: string[] = [];

  if (!player || typeof player !== "object") {
    return { valid: false, errors: ["Player must be an object"] };
  }

  const p = player as Record<string, unknown>;

  if (typeof p.name !== "string" || p.name.trim() === "") {
    errors.push("Player name is required and must be a non-empty string");
  }

  if (typeof p.image !== "string" || p.image.trim() === "") {
    errors.push("Player image URL is required and must be a non-empty string");
  } else if (!isValidUrl(p.image as string)) {
    errors.push("Player image must be a valid URL");
  }

  if (typeof p.ranking !== "number" || p.ranking < 0) {
    errors.push("Player ranking must be a non-negative number");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida un array de Players
 */
export function validatePlayers(players: unknown): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(players)) {
    return { valid: false, errors: ["Players must be an array"] };
  }

  if (players.length === 0) {
    errors.push("At least one player is required");
  }

  players.forEach((player, index) => {
    const result = validatePlayer(player);
    if (!result.valid) {
      errors.push(...result.errors.map((e) => `Player ${index + 1}: ${e}`));
    }
  });

  // Verificar rankings únicos
  const rankings = players
    .filter((p): p is Player => typeof p === "object" && p !== null)
    .map((p) => p.ranking);
  const uniqueRankings = new Set(rankings);
  if (rankings.length !== uniqueRankings.size) {
    errors.push("Player rankings must be unique");
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// COMPETITION FILE VALIDATION
// =============================================================================

/**
 * Valida un objeto CompetitionFile
 */
export function validateCompetitionFile(file: unknown): ValidationResult {
  const errors: string[] = [];

  if (!file || typeof file !== "object") {
    return { valid: false, errors: ["Competition file must be an object"] };
  }

  const f = file as Record<string, unknown>;

  if (typeof f.name !== "string" || f.name.trim() === "") {
    errors.push("Competition name is required and must be a non-empty string");
  }

  if (typeof f.matchday !== "number" || f.matchday < 1) {
    errors.push("Matchday must be a positive number");
  }

  const playersResult = validatePlayers(f.players);
  if (!playersResult.valid) {
    errors.push(...playersResult.errors);
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// ROOT INDEX VALIDATION
// =============================================================================

/**
 * Valida un objeto RootIndex
 */
export function validateRootIndex(index: unknown): ValidationResult {
  const errors: string[] = [];

  if (!index || typeof index !== "object") {
    return { valid: false, errors: ["Root index must be an object"] };
  }

  const i = index as Record<string, unknown>;

  if (!Array.isArray(i.competitions)) {
    errors.push("Root index must have a competitions array");
    return { valid: false, errors };
  }

  i.competitions.forEach((comp, idx) => {
    if (!comp || typeof comp !== "object") {
      errors.push(`Competition ${idx + 1}: must be an object`);
      return;
    }

    const c = comp as Record<string, unknown>;

    if (typeof c.name !== "string" || c.name.trim() === "") {
      errors.push(`Competition ${idx + 1}: name is required`);
    }

    if (typeof c.matchday !== "number" || c.matchday < 1) {
      errors.push(`Competition ${idx + 1}: matchday must be a positive number`);
    }

    if (typeof c.file !== "string" || c.file.trim() === "") {
      errors.push(`Competition ${idx + 1}: file path is required`);
    }
  });

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// DRAFT STATE VALIDATION
// =============================================================================

/**
 * Valida un objeto DraftCompetition
 */
export function validateDraftCompetition(
  competition: unknown
): ValidationResult {
  const errors: string[] = [];

  if (!competition || typeof competition !== "object") {
    return { valid: false, errors: ["Competition must be an object"] };
  }

  const c = competition as Record<string, unknown>;

  if (typeof c.id !== "string" || c.id.trim() === "") {
    errors.push("Competition ID is required");
  }

  if (typeof c.name !== "string" || c.name.trim() === "") {
    errors.push("Competition name is required");
  }

  if (typeof c.slug !== "string" || c.slug.trim() === "") {
    errors.push("Competition slug is required");
  } else if (!/^[a-z0-9-]+$/.test(c.slug as string)) {
    errors.push(
      "Competition slug must only contain lowercase letters, numbers, and hyphens"
    );
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida un objeto DraftMatchday
 */
export function validateDraftMatchday(matchday: unknown): ValidationResult {
  const errors: string[] = [];

  if (!matchday || typeof matchday !== "object") {
    return { valid: false, errors: ["Matchday must be an object"] };
  }

  const m = matchday as Record<string, unknown>;

  if (typeof m.id !== "string" || m.id.trim() === "") {
    errors.push("Matchday ID is required");
  }

  if (typeof m.competitionId !== "string" || m.competitionId.trim() === "") {
    errors.push("Competition ID is required");
  }

  if (typeof m.matchday !== "number" || m.matchday < 1) {
    errors.push("Matchday number must be a positive integer");
  }

  if (!["draft", "ready", "published"].includes(m.status as string)) {
    errors.push("Status must be draft, ready, or published");
  }

  if (!Array.isArray(m.players)) {
    errors.push("Players must be an array");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida el estado completo del dashboard
 */
export function validateDashboardState(state: unknown): ValidationResult {
  const errors: string[] = [];

  if (!state || typeof state !== "object") {
    return { valid: false, errors: ["Dashboard state must be an object"] };
  }

  const s = state as Record<string, unknown>;

  if (!Array.isArray(s.competitions)) {
    errors.push("Competitions must be an array");
  } else {
    s.competitions.forEach((comp, idx) => {
      const result = validateDraftCompetition(comp);
      if (!result.valid) {
        errors.push(
          ...result.errors.map((e) => `Competition ${idx + 1}: ${e}`)
        );
      }
    });
  }

  if (!Array.isArray(s.matchdays)) {
    errors.push("Matchdays must be an array");
  } else {
    s.matchdays.forEach((md, idx) => {
      const result = validateDraftMatchday(md);
      if (!result.valid) {
        errors.push(...result.errors.map((e) => `Matchday ${idx + 1}: ${e}`));
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Verifica si una cadena es una URL válida
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Genera un slug a partir de un nombre
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, "") // Eliminar caracteres especiales
    .replace(/\s+/g, "-") // Espacios a guiones
    .replace(/-+/g, "-") // Múltiples guiones a uno
    .replace(/^-|-$/g, ""); // Eliminar guiones al inicio/final
}

/**
 * Genera un ID único
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Convierte un DraftMatchday a CompetitionFile para publicación
 */
export function draftToCompetitionFile(
  matchday: DraftMatchday,
  competition: DraftCompetition
): CompetitionFile {
  return {
    name: competition.name,
    matchday: matchday.matchday,
    players: matchday.players.map((p) => ({
      name: p.name,
      image: p.image,
      ranking: p.ranking,
    })),
  };
}

/**
 * Valida que un matchday esté listo para publicar
 */
export function validateMatchdayForPublish(
  matchday: DraftMatchday
): ValidationResult {
  const errors: string[] = [];

  if (matchday.players.length === 0) {
    errors.push("Matchday must have at least one player");
  }

  const playersWithoutImage = matchday.players.filter((p) => !p.imageUploaded);
  if (playersWithoutImage.length > 0) {
    errors.push(
      `${playersWithoutImage.length} player(s) have images not uploaded to Blob`
    );
  }

  const playersWithEmptyName = matchday.players.filter(
    (p) => !p.name || p.name.trim() === ""
  );
  if (playersWithEmptyName.length > 0) {
    errors.push(`${playersWithEmptyName.length} player(s) have empty names`);
  }

  // Verificar rankings únicos
  const rankings = matchday.players.map((p) => p.ranking);
  const uniqueRankings = new Set(rankings);
  if (rankings.length !== uniqueRankings.size) {
    errors.push("All players must have unique rankings");
  }

  return { valid: errors.length === 0, errors };
}
