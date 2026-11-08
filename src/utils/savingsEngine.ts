/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Movement {
  id: string;
  date: string; // 'YYYY-MM-DD'
  timestamp: number;
  timeFormatted: string; // '14:32:05'
  type: 'deposito' | 'retiro';
  amount: number;
  note?: string;
  isAutomated?: boolean; // e.g. capitalized interest or recurring monthly deposit
}

export interface RateRule {
  effectiveDate: string; // 'YYYY-MM-DD'
  trea: number; // e.g. 4.5 for 4.5%
}

export interface DayRecord {
  date: string; // 'YYYY-MM-DD'
  initialBalance: number;
  deposits: number;
  withdrawals: number;
  operationalClosingBalance: number; // Balance before month-end capitalization
  closingBalance: number; // Final balance including any month-end interest credit
  trea: number;
  tred: number;
  dailyInterest: number;
  accumulatedInterest: number; // Month-to-date accumulated interest
  isMonthEnd?: boolean;
  capitalizedInterest?: number; // Credited on the last day of the month if enabled
}

export interface MonthSummary {
  yearMonth: string; // 'YYYY-MM'
  label: string; // 'Noviembre 2026'
  startDate: string;
  endDate: string;
  initialBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  closingBalance: number;
  totalInterest: number;
  averageTrea: number;
  dayCount: number;
  isClosed: boolean;
}

export interface MonthlyRecurringDeposit {
  active: boolean;
  amount: number;
  dayOfMonth: 'lastDay'; // As specified: "el deposito se hace el ultimo dia del mes, no el mes 1"
}

export interface SavingsConfig {
  startDate: string; // 'YYYY-MM-DD'
  initialBalance: number;
  currentTrea: number; // e.g. 4.5
  capitalizeMonthlyInterest: boolean; // default false
  monthlyRecurringDeposit?: MonthlyRecurringDeposit;
  rateHistory: RateRule[];
}

export interface SavingsAppState {
  isConfigured: boolean;
  activeProfileId?: string;
  config: SavingsConfig;
  movements: Movement[];
}

/**
 * Calculates TRED decimal from TREA percentage (base 360 days)
 * Formula: TRED = (1 + TREA)^(1/360) - 1
 */
export function calculateTred(treaPercent: number): number {
  if (treaPercent <= 0) return 0;
  const treaDecimal = treaPercent / 100;
  return Math.pow(1 + treaDecimal, 1 / 360) - 1;
}

/**
 * Formats TRED as percentage string with 5 decimal places (e.g., "0.01223%")
 */
export function formatTredPercentage(tredDecimal: number): string {
  const pct = tredDecimal * 100;
  return `${pct.toFixed(5)}%`;
}

/**
 * Formats Peruvian Soles currency: "S/ 5,688.19"
 */
export function formatSoles(amount: number): string {
  const parts = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = amount < 0 ? '-' : '';
  return `${sign}S/ ${parts}`;
}

/**
 * Formats interest amount with 5 decimal places: "0.00734"
 */
export function formatInterest(amount: number): string {
  return amount.toFixed(5);
}

/**
 * Helper to get local date string YYYY-MM-DD
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats ISO date to readable Spanish string
 */
export function formatDateSpanish(isoDate: string, includeDayOfWeek: boolean = true): string {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(includeDayOfWeek ? { weekday: 'long' } : {}),
  };

  const formatted = date.toLocaleDateString('es-PE', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * Formats month key 'YYYY-MM' to Spanish label: "Noviembre 2026"
 */
export function formatMonthKeySpanish(yearMonth: string): string {
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  const monthName = date.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  return monthName.charAt(0).toUpperCase() + monthName.slice(1);
}

/**
 * Adds N days to YYYY-MM-DD
 */
export function addDaysIso(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

/**
 * Checks if a given date is the last day of its month
 */
export function isLastDayOfMonth(isoDate: string): boolean {
  const [y, m, d] = isoDate.split('-').map(Number);
  const nextDay = new Date(y, m - 1, d + 1);
  return nextDay.getMonth() !== m - 1;
}

/**
 * Gets effective TREA for a specific date
 */
export function getEffectiveTrea(date: string, rateHistory: RateRule[], defaultTrea: number): number {
  if (!rateHistory || rateHistory.length === 0) return defaultTrea;

  const sorted = [...rateHistory].sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
  for (const rule of sorted) {
    if (date >= rule.effectiveDate) {
      return rule.trea;
    }
  }

  const earliest = sorted[sorted.length - 1];
  return earliest ? earliest.trea : defaultTrea;
}

/**
 * Generates an array of all consecutive ISO dates between start and end (inclusive)
 * Crucial constraint: NEVER includes dates before startDate!
 */
export function getDateRange(startDate: string, endDate: string): string[] {
  if (startDate > endDate) return [startDate];
  const dates: string[] = [];
  let curr = startDate;

  while (curr <= endDate) {
    dates.push(curr);
    curr = addDaysIso(curr, 1);
  }

  return dates;
}

/**
 * Core cascading calculation of daily ledger.
 * - Strictly begins at config.startDate (no dummy dates before opening).
 * - Interest capitalization and monthly recurring deposits occur on the LAST DAY of the month.
 */
export function calculateLedger(
  config: SavingsConfig,
  movements: Movement[],
  targetEndDate?: string
): {
  days: DayRecord[];
  daysByDate: Map<string, DayRecord>;
  monthSummaries: MonthSummary[];
} {
  const today = getLocalDateString();
  const endDate = targetEndDate || (config.startDate > today ? config.startDate : today);
  // Ensure date sequence strictly starts at config.startDate!
  const dateSequence = getDateRange(config.startDate, endDate);

  // Filter out any movements that have an invalid date prior to config.startDate
  const validMovements = movements.filter((m) => m.date >= config.startDate);

  // Group user movements by date
  const movementsByDate = new Map<string, { deposits: number; withdrawals: number }>();
  for (const m of validMovements) {
    const existing = movementsByDate.get(m.date) || { deposits: 0, withdrawals: 0 };
    if (m.type === 'deposito') {
      existing.deposits += m.amount;
    } else {
      existing.withdrawals += m.amount;
    }
    movementsByDate.set(m.date, existing);
  }

  const days: DayRecord[] = [];
  const daysByDate = new Map<string, DayRecord>();

  let currentBalance = config.initialBalance;
  let currentMonthKey = '';
  let accumulatedMonthInterest = 0;

  for (let i = 0; i < dateSequence.length; i++) {
    const date = dateSequence[i];
    const monthKey = date.substring(0, 7);
    const isNewMonth = monthKey !== currentMonthKey;

    if (isNewMonth) {
      currentMonthKey = monthKey;
      accumulatedMonthInterest = 0;
    }

    const initialBal = currentBalance;
    const dayMoves = movementsByDate.get(date) || { deposits: 0, withdrawals: 0 };
    let deposits = dayMoves.deposits;
    const withdrawals = dayMoves.withdrawals;

    const isMonthEnd = isLastDayOfMonth(date);

    // If a monthly recurring deposit is configured, it is credited on the last day of the month!
    if (isMonthEnd && config.monthlyRecurringDeposit && config.monthlyRecurringDeposit.active) {
      deposits += config.monthlyRecurringDeposit.amount;
    }

    const operationalClosing = initialBal + deposits - withdrawals;

    // TREA & TRED
    const trea = getEffectiveTrea(date, config.rateHistory, config.currentTrea);
    const tred = calculateTred(trea);

    // Daily interest on operational closing balance
    const dailyInterest = operationalClosing > 0 ? operationalClosing * tred : 0;
    accumulatedMonthInterest += dailyInterest;

    let capitalized = 0;
    let finalClosing = operationalClosing;

    // As instructed: "el deposito se hace el ultimo dia del mes, no el mes 1"
    // At month-end, if capitalization is active, the accumulated interest of the month is credited
    // right on that last day, increasing that day's closing balance!
    if (isMonthEnd && config.capitalizeMonthlyInterest && accumulatedMonthInterest > 0) {
      capitalized = accumulatedMonthInterest;
      finalClosing = operationalClosing + capitalized;
      currentBalance = finalClosing;
    } else {
      currentBalance = operationalClosing;
    }

    const record: DayRecord = {
      date,
      initialBalance: initialBal,
      deposits,
      withdrawals,
      operationalClosingBalance: operationalClosing,
      closingBalance: finalClosing,
      trea,
      tred,
      dailyInterest,
      accumulatedInterest: accumulatedMonthInterest,
      isMonthEnd,
      capitalizedInterest: capitalized > 0 ? capitalized : undefined,
    };

    days.push(record);
    daysByDate.set(date, record);
  }

  // Monthly summaries
  const monthGroups = new Map<string, DayRecord[]>();
  for (const d of days) {
    const mKey = d.date.substring(0, 7);
    const group = monthGroups.get(mKey) || [];
    group.push(d);
    monthGroups.set(mKey, group);
  }

  const monthSummaries: MonthSummary[] = [];
  const allMonthKeys = Array.from(monthGroups.keys()).sort();

  for (const mKey of allMonthKeys) {
    const records = monthGroups.get(mKey)!;
    const firstDay = records[0];
    const lastDay = records[records.length - 1];

    const totalDeposits = records.reduce((sum, r) => sum + r.deposits, 0);
    const totalWithdrawals = records.reduce((sum, r) => sum + r.withdrawals, 0);
    const totalInterest = records.reduce((sum, r) => sum + r.dailyInterest, 0);
    const averageTrea = records.reduce((sum, r) => sum + r.trea, 0) / records.length;

    const isPastMonth = mKey < today.substring(0, 7);
    const isClosed = isPastMonth || (isLastDayOfMonth(lastDay.date) && lastDay.date < today);

    monthSummaries.push({
      yearMonth: mKey,
      label: formatMonthKeySpanish(mKey),
      startDate: firstDay.date,
      endDate: lastDay.date,
      initialBalance: firstDay.initialBalance,
      totalDeposits,
      totalWithdrawals,
      closingBalance: lastDay.closingBalance,
      totalInterest,
      averageTrea,
      dayCount: records.length,
      isClosed,
    });
  }

  return {
    days,
    daysByDate,
    monthSummaries,
  };
}

/**
 * Generates CSV content suitable for Excel in Spanish locales
 */
export function exportToCsv(days: DayRecord[]): string {
  const headers = [
    'Fecha',
    'Saldo Inicial (S/)',
    'Depositos (S/)',
    'Retiros (S/)',
    'Saldo de Cierre (S/)',
    'TREA (%)',
    'TRED (%)',
    'Interes Diario (S/)',
    'Interes Acumulado Mes (S/)',
  ];

  const rows = days.map((d) => [
    d.date,
    d.initialBalance.toFixed(2),
    d.deposits.toFixed(2),
    d.withdrawals.toFixed(2),
    d.closingBalance.toFixed(2),
    d.trea.toFixed(2) + '%',
    (d.tred * 100).toFixed(5) + '%',
    d.dailyInterest.toFixed(5),
    d.accumulatedInterest.toFixed(5),
  ]);

  const csvContent = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');
  return '\uFEFF' + csvContent;
}
