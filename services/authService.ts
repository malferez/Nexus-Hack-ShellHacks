import type { User } from '../types';
import api from './api';

// --- Start of new file services/api.ts ---
// Note: In a real multi-file setup, this would be in its own file.
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

async function _api<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const options: RequestInit = {
    method,
    credentials: 'include', // Send cookies
    headers: {},
  };

  if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  // Use a placeholder base URL as it's not provided.
  // In a real app this would be in an environment variable.
  const API_BASE_URL = '/api'; 

  const response = await fetch(`${API_BASE_URL}${path}`, options);

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      const error = new Error(`HTTP error! status: ${response.status}`);
      (error as any).status = response.status;
      throw error;
    }
    const error = new Error(errorData.message || 'An unknown API error occurred');
    (error as any).code = errorData.code;
    (error as any).status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
// --- End of new file services/api.ts ---


// Using a simple flag to track login state client-side
let loggedIn = false;

// We assume these endpoints based on standard REST practices, as they were not in the docs.
export async function registerUser(userData: Omit<User, 'id'>): Promise<User> {
  const { user } = await _api<{ user: User }>('POST', '/auth/register', userData);
  loggedIn = true;
  return user;
}

export async function login(email: string, password_DO_NOT_USE: string): Promise<User> {
    const { user } = await _api<{ user: User }>('POST', '/auth/login', { email, password: password_DO_NOT_USE });
    loggedIn = true;
    return user;
}

export async function logout(): Promise<void> {
    await _api('POST', '/auth/logout');
    loggedIn = false;
}

export async function requestPasswordReset(email: string): Promise<void> {
    await _api('POST', '/auth/request-reset', { email });
}

export async function getCurrentUserSession(): Promise<User> {
    const { user } = await _api<{ user: User }>('GET', '/auth/session');
    loggedIn = true;
    return user;
}

export async function updateUser(updatedUser: Partial<User>): Promise<User> {
    const { user } = await _api<{ user: User }>('PATCH', '/users/me', updatedUser);
    return user;
}

export async function getAllUsers(): Promise<User[]> {
    const { users } = await _api<{ users: User[] }>('GET', '/users');
    return users;
}

export function isLoggedIn(): boolean {
    // This is a simple check. In a real app, you might check for a cookie
    // or use the result of the initial session check.
    return loggedIn;
}

// The following functions are no longer needed as they interact with localStorage
// and are replaced by API calls.
/*
export function getUsers(): User[] { ... }
export function getCurrentUser(): User | null { ... }
export function updateUserTeam(userId: number, teamId: number | null): User { ... }
*/
