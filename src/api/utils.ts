import type { HandleApiErrorOptions } from "../types/utils";

export const API = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

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
  return localStorage.getItem("bToken") || localStorage.getItem("gToken");
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