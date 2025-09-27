
import React from 'react';
import type { User } from '../types';
import { TEAM_SIZE_LIMIT } from '../constants';

interface MyTeamProps {
  myTeam: User[];
  handleLeaveTeam: (userId: number) => void;
}

const MyTeam: React.FC<MyTeamProps> = ({ myTeam, handleLeaveTeam }) => {
  const teamSlots = Array.from({ length: TEAM_SIZE_LIMIT });

  return (
    <div className="bg-shell-card p-6 rounded-lg shadow-2xl sticky top-8">
      <h2 className="text-2xl font-bold text-shell-text mb-1">Your Team</h2>
      <p className="text-shell-text-secondary mb-4">
        Team Size: <span className="font-bold text-shell-accent">{myTeam.length} / {TEAM_SIZE_LIMIT}</span>
      </p>
      <div className="space-y-3">
        {teamSlots.map((_, index) => {
          const member = myTeam[index];
          if (member) {
            return (
              <div key={member.id} className="bg-shell-bg p-3 rounded-md flex items-center justify-between transition-all duration-300">
                <div>
                  <p className="font-bold text-shell-text">{member.name} {index === 0 ? '(You)' : ''}</p>
                  <p className="text-sm text-shell-text-secondary">{member.major}</p>
                </div>
                {index !== 0 && (
                  <button onClick={() => handleLeaveTeam(member.id)} className="text-red-400 hover:text-red-300 text-xs font-semibold">
                    LEAVE
                  </button>
                )}
              </div>
            );
          }
          return (
            <div key={index} className="bg-shell-bg p-3 rounded-md border-2 border-dashed border-gray-600">
              <p className="text-center text-shell-text-secondary">Open Slot</p>
            </div>
          );
        })}
      </div>
      {myTeam.length === TEAM_SIZE_LIMIT && (
        <div className="mt-4 text-center bg-green-900 border border-green-500 text-green-200 p-2 rounded-md">
            Your team is full! Let's get building!
        </div>
      )}
    </div>
  );
};

export default MyTeam;
