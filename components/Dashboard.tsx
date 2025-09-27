
import React from 'react';
import type { User, Match } from '../types';
import { findTopMatches } from '../services/geminiService';
import MyTeam from './MyTeam';
import ParticipantCard from './ParticipantCard';
import { LoadingSpinner } from './LoadingSpinner';
import { TEAM_SIZE_LIMIT } from '../constants';

interface DashboardProps {
  currentUser: User;
  myTeam: User[];
  availableUsers: User[];
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  isLoadingMatches: boolean;
  setIsLoadingMatches: React.Dispatch<React.SetStateAction<boolean>>;
  handleInvite: (user: User) => void;
  handleLeaveTeam: (userId: number) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const Dashboard: React.FC<DashboardProps> = ({
  currentUser,
  myTeam,
  availableUsers,
  matches,
  setMatches,
  isLoadingMatches,
  setIsLoadingMatches,
  handleInvite,
  handleLeaveTeam,
  error,
  setError,
}) => {
    
  const handleFindMatches = async () => {
    setIsLoadingMatches(true);
    setError(null);
    setMatches([]);
    try {
      const results = await findTopMatches(currentUser, availableUsers);
      setMatches(results);
    } catch (e) {
      setError('Failed to find matches. The AI might be busy, please try again.');
      console.error(e);
    } finally {
      setIsLoadingMatches(false);
    }
  };

  const isTeamFull = myTeam.length >= TEAM_SIZE_LIMIT;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <MyTeam myTeam={myTeam} handleLeaveTeam={handleLeaveTeam} />
      </div>
      <div className="lg:col-span-2">
        <div className="bg-shell-card p-6 rounded-lg shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-fiu-blue pb-4 mb-4">
            <h2 className="text-2xl font-bold text-shell-text mb-2 sm:mb-0">Find Teammates</h2>
            <button
              onClick={handleFindMatches}
              disabled={isLoadingMatches}
              className="bg-fiu-blue text-white font-bold py-2 px-4 rounded-md hover:bg-fiu-gold transition-colors duration-300 disabled:bg-gray-500 flex items-center justify-center"
            >
              {isLoadingMatches ? (
                <>
                  <LoadingSpinner className="w-5 h-5 mr-2" />
                  Finding Best Matches...
                </>
              ) : (
                '🤖 Find Top Matches with AI'
              )}
            </button>
          </div>
          
          {error && <div className="bg-red-900 border border-red-600 text-red-100 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}

          {isLoadingMatches && <div className="text-center py-8"><LoadingSpinner className="w-12 h-12 mx-auto text-shell-accent"/> <p className="mt-2">AI is thinking...</p></div>}
          
          {matches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-shell-accent mb-4">Your Top AI-Powered Matches</h3>
              <div className="space-y-4">
                {matches.map(match => (
                    <ParticipantCard 
                        key={match.id} 
                        user={availableUsers.find(u => u.id === match.id)!} 
                        onInvite={handleInvite} 
                        isTeamFull={isTeamFull}
                        isInvited={false}
                        isMatch={true}
                        matchJustification={match.justification}
                    />
                ))}
              </div>
            </div>
          )}

          <div>
              <h3 className="text-xl font-semibold text-shell-text mb-4">{matches.length > 0 ? "Other Available Hackers" : "Available Hackers"}</h3>
              <div className="space-y-4">
                {availableUsers
                    .filter(user => !matches.some(match => match.id === user.id))
                    .map(user => {
                        const isInvited = myTeam.some(member => member.id === user.id);
                        return (
                            <ParticipantCard 
                                key={user.id} 
                                user={user} 
                                onInvite={handleInvite} 
                                isTeamFull={isTeamFull} 
                                isInvited={isInvited}
                            />
                        );
                    })}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
