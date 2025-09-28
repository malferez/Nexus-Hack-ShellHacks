import type { Team, MyTeamInfo } from '../types';
import api from './api';

export async function getMyTeam(): Promise<MyTeamInfo> {
    return api<MyTeamInfo>('GET', '/teams/me');
}

export async function createTeam(name: string): Promise<Team> {
  const { team } = await api<{ team: Team }>('POST', '/teams', { name });
  return team;
}

export async function deleteTeam(teamId: number): Promise<void> {
  await api('DELETE', `/teams/${teamId}`);
}

export async function leaveTeam(teamId: number): Promise<void> {
  await api('POST', `/teams/${teamId}/leave`);
}

export async function removeMember(teamId: number, memberUserId: number): Promise<void> {
  await api('DELETE', `/teams/${teamId}/members/${memberUserId}`);
}
