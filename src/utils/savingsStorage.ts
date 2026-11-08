/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SavingsConfig,
  Movement,
  getLocalDateString,
  SavingsAppState,
} from './savingsEngine';
import { getUserStorageKey } from './userAuth';

export type { SavingsAppState };

export function getDefaultState(): SavingsAppState {
  const today = getLocalDateString();
  return {
    isConfigured: false,
    config: {
      startDate: today,
      initialBalance: 0,
      currentTrea: 4.5,
      capitalizeMonthlyInterest: false,
      monthlyRecurringDeposit: {
        active: false,
        amount: 0,
        dayOfMonth: 'lastDay',
      },
      rateHistory: [{ effectiveDate: today, trea: 4.5 }],
    },
    movements: [],
  };
}

export function loadSavingsState(userId?: string): SavingsAppState {
  try {
    const key = getUserStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      // If user profile is provided but has no state yet, check if there was a default state
      if (!userId) return getDefaultState();
      const fallbackRaw = localStorage.getItem('ahorros_soles_app_v1');
      if (fallbackRaw) {
        return JSON.parse(fallbackRaw) as SavingsAppState;
      }
      return getDefaultState();
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.config) {
      return parsed as SavingsAppState;
    }
  } catch (err) {
    console.error('Error loading savings state from localStorage:', err);
  }
  return getDefaultState();
}

export function saveSavingsState(state: SavingsAppState, userId?: string): void {
  try {
    const key = getUserStorageKey(userId);
    localStorage.setItem(key, JSON.stringify(state));
    // Also keep main key in sync for offline single-user continuity
    localStorage.setItem('ahorros_soles_app_v1', JSON.stringify(state));
  } catch (err) {
    console.error('Error saving state to localStorage:', err);
  }
}

export function exportStateAsJson(state: SavingsAppState): string {
  return JSON.stringify(state, null, 2);
}

export function downloadJsonBackup(state: SavingsAppState, userEmail?: string): void {
  const jsonStr = exportStateAsJson(state);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const today = getLocalDateString();
  const userTag = userEmail ? `_${userEmail.split('@')[0]}` : '';
  a.href = url;
  a.download = `faguer_ahorros_soles${userTag}_${today}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseJsonBackup(jsonStr: string): SavingsAppState | null {
  try {
    const parsed = JSON.parse(jsonStr);
    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.config &&
      typeof parsed.config.initialBalance === 'number' &&
      Array.isArray(parsed.movements)
    ) {
      return {
        isConfigured: true,
        config: {
          startDate: parsed.config.startDate || getLocalDateString(),
          initialBalance: Number(parsed.config.initialBalance) || 0,
          currentTrea: Number(parsed.config.currentTrea) || 4.5,
          capitalizeMonthlyInterest: Boolean(parsed.config.capitalizeMonthlyInterest),
          monthlyRecurringDeposit: parsed.config.monthlyRecurringDeposit,
          rateHistory: Array.isArray(parsed.config.rateHistory)
            ? parsed.config.rateHistory
            : [{ effectiveDate: parsed.config.startDate || getLocalDateString(), trea: parsed.config.currentTrea || 4.5 }],
        },
        movements: parsed.movements,
      };
    }
  } catch (err) {
    console.error('Failed to parse backup JSON:', err);
  }
  return null;
}
