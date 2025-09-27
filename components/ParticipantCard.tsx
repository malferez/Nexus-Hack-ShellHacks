
import React from 'react';
import type { User } from '../types';

interface ParticipantCardProps {
  user: User;
  onInvite: (user: User) => void;
  isTeamFull: boolean;
  isInvited: boolean;
  isMatch?: boolean;
  matchJustification?: string;
}

const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-fiu-blue/50 text-shell-accent text-xs font-medium mr-2 mb-2 px-2.5 py-0.5 rounded-full">{children}</span>
);

const ParticipantCard: React.FC<ParticipantCardProps> = ({ user, onInvite, isTeamFull, isInvited, isMatch = false, matchJustification }) => {
  return (
    <div className={`bg-shell-bg p-4 rounded-lg border transition-all duration-300 ${isMatch ? 'border-shell-accent shadow-lg' : 'border-fiu-blue/50'}`}>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start">
            <div>
                <h4 className="text-lg font-bold text-shell-text">{user.name}</h4>
                <p className="text-sm text-shell-text-secondary mb-2">{user.major}</p>
            </div>
            <button 
                onClick={() => onInvite(user)} 
                disabled={isTeamFull || isInvited}
                className="w-full sm:w-auto mt-2 sm:mt-0 bg-shell-accent text-shell-bg font-bold py-1 px-4 rounded-md text-sm hover:bg-opacity-80 transition-colors duration-300 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                {isInvited ? 'In Your Team' : (isTeamFull ? 'Team Full' : 'Invite to Team')}
            </button>
        </div>
        
        {isMatch && matchJustification && (
            <div className="mt-3 p-3 bg-shell-accent/10 rounded-md border-l-4 border-shell-accent">
                <p className="text-sm text-shell-accent"><span className="font-bold">AI Match:</span> {matchJustification}</p>
            </div>
        )}

        <div className="mt-4">
            <h5 className="text-sm font-semibold text-shell-text-secondary mb-2">Skills</h5>
            <div className="flex flex-wrap">
                {user.skills.map(skill => <Tag key={skill}>{skill}</Tag>)}
            </div>
        </div>
        <div className="mt-4">
            <h5 className="text-sm font-semibold text-shell-text-secondary mb-1">Interests</h5>
            <p className="text-sm text-shell-text">{user.interests}</p>
        </div>
        <div className="mt-4">
            <h5 className="text-sm font-semibold text-shell-text-secondary mb-1">Project Idea</h5>
            <p className="text-sm text-shell-text italic">"{user.projectIdea}"</p>
        </div>
    </div>
  );
};

export default ParticipantCard;
