
import type { Team, User } from '../types';

const TEAMS_KEY = 'shellhacks_teams';

export function getTeams(): Team[] {
  const teams = localStorage.getItem(TEAMS_KEY);
  return teams ? JSON.parse(teams) : [];
}

function saveTeams(teams: Team[]): void {
  localStorage.setItem(TEAMS_KEY, JSON.stringify(teams));
}

export function createTeam(teamName: string, leader: User): Team {
  const teams = getTeams();
  const newTeam: Team = {
    id: Date.now(),
    name: teamName,
    leaderId: leader.id,
    memberIds: [leader.id],
  };
  saveTeams([...teams, newTeam]);
  return newTeam;
}

export function getTeamById(teamId: number): Team | undefined {
    return getTeams().find(team => team.id === teamId);
}

export function deleteTeam(teamId: number): void {
  let teams = getTeams();
  teams = teams.filter(team => team.id !== teamId);
  saveTeams(teams);
}

export function updateTeam(updatedTeam: Team): Team {
    const teams = getTeams();
    const teamIndex = teams.findIndex(t => t.id === updatedTeam.id);
    if (teamIndex === -1) {
        // If team not found, it might be a new one, but this function is for updates.
        // Let's add it if it doesn't exist to prevent errors, though ideally it should.
        teams.push(updatedTeam);
    } else {
        teams[teamIndex] = updatedTeam;
    }
    saveTeams(teams);
    return updatedTeam;
}
