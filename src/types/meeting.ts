/**
 * Meeting participant interface
 */
export interface Participant {
  userId: string;
  joinedAt: string; // ISO-8601 format
  active: boolean;
}

/**
 * Meeting response (for API)
 */
export interface MeetingResponse {
  id: string;
  createdBy: string;
  createdAt: string;
  status: 'active' | 'ended';
  participants: Participant[];
  maxParticipants: number;
  participantCount: number;
  canJoin: boolean;
}