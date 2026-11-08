/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTred,
  formatTredPercentage,
  formatInterest,
  calculateLedger,
  SavingsConfig,
  Movement,
} from './savingsEngine';

test('TRED calculation matches Peruvian banking formula and user specification', () => {
  const trea = 4.5;
  const tred = calculateTred(trea);
  const formattedTred = formatTredPercentage(tred);
  assert.equal(formattedTred, '0.01223%');

  const dailyInterest = 60 * tred;
  assert.equal(formatInterest(dailyInterest), '0.00734');
});

test('Ledger strictly starts at startDate and does not compute days prior to it', () => {
  // If startDate is 2026-11-08, days 2026-11-01 to 2026-11-07 must NOT exist
  const config: SavingsConfig = {
    startDate: '2026-11-08',
    initialBalance: 500,
    currentTrea: 4.5,
    capitalizeMonthlyInterest: false,
    rateHistory: [{ effectiveDate: '2026-11-08', trea: 4.5 }],
  };

  const result = calculateLedger(config, [], '2026-11-10');
  assert.equal(result.days.length, 3);
  assert.equal(result.days[0].date, '2026-11-08');
  assert.equal(result.days[0].initialBalance, 500);
  assert.equal(result.days[1].date, '2026-11-09');
  assert.equal(result.days[2].date, '2026-11-10');

  // Verify none of the prior days (e.g. 2026-11-01) exist
  assert.equal(result.daysByDate.has('2026-11-01'), false);
  assert.equal(result.daysByDate.has('2026-11-07'), false);
});

test('Month-end interest capitalization is credited on the last day of the month', () => {
  const configWithCap: SavingsConfig = {
    startDate: '2026-10-30',
    initialBalance: 1000,
    currentTrea: 4.5,
    capitalizeMonthlyInterest: true,
    rateHistory: [{ effectiveDate: '2026-10-30', trea: 4.5 }],
  };

  const result = calculateLedger(configWithCap, [], '2026-11-01');
  const oct30 = result.days[0];
  const oct31 = result.days[1]; // Last day of month
  const nov01 = result.days[2];

  assert.equal(oct31.isMonthEnd, true);
  // On the last day of October, capitalizedInterest is credited directly to oct31 closing balance!
  assert.ok(oct31.capitalizedInterest !== undefined && oct31.capitalizedInterest > 0);
  assert.equal(oct31.closingBalance, oct31.operationalClosingBalance + oct31.capitalizedInterest);

  // November 1 begins cleanly with October 31's capitalized closing balance
  assert.equal(nov01.initialBalance, oct31.closingBalance);
  // Accumulated interest resets to only November 1's daily interest
  assert.equal(
    formatInterest(nov01.accumulatedInterest),
    formatInterest(nov01.dailyInterest)
  );
});

test('Monthly recurring deposit is credited on the last day of the month', () => {
  const configWithMonthlyDeposit: SavingsConfig = {
    startDate: '2026-10-30',
    initialBalance: 1000,
    currentTrea: 4.5,
    capitalizeMonthlyInterest: false,
    monthlyRecurringDeposit: {
      active: true,
      amount: 500,
      dayOfMonth: 'lastDay',
    },
    rateHistory: [{ effectiveDate: '2026-10-30', trea: 4.5 }],
  };

  const result = calculateLedger(configWithMonthlyDeposit, [], '2026-11-01');
  const oct31 = result.days[1];
  // Oct 31 receives the 500 deposit
  assert.equal(oct31.deposits, 500);
  assert.equal(oct31.closingBalance, 1500);
});
