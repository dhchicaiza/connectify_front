import { API, getAuthHeaders, getToken, handleApiError } from "./utils";

/**
 * Interface for meeting creation data.
 */
interface CreateMeetingData {
  maxParticipants?: number;
}

/**
 * Interface for meeting response from the API.
 */
export interface MeetingResponse {
  id: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'ended';
  participants: Array<{
    userId: string;
    joinedAt: string;
    active: boolean;
  }>;
  maxParticipants: number;
  participantCount: number;
  canJoin: boolean;
}

/**
 * Creates a new meeting.
 *
 * @async
 * @function createMeeting
 * @param {CreateMeetingData} [data] - Optional meeting creation data (maxParticipants).
 * @returns {Promise<MeetingResponse>} The created meeting with its ID and details.
 * @throws {Error} Throws an error if the request fails or returns a non-OK status.
 *
 * @example
 * const meeting = await createMeeting({ maxParticipants: 5 });
 * console.log(meeting.id); // Meeting ID to share
 */
export async function createMeeting(data?: CreateMeetingData): Promise<MeetingResponse> {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API}/meetings`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data || {}),
    });

    const result = await response.json();

    if (!response.ok) {
      await handleApiError({ response, data: result, location: "createMeeting" });
    }

    return result.data;
  } catch (error) {
    console.error("[createMeeting] Unexpected error:", error);
    throw error;
  }
}

/**
 * Retrieves a meeting by its ID.
 *
 * @async
 * @function getMeetingById
 * @param {string} meetingId - The meeting ID to retrieve.
 * @returns {Promise<MeetingResponse>} The meeting details.
 * @throws {Error} Throws an error if the request fails or the meeting is not found.
 *
 * @example
 * const meeting = await getMeetingById("meeting-uuid");
 * console.log(meeting.status); // 'active' or 'ended'
 */
export async function getMeetingById(meetingId: string): Promise<MeetingResponse> {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API}/meetings/${meetingId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      await handleApiError({ response, data: result, location: "getMeetingById" });
    }

    return result.data;
  } catch (error) {
    console.error("[getMeetingById] Unexpected error:", error);
    throw error;
  }
}

/**
 * Joins an existing meeting by its ID.
 *
 * @async
 * @function joinMeeting
 * @param {string} meetingId - The meeting ID to join.
 * @returns {Promise<MeetingResponse>} The updated meeting details after joining.
 * @throws {Error} Throws an error if the request fails, meeting is full, or not found.
 *
 * @example
 * const meeting = await joinMeeting("meeting-uuid");
 * console.log(meeting.participantCount); // Number of active participants
 */
export async function joinMeeting(meetingId: string): Promise<MeetingResponse> {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API}/meetings/${meetingId}/join`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      await handleApiError({ response, data: result, location: "joinMeeting" });
    }

    return result.data;
  } catch (error) {
    console.error("[joinMeeting] Unexpected error:", error);
    throw error;
  }
}

/**
 * Leaves a meeting.
 *
 * @async
 * @function leaveMeeting
 * @param {string} meetingId - The meeting ID to leave.
 * @returns {Promise<void>} Resolves when the user has successfully left the meeting.
 * @throws {Error} Throws an error if the request fails.
 *
 * @example
 * await leaveMeeting("meeting-uuid");
 */
export async function leaveMeeting(meetingId: string): Promise<void> {
  try {
    const token = getToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(`${API}/meetings/${meetingId}/leave`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
      await handleApiError({ response, data: result, location: "leaveMeeting" });
    }
  } catch (error) {
    console.error("[leaveMeeting] Unexpected error:", error);
    throw error;
  }
}

