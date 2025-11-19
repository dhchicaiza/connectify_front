import { API, getAuthHeaders, getToken, handleApiError } from "./utils";

/**
 * Retrieves the authenticated user's profile information.
 *
 * @async
 * @function fetchUserProfile
 * @returns {Promise<any>} - JSON response from the server with user data.
 * @throws {Error} - Throws an error if the request fails or returns a non-OK status.
 *
 * @example
 * const userProfile = await fetchUserProfile();
 * console.log(userProfile.data); // User profile data
 */
export async function fetchUserProfile(): Promise<any> {
  try {
    const token = getToken()
    
    if (!token) {
      console.warn("No hay token, no se puede obtener el perfil");
      return null;
    }

    const response = await fetch(`${API}/users/me`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      await handleApiError({ response, data, location: "fetchUserProfile" });
    }

    return data;
    
  } catch (error) {
    if (location) {
      console.error("[fetchUserProfile] Unexpected error:", error);
    }

    throw error;
  }
}

/**
 * Deletes the authenticated user's account.
 *
 * @async
 * @function fetchDeleteUser
 * @returns {Promise<any>} - JSON response from the server.
 * @throws {Error} - Throws an error if the request fails or returns a non-OK status.
 */
export async function fetchDeleteUser(): Promise<any> {
  try {
    // backend
    const token = getToken()
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const response = await fetch(`${API}/users/me`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      await handleApiError({response, data, location: "fetchDeleteUser"});
    }

    if (location) {
      console.log("[fetchDeleteUser] User account deleted successfully:", data);
    }

    return data;
  } catch (error) {
    if (location) {
      console.error("[fetchDeleteUser] Unexpected error:", error);
    }

    throw error;
  }
}