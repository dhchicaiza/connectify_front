import { API, getAuthHeaders, handleApiError } from "./utils";

/**
 * Creates a new meeting with a maximum of 10 participants.
 *
 * @async
 * @function fetchIdMeet
 * @returns {Promise<any>} The created meeting data including the meeting ID.
 * @throws {Error} Throws an error if the request fails or returns a non-OK status.
 */
export async function fetchIdMeet() {
  try {
    let maxParticipants = 10;
    const response = await fetch(`${API}/meetings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({maxParticipants})
    });

    if(!response) {
        handleApiError({response, location: "fetchIdMeet"})
    }

    return (await response.json()).data;
  } catch (error) {
    console.log(error)
  }
}
