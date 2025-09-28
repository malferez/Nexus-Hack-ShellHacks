
export interface User {
  id: number;
  name:string;
  email: string;
  password?: string; // Only used for registration, should not be stored in client state
  major: string;
  academicYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  skills: string[];
  interests: string;
  projectIdea: string;
  profilePictureUrl?: string; // base64 URL
  isOpenToTeams: boolean;
  teamId?: number | null;
}

export interface Team {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
}

export interface Match {
  id: number;
  name: string;
  major: string;
  skills: string[];
  justification: string;
}

export interface ChatMessage {
  id: number;
  sender: {
    id: number;
    name: string;
    profilePictureUrl?: string;
  };
  text: string;
  timestamp: string;
}

export interface Request {
  id: number;
  type: 'invite' | 'request';
  // The user who initiated the request/invite
  fromUser: {
    id: number;
    name: string;
  };
  // The user who receives the invite, or the leader of the team receiving the request
  toUser: {
    id: number;
    name: string;
  };
  // The team involved in the transaction
  team: {
    id: number;
    name: string;
  };
  status: 'pending';
}