
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Match } from './types';
import * as authService from './services/authService';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TeamChat from './components/TeamChat';
import { TEAM_SIZE_LIMIT } from './constants';

type View = 'auth' | 'dashboard' | 'profile' | 'teamChat';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [view, setView] = useState<View>('dashboard');
  const [myTeam, setMyTeam] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    const users = authService.getUsers();
    setAllUsers(users);
    if (user) {
      setCurrentUser(user);
      setMyTeam([user]);
      setView('dashboard');
    } else {
      setView('auth');
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setMyTeam([user]);
    setView('dashboard');
    setAllUsers(authService.getUsers());
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setMyTeam([]);
    setView('auth');
  };
  
  const handleUserUpdate = (user: User) => {
    setCurrentUser(user);
    setMyTeam(team => team.map(member => member.id === user.id ? user : member));
    setAllUsers(authService.getUsers());
  }

  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    const teamIds = new Set(myTeam.map(member => member.id));
    return allUsers.filter(user => !teamIds.has(user.id));
  }, [currentUser, myTeam, allUsers]);


  const handleInvite = (user: User) => {
    if (myTeam.length < TEAM_SIZE_LIMIT) {
      setMyTeam(prevTeam => [...prevTeam, user]);
    }
  };

  const handleLeaveTeam = (userId: number) => {
    if (userId === currentUser?.id) {
        alert("You cannot remove yourself from the team.");
        return;
    }
    setMyTeam(prevTeam => prevTeam.filter(member => member.id !== userId));
  };
  
  const renderView = () => {
    if (!currentUser || view === 'auth') {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
    switch(view) {
        case 'dashboard':
            return <Dashboard
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
                    />;
        case 'profile':
            return <Profile user={currentUser} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />;
        case 'teamChat':
            return <TeamChat myTeam={myTeam} />;
        default:
             return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
  }

  return (
    <div className="min-h-screen bg-shell-bg font-sans">
      <Header currentUser={currentUser} setView={setView} />
      <main className="container mx-auto p-4 md:p-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 text-shell-text-secondary text-sm">
        <p>Built for ShellHacks @ FIU</p>
      </footer>
    </div>
  );
};

export default App;
