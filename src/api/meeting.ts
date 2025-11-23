import { API, getAuthHeaders, handleApiError } from "./utils";

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
