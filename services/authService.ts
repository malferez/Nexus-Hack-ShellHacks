
import type { User } from '../types';
import { MOCK_USERS } from '../constants';

const USERS_KEY = 'shellhacks_users';
const SESSION_KEY = 'shellhacks_session';

// Initialize with mock users if the DB is empty
export function getUsers(): User[] {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
    return MOCK_USERS;
  }
  return JSON.parse(users);
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function registerUser(userData: Omit<User, 'id'>): User {
  const users = getUsers();
  const existingUser = users.find(u => u.email === userData.email);
  if (existingUser) {
    throw new Error('An account with this email already exists.');
  }

  const newUser: User = {
    ...userData,
    id: Date.now(),
    teamId: null,
  };

  const updatedUsers = [...users, newUser];
  saveUsers(updatedUsers);
  
  // Log the user in after registration
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: newUser.id }));

  return newUser;
}

export function login(email: string, password_DO_NOT_USE: string): User {
    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    // In a real app, you would compare hashed passwords. Here we simulate success if user exists.
    if (user) {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
        return user;
    }
    
    throw new Error('Invalid email or password.');
}

export async function requestPasswordReset(email: string): Promise<void> {
    // In a real app, this would generate a token, save it, and send an email.
    // Here, we just simulate the async action and don't reveal if the user exists.
    console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
    
    // We intentionally don't check if the user exists to prevent email enumeration.
    // The delay simulates network latency.
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return Promise.resolve();
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getCurrentUser(): User | null {
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    return null;
  }

  const { userId } = JSON.parse(session);
  const users = getUsers();
  return users.find(u => u.id === userId) || null;
}

export function updateUser(updatedUser: User): User {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) {
        throw new Error('User not found.');
    }
    
    // Exclude password from being updated this way
    const { password, ...rest } = updatedUser;
    users[userIndex] = { ...users[userIndex], ...rest };

    saveUsers(users);
    return users[userIndex];
}

export function updateUserTeam(userId: number, teamId: number | null): User {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        throw new Error('User not found while updating team.');
    }
    users[userIndex].teamId = teamId;
    saveUsers(users);
    return users[userIndex];
}
