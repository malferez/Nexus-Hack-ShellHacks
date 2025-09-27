
import React, { useState, useMemo } from 'react';
import type { User, Match } from './types';
import { MOCK_USERS, TEAM_SIZE_LIMIT } from './constants';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [myTeam, setMyTeam] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    const teamIds = new Set(myTeam.map(member => member.id));
    teamIds.add(currentUser.id);
    return MOCK_USERS.filter(user => !teamIds.has(user.id));
  }, [currentUser, myTeam]);

  const handleOnboardingComplete = (user: User) => {
    setCurrentUser(user);
    setMyTeam([user]); 
  };

  const handleInvite = (user: User) => {
    if (myTeam.length < TEAM_SIZE_LIMIT) {
      setMyTeam(prevTeam => [...prevTeam, user]);
    }
  };

  const handleLeaveTeam = (userId: number) => {
    if (userId === currentUser?.id) {
        alert("You cannot leave the team you created. Please restart to create a new profile.");
        return;
    }
    setMyTeam(prevTeam => prevTeam.filter(member => member.id !== userId));
  };
  
  return (
    <div className="min-h-screen bg-shell-bg font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {!currentUser ? (
          <Onboarding onOnboardingComplete={handleOnboardingComplete} />
        ) : (
          <Dashboard
            currentUser={currentUser}
            myTeam={myTeam}
            availableUsers={availableUsers}
            matches={matches}
            setMatches={setMatches}
            isLoadingMatches={isLoadingMatches}
            setIsLoadingMatches={setIsLoadingMatches}
            handleInvite={handleInvite}
            handleLeaveTeam={handleLeaveTeam}
            error={error}
            setError={setError}
          />
        )}
      </main>
      <footer className="text-center py-4 text-shell-text-secondary text-sm">
        <p>Built for ShellHacks @ FIU</p>
      </footer>
    </div>
  );
};

export default App;
