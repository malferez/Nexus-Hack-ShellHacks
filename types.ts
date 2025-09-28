export interface User {
  id: number;
  fullName: string;
  email: string;
  password?: string;
  major: string;
  academicYear: 'Freshman' | 'Sophomore' | 'Junior' | 'Senior' | 'Graduate';
  skills: string[];
  interests: string[];
  bio: string;
  profilePictureUrl?: string;
  isOpenToTeams: boolean;
  team?: {
    id: number;
    name: string;
  } | null;
}

export interface Team {
  id: number;
  name: string;
  leaderId: number;
  memberIds: number[];
}

export interface MyTeamInfo {
    team: Team;
    role: 'LEADER' | 'MEMBER';
}

export interface Match {
  id: number;
  fullName: string;
  major: string;
  skills: string[];
  justification: string;
}

export interface ChatMessage {
  id: string; // API uses string IDs
  author: {
    id: number;
    fullName: string;
    profilePictureUrl?: string;
  };
  content: string;
  createdAt: string; // ISO string
}

// Represents an invitation for ME to join a team
export interface Invite {
  id: string;
  team: {
    id: number;
    name: string;
  };
  status: 'PENDING';
}

// Represents a request from another user to join MY team
export interface JoinRequest {
    id: string;
    team: {
        id: number;
        name: string;
    };
    inviter: {
        id: number;
        fullName: string;
    };
}

// A unified type for the UI
export type AppNotification =
  | ({ type: 'invite' } & Invite)
  | ({ type: 'request' } & JoinRequest);
