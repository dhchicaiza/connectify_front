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
    const token = getToken()
    
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    // Usar la ruta /users/me que es más segura y usa el token de autenticación
    const response = await fetch(`${API}/users/me`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      await handleApiError({response, data, location: "fetchDeleteUser"});
    }

    console.log("[fetchDeleteUser] User account deleted successfully:", data);

    return data;
  } catch (error) {
    console.error("[fetchDeleteUser] Unexpected error:", error);
    throw error;
  }
}

// Define la estructura de los datos que se pueden enviar para la actualización
// La contraseña se incluye opcionalmente, pero requiere currentPassword cuando se cambia.
interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  age?: number | string; 
  email?: string;
  password?: string;
  currentPassword?: string;
}

/**
 * Updates the authenticated user's profile information.
 *
 * @async
 * @function fetchUpdateUser
 * @param {UpdateUserData} updateData - Object containing the fields to update (firstName, lastName, age, email, password).
 * @returns {Promise<any>} - JSON response from the server with the updated user data.
 * @throws {Error} - Throws an error if the request fails or returns a non-OK status.
 */
export async function fetchUpdateUser(updateData: UpdateUserData): Promise<any> {
  // Asegúrate de que estás desestructurando y usando 'location' si es parte de tu patrón de manejo de errores
  // para evitar warnings/errores en el scope. Aquí lo omitimos ya que no está definido en el contexto local.
  try {
    const token = getToken();

    if (!token) {
      console.warn("No hay token, no se puede actualizar el perfil");
      throw new Error('No hay token de autenticación disponible');
    }

    // 1. Limpiar los datos para el envío
    // El controlador del backend (updateProfile) usa PUT /users/me, que está bien.
    // Convertimos 'age' a number si existe, ya que el backend lo espera como number.
    const bodyToSend: UpdateUserData & { age?: number } = {
      ...updateData,
      ...(updateData.age !== undefined && { 
        age: Number(updateData.age) // Conversión necesaria si formData.age es string
      })
    };
    
    // Opcional: Eliminar campos que estén vacíos/nulos para que el backend no los procese,
    // aunque tu controlador ya maneja bien la presencia/ausencia de campos.

    const response = await fetch(`${API}/users/me`, {
      method: "PUT", // ⬅️ Método PUT
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json", // Necesario para enviar el body JSON
      },
      body: JSON.stringify(bodyToSend), // ⬅️ Enviar los datos
    });

    const data = await response.json();

    if (!response.ok) {
      // Usar la función de manejo de errores existente
      await handleApiError({ response, data, location: "fetchUpdateUser" }); 
    }
    
    // El backend devuelve el usuario actualizado si todo va bien
    return data;
    
  } catch (error) {
    // Si usas un patrón de log global
    console.error("[fetchUpdateUser] Unexpected error:", error); 

    throw error;
  }
}