
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Match, Team, Request } from './types';
import * as authService from './services/authService';
import * as teamService from './services/teamService';
import * as requestService from './services/requestService';
import Header from './components/Header';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import TeamChat from './components/TeamChat';
import ProjectIdeaGenerator from './components/ProjectIdeaGenerator';
import { TEAM_SIZE_LIMIT } from './constants';

type View = 'auth' | 'dashboard' | 'profile' | 'teamChat' | 'projectIdeaGenerator';

type ConfirmationModalState = {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    isAlert?: boolean;
    confirmButtonClass?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
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
      confirmButtonClass: '',
      confirmButtonText: '',
      cancelButtonText: '',
  });


  const reloadAllData = () => {
      const users = authService.getUsers();
      const allTeams = teamService.getTeams();
      const allRequests = requestService.getRequests();
      setAllUsers(users);
      setTeams(allTeams);
      setRequests(allRequests);

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
  
  const pendingRequestsForUser = useMemo(() => {
      if (!currentUser) return [];
      // Invites sent to me OR requests sent to my team (if I'm the leader)
      return requests.filter(req => 
          (req.type === 'invite' && req.toUser.id === currentUser.id) ||
          (req.type === 'request' && currentUserTeam && req.team.id === currentUserTeam.id && currentUser.id === currentUserTeam.leaderId)
      );
  }, [currentUser, currentUserTeam, requests]);

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
          teamService.deleteTeam(updatedTeam.id);
      } else {
          teamService.updateTeam(updatedTeam);
      }
      authService.updateUserTeam(currentUser.id, null);
      reloadAllData();
  }

  const handleInvite = (userToInvite: User) => {
      if (!currentUserTeam || !currentUser || currentUser.id !== currentUserTeam.leaderId) return;
      
      const existingRequest = requests.find(r => 
          r.type === 'invite' && r.team.id === currentUserTeam.id && r.toUser.id === userToInvite.id
      );
      if (existingRequest) return; // Don't send duplicate invites

      requestService.createRequest({
          type: 'invite',
          fromUser: { id: currentUser.id, name: currentUser.name },
          toUser: { id: userToInvite.id, name: userToInvite.name },
          team: { id: currentUserTeam.id, name: currentUserTeam.name }
      });
      reloadAllData();
  };
  
  const handleRequestToJoin = (targetUser: User) => {
    const targetTeam = teams.find(t => t.id === targetUser.teamId);
    if (!targetTeam || !currentUser) return;

    const leader = allUsers.find(u => u.id === targetTeam.leaderId);
    if (!leader) return; 

    const existingRequest = requests.find(r => 
        r.type === 'request' && r.fromUser.id === currentUser.id && r.team.id === targetTeam.id
    );
    if (existingRequest) return; 

    requestService.createRequest({
        type: 'request',
        fromUser: { id: currentUser.id, name: currentUser.name },
        toUser: { id: leader.id, name: leader.name },
        team: { id: targetTeam.id, name: targetTeam.name },
    });
    reloadAllData();
  };
  
  const handleDeclineRequest = (requestId: number) => {
      requestService.deleteRequest(requestId);
      reloadAllData();
  }
  
  const proceedWithTeamChange = (request: Request) => {
      const userToJoinId = request.type === 'invite' ? request.toUser.id : request.fromUser.id;
      const teamToJoinId = request.team.id;
      
      const userToJoin = allUsers.find(u => u.id === userToJoinId);
      const teamToJoin = teams.find(t => t.id === teamToJoinId);

      if (!userToJoin || !teamToJoin) return;
      
      // 1. Handle user leaving their old team
      const userOldTeam = teams.find(t => t.id === userToJoin.teamId);
      if (userOldTeam) {
          if (userOldTeam.leaderId === userToJoin.id) { // They were a leader
              teamService.deleteTeam(userOldTeam.id);
              userOldTeam.memberIds.forEach(memberId => {
                  if (memberId !== userToJoin.id) authService.updateUserTeam(memberId, null);
              });
          } else { // They were a member
              const updatedOldTeam = { ...userOldTeam, memberIds: userOldTeam.memberIds.filter(id => id !== userToJoin.id) };
              if (updatedOldTeam.memberIds.length === 0) {
                  teamService.deleteTeam(updatedOldTeam.id);
              } else {
                  teamService.updateTeam(updatedOldTeam);
              }
          }
      }
      
      // 2. Add user to the new team
      const updatedNewTeam = { ...teamToJoin, memberIds: [...teamToJoin.memberIds, userToJoin.id] };
      teamService.updateTeam(updatedNewTeam);
      authService.updateUserTeam(userToJoin.id, teamToJoin.id);

      // 3. Clean up requests
      requestService.deleteRequest(request.id); // Delete the accepted request
      // Delete all other pending invites TO this user and requests FROM this user
      requests.forEach(r => {
          if ((r.type === 'invite' && r.toUser.id === userToJoin.id) || (r.type === 'request' && r.fromUser.id === userToJoin.id)) {
              requestService.deleteRequest(r.id);
          }
      });
      
      // 4. If team is now full, delete all other requests to join it
      if (updatedNewTeam.memberIds.length >= TEAM_SIZE_LIMIT) {
          requests.forEach(r => {
              if (r.type === 'request' && r.team.id === updatedNewTeam.id) {
                  requestService.deleteRequest(r.id);
              }
          });
      }

      reloadAllData();
  }

  const handleAcceptRequest = (request: Request) => {
      const userToJoinId = request.type === 'invite' ? request.toUser.id : request.fromUser.id;
      const userToJoin = allUsers.find(u => u.id === userToJoinId);

      if (!userToJoin) return;
      
      const userOldTeam = teams.find(t => t.id === userToJoin.teamId);

      // If user is a leader of an existing team, show confirmation
      if (userOldTeam && userOldTeam.leaderId === userToJoin.id) {
          setConfirmationModal({
              isOpen: true,
              title: 'Join New Team?',
              message: 'Are you sure you want to join this team? As you are the leader of your current team, it will be permanently deleted.',
              onConfirm: () => {
                  proceedWithTeamChange(request); 
                  setConfirmationModal(prevState => ({ ...prevState, isOpen: false }));
              },
              isAlert: false,
              confirmButtonText: 'Yes',
              cancelButtonText: 'No',
              confirmButtonClass: 'bg-fiu-blue hover:bg-fiu-gold'
          });
      } else {
          // If not a leader or not on a team, proceed directly
          proceedWithTeamChange(request);
      }
  }

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
                        requests={requests}
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
      <Header 
        currentUser={currentUser} 
        setView={setView}
        pendingRequests={pendingRequestsForUser}
        onAcceptRequest={handleAcceptRequest}
        onDeclineRequest={handleDeclineRequest}
      />
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
                            {confirmationModal.cancelButtonText || 'Cancel'}
                        </button>
                      )}
                      <button onClick={confirmationModal.onConfirm} className={`px-4 py-2 rounded-md text-white transition-colors ${
                          confirmationModal.confirmButtonClass || (confirmationModal.isAlert ? 'bg-fiu-blue hover:bg-fiu-gold' : 'bg-red-600 hover:bg-red-700')
                      }`}>
                          {confirmationModal.confirmButtonText || (confirmationModal.isAlert ? 'OK' : 'Confirm')}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default App;
