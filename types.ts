
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