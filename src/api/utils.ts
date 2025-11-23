import type { HandleApiErrorOptions } from "../types/utils";

const envApiUrl = import.meta.env.VITE_API_URL;
export const API = envApiUrl || "http://localhost:3000/api";

// Warn if using localhost fallback (might not work for remote connections)
if (!envApiUrl && import.meta.env.MODE === "development") {
  console.warn("⚠️ ADVERTENCIA: VITE_API_URL no está configurado en .env");
  console.warn("   Usando fallback: http://localhost:3000/api");
  console.warn("   Si trabajas en red local, crea un archivo .env con:");
  console.warn("   VITE_API_URL=http://[IP_DEL_SERVIDOR]:3000/api");
}

/**
 * Retrieves the authentication token from localStorage.
 * 
 * @function getToken
 * @returns {string|null} The JWT token string if exists, null otherwise.
 * 
 * @description
 * This function safely retrieves the authentication token stored in the browser's
 * localStorage. The token is used for authenticating API requests to the backend.
 * 
 * @example
 * const token = getToken();
 * if (token) {
 *   // User is potentially authenticated
 *   console.log('Token found:', token);
 * } else {
 *   // No token found, user needs to login
 *   console.log('No authentication token found');
 * }
 */
export function getToken(): string | null {
  return localStorage.getItem("token");
}

/**
 * Gets authorization headers for API requests.
 * 
 * @function getAuthHeaders
 * @returns {{Authorization: string, 'Content-Type': string}} Headers object with Authorization
 */
export function getAuthHeaders(): { Authorization: string; 'Content-Type': string } {
  const token = getToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

/**
 * Handles API errors in a centralized way by interpreting HTTP status codes,
 * generating a user-friendly message, logging details (in development mode),
 * and throwing a standardized Error.
 *
 * @async
 * @function handleApiError
 * @param {Object} options - Error handling configuration.
 * @param {Response} options.response - The API response object that contains HTTP status information.
 * @param {any} options.data - Parsed response payload, typically containing backend error details.
 * @param {string} [options.location] - Optional identifier for the request origin, used for logging.
 * @returns {never} - This function always throws an error and never returns.
 *
 * @description
 * Based on the HTTP status code of the response, this function assigns a human-readable
 * error message. In development mode, it logs detailed information to the console
 * (including the original data and response). In production, it logs a simplified message.
 * Finally, it throws an `Error` with the generated message, effectively stopping execution.
 *
 * @throws {Error} Always throws an Error with the corresponding message.
 *
 * @example
 * try {
 *   const res = await fetch("/api/resource");
 *   if (!res.ok) {
 *     const data = await res.json();
 *     await handleApiError({ response: res, data, location: "Fetch Resource" });
 *   }
 * } catch (err) {
 *   console.error(err.message);
 * }
 */
export async function handleApiError({ response, data, location }: HandleApiErrorOptions): Promise<never> {
  let errorMessage = data?.error || "Ocurrió un error inesperado.";

  // Messages
  switch (response.status) {
    case 400:
      errorMessage = "Solicitud inválida. Verifica los datos enviados.";
      break;
    case 401:
      errorMessage = "Usuario no autenticado. Por favor inicia sesión.";
      break;
    case 403:
      errorMessage = "No tienes permisos para realizar esta acción.";
      break;
    case 404:
      errorMessage = "Recurso no encontrado.";
      break;
    case 500:
      errorMessage = "Error interno del servidor. Inténtalo más tarde.";
      break;
  }

  // Detail Log
  if (import.meta.env.MODE === "development") {
    console.error(
      `%c[${location || "API"}] Request failed (${response.status})`,
      "color: red; font-weight: bold;"
    );
    console.error("Mensaje:", errorMessage);
    console.error("Detalles:", { response, data });
  } else {
    console.log(`[${location || "API"}] Error manejado (${response.status})`);
  }

  throw new Error(errorMessage);
}

