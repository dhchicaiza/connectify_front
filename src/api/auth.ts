import { API, handleApiError } from "./utils";

/**
 * Sends a login request to the backend API.
 *
 * @async
 * @function fetchLoginUser
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<any>} - JSON response from the server with token and user data.
 * @throws {Error} - Throws an error if the request fails or returns a non-OK status.
 */
export async function fetchLoginUser(
  email: string,
  password: string
): Promise<any> {
  try {
    const response = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      await handleApiError({ response, location: "fetchLoginUser" });
    }

    if (location) {
      console.log("[fetchLoginUser] User logged in successfully:", data);
    }

    return data;
  } catch (error) {
    if (location) {
      console.error("[fetchLoginUser] Unexpected error:", error);
    }

    throw error;
  }
}

/**
 * Authenticates a user with Google credentials.
 *
 * @async
 * @function fetchLoginUserGoogle
 * @param {string} idToken - Firebase Google ID token obtained on the client.
 * @returns {Promise<any>} - JSON response from the server containing token/user information.
 * @throws {Error} - Propagates network or parsing errors to the caller.
 */
export async function fetchLoginUserGoogle(idToken: string) {
  const response = await fetch(`${API}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({idToken}),
  })
  
  return response.json();
}

export async function fetchUserGit(idToken: string) {
  const response = await fetch(`${API}/auth/github`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({idToken}),
  })
  
  return response.json();
}
