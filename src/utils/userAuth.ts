/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'password';
  isAnonymous?: boolean;
}

const CURRENT_USER_KEY = 'faguer_current_user_v1';
const ALL_USERS_KEY = 'faguer_users_directory_v1';

export function getStoredUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading current user:', err);
  }
  return null;
}

export function saveCurrentUser(user: UserProfile | null): void {
  try {
    if (!user) {
      localStorage.removeItem(CURRENT_USER_KEY);
    } else {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      // Save to directory of known accounts
      const dirRaw = localStorage.getItem(ALL_USERS_KEY);
      const directory: UserProfile[] = dirRaw ? JSON.parse(dirRaw) : [];
      if (!directory.some((u) => u.uid === user.uid)) {
        directory.push(user);
        localStorage.setItem(ALL_USERS_KEY, JSON.stringify(directory));
      }
    }
  } catch (err) {
    console.error('Error saving user profile:', err);
  }
}

export function getAllSavedProfiles(): UserProfile[] {
  try {
    const dirRaw = localStorage.getItem(ALL_USERS_KEY);
    return dirRaw ? JSON.parse(dirRaw) : [];
  } catch (err) {
    return [];
  }
}

export function getUserStorageKey(uid?: string): string {
  if (!uid) return 'ahorros_soles_app_v1';
  return `faguer_user_${uid}_savings_v1`;
}
