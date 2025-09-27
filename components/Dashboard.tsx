
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
  const [filters, setFilters] = useState({
    academicYear: '',
    major: '',
    skills: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

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
    const lowercasedSearch = searchTerm.toLowerCase();
    const lowercasedMajor = filters.major.toLowerCase();
    const filterSkills = filters.skills.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    return availableUsers.filter(user => {
      const matchesSearch = !lowercasedSearch ||
        user.name.toLowerCase().includes(lowercasedSearch) ||
        user.major.toLowerCase().includes(lowercasedSearch) ||
        user.skills.some(skill => skill.toLowerCase().includes(lowercasedSearch));

      const matchesYear = !filters.academicYear || user.academicYear === filters.academicYear;
      const matchesMajor = !lowercasedMajor || user.major.toLowerCase().includes(lowercasedMajor);
      const matchesSkills = filterSkills.length === 0 || filterSkills.every(filterSkill =>
        user.skills.some(userSkill => userSkill.toLowerCase().includes(filterSkill))
      );

      return matchesSearch && matchesYear && matchesMajor && matchesSkills;
    });
  }, [availableUsers, searchTerm, filters]);


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

          <div className="border-t border-fiu-blue/50 pt-6 mt-8">
              <h3 className="text-xl font-semibold text-shell-text mb-4">
                {matches.length > 0 ? "Other Available Hackers" : "Available Hackers"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 bg-shell-bg p-4 rounded-md border border-fiu-blue/30">
                <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                  <label htmlFor="search" className="block text-sm font-medium text-shell-text-secondary mb-1">Search by Name...</label>
                  <input
                      id="search"
                      type="text"
                      placeholder="e.g., Elena Rodriguez..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-shell-card border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"
                  />
                </div>
                
                <div>
                  <label htmlFor="academicYear" className="block text-sm font-medium text-shell-text-secondary mb-1">Year</label>
                  <select name="academicYear" id="academicYear" value={filters.academicYear} onChange={handleFilterChange} className="w-full bg-shell-card border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent">
                    <option value="">All</option>
                    <option>Freshman</option>
                    <option>Sophomore</option>
                    <option>Junior</option>
                    <option>Senior</option>
                    <option>Graduate</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="major" className="block text-sm font-medium text-shell-text-secondary mb-1">Major</label>
                  <input
                    type="text"
                    id="major"
                    name="major"
                    placeholder="e.g., CompSci"
                    value={filters.major}
                    onChange={handleFilterChange}
                    className="w-full bg-shell-card border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"
                  />
                </div>
                
                <div className="col-span-1 sm:col-span-2">
                   <label htmlFor="skills" className="block text-sm font-medium text-shell-text-secondary mb-1">Required Skills (comma-sep.)</label>
                   <input
                    type="text"
                    id="skills"
                    name="skills"
                    placeholder="e.g., Python, Figma"
                    value={filters.skills}
                    onChange={handleFilterChange}
                    className="w-full bg-shell-card border border-fiu-blue rounded-md p-2 text-shell-text focus:ring-shell-accent focus:border-shell-accent"
                  />
                </div>
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
                    {filteredUsers.length === 0 && (
                        <div className="text-center py-8 text-shell-text-secondary">
                            <p>No hackers match your criteria.</p>
                            <p className="text-sm">Try adjusting your filters.</p>
                        </div>
                    )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
