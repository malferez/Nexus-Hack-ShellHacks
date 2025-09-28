
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Match, Team } from './types';
import * as authService from './services/authService';
import * as teamService from './services/teamService';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TeamChat from './components/TeamChat';
import ProjectIdeaGenerator from './components/ProjectIdeaGenerator';

type View = 'auth' | 'dashboard' | 'profile' | 'teamChat' | 'projectIdeaGenerator';

type ConfirmationModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isAlert?: boolean;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [view, setView] = useState<View>('dashboard');
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [confirmationModal, setConfirmationModal] = useState<ConfirmationModalState>({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {},
      isAlert: false,
  });


  const reloadAllData = () => {
      const users = authService.getUsers();
      const allTeams = teamService.getTeams();
      setAllUsers(users);
      setTeams(allTeams);
      if (currentUser) {
        setCurrentUser(users.find(u => u.id === currentUser.id) || null);
      }
  }

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        setView('dashboard');
    } else {
        setView('auth');
    }
    reloadAllData();
  }, []);

  const currentUserTeam = useMemo(() => {
    if (!currentUser?.teamId) return null;
    return teams.find(team => team.id === currentUser.teamId) || null;
  }, [currentUser, teams]);

  const myTeamMembers = useMemo(() => {
      if (!currentUserTeam) return [];
      const memberIds = new Set(currentUserTeam.memberIds);
      return allUsers.filter(user => memberIds.has(user.id));
  }, [currentUserTeam, allUsers]);


  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setView('dashboard');
    reloadAllData();
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setView('auth');
  };
  
  const handleUserUpdate = (user: User) => {
    setCurrentUser(user);
    reloadAllData();
  }

  const availableUsers = useMemo(() => {
    if (!currentUser) return [];
    return allUsers.filter(user => user.id !== currentUser.id);
  }, [currentUser, allUsers]);

  const handleCreateTeam = (teamName: string) => {
      if (!currentUser) return;
      const newTeam = teamService.createTeam(teamName, currentUser);
      authService.updateUserTeam(currentUser.id, newTeam.id);
      reloadAllData();
  }

  const handleDeleteTeam = () => {
      if (!currentUserTeam || currentUser?.id !== currentUserTeam.leaderId) return;

      setConfirmationModal({
          isOpen: true,
          title: 'Delete Team?',
          message: 'Are you sure you want to delete your team? This action is permanent and cannot be undone.',
          onConfirm: () => {
              teamService.deleteTeam(currentUserTeam.id);
              currentUserTeam.memberIds.forEach(memberId => {
                  authService.updateUserTeam(memberId, null);
              });
              reloadAllData();
              setConfirmationModal(prevState => ({ ...prevState, isOpen: false }));
          }
      });
  }
  
  const handleRemoveMember = (userId: number) => {
      if (!currentUserTeam || currentUser?.id !== currentUserTeam.leaderId || userId === currentUser.id) return;
      const updatedTeam = { ...currentUserTeam, memberIds: currentUserTeam.memberIds.filter(id => id !== userId) };
      teamService.updateTeam(updatedTeam);
      authService.updateUserTeam(userId, null);
      reloadAllData();
  };
  
  const handleLeaveTeam = () => {
      if (!currentUser || !currentUserTeam || currentUser.id === currentUserTeam.leaderId) return;

      let updatedTeam = { ...currentUserTeam, memberIds: currentUserTeam.memberIds.filter(id => id !== currentUser.id) };
      
      if (updatedTeam.memberIds.length === 0) {
          // If last member leaves, delete the team
          teamService.deleteTeam(updatedTeam.id);
      } else {
          teamService.updateTeam(updatedTeam);
      }
      authService.updateUserTeam(currentUser.id, null);
      reloadAllData();
  }

  const handleInvite = (userToInvite: User) => {
      if (!currentUserTeam || currentUser?.id !== currentUserTeam.leaderId) return;
      
      const userToInviteOldTeam = teams.find(t => t.id === userToInvite.teamId);

      const performInvite = () => {
          // If user is on another team, handle their departure first
          if (userToInviteOldTeam) {
              // If they were the leader, disband the old team
              if (userToInviteOldTeam.leaderId === userToInvite.id) {
                  teamService.deleteTeam(userToInviteOldTeam.id);
                  userToInviteOldTeam.memberIds.forEach(memberId => {
                      if (memberId !== userToInvite.id) {
                          authService.updateUserTeam(memberId, null);
                      }
                  });
              } else {
                  // Just remove them from their old team
                  const updatedOldTeam = {
                      ...userToInviteOldTeam,
                      memberIds: userToInviteOldTeam.memberIds.filter(id => id !== userToInvite.id)
                  };
                  if (updatedOldTeam.memberIds.length === 0) {
                      teamService.deleteTeam(updatedOldTeam.id);
                  } else {
                      teamService.updateTeam(updatedOldTeam);
                  }
              }
          }

          // Add user to the new team
          const updatedCurrentUserTeam = { ...currentUserTeam, memberIds: [...currentUserTeam.memberIds, userToInvite.id] };
          teamService.updateTeam(updatedCurrentUserTeam);
          authService.updateUserTeam(userToInvite.id, currentUserTeam.id);
          reloadAllData();
          setConfirmationModal(prevState => ({ ...prevState, isOpen: false }));
      }

      if (userToInvite.teamId && userToInvite.teamId !== currentUserTeam.id) {
          const userToInviteOldTeam = teams.find(t => t.id === userToInvite.teamId);
          setConfirmationModal({
              isOpen: true,
              title: `Invite ${userToInvite.name}?`,
              message: `${userToInvite.name} is already on team "${userToInviteOldTeam?.name}". Inviting them will remove them from their current team. If they are the leader, their old team will be permanently disbanded. Are you sure?`,
              onConfirm: performInvite,
          });
      } else {
          performInvite();
      }
  };
  
    const handleRequestToJoin = (targetUser: User) => {
        const targetTeam = teams.find(t => t.id === targetUser.teamId);
        if (!targetTeam) {
            console.error("User is not on a team to request joining.");
            return;
        }
        // In a real app, this would create a notification for the target team's leader.
        // For now, we'll just show an alert to the current user.
        setConfirmationModal({
            isOpen: true,
            title: 'Request Sent',
            message: `Your request to join "${targetTeam.name}" has been sent to their team leader.`,
            onConfirm: () => setConfirmationModal(prevState => ({ ...prevState, isOpen: false })),
            isAlert: true,
        });
    };


  const renderView = () => {
    if (!currentUser || view === 'auth') {
        return <Auth onLoginSuccess={handleLoginSuccess} />;
    }
    switch(view) {
        case 'dashboard':
            return <Dashboard
                        currentUser={currentUser}
                        currentUserTeam={currentUserTeam}
                        myTeamMembers={myTeamMembers}
                        availableUsers={availableUsers}
                        teams={teams}
                        matches={matches}
                        setMatches={setMatches}
                        isLoadingMatches={isLoadingMatches}
                        setIsLoadingMatches={setIsLoadingMatches}
                        handleInvite={handleInvite}
                        handleRequestToJoin={handleRequestToJoin}
                        handleRemoveMember={handleRemoveMember}
                        handleLeaveTeam={handleLeaveTeam}
                        handleDeleteTeam={handleDeleteTeam}
                        handleCreateTeam={handleCreateTeam}
                        error={error}
                        setError={setError}
                    />;
        case 'profile':
            return <Profile user={currentUser} onUserUpdate={handleUserUpdate} onLogout={handleLogout} />;
        case 'teamChat':
            return <TeamChat myTeamMembers={myTeamMembers} currentUser={currentUser} currentUserTeam={currentUserTeam} />;
        case 'projectIdeaGenerator':
            return <ProjectIdeaGenerator />;
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
      {confirmationModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-shell-card rounded-lg p-8 max-w-sm w-full mx-4 shadow-2xl">
                  <h3 className="text-xl font-bold text-shell-text mb-4">{confirmationModal.title}</h3>
                  <p className="text-shell-text-secondary mb-6">{confirmationModal.message}</p>
                  <div className="flex justify-end space-x-4">
                      {!confirmationModal.isAlert && (
                        <button onClick={() => setConfirmationModal(prevState => ({ ...prevState, isOpen: false }))} className="px-4 py-2 rounded-md text-shell-text-secondary hover:bg-shell-bg transition-colors">
                            Cancel
                        </button>
                      )}
                      <button onClick={confirmationModal.onConfirm} className={`px-4 py-2 rounded-md text-white transition-colors ${
                          confirmationModal.isAlert ? 'bg-fiu-blue hover:bg-fiu-gold' : 'bg-red-600 hover:bg-red-700'
                      }`}>
                          {confirmationModal.isAlert ? 'OK' : 'Confirm'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
