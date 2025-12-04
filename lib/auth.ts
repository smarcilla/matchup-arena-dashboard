// =============================================================================
// MATCHUP ARENA DASHBOARD - AUTHENTICATION
// =============================================================================

import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "matchup-dashboard-auth";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

/**
 * Verifica si la contraseña proporcionada es correcta
 */
export function verifyPassword(password: string): boolean {
  const dashboardPassword = process.env.DASHBOARD_PASSWORD;

  if (!dashboardPassword) {
    console.error("DASHBOARD_PASSWORD environment variable is not set");
    return false;
  }

  return password === dashboardPassword;
}

/**
 * Genera un token de sesión simple
 */
function generateSessionToken(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Crea una sesión de autenticación
 */
export async function createSession(): Promise<string> {
  const token = generateSessionToken();
  const cookieStore = await cookies();

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
  });

  return token;
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);

  // Si hay un token, el usuario está autenticado
  // En una implementación más robusta, verificaríamos el token contra una base de datos
  return !!token?.value;
}

/**
 * Elimina la sesión de autenticación
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Obtiene el token de sesión actual
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME);
  return token?.value ?? null;
}
