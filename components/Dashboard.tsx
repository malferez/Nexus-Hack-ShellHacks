
import React, { useState, useMemo } from 'react';
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
  const [searchTerm, setSearchTerm] = useState('');

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
  
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return availableUsers;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return availableUsers.filter(user =>
      user.name.toLowerCase().includes(lowercasedFilter) ||
      user.major.toLowerCase().includes(lowercasedFilter) ||
      user.skills.some(skill => skill.toLowerCase().includes(lowercasedFilter))
    );
  }, [availableUsers, searchTerm]);


  const isTeamFull = myTeam.length >= TEAM_SIZE_LIMIT;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <MyTeam myTeam={myTeam} handleLeaveTeam={handleLeaveTeam} />
      </div>
      <div className="lg:col-span-2">
        <div className="bg-shell-card p-6 rounded-lg shadow-2xl">
          <div className="border-b border-fiu-blue pb-4 mb-6">
            <h2 className="text-xl font-bold text-shell-text">Current Event: <span className="text-shell-accent">ShellHacks 2024</span></h2>
            <p className="text-shell-text-secondary">Welcome, {currentUser.name}. Let's find you a team!</p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-fiu-blue/50 pb-4 mb-4">
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
                {matches.map(match => {
                    const user = availableUsers.find(u => u.id === match.id);
                    if (!user) {
                        console.warn(`AI match with ID ${match.id} not found in available users.`);
                        return null;
                    }
                    return (
                        <ParticipantCard 
                            key={match.id} 
                            user={user} 
                            onInvite={handleInvite} 
                            isTeamFull={isTeamFull}
                            isInvited={false}
                            isMatch={true}
                            matchJustification={match.justification}
                        />
                    );
                })}
              </div>
            </div>
          )}

          <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-shell-text">{matches.length > 0 ? "Other Available Hackers" : "Available Hackers"}</h3>
                <input
                    type="text"
                    placeholder="Search by name, skill..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-shell-bg border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent w-1/2"
                />
              </div>
              <div className="space-y-4">
                {filteredUsers
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
